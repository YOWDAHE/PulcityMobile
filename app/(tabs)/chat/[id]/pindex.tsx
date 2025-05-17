import { StyleSheet, View } from "react-native";
import { PubNubProvider } from "pubnub-react";
import pubnub from "@/utils/pubnub";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatScreen from "@/app/pages/chatScreen";
import { useLocalSearchParams } from "expo-router";

const ChatPage = () => {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <PubNubProvider client={pubnub}>
        <ChatScreen chatId={id as string} />
      </PubNubProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default ChatPage;
