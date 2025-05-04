import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useAuth } from './hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';
import { CustomDrawer } from './components/CustomDrawer';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    // const { isAuthenticated, isLoading } = useAuth();

    // if (isLoading) {
    //     return (
    //         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //             <ActivityIndicator size="large" color="#007AFF" />
    //         </View>
    //     );
    // }

    return (
        <>
            <StatusBar style="dark" />
            <Drawer
                screenOptions={{
                    headerShown: false,
                    drawerStyle: {
                        backgroundColor: '#fff',
                        width: 280,
                    },
                    drawerType: 'front',
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
        </>
    );
}
