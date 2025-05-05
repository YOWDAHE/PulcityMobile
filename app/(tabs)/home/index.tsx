import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
    Text,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventCard from "@/app/components/EventCard";
import { getEvents } from "@/actions/event.actions";
import { Event } from "@/models/event.model";
import { useAuth } from "@/app/hooks/useAuth";

export default function HomeScreen() {
    const [events, setEvents] = useState<Event[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { tokens, isLoading: isAuthLoading, refreshTokens } = useAuth();

    const fetchEvents = async () => {
        try {
            setIsLoading(true);

            if (!tokens || !tokens.access) {
                throw new Error("Access token is required to fetch events");
            }

            const fetchedEvents = await getEvents(tokens.access);
            setEvents(fetchedEvents);
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (!isAuthLoading && tokens && tokens.access) {
            fetchEvents();
        }
    }, [tokens, isAuthLoading]);

	const onRefresh = async () => {
		setIsRefreshing(true);
		if (error != "") {	
			await refreshTokens().then(fetchEvents);
		} else {
			fetchEvents();
		}
    };

    if (isAuthLoading || isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (error) {
		return (
			<ScrollView
				style={styles.scrollView}
				refreshControl={
					<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
				}
			>
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			</ScrollView>
		);
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
            >
                {events?.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
                <View style={{ marginBottom: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    errorText: {
        color: "red",
        fontSize: 16,
        textAlign: "center",
    },
});
