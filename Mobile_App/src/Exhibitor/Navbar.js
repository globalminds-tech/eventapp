import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { clearUser } from "@Redux/userSlice"; // Assuming standard structure
import { Store, LogOut } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExhibitorNavbar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "token", "role", "id", "name", "userId", "userName"
      ]);
    } catch(e) {
      console.error(e);
    }
    dispatch(clearUser());
    navigation.navigate("Home"); // Equivalent to navigate("/")
  };

  const isActive = (pathName) => route.name === pathName;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exhibitor</Text>

      <View style={styles.navLinks}>
        <TouchableOpacity 
          style={[styles.navItem, isActive("MyBookings") ? styles.navItemActive : styles.navItemInactive]}
          onPress={() => navigation.navigate("MyBookings")}
        >
          <Store size={14} color={isActive("MyBookings") ? "#fff" : "#d1d5db"} style={styles.icon} />
          <Text style={isActive("MyBookings") ? styles.navTextActive : styles.navTextInactive}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, isActive("UpcomingEvent") ? styles.navItemActive : styles.navItemInactive]}
          onPress={() => navigation.navigate("UpcomingEvent")}
        >
          <Store size={14} color={isActive("UpcomingEvent") ? "#fff" : "#d1d5db"} style={styles.icon} />
          <Text style={isActive("UpcomingEvent") ? styles.navTextActive : styles.navTextInactive}>Events</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={() => setShowLogoutModal(true)}
        >
          <LogOut size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>

      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.logoutIconWrapper}>
              <LogOut size={32} color="#dc2626" />
            </View>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to log out?</Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={() => { setShowLogoutModal(false); handleLogout(); }}>
                <Text style={styles.confirmBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#020617', // slate-950
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b', // slate-800
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: '#9333ea', // purple-600
  },
  navItemInactive: {
    backgroundColor: 'transparent',
  },
  icon: {
    marginRight: 4,
  },
  navTextActive: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  navTextInactive: {
    color: '#d1d5db', // gray-300
    fontSize: 12,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fef2f2', // red-50
    borderWidth: 1,
    borderColor: '#fee2e2', // red-100
    borderRadius: 8,
    marginLeft: 4,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '80%',
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  logoutIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2', // red-100
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827', // gray-900
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280', // gray-500
    marginBottom: 24,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6', // gray-100
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#374151', // gray-700
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#dc2626', // red-600
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ExhibitorNavbar;
