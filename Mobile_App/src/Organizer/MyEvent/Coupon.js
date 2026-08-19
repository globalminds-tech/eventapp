import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet, Modal, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus, Search, Trash2, Save, X, Tag, ChevronDown
} from "lucide-react-native";

// --- List Page ----------------------------------------------------------------
function ListPage({ onAdd }) {
  const [search, setSearch] = useState("");
  const [coupons] = useState([]);

  const filtered = coupons.filter((c) =>
    (c.couponCode || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.event || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Tag size={22} color="#0284c7" />
          <Text style={s.headerTitle}>Coupon Code</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={onAdd}>
          <Plus size={18} color="#fff" />
          <Text style={s.addBtnText}>Add Coupon</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchContainer}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          style={s.searchInput}
          placeholder="Search coupons..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <X size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={s.emptyContainer}>
          <Tag size={48} color="#cbd5e1" />
          <Text style={s.emptyText}>No coupons found</Text>
          <Text style={s.emptySubText}>Add your first coupon to get started</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, idx) => idx.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.couponCode}>{item.couponCode}</Text>
                <View style={[s.statusBadge, item.status === "active" ? s.badgeGreen : s.badgeGray]}>
                  <Text style={[s.statusText, item.status === "active" ? s.textGreen : s.textGray]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardLine}>Event: <Text style={s.cardValue}>{item.event}</Text></Text>
                <Text style={s.cardLine}>Applicable: <Text style={s.cardValue}>{item.applicableUser}</Text></Text>
                <Text style={s.cardLine}>Type: <Text style={s.cardValue}>{item.couponType}</Text></Text>
                <Text style={s.cardLine}>Validity: <Text style={s.cardValue}>{item.startDate} ? {item.endDate}</Text></Text>
                {item.discountPercentage && (
                  <Text style={s.cardLine}>Discount: <Text style={s.cardValue}>{item.discountPercentage}%</Text></Text>
                )}
                {item.discountAmount && (
                  <Text style={s.cardLine}>Discount Amount: <Text style={s.cardValue}>?{item.discountAmount}</Text></Text>
                )}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// --- Form Page ----------------------------------------------------------------
const APPLICABLE_USERS = ["All Users", "New Users", "Returning Users", "VIP Users"];
const COUPON_TYPES = ["Percentage", "Flat Amount"];
const STATUS_OPTIONS = ["Active", "Inactive"];

// ⚠️ These MUST be defined at module level (NOT inside FormPage)
// to avoid keyboard dismissal on every keystroke
const SelectField = ({ label, field, placeholder, required, form, openDropdown, fieldErrors }) => (
  <View style={s.fieldWrap}>
    <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
    <TouchableOpacity style={s.selectInput} onPress={() => openDropdown(field)}>
      <Text style={{ color: form[field] ? "#0f172a" : "#94a3b8", fontSize: 14 }}>
        {form[field] || placeholder}
      </Text>
      <ChevronDown size={16} color="#64748b" />
    </TouchableOpacity>
    {fieldErrors[field] && <Text style={s.errText}>{fieldErrors[field]}</Text>}
  </View>
);

const InputField = ({ label, field, placeholder, required, keyboardType, multiline, form, fc, fieldErrors }) => (
  <View style={s.fieldWrap}>
    <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
    <TextInput
      style={[s.input, multiline && { height: 80, textAlignVertical: "top" }]}
      value={form[field]}
      onChangeText={(v) => fc(field, v)}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      keyboardType={keyboardType || "default"}
      multiline={multiline}
    />
    {fieldErrors[field] && <Text style={s.errText}>{fieldErrors[field]}</Text>}
  </View>
);

function FormPage({ onBack }) {
  const [form, setForm] = useState({
    event: "",
    couponCode: "",
    applicableUser: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    status: "Active",
    minTicketQty: "",
    minBookingAmount: "",
    maxBookingAmount: "",
    deductionAmount: "",
    description: "",
    discountType: "Percentage",
    discountValue: "",
    maxUsagePerEvent: "",
    maxUsagePerVisitor: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showDropdown, setShowDropdown] = useState(null); // "applicableUser"|"status"|"discountType"
  const [dropdownList, setDropdownList] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fc = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const openDropdown = (type) => {
    setShowDropdown(type);
    if (type === "applicableUser") setDropdownList(APPLICABLE_USERS);
    else if (type === "status") setDropdownList(STATUS_OPTIONS);
    else if (type === "discountType") setDropdownList(COUPON_TYPES);
  };

  const selectDropdownItem = (val) => {
    fc(showDropdown, val);
    setShowDropdown(null);
  };

  const handleSave = () => {
    const errors = {};
    if (!form.event.trim()) errors.event = "Event is required";
    if (!form.couponCode.trim()) errors.couponCode = "Coupon code is required";
    if (!form.applicableUser) errors.applicableUser = "Applicable user is required";
    if (!form.startDate.trim()) errors.startDate = "Start date is required";
    if (!form.endDate.trim()) errors.endDate = "End date is required";
    if (!form.minTicketQty.trim()) errors.minTicketQty = "Min ticket quantity is required";
    if (!form.minBookingAmount.trim()) errors.minBookingAmount = "Min booking amount is required";
    if (!form.discountValue.trim()) errors.discountValue = "Discount value is required";
    if (!form.maxUsagePerEvent.trim()) errors.maxUsagePerEvent = "Max usage per event is required";
    if (!form.maxUsagePerVisitor.trim()) errors.maxUsagePerVisitor = "Max usage per visitor is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showNotification("Please fill all required fields", "error");
      return;
    }

    showNotification("Coupon saved successfully!");
    setTimeout(onBack, 1500);
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <X size={18} color="#0284c7" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Add Coupon Code</Text>
        </View>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Save size={16} color="#fff" />
          <Text style={s.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      {toast.show && (
        <View style={[s.toast, toast.type === "success" ? s.toastSuccess : s.toastError]}>
          <Text style={s.toastText}>{toast.message}</Text>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 0 }} keyboardShouldPersistTaps="handled">

        {/* Section: Basic Details */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Basic Details</Text>
          <InputField label="Event" field="event" placeholder="Enter event name" required form={form} fc={fc} fieldErrors={fieldErrors} />
          <InputField label="Coupon Code" field="couponCode" placeholder="e.g. SUMMER20" required form={form} fc={fc} fieldErrors={fieldErrors} />
          <SelectField label="Applicable User" field="applicableUser" placeholder="Select User Type" required form={form} openDropdown={openDropdown} fieldErrors={fieldErrors} />
          {/* Validity */}
          <Text style={s.label}>Validity <Text style={s.req}>*</Text></Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 4 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={s.input}
                placeholder="Start Date (YYYY-MM-DD)"
                placeholderTextColor="#94a3b8"
                value={form.startDate}
                onChangeText={(v) => fc("startDate", v)}
              />
              {fieldErrors.startDate && <Text style={s.errText}>{fieldErrors.startDate}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={s.input}
                placeholder="Start Time"
                placeholderTextColor="#94a3b8"
                value={form.startTime}
                onChangeText={(v) => fc("startTime", v)}
              />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={s.input}
                placeholder="End Date (YYYY-MM-DD)"
                placeholderTextColor="#94a3b8"
                value={form.endDate}
                onChangeText={(v) => fc("endDate", v)}
              />
              {fieldErrors.endDate && <Text style={s.errText}>{fieldErrors.endDate}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={s.input}
                placeholder="End Time"
                placeholderTextColor="#94a3b8"
                value={form.endTime}
                onChangeText={(v) => fc("endTime", v)}
              />
            </View>
          </View>
          <SelectField label="Status" field="status" placeholder="Select Status" required form={form} openDropdown={openDropdown} fieldErrors={fieldErrors} />
        </View>

        {/* Section: Coupon Details */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Coupon Details</Text>
          <InputField label="Min Ticket Quantity" field="minTicketQty" placeholder="e.g. 2" required keyboardType="number-pad" form={form} fc={fc} fieldErrors={fieldErrors} />
          <InputField label="Min Booking Amount Required" field="minBookingAmount" placeholder="e.g. 500" required keyboardType="number-pad" form={form} fc={fc} fieldErrors={fieldErrors} />
          <InputField label="Max Booking Amount Allowed" field="maxBookingAmount" placeholder="e.g. 5000" keyboardType="number-pad" form={form} fc={fc} fieldErrors={fieldErrors} />
          <InputField label="Deduction Amount (if max reached)" field="deductionAmount" placeholder="e.g. 100" keyboardType="number-pad" form={form} fc={fc} fieldErrors={fieldErrors} />
          <InputField label="Coupon Description" field="description" placeholder="Describe this coupon..." multiline form={form} fc={fc} fieldErrors={fieldErrors} />
        </View>

        {/* Section: Discounts */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Discounts</Text>
          {/* Radio for discount type */}
          <Text style={s.label}>Discount Type <Text style={s.req}>*</Text></Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            {["Percentage", "Flat Amount"].map((dt) => (
              <TouchableOpacity
                key={dt}
                style={[s.radio, form.discountType === dt && s.radioSelected]}
                onPress={() => fc("discountType", dt)}
              >
                <Text style={[s.radioText, form.discountType === dt && { color: "#0284c7" }]}>{dt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={s.input}
            placeholder={form.discountType === "Percentage" ? "Enter discount %" : "Enter discount amount"}
            placeholderTextColor="#94a3b8"
            value={form.discountValue}
            onChangeText={(v) => fc("discountValue", v)}
            keyboardType="number-pad"
          />
          {fieldErrors.discountValue && <Text style={s.errText}>{fieldErrors.discountValue}</Text>}
        </View>

        {/* Section: Usage Limit */}
        <View style={[s.section, { marginBottom: 40 }]}>
          <Text style={s.sectionTitle}>Usage Limit</Text>
          <InputField label="Max Usage per Event" field="maxUsagePerEvent" placeholder="e.g. 100" required keyboardType="number-pad" form={form} fc={fc} fieldErrors={fieldErrors} />
          <InputField label="Max Usage per Visitor" field="maxUsagePerVisitor" placeholder="e.g. 1" required keyboardType="number-pad" form={form} fc={fc} fieldErrors={fieldErrors} />
        </View>
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal visible={!!showDropdown} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.dropdownCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select {showDropdown}</Text>
              <TouchableOpacity onPress={() => setShowDropdown(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            {dropdownList.map((item) => (
              <TouchableOpacity key={item} style={s.dropdownItem} onPress={() => selectDropdownItem(item)}>
                <Text style={s.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Root ---------------------------------------------------------------------
export default function CouponCode() {
  const [view, setView] = useState("list");
  return view === "list"
    ? <ListPage onAdd={() => setView("form")} />
    : <FormPage onBack={() => setView("list")} />;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#0c4a6e" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0284c7", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  backBtn: { padding: 6, backgroundColor: "#f0f9ff", borderRadius: 8, borderWidth: 1, borderColor: "#bae6fd" },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#16a34a", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 },
  saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", margin: 16, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", gap: 8 },
  searchInput: { flex: 1, height: 44, color: "#0f172a", fontSize: 14 },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#94a3b8" },
  emptySubText: { fontSize: 13, color: "#cbd5e1" },

  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  couponCode: { fontSize: 16, fontWeight: "bold", color: "#0284c7", letterSpacing: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeGreen: { backgroundColor: "#dcfce7" },
  badgeGray: { backgroundColor: "#f1f5f9" },
  statusText: { fontSize: 10, fontWeight: "bold" },
  textGreen: { color: "#15803d" },
  textGray: { color: "#64748b" },
  cardBody: { gap: 4 },
  cardLine: { fontSize: 12, color: "#64748b" },
  cardValue: { color: "#0f172a", fontWeight: "600" },

  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#0284c7", marginBottom: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 8 },
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "bold", color: "#334155", marginBottom: 5 },
  req: { color: "#ef4444" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  selectInput: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, justifyContent: "space-between", flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc" },
  errText: { color: "#ef4444", fontSize: 11, fontWeight: "bold", marginTop: 3 },

  radio: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#f8fafc" },
  radioSelected: { borderColor: "#0284c7", backgroundColor: "#f0f9ff" },
  radioText: { fontSize: 13, color: "#475569", fontWeight: "bold" },

  toast: { position: "absolute", top: 80, left: 16, right: 16, padding: 12, borderRadius: 8, zIndex: 100, alignItems: "center" },
  toastSuccess: { backgroundColor: "#d1fae5" },
  toastError: { backgroundColor: "#ffe4e6" },
  toastText: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  dropdownCard: { backgroundColor: "#fff", borderRadius: 16, width: "90%", padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 12, marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemText: { fontSize: 14, color: "#0f172a" },
});
