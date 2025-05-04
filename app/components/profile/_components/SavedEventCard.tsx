// app/(tabs)/profile/components/SavedEventCard.tsx
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { SavedEvent } from "../constants/types";
import { Ionicons } from "@expo/vector-icons";

interface SavedEventCardProps {
  event: SavedEvent;
}

const SavedEventCard: React.FC<SavedEventCardProps> = ({ event }) => {
  return (
    <View style={styles.container}>
      {/* Header with organizer info */}
      <ImageBackground
        source={event.coverImage}
        resizeMode="cover"
        style={styles.imageBackground}
      >
        <View style={styles.insideImage}>
          <View style={styles.header}>
            <View style={styles.organizerInfo}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ flexDirection: "row", borderRadius: 20 }}
              >
                <Image
                  source={event.organiserImage}
                  style={styles.organizerImage}
                />
                <Text style={styles.organizerName}>{event.organizer}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionContainer}>
              <TouchableOpacity>
                <Ionicons
                  name="bookmark"
                  size={25}
                  color="white"
                  style={{ paddingLeft: 0, marginStart: 10 }}
                />
              </TouchableOpacity>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="white"
                style={{ paddingLeft: 0, marginStart: 10 }}
              />
            </View>
          </View>
          <View style={styles.footerContainer}>
            <View style={styles.dateAttendees}>
              <Text style={styles.dateText}> on {event.date}</Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={15} color="white" />
                <Text style={styles.statText}>{event.likesCount}</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="bookmark-outline" size={15} color="white" />
                <Text style={styles.statText}>{event.attendees}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble" size={15} color="#F3F4F6" />
                <Text style={styles.statText}>{event.commentsCount}</Text>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Event date and attendees */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description}>{event.description}</Text>
        <Text style={styles.descriptionDateText}>{event.date}</Text>

        <TouchableOpacity style={styles.ticketButton}>
          <Text style={styles.ticketButtonText}>Get Your Tickets here</Text>
          <Ionicons name="chevron-forward" color={"#3B82F6"} size={16} />
        </TouchableOpacity>

        <Text style={styles.hashtags}>{event.hashtags}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  title: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: "#374151",
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  hashtags: {
    color: "#60A5FA",
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  organizerImage: {
    width: 30,
    height: 30,
    borderRadius: 30,
    marginRight: 6,
  },

  organizerInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsContainer: {
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  statItem: {
    margin: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  statText: {
    fontSize: 14,
    color: "#ffffff",
  },
  organizerName: {
    fontSize: 14,
    fontWeight: "600",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#F3F4F6",
    color: "#111827",
  },
  followButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
  },
  dateAttendees: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateText: {
    width: "100%",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
    fontWeight: "500",
    textAlign: "left",
  },
  descriptionDateText: {
    width: "100%",
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
    textAlign: "left",
  },
  attendeesText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
    textAlign: "right",
  },

  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  ticketButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    textAlign: "left",
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3B82F6",
    marginTop: 8,
  },
  ticketButtonText: {
    color: "#3B82F6",
    fontWeight: "500",
  },
  hashtagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  hashtag: {
    fontSize: 12,
    color: "#3B82F6",
    marginRight: 8,
  },
  imageBackground: {
    flex: 1,
    width: "100%",
    height: 400,
    resizeMode: "cover",
    borderRadius: 10,
    overflow: "hidden",
  },
  insideImage: {
    padding: 20,
    height: "100%",
    justifyContent: "space-between",
  },
});

export default SavedEventCard;
