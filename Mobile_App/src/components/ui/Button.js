import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS } from "../../styles/theme";

export const Button = ({
  children,
  onPress,
  variant = "default", // default | secondary | outline | ghost | danger | success
  size = "md",          // sm | md | lg
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon: Icon,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.bgSecondary;
      case "outline":
        return styles.bgOutline;
      case "ghost":
        return styles.bgGhost;
      case "danger":
        return styles.bgDanger;
      case "success":
        return styles.bgSuccess;
      default:
        return styles.bgDefault;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return styles.textDark;
      case "secondary":
        return styles.textPrimary;
      default:
        return styles.textWhite;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return styles.sizeSm;
      case "lg":
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? COLORS.primary : "#ffffff"} size="small" />
      ) : (
        <>
          {Icon && <Icon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} color={variant === "outline" ? COLORS.primary : "#ffffff"} style={{ marginRight: 6 }} />}
          <Text style={[styles.textBase, getTextStyle(), size === "sm" && { fontSize: 12 }, textStyle]}>
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  sizeSm: { paddingHorizontal: 10, paddingVertical: 6 },
  sizeMd: { paddingHorizontal: 16, paddingVertical: 10 },
  sizeLg: { paddingHorizontal: 20, paddingVertical: 14 },

  bgDefault: { backgroundColor: COLORS.primary },
  bgSecondary: { backgroundColor: "#f0f9ff", borderWidth: 1, borderColor: "#bae6fd" },
  bgOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.primary },
  bgGhost: { backgroundColor: "transparent" },
  bgDanger: { backgroundColor: "#ef4444" },
  bgSuccess: { backgroundColor: COLORS.green },

  textBase: { fontWeight: "800", fontSize: 13 },
  textWhite: { color: "#ffffff" },
  textDark: { color: COLORS.dark },
  textPrimary: { color: COLORS.primary },

  disabled: { opacity: 0.5 },
});
