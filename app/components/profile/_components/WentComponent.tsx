import {
	TouchableOpacity,
	StyleSheet,
	Text,
	View,
	Image,
    Platform,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "@/models/event.model";
import { router } from "expo-router";

const WentCard = ({ event }: { event: Event }) => {
    
    const handlePress = () => {
        router.push(`/event/${event.id}`);
    };
    
	return (
		<TouchableOpacity 
            style={styles.container} 
            onPress={handlePress}
            activeOpacity={0.9}
        >
			<Image
				source={{ uri: event.cover_image_url[0] }}
				style={styles.coverImage}
				accessibilityLabel={event.title}
			/>
			<View style={styles.contentWrapper}>
				<View style={styles.contentContainer}>
					<Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                        {event.title}
                    </Text>
                    
                    <View style={styles.organizerContainer}>
                        <Image 
                            source={{ uri: event.organizer.profile.logo_url }} 
                            style={styles.organizerLogo} 
                        />
                        <Text style={styles.organizerName}>
                            {event.organizer.profile.name}
                        </Text>
                    </View>
                    
                    <View style={styles.statsContainer}>
                        <View style={styles.attendeesStat}>
                            <Ionicons name="people" size={14} color="#6B7280" />
                            <Text style={styles.statText}>
                                {event.attendee_count || 0} attended
                            </Text>
                        </View>
                        
                        {event.rated && (
                            <View style={styles.ratingStat}>
                                <Ionicons name="star" size={14} color="#FFBB0A" />
                                <Text style={styles.statText}>
                                    {typeof event.rating === 'number' 
                                        ? event.rating 
                                        : (event.rating?.value || event.average_rating || 0)
                                    }
                                </Text>
                            </View>
                        )}
                    </View>
                    
					<View style={styles.detailsContainer}>
						<View style={styles.detailItem}>
							<Ionicons name="calendar-outline" size={14} color="#6B7280" />
							<Text style={styles.detailText}>
								{new Date(event.start_date).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}
							</Text>
						</View>
						<View style={styles.detailItem}>
							<Ionicons name="time-outline" size={14} color="#6B7280" />
							<Text style={styles.detailText}>
								{new Date(event.start_time).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Text>
						</View>
                        <View style={styles.detailItem}>
							<Ionicons name="location-outline" size={14} color="#6B7280" />
							<Text style={styles.detailText} numberOfLines={1}>
								{(() => {
									try {
										if (typeof event.location === 'string') {
											try {
												const parsedLocation = JSON.parse(event.location);
												return parsedLocation.name || 'Venue';
											} catch (e) {
												return event.location || 'Venue';
											}
										}
										return 'Venue';
									} catch (e) {
										return 'Venue';
									}
								})()}
							</Text>
						</View>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

export default WentCard;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		width: "100%",
		padding: 12,
		marginBottom: 16,
		borderRadius: 12,
		backgroundColor: "#FFFFFF",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 4,
			},
			android: {
				elevation: 2,
			},
		}),
	},
	coverImage: {
		width: 100,
		height: 100,
		borderRadius: 8,
		resizeMode: "cover",
	},
	contentWrapper: {
		flex: 1,
		marginLeft: 12,
	},
	contentContainer: {
		flexDirection: "column",
		justifyContent: "space-between",
		height: "100%",
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 6,
	},
    organizerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    organizerLogo: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 6,
    },
    organizerName: {
        fontSize: 12,
        color: "#6B7280",
    },
    statsContainer: {
        flexDirection: "row",
        marginBottom: 8,
    },
    attendeesStat: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
    },
    ratingStat: {
        flexDirection: "row",
        alignItems: "center",
    },
    statText: {
        fontSize: 12,
        color: "#6B7280",
        marginLeft: 4,
    },
	detailsContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		flexWrap: "wrap",
	},
	detailItem: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 10,
	},
	detailText: {
		color: "#6B7280",
		fontSize: 12,
		marginLeft: 4,
	},
});
