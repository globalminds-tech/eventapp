import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import ExhibitorNavbar from "./Navbar";
import { useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExhibitorHome = () => {
  const user = useSelector((state) => state.user);
  const route = useRoute();
  const navigation = useNavigation();
  const [showToast, setShowToast] = useState(false);
  const [storedUser, setStoredUser] = useState({ id: null, name: null });

  useEffect(() => {
    const saveAndFetchUser = async () => {
      try {
        if (user?.id && user?.name) {
          await AsyncStorage.setItem("userId", String(user.id));
          await AsyncStorage.setItem("userName", user.name);
        }
        const id = await AsyncStorage.getItem("userId");
        const name = await AsyncStorage.getItem("userName");
        setStoredUser({ id, name });
      } catch (e) {
        console.error(e);
      }
    };
    saveAndFetchUser();
  }, [user]);

  useEffect(() => {
    if (route.params?.fromLogin) {
      setShowToast(true);
      navigation.setParams({ fromLogin: undefined });
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [route.params, navigation]);

  const displayUser = user?.id ? user : storedUser;

  return (
    <View style={styles.container}>
      <ExhibitorNavbar />

      <View style={styles.mainContent}>
        <Text style={styles.title}>
          Welcome Exhibitor 👋
        </Text>

        <Text style={styles.subtitle}>
          Hello, <Text style={styles.boldText}>{displayUser.name || "User"}</Text>
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Manage your event bookings and explore upcoming events.
          </Text>
        </View>
      </View>

      {showToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toast}>
            <View style={styles.toastIconWrapper}>
              <Text style={styles.toastIcon}>✓</Text>
            </View>
            <Text style={styles.toastText}>Logged in successfully!</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#cbd5e1', // slate-300
    marginBottom: 8,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '600',
    color: '#ffffff',
  },
  infoBox: {
    marginTop: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#94a3b8', // slate-400
    textAlign: 'center',
  },
  
  // Toast
  toastContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 250,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669', // emerald-600
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10b981', // emerald-500
    elevation: 10,
    shadowColor: '#a7f3d0', // emerald-200
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 16,
  },
  toastIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastIcon: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toastText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default ExhibitorHome;
