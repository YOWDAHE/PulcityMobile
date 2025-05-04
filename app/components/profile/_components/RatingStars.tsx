// app/(tabs)/profile/components/RatingStars.tsx
import React from "react";
import { View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { styles } from "../styles/profileStyles";

interface RatingStarsProps {
  rating: number;
}

/**
 * Displays star ratings (1-5) with filled/unfilled stars
 */
const RatingStars: React.FC<RatingStarsProps> = ({ rating }) => (
  <View style={styles.ratingContainer}>
    {[1, 2, 3, 4, 5].map((star) => (
      <FontAwesome
        key={star}
        name={star <= rating ? "star" : "star-o"}
        size={16}
        color={star <= rating ? "#FFD700" : "#E5E7EB"}
      />
    ))}
  </View>
);

export default RatingStars;
