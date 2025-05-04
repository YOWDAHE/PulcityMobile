// app/(tabs)/profile/index.tsx
import React, { useState } from "react";
import {
	View,
	ScrollView,
	SafeAreaView,
	Text,
	TouchableOpacity,
	TextInput,
} from "react-native";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { styles } from "../../components/profile/styles/profileStyles";
import {
	profileData,
	tickets,
	events,
	savedEvents,
} from "../../components/profile/constants/mockData";
import {
	TabName,
	ContentTabName,
	HistoryTabName,
} from "../../components/profile/constants/types";
import {
	StatTab,
	ContentTab,
	RatingStars,
	ProfileHeader,
	TicketCard,
	EventCard,
	ReviewCard,
} from "../../components/profile/_components";
import EmptyState from "../../components/shared/EmptyState";

import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_600SemiBold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SavedEventCard from "@/app/components/profile/_components/SavedEventCard";
import { useAuth } from "@/app/hooks/useAuth";

export default function ProfileScreen() {
  const { user } = useAuth();
	const [activeMainTab, setActiveMainTab] = useState<TabName>("following");
	const [activeContentTab, setActiveContentTab] =
		useState<ContentTabName>("reviews");
	const [activeHistoryTab, setActiveHistoryTab] =
		useState<HistoryTabName>("events");
	const [searchQuery, setSearchQuery] = useState("");
	const insets = useSafeAreaInsets();

	// Filter events and tickets based on search query
	const filteredEvents = events.filter(
		(event) =>
			event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.date.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredTickets = tickets.filter(
		(ticket) =>
			ticket.name.some((name) =>
				name.toLowerCase().includes(searchQuery.toLowerCase())
			) ||
			ticket.place.toLowerCase().includes(searchQuery.toLowerCase()) ||
			ticket.date.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_500Medium,
		Poppins_600SemiBold,
	});

	if (!fontsLoaded) {
		return null;
	}

	const clearSearch = () => {
		setSearchQuery("");
	};

	return (
		<SafeAreaView
			style={[
				styles.container,
				{
					paddingTop: insets.top,
					paddingBottom: insets.bottom,
					paddingLeft: insets.left,
					paddingRight: insets.right,
				},
			]}
		>
			<ScrollView style={styles.scrollView}>
				<ProfileHeader data={{name: `${user?.first_name} ${user?.last_name}` || ""}} />

				{/* Stats Tabs */}
				<View style={styles.statsContainer}>
					<StatTab
						label="Following"
						value={profileData.stats.following.toString()}
						icon={FontAwesome}
						iconName="user"
						tabName="following"
						isActive={activeMainTab === "following"}
						onPress={() => setActiveMainTab("following")}
					/>
				</View>

				{/* Content Tabs */}
				<View style={styles.tabsContainer}>
					<View style={styles.contentTabContainer}>
						<ContentTab
							label="Reviews"
							tabName="reviews"
							iconName="star-border"
							activeContentTab={activeContentTab}
							isActive={activeContentTab === "reviews"}
							onPress={() => setActiveContentTab("reviews")}
						/>
						<ContentTab
							label="Saved"
							tabName="saved"
							iconName="favorite-border"
							activeContentTab={activeContentTab}
							isActive={activeContentTab === "saved"}
							onPress={() => setActiveContentTab("saved")}
						/>
						<View
							style={activeContentTab === "history" && styles.historyTabsContainer}
						>
							<ContentTab
								label="History"
								tabName="history"
								iconName="history"
								activeContentTab={activeContentTab}
								isActive={activeContentTab === "history"}
								onPress={() => setActiveContentTab("history")}
							/>

							{activeContentTab === "history" && (
								<View style={styles.historySubTabsContainer}>
									<TouchableOpacity
										style={[
											styles.historySubTab,
											activeHistoryTab === "events" && styles.activeHistorySubTab,
										]}
										onPress={() => setActiveHistoryTab("events")}
									>
										<Text
											style={[
												styles.historySubTabText,
												activeHistoryTab === "events" && styles.activeHistorySubTabText,
											]}
										>
											Events
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[
											styles.historySubTab,
											activeHistoryTab === "tickets" && styles.activeHistorySubTab,
										]}
										onPress={() => setActiveHistoryTab("tickets")}
									>
										<Text
											style={[
												styles.historySubTabText,
												activeHistoryTab === "tickets" && styles.activeHistorySubTabText,
											]}
										>
											Tickets
										</Text>
									</TouchableOpacity>
								</View>
							)}
						</View>
					</View>
				</View>

				{/* Tab Content */}
				<View style={styles.tabContent}>
					{activeContentTab === "reviews" && (
						<View style={styles.reviewsContainer}>
							{events.map((event) => (
								<ReviewCard key={event.id} event={event} />
							))}
						</View>
					)}
					{activeContentTab === "saved" &&
						(savedEvents.length > 0 ? (
							<View style={styles.savedEventsContainer}>
								{savedEvents.map((event) => (
									<SavedEventCard key={event.id} event={event} />
								))}
							</View>
						) : (
							<EmptyState
								icon="bookmark-border"
								title="No saved items yet"
								subtitle="Save events you're interested in to find them here later"
							/>
						))}
					{activeContentTab === "history" && (
						<View style={styles.historyContainer}>
							<View style={styles.searchContainer}>
								<MaterialIcons
									name="search"
									size={20}
									color="#9CA3AF"
									style={styles.searchIcon}
								/>
								<TextInput
									style={styles.searchInput}
									placeholder="Search by date, name, venue..."
									placeholderTextColor="#9CA3AF"
									value={searchQuery}
									onChangeText={setSearchQuery}
								/>
								{searchQuery.length > 0 && (
									<TouchableOpacity onPress={clearSearch}>
										<MaterialIcons
											name="close"
											size={20}
											color="#9CA3AF"
											style={styles.clearIcon}
										/>
									</TouchableOpacity>
								)}
							</View>
							<View style={styles.historyContent}>
								{activeHistoryTab === "tickets" ? (
									<>
										{filteredTickets.length > 0 ? (
											filteredTickets.map((ticket) => (
												<TicketCard key={ticket.id} ticket={ticket} />
											))
										) : (
											<EmptyState icon="confirmation-number" title="No tickets found" />
										)}
										<View style={styles.totalContainer}>
											<Text style={styles.totalText}>
												Total:
												{filteredTickets.reduce(
													(sum, ticket) => sum + parseInt(ticket.price),
													0
												)}
												ETB
											</Text>
										</View>
									</>
								) : (
									<>
										{filteredEvents.length > 0 ? (
											filteredEvents.map((event) => (
												<EventCard key={event.id} event={event} />
											))
										) : (
											<>
												(
												<EmptyState icon="confirmation-number" title="No events found" />)
											</>
										)}
									</>
								)}
							</View>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
