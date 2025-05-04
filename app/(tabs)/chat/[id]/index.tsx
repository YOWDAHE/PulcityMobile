import ChatMessageBox from "@/components/ChatMessageBox";
import ReplyMessageBar from "@/components/ReplyMessageBar";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { ImageBackground, StyleSheet, View, Text, Alert } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import {
	GiftedChat,
	Bubble,
	InputToolbar,
	Send,
	SystemMessage,
	IMessage,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePubNub } from "pubnub-react";
import pubnub from "@/utils/pubnub";
import {
	PresenceEvent,
	SignalEvent,
	MessageEvent as PubNubMessageEvent,
} from "pubnub";// Import ImagePicker

interface MessageEvent extends PubNubMessageEvent {
	channel: string;
}

interface User {
	_id: string;
	name: string;
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

const Page = () => {
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [text, setText] = useState("");
	const insets = useSafeAreaInsets();
	const pubnubClient = usePubNub();

	const [replyMessage, setReplyMessage] = useState<IMessage | null>(null);
	const swipeableRowRef = useRef<Swipeable | null>(null);

	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [typers, setTypers] = useState<string[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
	const [initialHistoryLoaded, setInitialHistoryLoaded] = useState(false);
	const [userMap, setUserMap] = useState<Record<string, User>>({});

	const channel = "group-chat";

	useEffect(() => {
		const uuid = pubnub.getUUID();
		const newUser = { _id: uuid, name: `Joda` };
		console.log(`User UUID: ${uuid}`);
		setCurrentUser(newUser);
		setUserMap((prev) => ({ ...prev, [uuid]: newUser }));
		pubnub.setUUID(currentUser?._id || pubnub.getUUID());
		pubnub.objects.setUUIDMetadata({
			uuid: currentUser?._id || "",
			data: {
				custom: {
					name: currentUser?.name ?? "name",
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
		pubnub.fetchMessages(
			{
				channels: [channel],
				count: 50,
			},
			(status, response) => {
				if (response?.channels[channel] && !initialHistoryLoaded) {
					const historyMessages: IMessage[] = response.channels[channel].map(
						(message) => {
							console.log("History message:", message.uuid, currentUser?._id);
							return {
								_id: message.timetoken.toString(),
								text: message.message.text,
								createdAt: new Date(Number(message.timetoken) / 10000),
								user: {
									_id: message.uuid || "unknown",
									name: message.message.user.name || "Unknown User",
								},
							};
						}
					);
					// historyMessages.push({
					// 	_id: "0",
					// 	text: "Hello there",
					// 	createdAt: new Date(),
					// 	user: {
					// 		_id: "0",
					// 		name: "Betty",
					// 	},
					// });
					// setMessages((prev) => GiftedChat.append(prev, historyMessages));
					setMessages(historyMessages.reverse()); // GiftedChat expects reverse order
					setInitialHistoryLoaded(true);
				}
			}
		);

		return () => {
			pubnub.unsubscribeAll();
			pubnub.removeListener(listener);
		};
	}, []);

	const handleMessage = useCallback(
		(messageEvent: MessageEvent) => {
			if (messageEvent.channel === channel) {
				// Ignore messages sent by the current user
				if (messageEvent.publisher === currentUser?._id) {
					return;
				}

				setMessages((prev) => {
					const messageExists = prev.some(
						(m) => m._id === messageEvent.timetoken.toString()
					);
					if (!messageExists) {
						const newMessage: IMessage = {
							_id: messageEvent.timetoken.toString(),
							text: messageEvent.message.text,
							createdAt: new Date(Number(messageEvent.timetoken) / 10000),
							user: {
								_id: messageEvent.publisher,
								name: userMap[messageEvent.publisher]?.name,
							},
						};
						return GiftedChat.append(prev, [newMessage]);
					}
					return prev;
				});
			}
		},
		[channel, currentUser, userMap]
	);

	const handlePresence = useCallback(
		(presenceEvent: PresenceEventExtended) => {
			const user = userMap[presenceEvent.uuid] || {
				_id: presenceEvent.uuid,
				name: `Yodahe`,
			};

			setUserMap((prev) => ({ ...prev, [user._id]: user }));

			switch (presenceEvent.action) {
				case "join":
					setOnlineUsers((prev) => [...prev, user]);
					break;
				case "leave":
				case "timeout":
					setOnlineUsers((prev) => prev.filter((u) => u._id !== presenceEvent.uuid));
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
			if (!currentUser) return;

			// Publish the message to PubNub
			newMessages.forEach((message) => {
				console.log("Sending message:", currentUser.name);
				pubnub.publish(
					{
						channel,
						message: {
							text: message.text,
							createdAt: message.createdAt,
							image: message.image,
							user: {
								_id: currentUser._id,
								name: currentUser.name,
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
			setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
		},
		[currentUser, pubnub, channel]
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

	const renderInputToolbar = (props: any) => {

		return (
			<InputToolbar
				{...props}
				containerStyle={{ backgroundColor: Colors.background }}
				renderActions={() => (
					<View
						style={{
							height: 50,
							justifyContent: "center",
							alignItems: "center",
							left: 5,
						}}
					>
						<Ionicons
							name="add"
							color={Colors.primary}
							size={28}
							onPress={()=>{}}
						/>
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

	if (!currentUser) return null;

	return (
		<ImageBackground
			source={require("@/assets/images/pattern.png")}
			style={{
				flex: 1,
				backgroundColor: Colors.background,
				marginBottom: insets.bottom,
			}}
		>
			<GiftedChat
				messages={messages}
				onSend={sendMessage}
				onInputTextChanged={handleTyping}
				user={{ _id: currentUser._id, name: currentUser.name }}
				renderSystemMessage={(props) => (
					<SystemMessage {...props} textStyle={{ color: Colors.gray }} />
				)}
				bottomOffset={insets.bottom}
				renderAvatar={null}
				maxComposerHeight={100}
				textInputProps={styles.composer}
				renderBubble={(props) => {
					const isCurrentUser = props.currentMessage.user._id === currentUser?._id;
					return (
						<View>
							{!isCurrentUser && (
								<View>
									<Text
										style={{
											color: "white",
											fontSize: 12,
											marginBottom: 2,
											marginLeft: 10,
										}}
									>
										{props.currentMessage.user.name}
									</Text>
								</View>
							)}
							<Bubble
								{...props}
								textStyle={{
									right: {
										color: "#000",
									},
								}}
								wrapperStyle={{
									left: {
										backgroundColor: "#fff",
									},
									right: {
										backgroundColor: Colors.lightGreen,
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
						}}
					>
						{text === "" && (
							<>
								<Ionicons name="camera-outline" color={Colors.primary} size={28} />
								<Ionicons name="mic-outline" color={Colors.primary} size={28} />
							</>
						)}
						{text !== "" && (
							<Send
								{...props}
								containerStyle={{
									justifyContent: "center",
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
		backgroundColor: "#fff",
		borderRadius: 18,
		borderWidth: 1,
		borderColor: Colors.lightGray,
		paddingHorizontal: 10,
		paddingTop: 8,
		fontSize: 16,
		marginVertical: 4,
	},
});

export default Page;
