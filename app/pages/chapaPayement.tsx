import axios from "axios";
import React, { useState, useEffect } from "react";
import { View, Button, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import ENV from "../utils/env";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";

const ChapaPayment = () => {
    const [loading, setLoading] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState(null);
    const [showBottomBar, setShowBottomBar] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        if (!showBottomBar) {
            navigation.setOptions({ tabBarVisible: false });
        } else {
            navigation.setOptions({ tabBarVisible: true });
        }
    }, [showBottomBar]);

    const handlePayment = async () => {
		try {
			setShowBottomBar(false);
            setLoading(true);

            console.log(ENV.BASE_URL);
            const response = await axios.post(
                "http://192.168.43.29:3000/api/chapa/initialize-transaction",
                // "http://localhost:3000/api/chapa/initialize-transaction",
                {
                    first_name: "jODAHE",
                    last_name: "Doe",
                    email: "john@gmail.com",
                    phone_number: "0911121314",
                    currency: "ETB",
                    amount: "200",
                    return_url: "https://Pulcuity/return",
                }
            );

            console.log("response", response);
            if (response.status === 200) {
                console.log("Payment initialized successfully");
                setCheckoutUrl(response.data.data.checkout_url);
            } else {
                console.error("Failed to initialize payment");
                alert("Failed to initialize payment");
            }
		} catch (error) {
			setShowBottomBar(true);
            console.error(error);
            alert("An error occurred while processing the payment");
        } finally {
            setLoading(false);
        }
    };

    if (checkoutUrl) {
        return (
            <View style={styles.webViewContainer}>
                <WebView
                    source={{ uri: checkoutUrl }}
                    style={styles.webView}
                    onLoadEnd={(event) => {
                        const { url } = event.nativeEvent;
                        console.log("URL::: ", url);
                        if (url.includes("https://Pulcuity/return")) {
                            const params = new URLSearchParams(new URL(url).search);
                            const status = params.get("status");
                            const tx_ref = params.get("tx_ref");

                            console.log("Payment Status:", status);
                            console.log("Transaction Reference:", tx_ref);

                            setCheckoutUrl(null);
                        }
                    }}
                />
                <Button title="Done" onPress={() => setCheckoutUrl(null)} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Button title="Pay Now" onPress={handlePayment} disabled={loading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    webViewContainer: {
        flex: 1,
    },
    webView: {
        flex: 1,
        marginTop: Constants.statusBarHeight,
    },
});

export default ChapaPayment;
