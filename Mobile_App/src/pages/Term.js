import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ImageBackground } from 'react-native';

const Terms = ({ navigation }) => {
  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Hero Section */}
        <ImageBackground 
          source={{ uri: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" }}
          style={s.hero}
          imageStyle={s.heroImage}
        >
          <View style={s.heroOverlay}>
            <Text style={s.heroTitle}>Terms and Conditions</Text>
            <View style={s.breadcrumb}>
              <TouchableOpacity onPress={() => navigation?.navigate("Home")}>
                <Text style={s.breadcrumbLink}>Home</Text>
              </TouchableOpacity>
              <Text style={s.breadcrumbSeparator}>{'>'}</Text>
              <Text style={s.breadcrumbText}>Terms and Conditions</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Content Area */}
        <View style={s.content}>
          <Text style={s.mainHeading}>Terms & Conditions for Use of the Book My Event</Text>
          
          <Text style={s.paragraph}>
            These Terms and Conditions ("Agreement") govern the use of the Book My Event website and services ("Platform"). Including the booking, payment, and interaction between customers, event organizers, and platform owners. By using the Platform, you ("User") agree to be bound by these terms.
          </Text>

          <View style={s.section}>
            <Text style={s.sectionTitle}>1. Introduction</Text>
            <Text style={s.paragraph}>
              These Terms and Conditions apply to the relationship between the platform owners ("we", "us", or "our"), event organizers ("Event Organizers"), and customers ("Customers") using our platform to book, organize, and pay for events. This Agreement governs the services provided by the platform, including but not limited to the payment processes, event booking, and dispute resolution.
            </Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>2. Parties</Text>
            <View style={s.listItem}>
              <Text style={s.listDot}>•</Text>
              <Text style={s.paragraph}><Text style={s.bold}>Customer:</Text> The person or entity who books an event through the platform.</Text>
            </View>
            <View style={s.listItem}>
              <Text style={s.listDot}>•</Text>
              <Text style={s.paragraph}><Text style={s.bold}>Event Organizer:</Text> The person or entity providing the event services (such as venues, performers, equipment) for booking on the platform.</Text>
            </View>
            <View style={s.listItem}>
              <Text style={s.listDot}>•</Text>
              <Text style={s.paragraph}><Text style={s.bold}>Platform Owners:</Text> The owners and operators of the platform, which acts as an intermediary to facilitate event bookings and related payments.</Text>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>3. Account Creation and Eligibility</Text>
            <View style={s.listItem}>
              <Text style={s.listDot}>•</Text>
              <Text style={s.paragraph}>To use the platform, you must create an account by providing accurate and complete information. You must be at least 18 years of age to book events or offer services through the platform.</Text>
            </View>
            <View style={s.listItem}>
              <Text style={s.listDot}>•</Text>
              <Text style={s.paragraph}>You are responsible for maintaining the confidentiality of your account and password.</Text>
            </View>
            <View style={s.listItem}>
              <Text style={s.listDot}>•</Text>
              <Text style={s.paragraph}>You agree to immediately notify the platform of any unauthorized use of your account.</Text>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>4. Payment and Fees</Text>
            
            <Text style={s.subSectionTitle}>4.1 Payment Methods</Text>
            <Text style={s.paragraph}>
              Payments for event bookings on the platform must be made through the following methods: Credit/Debit cards (Visa, MasterCard, etc.), online payment services (PayPal, Stripe), or bank transfer, as available on the platform. Payments made through the platform are processed via third-party gateways to ensure secure transactions.
            </Text>

            <Text style={s.subSectionTitle}>4.2 Platform Fees</Text>
            <Text style={s.paragraph}>
              The platform charges a service fee, which is deducted from the total payment made by the customer to the event organizer. The applicable service fee is disclosed at the time of booking. Additional transaction fees, as imposed by payment processors, may apply and are either passed on to the customer or event organizer.
            </Text>

            <Text style={s.subSectionTitle}>4.3 Payment to Event Organizer</Text>
            <Text style={s.paragraph}>
              Event organizers will receive payment for their services, minus the platform's service fees, after the event is confirmed and payment is processed. Event organizers must provide accurate payment details (e.g., bank account or online wallet information) to receive funds.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Terms;

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { paddingBottom: 40 },
  hero: { height: 200, justifyContent: 'center' },
  heroImage: { resizeMode: 'cover' },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 24, justifyContent: 'center' },
  heroTitle: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breadcrumbLink: { color: '#eab308', fontSize: 14, fontWeight: '500' },
  breadcrumbSeparator: { color: '#ffffff', opacity: 0.6, fontSize: 14 },
  breadcrumbText: { color: '#ffffff', opacity: 0.8, fontSize: 14 },
  content: { padding: 24 },
  mainHeading: { fontSize: 20, fontWeight: 'bold', color: '#2563eb', marginBottom: 24 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginTop: 16, marginBottom: 4 },
  paragraph: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 12 },
  bold: { fontWeight: 'bold', color: '#111827' },
  listItem: { flexDirection: 'row', paddingRight: 16, marginBottom: 4 },
  listDot: { fontSize: 14, color: '#4b5563', marginRight: 8, marginTop: 2 },
});
