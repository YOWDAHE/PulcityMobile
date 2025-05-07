import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface HeaderComponentProps {
	title: string;
	onBack: () => void;
	textColor?: string; // New optional property for text color
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({ title, onBack, textColor = "black" }) => {
	return (
		<View style={styles.header}>
			<TouchableOpacity style={styles.backButton} onPress={onBack}>
				<View style={[styles.backIcon, { borderColor: textColor }]} />
			</TouchableOpacity>
			<View style={styles.titleContainer}>
				<Text style={[styles.title, { color: textColor }]}>{title}</Text>
			</View>
			<View style={styles.placeholder} />
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		backgroundColor: "transparent",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 16,
		marginBottom: 16,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	backIcon: {
		width: 10,
		height: 10,
		borderTopWidth: 2,
		borderLeftWidth: 2,
		transform: [{ rotate: "-45deg" }],
	},
	titleContainer: {
		flex: 1,
		alignItems: "center",
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		fontFamily: "Poppins-SemiBold",
	},
	placeholder: {
		width: 40,
	},
});

export default HeaderComponent;
