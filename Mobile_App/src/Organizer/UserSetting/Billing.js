import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";

export const Billing = () => {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("CHENNAI");
  const [state, setState] = useState("TAMIL NADU");
  const [country, setCountry] = useState("INDIA");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Text style={styles.pageTitle}>My Billings</Text>

        {/* LEFT PANEL: Billing Address */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Billing Address</Text>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={3}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter Address"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* City State Country */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={styles.gridCol}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
              />
            </View>

            <View style={styles.gridCol}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
              />
            </View>
          </View>
        </View>

        {/* RIGHT PANEL: Payment History */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Payment History</Text>

          {/* Horizontal scroll for table */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { width: 100 }]}>Date</Text>
                <Text style={[styles.th, { width: 200 }]}>Description</Text>
                <Text style={[styles.th, { width: 100 }]}>Plan Code</Text>
                <Text style={[styles.th, { width: 100 }]}>Amount</Text>
                <Text style={[styles.th, { width: 80, textAlign: "center" }]}>Invoice</Text>
              </View>

              {/* Table Row */}
              <View style={styles.tableRow}>
                <Text style={[styles.td, { width: 100 }]}>Mar 3, 2025</Text>
                <Text style={[styles.td, { width: 200 }]}>Upgraded to Enterprise Plan</Text>
                <Text style={[styles.td, { width: 100 }]}>EP005</Text>
                <Text style={[styles.td, { width: 100 }]}>?5,000.99</Text>
                <View style={[styles.td, { width: 80, alignItems: "center" }]}>
                  <TouchableOpacity style={styles.invoiceBtn}>
                    <Text style={styles.invoiceIcon}>??</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Table Footer / Pagination */}
          <View style={styles.paginationRow}>
            <Text style={styles.paginationText}>Showing 1 to 1 of 1 entries</Text>

            <View style={styles.paginationControls}>
              <TouchableOpacity style={styles.pageBtn} disabled>
                <Text style={styles.pageBtnTextDisabled}>«</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pageBtn, styles.pageBtnActive]}>
                <Text style={styles.pageBtnTextActive}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn} disabled>
                <Text style={styles.pageBtnTextDisabled}>»</Text>
              </TouchableOpacity>

              {/* Rows Per Page Custom Dropdown */}
              <View style={styles.selectWrapper}>
                <TouchableOpacity
                  style={styles.selectTrigger}
                  onPress={() => setShowRowsDropdown(!showRowsDropdown)}
                >
                  <Text style={styles.selectValue}>{rowsPerPage}</Text>
                  <ChevronRight size={14} color="#64748b" style={styles.dropdownChevron} />
                </TouchableOpacity>

                {showRowsDropdown && (
                  <View style={styles.dropdownList}>
                    {[10, 25, 50].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setRowsPerPage(option);
                          setShowRowsDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
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
  scrollContent: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#334155",
    backgroundColor: "#ffffff",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#334155",
    backgroundColor: "#ffffff",
    height: 80,
    textAlignVertical: "top",
  },
  gridRow: {
    flexDirection: "row",
    gap: 8,
  },
  gridCol: {
    flex: 1,
  },
  tableScroll: {
    borderWidth: 1,
    borderColor: "#f1f5f9",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  table: {
    minWidth: 580,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0284c7", // sky-600
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  th: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  td: {
    fontSize: 13,
    color: "#334155",
  },
  invoiceBtn: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#ffffff",
  },
  invoiceIcon: {
    fontSize: 14,
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  paginationText: {
    fontSize: 13,
    color: "#475569",
  },
  paginationControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageBtn: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  pageBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  pageBtnTextDisabled: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  pageBtnTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  selectWrapper: {
    position: "relative",
    zIndex: 1000,
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 50,
    justifyContent: "space-between",
  },
  selectValue: {
    fontSize: 12,
    color: "#64748b",
  },
  dropdownChevron: {
    transform: [{ rotate: "90deg" }],
    marginLeft: 2,
  },
  dropdownList: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    marginBottom: 4,
    elevation: 5,
  },
  dropdownOption: {
    paddingVertical: 6,
    alignItems: "center",
  },
  dropdownOptionText: {
    fontSize: 12,
    color: "#64748b",
  },
});
