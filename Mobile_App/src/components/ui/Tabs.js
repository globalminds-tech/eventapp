import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../../styles/theme";

export const Tabs = ({ tabs = [], activeTab, onTabChange, style }) => {
  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.8}
          >
            {Icon && <Icon size={14} color={isActive ? COLORS.primary : COLORS.subText} style={{ marginRight: 6 }} />}
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {tab.badge !== undefined && (
              <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                  {tab.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.subText,
  },
  labelActive: {
    color: COLORS.dark,
    fontWeight: "900",
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeInactive: { backgroundColor: "#e2e8f0" },
  badgeActive: { backgroundColor: "#e0f2fe" },
  badgeText: { fontSize: 10, fontWeight: "900", color: COLORS.subText },
  badgeTextActive: { color: COLORS.primary },
});
