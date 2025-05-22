import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Pressable,
	Image,
} from "react-native";

interface TicketCardProps {
	type: string;
	rate: string;
	date: string;
	description: string;
	time: string;
	ticketId: number;
	onBuyForAnother: (ticketType: number) => void;
	isSelected: boolean;
	onSelect: () => void;
	quantityForOthers: number;
	onIncrease: () => void;
	onDecrease: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
	type,
	rate,
	date,
	description,
	time,
	onBuyForAnother,
	ticketId,
	isSelected,
	onSelect,
	quantityForOthers,
	onIncrease,
	onDecrease,
}) => {
	const navigation = useNavigation();

	useEffect(() => {
		navigation.setOptions({ tabBarVisible: false });
	}, []);

	return (
		<Pressable
			style={[styles.container, isSelected && styles.containerPressed]}
			onPress={onSelect}
		>
			<Image
				source={require("@/assets/images/ticketPatterns.png")}
				style={styles.backgroundImage}
				resizeMode="contain"
			/>
			<View style={styles.card}>
				{/* Ticket Type */}
				<View style={styles.ticketType}>
					<Text style={styles.ticketTypeText}>{type}</Text>
				</View>

				{/* Rate Section */}
				<View style={styles.rateSection}>
					<Text style={styles.rateAmountText}>{Number(rate).toFixed(0)} Birr</Text>
					<Text style={styles.rateLabelText}>per person</Text>
				</View>

				<View style={styles.rateSection}>
					<Text style={styles.rateLabelText}>{ description }</Text>
				</View>

				{/* Action Buttons */}
				<View
					style={{
						flex: 1,
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						width: "100%",
					}}
				>
					<TouchableOpacity style={styles.selectTicket} onPress={onSelect}>
						<Text style={styles.selectTicketText}>
							{isSelected ? "Unselect Ticket" : "Select Ticket"}
						</Text>
					</TouchableOpacity>

					{/* Buy for Another Button */}
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							width: "100%",
							marginTop: 4,
						}}
					>
						<TouchableOpacity
							style={[styles.buyAnother, { flex: 1,}]}
							onPress={() => onBuyForAnother(ticketId)}
						>
							<Text style={styles.buyAnotherText}>Buy for another</Text>
						</TouchableOpacity>
						{quantityForOthers > 0 && (
							<TouchableOpacity
								style={[styles.buyAnother, { flex: 1, marginLeft: 16 }]}
								onPress={onDecrease}
							>
								<Text style={styles.removeText}>Remove</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* Avatar and "You" Text */}
				{(isSelected || quantityForOthers > 0) && (
					<View style={styles.avatarContainer}>
						<Text style={styles.avatarText}>
							{isSelected ? "You" : ""}{" "}
							{quantityForOthers > 0 ? `+ ${quantityForOthers}` : ""}
						</Text>
					</View>
				)}
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		borderRadius: 16,
		borderWidth: 0,
		borderColor: "white",
		padding: 6,
		marginBottom: 16,
		backgroundColor: "transparent",
		position: "relative",
		overflow: "hidden",
	},
	containerPressed: {
		borderWidth: 2,
		borderColor: "gray",
	},
	card: {
		width: "100%",
		padding: 16,
		borderRadius: 12,
		borderColor: "#E5E7EB",
		borderWidth: 2,
		display: "flex",
		flexDirection: "column",
		gap: 60,
		backgroundColor: "white",
	},
	ticketType: {
		alignItems: "center",
	},
	ticketTypeText: {
		textAlign: "center",
		fontSize: 24,
		fontWeight: "600",
		fontFamily: "PoppinsBold",
	},
	rateSection: {
		justifyContent: "center",
		alignItems: "center",
	},
	rateAmountText: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#111827",
		fontFamily: "Poppins-Medium",
	},
	rateLabelText: {
		fontSize: 14,
		color: "lightGray",
		fontFamily: "Poppins-Regular",
		textAlign: "center",
	},
	buyAnother: {
		// Base styles for buttons
	},
	buyAnotherText: {
		fontSize: 14,
		color: "#3B82F6",
		fontWeight: "500",
		fontFamily: "Poppins-Medium",
		textAlign: "center",
	},
	removeText: {
		fontSize: 14,
		color: "red",
		fontWeight: "500",
		fontFamily: "Poppins-Medium",
		textAlign: "center",
	},
	selectTicketText: {
		fontSize: 16,
		color: "white",
		fontWeight: "500",
		fontFamily: "Poppins-Medium",
		textAlign: "center",
	},
	selectTicket: {
		backgroundColor: "#3B82F6",
		padding: 15,
		width: "100%",
		borderRadius: 5,
		marginBottom: 15,
	},
	avatarContainer: {
		position: "absolute",
		top: 8,
		right: 8,
		alignItems: "center",
	},
	avatarText: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#3B82F6",
	},
	backgroundImage: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		borderRadius: 12,
	},
});

export default TicketCard;
