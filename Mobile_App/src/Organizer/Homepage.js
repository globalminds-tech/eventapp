import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Dimensions, StatusBar
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BarChart3, CalendarDays, Mic, Database, CircleCheckBig, UserCog,
  BetweenHorizontalEnd, HelpCircle, Store, FileCode, Users, Home, Menu, X,
  ChevronRight
} from "lucide-react-native";

const { width } = Dimensions.get("window");

// ── Sub-menu item ────────────────────────────────────────────────────────────
const SubMenuItem = ({ label, onPress }) => (
  <TouchableOpacity style={s.subItem} onPress={onPress} activeOpacity={0.7}>
    <ChevronRight size={14} color="#0ea5e9" />
    <Text style={s.subItemText}>{label}</Text>
  </TouchableOpacity>
);

// ── Sidebar / Drawer layout wrapper ─────────────────────────────────────────
// Usage: <Sidebar navigation={navigation}><YourScreenContent /></Sidebar>
export const Sidebar = ({ navigation, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const insets = useSafeAreaInsets();

  const open = () => setIsOpen(true);
  const close = () => { setIsOpen(false); setActivePanel(null); };

  const handleNavigate = (screen) => {
    close();
    if (navigation && screen) {
      navigation.navigate(screen);
    }
  };

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const menu = [
    {
      name: "Dashboard & Analytics", panel: "dashboard",
      icon: (active) => <BarChart3 size={20} color={active ? "#0ea5e9" : "#0c4a6e"} />,
      sub: [
        { label: "Organizer Dashboard", screen: "Organizerdashboard" },
        { label: "Live Gate Analytics", screen: "LiveDashboard" },
        { label: "Live Food Analytics", screen: "LiveFoodDashboard" },
      ]
    },
    {
      name: "Events & Programs", panel: "myevent",
      icon: (active) => <CalendarDays size={20} color={active ? "#0ea5e9" : "#0c4a6e"} />,
      sub: [
        { label: "Create Event (DIY Wizard)", screen: "CreateEvent" },
        { label: "My Events Directory", screen: "EventsPage" },
        { label: "Verify Events", screen: "VerifyEvent" },
        { label: "Create Program & Schedule", screen: "CreateProgram" },
        { label: "Program Verification", screen: "ProgramVerification" },
        { label: "Messages & Greetings", screen: "Messages" },
        { label: "Todo Checklist", screen: "TodoTask" },
      ]
    },
    {
      name: "Scanner & Check-In Hub", panel: "Operations",
      icon: (active) => <CircleCheckBig size={20} color={active ? "#0ea5e9" : "#0c4a6e"} />,
      sub: [
        { label: "Gate Entry Check-In", screen: "EventCheckIn" },
        { label: "Food Token Check-In", screen: "FoodCheckIn" },
        { label: "Add-On Check-In", screen: "AddonCheckIn" },
        { label: "Program Entry Check-In", screen: "ProgramCheckin" },
      ]
    },
    {
      name: "Stall & Exhibitor Hub", panel: "Stall",
      icon: (active) => <Store size={20} color={active ? "#0ea5e9" : "#0c4a6e"} />,
      sub: [
        { label: "Manage Stalls & Halls", screen: "Manage_Stall" },
        { label: "Exhibitor Spot Booking", screen: "ExhibitorSpotRegistration" },
        { label: "Exhibitor Directory", screen: "Exhibitor" },
      ]
    },
    {
      name: "Settings & KYC Portal", panel: "UserSetting",
      icon: (active) => <UserCog size={20} color={active ? "#0ea5e9" : "#0c4a6e"} />,
      sub: [
        { label: "3-Step Account Onboarding (KYC)", screen: "OrganizerKYC" },
        { label: "My Profile", screen: "MyProfile" },
        { label: "Master Data (Venues, Vendors, Sponsors)", screen: "Venu" },
        { label: "Staff & Role Permissions", screen: "RoleScreen" },
        { label: "Billing & Subscription", screen: "Billing" },
        { label: "Help & Support", screen: "Complaint_page" },
      ]
    },
  ];


  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Top bar with hamburger ── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.burgerBtn} onPress={open} activeOpacity={0.7}>
          <Menu size={22} color="#0c4a6e" />
        </TouchableOpacity>
        <View style={s.topBarLogo}>
          <View style={s.dots}>
            <View style={[s.dot, { backgroundColor: "#3b82f6" }]} />
            <View style={[s.dot, { backgroundColor: "#f97316" }]} />
            <View style={[s.dot, { backgroundColor: "#22c55e" }]} />
          </View>
          <Text style={s.logoText}>Book My Event</Text>
        </View>
        <TouchableOpacity
          style={s.homeBtn}
          onPress={() => handleNavigate("OrganizerWelcome")}
          activeOpacity={0.7}
        >
          <Home size={20} color="#0284c7" />
        </TouchableOpacity>
      </View>

      {/* ── Page content ── */}
      <View style={s.contentArea}>
        {children}
      </View>

      {/* ── Drawer Modal ── */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={close}
        statusBarTranslucent
      >
        <View style={s.overlay}>
          {/* Backdrop tap to close */}
          <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={close} />

          {/* Drawer panel */}
          <View style={[s.drawer, { paddingTop: insets.top + 8 }]}>
            {/* Drawer header */}
            <View style={s.drawerHeader}>
              <View style={s.drawerLogoRow}>
                <View style={s.dots}>
                  <View style={[s.dot, { backgroundColor: "#3b82f6" }]} />
                  <View style={[s.dot, { backgroundColor: "#f97316" }]} />
                  <View style={[s.dot, { backgroundColor: "#22c55e" }]} />
                </View>
                <Text style={s.drawerLogoText}>Book My Event</Text>
              </View>
              <TouchableOpacity onPress={close} style={s.closeBtn}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Home shortcut */}
            <TouchableOpacity
              style={s.homeShortcut}
              onPress={() => handleNavigate("OrganizerWelcome")}
              activeOpacity={0.8}
            >
              <Home size={18} color="#fff" />
              <Text style={s.homeShortcutText}>Home</Text>
            </TouchableOpacity>

            <View style={s.divider} />

            {/* Menu items */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.menuScroll}
             keyboardShouldPersistTaps="handled">
              {menu.map((item) => {
                const isActive = activePanel === item.panel;
                return (
                  <View key={item.panel}>
                    {/* Section header */}
                    <TouchableOpacity
                      style={[s.menuItem, isActive && s.menuItemActive]}
                      onPress={() => togglePanel(item.panel)}
                      activeOpacity={0.8}
                    >
                      <View style={[s.menuIconBox, isActive && s.menuIconBoxActive]}>
                        {item.icon(isActive)}
                      </View>
                      <Text style={[s.menuItemText, isActive && s.menuItemTextActive]}>
                        {item.name}
                      </Text>
                      <ChevronRight
                        size={16}
                        color={isActive ? "#0ea5e9" : "#94a3b8"}
                        style={{ transform: [{ rotate: isActive ? "90deg" : "0deg" }] }}
                      />
                    </TouchableOpacity>

                    {/* Submenu */}
                    {isActive && (
                      <View style={s.subMenu}>
                        {item.sub.map((sub) => (
                          <SubMenuItem
                            key={sub.screen}
                            label={sub.label}
                            onPress={() => handleNavigate(sub.screen)}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },

  // Top navigation bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    gap: 12,
  },
  burgerBtn: {
    width: 40, height: 40,
    borderRadius: 10,
    backgroundColor: "#f0f9ff",
    borderWidth: 1, borderColor: "#bae6fd",
    alignItems: "center", justifyContent: "center",
  },
  topBarLogo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  dots: { flexDirection: "row", gap: 3 },
  dot: { width: 8, height: 8, borderRadius: 2, transform: [{ rotate: "-12deg" }] },
  logoText: { fontSize: 14, fontWeight: "bold", color: "#0c4a6e" },
  homeBtn: {
    width: 40, height: 40,
    borderRadius: 10,
    backgroundColor: "#e0f2fe",
    borderWidth: 1, borderColor: "#7dd3fc",
    alignItems: "center", justifyContent: "center",
  },

  // Content area below top bar
  contentArea: { flex: 1 },

  // Modal overlay
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backdrop: { flex: 1 },

  // Side drawer
  drawer: {
    width: Math.min(width * 0.82, 320),
    backgroundColor: "#ffffff",
    height: "100%",
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 2, height: 0 },
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  drawerLogoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  drawerLogoText: { fontSize: 15, fontWeight: "bold", color: "#0c4a6e" },
  closeBtn: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center", justifyContent: "center",
  },

  homeShortcut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0284c7",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  homeShortcutText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  divider: { height: 1, backgroundColor: "#e2e8f0", marginHorizontal: 16, marginTop: 14 },

  menuScroll: { paddingTop: 10, paddingHorizontal: 12 },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 10,
    marginBottom: 2,
  },
  menuItemActive: { backgroundColor: "#f0f9ff" },
  menuIconBox: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  menuIconBoxActive: { backgroundColor: "#e0f2fe", borderColor: "#7dd3fc" },
  menuItemText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#334155" },
  menuItemTextActive: { color: "#0369a1" },

  subMenu: {
    marginLeft: 16,
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#bae6fd",
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 8,
    gap: 8,
    borderRadius: 8,
  },
  subItemText: { fontSize: 13, color: "#475569", fontWeight: "500" },
});

export default Sidebar;
