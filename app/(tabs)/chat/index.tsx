import { View, Text, ScrollView, FlatList, StyleSheet } from "react-native";
import chats from "@/assets/data/chats.json";
import ChatRow from "@/components/ChatRow";
import { defaultStyles } from "@/constants/Styles";
import { useCallback, useEffect, useState } from "react";
import { getCommunities, getCommunityById } from "@/actions/community.actions";
import { useFocusEffect } from "expo-router";
import { Community } from "@/models/community.model";
import { Ionicons } from "@expo/vector-icons";
import Loading from "@/app/components/Loading";

// Empty state component
const EmptyState = () => (
	<View style={styles.emptyStateContainer}>
		<Ionicons name="chatbubble-outline" size={64} color="#ccc" />
		<Text style={styles.emptyStateTitle}>No Groups Found</Text>
		<Text style={styles.emptyStateMessage}>
			Register for an event to join groups
		</Text>
	</View>
);

const Page = () => {
	const [groups, setGroups] = useState<Community[]>([]);
	const [loading, setLoading] = useState(false);
	const fetchCommunity = async () => {
		setLoading(true);
		const groups = await getCommunities();
		const threeDaysAgo = new Date();
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
		const filteredGroups =
			groups?.filter((group) => new Date(group.event.end_date) > threeDaysAgo) ??
			[];
		setGroups(groups!);
		setLoading(false);
	};
	useFocusEffect(
		useCallback(() => {
			fetchCommunity();
		}, [])
	);
	if(loading) return <Loading />;
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Groups</Text>
			</View>

			{groups.length === 0 ? (
				<EmptyState />
			) : (
				<FlatList
					data={groups}
					renderItem={({ item }) => <ChatRow {...item} />}
					keyExtractor={(item) => item.id.toString()}
					ItemSeparatorComponent={() => (
						<View style={[defaultStyles.separator, { marginLeft: 90 }]} />
					)}
					contentContainerStyle={styles.listContent}
					style={styles.list}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	header: {
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 8,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "bold",
	},
	list: {
		flex: 1,
		backgroundColor: "#fff",
	},
	listContent: {
		paddingTop: 8,
	},
	emptyStateContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	emptyStateTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginTop: 16,
		marginBottom: 8,
	},
	emptyStateMessage: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
	},
});

export default Page;
