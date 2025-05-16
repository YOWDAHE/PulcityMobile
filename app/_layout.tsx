import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useAuth } from './hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';
import { CustomDrawer } from './components/CustomDrawer';
import { StatusBar } from 'expo-status-bar';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, useFonts } from '@expo-google-fonts/poppins';

export default function RootLayout() {
    // const { isAuthenticated, isLoading } = useAuth();

    // if (isLoading) {
    //     return (
    //         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //             <ActivityIndicator size="large" color="#007AFF" />
    //         </View>
    //     );
    // }
    const [fontsLoaded] = useFonts({
            poppins: Poppins_400Regular,	
            poppinsMedium: Poppins_500Medium,
            poppinsBold: Poppins_600SemiBold,
        });

    return (
					<View style={{ flex: 1 }}>
						<StatusBar style="dark" />
						<Drawer
							screenOptions={{
								headerShown: false,
								drawerStyle: {
									backgroundColor: "#fff",
									width: 280,
								},
								drawerType: "front",
							}}
							drawerContent={() => <CustomDrawer />}
						>
							<Drawer.Screen
								name="(tabs)"
								options={{
									headerShown: false,
								}}
							/>
						</Drawer>
					</View>
				);
}
