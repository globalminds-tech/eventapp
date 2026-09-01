import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
  Modal, TouchableWithoutFeedback, ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LayoutDashboard, CalendarPlus, List, QrCode, Store,
  CreditCard, Settings, LogOut, X, ChevronRight, CheckSquare, MessageSquare, Utensils, Receipt, Users,
  BarChart3, CheckCircle2, Layers, UserCheck, Landmark, Calendar, Search
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.75;

export const Sidebar = ({ isVisible, onClose, navigation, activeRoute }) => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [role, setRole] = useState("organizer");
  const [username, setUsername] = useState("User");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const storedRole = await AsyncStorage.getItem("role");
      const storedName = await AsyncStorage.getItem("name");
      const storedImage = await AsyncStorage.getItem("profile_image");
      if (storedRole) setRole(storedRole.toLowerCase());
      if (storedName) setUsername(storedName);
      if (storedImage) setProfileImage(storedImage);
    };
    fetchUserData();
  }, []);

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
    }, 200); 
  };

  const handleLogout = async () => {
    onClose();
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("role");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const navigationItems = {
    superuser: [
      { label: "Overview", route: "Super_user_Home", icon: BarChart3 },
      { label: "Approvals Queue", route: "Approvals", icon: CheckCircle2 },
      { label: "Category Master", route: "Categories", icon: Layers },
      { label: "KYC Verification", route: "KYC", icon: UserCheck },
      { label: "Payouts Queue", route: "Payouts", icon: Landmark },
    ],
    exhibitor: [
      { label: "Booth Dashboard", route: "Exhibitor_Home", icon: LayoutDashboard },
      { label: "My Stall Bookings", route: "MyBookings", icon: Store },
      { label: "Upcoming Expos", route: "UpcomingEvents", icon: Calendar },
      { label: "Visitor Leads & Staff", route: "Leads", icon: Users },
    ],
    organizer: [
      { label: "Dashboard", route: "Organizerdashboard", icon: LayoutDashboard },
      { label: "Gate Scanner", route: "EventCheckIn", icon: QrCode },
      { label: "Food Check-In", route: "FoodCheckIn", icon: Utensils },
      { label: "Manage Stalls", route: "Manage_Stall", icon: Store },
      { label: "Exhibitor Directory", route: "Exhibitor", icon: Users },
      { label: "Billings & Receipts", route: "Receipt", icon: Receipt },
    ]
  };

  const menuItems = navigationItems[role] || navigationItems.organizer;

  const roleLabel = role === "superuser" ? "Super Admin" : role === "exhibitor" ? "Exhibitor" : "Organizer";
  const activeColor = role === "superuser" ? "#9333ea" : role === "exhibitor" ? "#059669" : "#0ea5e9";
  const activeBg = role === "superuser" ? "#9333ea" : role === "exhibitor" ? "#059669" : "#0ea5e9";

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
                <Text style={styles.brandTitle}>BookMyEvent</Text>
                <Text style={styles.brandSub}>Partner Workspace</Text>
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
                    style={[styles.menuItem, isActive && { backgroundColor: activeBg }]}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <View style={styles.menuItemLeft}>
                      <item.icon size={20} color={isActive ? "#ffffff" : "#94a3b8"} />
                      <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                        {item.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Footer */}
            <View style={styles.sidebarFooter}>
              <View style={styles.userInfoRow}>
                <View style={[styles.avatar, { backgroundColor: activeBg }]}>
                  <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userNameText} numberOfLines={1}>{username}</Text>
                  <Text style={styles.userRoleText}>{roleLabel}</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <LogOut size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebarContainer: {
    width: SIDEBAR_WIDTH,
    height: "100%",
    backgroundColor: "#0f172a",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
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
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ffffff",
  },
  brandSub: {
    fontSize: 12,
    fontWeight: "700",
    color: "#38bdf8",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8
  },
  menuContainer: {
    padding: 16,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#cbd5e1",
  },
  menuItemTextActive: {
    color: "#ffffff",
    fontWeight: "800",
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userNameText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "bold",
  },
  userRoleText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  }
});

export default Sidebar;
