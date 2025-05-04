// app/(tabs)/profile/components/ContentTab.tsx
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ContentTabProps } from "../constants/types";
import { styles } from "../styles/profileStyles";

const ContentTab: React.FC<ContentTabProps> = ({
  label,
  iconName,
  isActive,
  tabName,
  onPress,
  activeContentTab,
}) => {
  // Determine if we should show only icon or only label
  const showOnlyIcon = tabName !== "history" && activeContentTab === "history";

  return (
    <TouchableOpacity
      style={[
        styles.contentTab,
        isActive && tabName === "history"
          ? styles.activeHistoryContentTab
          : isActive
          ? styles.activeContentTab
          : null,
        showOnlyIcon && styles.iconOnlyTab,
      ]}
      onPress={onPress}
    >
      <MaterialIcons name={iconName} size={16} color={"#111"} />

      {!showOnlyIcon && (
        <Text
          style={[
            styles.contentTabText,
            isActive && styles.activeContentTabText,
            tabName === "history" && isActive && styles.activeHistoryTabText,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
export default ContentTab;
