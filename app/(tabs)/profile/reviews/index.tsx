import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { events } from "@/app/components/profile/constants/mockData";
import ReviewCard from "@/app/components/profile/_components/ReviewCard";

export default function ReviewsTab() {
    return (
        <View style={styles.container}>
            {events.map((event) => (
                <ReviewCard key={event.id} event={event} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "white",
    },
});