// app/(tabs)/profile/components/EventCard.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Event } from "../constants/types";
import { FontAwesome } from "@expo/vector-icons";
import { styles } from "../styles/profileStyles";

interface EventCardProps {
  event: Event;
}

/**
 * Displays basic event information in a card format
 */
const EventCard: React.FC<EventCardProps> = ({ event }) => (
  <View style={styles.eventCard}>
    <View style={eventStyles.rowTop}>
      <Image
        source={event.image || require("../../../../assets/images/icon.png")}
        style={eventStyles.avatar}
      />
      <View style={eventStyles.eventDetails}>
        <Text style={eventStyles.eventName}>{event.title}</Text>
        <Text style={eventStyles.venue}>{event.venue}</Text>
        <View style={eventStyles.peopleRow}>
          {event.avatars?.map((avatar, index) => (
            <Image key={index} source={avatar} style={eventStyles.miniAvatar} />
          ))}
          <Text style={eventStyles.wentText}>+ {event.count} went</Text>
        </View>
        <View style={eventStyles.ratingRow}>
          {[...Array(5)].map((_, i) => (
            <FontAwesome
              key={i}
              name="star"
              size={14}
              color={i < (event.rating ?? 0) ? "#FBBF24" : "#D1D5DB"}
            />
          ))}
          <Text style={eventStyles.ratingText}>
            by {event.reviewedBy} people
          </Text>
        </View>
      </View>
      <View style={eventStyles.dateTime}>
        <Text style={eventStyles.date}>{event.date}</Text>
        <Text style={eventStyles.time}>{event.time}</Text>
      </View>
    </View>
  </View>
);

export default EventCard; // Add this line

const eventStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  venue: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  peopleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: -6,
    borderWidth: 1,
    borderColor: "#fff",
  },
  wentText: {
    marginLeft: 10,
    fontSize: 12,
    color: "#374151",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#6B7280",
  },
  dateTime: {
    alignItems: "flex-end",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  time: {
    fontSize: 12,
    color: "#6B7280",
  },
});
