// app/(tabs)/profile/components/ReviewCard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Event } from "../constants/types";
import { styles } from "../styles/profileStyles";
import RatingStars from "./RatingStars";

interface ReviewCardProps {
  event: Event;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ event }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      {/* Compact Preview Card */}
      <TouchableOpacity
        style={styles.reviewCard}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.reviewHeader}>
          <View>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.organizer}>{event.organizer}</Text>
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.reviewDate}>{event.date}</Text>
            <RatingStars rating={event.rating} />
          </View>
        </View>
        <Text style={styles.reviewText} numberOfLines={2} ellipsizeMode="tail">
          {event.review}
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

            <Text style={modalStyles.modalTitle}>{event.title}</Text>
            <Text style={modalStyles.modalSubtitle}>{event.organizer}</Text>

            <View style={modalStyles.ratingContainer}>
              <RatingStars rating={event.rating} />
              <Text style={modalStyles.modalDate}>{event.date}</Text>
            </View>

            <Text style={modalStyles.modalReviewText}>{event.review}</Text>

            <View style={modalStyles.modalFooter}>
              <View style={modalStyles.likeContainer}>
                <MaterialIcons name="favorite" size={20} color="#EF4444" />
                <Text style={modalStyles.likeCount}>275 likes</Text>
              </View>
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
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
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
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  likeCount: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default ReviewCard;
