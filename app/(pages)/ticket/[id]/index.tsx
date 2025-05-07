import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	Button,
	TextInput,
	TouchableWithoutFeedback,
	Modal,
	Alert,
} from "react-native";
import ButtonComponent from "@/components/ButtonComponent";
import HeaderComponent from "@/components/HeaderComponent";
import TicketCard from "@/components/TicketCard";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/app/hooks/useAuth";
import { Ticket } from "@/models/ticket.model";
import { getTicketById } from "@/actions/ticket.actions";
import { paymentInit } from "@/actions/payment.actions";
import * as WebBrowser from "expo-web-browser";

interface BuyTicketsScreenProps {
	onBack?: () => void;
	onContinue?: () => void;
}

const ContactModal = ({
	visible,
	onClose,
	onSave,
}: {
	visible: boolean;
	onClose: () => void;
	onSave: (contact: { name: string; email: string; phone: string }) => void;
}) => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const handleSave = () => {
		onSave({ name, email, phone });
		onClose();
	};

	return (
		<Modal
			transparent={true}
			visible={visible}
			animationType="slide"
			onRequestClose={onClose}
		>
			<TouchableWithoutFeedback onPress={onClose}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<View style={styles.modalContent}>
							<View style={styles.handleBar} />

							<TextInput
								style={styles.searchBar}
								placeholder="Search a user..."
								value={searchQuery}
								onChangeText={setSearchQuery}
							/>

							<Text style={styles.modalTitle}>or add by contact</Text>

							<View style={styles.modalScrollView}>
								<View>
									<View style={styles.inputContainer}>
										<Text style={styles.label}>Name</Text>
										<TextInput
											style={styles.input}
											placeholder="Eg. John Doe"
											value={name}
											onChangeText={setName}
										/>
									</View>

									<View style={styles.inputContainer}>
										<Text style={styles.label}>Email</Text>
										<TextInput
											style={styles.input}
											placeholder="Eg. johndoe@gmail.com"
											keyboardType="email-address"
											value={email}
											onChangeText={setEmail}
										/>
									</View>

									<View style={styles.inputContainer}>
										<Text style={styles.label}>Phone Number</Text>
										<TextInput
											style={styles.input}
											placeholder="Eg. +251 ..."
											keyboardType="phone-pad"
											value={phone}
											onChangeText={setPhone}
										/>
									</View>
								</View>
								<Button title="Done" onPress={handleSave} />
							</View>
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};

const BuyTicketsScreen: React.FC<BuyTicketsScreenProps> = ({
	onBack = () => router.back,
}) => {
	const [ticket, setTicket] = useState<Ticket[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const { tokens } = useAuth();
	const { id } = useLocalSearchParams();

	useEffect(() => {
		const fetchTicket = async () => {
			try {
				if (!tokens?.access) {
					console.log("Access token is missing here");
					throw new Error("Access token is missing");
				}
				const fetchedTicket = await getTicketById(Number(id), tokens.access);
				setTicket((prev) => [...prev, fetchedTicket]);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		};

		fetchTicket();
	}, [tokens]);

	const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
	const [showContactModal, setShowContactModal] = useState(false);
	const [contacts, setContacts] = useState<
		Record<string, { name: string; email: string; phone: string }>
	>({});

	const handleBuyForAnother = (ticketType: string) => {
		console.log("Buy for another pressed......", ticketType);
		setShowContactModal(true);
	};

	const handleSaveContact = (contact: {
		name: string;
		email: string;
		phone: string;
	}) => {
		if (selectedTicket) {
			setContacts((prev) => ({
				...prev,
				[selectedTicket]: contact,
			}));
		}
	};

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
			>
				<HeaderComponent title="Buy Tickets" onBack={() => router.back()} />

				<View style={styles.pageTitle}>
					<Text style={styles.pageTitleText}>Tamino Tour 2024</Text>
				</View>

				{ticket.map((ticket, index) => (
					<TicketCard
						key={index}
						type={ticket.name}
						rate={ticket.price}
						date={new Date(ticket.valid_until).toLocaleDateString()}
						time={new Date(ticket.valid_until).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
						onBuyForAnother={handleBuyForAnother}
						isSelected={selectedTicket === Number(ticket.id)}
						onSelect={() => setSelectedTicket(ticket.id)}
					/>
				))}

				<View style={styles.buttonContainer}>
					<ButtonComponent
						text="Continue"
						onPress={async () => {
							if (!selectedTicket) {
								Alert.alert(
									"No Ticket Selected",
									"Please select a ticket before continuing."
								);
								return;
							}

							try {
								const paymentResponse = await paymentInit(
									selectedTicket,
									tokens?.access || ""
								);
								const checkoutUrl = paymentResponse.detail.data.checkout_url;
                await WebBrowser.openBrowserAsync(checkoutUrl).then((result) => {
                  // result.type.
                  //   console.log("Browser closed", result);
                });
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
			</ScrollView>
			<ContactModal
				visible={showContactModal}
				onClose={() => setShowContactModal(false)}
				onSave={handleSaveContact}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.1)",
		justifyContent: "flex-end",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "flex-end",
	},
	modalContent: {
		backgroundColor: "white",
		padding: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: "80%",
		height: "100%",
	},
	modalScrollView: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "space-between",
		height: "100%",
	},
	handleBar: {
		width: 40,
		height: 4,
		backgroundColor: "#ccc",
		borderRadius: 2,
		alignSelf: "center",
		marginBottom: 15,
	},
	modalTitle: {
		fontSize: 12,
		marginVertical: 20,
		opacity: 0.5,
		textAlign: "center",
	},

	inputContainer: {
		marginBottom: 15,
	},
	label: {
		fontSize: 14,
		marginBottom: 5,
		color: "#666",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 5,
		padding: 10,
		fontSize: 16,
	},
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 32,
	},
	pageTitle: {
		marginBottom: 20,
		textAlign: "center",
		flexDirection: "row",
		justifyContent: "center",
	},
	pageTitleText: {
		fontSize: 20,
		fontWeight: "600",
		fontFamily: "Poppins-SemiBold",
	},
	buttonContainer: {
		marginTop: 16,
	},
	continueButton: {
		width: "100%",
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F5F7FB",
		borderRadius: 20,
		height: 40,
		paddingHorizontal: 15,
		fontSize: 16,
		color: "black",
		marginBottom: 15,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
});

export default BuyTicketsScreen;
