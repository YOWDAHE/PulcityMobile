import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Button,
  TextInput,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
0;
import ButtonComponent from "@/components/ButtonComponent";
import HeaderComponent from "@/components/HeaderComponent";
import TicketCard from "@/components/TicketCard";
import { router } from "expo-router";

interface BuyTicketsScreenProps {
  onBack?: () => void;
  onContinue?: () => void;
  // onBuyForAnother?: () => void;
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
  const [searchQuery, setSearchQuery] = useState("");

  const handleSave = () => {
    onSave({ name, email, phone });
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.handleBar} />

              <TextInput
                style={styles.searchBar}
                placeholder="Search a user..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <Text style={styles.modalTitle}>or add by contact</Text>

              <View style={styles.modalScrollView}>
                <View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                      style={styles.input}
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
                </View>
                <Button title="Done" onPress={handleSave} />
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const BuyTicketsScreen: React.FC<BuyTicketsScreenProps> = ({
  onBack = () => router.back,
  onContinue = () => console.log("Continue pressed"),
  // onBuyForAnother = () => console.log("Buy for another pressed"),
}) => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contacts, setContacts] = useState<
    Record<string, { name: string; email: string; phone: string }>
  >({});

  const handleBuyForAnother = (ticketType: string) => {
    console.log("Buy for another pressed......", ticketType);
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
            onBuyForAnother={handleBuyForAnother}
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
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSave={handleSaveContact}
      />
    </View>
  );
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.1)",
		justifyContent: "flex-end",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "flex-end",
	},
	modalContent: {
		backgroundColor: "white",
		padding: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: "80%",
		height: "100%",
		// paddingBottom: 200,
	},
	modalScrollView: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "space-between",
		height: "100%",
	},
	handleBar: {
		width: 40,
		height: 4,
		backgroundColor: "#ccc",
		borderRadius: 2,
		alignSelf: "center",
		marginBottom: 15,
	},
	modalTitle: {
		fontSize: 12,
    marginVertical: 20,
    opacity: 0.5,
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
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F5F7FB",
    borderRadius: 20,
    height: 40,
		paddingHorizontal: 15,
		fontSize: 16,
		color: "black",
		marginBottom: 15,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
});

export default BuyTicketsScreen;