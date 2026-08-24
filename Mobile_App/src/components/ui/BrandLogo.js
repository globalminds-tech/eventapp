import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const BrandLogo = ({ textColor = "#ffffff", fontSize = 20, style }) => {
  return (
    <View style={[styles.logoWrap, style]}>
      <View style={styles.logoIconWrap}>
        <View style={[styles.logoPill, { backgroundColor: "#3b82f6", transform: [{ rotate: "-15deg" }] }]} />
        <View style={[styles.logoPill, { backgroundColor: "#f97316", transform: [{ rotate: "10deg" }] }]} />
        <View style={[styles.logoPill, { backgroundColor: "#22c55e", transform: [{ rotate: "-5deg" }] }]} />
      </View>
      <Text style={[styles.logoText, { color: textColor, fontSize }]}>BookMyEvent</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIconWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  logoPill: {
    width: 7,
    height: 18,
    borderRadius: 10,
    marginRight: 3,
  },
  logoText: {
    fontWeight: "900",
    letterSpacing: -0.5,
  },
});

export default BrandLogo;
