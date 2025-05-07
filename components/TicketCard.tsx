import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Touchable,
  Pressable,
} from "react-native";

interface TicketCardProps {
  type: string;
  rate: string;
  date: string;
  time: string;
  onBuyForAnother: (ticketType: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  type,
  rate,
  date,
  time,
  onBuyForAnother,
  isSelected,
  onSelect,
}) => {
  const navigation = useNavigation();
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    navigation.setOptions({ tabBarVisible: false });
  }, []);

  return (
			<Pressable
				style={[styles.container, isSelected && styles.containerPressed]}
				onPress={onSelect}
			>
				<View style={styles.card}>
					{/* Ticket Type */}
					<View style={styles.ticketType}>
						<Text style={styles.ticketTypeText}>{type}</Text>
					</View>

					{/* Rate Section */}
					<View style={styles.rateSection}>
						<View style={styles.rateLabel}>
							<Text style={styles.rateLabelText}>Rate</Text>
						</View>
						<View style={styles.rateAmount}>
							<Text style={styles.rateAmountText}>{rate} / Person</Text>
						</View>
					</View>

					{/* Ticket Details */}
					<View style={styles.ticketDetails}>
						<View style={styles.detailColumn}>
							<View style={styles.detailLabel}>
								<Text style={styles.detailLabelText}>Date</Text>
							</View>
							<View style={styles.detailValue}>
								<Text style={styles.detailValueText}>{date}</Text>
							</View>
						</View>

						<View style={styles.timeColumn}>
							<View style={styles.detailLabel}>
								<Text style={styles.detailLabelText}>Time</Text>
							</View>
							<View style={styles.detailValue}>
								<Text style={styles.detailValueText}>{time}</Text>
							</View>
						</View>
					</View>

					{/* Buy for Another Button */}
					<TouchableOpacity
						style={styles.buyAnother}
						onPress={() => onBuyForAnother(type)}
					>
						<Text style={styles.buyAnotherText}>Buy for another</Text>
					</TouchableOpacity>

					{/* Avatar and "You" Text */}
					{isSelected && (
						<View style={styles.avatarContainer}>
							{/* <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>Y</Text>
            </View> */}
							<Text style={styles.avatarText}>You</Text>
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
		padding: 4,
		marginBottom: 16,
		backgroundColor: "transparent",
	},
	containerPressed: {
		borderWidth: 2,
		borderColor: "gray",
	},
	card: {
		width: "100%",
		backgroundColor: "white",
		borderRadius: 12,
		padding: 16,
		overflow: "hidden",
		borderColor: "#E5E7EB",
		borderWidth: 2,
	},
	ticketType: {
		marginBottom: 12,
	},
	ticketTypeText: {
		fontSize: 18,
		fontWeight: "600",
		fontFamily: "Poppins-SemiBold",
		color: "#333",
	},
	rateSection: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB", // gray-200
	},
	rateLabel: {},
	rateLabelText: {
		fontSize: 14,
		color: "#6B7280", // gray-500
		fontFamily: "Poppins-Regular",
	},
	rateAmount: {},
	rateAmountText: {
		fontSize: 16,
		fontWeight: "500",
		color: "#111827", // gray-900
		fontFamily: "Poppins-Medium",
	},
	ticketDetails: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 16,
	},
	detailColumn: {
		flex: 1,
	},
	detailLabel: {
		marginBottom: 4,
	},
	detailLabelText: {
		fontSize: 14,
		color: "#6B7280", // gray-500
		fontFamily: "Poppins-Regular",
	},
	timeColumn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
	},
	timeLabel: {
		marginBottom: 4,
	},
	timeLabelText: {
		fontSize: 14,
		color: "#6B7280",
		fontFamily: "Poppins-Regular",
	},
	detailValue: {},
	detailValueText: {
		fontSize: 15,
		fontWeight: "500",
		color: "#111827", // gray-900
		fontFamily: "Poppins-Medium",
	},
	buyAnother: {
		alignSelf: "flex-start",
	},
	buyAnotherText: {
		fontSize: 14,
		color: "#3B82F6", // blue-500
		fontWeight: "500",
		fontFamily: "Poppins-Medium",
	},
	avatarContainer: {
		position: "absolute",
		top: 8,
		right: 8,
		alignItems: "center",
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#3B82F6",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 4,
	},
	avatarInitial: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	avatarText: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#3B82F6",
	},
});

export default TicketCard;
