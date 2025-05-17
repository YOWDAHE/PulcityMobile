import { View, FlatList, Pressable, Text, StyleSheet } from "react-native";
import chats from "@/assets/data/chats.json";
import ChatRow from "@/components/ChatRow";
import { defaultStyles } from "@/constants/Styles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const Page = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(tabs)/chat/${item.id}`)}>
            <ChatRow {...item} />
          </Pressable>
        )}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => (
          <View style={[defaultStyles.separator, { marginLeft: 90 }]} />
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>Messages</Text>
            <Pressable style={styles.newChatButton}>
              <Ionicons name="add" size={24} color={Colors.primary} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubbles-outline"
              size={48}
              color={Colors.gray}
            />
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  newChatButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
  },
});

export default Page;
