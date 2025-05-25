import React, { useCallback } from "react";
import {
	View,
	StyleSheet,
	RefreshControl,
	ActivityIndicator,
} from "react-native";
import { savedEvents } from "@/app/components/profile/constants/mockData";
import SavedEventCard from "@/app/components/profile/_components/SavedEventCard";
import EmptyState from "@/app/components/shared/EmptyState";
import EventCard from "@/app/components/EventCard";
import { useFocusEffect } from "expo-router";
import { fetchSavedEvent } from "@/actions/user.actions";
import { Event } from "@/models/event.model";
import { ScrollView } from "react-native-gesture-handler";
import Loading from "@/app/components/Loading";

export default function SavedTab() {
	const [loading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState("");
	const [savedEvents, setSavedEvents] = React.useState<Event[]>([]);

	async function getBookmarks() {
		try {
			setIsLoading(true);

			const events = await fetchSavedEvent();
			setSavedEvents(events);
			setError("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	}
	useFocusEffect(
		useCallback(() => {
			getBookmarks();
		}, [])
	);
	const onRefresh = async () => {
		getBookmarks();
	};

	if (loading) return <Loading />;
	return (
		<ScrollView
			style={styles.container}
			refreshControl={
				<RefreshControl refreshing={loading} onRefresh={onRefresh} />
			}
		>
			{savedEvents.length > 0 &&
				savedEvents.map((event) => <EventCard key={event.id} event={event} />)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 16,
		backgroundColor: "white",
	},
});
