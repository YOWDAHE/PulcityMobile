import ChatMessageBox from "@/components/ChatMessageBox";
import ReplyMessageBar from "@/components/ReplyMessageBar";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { ImageBackground, StyleSheet, View, Text, Image, Alert, Platform, ActivityIndicator, Modal, TouchableOpacity, Dimensions } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import {
	GiftedChat,
	Bubble,
	InputToolbar,
	Send,
	SystemMessage,
	IMessage,
	MessageImage,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePubNub } from "pubnub-react";
import pubnub from "@/utils/pubnub";
import {
	PresenceEvent,
	SignalEvent,
	MessageEvent as PubNubMessageEvent,
} from "pubnub"; // Import ImagePicker
import { User } from "@/models/auth.model";
import { useAuth } from "@/app/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";
import { Event } from "@/models/event.model";
import { getEventById } from "@/actions/event.actions";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

interface MessageEvent extends PubNubMessageEvent {
	channel: string;
}

interface TypingSignalContent {
	type: "typing";
	isTyping: boolean;
}

interface PresenceEventExtended extends PresenceEvent {
	occupancy: number;
	uuid: string;
	timestamp: number;
	state?: Record<string, unknown>;
}

// Interface to add group metadata to messages
interface ExtendedIMessage extends IMessage {
	groupId?: string; // For tracking which group this image belongs to
	originalImageUri?: string; // For storing the local URI before upload
}

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (uri: string): Promise<string> => {
	try {
		// Get Cloudinary credentials from env
		const cloudName = Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME;
		const uploadPreset = Constants.expoConfig?.extra?.CLOUDINARY_UPLOAD_PRESET;
		
		if (!cloudName || !uploadPreset) {
			throw new Error('Cloudinary configuration missing');
		}

		// Create form data for upload
		const formData = new FormData();
		
		// Get file extension
		const uriParts = uri.split('.');
		const fileType = uriParts[uriParts.length - 1];
		
		// Append image file
		formData.append('file', {
			uri,
			name: `photo-${Date.now()}.${fileType}`,
			type: `image/${fileType}`,
		} as any);
		
		formData.append('upload_preset', uploadPreset);
		
		// Upload to Cloudinary
		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
			{
				method: 'POST',
				body: formData,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		
		const data = await response.json();
		console.log('Cloudinary upload response:', data);
		
		if (data.secure_url) {
			return data.secure_url;
		} else {
			throw new Error('Upload failed');
		}
	} catch (error) {
		console.error('Error uploading to Cloudinary:', error);
		throw error;
	}
};

const Page = () => {
	const { id } = useLocalSearchParams();
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [text, setText] = useState("");
	const insets = useSafeAreaInsets();
	const pubnubClient = usePubNub();

	const [replyMessage, setReplyMessage] = useState<IMessage | null>(null);
	const swipeableRowRef = useRef<Swipeable | null>(null);

	// const [authUser, setCurrentUser] = useState<User | null>(null);
	const [typers, setTypers] = useState<string[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
	const [initialHistoryLoaded, setInitialHistoryLoaded] = useState(false);
	const [userMap, setUserMap] = useState<Record<string, User>>({});
	const { user: authUser } = useAuth();
	const [event, setEvent] = useState<Event>();

	const channel = `${id}`;

	// Add state for image uploading
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	// Add state for image viewer modal
	const [imageViewerVisible, setImageViewerVisible] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	useEffect(() => {
		if (!authUser) return;

		const uuid = String(authUser.id);
		console.log(`User UUID: ${uuid}`);
		console.log("Initializing PubNub chat for channel:", channel);
		// setCurrentUser(authUser);
		setUserMap((prev) => ({ ...prev, [uuid]: authUser }));

		pubnub.setUUID(uuid);
		pubnub.objects.setUUIDMetadata({
			uuid: uuid,
			data: {
				custom: {
					name: authUser.username,
				},
			},
		});

		const listener = {
			message: (messageEvent: MessageEvent) => handleMessage(messageEvent),
			presence: (presenceEvent: PresenceEventExtended) =>
				handlePresence(presenceEvent),
			signal: (signalEvent: SignalEvent) => handleSignal(signalEvent),
		};

		pubnub.addListener(listener);
		pubnub.subscribe({ channels: [channel], withPresence: true });

		// Fetch message history
		console.log("Fetching message history for channel:", channel);
		pubnub.fetchMessages(
			{
				channels: [channel],
				count: 50,
			},
			(status, response) => {
				console.log("PubNub fetchMessages status:", status);
				console.log("PubNub fetchMessages response:", response?.channels);
				
				if (response?.channels[channel] && !initialHistoryLoaded) {
					const historyMessages: ExtendedIMessage[] = response.channels[channel].map(
						(message) => {
							console.log("Processing history message:", message);
							
							// Get username from message data or use unknown
							const userName = 
								message.message.user?.name || 
								(message.uuid && userMap[message.uuid]?.username) || 
								"Unknown User";
							
							return {
								_id: message.timetoken.toString(),
								text: message.message.text || '',
								createdAt: new Date(Number(message.timetoken) / 10000),
								image: message.message.image || undefined, // Add image URL if exists
								groupId: message.message.groupId || String(id), // Add group ID
								user: {
									_id: message.uuid || "unknown",
									name: userName,
								},
							};
						}
					);

					console.log(`Setting ${historyMessages.length} messages in state`);
					setMessages(historyMessages.reverse());
					setInitialHistoryLoaded(true);
				} else {
					console.log("No messages found in history or already loaded");
				}
			}
		);

		return () => {
			console.log("Cleaning up PubNub subscription");
			pubnub.unsubscribeAll();
			pubnub.removeListener(listener);
		};
	}, [authUser]);

	const handleMessage = useCallback(
		(messageEvent: MessageEvent) => {
			console.log("Received message event:", messageEvent);
			const currentUserID = String(authUser?.id);
			if (messageEvent.channel === channel) {
				// Ignore messages sent by the current user
				if (messageEvent.publisher == currentUserID) {
					console.log("Ignoring message from current user");
					return;
				}

				setMessages((prev) => {
					const messageExists = prev.some(
						(m) => m._id === messageEvent.timetoken.toString()
					);
					if (!messageExists) {
						console.log("Adding new message to state");
						
						// Get user info from the message or from our userMap
						const userName = 
							messageEvent.message.user?.name || 
							(messageEvent.publisher && userMap[messageEvent.publisher]?.username) || 
							"Unknown User";
						
						const newMessage: ExtendedIMessage = {
							_id: messageEvent.timetoken.toString(),
							text: messageEvent.message.text,
							createdAt: new Date(Number(messageEvent.timetoken) / 10000),
							image: messageEvent.message.image, // Handle image property
							groupId: messageEvent.message.groupId, // Store group ID
							user: {
								_id: messageEvent.publisher,
								name: userName,
							},
						};
						return GiftedChat.append(prev, [newMessage]);
					}
					console.log("Message already exists in state");
					return prev;
				});
			} else {
				console.log("Message for different channel:", messageEvent.channel);
			}
		},
		[channel, authUser, userMap]
	);

	const handlePresence = useCallback(
		(presenceEvent: PresenceEventExtended) => {
			const user = userMap[presenceEvent.uuid] || {
				_id: presenceEvent.uuid,
				name: `Yodahe`,
			};

			setUserMap((prev) => ({ ...prev, [user.id]: user }));

			switch (presenceEvent.action) {
				case "join":
					setOnlineUsers((prev) => [...prev, user]);
					break;
				case "leave":
				case "timeout":
					setOnlineUsers((prev) =>
						prev.filter((u) => String(u.id) !== presenceEvent.uuid)
					);
					break;
			}
		},
		[userMap]
	);

	const handleSignal = useCallback((signalEvent: SignalEvent) => {
		if (
			signalEvent.channel === channel &&
			signalEvent.message.type === "typing"
		) {
			// console.log("Signal event:", signalEvent);
			setTypers((prev) => {
				const newTypers = prev.filter((u) => u !== signalEvent.publisher);
				if (signalEvent.message.isTyping && signalEvent.publisher) {
					newTypers.push(signalEvent.publisher);
				}
				return Array.from(new Set(newTypers));
			});
		}
	}, []);

	const sendMessage = useCallback(
		(newMessages: IMessage[] = []) => {
			if (!authUser) return;

			// Publish the message to PubNub
			newMessages.forEach((message) => {
				console.log("Sending message:", message.text, "Image:", message.image ? "Yes" : "No");
				pubnub.publish(
					{
						channel,
						message: {
							text: message.text,
							createdAt: message.createdAt,
							image: message.image,
							user: {
								_id: authUser.id,
								name: authUser.username,
							},
						},
					},
					(status, response) => {
						if (status.error) {
							console.error("Message failed to send:", status);
						} else {
							console.log("Message sent successfully:", response);
						}
					}
				);
			});

			// Append the message locally
			setMessages((prevMessages) => {
				console.log("Updating local messages after send");
				return GiftedChat.append(prevMessages, newMessages);
			});
		},
		[authUser, pubnub, channel]
	);

	const handleTyping = useCallback((text: string) => {
		setText(text);
		pubnub.signal({
			channel,
			message: {
				type: "typing",
				isTyping: text.length > 1,
			} as TypingSignalContent,
		});
	}, []);

	// Function to pick and upload image
	const pickImage = async () => {
		try {
			// Request permission
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			
			if (status !== 'granted') {
				Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
				return;
			}

			// Launch image library
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.8,
			});

			console.log('Image picker result:', result);

			if (!result.canceled && result.assets && result.assets[0]) {
				// Start upload process
				uploadAndSendImage(result.assets[0].uri);
			}
		} catch (error) {
			console.error('Error picking image:', error);
			Alert.alert('Error', 'Failed to pick image');
		}
	};

	// Upload image to Cloudinary then send message
	const uploadAndSendImage = async (imageUri: string) => {
		if (!authUser || !imageUri) return;
		
		setIsUploading(true);
		setUploadProgress(0);
		
		try {
			// 1. Create a temporary message with local image for immediate feedback
			const tempMessageId = `temp-${new Date().getTime()}`;
			const tempMessage: ExtendedIMessage = {
				_id: tempMessageId,
				text: '',
				createdAt: new Date(),
				image: imageUri,
				originalImageUri: imageUri, // Store original URI
				groupId: String(id), // Associate with current group/channel
				pending: true, // Mark as pending
				user: {
					_id: String(authUser.id),
					name: authUser.username,
				},
			};
			
			// Add temporary message to local state
			setMessages(previousMessages => 
				GiftedChat.append(previousMessages, [tempMessage])
			);
			
			// 2. Upload to Cloudinary
			setUploadProgress(30);
			const cloudinaryUrl = await uploadToCloudinary(imageUri);
			setUploadProgress(80);
			
			// 3. Create final message with Cloudinary URL
			const finalMessageId = new Date().getTime().toString();
			const finalMessage: ExtendedIMessage = {
				_id: finalMessageId,
				text: '',
				createdAt: new Date(),
				image: cloudinaryUrl,
				groupId: String(id), // Associate with current group/channel
				user: {
					_id: String(authUser.id),
					name: authUser.username,
				},
			};
			
			// 4. Replace temp message with final message
			setMessages(previousMessages => {
				// Filter out the temporary message
				const filteredMessages = previousMessages.filter(msg => msg._id !== tempMessageId);
				// Add the new message with the cloudinary URL
				return GiftedChat.append(filteredMessages, [finalMessage]);
			});
			
			// 5. Publish message to PubNub
			pubnub.publish(
				{
					channel,
					message: {
						text: '',
						createdAt: finalMessage.createdAt,
						image: cloudinaryUrl,
						groupId: String(id),
						user: {
							_id: authUser.id,
							name: authUser.username,
						},
					},
				},
				(status, response) => {
					if (status.error) {
						console.error("Image message failed to send:", status);
						Alert.alert("Error", "Failed to send image");
					} else {
						console.log("Image message sent successfully:", response);
						setUploadProgress(100);
					}
				}
			);
		} catch (error) {
			console.error('Error sending image message:', error);
			Alert.alert('Error', 'Failed to upload image');
			
			// Remove the temporary message on error
			setMessages(previousMessages => 
				previousMessages.filter(msg => !msg._id.toString().startsWith('temp-'))
			);
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	const renderInputToolbar = (props: any) => {
		return (
			<InputToolbar
				{...props}
				containerStyle={{
					backgroundColor: "white",
					borderTopColor: "#E8E8E8",
					borderTopWidth: 1,
				}}
				renderActions={() => (
					<View
						style={{
							height: 50,
							justifyContent: "center",
							alignItems: "center",
							left: 5,
							backgroundColor: "white",
							paddingHorizontal: 10,
						}}
					>
						{isUploading ? (
							<ActivityIndicator size="small" color={Colors.primary} />
						) : (
							<Ionicons
								name="add"
								color={Colors.primary}
								size={28}
								onPress={pickImage}
							/>
						)}
					</View>
				)}
			/>
		);
	};

	const updateRowRef = useCallback(
		(ref: any) => {
			if (
				ref &&
				replyMessage &&
				ref.props.children.props.currentMessage?._id === replyMessage._id
			) {
				swipeableRowRef.current = ref;
			}
		},
		[replyMessage]
	);

	useEffect(() => {
		if (replyMessage && swipeableRowRef.current) {
			swipeableRowRef.current.close();
			swipeableRowRef.current = null;
		}
	}, [replyMessage]);

	// Function to handle image tap
	const handleImageTap = (imageUrl: string) => {
		setSelectedImage(imageUrl);
		setImageViewerVisible(true);
	};

	// Add custom rendering for image messages with loading states and tap handling
	const renderMessageImage = (props: any) => {
		const { currentMessage } = props;
		const isPending = currentMessage.pending === true;
		
		return (
			<TouchableOpacity 
				style={styles.imageContainer}
				onPress={() => currentMessage.image && handleImageTap(currentMessage.image)}
				activeOpacity={0.8}
			>
				<MessageImage {...props} />
				
				{isPending && (
					<View style={styles.imageOverlay}>
						<ActivityIndicator size="large" color="#ffffff" />
						<Text style={styles.uploadingText}>Uploading...</Text>
					</View>
				)}
			</TouchableOpacity>
		);
	};

	// Image Viewer Modal
	const renderImageViewer = () => {
		return (
			<Modal
				visible={imageViewerVisible}
				transparent={true}
				onRequestClose={() => setImageViewerVisible(false)}
				animationType="fade"
			>
				<View style={styles.modalContainer}>
					<TouchableOpacity 
						style={styles.closeButton}
						onPress={() => setImageViewerVisible(false)}
					>
						<Ionicons name="close" size={28} color="#fff" />
					</TouchableOpacity>
					
					{selectedImage && (
						<Image
							source={{ uri: selectedImage }}
							style={styles.fullImage}
							resizeMode="contain"
						/>
					)}
				</View>
			</Modal>
		);
	};

	if (!authUser) return null;

	return (
		<ImageBackground
			source={require("@/assets/images/pattern.png")}
			style={{
				flex: 1,
				backgroundColor: Colors.background,
				marginBottom: insets.bottom,
			}}
		>
			{/* Image Viewer Modal */}
			{renderImageViewer()}
		
			<GiftedChat
				messages={messages}
				onSend={sendMessage}
				onInputTextChanged={handleTyping}
				user={{ _id: String(authUser.id), name: authUser.username }}
				renderSystemMessage={(props) => (
					<SystemMessage {...props} textStyle={{ color: Colors.gray }} />
				)}
				bottomOffset={insets.bottom}
				renderAvatar={null}
				maxComposerHeight={100}
				textInputProps={styles.composer}
				showUserAvatar={false}
				alwaysShowSend={true}
				showAvatarForEveryMessage={false}
				renderUsernameOnMessage={true}
				renderMessageImage={renderMessageImage}
				renderBubble={(props) => {
					const isCurrentUser = props.currentMessage.user._id == authUser?.id;
					return (
						<View>
							{/* {!isCurrentUser && (
								<Text
									style={{
										color: '#3B82F6',
										fontSize: 12,
										fontWeight: '600',
										marginBottom: 2,
										marginLeft: 10,
									}}
								>
									{props.currentMessage.user.name}
								</Text>
							)} */}
							<Bubble
								{...props}
								textStyle={{
									right: {
										color: "white",
									},
									left: {
										color: "#333",
									}
								}}
								wrapperStyle={{
									left: {
										backgroundColor: "#fff",
										marginVertical: 3
									},
									right: {
										backgroundColor: Colors.gray,
										marginVertical: 3
									},
								}}
							/>
						</View>
					);
				}}
				renderSend={(props) => (
					<View
						style={{
							height: 44,
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "center",
							gap: 14,
							paddingHorizontal: 14,
							backgroundColor: 'white',
							paddingRight: 4,
						}}
					>
						{!props.text || props.text.trim().length === 0 ? (
							<>
								<Ionicons name="camera-outline" color={Colors.primary} size={28} />
								<Ionicons name="mic-outline" color={Colors.primary} size={28} />
							</>
						) : (
							<Send
								{...props}
								containerStyle={{
									justifyContent: "center",
									backgroundColor: 'white',
								}}
							>
								<Ionicons name="send" color={Colors.primary} size={28} />
							</Send>
						)}
					</View>
				)}
				renderInputToolbar={renderInputToolbar}
				renderChatFooter={() => (
					<ReplyMessageBar
						clearReply={() => setReplyMessage(null)}
						message={replyMessage}
					/>
				)}
				onLongPress={(context, message) => setReplyMessage(message)}
				renderMessage={(props) => (
					<ChatMessageBox
						{...props}
						setReplyOnSwipeOpen={setReplyMessage}
						updateRowRef={updateRowRef}
					/>
				)}
			/>
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	composer: {
		backgroundColor: "white",
		paddingHorizontal: 10,
		paddingBottom: 4,
		fontSize: 16,
		marginVertical: 4,
		minHeight: 40,
	},
	imageContainer: {
		position: 'relative',
	},
	imageOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	uploadingText: {
		color: '#ffffff',
		marginTop: 10,
		fontSize: 14,
		fontWeight: '600',
	},
	modalContainer: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.9)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fullImage: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height * 0.8,
	},
	closeButton: {
		position: 'absolute',
		top: 40,
		right: 20,
		zIndex: 10,
		padding: 10,
	},
});

export default Page;
