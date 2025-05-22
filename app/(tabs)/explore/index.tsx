import {
	StyleSheet,
	View,
	Text,
	TextInput,
	ActivityIndicator,
	TouchableOpacity,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Featured from "./_components/featured";
import EventCard from "./_components/EventCard";
import { ScrollView } from "react-native-gesture-handler";
import Recommended from "./_components/Recommended";
import { useCallback, useEffect, useState } from "react";
import {
	getFollowedEvents,
	getPopularEvents,
	searchEvents,
	getNearbyEvents,
} from "@/actions/event.actions";
import { Event } from "@/models/event.model";
import { Ionicons } from "@expo/vector-icons";
import { debounce } from "lodash";
import React from "react";
import { Header } from "@/app/components/Header";
import * as Location from "expo-location";
import { useFocusEffect, useLocalSearchParams } from "expo-router";

export default function ExploreScreen() {
	const { hashtag } = useLocalSearchParams();
	const [popularEvents, setPopularEvents] = useState<Event[]>([]);
	const [followedEvents, setFollowedEvents] = useState<Event[]>([]);
	const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
	const [search, setSearch] = useState("");
	const [searchResults, setSearchResults] = useState<Event[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [locationError, setLocationError] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingNearby, setIsLoadingNearby] = useState(false);
	const [locationPermissionStatus, setLocationPermissionStatus] = useState<
		"undetermined" | "granted" | "denied"
	>("undetermined");

	const requestLocationPermission = async () => {
		setIsLoadingNearby(true);
		setLocationError("");
		
		try {
			
			const { status } = await Location.getForegroundPermissionsAsync();
			
			if (status !== 'granted') {
				
				Alert.alert(
					"Location Access Required",
					"We need your location to show events nearby. Would you like to enable location services?",
					[
						{
							text: "No, Thanks",
							onPress: () => {
								setLocationPermissionStatus("denied");
								setLocationError("Location permission denied");
								setIsLoadingNearby(false);
							},
							style: "cancel",
						},
						{
							text: "Yes",
							onPress: async () => {
								const { status } = await Location.requestForegroundPermissionsAsync();
								setLocationPermissionStatus(status === "granted" ? "granted" : "denied");
								
								if (status === "granted") {
									fetchNearbyEventsWithLocation();
								} else {
									setLocationError("Location permission denied");
									setIsLoadingNearby(false);
								}
							},
						},
					]
				);
			} else {
				setLocationPermissionStatus("granted");
				fetchNearbyEventsWithLocation();
			}
		} catch (error) {
			console.error("Error requesting location permission:", error);
			setLocationError("Error accessing location services");
			setIsLoadingNearby(false);
		}
	};

	const filterPastEvents = (events: Event[]) => {
		const currentDate = new Date();
		return events.filter((event) => {
			if (!event.start_date) return true;
			const eventDate = new Date(event.start_date);
			return eventDate >= currentDate;
		});
	};

	const fetchNearbyEventsWithLocation = async () => {
		try {
			// Get current position
			const location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
				timeInterval: 5000,
				mayShowUserSettingsDialog: true,
			});
			
			// Fetch nearby events
			const events = await getNearbyEvents({
				lat: location.coords.latitude,
				lng: location.coords.longitude,
				radius: 10,
			});
			
			// Filter out past events
			setNearbyEvents(filterPastEvents(events));
			setLocationError("");
		} catch (error) {
			console.error("Error fetching nearby events:", error);
			setLocationError("Unable to determine your location. Please check your device settings.");
		} finally {
			setIsLoadingNearby(false);
		}
	};

	const checkLocationPermission = async () => {
		try {
			const { status } = await Location.getForegroundPermissionsAsync();
			setLocationPermissionStatus(status === 'granted' ? 'granted' : 'denied');
			
			if (status === 'granted') {
				fetchNearbyEventsWithLocation();
			}
		} catch (error) {
			console.error("Error checking location permission:", error);
			setLocationPermissionStatus('denied');
		}
	};

	useFocusEffect(
		useCallback(() => {
			const fetchEvents = async () => {
				setIsLoading(true);
				try {
					const [popular, following] = await Promise.all([
						getPopularEvents(),
						getFollowedEvents(),
					]);
					// Filter out past events
					setPopularEvents(filterPastEvents(popular));
					setFollowedEvents(filterPastEvents(following));
				} catch (error) {
					console.error("Error fetching events:", error);
				} finally {
					setIsLoading(false);
				}
			};

			fetchEvents();
			
			// Check location permission status when component mounts
			checkLocationPermission();
		}, [])
	);

	// Handle hashtag search from params
	useEffect(() => {
		if (hashtag) {
			const hashtagValue = typeof hashtag === "string" ? hashtag : "";
			setSearch(`#${hashtagValue}`);
			handleSearch(`#${hashtagValue}`);
		}
	}, [hashtag]);

	const handleSearch = async (query: string) => {
		if (query.trim() === "") {
			setSearchResults([]);
			setIsSearching(false);
			return;
		}

		setIsSearching(true);
		try {
			// If search starts with a hashtag, search by hashtag
			if (query.startsWith("#")) {
				const hashtagQuery = query.substring(1).trim();
				if (hashtagQuery) {
					const results = await searchEvents({ hashtags: hashtagQuery });
					// Filter out past events
					setSearchResults(filterPastEvents(results));
				}
			} else {
				// Regular search
				const results = await searchEvents({ q: query });
				// Filter out past events
				setSearchResults(filterPastEvents(results));
			}
		} catch (error) {
			console.error("Search error:", error);
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	const debouncedSearch = debounce(handleSearch, 500);

	useEffect(() => {
		debouncedSearch(search);
		return () => debouncedSearch.cancel();
	}, [search]);

	// Empty state component
	const EmptyStateMessage = ({ message }: { message: string }) => (
		<View style={styles.emptyState}>
			<Ionicons name="calendar-outline" size={40} color="#ccc" />
			<Text style={styles.emptyStateText}>{message}</Text>
		</View>
	);

	if (isLoading && search.trim() === "") {
		return (
			<View style={[styles.container, styles.loadingContainer]}>
				{/* <Header title="Explore" /> */}
				<ActivityIndicator size="large" color="#3B82F6" />
				<Text style={styles.loadingText}>Loading events...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Header title="Explore" />
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.content}>
					{/* Search Bar */}
					<View style={styles.searchContainer}>
						<Ionicons
							name="search"
							size={20}
							color="#666"
							style={styles.searchIcon}
						/>
						<TextInput
							style={styles.searchInput}
							placeholder="Search events, hashtags..."
							value={search}
							onChangeText={setSearch}
							placeholderTextColor="#666"
						/>
						{isSearching && (
							<ActivityIndicator
								size="small"
								color="#666"
								style={styles.searchLoader}
							/>
						)}
					</View>

					{/* Search Results */}
					{searchResults.length > 0 ? (
						<View style={styles.section}>
							<View style={styles.sectionHeaderRow}>
								<Text style={styles.sectionHeader}>
									{search.startsWith("#") ? `Results for ${search}` : "Search Results"}
								</Text>
							</View>
							<View style={styles.recommended}>
								{searchResults.map((event) => (
									<Recommended key={event.id} event={event} />
								))}
							</View>
						</View>
					) : search.trim() !== "" && !isSearching ? (
						<View style={styles.noResults}>
							<Text style={styles.noResultsText}>No events found</Text>
						</View>
					) : (
						<>
							<View style={styles.section}>
								<View style={styles.sectionHeaderRow}>
									<Text style={styles.sectionHeader}>Popular Events</Text>
									{/* <Text style={styles.seeAll}>See all</Text> */}
								</View>
								{popularEvents.length > 0 ? (
									<ScrollView
										horizontal={true}
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={styles.horizontalScroll}
									>
										{popularEvents.map((event) => (
											<EventCard key={event.id} event={event} />
										))}
									</ScrollView>
								) : (
									<EmptyStateMessage message="No popular events available" />
								)}
							</View>

							<View style={styles.section}>
								<View style={styles.sectionHeaderRow}>
									<Text style={styles.sectionHeader}>Nearby You</Text>
									{/* <Text style={styles.seeAll}>See all</Text> */}
								</View>
								
								{isLoadingNearby ? (
									<View style={styles.nearbyLoadingContainer}>
										<ActivityIndicator size="small" color="#3B82F6" />
										<Text style={styles.nearbyLoadingText}>Finding events near you...</Text>
									</View>
								) : locationPermissionStatus === "granted" && nearbyEvents.length > 0 ? (
									<ScrollView
										horizontal={true}
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={styles.horizontalScroll}
									>
										{nearbyEvents.map((event) => (
											<EventCard key={event.id} event={event} />
										))}
									</ScrollView>
								) : locationPermissionStatus === "granted" && nearbyEvents.length === 0 ? (
									<EmptyStateMessage message="No events found nearby" />
								) : (
									<View style={styles.locationPermissionContainer}>
										<Ionicons name="location-outline" size={36} color="#666" />
										<Text style={styles.locationPermissionText}>
											{locationError || "Find events near your current location"}
										</Text>
										<TouchableOpacity 
											style={styles.enableLocationButton}
											onPress={requestLocationPermission}
										>
											<Text style={styles.enableLocationButtonText}>Enable Location</Text>
										</TouchableOpacity>
									</View>
								)}
							</View>

							<View style={styles.section}>
								<View style={styles.sectionHeaderRow}>
									<Text style={styles.sectionHeader}>Recommended</Text>
									{/* <Text style={styles.seeAll}>See all</Text> */}
								</View>
								{followedEvents.length > 0 ? (
									<View style={styles.recommended}>
										{followedEvents.map((event) => (
											<Recommended key={event.id} event={event} />
										))}
									</View>
								) : (
									<EmptyStateMessage message="No recommended events available" />
								)}
							</View>
						</>
					)}
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
	loadingContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: '#666',
		fontWeight: '500',
	},
	content: {
		flex: 1,
		paddingVertical: 16,
		paddingBottom: 60,
		gap: 28,
	},
	screenTitle: {
		fontSize: 28,
		fontWeight: "800",
		color: "#1a1a1a",
		paddingHorizontal: 16,
		fontFamily: "Inter_700Bold",
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "white",
		marginHorizontal: 16,
		paddingHorizontal: 12,
		height: 48,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: "#000",
		height: "100%",
		fontFamily: "Inter_400Regular",
	},
	searchLoader: {
		marginLeft: 8,
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
	noResults: {
		padding: 16,
		alignItems: "center",
	},
	noResultsText: {
		fontSize: 16,
		color: "#666",
		fontFamily: "Inter_400Regular",
	},
	errorText: {
		fontSize: 16,
		color: "#666",
		fontFamily: "Inter_400Regular",
		padding: 16,
	},
	emptyState: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
		backgroundColor: 'white',
		borderRadius: 8,
		marginHorizontal: 16,
		height: 180,
	},
	emptyStateText: {
		fontSize: 16,
		color: '#666',
		marginTop: 12,
		textAlign: 'center',
	},
	locationPermissionContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 24,
		backgroundColor: 'white',
		borderRadius: 8,
		marginHorizontal: 16,
		height: 180,
	},
	locationPermissionText: {
		fontSize: 16,
		color: '#666',
		marginTop: 12,
		marginBottom: 16,
		textAlign: 'center',
	},
	enableLocationButton: {
		backgroundColor: '#3B82F6',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
	},
	enableLocationButtonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
	},
	nearbyLoadingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
		backgroundColor: 'white',
		borderRadius: 8,
		marginHorizontal: 16,
		height: 180,
	},
	nearbyLoadingText: {
		fontSize: 16,
		color: '#666',
		marginTop: 12,
		textAlign: 'center',
	},
});
