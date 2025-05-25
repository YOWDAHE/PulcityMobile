import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
    Text,
    RefreshControl,
    Image,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventCard from "@/app/components/EventCard";
import { getEvents, getFollowedEvents, getPopularEvents, getPublicPopularEvents, getUpcomingEvents } from "@/actions/event.actions";
import { Event } from "@/models/event.model";
import { useAuth } from "@/app/hooks/useAuth";
import { Header } from "@/app/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";
import Loading from "@/app/components/Loading";
import { useRouter } from "expo-router"; // Add this import
import PublicEventCard from "../components/PublicEventCard";

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
    const router = useRouter();

    const fetchEvents = async (type: FeedType = feedType) => {
        try {
            setIsLoading(true);
            const res = await getPublicPopularEvents();
            
            setEvents(res);
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
            <Loading />
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
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pulcity</Text>
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => router.push("/(auth)/login")}
                >
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={!events?.length ? { flex: 1 } : undefined}
            >
                {events?.length ? (
                    events.map((event) => (
                        <PublicEventCard key={event.id} event={event} />
                    )).reverse()
                ) : (
                    <EmptyState type='all' />
                )}
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f2f2f2",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#222",
        fontFamily: "poppinsBold",
    },
    loginButton: {
        backgroundColor: "#00b4dd",
        paddingHorizontal: 18,
        paddingVertical: 7,
        borderRadius: 8,
    },
    loginButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        fontFamily: "poppinsMedium",
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
