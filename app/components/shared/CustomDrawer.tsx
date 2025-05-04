import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "expo-router";

function CustomDrawer() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/100" }}
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.userName}>{user?.name || "User Name"}</Text>
        <Text style={styles.userEmail}>
          {user?.email || "user@example.com"}
        </Text>
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Ionicons name="settings-outline" size={22} color="#666" />
          <Text style={styles.bottomButtonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color="#666" />
          <Text style={styles.bottomButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f4",
    alignItems: "center",
    marginTop: 50,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 12,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f4f4f4",
  },
  bottomButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  bottomButtonText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#666",
  },
});
export default CustomDrawer;
