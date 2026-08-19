import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const Help = () => {
  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.title}>Book My Event Help & Documentation</Text>
          <View style={s.titleBorder} />

          <View style={s.grid}>
            <View style={[s.gridItem, s.tealBox]}>
              <Text style={s.iconText}>??</Text>
              <Text style={s.gridTitleTeal}>Getting Started</Text>
              <Text style={s.gridDescTeal}>New to the platform? Start here for a quick tour.</Text>
            </View>

            <View style={[s.gridItem, s.blueBox]}>
              <Text style={s.iconText}>??</Text>
              <Text style={s.gridTitleBlue}>User Manual</Text>
              <Text style={s.gridDescBlue}>Detailed guides for every module and feature.</Text>
            </View>

            <View style={[s.gridItem, s.amberBox]}>
              <Text style={s.iconText}>???</Text>
              <Text style={s.gridTitleAmber}>Troubleshooting</Text>
              <Text style={s.gridDescAmber}>Common issues and how to resolve them.</Text>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>How to use Check-In/Out</Text>
            <Text style={s.sectionText}>
              The Check-In module allows you to track visitor arrivals in real-time. Simply search for a visitor code or name and click the check-in button. The status will update instantly on the dashboard.
            </Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Bulk Uploading Data</Text>
            <Text style={s.sectionText}>
              You can upload bulk visitor registrations using the provided Excel template. Ensure all required fields (Name, Email, Phone) are filled before uploading to avoid validation errors.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Help;

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, borderWidth: 1, borderColor: '#f3f4f6' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#134e4a', marginBottom: 12, textAlign: 'center' },
  titleBorder: { height: 1, backgroundColor: '#e5e7eb', marginBottom: 24 },
  grid: { gap: 16, marginBottom: 32 },
  gridItem: { padding: 20, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  iconText: { fontSize: 32, marginBottom: 8 },
  
  tealBox: { backgroundColor: '#f0fdfa', borderColor: '#ccfbf1' },
  gridTitleTeal: { fontWeight: 'bold', color: '#115e59', fontSize: 16 },
  gridDescTeal: { fontSize: 12, color: '#0d9488', marginTop: 8, textAlign: 'center' },

  blueBox: { backgroundColor: '#eff6ff', borderColor: '#dbeafe' },
  gridTitleBlue: { fontWeight: 'bold', color: '#1e40af', fontSize: 16 },
  gridDescBlue: { fontSize: 12, color: '#2563eb', marginTop: 8, textAlign: 'center' },

  amberBox: { backgroundColor: '#fffbeb', borderColor: '#fef3c7' },
  gridTitleAmber: { fontWeight: 'bold', color: '#92400e', fontSize: 16 },
  gridDescAmber: { fontSize: 12, color: '#d97706', marginTop: 8, textAlign: 'center' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 8, textDecorationLine: 'underline', textDecorationColor: '#5eead4' },
  sectionText: { color: '#4b5563', fontSize: 15, lineHeight: 22 },
});
