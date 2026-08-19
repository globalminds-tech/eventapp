import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ImageBackground } from 'react-native';

const RefundPolicy = ({ navigation }) => {
  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Hero Section */}
        <ImageBackground 
          source={{ uri: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80" }}
          style={s.hero}
          imageStyle={s.heroImage}
        >
          <View style={s.heroOverlay}>
            <Text style={s.heroTitle}>Cancellation and Refund Policy</Text>
            <View style={s.breadcrumb}>
              <TouchableOpacity onPress={() => navigation?.navigate("Home")}>
                <Text style={s.breadcrumbLink}>Home</Text>
              </TouchableOpacity>
              <Text style={s.breadcrumbSeparator}>{'>'}</Text>
              <Text style={s.breadcrumbText}>Cancellation and Refund Policy</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Content Area */}
        <View style={s.content}>
          <Text style={s.mainHeading}>Cancellations and Refunds Policy</Text>

          <View style={s.section}>
            <Text style={s.sectionTitle}>1. Cancellations, Refunds, and Modifications</Text>
            
            <Text style={s.subSectionTitle}>1.1 Customer Cancellations</Text>
            <Text style={s.paragraph}>
              If a customer cancels their booking, the refund terms depend on the event organizer's cancellation policy, which will be stated at the time of booking. Refunds may be partial or full depending on the timing of the cancellation and the terms of the event organizer.
            </Text>

            <Text style={s.subSectionTitle}>1.2 Event Organizer Cancellations</Text>
            <Text style={s.paragraph}>
              If an event organizer cancels an event, the customer will be entitled to a full refund, minus any non-refundable platform fees and transaction charges.
            </Text>

            <Text style={s.subSectionTitle}>1.3 Modification of Bookings</Text>
            <Text style={s.paragraph}>
              Modifications to event bookings (such as date or time changes) can be made subject to approval by both the customer and the event organizer in accordance with their mutual agreement. Platform owners are not responsible for modifications or cancellations and merely act as an intermediary for the event booking process.
            </Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>2. Late Payments</Text>
            <Text style={s.paragraph}><Text style={s.bold}>Customer Delays:</Text> If a customer fails to complete payment by the booking deadline, the platform may cancel the event or booking. A late fee may be applied, depending on the platform's policy.</Text>
            <Text style={s.paragraph}><Text style={s.bold}>Event Organizer Delays:</Text> If an event organizer delays in receiving or providing funds for an event, it may result in the suspension or termination of their ability to list.</Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>3. Dispute Resolution</Text>
            
            <Text style={s.subSectionTitle}>3.1 Customer Disputes</Text>
            <Text style={s.paragraph}>
              Customers must first contact the event organizer directly via the platform's messaging system for any event-related issues. If the issue cannot be resolved, the platform will mediate and work to resolve the dispute.
            </Text>

            <Text style={s.subSectionTitle}>3.2 Event Organizer Disputes</Text>
            <Text style={s.paragraph}>
              Event organizers who have concerns with the platform's processing of payments or policies must notify the platform immediately. The platform will review and attempt to resolve the dispute.
            </Text>

            <Text style={s.subSectionTitle}>3.3 Arbitration</Text>
            <Text style={s.paragraph}>
              Any disputes that cannot be resolved amicably shall be settled through binding arbitration in [jurisdiction/country], in accordance with the [insert relevant arbitration rules].
            </Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>4. Platform's Rights and Responsibilities</Text>
            <Text style={s.paragraph}><Text style={s.bold}>Intermediary Role:</Text> The platform acts as an intermediary to facilitate the booking and payment between the customer and event organizer. The platform is not responsible for the delivery of services or the quality of events.</Text>
            <Text style={s.paragraph}><Text style={s.bold}>Suspension of Services:</Text> The platform reserves the right to suspend or terminate access to any user (customer or event organizer) who violates these Terms and Conditions or engages in fraudulent activity.</Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>5. Intellectual Property</Text>
            <Text style={s.paragraph}>
              The content available on the platform, including text, images, logos, designs, and other media, is owned or licensed by the platform owners. You may not use any of these materials without express permission from the platform owners. Users may not upload, share, or distribute content that violates the intellectual property rights of others.
            </Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>6. User Conduct</Text>
            <Text style={s.paragraph}><Text style={s.bold}>Customer Responsibilities:</Text> Customers agree to provide accurate information when making a booking and comply with the event organizer's policies, including their cancellation policy and any event-specific rules.</Text>
            <Text style={s.paragraph}><Text style={s.bold}>Event Organizer Responsibilities:</Text> Event organizers agree to provide accurate descriptions of their events, ensure availability on the listed dates, and comply with all applicable laws and regulations in the execution of their services. Users must not engage in fraudulent or malicious activities, including using false information, attempting to manipulate payments, or violating the privacy of other users.</Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>7. Limitation of Liability</Text>
            <Text style={s.paragraph}>
              The platform owners are not liable for any direct, indirect, incidental, or consequential damages resulting from the use of the platform, including issues related to event cancellations, poor service quality, or financial transactions.
            </Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>8. Modifications to the Terms</Text>
            <Text style={s.paragraph}>
              The platform owners reserve the right to modify these Terms and Conditions at any time. Users will be notified of any significant changes, and continued use of the platform after such modifications will constitute acceptance of the updated terms.
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RefundPolicy;

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
});
