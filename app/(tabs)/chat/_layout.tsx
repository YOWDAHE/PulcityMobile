import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { TouchableOpacity, View, Text, Image } from "react-native";

const Layout = () => {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					title: "Groups",
					headerLargeTitle: true,
					headerTransparent: true,
					headerBlurEffect: "regular",
					headerStyle: {
						backgroundColor: "#fff",
					},
					// headerSearchBarOptions: {
					// 	placeholder: "Search",
					// },
				}}
			/>

			<Stack.Screen
				name="[id]"
				// options={{
				// 	title: "",
				// 	headerTitle: () => (
				// 		<View
				// 			style={{
				// 				flexDirection: "row",
				// 				width: 220,
				// 				alignItems: "center",
				// 				gap: 10,
				// 				paddingBottom: 4,
				// 			}}
				// 		>
				// 			<Image
				// 				source={{
				// 					uri: "https://pbs.twimg.com/profile_images/1564203599747600385/f6Lvcpcu_400x400.jpg",
				// 				}}
				// 				style={{ width: 40, height: 40, borderRadius: 50 }}
				// 			/>
				// 			<Text style={{ fontSize: 16, fontWeight: "500" }}>Group Name</Text>
				// 		</View>
				// 	),
				// 	headerStyle: {
				// 		backgroundColor: "white",
				// 	},
				// }}
			/>
		</Stack>
	);
};
export default Layout;
