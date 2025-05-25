import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const Loading = () => {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -30,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [translateY]);

    return (
        <View style={styles.container}>
            <Animated.View style={{ transform: [{ translateY }] }}>
                <Ionicons name="location-outline" size={64} color="#3B82F6" />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: height,
        backgroundColor: "white",
    },
});

export default Loading;