import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

interface ButtonComponentProps {
	text: string;
	onPress: () => void;
	customStyles?: object;
	textStyles?: object;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
	text,
	onPress,
	customStyles,
	textStyles,
}) => {
	return (
		<TouchableOpacity
			style={[styles.button, customStyles]}
			onPress={onPress}
			activeOpacity={0.8}
		>
			<Text style={[styles.buttonText, textStyles]}>{text}</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#252F3F",
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
		fontFamily: "Poppins-SemiBold",
	},
});

export default ButtonComponent;
