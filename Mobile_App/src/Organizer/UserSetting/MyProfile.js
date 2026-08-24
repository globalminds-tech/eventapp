import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  HelpCircle,
  Gift,
  Tag,
  CreditCard,
  Utensils,
  Home,
  Settings,
  Share2,
  ThumbsUp,
  FileText,
  Shield,
  ChevronRight,
  User,
  Edit2,
  X,
  Save,
  LogOut
} from "lucide-react-native";
import { getUserProfile, updateUserProfile, getCountries, getStates, getCities } from "@Services/api";
import { useDispatch } from "react-redux";
import { setUser } from "@Redux/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const MyProfile = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const dispatch = useDispatch();

  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "Ashok",
    mobile: "7010085577",
    email: "pashokbabu.38@gmail.com",
    address: "",
    country: "India",
    state: "Tamil Nadu",
    city: "Chennai",
    profile_image: "",
    organization_name: ""
  });

  useEffect(() => {
    const getStoredUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("userId") || await AsyncStorage.getItem("User_id");
        const storedName = await AsyncStorage.getItem("name") || await AsyncStorage.getItem("userName");
        if (id) setUserId(id);
        if (storedName) setFormData(prev => ({ ...prev, name: storedName }));
      } catch (err) {
        console.error("Error reading user id:", err);
      }
    };
    getStoredUserId();
  }, []);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getUserProfile(userId);
      if (res.status === "success" && res.data) {
        setFormData({
          id: res.data.id || userId,
          name: res.data.name || "Ashok",
          mobile: res.data.mobile || "7010085577",
          email: res.data.email || "pashokbabu.38@gmail.com",
          address: res.data.address || "",
          country: res.data.country || "India",
          state: res.data.state || "Tamil Nadu",
          city: res.data.city || "Chennai",
          profile_image: res.data.profile_image || "",
          organization_name: res.data.organization_name || ""
        });
        if (res.data.profile_image) setProfileImage(res.data.profile_image);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateUserProfile(formData);
      if (res.status === "success") {
        Alert.alert("Success", "Profile updated successfully!");
        await AsyncStorage.setItem("name", formData.name);
        dispatch(setUser({ id: formData.id, name: formData.name, profile_image: formData.profile_image }));
        setShowEditModal(false);
      } else {
        Alert.alert("Error", "Failed to update profile.");
      }
    } catch (err) {
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setSaving(false);
    }
  };

  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showDevRoleModal, setShowDevRoleModal] = useState(false);

  const menuGroup1 = [
    { title: "Help Centre", icon: HelpCircle, screen: "Complaint_page" },
    { title: "Rewards", icon: Gift, screen: null },
    { title: "Offers", icon: Tag, screen: null },
    { title: "Gift Cards", icon: CreditCard, screen: null },
    { title: "Food & Beverages", icon: Utensils, screen: null },
  ];

  const menuGroup2 = [
    { title: "Partner with Us (List Show / Book Booth)", icon: Home, action: () => setShowPartnerModal(true), isHighlight: true },
    { title: "Account & Profile Settings", icon: Settings, action: () => setShowEditModal(true) },
    { title: "⚡ Developer Role Switcher", icon: Shield, action: () => setShowDevRoleModal(true) },
  ];

  const menuGroup3 = [
    { title: "Share", icon: Share2, action: () => Alert.alert("Share", "Sharing BookMyEvent app link...") },
    { title: "Rate Us", icon: ThumbsUp, action: () => Alert.alert("Rate Us", "Thank you for rating us 5 stars!") },
    { title: "Terms & Conditions", icon: FileText, screen: "Term" },
    { title: "Privacy Policy", icon: Shield, screen: "cancellation" },
  ];

  const handleItemPress = (item) => {
    if (item.action) {
      item.action();
    } else if (item.screen && navigation) {
      navigation.navigate(item.screen);
    } else {
      Alert.alert(item.title, `${item.title} feature coming soon!`);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "token", "role", "id", "name", "userId", "userName", "@organizer_step1_completed"
      ]);
    } catch (e) {
      console.error(e);
    }
    dispatch(setUser({ id: null, name: null, role: null, email: null }));
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Header Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfoRow}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarCircle}>
                <User size={32} color="#2563eb" />
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.userNameText}>{formData.name || "Ashok"}</Text>
              <TouchableOpacity style={styles.editProfileBtn} onPress={() => setShowEditModal(true)}>
                <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                <Edit2 size={12} color="#e11d48" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Group 1 Card */}
        <View style={styles.menuGroupCard}>
          {menuGroup1.map((item, i) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.menuRow, i < menuGroup1.length - 1 && styles.menuRowBorder]}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.menuIconWrap}>
                  <Icon size={20} color="#334155" />
                </View>
                <Text style={styles.menuTitleText}>{item.title}</Text>
                <ChevronRight size={18} color="#94a3b8" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Group 2 Card (List Your Show & Settings) */}
        <View style={styles.menuGroupCard}>
          {menuGroup2.map((item, i) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.menuRow, i < menuGroup2.length - 1 && styles.menuRowBorder]}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.menuIconWrap}>
                  <Icon size={20} color={item.isHighlight ? "#e11d48" : "#334155"} />
                </View>
                <Text style={[styles.menuTitleText, item.isHighlight && { color: "#e11d48", fontWeight: "700" }]}>
                  {item.title}
                </Text>
                <ChevronRight size={18} color="#94a3b8" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Group 3 Card (Share, Policy, Terms) */}
        <View style={styles.menuGroupCard}>
          {menuGroup3.map((item, i) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.menuRow, i < menuGroup3.length - 1 && styles.menuRowBorder]}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.menuIconWrap}>
                  <Icon size={20} color="#334155" />
                </View>
                <Text style={styles.menuTitleText}>{item.title}</Text>
                <ChevronRight size={18} color="#94a3b8" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Prominent Red Logout Card */}
        <TouchableOpacity style={styles.logoutCardBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={20} color="#ef4444" style={{ marginRight: 10 }} />
          <Text style={styles.logoutCardBtnText}>Log Out of Account</Text>
        </TouchableOpacity>

        {/* BookAChange Banner Card */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerBadge}>BookAChange</Text>
          <Text style={styles.bannerSub}>Powering Dreams, Amplifying Change</Text>
        </View>

      </ScrollView>

      {/* Edit Profile Modal Dialog */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(v) => setFormData(prev => ({ ...prev, name: v }))}
              />

              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <TextInput
                style={styles.textInput}
                value={formData.mobile}
                keyboardType="phone-pad"
                onChangeText={(v) => setFormData(prev => ({ ...prev, mobile: v }))}
              />

              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                keyboardType="email-address"
                onChangeText={(v) => setFormData(prev => ({ ...prev, email: v }))}
              />

              <Text style={styles.fieldLabel}>City / Location</Text>
              <TextInput
                style={styles.textInput}
                value={formData.city}
                onChangeText={(v) => setFormData(prev => ({ ...prev, city: v }))}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Unified Partner Portal Selection Modal */}
      <Modal visible={showPartnerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Partner Portal Access</Text>
              <TouchableOpacity onPress={() => setShowPartnerModal(false)}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16, gap: 12 }}>
              <TouchableOpacity
                style={[styles.partnerCard, { borderColor: "#f97316", backgroundColor: "#fff7ed" }]}
                onPress={() => { setShowPartnerModal(false); navigation?.navigate("OrganizerKYC"); }}
              >
                <Text style={[styles.partnerTitle, { color: "#c2410c" }]}>🎪 Host & Produce Event (Organizer)</Text>
                <Text style={styles.partnerSub}>7-Step Event Wizard, Ticket Inventory, Live Gate Scanners & Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.partnerCard, { borderColor: "#10b981", backgroundColor: "#ecfdf5" }]}
                onPress={() => { setShowPartnerModal(false); navigation?.navigate("Exhibitor_Home"); }}
              >
                <Text style={[styles.partnerTitle, { color: "#047857" }]}>🏬 Book Stall & Exhibit (Exhibitor)</Text>
                <Text style={styles.partnerSub}>Exhibition Discovery, Interactive Floor Plan Booth Reservation & Staff Passes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Developer Role Switcher Modal */}
      <Modal visible={showDevRoleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>⚡ Developer Role Switcher Hub</Text>
              <TouchableOpacity onPress={() => setShowDevRoleModal(false)}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16, gap: 10 }}>
              <TouchableOpacity
                style={[styles.partnerCard, { borderColor: "#8b5cf6", backgroundColor: "#f5f3ff" }]}
                onPress={() => { setShowDevRoleModal(false); navigation?.navigate("Super_user_Home"); }}
              >
                <Text style={[styles.partnerTitle, { color: "#7c3aed" }]}>👑 Super Admin Portal</Text>
                <Text style={styles.partnerSub}>Category Master, Event Approvals Queue, Platform Payouts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.partnerCard, { borderColor: "#0284c7", backgroundColor: "#f0f9ff" }]}
                onPress={() => { setShowDevRoleModal(false); navigation?.navigate("OrganizerWelcome"); }}
              >
                <Text style={[styles.partnerTitle, { color: "#0369a1" }]}>🎪 Organizer Command Center</Text>
                <Text style={styles.partnerSub}>7-Step Event Wizard, Live Gate Scanners, Live Sales Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.partnerCard, { borderColor: "#10b981", backgroundColor: "#ecfdf5" }]}
                onPress={() => { setShowDevRoleModal(false); navigation?.navigate("Exhibitor_Home"); }}
              >
                <Text style={[styles.partnerTitle, { color: "#047857" }]}>🏬 Exhibitor Portal</Text>
                <Text style={styles.partnerSub}>Stall Discovery, Floor Plan Booth Booking, Lead Capture</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.partnerCard, { borderColor: "#f97316", backgroundColor: "#fff7ed" }]}
                onPress={() => { setShowDevRoleModal(false); navigation?.navigate("Home"); }}
              >
                <Text style={[styles.partnerTitle, { color: "#c2410c" }]}>🎟️ Public / Attendee View</Text>
                <Text style={styles.partnerSub}>Category Event Discovery, Ticket Booking, QR Passes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MyProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    height: 54,
    width: 54,
    borderRadius: 27,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    height: 54,
    width: 54,
    borderRadius: 27,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e11d48",
  },
  menuGroupCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  logoutCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 14,
    elevation: 1,
  },
  logoutCardBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ef4444",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  menuIconWrap: {
    width: 32,
    alignItems: "center",
  },
  menuTitleText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    marginLeft: 10,
    fontWeight: "500",
  },
  bannerCard: {
    backgroundColor: "#fff0f2",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fecdd3",
    alignItems: "center",
  },
  bannerBadge: {
    fontSize: 15,
    fontWeight: "800",
    color: "#e11d48",
  },
  bannerSub: {
    fontSize: 12,
    color: "#9f1239",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  saveBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  partnerCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  partnerTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  partnerSub: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 16,
  },
});
