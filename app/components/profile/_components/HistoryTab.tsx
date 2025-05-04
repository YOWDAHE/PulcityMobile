// app/(tabs)/profile/components/HistoryTab.tsx
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { HistoryTabProps } from "../constants/types";
import { styles } from "../styles/profileStyles";

const HistoryTab: React.FC<HistoryTabProps> = ({
  label,
  isActive,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.historyTab, isActive && styles.activeHistoryTab]}
    onPress={onPress}
  >
    <Text
      style={[styles.historyTabText, isActive && styles.activeHistoryTabText]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default HistoryTab;
