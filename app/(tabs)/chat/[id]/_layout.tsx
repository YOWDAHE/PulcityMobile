import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { PubNubProvider } from 'pubnub-react'
import pubnub from '@/utils/pubnub';

export default function _layout() {
  return (
    <PubNubProvider client={pubnub}>
				<Stack screenOptions={{ headerShown: false }} />
			</PubNubProvider>
		);
}