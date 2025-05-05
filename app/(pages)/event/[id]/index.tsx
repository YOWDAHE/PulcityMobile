import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Event } from "@/models/event.model";
import { useAuth } from "@/app/hooks/useAuth";
import { getEventById } from "@/actions/event.actions";
import { TiptapRenderer } from "@/components/htmlRenderer";

interface EventPageProps {
  event: Event;
}

const EventPage = () => {
  const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const { tokens } = useAuth();
    const { id } = useLocalSearchParams();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                if (!tokens?.access) {
                    throw new Error("Access token is required to fetch the event");
                }

                if (!id) {
                    throw new Error("Event ID is missing in the route parameters");
                }

                setIsLoading(true);
                const fetchedEvent = await getEventById(Number(id), tokens.access);
                setEvent(fetchedEvent);
                setError("");
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [id, tokens]);

    if (isLoading || !event) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Image source={{ uri: event.cover_image_url }} style={styles.image} />
          <View style={styles.heroInformation}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={{ display: "flex", gap: 10, flexDirection: "row" }}>
              <View style={styles.infoTextContainer}>
                <Ionicons name="calendar" color="white" />
                <Text style={styles.infoText}>
                  {new Date(event.start_date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoTextContainer}>
                <Ionicons name="time-outline" color="white" />
                <Text style={styles.infoText}>
                  {new Date(event.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <View style={styles.infoTextContainer}>
                <Ionicons name="location-outline" color="white" />
                <Text style={styles.infoText}>{event.location}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.about}>About Event</Text>
          <TiptapRenderer htmlContent={event.description} />
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/ticket/1`)}
        // onPress={() => router.push(`/ticket/${event.id}`)}
      >
        <Text style={styles.buttonText}>Buy Tickets</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	scrollContent: {
		paddingBottom: 80,
	},
	image: {
		width: "100%",
		height: 350,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		borderBottomRightRadius: 5,
		borderBottomLeftRadius: 5,
	},
	infoContainer: {
		paddingHorizontal: 16,
		marginTop: 8,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
		paddingBottom: 8,
	},
	infoText: {
		fontSize: 12,
		color: "white",
	},
	infoTextContainer: {
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
	},
	about: {
		fontWeight: "bold",
		marginTop: 16,
		marginBottom: 10,
	},
	description: {
		marginTop: 8,
	},
	whoIsComing: {
		fontWeight: "bold",
		marginTop: 28,
		marginBottom: 10,
	},
	guests: {
		marginTop: 8,
	},
	button: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "#00b4dd",
		padding: 16,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	hero: {
		position: "relative",
		paddingHorizontal: 10,
		borderRadius: 10,
	},
	heroInformation: {
		position: "absolute",
		bottom: 0,
		padding: 20,
		paddingHorizontal: 20,
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

export default EventPage;
