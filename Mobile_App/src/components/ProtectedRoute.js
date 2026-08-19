import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const role = await AsyncStorage.getItem('role');
        const roleLower = role?.toLowerCase();

        console.log("ProtectedRoute role:", roleLower);

        if (!token) {
          // Replace 'Login' with your actual login screen route name
          navigation.navigate('Login'); 
          return;
        }

        if (allowedRoles && !allowedRoles.includes(roleLower)) {
          // Replace 'Home' with your actual root/fallback screen route name
          navigation.navigate('Home'); 
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check error:", error);
        navigation.navigate('Login');
      }
    };

    checkAuth();
  }, [navigation, allowedRoles]);

  if (isAuthorized === null) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return isAuthorized ? children : null;
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
});

export default ProtectedRoute;
