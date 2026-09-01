import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
  Modal, TouchableWithoutFeedback, ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LayoutDashboard, CalendarPlus, List, QrCode, Store,
  CreditCard, Settings, LogOut, X, ChevronRight, CheckSquare, MessageSquare, Utensils
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.75;

export const Sidebar = ({ isVisible, onClose, navigation, activeRoute }) => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleNavigate = (route, params = {}) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(route, params);
    }, 200); // Wait for sidebar to close
  };

  const handleLogout = async () => {
    onClose();
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("role");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, route: "Organizerdashboard" },
    { label: "Create Event", icon: CalendarPlus, route: "CreateEvent" },
    { label: "Live Dashboard", icon: List, route: "LiveDashboard" },
    { label: "Live Food Count", icon: Utensils, route: "LiveFoodDashboard" },
    { label: "Gate Scanner", icon: QrCode, route: "VerifyEvent" },
    { label: "Stall Manage", icon: Store, route: "Manage_Stall" },
    { label: "Approvals", icon: CheckSquare, route: "AdminApproval" },
    { label: "Messages", icon: MessageSquare, route: "Messages" },
    { label: "Earnings & Billing", icon: CreditCard, route: "Billing" },
    { label: "Settings", icon: Settings, route: "MyProfile" },
  ];

  if (!isVisible && slideAnim._value === -SIDEBAR_WIDTH) return null;

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sidebarContainer, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            
            {/* Header */}
            <View style={styles.sidebarHeader}>
              <View>
                <Text style={styles.brandTitle}>Organizer Portal</Text>
                <Text style={styles.brandSub}>Event Management</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuContainer}>
              {menuItems.map((item, index) => {
                const isActive = activeRoute === item.route;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <View style={styles.menuItemLeft}>
                      <item.icon size={20} color={isActive ? "#0284c7" : "#64748b"} />
                      <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                        {item.label}
                      </Text>
                    </View>
                    {isActive && <ChevronRight size={16} color="#0284c7" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Footer */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <LogOut size={20} color="#ef4444" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  sidebarContainer: {
    width: SIDEBAR_WIDTH,
    height: "100%",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  brandSub: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0284c7",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  menuContainer: {
    padding: 16,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuItemActive: {
    backgroundColor: "#f0f9ff",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  menuItemTextActive: {
    color: "#0284c7",
    fontWeight: "800",
  },
  sidebarFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ef4444",
  },
});

export default Sidebar;
