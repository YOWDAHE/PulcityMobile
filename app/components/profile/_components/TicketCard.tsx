import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ticket, TicketType } from "../constants/types";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getEventById } from "@/actions/event.actions";
import { Event } from "@/models/event.model";

interface TicketCardProps {
  ticket: Ticket;
}
const ticketTypeConfig: Record<
  string,
  {
    color: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    bgColor: string;
  }
> = {
  Standard: {
    color: "#3B82F6",
    icon: "ticket-outline",
    bgColor: "#EFF6FF",
  },
  VIP: {
    color: "#F59E0B",
    icon: "star-outline",
    bgColor: "#FFFBEB",
  },
  VVIP: {
    color: "#10B981",
    icon: "diamond-outline",
    bgColor: "#ECFDF5",
  },
  Premium: {
    color: "#8B5CF6",
    icon: "medal-outline",
    bgColor: "#F5F3FF",
  },
  Student: {
    color: "#EC4899",
    icon: "school-outline",
    bgColor: "#FDF2F8",
  },
};

const defaultTypeConfig = {
  color: "#3B82F6",
  icon: "ticket-outline" as React.ComponentProps<typeof Ionicons>["name"],
  bgColor: "#EFF6FF",
};

const getTicketTypeConfig = (type: string) => {
  return ticketTypeConfig[type] || defaultTypeConfig;
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const typeConfig = getTicketTypeConfig(ticket.type);

  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<{
    name: string;
    avatar: any;
  } | null>(null);
  
  // Add state for event data
  const [eventData, setEventData] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch event data when component mounts
  useEffect(() => {
    const fetchEventData = async () => {
      if (!ticket.eventId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const eventId = parseInt(ticket.eventId);
        if (isNaN(eventId)) {
          setError("Invalid event ID");
          return;
        }
        
        const event = await getEventById(eventId);
        setEventData(event);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Could not load event details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [ticket.eventId]);

  const formatNames = () => {
    if (ticket.name.length === 1) return ticket.name[0];
    if (ticket.name.length === 2) return ticket.name.join(" & ");
    return `${ticket.name[0]} + ${ticket.name.length - 1} others`;
  };

  const handleAvatarPress = (index: number) => {
    setSelectedAvatar({
      name: ticket.name[index],
      avatar: ticket.avatars[index],
    });
    setModalVisible(true);
  };

  const handleViewTicket = () => {
    router.push(`/checkout/${eventData?.id}/${eventData?.id}`);
  };

  // Parse location
  const getLocationName = () => {
    if (!eventData || !eventData.location) return ticket.place || "Venue";
    
    try {
      if (typeof eventData.location === 'string') {
        const parsedLocation = JSON.parse(eventData.location);
        return parsedLocation.name || ticket.place || "Venue";
      }
      // Use type assertion to handle the location object
      const locationObj = eventData.location as { name?: string };
      return locationObj.name || ticket.place || "Venue";
    } catch (error) {
      return ticket.place || "Venue";
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleViewTicket}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.ticketType}>{ticket.type}</Text>
            <Text style={styles.ticketId}>#{ticket.idNumber}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>${ticket.price}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Event title */}
        {(eventData || isLoading) && (
          <View style={styles.eventTitleContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <View>
                <Text style={styles.eventTitle}>
                  {eventData?.title || "Event Details"}
                </Text>
                <Text style={styles.organizerName}>
                  {eventData?.organizer?.profile?.name || "Organizer"}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{ticket.date}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{ticket.time}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#6B7280" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{getLocationName()}</Text>
            </View>
          </View>
        </View>

        {/* Show event image if available */}
        {eventData?.cover_image_url && eventData.cover_image_url.length > 0 && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: eventData.cover_image_url[0] }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.dotPattern}>
            {[...Array(10)].map((_, i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={handleViewTicket}
          >
            <Text style={styles.viewButtonText}>View Ticket Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image source={selectedAvatar?.avatar} style={styles.modalAvatar} />
            <Text style={styles.modalName}>{selectedAvatar?.name}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  gradientHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  ticketId: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  eventTitleContainer: {
    marginBottom: 16,
    minHeight: 40,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  organizerName: {
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
  },
  infoSection: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    height: 120,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  footer: {
    marginTop: 8,
  },
  dotPattern: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  modalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 20,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
});

export default TicketCard;
