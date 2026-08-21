import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity
} from "react-native";
import { Calendar, MapPin, Tag, Users, CheckCircle2, Clock, FileText, Layers, ShieldAlert } from "lucide-react-native";

export default function Step7Preview({ formData, onEditStep }) {
  const ed = formData.eventDetails || {};
  const booking = formData.bookingSettings || {};
  const layout = formData.layoutSettings || {};
  const food = formData.foodProvision || {};
  const vehicle = formData.vehiclePass || {};
  const docs = formData.documents || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerBadge}>
        <CheckCircle2 size={24} color="#16a34a" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Event Summary Preview</Text>
          <Text style={styles.headerSub}>Please review all details before final submission for approval.</Text>
        </View>
      </View>

      {/* Card 1: Basic Event Details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>1. Basic Details</Text>
          <TouchableOpacity onPress={() => onEditStep && onEditStep(1)}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eventName}>{ed.eventName || "Untitled Event"}</Text>
        <Text style={styles.categoryBadge}>{ed.category || "General"}</Text>
        <Text style={styles.desc}>{ed.description || "No description provided."}</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Calendar size={16} color="#2563eb" />
          <Text style={styles.infoText}>
            {ed.startDate || "Start Date"} ({ed.startTime || "Start Time"}) - {ed.endDate || "End Date"} ({ed.endTime || "End Time"})
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={16} color="#dc2626" />
          <Text style={styles.infoText}>
            {ed.venue || "Venue Not Selected"} ({ed.address || "Address"})
          </Text>
        </View>
      </View>

      {/* Card 2: Booking Settings */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>2. Pricing & Booking Settings</Text>
          <TouchableOpacity onPress={() => onEditStep && onEditStep(2)}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Entry Type</Text>
            <Text style={styles.statVal}>{booking.entryType || "Free"}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pass Fee (INR)</Text>
            <Text style={styles.statVal}>₹{booking.passFeeINR || "0"}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Capacity</Text>
            <Text style={styles.statVal}>{booking.maxCapacity || "Unlimited"}</Text>
          </View>
        </View>
      </View>

      {/* Card 3: Hall & Stall Layout */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>3. Stall & Hall Layout</Text>
          <TouchableOpacity onPress={() => onEditStep && onEditStep(3)}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        </View>

        {layout.halls && layout.halls.length > 0 ? (
          layout.halls.map((h, i) => (
            <View key={i} style={styles.hallItem}>
              <Layers size={16} color="#0284c7" />
              <Text style={styles.hallText}>{h.name || `Hall ${i + 1}`} - Stalls: {h.totalStalls || 0}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No stall layout configured.</Text>
        )}
      </View>

      {/* Card 4: Provisions (Food & Vehicle) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>4. Provisions & Add-Ons</Text>
          <TouchableOpacity onPress={() => onEditStep && onEditStep(4)}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Food Provision:</Text>
          <Text style={styles.infoVal}>{ed.food ? "Included" : "Disabled"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vehicle Pass:</Text>
          <Text style={styles.infoVal}>{ed.vehiclePass ? "Included" : "Disabled"}</Text>
        </View>
      </View>

      {/* Verification Terms Disclaimer */}
      <View style={styles.disclaimerCard}>
        <ShieldAlert size={20} color="#d97706" />
        <Text style={styles.disclaimerText}>
          By submitting, this event will be sent to the Platform Admin for review. Once verified, it will be published live on the BookMyEvent mobile app.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#15803d",
  },
  headerSub: {
    fontSize: 12,
    color: "#166534",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  editBtn: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
  },
  eventName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#334155",
    marginLeft: 8,
  },
  statGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  statVal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  hallItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  hallText: {
    fontSize: 13,
    color: "#334155",
    marginLeft: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8",
    fontStyle: "italic",
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
    width: 120,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: "#92400e",
    marginLeft: 10,
    lineHeight: 16,
  },
});
