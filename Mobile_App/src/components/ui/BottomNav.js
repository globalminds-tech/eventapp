import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { COLORS } from "../../styles/theme";

export const BottomNav = ({ items = [], activeKey, onTabSelect }) => {
  return (
    <View style={styles.navContainer}>
      <View style={styles.navCard}>
        {items.map((item) => {
          const isActive = activeKey === item.key;
          const IconComponent = item.icon;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => onTabSelect(item.key)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <IconComponent
                  size={20}
                  color={isActive ? "#f97316" : "#64748b"}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: "absolute",
    bottom: 12,
    left: 14,
    right: 14,
    zIndex: 9999,
  },
  navCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 32,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tabItemActive: {
    backgroundColor: "rgba(249, 115, 22, 0.1)",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    backgroundColor: "#fff7ed",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 2,
  },
  tabLabelActive: {
    color: "#f97316",
    fontWeight: "900",
  },
});
