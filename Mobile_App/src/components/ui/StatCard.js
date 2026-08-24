import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../styles/theme";

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = COLORS.primary, style }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {Icon && (
          <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
            <Icon size={18} color={color} />
          </View>
        )}
      </View>

      <Text style={styles.value}>{value}</Text>

      {(subtitle || trend) && (
        <View style={styles.footer}>
          {trend && (
            <Text style={[styles.trend, { color: trend.startsWith("+") ? COLORS.green : "#ef4444" }]}>
              {trend}
            </Text>
          )}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    padding: 14,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.subText,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  iconWrap: {
    height: 32,
    width: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.dark,
    marginBottom: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trend: {
    fontSize: 11,
    fontWeight: "800",
    marginRight: 4,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.subText,
  },
});
