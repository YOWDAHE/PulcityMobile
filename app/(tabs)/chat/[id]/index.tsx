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
	replyTo?: IMessage; // Reference to the message being replied to
}

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (uri: string): Promise<string> => {
	try {
		
		const cloudName = "dwfimti8w";
		const uploadPreset = "groups";
		
		console.log("Using Cloudinary config:", { cloudName, uploadPreset });
		
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

	// Add state for image loading
	const [isImageLoading, setIsImageLoading] = useState(true);

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
							
							const userName = 
								message.message.user?.name || 
								(message.uuid && userMap[message.uuid]?.username) || 
								"Unknown User";
							
							const replyData = message.message.replyTo ? {
								replyTo: message.message.replyTo
							} : {};
							
							return {
								_id: message.timetoken.toString(),
								text: message.message.text || '',
								createdAt: new Date(Number(message.timetoken) / 10000),
								image: message.message.image || undefined,
								groupId: message.message.groupId || String(id),
								...replyData, // Include reply data
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
						
						const userName = 
							messageEvent.message.user?.name || 
							(messageEvent.publisher && userMap[messageEvent.publisher]?.username) || 
							"Unknown User";
						
						const replyData = messageEvent.message.replyTo ? {
							replyTo: messageEvent.message.replyTo
						} : {};
						
						const newMessage: ExtendedIMessage = {
							_id: messageEvent.timetoken.toString(),
							text: messageEvent.message.text,
							createdAt: new Date(Number(messageEvent.timetoken) / 10000),
							image: messageEvent.message.image,
							groupId: messageEvent.message.groupId,
							...replyData,
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
				
				// Add reply information if replying to a message
				const replyData = replyMessage ? {
					replyTo: {
						_id: replyMessage._id,
						text: replyMessage.text,
						user: {
							_id: replyMessage.user._id,
							name: replyMessage.user.name,
						}
					}
				} : {};
				
				pubnub.publish(
					{
						channel,
						message: {
							text: message.text,
							createdAt: message.createdAt,
							image: message.image,
							...replyData, // Include reply data if present
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

			// Append the message locally with reply information
			setMessages((prevMessages) => {
				console.log("Updating local messages after send");
				// Add reply information to the new messages if replying
				if (replyMessage) {
					newMessages = newMessages.map(msg => ({
						...msg,
						replyTo: replyMessage
					}));
					
					// Clear the reply after sending
					setReplyMessage(null);
				}
				
				return GiftedChat.append(prevMessages, newMessages);
			});
		},
		[authUser, pubnub, channel, replyMessage]
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

	const pickImage = async () => {
		try {
			// Request permission
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			
			if (status !== 'granted') {
				Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				// aspect: [4, 3],
				quality: 0.8,
			});

			console.log('Image picker result:', result);

			if (!result.canceled && result.assets && result.assets[0]) {
				uploadAndSendImage(result.assets[0].uri);
			}
		} catch (error) {
			console.error('Error picking image:', error);
			Alert.alert('Error', 'Failed to pick image');
		}
	};

	const takePhoto = async () => {
		try {
			const { status } = await ImagePicker.requestCameraPermissionsAsync();
			
			if (status !== 'granted') {
				Alert.alert('Permission Required', 'Sorry, we need camera permissions to make this work!');
				return;
			}
			
			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.8,
			});
			
			console.log('Camera result:', result);
			
			if (!result.canceled && result.assets && result.assets[0]) {
				uploadAndSendImage(result.assets[0].uri);
			}
		} catch (error) {
			console.error('Error taking photo:', error);
			Alert.alert('Error', 'Failed to take photo');
		}
	};

	const uploadAndSendImage = async (imageUri: string) => {
		if (!authUser || !imageUri) return;
		
		setIsUploading(true);
		setUploadProgress(0);
		
		try {
			const tempMessageId = `temp-${new Date().getTime()}`;
			
			// Add reply information if replying to a message
			const replyData = replyMessage ? {
				replyTo: replyMessage
			} : {};
			
			const tempMessage: ExtendedIMessage = {
				_id: tempMessageId,
				text: '',
				createdAt: new Date(),
				image: imageUri,
				originalImageUri: imageUri,
				groupId: String(id),
				pending: true,
				...replyData, // Include reply data
				user: {
					_id: String(authUser.id),
					name: authUser.username,
				},
			};
			
			setMessages(previousMessages => 
				GiftedChat.append(previousMessages, [tempMessage])
			);
			
			setUploadProgress(30);
			const cloudinaryUrl = await uploadToCloudinary(imageUri);
			setUploadProgress(80);
			
			const finalMessageId = new Date().getTime().toString();
			const finalMessage: ExtendedIMessage = {
				_id: finalMessageId,
				text: '',
				createdAt: new Date(),
				image: cloudinaryUrl,
				groupId: String(id),
				...replyData, // Include reply data
				user: {
					_id: String(authUser.id),
					name: authUser.username,
				},
			};
			
			setMessages(previousMessages => {
				const filteredMessages = previousMessages.filter(msg => msg._id !== tempMessageId);
				return GiftedChat.append(filteredMessages, [finalMessage]);
			});
			
			// Add reply information if replying to a message
			const replyDataForPublish = replyMessage ? {
				replyTo: {
					_id: replyMessage._id,
					text: replyMessage.text,
					user: {
						_id: replyMessage.user._id,
						name: replyMessage.user.name,
					}
				}
			} : {};
			
			pubnub.publish(
				{
					channel,
					message: {
						text: '',
						createdAt: finalMessage.createdAt,
						image: cloudinaryUrl,
						groupId: String(id),
						...replyDataForPublish, // Include reply data
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
						
						// Clear the reply after sending
						if (replyMessage) {
							setReplyMessage(null);
						}
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
		console.log("Opening image in viewer:", imageUrl);
		
		if (!imageUrl || typeof imageUrl !== 'string') {
			console.error("Invalid image URL:", imageUrl);
			Alert.alert("Error", "Invalid image URL format");
			return;
		}
		
		if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
			console.error("URL must start with http:// or https://:", imageUrl);
			Alert.alert("Error", "Invalid image URL");
			return;
		}
		
		setSelectedImage(imageUrl);
		setImageViewerVisible(true);
	};

	const renderMessageImage = (props: any) => {
		const { currentMessage } = props;
		if (!currentMessage?.image) {
			console.log("Message has no image:", currentMessage);
			return null;
		}
		
		console.log("Rendering message image:", currentMessage.image);
		
		const borderColor = authUser?.id && currentMessage.user._id === authUser.id 
			? '#E9F7FA' 
			: '#F0F0F0';
		
		return (
			<TouchableOpacity 
				onPress={() => handleImageTap(currentMessage.image)}
				style={[styles.imageContainer, { borderColor }]}
			>
				<Image
					source={{ uri: currentMessage.image }}
					style={styles.messageImage}
					onError={(error) => {
						console.error("Error loading message image:", error.nativeEvent.error);
					}}
					resizeMode="cover"
				/>
				{currentMessage.pending && (
					<View style={styles.pendingOverlay}>
						<ActivityIndicator size="small" color="#FFFFFF" />
					</View>
				)}
			</TouchableOpacity>
		);
	};

	// useEffect(() => {
	// 	if (imageViewerVisible) {
	// 		setIsImageLoading(true);
	// 	}
	// }, [imageViewerVisible]);

	const renderImageViewer = () => {
		return (
			<Modal
				visible={imageViewerVisible}
				transparent={true}
				onRequestClose={() => setImageViewerVisible(false)}
				animationType="fade"
				statusBarTranslucent={true}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setImageViewerVisible(false)}
				>
					<TouchableOpacity 
						style={styles.closeButton}
						onPress={() => setImageViewerVisible(false)}
						activeOpacity={0.7}
					>
						<Ionicons name="close" size={28} color="#fff" />
					</TouchableOpacity>
					
					{selectedImage && (
						<TouchableOpacity 
							style={styles.centeredImageContainer}
							activeOpacity={1}
							onPress={(e) => e.stopPropagation()}
						>
							<Image
								source={{ uri: selectedImage }}
								style={styles.fullScreenImage}
								resizeMode="contain"
								onLoadStart={() => setIsImageLoading(true)}
								onLoad={() => setIsImageLoading(false)}
								onError={(error) => {
									console.error("Error loading image:", error.nativeEvent.error);
									setIsImageLoading(false);
									Alert.alert("Error", "Failed to load image. Please try again.");
								}}
							/>
							
							{isImageLoading && (
								<View style={styles.centeredLoadingIndicator}>
									<ActivityIndicator 
										size="large" 
										color="#ffffff" 
									/>
									<Text style={styles.loadingText}>Loading image...</Text>
								</View>
							)}
						</TouchableOpacity>
					)}
				</TouchableOpacity>
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
					// Cast the props to use our extended message type
					const bubbleProps = props as unknown as { currentMessage: ExtendedIMessage };
					const currentMessage = bubbleProps.currentMessage;
					const isCurrentUser = currentMessage.user._id == authUser?.id;
					
					return (
						<View>
							{/* Show reply information if message is a reply */}
							{currentMessage.replyTo && (
								<View style={{
									backgroundColor: Colors.lightGray,
									padding: 6, 
									borderRadius: 8,
									marginBottom: 4,
									marginLeft: isCurrentUser ? 0 : 10,
									marginRight: isCurrentUser ? 10 : 0,
									marginTop: 2,
									maxWidth: '80%',
									alignSelf: isCurrentUser ? 'flex-end' : 'flex-start'
								}}>
									<Text style={{
										fontSize: 12,
										fontWeight: '600',
										color: Colors.primary
									}}>
										{currentMessage.replyTo.user.name}
									</Text>
									<Text style={{
										fontSize: 12,
										color: Colors.gray,
										marginTop: 2
									}} numberOfLines={2}>
										{currentMessage.replyTo.text}
									</Text>
								</View>
							)}
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
								<TouchableOpacity
									disabled={isUploading}
									onPress={takePhoto}
									activeOpacity={0.7}
								>
									<Ionicons name="camera-outline" color={Colors.primary} size={28} />
								</TouchableOpacity>
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
		borderRadius: 13,
		overflow: 'hidden',
		margin: 3,
		// borderWidth: 1,
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
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.9)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeButton: {
		position: 'absolute',
		top: 40,
		right: 20,
		zIndex: 10,
		padding: 10,
		backgroundColor: 'rgba(0,0,0,0.5)',
		borderRadius: 20,
	},
	centeredImageContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		height: '100%',
	},
	fullScreenImage: {
		width: Dimensions.get('window').width * 0.9,
		height: Dimensions.get('window').height * 0.8,
		borderRadius: 8,
	},
	centeredLoadingIndicator: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.3)',
	},
	loadingText: {
		color: '#ffffff',
		marginTop: 10,
		fontSize: 14,
		fontWeight: '600',
	},
	messageImage: {
		width: 150,
		height: 150,
		// borderWidth: 2,
		borderColor: '#E9F7FA',
	},
	pendingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default Page;
