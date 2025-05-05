import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { getTicketById } from "@/actions/ticket.actions";
import { Ticket } from "@/models/ticket.model";
import { useAuth } from "@/app/hooks/useAuth";

export default function TicketDetailsScreen() {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const { tokens } = useAuth();

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                if (!tokens?.access) {
                    throw new Error("Access token is missing");
                }

                const fetchedTicket = await getTicketById(1, tokens.access);
                setTicket(fetchedTicket);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTicket();
    }, [tokens]);

    if (isLoading) {
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
            <Text style={styles.title}>Ticket Details</Text>
            <Text>Ticket ID: {ticket?.id}</Text>
            <Text>Event ID: {ticket?.event}</Text>
            <Text>Name: {ticket?.name}</Text>
            <Text>Price: {ticket?.price}</Text>
            <Text>Valid From: {ticket?.valid_from}</Text>
            <Text>Valid Until: {ticket?.valid_until}</Text>
            <Text>Created At: {ticket?.created_at}</Text>
            <Text>Updated At: {ticket?.updated_at}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
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
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
    },
});
