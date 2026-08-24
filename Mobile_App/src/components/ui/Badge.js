import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../styles/theme";

export const Badge = ({ children, variant = "default", style, textStyle }) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case "success":
        return styles.bgSuccess;
      case "warning":
        return styles.bgWarning;
      case "danger":
        return styles.bgDanger;
      case "info":
        return styles.bgInfo;
      case "secondary":
        return styles.bgSecondary;
      default:
        return styles.bgDefault;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "success":
        return styles.textSuccess;
      case "warning":
        return styles.textWarning;
      case "danger":
        return styles.textDanger;
      case "info":
        return styles.textInfo;
      case "secondary":
        return styles.textSecondary;
      default:
        return styles.textDefault;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={[styles.text, getTextStyle(), textStyle]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  bgDefault: { backgroundColor: "#e0f2fe" },
  textDefault: { color: "#0369a1" },

  bgSuccess: { backgroundColor: "#dcfce7" },
  textSuccess: { color: COLORS.green },

  bgWarning: { backgroundColor: "#ffedd5" },
  textWarning: { color: COLORS.amber },

  bgDanger: { backgroundColor: "#fee2e2" },
  textDanger: { color: "#dc2626" },

  bgInfo: { backgroundColor: "#f0f9ff" },
  textInfo: { color: COLORS.primary },

  bgSecondary: { backgroundColor: "#f1f5f9" },
  textSecondary: { color: COLORS.subText },
});
