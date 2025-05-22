import { View, Text, ScrollView, FlatList, StyleSheet } from "react-native";
import chats from "@/assets/data/chats.json";
import ChatRow from "@/components/ChatRow";
import { defaultStyles } from "@/constants/Styles";
import { useCallback, useEffect, useState } from "react";
import { getCommunities, getCommunityById } from "@/actions/community.actions";
import { useFocusEffect } from "expo-router";
import { Community } from "@/models/community.model";

const Page = () => {
	const [groups, setGroups] = useState<Community[]>([]);
	const [losding, setLoading] = useState(false);
	const fetchCommunity = async () => {
		const groups = await getCommunities();
		if (groups == undefined) return;
		setGroups(groups);
		console.log("Groups: ", groups);
	};
	useFocusEffect(
		useCallback(() => {
			fetchCommunity();
		}, [])
	);
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Groups</Text>
			</View>
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
});

export default Page;
