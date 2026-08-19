import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, Modal, Alert
} from "react-native";
import { Search, Globe, LogOut, ChevronDown } from "lucide-react-native";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@Redux/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GLOBAL_SEARCH = [
  { name: "Live Dashboard", screen: "LiveDashboard" },
  { name: "Live Food Dashboard", screen: "LiveFoodDashboard" },
  { name: "Organizer Dashboard", screen: "OrganizerDashboard" },
  { name: "Add-On Check-In / Check-Out", screen: "AddonCheckIn" },
  { name: "Add-On Spot Booking", screen: "SportBooking" },
  { name: "Coupon", screen: "Coupon" },
  { name: "Create Event", screen: "CreateEvent" },
  { name: "Event Check-In / Check-Out", screen: "EventCheckIn" },
  { name: "Food Check-In / Check-Out", screen: "FoodCheckIn" },
  { name: "Messages & Greeting", screen: "Messages" },
  { name: "Pass", screen: "Pass" },
  { name: "Todo Task", screen: "TodoTask" },
  { name: "Verify Event", screen: "VerifyEvent" },
  { name: "Abstract Verification", screen: "AbstractVerification" },
  { name: "Bulk Pass Generation", screen: "BulkPassPage" },
  { name: "Create Program", screen: "CreateProgram" },
  { name: "Program Check-In", screen: "ProgramCheckin" },
  { name: "Program Verification", screen: "ProgramVerification" },
  { name: "Exhibitor Registration", screen: "ExhibitorSpotRegistration" },
  { name: "Exhibitor", screen: "Exhibitor" },
  { name: "Role Screen", screen: "RoleScreen" },
  { name: "User Screen", screen: "UserScreen" },
  { name: "User", screen: "User" },
  { name: "Policy", screen: "PolicyPage" },
  { name: "Venue", screen: "Venu" },
  { name: "Vendor", screen: "Vendor" },
];

export const Header = ({ navigation }) => {
  const { name: username, profile_image, role } = useSelector(state => state.user);
  const dispatch = useDispatch();

  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) { setResults([]); return; }
    setResults(GLOBAL_SEARCH.filter(item => item.name.toLowerCase().includes(value.toLowerCase())));
  };

  const handleResultPress = (item) => {
    setSearchText("");
    setResults([]);
    if (navigation) {
      navigation.navigate(item.screen);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "role", "id", "name", "profile_image", "userId", "userName"]);
    } catch (_) {}
    dispatch(clearUser());
    if (navigation) navigation.replace("Login");
  };

  const initials = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <View style={s.container}>
      <View style={s.inner}>
        {/* LEFT — Logo */}
        <View style={s.logoArea}>
          <View style={s.logoDots}>
            <View style={[s.dot, { backgroundColor: "#3b82f6" }]} />
            <View style={[s.dot, { backgroundColor: "#f97316" }]} />
            <View style={[s.dot, { backgroundColor: "#22c55e" }]} />
          </View>
          <View>
            <Text style={s.logoTitle}>Book My Event</Text>
            <Text style={s.logoTagline}>CREATE • COLLABORATE • CONNECT</Text>
          </View>
        </View>

        {/* CENTER — Search */}
        <View style={s.searchWrapper}>
          <View style={s.searchBar}>
            <Search size={16} color="#9ca3af" style={{ marginRight: 6 }} />
            <TextInput
              style={s.searchInput}
              placeholder="Search anything..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>

          {results.length > 0 && (
            <View style={s.dropdown}>
              {results.slice(0, 6).map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.dropdownItem}
                  onPress={() => handleResultPress(item)}
                >
                  <Text style={s.dropdownItemText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* RIGHT */}
        <View style={s.rightArea}>
          {/* Language */}
          <View style={s.langPill}>
            <Globe size={13} color="#6366f1" />
            <Text style={s.langText}>EN-UK</Text>
          </View>

          {/* Avatar */}
          <View style={s.avatar}>
            {profile_image ? (
              <Image source={{ uri: profile_image }} style={s.avatarImage} />
            ) : (
              <Text style={s.avatarInitial}>{initials}</Text>
            )}
          </View>

          {/* Logout */}
          <TouchableOpacity style={s.logoutBtn} onPress={() => setShowLogoutModal(true)}>
            <LogOut size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Color bar */}
      <View style={s.colorBar} />

      {/* Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalIcon}>
              <LogOut size={28} color="#dc2626" />
            </View>
            <Text style={s.modalTitle}>Logout</Text>
            <Text style={s.modalSubtitle}>Are you sure you want to log out?</Text>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowLogoutModal(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={() => { setShowLogoutModal(false); handleLogout(); }}>
                <Text style={s.confirmBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", zIndex: 50 },
  inner: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  logoArea: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0 },
  logoDots: { flexDirection: "row", gap: 3 },
  dot: { width: 10, height: 10, borderRadius: 2, transform: [{ rotate: "-12deg" }] },
  logoTitle: { fontSize: 13, fontWeight: "bold", color: "#111827", letterSpacing: 0.3 },
  logoTagline: { fontSize: 8, color: "#6b7280", fontWeight: "500", letterSpacing: 0.5 },
  searchWrapper: { flex: 1, position: "relative", zIndex: 100 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#f3f4f6", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  searchInput: { flex: 1, fontSize: 13, color: "#111827", padding: 0 },
  dropdown: { position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, marginTop: 4, elevation: 10, zIndex: 200, maxHeight: 220 },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f9fafb" },
  dropdownItemText: { fontSize: 13, color: "#2563eb", fontWeight: "500" },
  rightArea: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 },
  langPill: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: "#fff" },
  langText: { fontSize: 11, fontWeight: "bold", color: "#374151" },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#f97316", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  avatarInitial: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 8, padding: 7 },
  colorBar: { height: 2, backgroundColor: "#e0e7ff", opacity: 0.6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  modalBox: { backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "80%", alignItems: "center" },
  modalIcon: { width: 60, height: 60, backgroundColor: "#fee2e2", borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: "#6b7280", marginBottom: 24, textAlign: "center" },
  modalActions: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  cancelBtnText: { color: "#374151", fontWeight: "600", fontSize: 14 },
  confirmBtn: { flex: 1, backgroundColor: "#dc2626", borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  confirmBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

export default Header;
