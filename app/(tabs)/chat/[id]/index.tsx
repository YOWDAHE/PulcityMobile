import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  Image,
  Alert,
  TextInput,
  Keyboard,
} from "react-native";
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
} from "pubnub";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio, Video, ResizeMode } from "expo-av";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ChatMessageBox from "@/components/ChatMessageBox";
import ReplyMessageBar from "@/components/ReplyMessageBar";
import EmojiPicker from "rn-emoji-keyboard";
import { uploadToCloudinary } from "@/utils/cloudinary";
import { pickMedia } from "@/utils/cloudinary";

// Define color schemes
const ColorSchemes = {
  light: {
    background: "#ffffff",
    inputBackground: "#f2f2f2",
    bubbleLeftBackground: "#ffffff",
    bubbleRightBackground: "#DCF8C6",
    bubbleTextLeft: "#000000",
    bubbleTextRight: "#000000",
    text: "#000000",
    primary: "#0084ff",
    gray: "#7d7d7d",
    lightGray: "#e5e5e5",
    timeText: "#7d7d7d",
    modalBackground: "#ffffff",
    headerBackground: "#ffffff",
    headerText: "#000000",
  },
  dark: {
    background: "#121212",
    inputBackground: "#1e1e1e",
    bubbleLeftBackground: "#1e1e1e",
    bubbleRightBackground: "#075e54",
    bubbleTextLeft: "#ffffff",
    bubbleTextRight: "#ffffff",
    text: "#ffffff",
    primary: "#bb86fc",
    gray: "#9e9e9e",
    lightGray: "#424242",
    timeText: "#9e9e9e",
    modalBackground: "#1e1e1e",
    headerBackground: "#1e1e1e",
    headerText: "#ffffff",
  },
};

interface MessageEvent extends PubNubMessageEvent {
  channel: string;
}

interface User {
  _id: string;
  name: string;
  avatar?: string;
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
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const currentTheme = ColorSchemes[theme];
  const insets = useSafeAreaInsets();
  const pubnubClient = usePubNub();

  //menu states
  const [menuVisible, setMenuVisible] = useState(false);

  // Chat states
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<IMessage | null>(null);

  // Chat states
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState("");
  const [replyMessage, setReplyMessage] = useState<IMessage | null>(null);
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // User states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [typers, setTypers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [initialHistoryLoaded, setInitialHistoryLoaded] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, User>>({});

  // Recording states
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingWaveform, setRecordingWaveform] = useState<number[]>([]);
  const recordingInterval = useRef<NodeJS.Timeout>();

  // upload progress states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  //Modal states
  const [previewMedia, setPreviewMedia] = useState<{
    uri: string;
    type: "image" | "video";
    caption: string;
  } | null>(null);
  const [showCaptionModal, setShowCaptionModal] = useState(false);

  //  states for emoji picker
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const inputRef = useRef<TextInput>(null);

  // Handle emoji selection
  const handleEmojiSelect = (emoji: any) => {
    setText((prevText) => prevText + emoji.emoji);
  };

  // Toggle emoji keyboard
  const toggleEmojiPicker = () => {
    if (isEmojiPickerOpen) {
      setIsEmojiPickerOpen(false);
      inputRef.current?.focus();
    } else {
      Keyboard.dismiss();
      setIsEmojiPickerOpen(true);
    }
  };

  const channel = "group-chat";
  const swipeableRowRef = useRef<Swipeable | null>(null);

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
  // Handle keyboard events for proper positioning
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardOffset(e.endCoordinates.height);
        setIsEmojiPickerOpen(false);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardOffset(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  // Request permissions
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();

      if (
        cameraStatus !== "granted" ||
        mediaStatus !== "granted" ||
        audioStatus !== "granted"
      ) {
        Alert.alert(
          "Permissions required",
          "Please enable all permissions to use all features"
        );
      }
    })();
  }, []);

  // Initialize PubNub
  useEffect(() => {
    const uuid = pubnub.getUUID();
    const newUser = { _id: uuid, name: `User-${uuid.slice(0, 5)}` };
    setCurrentUser(newUser);
    setUserMap((prev) => ({ ...prev, [uuid]: newUser }));

    pubnub.setUUID(uuid);
    pubnub.objects.setUUIDMetadata({
      uuid: uuid,
      data: {
        custom: {
          name: newUser.name,
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
            (message) => ({
              _id: message.timetoken.toString(),
              text: message.message.text,
              createdAt: new Date(Number(message.timetoken) / 10000),
              user: {
                _id: message.uuid || "unknown",
                name: message.message.user?.name || "Unknown User",
                avatar: message.message.user?.avatar,
              },
              image: message.message.image,
              video: message.message.video,
              audio: message.message.audio,
              file: message.message.file,
            })
          );
          setMessages(historyMessages.reverse());
          setInitialHistoryLoaded(true);
        }
      }
    );

    return () => {
      pubnub.unsubscribeAll();
      pubnub.removeListener(listener);
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  // Media handling functions

  // Update the media handling functions
  const handleMediaSend = async (
    media: { uri: string; type: "image" | "video" },
    caption: string = ""
  ) => {
    if (!currentUser) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create loading message
      const loadingMessage: IMessage = {
        _id: `loading-${Date.now()}`,
        text: "Uploading...",
        createdAt: new Date(),
        user: {
          _id: currentUser._id,
          name: currentUser.name,
        },
        pending: true,
        progress: 0,
      };

      setMessages((prev) => [loadingMessage, ...prev]);

      // Upload to Cloudinary
      const cloudinaryResult: {
        url: string;
        duration?: number;
      } = await uploadToCloudinary(
        media.uri,
        media.type,
        (progress: number) => {
          setUploadProgress(progress);
          setMessages((prev) =>
            prev.map((m) =>
              m._id === loadingMessage._id ? { ...m, progress } : m
            )
          );
        }
      );

      // Create final message
      const newMessage: IMessage = {
        _id: Date.now().toString(),
        text: caption || (media.type === "image" ? "Photo" : "Video"),
        createdAt: new Date(),
        user: {
          _id: currentUser._id,
          name: currentUser.name,
        },
        [media.type]: cloudinaryResult.url,
        ...(media.type === "video" && {
          videoDuration: cloudinaryResult.duration,
        }),
      };

      // Replace loading message with final message
      setMessages((prev) => [
        newMessage,
        ...prev.filter((m) => m._id !== loadingMessage._id),
      ]);

      // Send via PubNub
      await setMessages([newMessage]);
    } catch (error) {
      console.error("Media upload failed:", error);
      setMessages((prev) =>
        prev.filter((m) => m._id !== `loading-${Date.now()}`)
      );
      Alert.alert("Upload Failed", "Could not upload media. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const pickImage = async () => {
    setAttachmentMenuVisible(false);
    try {
      const media = await pickMedia("image");
      if (media) {
        setPreviewMedia({
          uri: media.uri,
          type: "image",
          caption: "",
        });
        setShowCaptionModal(true);
      }
    } catch (error) {
      console.error("Image picker error:", error);
    }
  };
  const takePhoto = async () => {
    setAttachmentMenuVisible(false);
    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setPreviewMedia({
          uri: result.assets[0].uri,
          type: "image",
          caption: "",
        });
        setShowCaptionModal(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };
  const pickVideo = async () => {
    setAttachmentMenuVisible(false);
    try {
      const media = await pickMedia("video");
      if (media) {
        setPreviewMedia({
          uri: media.uri,
          type: "video",
          caption: "",
        });
        setShowCaptionModal(true);
      }
    } catch (error) {
      console.error("Video picker error:", error);
    }
  };

  const pickDocument = async () => {
    setAttachmentMenuVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newMessage: IMessage = {
          _id: Date.now().toString(),
          text: asset.name || "Document",
          createdAt: new Date(),
          user: {
            _id: currentUser?._id || "",
            name: currentUser?.name || "",
          },
          file: {
            url: asset.uri,
            name: asset.name || "file",
            type: asset.mimeType || "*/*",
          },
        };
        sendMessage([newMessage]);
      }
    } catch (err) {
      console.log("Document picker error:", err);
    }
  };

  // Update startRecording function
  const startRecording = async () => {
    setAttachmentMenuVisible(false);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      setRecordingWaveform([]);

      // Start timer and waveform simulation
      recordingInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
        // Simulate waveform data (in a real app, you'd use actual audio analysis)
        setRecordingWaveform((prev) => [
          ...prev.slice(-20),
          Math.random() * 100,
        ]);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // Update stopRecording function
  const stopRecording = async () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    setIsRecording(false);
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();

    if (uri) {
      const newMessage: IMessage = {
        _id: Date.now().toString(),
        text: "Audio message",
        createdAt: new Date(),
        user: {
          _id: currentUser?._id || "",
          name: currentUser?.name || "",
        },
        audio: uri,
        audioDuration: recordingDuration,
      };
      sendMessage([newMessage]);
    }

    setRecording(null);
    setRecordingDuration(0);
    setRecordingWaveform([]);
  };

  // Message handlers
  const handleEditConfirm = () => {
    if (!editingMessage || !text) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === editingMessage._id ? { ...msg, text, pending: true } : msg
      )
    );

    // Send update to PubNub
    pubnub.publish({
      channel,
      message: {
        ...editingMessage,
        text,
        isUpdate: true,
        updatedAt: new Date(),
      },
    });

    setEditingMessage(null);
    setText("");
  };
  const handleReply = (message: IMessage) => {
    setReplyMessage(message);
    setContextMenuVisible(false);
  };
  const handleMessageLongPress = (context: any, message: IMessage) => {
    setSelectedMessage(message);
    setContextMenuVisible(true);
  };

  const handleForwardMessage = () => {
    if (!selectedMessage) return;
    // Implement forward logic here
    Alert.alert("Forward", `Forwarding message: ${selectedMessage.text}`);
    setContextMenuVisible(false);
  };

  const handleEditMessage = () => {
    if (!selectedMessage) return;
    // Implement edit logic here
    Alert.alert("Edit", `Editing message: ${selectedMessage.text}`);
    setContextMenuVisible(false);
  };

  const handleDeleteMessage = () => {
    if (!selectedMessage) return;
    // Implement delete logic here
    setMessages((prev) => prev.filter((m) => m._id !== selectedMessage._id));
    setContextMenuVisible(false);
  };
  const handleCancelReply = () => {
    setReplyMessage(null);
  };
  // Update the handleMessage function
  const handleMessage = useCallback(
    (messageEvent: MessageEvent) => {
      if (messageEvent.channel === channel) {
        setMessages((prev) => {
          // Skip if this is our own message that we've already optimistically added
          if (
            messageEvent.publisher === currentUser?._id &&
            messageEvent.message.tempId
          ) {
            return prev.map((m) =>
              m._id === messageEvent.message.tempId
                ? {
                    ...m,
                    _id: messageEvent.timetoken.toString(),
                    pending: false,
                  }
                : m
            );
          }

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
                name:
                  userMap[messageEvent.publisher]?.name ||
                  messageEvent.message.user?.name ||
                  "Unknown User",
                avatar:
                  userMap[messageEvent.publisher]?.avatar ||
                  messageEvent.message.user?.avatar,
              },
              // These will now be Cloudinary URLs
              image: messageEvent.message.image,
              video: messageEvent.message.video,
              audio: messageEvent.message.audio,
              file: messageEvent.message.file,
            };
            return GiftedChat.append(prev, [newMessage]);
          }
          return prev;
        });
      }
    },
    [channel, userMap, currentUser]
  );

  const handlePresence = useCallback(
    (presenceEvent: PresenceEventExtended) => {
      const user = userMap[presenceEvent.uuid] || {
        _id: presenceEvent.uuid,
        name: `User-${presenceEvent.uuid.slice(0, 5)}`,
      };

      setUserMap((prev) => ({ ...prev, [user._id]: user }));

      switch (presenceEvent.action) {
        case "join":
          setOnlineUsers((prev) => [...prev, user]);
          break;
        case "leave":
        case "timeout":
          setOnlineUsers((prev) =>
            prev.filter((u) => u._id !== presenceEvent.uuid)
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
      setTypers((prev) => {
        const newTypers = prev.filter((u) => u !== signalEvent.publisher);
        if (signalEvent.message.isTyping && signalEvent.publisher) {
          newTypers.push(signalEvent.publisher);
        }
        return Array.from(new Set(newTypers));
      });
    }
  }, []);
  const publishWithRetry = async (
    message: any,
    retries = 3
  ): Promise<boolean> => {
    try {
      const response = await new Promise((resolve, reject) => {
        pubnub.publish(
          {
            channel,
            message,
          },
          (status, response) => {
            if (status.error) {
              reject(status);
            } else {
              resolve(response);
            }
          }
        );
      });
      return true;
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (4 - retries))
        ); // Exponential backoff
        return publishWithRetry(message, retries - 1);
      }
      console.error("Failed to publish after retries:", error);
      return false;
    }
  };

  const sendMessage = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!currentUser) return;

      if (isEmojiPickerOpen) setIsEmojiPickerOpen(false);
      if (attachmentMenuVisible) setAttachmentMenuVisible(false);

      try {
        const messagesToSend = await Promise.all(
          newMessages.map(async (message) => {
            const tempId = `${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`;

            // Optimistically add message with tempId
            setMessages((prev) => [
              {
                ...message,
                _id: tempId,
                pending: true,
                user: {
                  _id: currentUser._id,
                  name: currentUser.name,
                  avatar: currentUser.avatar,
                },
              },
              ...prev,
            ]);

            return {
              ...message,
              _id: tempId, // Include tempId in the message
              user: {
                _id: currentUser._id,
                name: currentUser.name,
                avatar: currentUser.avatar,
              },
            };
          })
        );

        // Send messages to PubNub
        messagesToSend.forEach((msg) => {
          pubnub.publish(
            {
              channel,
              message: {
                ...msg,
                tempId: msg._id, // Include tempId in the published message
                user: msg.user,
              },
            },
            (status, response) => {
              if (status.error) {
                console.error("Message failed to send:", status);
                setMessages((prev) => prev.filter((m) => m._id !== msg._id));
              }
              // No need to update here - handleMessage will take care of it
            }
          );
        });

        setText("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [currentUser, channel, isEmojiPickerOpen, attachmentMenuVisible]
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

  // Render functions
  const renderInputToolbar = (props: any) => {
    if (isRecording) {
      return (
        <View
          style={[
            styles.recordingToolbar,
            {
              backgroundColor: currentTheme.background,
              borderTopColor: currentTheme.lightGray,
            },
          ]}
        >
          <View style={styles.recordingWaveformContainer}>
            {recordingWaveform.map((value, index) => (
              <View
                key={index}
                style={[styles.recordingBar, { height: value }]}
              />
            ))}
          </View>
          <Text style={[styles.recordingTime, { color: currentTheme.text }]}>
            {Math.floor(recordingDuration / 60)}:
            {(recordingDuration % 60).toString().padStart(2, "0")}
          </Text>
          <TouchableOpacity onPress={stopRecording}>
            <MaterialCommunityIcons name="stop" color="red" size={28} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ width: "100%" }}>
        <InputToolbar
          {...props}
          containerStyle={{
            backgroundColor: currentTheme.background,
            borderTopColor: currentTheme.lightGray,
            paddingHorizontal: 8,
          }}
          primaryStyle={{
            alignItems: "center",
          }}
          renderActions={() => (
            <View style={styles.actionsContainer}>
              {!editingMessage && (
                <>
                  <TouchableOpacity onPress={toggleEmojiPicker}>
                    <MaterialCommunityIcons
                      name="emoticon-happy-outline"
                      color={
                        isEmojiPickerOpen
                          ? currentTheme.primary
                          : currentTheme.gray
                      }
                      size={28}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAttachmentMenuVisible(true)}
                  >
                    <MaterialCommunityIcons
                      name="paperclip"
                      color={currentTheme.primary}
                      size={28}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        />

        {/* Emoji Picker */}
        {isEmojiPickerOpen && (
          <View
            style={[styles.emojiPickerContainer, { bottom: keyboardOffset }]}
          >
            <EmojiPicker
              onEmojiSelected={handleEmojiSelect}
              open={isEmojiPickerOpen}
              onClose={() => setIsEmojiPickerOpen(false)}
              theme={theme === "dark" ? "dark" : ("light" as const)}
              categoryPosition="top"
              enableSearchBar
              styles={{
                container: {
                  borderRadius: 0,
                  backgroundColor: currentTheme.modalBackground,
                },
                searchBar: {
                  container: { backgroundColor: currentTheme.inputBackground },
                  color: currentTheme.text,
                },
              }}
            />
          </View>
        )}
      </View>
    );
  };

  const renderBubble = (props: any) => {
    const isCurrentUser = props.currentMessage?.user?._id === currentUser?._id;
    return (
      <View>
        {!isCurrentUser && props.currentMessage?.user?.name && (
          <Text style={[styles.username, { color: currentTheme.text }]}>
            {props.currentMessage.user.name}
          </Text>
        )}
        <Bubble
          {...props}
          textStyle={{
            right: {
              color: currentTheme.bubbleTextRight,
            },
            left: {
              color: currentTheme.bubbleTextLeft,
            },
          }}
          wrapperStyle={{
            left: {
              backgroundColor: currentTheme.bubbleLeftBackground,
              borderRadius: 12,
              marginRight: 50,
            },
            right: {
              backgroundColor: currentTheme.bubbleRightBackground,
              borderRadius: 12,
              marginLeft: 50,
            },
          }}
          timeTextStyle={{
            left: { color: currentTheme.timeText },
            right: { color: currentTheme.timeText },
          }}
        />
      </View>
    );
  };

  const renderSend = (props: any) => {
    return (
      <View style={styles.sendContainer}>
        {isRecording ? (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              {recordingWaveform.map((value, index) => (
                <View
                  key={index}
                  style={[styles.recordingBar, { height: value }]}
                />
              ))}
            </View>
            <Text style={styles.recordingTime}>
              {Math.floor(recordingDuration / 60)}:
              {(recordingDuration % 60).toString().padStart(2, "0")}
            </Text>
            <TouchableOpacity onPress={stopRecording}>
              <MaterialCommunityIcons name="stop" color="red" size={28} />
            </TouchableOpacity>
          </View>
        ) : editingMessage ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleEditConfirm}
          >
            <Text style={{ color: currentTheme.primary }}>Update</Text>
          </TouchableOpacity>
        ) : (
          <>
            {text === "" && (
              <TouchableOpacity onPress={startRecording}>
                <MaterialCommunityIcons
                  name="microphone"
                  color={currentTheme.primary}
                  size={28}
                />
              </TouchableOpacity>
            )}
            {text !== "" && (
              <Send {...props} containerStyle={styles.sendButton}>
                <MaterialCommunityIcons
                  name="send"
                  color={currentTheme.primary}
                  size={28}
                />
              </Send>
            )}
          </>
        )}
      </View>
    );
  };

  const renderChatFooter = () => {
    if (typers.length > 0) {
      return (
        <Text style={{ color: currentTheme.gray }}>
          {typers.join(", ")} is typing...
        </Text>
      );
    }
    return null;
  };

  const renderMessageImage = (props: any) => {
    // You can add Cloudinary transformations here if needed
    const imageUrl = props.currentMessage.image;

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode={ResizeMode.COVER}
        />
      </View>
    );
  };

  // Update renderMessageVideo for Cloudinary URLs
  const renderMessageVideo = (props: any) => {
    const videoUrl = props.currentMessage.video;

    return (
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          useNativeControls
        />
      </View>
    );
  };

  const renderMessageAudio = (props: any) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const playSound = async () => {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: props.currentMessage.audio },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if ("didJustFinish" in status && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    };

    const stopSound = async () => {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.audioContainer,
          { backgroundColor: currentTheme.bubbleLeftBackground },
        ]}
        onPress={isPlaying ? stopSound : playSound}
      >
        <MaterialCommunityIcons
          name={isPlaying ? "pause" : "play"}
          size={24}
          color={currentTheme.primary}
        />
        <Text style={[styles.audioText, { color: currentTheme.text }]}>
          Audio message
        </Text>
      </TouchableOpacity>
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

  const renderHeader = () => (
    <View
      style={[
        styles.header,
        { backgroundColor: currentTheme.headerBackground },
      ]}
    >
      <Text style={[styles.headerText, { color: currentTheme.headerText }]}>
        Chat
      </Text>
      <View style={styles.headerRight}>
        <Text style={[styles.onlineText, { color: currentTheme.gray }]}>
          {onlineUsers.length} online
        </Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={currentTheme.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Three-dot menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[
              styles.menuContainer,
              {
                backgroundColor: currentTheme.modalBackground,
                shadowColor: currentTheme.text,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleTheme();
                setMenuVisible(false);
              }}
            >
              <Ionicons
                name={theme === "light" ? "moon" : "sunny"}
                size={20}
                color={currentTheme.primary}
              />
              <Text style={[styles.menuText, { color: currentTheme.text }]}>
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </Text>
            </TouchableOpacity>
            {/* Add more menu items here */}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  if (!currentUser) return null;

  return (
    <ImageBackground
      source={
        theme === "dark"
          ? require("@/assets/images/pattern-dark.jpeg")
          : require("@/assets/images/pattern-light.jpeg")
      }
      style={{
        flex: 1,
        backgroundColor: currentTheme.background,
        marginBottom: insets.bottom,
      }}
    >
      {renderHeader()}

      <GiftedChat
        messages={messages}
        onSend={sendMessage}
        onLongPress={handleMessageLongPress}
        onInputTextChanged={handleTyping}
        user={{
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        }}
        renderSystemMessage={(props) => (
          <SystemMessage
            {...props}
            textStyle={{ color: currentTheme.gray }}
            wrapperStyle={{ backgroundColor: currentTheme.background }}
          />
        )}
        bottomOffset={insets.bottom}
        renderAvatar={null}
        maxComposerHeight={100}
        textInputProps={{
          style: [
            styles.composer,
            {
              backgroundColor: currentTheme.inputBackground,
              color: currentTheme.text,
              borderColor: currentTheme.lightGray,
            },
          ],
          placeholderTextColor: currentTheme.gray,
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderInputToolbar={renderInputToolbar}
        renderChatFooter={() => (
          <ReplyMessageBar
            clearReply={() => setReplyMessage(null)}
            message={replyMessage}
            currentTheme={currentTheme}
          />
        )}
        onLongPress={(context, message) => setReplyMessage(message)}
        renderMessage={(props) => (
          <ChatMessageBox
            {...props}
            setReplyOnSwipeOpen={setReplyMessage}
            updateRowRef={updateRowRef}
            currentTheme={currentTheme}
          />
        )}
        renderMessageImage={renderMessageImage}
        renderMessageVideo={renderMessageVideo}
        renderMessageAudio={renderMessageAudio}
      />

      {isRecording && (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingIndicator}>
            {recordingWaveform.map((value, index) => (
              <View
                key={index}
                style={[styles.recordingBar, { height: value }]}
              />
            ))}
          </View>
          <Text style={styles.recordingTime}>
            {Math.floor(recordingDuration / 60)}:
            {(recordingDuration % 60).toString().padStart(2, "0")}
          </Text>
        </View>
      )}
      {contextMenuVisible && (
        <Modal
          transparent={true}
          visible={contextMenuVisible}
          animationType="fade"
          onRequestClose={() => setContextMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.contextMenuOverlay}
            activeOpacity={1}
            onPress={() => setContextMenuVisible(false)}
          >
            <View
              style={[
                styles.contextMenu,
                {
                  backgroundColor: currentTheme.modalBackground,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={handleForwardMessage}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={24}
                  color={currentTheme.primary}
                />
                <Text
                  style={[styles.contextMenuText, { color: currentTheme.text }]}
                >
                  Forward
                </Text>
              </TouchableOpacity>

              {selectedMessage?.user._id === currentUser?._id && (
                <>
                  <TouchableOpacity
                    style={styles.contextMenuItem}
                    onPress={handleEditMessage}
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={24}
                      color={currentTheme.primary}
                    />
                    <Text
                      style={[
                        styles.contextMenuText,
                        { color: currentTheme.text },
                      ]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contextMenuItem}
                    onPress={() => {
                      handleReply(selectedMessage!);
                      setContextMenuVisible(false);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="reply"
                      size={24}
                      color={currentTheme.primary}
                    />
                    <Text
                      style={[
                        styles.contextMenuText,
                        { color: currentTheme.text },
                      ]}
                    >
                      Reply
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contextMenuItem}
                    onPress={handleDeleteMessage}
                  >
                    <MaterialCommunityIcons
                      name="delete"
                      size={24}
                      color="#ff4444"
                    />
                    <Text
                      style={[styles.contextMenuText, { color: "#ff4444" }]}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
      {showCaptionModal && previewMedia && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCaptionModal}
          onRequestClose={() => setShowCaptionModal(false)}
        >
          <View
            style={[
              styles.captionModalContainer,
              { backgroundColor: currentTheme.modalBackground },
            ]}
          >
            <View
              style={[
                styles.captionModalContent,
                { backgroundColor: currentTheme.background },
              ]}
            >
              {previewMedia.type === "image" ? (
                <Image
                  source={{ uri: previewMedia.uri }}
                  style={styles.captionPreviewImage}
                  resizeMode="contain"
                />
              ) : (
                <Video
                  source={{ uri: previewMedia.uri }}
                  style={styles.captionPreviewVideo}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                  isLooping
                />
              )}

              <TextInput
                style={[
                  styles.captionInput,
                  {
                    backgroundColor: currentTheme.inputBackground,
                    color: currentTheme.text,
                    borderColor: currentTheme.lightGray,
                  },
                ]}
                placeholder="Add a caption..."
                placeholderTextColor={currentTheme.gray}
                value={previewMedia.caption}
                onChangeText={(text) =>
                  setPreviewMedia((prev) =>
                    prev ? { ...prev, caption: text } : null
                  )
                }
                multiline
              />

              <View style={styles.captionButtons}>
                <TouchableOpacity
                  style={styles.captionButton}
                  onPress={() => setShowCaptionModal(false)}
                >
                  <Text style={{ color: currentTheme.primary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.captionButton,
                    { backgroundColor: currentTheme.primary },
                  ]}
                  onPress={async () => {
                    if (!previewMedia) return;
                    await handleMediaSend(
                      { uri: previewMedia.uri, type: previewMedia.type },
                      previewMedia.caption
                    );
                    setShowCaptionModal(false);
                    setPreviewMedia(null);
                  }}
                  disabled={isUploading}
                >
                  <Text style={{ color: "white" }}>
                    {isUploading
                      ? `Uploading... ${Math.round(uploadProgress * 100)}%`
                      : "Send"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {/* Attachment Menu Modal */}
      <Modal
        visible={attachmentMenuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAttachmentMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAttachmentMenuVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.modalBackground },
            ]}
          >
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={pickImage}
            >
              <MaterialCommunityIcons
                name="image"
                size={24}
                color={currentTheme.primary}
              />
              <Text
                style={[styles.attachmentText, { color: currentTheme.text }]}
              >
                Photo Library
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={takePhoto}
            >
              <MaterialCommunityIcons
                name="camera"
                size={24}
                color={currentTheme.primary}
              />
              <Text
                style={[styles.attachmentText, { color: currentTheme.text }]}
              >
                Take Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={pickVideo}
            >
              <MaterialCommunityIcons
                name="video"
                size={24}
                color={currentTheme.primary}
              />
              <Text
                style={[styles.attachmentText, { color: currentTheme.text }]}
              >
                Video
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={pickDocument}
            >
              <MaterialCommunityIcons
                name="file-document"
                size={24}
                color={currentTheme.primary}
              />
              <Text
                style={[styles.attachmentText, { color: currentTheme.text }]}
              >
                Document
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={startRecording}
            >
              <MaterialCommunityIcons
                name="microphone"
                size={24}
                color={currentTheme.primary}
              />
              <Text
                style={[styles.attachmentText, { color: currentTheme.text }]}
              >
                Audio
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
    // Caption Modal
  );
};

const styles = StyleSheet.create({
  composer: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
    fontSize: 16,
    marginVertical: 4,
    minHeight: 36,
  },
  actionsContainer: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 4,
  },

  sendContainer: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 14,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 20,
  },
  username: {
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 10,
  },
  imageContainer: {
    borderRadius: 10,
    overflow: "hidden",
    margin: 3,
  },
  image: {
    width: 200,
    height: 200,
  },
  videoContainer: {
    borderRadius: 10,
    overflow: "hidden",
    margin: 3,
  },
  video: {
    width: 200,
    height: 200,
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    margin: 3,
  },
  audioText: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  attachmentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  attachmentText: {
    marginLeft: 15,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineText: {
    fontSize: 12,
    marginRight: 10,
  },
  themeToggle: {
    padding: 8,
  },
  emojiPickerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    height: 30,
    flex: 1,
    marginRight: 10,
  },
  recordingBar: {
    width: 3,
    backgroundColor: "green",
    marginHorizontal: 1,
    borderRadius: 2,
  },
  recordingToolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  recordingWaveformContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    marginRight: 10,
  },
  recordingTime: {
    color: "green",
    fontSize: 14,
    marginRight: 10,
  },
  captionModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  captionModalContent: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
  },
  captionPreviewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  captionPreviewVideo: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  captionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    marginBottom: 15,
  },
  captionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  captionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingRight: 20,
  },
  menuContainer: {
    width: 200,
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
  },
  contextMenuOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  contextMenu: {
    width: 200,
    borderRadius: 10,
    paddingVertical: 10,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  contextMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  contextMenuText: {
    marginLeft: 15,
    fontSize: 16,
  },
});

export default Page;
