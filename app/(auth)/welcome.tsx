import { StyleSheet, Text, View, Dimensions, Pressable, ImageBackground } from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  BounceIn
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Welcome = () => {
  const router = useRouter();

  return (
    <ImageBackground 
      source={require('../../assets/images/welcome-bg.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Logo and Title Section */}
        <Animated.View 
          entering={BounceIn.delay(200).duration(1000)}
          style={styles.logoContainer}
        >
          <Ionicons name="ticket-outline" size={80} color="#fff" />
          <Text style={styles.appName}>Pulcity</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text 
          entering={FadeInDown.delay(600).duration(1000)}
          style={styles.tagline}
        >
          Your Gateway to Unforgettable Events
        </Animated.Text>

        {/* Buttons Container */}
        <Animated.View 
          entering={FadeInUp.delay(1000).duration(1000)}
          style={styles.buttonContainer}
        >
          <Pressable 
            style={[styles.button, styles.signUpButton]} 
            onPress={() => router.push("/(auth)/signUp")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.button, styles.loginButton]} 
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={[styles.buttonText, styles.loginButtonText]}>I already have an account</Text>
          </Pressable>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: "space-between",
    paddingVertical: height * 0.15,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  tagline: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 32,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 15,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  signUpButton: {
    backgroundColor: "#007AFF",
  },
  loginButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginButtonText: {
    color: "#fff",
  },
});
