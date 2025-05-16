import { View, Text, ScrollView, FlatList } from "react-native";
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
		// <ScrollView
		// 	contentInsetAdjustmentBehavior="automatic"
		// 	contentContainerStyle={{
		// 		paddingBottom: 40,
		// 		flex: 1,
		// 		backgroundColor: "#fff",
		// 	}}
		// >
		<View style={{ flex: 1 }}>
			<FlatList
				data={groups}
				renderItem={({ item }) => <ChatRow {...item} />}
				keyExtractor={(item) => item.id.toString()}
				ItemSeparatorComponent={() => (
					<View style={[defaultStyles.separator, { marginLeft: 90 }]} />
				)}
				scrollEnabled={true}
				style={{
					paddingTop: 60,
					flex: 1,
					backgroundColor: "#fff",
				}}
			/>
		</View>
	);
};
export default Page;
