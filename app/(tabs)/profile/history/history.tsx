import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
	Animated,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import SearchComponent from "@/app/components/profile/_components/SearchComponent";
import EventCard from "@/app/components/profile/_components/EventCard";
import TicketCard from "@/app/components/profile/_components/TicketCard";

// Actions
import { getAttendedEvents, getEventById } from "@/actions/event.actions";
import { getBoughtTickets } from "@/actions/ticket.actions";

// Types
import { Event as ApiEvent } from "@/models/event.model";
import { Ticket as ApiTicket } from "@/models/ticket.model";
import {
	Event as ProfileEvent,
	Ticket as ProfileTicket,
	TicketType,
} from "@/app/components/profile/constants/types";
import Recommended from "../../explore/_components/Recommended";
import WentCard from "@/app/components/profile/_components/WentComponent";

type HistoryTab = "tickets" | "events";

const SCREEN_WIDTH = Dimensions.get('window').width;

// Create a new interface for tickets with event details
interface TicketWithEvent extends ApiTicket {
	eventDetails?: ApiEvent;
}

const History = () => {
	const [activeTab, setActiveTab] = useState<HistoryTab>("tickets");
	const [showTabDropdown, setShowTabDropdown] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
	const [events, setEvents] = useState<ApiEvent[]>([]);
	const [filteredItems, setFilteredItems] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	
	const [slideAnim] = useState(new Animated.Value(0));
	
	useEffect(() => {
		Animated.timing(slideAnim, {
			toValue: activeTab === "tickets" ? 0 : 1,
			duration: 250,
			useNativeDriver: true,
		}).start();
	}, [activeTab]);

	useEffect(() => {
		setSearchQuery("");
		setFilteredItems([]);
		fetchData();
	}, [activeTab]);

	useEffect(() => {
		filterItems();
	}, [searchQuery, tickets, events, activeTab]);

	// useEffect(() => {
	// 	console.log("History: initial data load, forcing filter");
	// 	filterItems();
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, []);

	// Add a function to fetch event details for tickets
	const fetchEventDetailsForTickets = async (tickets: ApiTicket[]): Promise<TicketWithEvent[]> => {
		console.log('Fetching event details for', tickets.length, 'tickets');
		
		const ticketsWithEvents: TicketWithEvent[] = [];
		
		// Process tickets in batches to avoid overwhelming the API
		for (const ticket of tickets) {
			try {
				if (ticket.event) {
					const eventId = ticket.event;
					console.log(`Fetching event details for ticket ${ticket.id}, event ID: ${eventId}`);
					
					const eventDetails = await getEventById(eventId);
					
					ticketsWithEvents.push({
						...ticket,
						eventDetails
					});
				} else {
					ticketsWithEvents.push(ticket);
				}
			} catch (err) {
				console.error(`Error fetching event details for ticket ${ticket.id}:`, err);
				// Still add the ticket without event details
				ticketsWithEvents.push(ticket);
			}
		}
		
		console.log('Completed fetching event details for tickets');
		return ticketsWithEvents;
	};

	// Update the fetchData method to fetch event details for tickets
	const fetchData = async () => {
		setIsLoading(true);
		setError(null);

		try {
			if (activeTab === "tickets") {
				const fetchedTickets = await getBoughtTickets();
				console.log('Fetched tickets:', fetchedTickets?.length || 0, 'tickets');
				
				// Dump first ticket for debugging
				if (fetchedTickets && fetchedTickets.length > 0) {
					console.log('Sample ticket:', JSON.stringify(fetchedTickets[0]));
				} else {
					console.log('No tickets returned from API');
				}
				
				// Fetch event details for tickets
				const ticketsWithEvents = await fetchEventDetailsForTickets(fetchedTickets || []);
				
				setTickets(ticketsWithEvents);
				// Immediately set filtered items to match all tickets when no search is active
				if (!searchQuery.trim()) {
					setFilteredItems(ticketsWithEvents);
				}
			} else {
				const fetchedEvents = await getAttendedEvents();
				console.log('Fetched events:', fetchedEvents?.length || 0, 'events');
				
				// Dump first event for debugging
				if (fetchedEvents && fetchedEvents.length > 0) {
					console.log('Sample event:', JSON.stringify(fetchedEvents[0]));
				} else {
					console.log('No events returned from API');
				}
				
				setEvents(fetchedEvents || []);
				// Immediately set filtered items to match all events when no search is active
				if (!searchQuery.trim()) {
					setFilteredItems(fetchedEvents || []);
				}
			}
		} catch (err) {
			console.error("Error fetching data:", err);
			setError("Failed to load data. Please try again later.");
		} finally {
			setIsLoading(false);
		}
	};

	const filterItems = () => {
		console.log(`FilterItems called with searchQuery: "${searchQuery}"`);
		console.log(`Current data:`, 
			`tickets=${tickets.length}`, 
			`events=${events.length}`
		);
		
		// If search is empty, show all items
		if (!searchQuery.trim()) {
			const items = activeTab === "tickets" ? tickets : events;
			console.log(`No search query, showing all ${items.length} ${activeTab}`);
			setFilteredItems(items);
			return;
		}

		// Otherwise, perform filtering
		const query = searchQuery.toLowerCase();
		console.log(`History: filtering ${activeTab} with query "${query}"`);

		if (activeTab === "tickets") {
			const filtered = tickets.filter((ticket) => {
				// Check existing fields
				// ... existing ticket filtering logic ...
				
				// Check name field
				if (ticket.name?.toLowerCase().includes(query)) return true;

				// Check valid_from and valid_until dates with formatting for user-friendly searches
				if (ticket.valid_from) {
					const date = new Date(ticket.valid_from);
					const formattedDate = date
						.toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})
						.toLowerCase();
					if (formattedDate.includes(query)) return true;

					// Check month name
					const monthName = date
						.toLocaleDateString("en-US", { month: "long" })
						.toLowerCase();
					if (monthName.includes(query)) return true;

					// Check month + day format
					const monthDay = date
						.toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
						})
						.toLowerCase();
					if (monthDay.includes(query)) return true;
				}

				if (ticket.valid_until) {
					const date = new Date(ticket.valid_until);
					const formattedDate = date
						.toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})
						.toLowerCase();
					if (formattedDate.includes(query)) return true;
				}

				// Check price
				if (ticket.price?.toString().includes(query)) return true;

				// Check event ID
				if (ticket.event && ticket.event.toString().includes(query)) return true;
				
				// NEW: Check event details if available
				if (ticket.eventDetails) {
					// Check event title
					if (ticket.eventDetails.title?.toLowerCase().includes(query)) return true;
					
					// Check event description
					if (ticket.eventDetails.description?.toLowerCase().includes(query)) return true;
					
					// Check event location
					if (ticket.eventDetails.location) {
						try {
							// Handle location as string (JSON)
							if (typeof ticket.eventDetails.location === 'string') {
								try {
									const parsedLocation = JSON.parse(ticket.eventDetails.location);
									if (parsedLocation && typeof parsedLocation === 'object' && 
										parsedLocation.name && typeof parsedLocation.name === 'string' && 
										parsedLocation.name.toLowerCase().includes(query)) {
										return true;
									}
									if (ticket.eventDetails.location.toLowerCase().includes(query)) return true;
								} catch (e) {
									// If parsing fails, check the raw string
									if (ticket.eventDetails.location.toLowerCase().includes(query)) return true;
								}
							} 
							// Handle location as object
							else if (ticket.eventDetails.location && typeof ticket.eventDetails.location === 'object') {
								const locationObj = ticket.eventDetails.location as any;
								if (locationObj.name && typeof locationObj.name === 'string' && 
									locationObj.name.toLowerCase().includes(query)) {
									return true;
								}
							}
						} catch (err) {
							console.error("Error parsing event location for search:", err);
						}
					}
					
					// Check event organizer name
					if (ticket.eventDetails.organizer?.profile?.name?.toLowerCase().includes(query)) return true;
				}

				return false;
			});
			console.log(`Found ${filtered.length} tickets matching "${query}"`);
			setFilteredItems(filtered);
		} else {
			const filtered = events.filter((event) => {
				if (event.title?.toLowerCase().includes(query)) return true;

				// Format and check start_date for user-friendly searches
				if (event.start_date) {
					const date = new Date(event.start_date);
					const formattedDate = date
						.toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})
						.toLowerCase();
					if (formattedDate.includes(query)) return true;

					// Also check month name alone (e.g., "may")
					const monthName = date
						.toLocaleDateString("en-US", { month: "long" })
						.toLowerCase();
					if (monthName.includes(query)) return true;

					// Check for month + day format (e.g., "may 2")
					const monthDay = date
						.toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
						})
						.toLowerCase();
					if (monthDay.includes(query)) return true;
				}

				// Check for location - safely parse if it's a string
				if (typeof event.location === 'string') {
					try {
						const parsedLocation = JSON.parse(event.location);
						// Check if parsedLocation has a name property that includes the query
						if (parsedLocation && typeof parsedLocation === 'object' && 
							parsedLocation.name && typeof parsedLocation.name === 'string' && 
							parsedLocation.name.toLowerCase().includes(query)) {
							return true;
						}
					} catch (e) {
						// If parsing fails, check the raw string
						if (event.location.toLowerCase().includes(query)) return true;
					}
				} else if (event.location && typeof event.location === 'object') {
					// Type assertion for location object
					const locationObj = event.location as any;
					if (locationObj.name && typeof locationObj.name === 'string' && 
						locationObj.name.toLowerCase().includes(query)) {
						return true;
					}
				}

				// If hashtags exist and is an array, check if any hashtag includes the query
				if (event.hashtags && Array.isArray(event.hashtags)) {
					const hasMatchingTag = event.hashtags.some((tag) => {
						// Type assertion for tag object
						const tagObj = tag as any;
						return tagObj.name && typeof tagObj.name === 'string' && 
							   tagObj.name.toLowerCase().includes(query);
					});
					if (hasMatchingTag) return true;
				}

				// Check other potentially searchable fields
				if (event.description?.toLowerCase().includes(query)) return true;

				return false;
			});
			console.log(`Found ${filtered.length} events matching "${query}"`);
			setFilteredItems(filtered);
		}
	};

	const handleSearch = (query: string) => {
		console.log("History: received search query:", query);
		
		// Clear any previous timeouts to prevent race conditions
		if ((handleSearch as any).timeoutId) {
			clearTimeout((handleSearch as any).timeoutId);
		}
		
		// Set a small delay to avoid excessive processing during rapid typing
		(handleSearch as any).timeoutId = setTimeout(() => {
			console.log("History: processing search query:", query);
			setSearchQuery(query);
			// Force filtering immediately
			filterItems();
		}, 100);
	};

	const toggleTab = (tab: HistoryTab) => {
		// Reset search when changing tabs
		setSearchQuery("");
		
		// Change tab
		setActiveTab(tab);
		setShowTabDropdown(false);
		
		// Reset filtered items to show all items from the selected tab
		setFilteredItems(tab === "tickets" ? tickets : events);
	};

	// Add a search clear function that resets to showing all items
	const clearSearch = () => {
		setSearchQuery("");
		setFilteredItems(activeTab === "tickets" ? tickets : events);
	};

	// Calculate animation values
	const tabWidth = SCREEN_WIDTH / 2;
	const translateX = slideAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, tabWidth],
	});

	return (
		<SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
			{/* <View style={styles.header}>
				<Text style={styles.title}>History</Text>
			</View> */}

			{/* Modern Tab Selector */}
			<View style={styles.tabSelectorContainer}>
				<TouchableOpacity
					style={styles.tabButton}
					onPress={() => toggleTab("tickets")}
					activeOpacity={0.7}
				>
					<Ionicons
						name="ticket-outline"
						size={20}
						color={activeTab === "tickets" ? "#3B82F6" : "#6B7280"}
					/>
					<Text
						style={[
							styles.tabText,
							activeTab === "tickets" && styles.activeTabText,
						]}
					>
						Tickets
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.tabButton}
					onPress={() => toggleTab("events")}
					activeOpacity={0.7}
				>
					<Ionicons
						name="calendar-outline"
						size={20}
						color={activeTab === "events" ? "#3B82F6" : "#6B7280"}
					/>
					<Text
						style={[
							styles.tabText,
							activeTab === "events" && styles.activeTabText,
						]}
					>
						Events
					</Text>
				</TouchableOpacity>
				
				{/* Animated indicator */}
				<Animated.View 
					style={[
						styles.tabIndicator, 
						{ transform: [{ translateX }] }
					]} 
				/>
			</View>

			<View style={styles.searchWrapper}>
				<SearchComponent
					onSearch={handleSearch}
					placeholder={`Search ${activeTab}...`}
					externalValue={searchQuery}
				/>
				
				{/* Show status bar with item counts and search info */}
				<View style={styles.statusBar}>
					<Text style={styles.statusText}>
						{searchQuery.trim() 
							? `Found ${filteredItems.length} of ${activeTab === "tickets" ? tickets.length : events.length} ${activeTab}${tickets.filter(t => t.eventDetails).length < tickets.length ? ' (loading event details...)' : ''}`
							: `Showing all ${activeTab === "tickets" ? tickets.length : events.length} ${activeTab}`
						}
					</Text>
					
					{searchQuery.trim() && (
						<TouchableOpacity 
							style={styles.clearSearchButton}
							onPress={clearSearch}
						>
							<Text style={styles.clearSearchText}>Clear Search</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>

			{isLoading ? (
				<View style={styles.loaderContainer}>
					<ActivityIndicator size="large" color="#3B82F6" />
					<Text style={styles.loaderText}>Loading {activeTab}...</Text>
				</View>
			) : error ? (
				<View style={styles.errorContainer}>
					<Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity 
						style={styles.retryButton} 
						onPress={fetchData}
						activeOpacity={0.8}
					>
						<Text style={styles.retryButtonText}>Try Again</Text>
					</TouchableOpacity>
				</View>
			) : filteredItems.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Ionicons
						name={activeTab === "tickets" ? "ticket-outline" : "calendar-outline"}
						size={80}
						color="#9CA3AF"
					/>
					<Text style={styles.emptyTitle}>No {activeTab} found</Text>
					<Text style={styles.emptySubtitle}>
						{activeTab === "tickets"
							? "You have not purchased any tickets yet."
							: "You have not attended any events yet."}
					</Text>
				</View>
			) : (
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					{activeTab === "tickets"
						? (filteredItems as TicketWithEvent[]).map((ticket, index) => {
								try {
									if (!ticket || !ticket.id || !ticket.name || !ticket.valid_until || !ticket.event) {
										console.warn("Invalid ticket data:", ticket);
										return null;
									}
									
									return (
										<TicketCard
											key={`ticket-${ticket.id}`}
											ticket={{
												id: String(ticket.id),
												name: [ticket.name],
												date: new Date(ticket.valid_until).toLocaleDateString(),
												time: new Date(ticket.valid_until).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												}),
												type: `${ticket.name}`,
												idNumber: String(ticket.id),
												place: ticket.eventDetails?.location 
													? (() => {
														try {
															if (typeof ticket.eventDetails.location === 'string') {
																try {
																	const parsedLocation = JSON.parse(ticket.eventDetails.location);
																	if (parsedLocation && typeof parsedLocation === 'object' && parsedLocation.name) {
																		return parsedLocation.name;
																	}
																	return ticket.eventDetails.location || "Venue";
																} catch (e) {
																	return ticket.eventDetails.location || "Venue";
																}
															} else if (ticket.eventDetails.location && typeof ticket.eventDetails.location === 'object') {
																const locationObj = ticket.eventDetails.location as any;
																return locationObj.name || "Venue";
															}
															return "Venue";
														} catch (e) {
															return "Venue";
														}
													})()
													: "Venue",
												price: ticket.price,
												avatars: [],
												eventId: String(ticket.event),
												// Add event details for better display
												eventDetails: ticket.eventDetails ? {
													title: ticket.eventDetails.title,
													organizer: ticket.eventDetails.organizer?.profile?.name,
													coverImage: ticket.eventDetails.cover_image_url?.length > 0 ? ticket.eventDetails.cover_image_url[0] : undefined
												} : undefined
											}}
										/>
									);
								} catch (err) {
									console.error("Error rendering ticket:", err);
									return null;
								}
							})
						: (filteredItems as ApiEvent[]).map((event, index) => {
								try {
									if (!event || !event.id || !event.title) {
										console.warn("Skipping invalid event:", event);
										return null;
									}

									return (
										<WentCard
											key={`event-${event.id}`}
											event={{
												...event,
												title: event.title || "Untitled Event",
												id: event.id,
												organizer: event.organizer || {},
												description: event.description || "",
												start_date: event.start_date || new Date().toISOString(),
												location: (() => {
													try {
														if (typeof event.location === "string") {
															try {
																const parsedLocation = JSON.parse(event.location);
																if (parsedLocation && typeof parsedLocation === 'object' && parsedLocation.name) {
																	return parsedLocation.name;
																}
																return event.location;
															} catch (e) {
																return event.location || "No location";
															}
														} else if (event.location && typeof event.location === 'object') {
															const locationObj = event.location as any;
															return locationObj.name || "No location";
														}
														return "No location";
													} catch (e) {
														console.error("Error parsing location:", e);
														return "No location";
													}
												})(),
												cover_image_url: Array.isArray(event.cover_image_url)
													? event.cover_image_url
													: [],
											}}
										/>
									);
								} catch (err) {
									console.error("Error rendering event:", err);
									return null;
								}
							})}
				</ScrollView>
			)}
		</SafeAreaView>
	);
};

export default History;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9FAFB",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#FFFFFF",
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	title: {
		fontSize: 22,
		fontWeight: "700", 
		color: "#111827",
	},
	tabSelectorContainer: {
		flexDirection: "row",
		backgroundColor: "#FFFFFF",
		position: "relative",
		height: 60,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	tabButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		gap: 8,
	},
	tabText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#6B7280",
	},
	activeTabText: {
		color: "#3B82F6",
		fontWeight: "600",
	},
	tabIndicator: {
		position: "absolute",
		bottom: 0,
		width: SCREEN_WIDTH / 2,
		height: 3,
		backgroundColor: "#3B82F6",
		borderTopLeftRadius: 3,
		borderTopRightRadius: 3,
	},
	searchWrapper: {
		padding: 16,
		backgroundColor: "#FFFFFF",
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 32,
	},
	loaderContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
	},
	loaderText: {
		marginTop: 16,
		fontSize: 16,
		color: "#6B7280",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#FFFFFF",
	},
	errorText: {
		fontSize: 16,
		color: "#6B7280",
		textAlign: "center",
		marginTop: 16,
		marginBottom: 24,
	},
	retryButton: {
		backgroundColor: "#3B82F6",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
	},
	retryButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#FFFFFF",
	},
	emptyTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: "#374151",
		marginTop: 20,
	},
	emptySubtitle: {
		fontSize: 16,
		color: "#6B7280",
		textAlign: "center",
		marginTop: 12,
		maxWidth: "70%",
	},
	debugButton: {
		marginTop: 8,
		backgroundColor: '#E5E7EB',
		padding: 8,
		borderRadius: 8,
		alignSelf: 'center',
	},
	debugButtonText: {
		fontSize: 12,
		color: '#6B7280',
	},
	debugCountText: {
		fontSize: 12,
		color: '#6B7280',
		textAlign: 'center',
		marginTop: 4,
	},
	statusBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 8,
		paddingHorizontal: 4,
	},
	statusText: {
		fontSize: 12,
		color: '#6B7280',
	},
	clearSearchButton: {
		paddingVertical: 4,
		paddingHorizontal: 8,
		backgroundColor: '#EFF6FF',
		borderRadius: 4,
	},
	clearSearchText: {
		fontSize: 12,
		color: '#3B82F6',
		fontWeight: '500',
	},
});
