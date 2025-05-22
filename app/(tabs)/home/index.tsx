import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
    Text,
    RefreshControl,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventCard from "@/app/components/EventCard";
import { getEvents, getFollowedEvents, getUpcomingEvents } from "@/actions/event.actions";
import { Event } from "@/models/event.model";
import { useAuth } from "@/app/hooks/useAuth";
import { Header } from "@/app/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";

type FeedType = 'all' | 'following' | 'upcoming';

const EmptyState = ({ type }: { type: FeedType }) => {
    const messages = {
        all: {
            title: "No Events Found",
            message: "There are no events available at the moment.",
            icon: "calendar" as const
        },
        following: {
            title: "No Events From Following",
            message: "Events from organizers you follow will appear here.",
            icon: "people" as const
        },
        upcoming: {
            title: "No Upcoming Events",
            message: "You don't have any upcoming events.",
            icon: "time" as const
        }
    };

    const content = messages[type];

    return (
        <View style={styles.emptyStateContainer}>
            <Ionicons name={content.icon} size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>{content.title}</Text>
            <Text style={styles.emptyStateMessage}>{content.message}</Text>
        </View>
    );
};

export default function HomeScreen() {
    const [events, setEvents] = useState<Event[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [feedType, setFeedType] = useState<FeedType>('all');
    const { from } = useLocalSearchParams<{ from: string }>();

    const fetchEvents = async (type: FeedType = feedType) => {
        try {
            setIsLoading(true);
            let fetchedEvents: Event[];
            
            switch (type) {
                case 'following':
                    fetchedEvents = await getFollowedEvents();
                    break;
                case 'upcoming':
                    fetchedEvents = await getUpcomingEvents();
                    break;
                default:
                    fetchedEvents = await getEvents();
                    fetchedEvents = fetchedEvents.filter((event) => event.id != 1 && event.id != 2);
                    break;
            }
            
            // Filter out past events
            const currentDate = new Date();
            fetchedEvents = fetchedEvents.filter((event) => {
                if (!event.start_date) return true;
                const eventDate = new Date(event.start_date);
                return eventDate >= currentDate;
            });
            
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
        fetchEvents(feedType);
    }, [feedType]);

    // Add new useEffect to handle login/register redirects
    useEffect(() => {
        if (from === 'login' || from === 'register') {
            fetchEvents(feedType);
        }
    }, [from]);

    const onRefresh = async () => {
        fetchEvents();
    };

    if (isLoading) {
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
        <View style={styles.container}>
            <StatusBar style="dark" />
            <Header feedType={feedType} onFeedTypeChange={setFeedType} />
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={!events?.length ? { flex: 1 } : undefined}
            >
                {events?.length ? (
                    events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    )).reverse()
                ) : (
                    <EmptyState type={feedType} />
                )}
                <View style={{ marginBottom: 60 }} />
            </ScrollView>
        </View>
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
        fontFamily: "poppinsMedium",
    },
    emptyStateMessage: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        fontFamily: "poppins",
    },
});
