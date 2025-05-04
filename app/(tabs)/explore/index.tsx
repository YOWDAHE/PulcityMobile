import { StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Featured from "./_components/featured";
import EventCard from "./_components/EventCard";
import { ScrollView } from "react-native-gesture-handler";
import Recommended from "./_components/Recommended";

export default function ExploreScreen() {
	return (
		<View style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.content}>
					<Text style={styles.screenTitle}>Explore</Text>

					<View style={styles.section}>
						<View style={styles.sectionHeaderRow}>
							<Text style={styles.sectionHeader}>Featured Event</Text>
						</View>
						<Featured />
					</View>

					<View style={styles.section}>
						<View style={styles.sectionHeaderRow}>
							<Text style={styles.sectionHeader}>Popular Events</Text>
							<Text style={styles.seeAll}>See all</Text>
						</View>
						<ScrollView
							horizontal={true}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.horizontalScroll}
						>
							<EventCard />
							<EventCard />
							<EventCard />
						</ScrollView>
					</View>

					<View style={styles.section}>
						<View style={styles.sectionHeaderRow}>
							<Text style={styles.sectionHeader}>Nearby You</Text>
							<Text style={styles.seeAll}>See all</Text>
						</View>
						<ScrollView
							horizontal={true}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.horizontalScroll}
						>
							<EventCard />
							<EventCard />
							<EventCard />
						</ScrollView>
					</View>

					<View style={styles.section}>
						<View style={styles.sectionHeaderRow}>
							<Text style={styles.sectionHeader}>Recommended</Text>
							<Text style={styles.seeAll}>See all</Text>
						</View>
						<View style={styles.recommended}>
							<Recommended />
							<Recommended />
							<Recommended />
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	content: {
		flex: 1,
		paddingVertical: 16,
		// paddingHorizontal: 12,
		gap: 28,
	},
	screenTitle: {
		fontSize: 28,
		fontWeight: "800",
		color: "#1a1a1a",
		paddingHorizontal: 16,
		fontFamily: "Inter_700Bold",
	},
	section: {
		gap: 16,
	},
	sectionHeaderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	sectionHeader: {
		fontSize: 18,
		// fontWeight: "700",
		color: "#1a1a1a",
		fontFamily: "Inter_600SemiBold",
		opacity: 0.8,
	},
	seeAll: {
		fontSize: 14,
		color: "#457B9D",
		fontWeight: "500",
	},
	horizontalScroll: {
		paddingLeft: 16,
		gap: 12,
	},
	recommended: {
		paddingHorizontal: 16,
		gap: 16,
	},
});
