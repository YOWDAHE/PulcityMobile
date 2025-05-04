// app/(tabs)/profile/components/StatTab.tsx
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { StatTabProps } from "../constants/types";
import { styles } from "../styles/profileStyles";

const StatTab: React.FC<StatTabProps> = ({
  label,
  value,
  icon: Icon,
  iconName,
  isActive,
  onPress,
}) => (
  <TouchableOpacity style={styles.statTab} onPress={onPress}>
    <View style={styles.statContent}>
      {value && <Text style={styles.statNumber}>{value}</Text>}
      <View style={styles.statLabelContainer}>
        {/* <Icon name={iconName as any} size={16} color="#3B82F6" /> */}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default StatTab;
