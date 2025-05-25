import React, { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	Button,
	TextInput,
	Modal,
	Alert,
} from "react-native";
import ButtonComponent from "@/components/ButtonComponent";
import HeaderComponent from "@/components/HeaderComponent";
import TicketCard from "@/components/TicketCard";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/app/hooks/useAuth";
import { Ticket } from "@/models/ticket.model";
import { getTicketsByEventId } from "@/actions/ticket.actions";
import { paymentInit } from "@/actions/payment.actions";
import * as WebBrowser from "expo-web-browser";
import Loading from "@/app/components/Loading";
import { WebView } from "react-native-webview";

interface BuyTicketsScreenProps {
	onBack?: () => void;
	onContinue?: () => void;
}

const BuyTicketsScreen: React.FC<BuyTicketsScreenProps> = ({
	onBack = () => router.back,
}) => {
	const [ticket, setTicket] = useState<Ticket[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const { tokens } = useAuth();
	const { id } = useLocalSearchParams();

	const fetchTicket = async () => {
		try {
			const fetchedTicket = await getTicketsByEventId(Number(id));
			setTicket(fetchedTicket);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};
	useFocusEffect(
		useCallback(() => {
			fetchTicket();
		}, [])
	);

	const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
	const [ticketQuantities, setTicketQuantities] = useState<
		Record<number, number>
	>({});

	useEffect(() => {
		console.log(ticketQuantities);
	}, [ticketQuantities]);

	const handleBuyForAnother = (ticketId: number) => {
		// if (selectedTicketId !== ticketId) {
		// 	setSelectedTicketId(ticketId);
		// }
		setTicketQuantities((prev) => ({
			...prev,
			[ticketId]: (prev[ticketId] || 0) + 1,
		}));
	};

	const [webViewUrl, setWebViewUrl] = useState<string | null>(null);

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
			>
				<HeaderComponent title="Buy Tickets" onBack={() => router.back()} />

				{isLoading ? (
					<Loading />
				) : error ? (
					<Text>{error}</Text>
				) : (
					ticket.map((ticket) => {
						const quantity = ticketQuantities[ticket.id] || 0;

						return (
							<TicketCard
								key={ticket.id}
								type={ticket.name}
								rate={ticket.price}
								ticketId={ticket.id}
								description={ticket.description || "No description"}
								date={new Date(ticket.valid_until).toLocaleDateString()}
								time={new Date(ticket.valid_until).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
								onBuyForAnother={handleBuyForAnother}
								isSelected={selectedTicketId === ticket.id}
								onSelect={() =>
									setSelectedTicketId((prev) => (prev === ticket.id ? null : ticket.id))
								}
								quantityForOthers={ticketQuantities[ticket.id] || 0}
								onIncrease={() =>
									setTicketQuantities((prev) => ({
										...prev,
										[ticket.id]: (prev[ticket.id] || 0) + 1,
									}))
								}
								onDecrease={() =>
									setTicketQuantities((prev) => ({
										...prev,
										[ticket.id]: Math.max(0, (prev[ticket.id] || 0) - 1),
									}))
								}
							/>
						);
					})
				)}
			</ScrollView>

			<View style={styles.buttonContainer}>
				<ButtonComponent
					text="Continue"
					onPress={async () => {
						const finalTickets = [];
						const processedQuantities = { ...ticketQuantities };

						if (selectedTicketId !== null) {
							const currentQuantity = processedQuantities[selectedTicketId] || 0;
							processedQuantities[selectedTicketId] = currentQuantity + 1;
						}

						for (const [ticketId, quantity] of Object.entries(processedQuantities)) {
							if (quantity > 0) {
								finalTickets.push({
									ticket_id: parseInt(ticketId),
									quantity,
								});
							}
						}

						if (finalTickets.length === 0) {
							Alert.alert(
								"No Tickets Selected",
								"Please select at least one ticket before continuing."
							);
							return;
						}

						console.log(finalTickets);

						try {
							const paymentResponse = await paymentInit({ tickets: finalTickets });
							const checkoutUrl = paymentResponse.detail.data.checkout_url;
							setWebViewUrl(checkoutUrl);
						} catch (error) {
							Alert.alert(
								"Payment Error",
								"Failed to initialize payment. Please try again."
							);
							console.error("Payment initialization error:", error);
						}
					}}
					customStyles={styles.continueButton}
				/>
			</View>

			{webViewUrl && (
				<Modal visible transparent={false} animationType="slide">
					<View style={{ flex: 1 }}>
						<Button title="Close" onPress={() => setWebViewUrl(null)} />
						<WebView source={{ uri: webViewUrl }} style={{ flex: 1 }} />
					</View>
				</Modal>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: "relative",
	},
	scrollView: {
		flex: 1,
		marginBottom: 60,
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 32,
	},
	buttonContainer: {
		position: "absolute",
		bottom: 0,
		right: 0,
		left: 0,
		padding: 10,
		backgroundColor: "white",
		borderTopWidth: 1,
		borderColor: "#eee",
	},
	continueButton: {
		width: "100%",
	},
});

export default BuyTicketsScreen;
