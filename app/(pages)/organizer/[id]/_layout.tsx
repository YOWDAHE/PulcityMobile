import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Organization } from "@/assets/schema";
import { getOrganizerById } from "@/actions/organizer.actions";
import { SafeAreaView } from "react-native-safe-area-context";

export default function _layout() {
	const navigation = useNavigation();
	const { id } = useLocalSearchParams();
	const [organizer, setOrganizer] = useState<Organization>();
	const getOrganizer = async () => {
		const response = await getOrganizerById(Number(id));
		setOrganizer(response);
	};
	useEffect(() => {
		getOrganizer();
	}, []);
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
			<Stack
				screenOptions={{
					headerShown: false,
					// header: (props) => (
					// 	<View
					// 		style={{
					// 			flexDirection: "row",
					// 			alignItems: "center",
					// 			justifyContent: "flex-start",
					// 			backgroundColor: "#fff",
					// 			height: 60,
					// 			paddingHorizontal: 16,
					// 			elevation: 2,
					// 		}}
					// 	>
					// 		<TouchableOpacity
					// 			onPress={() => navigation.goBack()}
					// 			style={{ marginRight: 16 }}
					// 			hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					// 		>
					// 			<Ionicons name="arrow-back" size={24} color="black" />
					// 		</TouchableOpacity>
					//         <Text style={{ fontSize: 18, fontWeight: "bold" }}>{ organizer?.contact_email }</Text>
					// 	</View>
					// ),
				}}
			/>
		</SafeAreaView>
	);
}
