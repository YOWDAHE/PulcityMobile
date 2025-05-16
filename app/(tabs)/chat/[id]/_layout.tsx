import { View, Text, Image } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { PubNubProvider } from "pubnub-react";
import pubnub from "@/utils/pubnub";
import { useNavigation } from "@react-navigation/native";
import { getEventById } from "@/actions/event.actions";

export default function _layout() {
	const params = useLocalSearchParams();
	const { id } = params;

	// Access navigation object
	const navigation = useNavigation();

	useEffect(() => {
		const getEvent = async () => {
			if (id) {
				try {
					const res = await getEventById(Number(id));
					
					navigation.setOptions({
						headerTitle: () => (
							<View
								style={{
									flexDirection: "row",
									width: 220,
									alignItems: "center",
									gap: 10,
									paddingBottom: 4,
								}}
							>
								<Image
									source={{
										uri: res.organizer.profile.logo_url,
									}}
									style={{ width: 40, height: 40, borderRadius: 50 }}
								/>
								<Text style={{ fontSize: 14, fontWeight: "500" }}>{res.title}</Text>
							</View>
						),
					});
				} catch (error) {
					console.error("Error fetching event:", error);
				}
			}
		};

		getEvent();
	}, [id, navigation]);
	return (
		<PubNubProvider client={pubnub}>
			<Stack screenOptions={{ headerShown: false }} />
		</PubNubProvider>
	);
}
