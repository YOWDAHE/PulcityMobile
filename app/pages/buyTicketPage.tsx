import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Button,
} from "react-native";
0;
import ButtonComponent from "@/components/ButtonComponent";
import HeaderComponent from "@/components/HeaderComponent";
import TicketCard from "@/components/TicketCard";
import { Ionicons } from "@expo/vector-icons";

interface BuyTicketsScreenProps {
  onBack?: () => void;
  onContinue?: () => void;
  onBuyForAnother?: () => void;
}

const ContactModal = ({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (contact: { name: string; email: string; phone: string }) => void;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState('');

  const handleSave = () => {
    onSave({ name, email, phone });
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Search..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>
        <Text style={styles.modalTitle}>Add Contact</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Eg. John Doe"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Eg. johndoe@gmail.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Eg. +251 ..."
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <Button title="Done" onPress={handleSave} />
      </View>
    </View>
  );
};

const BuyTicketsScreen: React.FC<BuyTicketsScreenProps> = ({
  onBack = () => console.log("Back pressed"),
  onContinue = () => console.log("Continue pressed"),
  onBuyForAnother = () => console.log("Buy for another pressed"),
}) => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contacts, setContacts] = useState<
    Record<string, { name: string; email: string; phone: string }>
  >({});
  const ticketData = [
    {
      type: "Normal",
      rate: "200 ETB/person",
      date: "Dec 16, 2024",
      time: "11:00 AM",
    },
    {
      type: "VIP",
      rate: "400 ETB/person",
      date: "Dec 16, 2024",
      time: "11:00 AM",
    },
    {
      type: "VVIP",
      rate: "600 ETB/person",
      date: "Dec 16, 2024",
      time: "11:00 AM",
    },
  ];

  const handleBuyForAnother = (ticketType: string) => {
    console.log("Buy for another pressed......", ticketType);
    setSelectedTicket(ticketType);
    setShowContactModal(true);
  };

  const handleSaveContact = (contact: {
    name: string;
    email: string;
    phone: string;
  }) => {
    if (selectedTicket) {
      setContacts((prev) => ({
        ...prev,
        [selectedTicket]: contact,
      }));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <HeaderComponent title="Buy Tickets" onBack={onBack} />

        <View style={styles.pageTitle}>
          <Text style={styles.pageTitleText}>Tamino Tour 2024</Text>
        </View>

        {ticketData.map((ticket, index) => (
          <TicketCard
            key={index}
            type={ticket.type}
            rate={ticket.rate}
            date={ticket.date}
            time={ticket.time}
            onBuyForAnother={() => handleBuyForAnother(ticket.type)}
            isSelected={selectedTicket === ticket.type}
            onSelect={() => setSelectedTicket(ticket.type)}
          />
        ))}

        <View style={styles.buttonContainer}>
          <ButtonComponent
            text="Continue"
            onPress={onContinue}
            customStyles={styles.continueButton}
          />
        </View>
      </ScrollView>

      <ContactModal
        visible={true}
        onClose={() => setShowContactModal(false)}
        onSave={handleSaveContact}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 10,
    height: 40,
    marginHorizontal: 16,
    marginTop: 16,
  },
  icon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#333',
  },
  modalOverlay: {
    // ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 10,
    // fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#457B9D",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    marginBottom: 20,
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  pageTitleText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    fontFamily: "Poppins-SemiBold",
  },
  buttonContainer: {
    marginTop: 16,
  },
  continueButton: {
    width: "100%",
  },
});

export default BuyTicketsScreen;
