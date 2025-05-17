import { Stack } from "expo-router";
import { PubNubProvider } from "pubnub-react";
import pubnub from "@/utils/pubnub";
import { Colors } from "@/constants/Colors";

export default function Layout() {
  return (
    <PubNubProvider client={pubnub}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </PubNubProvider>
  );
}
