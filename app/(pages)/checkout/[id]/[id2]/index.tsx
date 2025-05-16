import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	ScrollView,
	Touchable,
	TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import HeaderComponent from "@/components/HeaderComponent";
import { StatusBar } from "expo-status-bar";
import { getBoughtTicketsByEventId } from "@/actions/ticket.actions";
import { useAuth } from "@/app/hooks/useAuth";
import { Ticket } from "@/models/ticket.model";
import { Event } from "@/models/event.model";
import { getEventById } from "@/actions/event.actions";

const CheckoutPage = () => {
	const router = useRouter();
	const { id, id2 } = useLocalSearchParams();
	console.log("ID:", id, "ID2:", id2);
	const { tokens } = useAuth();

	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [event, setEvent] = useState<Event>();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchTickets = async () => {
			try {
				if (!tokens?.access) {
					console.log("Access token is missing in the ticket page");
					return;
				}

				if (!id) {
					throw new Error("Event ID is missing in the route parameters.");
				}

				const fetchedTickets = await getBoughtTicketsByEventId(
					Number(id),
					tokens.access
				);
				
				if (fetchedTickets == undefined) return;
				if (fetchedTickets.length > 0) {
					const event: Event = await getEventById(
						Number(fetchedTickets[0].event),
					);
					setEvent(event);
				}
				setTickets(fetchedTickets);
				setError("");
			} catch (err) {
				console.log("Error fetching tickets:", err);
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		};

		if (tokens?.access) {
			fetchTickets();
		}
	}, [tokens, id]);

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<Text>Loading tickets...</Text>
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
			<StatusBar backgroundColor="#1d2d44" style="light" />
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Header */}
				<HeaderComponent
					title="Your tickets"
					textColor="white"
					onBack={() => router.back()}
				/>

				{/* Tickets */}
				{tickets.map((ticket, index) => (
					<View key={index} style={styles.ticketContainer}>
						<View style={styles.ticketContent}>
							<Text style={styles.title}>{event?.title}</Text>
							<View style={styles.row}>
								<View>
									<Text style={styles.label}>Date</Text>
									<Text style={styles.value}>
										{new Date(ticket.valid_until).toLocaleDateString()}
									</Text>
								</View>
								<View>
									<Text style={styles.label}>Time</Text>
									<Text style={styles.value}>
										{new Date(ticket.valid_until).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</Text>
								</View>
							</View>
							<View style={styles.row}>
								<View>
									<Text style={styles.label}>Check in type</Text>
									<Text style={styles.value}>{ticket.name}</Text>
								</View>
								<View>
									<Text style={styles.label}>ID number</Text>
									<Text style={styles.value}>{ticket.id}</Text>
								</View>
							</View>
							<View>
								<Text style={styles.label}>Place</Text>
								<Text style={styles.value}>{event?.location}</Text>
							</View>
						</View>

						{/* QR Code */}
						<View style={styles.qrCodeContainer}>
							<View
								style={{
									borderBottomColor: "#1d2d44",
									borderBottomWidth: 1,
									borderStyle: "dashed",
									width: "100%",
									marginVertical: 16,
									position: "absolute",
									top: -58,
								}}
							/>
							<View
								style={{
									width: 130,
									height: 130,
									borderRadius: 100,
									backgroundColor: "#1d2d44",
									alignSelf: "center",
									marginVertical: 16,
									position: "absolute",
									top: -120,
									left: -100,
								}}
							/>
							<View
								style={{
									width: 130,
									height: 130,
									borderRadius: 100,
									backgroundColor: "#1d2d44",
									alignSelf: "center",
									marginVertical: 16,
									position: "absolute",
									top: -120,
									right: -100,
								}}
							/>
							<QRCode value={`${ticket.id}`} size={200} />
						</View>
					</View>
				))}

				<TouchableOpacity
					style={{
						backgroundColor: "white",
						padding: 16,
						borderRadius: 8,
						alignItems: "center",
						marginBottom: 60,
					}}
					onPress={() => router.push(`/(tabs)/home`)}
				>
					<Text>Done</Text></TouchableOpacity>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1d2d44",
		padding: 16,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#1d2d44",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#1d2d44",
		padding: 16,
	},
	errorText: {
		color: "red",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 16,
	},
	ticketContainer: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 16,
		marginBottom: 60,
		justifyContent: "space-between",
		height: 600,
		position: "relative",
	},
	ticketContent: {
		marginBottom: 16,
		marginTop: 5,
		paddingHorizontal: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 16,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		color: "#888",
	},
	value: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#000",
	},
	qrCodeContainer: {
		alignItems: "center",
		marginTop: 16,
		position: "relative",
	},
});
export default CheckoutPage;
