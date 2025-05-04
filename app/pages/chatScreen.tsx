import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { usePubNub } from 'pubnub-react';

// Define the type for a message
interface Message {
  content: string;
  sender: string;
  timestamp: number;
}

const ChatScreen = ({ route }: any) => {
  const pubnub = usePubNub();
  const [messages, setMessages] = useState<Message[]>([]); // Explicitly define the type
  const [newMessage, setNewMessage] = useState('');
  const groupId = 'group_123';

  // Subscribe to the group channel on mount
  useEffect(() => {
    pubnub.subscribe({ channels: [groupId] });

    // Cleanup on unmount
    return () => pubnub.unsubscribeAll();
  }, []);

  // Listen for incoming messages
  useEffect(() => {
    const listener = {
      message: (msgEvent: { message: Message }) => {
        setMessages((prev: Message[]) => [...prev, msgEvent.message]);
      },
    };

    pubnub.addListener(listener);
    return () => pubnub.removeListener(listener);
  }, [pubnub]);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      content: newMessage,
      sender: pubnub.getUUID(),
      timestamp: Date.now(),
    };

    // Publish to PubNub
    await pubnub.publish({
      channel: groupId,
      message,
    });

    // Save to YOUR DATABASE here (call your API)
    // Example: await saveMessageToDB(groupId, message);

    setNewMessage('');
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={{ padding: 8 }}>
            <Text>
              {item.sender}: {item.content}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.timestamp.toString()}
      />
      <TextInput
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Type a message"
        style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
};

export default ChatScreen;