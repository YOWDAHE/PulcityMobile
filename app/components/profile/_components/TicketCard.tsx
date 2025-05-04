import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { Ticket, TicketType } from "../constants/types";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface TicketCardProps {
  ticket: Ticket;
}
const ticketTypeConfig: Record<
  TicketType,
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

const getTicketTypeConfig = (type: string) => {
  return ticketTypeConfig[type as TicketType] || ticketTypeConfig.Standard;
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const typeConfig = ticketTypeConfig[ticket.type] || ticketTypeConfig.Standard;

  const router = useRouter();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedAvatar, setSelectedAvatar] = React.useState<{
    name: string;
    avatar: any;
  } | null>(null);

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

  return (
    <View style={styles.card}>
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

      <View
        style={[
          styles.ticketTypeContainer,
          { backgroundColor: typeConfig.bgColor },
        ]}
      >
        <Ionicons
          name={typeConfig.icon}
          size={16}
          color={typeConfig.color}
          style={styles.ticketTypeIcon}
        />
        <Text style={[styles.ticketType, { color: typeConfig.color }]}>
          [{ticket.type} ticket]
        </Text>
      </View>
      <View style={styles.avatarsContainer}>
        {ticket.avatars.slice(0, 3).map((avatar, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleAvatarPress(index)}
          >
            <Image
              source={avatar}
              style={[styles.avatar, index > 0 ? { marginLeft: -10 } : {}]}
            />
          </TouchableOpacity>
        ))}
        {ticket.avatars.length > 3 && (
          <View style={styles.moreAvatars}>
            <Text style={styles.moreAvatarsText}>
              +{ticket.avatars.length - 3}
            </Text>
          </View>
        )}
        <Text style={styles.ticketName}>{formatNames()}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.viewDetailButton}
          onPress={() =>
            router.push({
              pathname: "/(pages)/ticket/[id]",
              params: {
                id: ticket.id,
                ticket: JSON.stringify(ticket),
              },
            })
          }
        >
          <Text style={styles.viewDetailText}>View detail</Text>
          <Ionicons name="chevron-forward" color="#457B9D" size={14} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewEventButton}
          onPress={() =>
            router.push({
              pathname: "/(pages)/event/[id]",
              params: { id: ticket.eventId },
            })
          }
        >
          <Text style={styles.viewEventText}>View Event</Text>
          <Ionicons name="chevron-forward" color="#457B9D" size={14} />
        </TouchableOpacity>
      </View>

      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{ticket.date}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ticketTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  ticketTypeIcon: {
    marginRight: 6,
  },
  ticketType: {
    fontSize: 12,
    fontWeight: "500",
  },

  avatarsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  ticketName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  viewDetailButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "transparent",
    textAlign: "left",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  viewDetailText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "500",
  },
  viewEventButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "transparent",
    textAlign: "left",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  viewEventText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "500",
  },
  dateContainer: {},
  dateText: {
    fontSize: 12,
    color: "#6B7280",
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  moreAvatars: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  moreAvatarsText: {
    fontSize: 12,
    color: "#6B7280",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  modalName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#3B82F6",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
  },
});

export default TicketCard;
