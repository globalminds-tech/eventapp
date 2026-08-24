import React from "react";
import { View, Text, Modal as RNModal, TouchableOpacity, StyleSheet } from "react-native";
import { X } from "lucide-react-native";
import { COLORS } from "../../styles/theme";

export const Modal = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  animationType = "slide",
}) => {
  return (
    <RNModal visible={visible} transparent animationType={animationType} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.subText,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingTop: 4,
  },
});
