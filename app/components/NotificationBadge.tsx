import React from 'react';
import { View, StyleSheet } from 'react-native';

interface NotificationBadgeProps {
  visible: boolean;
  count?: number;
  size?: 'small' | 'medium' | 'large';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  visible, 
  count, 
  size = 'small' 
}) => {
  if (!visible) return null;
  
  const badgeSize = {
    small: 8,
    medium: 16,
    large: 20
  }[size];

  return (
    <View 
      style={[
        styles.badge, 
        { width: badgeSize, height: badgeSize },
        size === 'small' ? styles.small : null
      ]}
    />
  );
};

const styles = StyleSheet.create({
	badge: {
		position: "absolute",
		top: -4,
		right: -4,
		backgroundColor: "#FF3B30",
		borderRadius: 100,
		zIndex: 10,
		borderWidth: 1,
		borderColor: "white",
	},
	small: {
		top: 10,
		right: 10,
		width: 10,
		height: 10,
	},
});

export default NotificationBadge; 