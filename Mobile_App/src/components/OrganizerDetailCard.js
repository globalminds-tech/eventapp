import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrganizerDetailCard = ({ organizerData }) => {
  const hasCompany = organizerData?.company_name && organizerData.company_name !== "None";
  const companyName = hasCompany ? organizerData.company_name : null;
  const organizerName = organizerData?.name || "None";
  const address = organizerData?.address || "None";
  const email = organizerData?.email || "None";
  const phone = organizerData?.phone || "None";

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ORGANIZER DETAILS</Text>
      </View>
      <View style={styles.content}>
        
        <View style={styles.row}>
          <Text style={styles.label}>
            {hasCompany ? "Company Name" : "Organizer Name"}
          </Text>
          <Text style={styles.value}>
            : {hasCompany ? companyName : organizerName}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Address</Text>
          <View style={styles.addressValueContainer}>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.addressValue}>{address}</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Mail ID</Text>
          <Text style={styles.emailValue}>: {email}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>: {phone}</Text>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // Android shadow
    borderWidth: 1,
    borderColor: '#f1f5f9', 
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '900', 
    color: '#2563eb', 
    letterSpacing: 1.5, 
    textTransform: 'uppercase',
  },
  content: {
    padding: 24,
    gap: 16, 
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold', 
    color: '#0f172a', 
    width: 80, 
  },
  value: {
    fontSize: 10,
    color: '#64748b', 
    fontWeight: '500', 
    flexShrink: 1,
  },
  emailValue: {
    fontSize: 10,
    color: '#2563eb', 
    fontWeight: '500',
    flexShrink: 1,
  },
  addressValueContainer: {
    flexDirection: 'row',
    gap: 4,
    flexShrink: 1,
  },
  colon: {
    fontSize: 10,
    color: '#64748b',
  },
  addressValue: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 16, 
    flexShrink: 1,
  },
});

export default OrganizerDetailCard;
