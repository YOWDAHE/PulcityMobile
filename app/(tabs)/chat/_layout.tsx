import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, View, Text, Image } from "react-native";

const Layout = () => {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Messages",
          headerLargeTitle: true,
          headerTransparent: false,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/(tabs)/chat/new")}
              style={{ marginRight: 16 }}
            >
              <Ionicons
                name="create-outline"
                size={24}
                color={Colors.primary}
              />
            </Pressable>
          ),
          headerSearchBarOptions: {
            placeholder: "Search messages",
            hideWhenScrolling: false,
          },
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: "",
          headerBackTitleVisible: false,
          headerTitle: ({ children }) => (
            <View style={styles.headerTitleContainer}>
              <Image
                source={{
                  uri: "https://pbs.twimg.com/profile_images/1564203599747600385/f6Lvcpcu_400x400.jpg",
                }}
                style={styles.headerImage}
              />
              <View>
                <Text style={styles.headerTitle}>{children || "Chat"}</Text>
                <Text style={styles.headerSubtitle}>online</Text>
              </View>
            </View>
          ),
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerRight: () => (
            <Pressable style={{ marginRight: 16 }}>
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={Colors.primary}
              />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
};

const styles = {
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.gray,
  },
};

export default Layout;
