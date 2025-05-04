// app/(tabs)/profile/components/ProfileHeader.tsx
import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	ImageSourcePropType,
} from "react-native";
import { styles } from "../styles/profileStyles";
import { useAuth } from "@/app/hooks/useAuth";

interface ProfileHeaderProps {
	data: {
		name: string;
		// image: ImageSourcePropType;
	};
}

/**
 * Displays the user's profile picture, name, and edit button
 */
const ProfileHeader: React.FC<ProfileHeaderProps> = ({ data }) => {
  const { logout } = useAuth();
	return (
		<View style={styles.profileHeader}>
			{/* <Image source={data.image} style={styles.profileImage} /> */}
			<Text style={styles.profileName}>{data.name}</Text>
			<TouchableOpacity style={styles.editButton} onPress={logout}>
				<Text style={styles.editButtonText}>Log Out</Text>
			</TouchableOpacity>
		</View>
	);
};

export default ProfileHeader;
