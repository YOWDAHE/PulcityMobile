import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { PubNubProvider } from "pubnub-react";
import pubnub from "@/utils/pubnub";
import ChatScreen from "@/app/pages/chatScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import GroupChatScreen from "@/app/pages/groupChatScreen";

const index = () => {
  return (
    <SafeAreaView style={styles.container}>
      <PubNubProvider client={pubnub}>
        <GroupChatScreen />
      </PubNubProvider>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
        flex: 1,
        backgroundColor: "#fff",
    paddingBottom: 100
    },
});
