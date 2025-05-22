import React, { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	ActivityIndicator,
	Image,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { fetchFollowingOrganizers } from "@/actions/user.actions";
import { useAuth } from "@/app/hooks/useAuth";
import { Organizer } from "@/models/organizer.model";
import EmptyState from "@/app/components/shared/EmptyState";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { unfollowOrganizer } from "@/actions/organizer.actions";
import { ScrollView } from "react-native-gesture-handler";
import { RefreshControl } from "react-native";
import { router } from "expo-router";

export default function FollowingTab() {
	const { tokens } = useAuth();
	const [followingOrganizers, setFollowingOrganizers] = useState<Organizer[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showActions, setActionsShown] = useState(false);

	const fetchFollowing = async () => {
		try {
			setIsLoading(true);
			const organizers = await fetchFollowingOrganizers();
			setFollowingOrganizers(organizers);
			setError("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};
	useFocusEffect(
		React.useCallback(() => {
			fetchFollowing();
		}, [])
	);

	const handleUnfollow = async (id:number) => {
		try {
			setIsLoading(true);
            await unfollowOrganizer(id);
            fetchFollowing();
			setActionsShown(false);
		} catch (error) {
			console.error("Failed to follow organizer:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ScrollView refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchFollowing} />} style={styles.container}>
			{isLoading ? (
				<ActivityIndicator size="large" color="#3B82F6" />
			) : error ? (
				<Text style={styles.errorText}>{error}</Text>
			) : followingOrganizers.length > 0 ? (
				followingOrganizers.map((organizer) => (
					<View key={organizer.id} style={styles.organizerCard}>
						<Image
							source={{ uri: organizer.profile.logo_url }}
							style={styles.organizerImage}
						/>
						<Text style={styles.organizerName}>{organizer.profile.name}</Text>
						<View style={{ position: "relative" }}>
							<Ionicons
								size={15}
								name="ellipsis-vertical"
								onPress={() => setActionsShown((prev) => !prev)}
							/>
							{showActions && (
								<View
									style={{
										position: "absolute",
										top: 30,
										right: 0,
										width: 120,
										zIndex: 10,
										backgroundColor: "white",
										padding: 10,
										borderRadius: 4,
										// gap: 8,
										borderColor: "lightgray",
										borderWidth: 1,
									}}
								>
									<TouchableOpacity onPress={() => {
										router.push(`/organizer/${organizer.id}`)
										setActionsShown(false)
									}}>
										<Text>View Page</Text>
									</TouchableOpacity>
									<View
										style={{
											height: 1,
											backgroundColor: "lightgray",
											marginVertical: 10,
										}}
									/>
									<TouchableOpacity
										style={{ borderColor: "black" }}
										onPress={()=>handleUnfollow(organizer.id)}
									>
										<Text>Unfollow</Text>
									</TouchableOpacity>
								</View>
							)}
						</View>
					</View>
				))
			) : (
				<EmptyState
					icon="person-outline"
					title="No Following"
					subtitle="You are not following any organizers yet."
				/>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "white",
	},
	organizerCard: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	organizerImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
	},
	organizerName: {
		fontSize: 16,
        fontWeight: "500",
        flex: 1
	},
	errorText: {
		color: "red",
		textAlign: "center",
		marginVertical: 16,
	},
});
