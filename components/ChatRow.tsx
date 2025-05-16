import AppleStyleSwipeableRow from "@/components/AppleStyleSwipeableRow";
import { Colors } from "@/constants/Colors";
import { Community } from "@/models/community.model";
import { format } from "date-fns";
import { Link } from "expo-router";
import { FC } from "react";
import { View, Text, Image, TouchableHighlight } from "react-native";

const ChatRow = (group: Community) => {
	console.log("chat row: ", group);
	return (
		<AppleStyleSwipeableRow>
			<Link href={`/(tabs)/chat/${group.id}`} asChild>
				<TouchableHighlight activeOpacity={0.8} underlayColor={Colors.lightGray}>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: 14,
							paddingLeft: 20,
							paddingVertical: 10,
						}}
					>
						<Image
							// source={{ uri: `https://picsum.photos/seed/${Math.random()}/200/300` }}
							source={{ uri: group.event.organizer.profile.logo_url }}
							style={{ width: 50, height: 50, borderRadius: 50 }}
						/>
						<View style={{ flex: 1 }}>
							<Text style={{ fontSize: 16, fontWeight: "bold" }}>{group.name}</Text>
							{/* <Text style={{ fontSize: 16, color: Colors.gray }}>
								{msg.length > 40 ? `${msg.substring(0, 40)}...` : msg}
							</Text> */}
						</View>
						<Text
							style={{ color: Colors.gray, paddingRight: 20, alignSelf: "flex-start" }}
						>
							{format(group.updated_at, "MM.dd.yy")}
						</Text>
					</View>
				</TouchableHighlight>
			</Link>
		</AppleStyleSwipeableRow>
	);
};
export default ChatRow;
