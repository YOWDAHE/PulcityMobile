import React, { useEffect, useState, useRef } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	TouchableOpacity,
	FlatList,
	ScrollView,
	Dimensions,
	RefreshControl,
	BackHandler,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getOrganizerPageDetail } from "@/actions/organizer.actions";
import { Event } from "@/models/event.model";
import { OrganizerPageInterface } from "@/models/organizer.model";
import EventCard from "@/app/components/EventCard";
import { Ionicons } from "@expo/vector-icons";

const ProfilePage = () => {
	const { id } = useLocalSearchParams();
	const [details, setDetails] = useState<OrganizerPageInterface>();
	const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(
		null
	);
	const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
	const [loading, setLoading] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);

	// Store dynamic heights of each event card
	const [eventHeights, setEventHeights] = useState<number[]>([]);

	const fetchEvents = async () => {
		setLoading(true);
		const res = await getOrganizerPageDetail(Number(id));
		console.log("The detail: ", res);
		setDetails(res);
		setLoading(false);
	};

	useEffect(() => {
		fetchEvents();
		const updateWidth = () => setScreenWidth(Dimensions.get("window").width);
		Dimensions.addEventListener("change", updateWidth);
	}, []);

	useEffect(() => {
		const backAction = () => {
			// console.log(selectedEventIndex);
			// if (selectedEventIndex == null) {
			// 	setSelectedEventIndex(null);
			// } else {
			// 	console.log("Going back ?");
				router.push("/home");
			// }
			return true;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);
		return () => backHandler.remove();
	}, []);

	const handleImagePress = (index: number) => {
		setSelectedEventIndex(index);
	};

	const onItemLayout = (index: number) => (event: any) => {
		const { height } = event.nativeEvent.layout;
		setEventHeights((prev) => {
			const newHeights = [...prev];
			newHeights[index] = height;
			return newHeights;
		});
	};

	useEffect(() => {
		if (
			selectedEventIndex !== null &&
			eventHeights.length > selectedEventIndex &&
			eventHeights.slice(0, selectedEventIndex + 1).every((h) => h !== undefined)
		) {
			// const margin = 16;
			const offset = eventHeights
				.slice(0, selectedEventIndex)
				.reduce((sum, h) => sum + h, 0);

			scrollViewRef.current?.scrollTo({ y: offset, animated: false });
		}
	}, [eventHeights, selectedEventIndex]);

	if (details == undefined || loading)
		return (
			<ScrollView
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={fetchEvents} />
				}
			>
				<Text>Loading...</Text>
			</ScrollView>
		);

	if (selectedEventIndex !== null) {
		return (
			<View style={{ position: "relative" }}>
				<View
					style={{
						backgroundColor: "white",
						flexDirection: "row",
						gap: 20,
						paddingHorizontal: 10,
						paddingVertical: 10,
						alignItems: "center",
						position: "sticky",
					}}
				>
						<Ionicons name="arrow-back" size={25} onPress={()=>setSelectedEventIndex(null)}/>
					<Text style={{ fontSize: 20 }}>Posts</Text>
				</View>
				<ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
					{details.events.map((event, index) => (
						<View
							key={event.id}
							onLayout={onItemLayout(index)}
							// style={{ marginBottom: 16 }}
						>
							<EventCard event={event} />
						</View>
					))}
				</ScrollView>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Profile Header */}
			<View style={styles.profileHeader}>
				<Image
					source={{ uri: details.organization.profile.logo_url }}
					style={styles.profileImage}
				/>
				<View style={styles.profileInfo}>
					<Text style={styles.nameText}>{details.organization.profile.name}</Text>
					<Text style={styles.statsText}>
						{details.organization.profile.description}
					</Text>
					<View style={{ flexDirection: "row", gap: 20 }}>
						<Text style={styles.statsText}>{details.eventCount} events</Text>
						<Text style={styles.statsText}>{details.followerCount} followers</Text>
					</View>
				</View>
			</View>

			<View></View>

			{/* Event Grid */}
			<FlatList
				data={details.events}
				renderItem={({ item, index }) => (
					<TouchableOpacity onPress={() => handleImagePress(index)}>
						<Image
							source={{ uri: item.cover_image_url[0] }}
							style={styles.eventImage}
						/>
					</TouchableOpacity>
				)}
				keyExtractor={(item) => item.id.toString()}
				horizontal={false}
				numColumns={3}
				contentContainerStyle={styles.gridContainer}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	profileHeader: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	profileImage: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginRight: 16,
	},
	profileInfo: {
		flex: 1,
	},
	nameText: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 4,
	},
	statsText: {
		color: "#666",
		marginVertical: 2,
	},
	gridContainer: {
		padding: 2,
	},
	eventImage: {
		width: Dimensions.get("window").width / 3 - 4,
		height: Dimensions.get("window").width / 3 - 4,
		margin: 2,
	},
});

export default ProfilePage;
