import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../styles/theme";

export const Card = ({ children, style, variant = "default" }) => {
  return (
    <View style={[styles.card, variant === "elevated" && styles.elevated, style]}>
      {children}
    </View>
  );
};

export const CardHeader = ({ children, style }) => (
  <View style={[styles.cardHeader, style]}>{children}</View>
);

export const CardTitle = ({ children, style }) => (
  <Text style={[styles.cardTitle, style]}>{children}</Text>
);

export const CardDescription = ({ children, style }) => (
  <Text style={[styles.cardDescription, style]}>{children}</Text>
);

export const CardContent = ({ children, style }) => (
  <View style={[styles.cardContent, style]}>{children}</View>
);

export const CardFooter = ({ children, style }) => (
  <View style={[styles.cardFooter, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    padding: 16,
    marginBottom: 12,
  },
  elevated: {
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.dark,
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.subText,
    marginTop: 2,
  },
  cardContent: {
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
  },
});
