import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2, AlertCircle, Info } from "lucide-react-native";
import { COLORS } from "../../styles/theme";

export const Toast = ({ message, type = "success", style }) => {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle size={18} color="#ef4444" />;
      case "info":
        return <Info size={18} color={COLORS.primary} />;
      default:
        return <CheckCircle2 size={18} color={COLORS.green} />;
    }
  };

  const getStyle = () => {
    switch (type) {
      case "error":
        return styles.bgError;
      case "info":
        return styles.bgInfo;
      default:
        return styles.bgSuccess;
    }
  };

  return (
    <View style={[styles.container, getStyle(), style]}>
      {getIcon()}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  bgSuccess: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  bgError: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  bgInfo: { backgroundColor: "#f0f9ff", borderColor: "#bae6fd" },
  message: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.dark,
    flex: 1,
  },
});
