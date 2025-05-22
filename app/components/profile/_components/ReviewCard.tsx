// app/(tabs)/profile/components/ReviewCard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Event } from "../constants/types";
import { styles } from "../styles/profileStyles";
import RatingStars from "./RatingStars";
import { router } from "expo-router";

// Simple date formatter function
const formatEventDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

interface ReviewCardProps {
  event: Event;
  // New properties to match the API response
  rating?: {
    id: number;
    value: number;
    comment: string;
    created_at: string;
    updated_at: string;
  };
  eventDetails?: {
    id: number;
    title: string;
    cover_image_url: string[];
    organizer: {
      profile: {
        name: string;
        logo_url: string;
      };
    };
    start_date: string;
    attendee_count: number;
    liked: boolean;
    likes_count: number;
  };
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  event, 
  rating,
  eventDetails
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // If we have detailed data from the API, use that instead of the event prop
  const title = eventDetails?.title || event.title;
  const organizer = eventDetails?.organizer?.profile?.name || event.organizer;
  const ratingValue = rating?.value || event.rating || 0;
  const reviewComment = rating?.comment || event.review || "";
  const eventDate = eventDetails?.start_date ? formatEventDate(new Date(eventDetails.start_date)) : event.date;
  const attendeeCount = eventDetails?.attendee_count || 0;
  const likesCount = eventDetails?.likes_count || 0;
  const coverImage = eventDetails?.cover_image_url?.[0] || null;
  const eventId = eventDetails?.id || (event.id ? parseInt(event.id) : 0);

  const handleViewEvent = () => {
    if (eventId) {
      router.push({
        pathname: "/(pages)/event/[id]",
        params: { id: eventId.toString() }
      });
    }
  };

  return (
    <>
      {/* Compact Preview Card */}
      <TouchableOpacity
        style={styles.reviewCard}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.reviewHeader}>
          <View>
            <Text style={styles.eventTitle}>{title}</Text>
            <Text style={styles.organizer}>{organizer}</Text>
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.reviewDate}>{eventDate}</Text>
            <RatingStars rating={ratingValue} />
          </View>
        </View>
        <Text style={styles.reviewText} numberOfLines={2} ellipsizeMode="tail">
          {reviewComment}
        </Text>
      </TouchableOpacity>

      {/* Detailed Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <TouchableOpacity
              style={modalStyles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            {coverImage && (
              <Image 
                source={{ uri: coverImage }} 
                style={modalStyles.coverImage}
                resizeMode="cover"
              />
            )}

            <Text style={modalStyles.modalTitle}>{title}</Text>
            <Text style={modalStyles.modalSubtitle}>{organizer}</Text>

            <View style={modalStyles.ratingContainer}>
              <RatingStars rating={ratingValue} />
              <Text style={modalStyles.modalDate}>{eventDate}</Text>
            </View>

            <Text style={modalStyles.modalReviewText}>{reviewComment}</Text>

            <View style={modalStyles.modalFooter}>
              <View style={modalStyles.statsContainer}>
                <View style={modalStyles.statItem}>
                  <MaterialIcons name="favorite" size={20} color="#EF4444" />
                  <Text style={modalStyles.statText}>{likesCount} likes</Text>
                </View>
                
                <View style={modalStyles.statItem}>
                  <MaterialIcons name="people" size={20} color="#6B7280" />
                  <Text style={modalStyles.statText}>{attendeeCount} attendees</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={modalStyles.viewEventButton}
                onPress={handleViewEvent}
              >
                <Text style={modalStyles.viewEventText}>View Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Modal-specific styles
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 8,
    zIndex: 10,
  },
  coverImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  modalDate: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  modalReviewText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 24,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: "#6B7280",
  },
  viewEventButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  viewEventText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default ReviewCard;
