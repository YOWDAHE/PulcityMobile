import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
  IMessage,
  Avatar,
} from "react-native-gifted-chat";
import PubNub, { MessageEvent, PresenceEvent, SignalEvent } from "pubnub";
import { RouteProp } from "@react-navigation/native";
import pubnub from "@/utils/pubnub";

// Define TypeScript interfaces
interface AppRouteProp
  extends RouteProp<Record<string, object | undefined>, string> {}

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

// const GroupChatScreen = ({ route }: { route: AppRouteProp }) => {
const GroupChatScreen = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [typers, setTypers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [initialHistoryLoaded, setInitialHistoryLoaded] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const channel = "group-chat-channel";

  useEffect(() => {
    const uuid = pubnub.getUUID();
    const newUser = { _id: uuid, name: `Yodahe` };
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
            (message) => ({
              _id: message.timetoken.toString(),
              text: message.message.text,
              createdAt: new Date(Number(message.timetoken) / 10000),
              user: {
                _id: message.uuid || "unknown",
                name: message.uuid || "Unknown User",
              },
            })
          );
          historyMessages.push({
            _id: "0",
            text: "Hello there",
            createdAt: new Date(),
            user: {
              _id: "0",
              name: "Betty",
            },
          });
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

  const handleMessage = useCallback((messageEvent: MessageEvent) => {
    if (messageEvent.channel === channel) {
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
              _id: messageEvent.publisher || "unknown",
              name: messageEvent.publisher || "Unknown User",
            },
          };
          return GiftedChat.append(prev, [newMessage]);
        }
        return prev;
      });
    }
  }, []);

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
      console.log("Signal event:", signalEvent);
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
      console.log(">>>>>> ", newMessages);
      if (!currentUser) return;

      pubnub.publish(
        {
          channel,
          message: { text: newMessages[0].text },
        },
        function (status, response) {
          console.log(status);
          console.log(response);
        }
      );
      // }).catch(error => {
      //   Alert.alert('Message failed to send', error.message);
      // });
    },
    [currentUser]
  );

  const handleTyping = useCallback((text: string) => {
    pubnub.signal({
      channel,
      message: {
        type: "typing",
        isTyping: text.length > 1,
      } as TypingSignalContent,
    });
  }, []);

  const renderBubble = useCallback(
    (props: any) => (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: "#6646ee" },
          left: { backgroundColor: "#e6e6e6" },
        }}
        textStyle={{
          right: { color: "#fff" },
        }}
        containerStyle={{
          marginVertical: 10,
        }}
        
      />
    ),
    []
  );

  const renderInputToolbar = useCallback(
    (props: any) => (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        renderSend={renderSend}
      />
    ),
    []
  );

  const renderAvatar = useCallback(
    (props: any) => {
      if (props.currentMessage?.user._id === currentUser?._id) {
        return null;
      }
      return <Avatar {...props}/>
    },
    [currentUser?._id]
  );

  const renderSend = useCallback(
    (props: any) => (
      <Send {...props} containerStyle={styles.sendContainer}>
        <Text style={styles.sendText}>Send</Text>
      </Send>
    ),
    []
  );

  if (!currentUser) return null;

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.onlineText}>
          Online: {onlineUsers.length} | Typing:{" "}
          {typers.map((uuid) => userMap[uuid]?.name || `Yodahe`).join(", ")}
        </Text>
      </View>

      <GiftedChat
        messages={messages}
        onSend={sendMessage}
        user={{ _id: currentUser._id, name: currentUser.name }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        onInputTextChanged={handleTyping}
        placeholder="Type a message..."
        alwaysShowSend
        // scrollToBottom
        renderUsernameOnMessage
        showUserAvatar={false}
        renderAvatar={renderAvatar}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  onlineText: {
    color: "#666",
    fontSize: 12,
  },
  inputToolbar: {
    backgroundColor: "white",
  },
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: {
    color: "#6646ee",
    paddingHorizontal: 15,
  },
});

export default GroupChatScreen;
