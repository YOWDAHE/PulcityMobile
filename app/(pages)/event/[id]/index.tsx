import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import mockImage from "@/assets/dummy/eventMock.png";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const App = () => {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Image source={mockImage} style={styles.image} />
        <View style={styles.heroInformation}>
          <Text style={styles.title}>Tamino Tour 2024</Text>
          <View style={{ display: "flex", gap: 10, flexDirection: "row" }}>
            <View style={styles.infoTextContainer}>
              <Ionicons name="calendar" color="white" />
              <Text style={styles.infoText}>Dec 16, 2024</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Ionicons name="time-outline" color="white" />
              <Text style={styles.infoText}>8:00 PM</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Ionicons name="location-outline" color="white" />
              <Text style={styles.infoText}>Millennium Hall, Bole</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.about}>About Event</Text>
        <Text style={styles.description}>
          Join Tamino as he takes the stage for his highly anticipated Tamino
          Tour 2024. Known for his soul-stirring voice and ethereal soundscapes,
          Tamino blends modern indie with Middle Eastern influences to create a
          unique and captivating sonic atmosphere.
        </Text>
        <Text style={styles.whoIsComing}>Who is coming?</Text>
        <Text style={styles.guests}>
          Alongside the main attraction (Tamino), there will be opening guests
          like Jacob Collier and Tori Kelly.
        </Text>
        <TouchableOpacity style={styles.button} onPress={()=> router.push('/ticket/123')}>
          <Text style={styles.buttonText}>Buy Tickets</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 350,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  infoContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    paddingBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "white",
  },
  infoTextContainer: { 
    flexDirection: "row", 
    gap: 8,
    alignItems: 'center'
 },
  time: {
    fontSize: 16,
    color: "#666",
  },
  location: {
    fontSize: 16,
    color: "#666",
  },
  about: {
    // fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 10,
  },
  description: {
    // fontSize: 16,
    marginTop: 8,
  },
  whoIsComing: {
    // fontSize: 18,
    fontWeight: "bold",
    marginTop: 28,
    marginBottom: 10,
  },
  guests: {
    // fontSize: 16,
    marginTop: 8,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  hero: {
    position: "relative",
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  heroInformation: {
    position: "absolute",
    bottom: 0,
    padding: 20,
    paddingHorizontal: 30,
  },
});

export default App;
