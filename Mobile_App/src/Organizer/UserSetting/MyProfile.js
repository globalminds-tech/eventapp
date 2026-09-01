import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LogOut, ArrowLeft, Mail, Phone, Building, CheckCircle2,
  Edit2, Search, Building2, Ticket, Sparkles, HelpCircle, Gift, Tag,
  ChevronRight, Landmark, ShieldCheck, QrCode
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setUser } from "@Redux/userSlice";

export const MyProfile = ({ navigation }) => {
  const dispatch = useDispatch();
  
  const [user, setUserData] = useState({
    id: "6",
    name: "Sneha V",
    mobile: "+91 0000000000",
    email: "user@example.com",
    organization: "Global",
    role: "organizer"
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const id = await AsyncStorage.getItem("userId") || await AsyncStorage.getItem("id");
        const name = await AsyncStorage.getItem("name");
        const email = await AsyncStorage.getItem("email");
        const mobile = await AsyncStorage.getItem("mobile");
        const org = await AsyncStorage.getItem("organization_name");
        const role = await AsyncStorage.getItem("role");

        setUserData({
          id: id || "6",
          name: name || "Sneha V",
          email: email || "user@example.com",
          mobile: mobile || "+91 0000000000",
          organization: org || "Global",
          role: role ? role.toLowerCase() : "organizer"
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "token", "role", "id", "name", "userId", "email", "mobile", "organization_name", "@organizer_step1_completed"
      ]);
    } catch (e) {
      console.error(e);
    }
    dispatch(setUser({ id: null, name: null, role: null, email: null }));
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const roleLabel = user.role === "superuser" ? "SUPER ADMIN" : user.role === "exhibitor" ? "EXHIBITOR" : "EVENT ORGANIZER";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={16} color="#64748b" />
          <Text style={styles.backBtnText}>Back to Workspace</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ACCOUNT CONTROL PANEL</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <LogOut size={14} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* LEFT COLUMN: Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <Edit2 size={12} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Building2 size={12} color="#0ea5e9" />
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Mail size={16} color="#0ea5e9" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Phone size={16} color="#10b981" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>MOBILE CONTACT</Text>
                <Text style={styles.infoValue}>{user.mobile}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Building size={16} color="#8b5cf6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ORGANIZATION / BUSINESS</Text>
                <Text style={styles.infoValue}>{user.organization}</Text>
              </View>
            </View>

            <View style={[styles.infoItem, styles.accountIdRow]}>
              <View style={styles.rowCenter}>
                <CheckCircle2 size={16} color="#10b981" />
                <Text style={styles.accountIdText}>Account ID #{user.id}</Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Assistance Card */}
        <View style={styles.assistanceCard}>
          <View style={styles.rowCenter}>
            <HelpCircle size={18} color="#38bdf8" />
            <Text style={styles.assistanceTitle}>Need Assistance?</Text>
          </View>
          <Text style={styles.assistanceDesc}>
            Have questions regarding event tickets, QR code check-ins, or partner onboarding? Reach out to support.
          </Text>
        </View>

        {/* WORKSPACE ACTION ITEMS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>WORKSPACE ACTION ITEMS</Text>
          <View style={[styles.sectionBadge, { backgroundColor: "#cffafe" }]}>
            <Text style={[styles.sectionBadgeText, { color: "#0369a1" }]}>OPERATIONS</Text>
          </View>
        </View>

        <View style={styles.actionGrid}>
          {/* Action 1 */}
          <View style={styles.actionCard}>
            <View style={styles.actionCardHeader}>
              <Text style={styles.actionCardTitle}>Account KYC & Legal GST</Text>
              <View style={[styles.actionCardBadge, { backgroundColor: "#fef3c7" }]}>
                <Text style={[styles.actionCardBadgeText, { color: "#b45309" }]}>VERIFICATION</Text>
              </View>
            </View>
            <Text style={styles.actionCardDesc}>Manage business GSTIN, PAN details, entity type, and registered office address.</Text>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: "#ea580c" }]}
              onPress={() => navigation.navigate("OrganizerKYC")}
            >
              <Text style={styles.actionBtnText}>Update Legal & KYC Details</Text>
              <ArrowLeft style={{ transform: [{ rotate: "135deg" }] }} size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Action 2 */}
          <View style={styles.actionCard}>
            <View style={styles.actionCardHeader}>
              <Text style={styles.actionCardTitle}>Bank Payout & Settlement Setup</Text>
              <View style={[styles.actionCardBadge, { backgroundColor: "#ccfbf1" }]}>
                <Text style={[styles.actionCardBadgeText, { color: "#0f766e" }]}>PAYOUTS</Text>
              </View>
            </View>
            <Text style={styles.actionCardDesc}>Update bank account number, IFSC code, and instant UPI settlement preference.</Text>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#0f172a" }]}>
              <Landmark size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnText}>Update Bank Account & Payouts</Text>
            </TouchableOpacity>
          </View>

          {/* Action 3 */}
          <View style={styles.actionCard}>
            <View style={styles.actionCardHeader}>
              <Text style={styles.actionCardTitle}>Gate Scanner Staff</Text>
              <View style={[styles.actionCardBadge, { backgroundColor: "#e0e7ff" }]}>
                <Text style={[styles.actionCardBadgeText, { color: "#4338ca" }]}>OPERATIONAL</Text>
              </View>
            </View>
            <Text style={styles.actionCardDesc}>Turnstiles & QR scanners ready for attendee validation.</Text>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: "#6366f1" }]}
              onPress={() => navigation.navigate("EventCheckIn")}
            >
              <QrCode size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnText}>Gate Scanner Control</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ACCOUNT SERVICES & PARTNER HUB */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ACCOUNT SERVICES & PARTNER HUB</Text>
        </View>

        <View style={styles.servicesCard}>
          <TouchableOpacity style={styles.serviceRow} onPress={() => navigation.navigate("OrganizerKYC")}>
            <View style={[styles.serviceIconWrap, { backgroundColor: "#06b6d4" }]}>
              <Sparkles size={20} color="#fff" />
            </View>
            <View style={styles.serviceContent}>
              <View style={styles.serviceTitleRow}>
                <Text style={styles.serviceTitleText}>List Your Show & Partner Hub</Text>
                <View style={styles.partnerBadge}>
                  <Text style={styles.partnerBadgeText}>PARTNER</Text>
                </View>
              </View>
              <Text style={styles.serviceDescText}>Host events as Organizer or reserve stalls as Exhibitor</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceRow}>
            <View style={styles.serviceIconWrap}>
              <HelpCircle size={20} color="#64748b" />
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitleText}>Help Centre & Support</Text>
              <Text style={styles.serviceDescText}>Get assistance for ticketing, gate check-ins & payouts</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceRow}>
            <View style={styles.serviceIconWrap}>
              <Gift size={20} color="#64748b" />
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitleText}>My Rewards & Passports</Text>
              <Text style={styles.serviceDescText}>View earned loyalty points & event stamps</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.serviceRow, { borderBottomWidth: 0 }]}>
            <View style={styles.serviceIconWrap}>
              <Tag size={20} color="#64748b" />
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitleText}>Offers & Promotional Coupons</Text>
              <Text style={styles.serviceDescText}>Available discount codes & early bird vouchers</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    ...(Platform.OS === "ios" ? { zIndex: 10 } : { elevation: 4 }),
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  signOutText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ef4444",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#f8fafc",
    borderWidth: 4,
    borderColor: "#8b5cf6", // Purple border like in image
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "900",
    color: "#0f172a",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 24,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0369a1",
  },
  infoList: {
    width: "100%",
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  accountIdRow: {
    justifyContent: "space-between",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accountIdText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  activeBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#166534",
  },
  assistanceCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  assistanceTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#f8fafc",
  },
  assistanceDesc: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 10,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
  sectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: "900",
  },
  actionGrid: {
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  actionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    flex: 1,
    paddingRight: 10,
  },
  actionCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionCardBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },
  actionCardDesc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 13,
  },
  servicesCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    overflow: "hidden",
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  serviceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  serviceContent: {
    flex: 1,
    marginRight: 10,
  },
  serviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  serviceTitleText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  partnerBadge: {
    backgroundColor: "#cffafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  partnerBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#0891b2",
  },
  serviceDescText: {
    fontSize: 12,
    color: "#64748b",
  },
});

export default MyProfile;
