import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Switch, Modal, FlatList, Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronDown, X, Calendar } from "lucide-react-native";

const PASS_TYPES   = ["Single", "Multiple", "Group"];
const ENTRY_TYPES  = ["Free", "Paid", "Donation", "Invitation"];
const CHARGE_TYPES = ["Free", "Paid"];
const PRICE_TYPES  = ["Fixed", "Variable"];
const CURRENCIES   = ["INR", "USD", "EUR", "GBP"];

// ── Subcomponents (module-level to prevent keyboard blur) ─────────────────────

const SelectField = ({ label, field, placeholder, required, bk, isView, openDropdown }) => (
  <View style={s.fieldWrap}>
    <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
    <TouchableOpacity style={s.selectInput} onPress={() => !isView && openDropdown(field)} disabled={isView}>
      <Text style={{ color: bk[field] ? "#0f172a" : "#94a3b8", fontSize: 14, flex: 1 }}>{bk[field] || placeholder}</Text>
      <ChevronDown size={16} color="#64748b" />
    </TouchableOpacity>
  </View>
);

const InputField = ({ label, field, placeholder, required, keyboardType, bk, update, isView }) => (
  <View style={s.fieldWrap}>
    <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
    <TextInput
      style={s.input}
      value={String(bk[field] || "")}
      onChangeText={(v) => update(field, v)}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      editable={!isView}
      keyboardType={keyboardType || "default"}
    />
  </View>
);

const DatePickerField = ({ label, field, required, bk, onOpen, isView }) => (
  <View style={s.fieldWrap}>
    <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
    <TouchableOpacity style={s.pickerBtn} onPress={() => !isView && onOpen(field)} disabled={isView}>
      <Calendar size={16} color="#0284c7" />
      <Text style={[s.pickerBtnText, !bk[field] && s.pickerPlaceholder]}>
        {bk[field] || "Select date"}
      </Text>
    </TouchableOpacity>
  </View>
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function Step2Booking({ formData, setFormData, isView }) {
  const bk = formData.booking || {};
  const [dropdownType, setDropdownType] = useState(null);
  const [dropdownList, setDropdownList] = useState([]);

  // Picker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField]     = useState(null);
  const [tempDate, setTempDate]           = useState(new Date());

  const update = (key, value) =>
    setFormData((prev) => ({ ...prev, booking: { ...prev.booking, [key]: value } }));

  const openDropdown = (type) => {
    setDropdownType(type);
    if (type === "passType")   setDropdownList(PASS_TYPES);
    else if (type === "entryType")  setDropdownList(ENTRY_TYPES);
    else if (type === "chargeType") setDropdownList(CHARGE_TYPES);
    else if (type === "priceType")  setDropdownList(PRICE_TYPES);
    else if (type === "currency")   setDropdownList(CURRENCIES);
  };

  const selectItem = (val) => { update(dropdownType, val); setDropdownType(null); };

  const openPicker = (field) => {
    let date = new Date();
    const cur = bk[field];
    if (cur) {
      const d = new Date(cur);
      if (!isNaN(d.getTime())) date = d;
    }
    setTempDate(date);
    setPickerField(field);
    setPickerVisible(true);
  };

  const applyPicker = (date) => {
    if (!date) return;
    const y  = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, "0");
    const d  = String(date.getDate()).padStart(2, "0");
    update(pickerField, `${y}-${mo}-${d}`);
    setPickerVisible(false);
  };

  const onPickerChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setPickerVisible(false);
      if (event.type !== "dismissed" && selectedDate) applyPicker(selectedDate);
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  return (
    <View>
      {/* Booking Schedule */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Booking Schedule</Text>
        <View style={s.rowFields}>
          <View style={{ flex: 1 }}>
            <DatePickerField label="Booking Start Date" field="bookingStartDate" required bk={bk} onOpen={openPicker} isView={isView} />
          </View>
          <View style={{ flex: 1 }}>
            <DatePickerField label="Booking End Date" field="bookingEndDate" required bk={bk} onOpen={openPicker} isView={isView} />
          </View>
        </View>
      </View>

      {/* Pass Configuration */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Pass Configuration</Text>
        <InputField label="Capacity" field="capacity" placeholder="e.g. 1000" required keyboardType="number-pad" bk={bk} update={update} isView={isView} />
        <SelectField label="Pass Type"   field="passType"   placeholder="Select Pass Type"   required bk={bk} isView={isView} openDropdown={openDropdown} />
        <SelectField label="Entry Type"  field="entryType"  placeholder="Select Entry Type"  required bk={bk} isView={isView} openDropdown={openDropdown} />
        <SelectField label="Charge Type" field="chargeType" placeholder="Select Charge Type" required bk={bk} isView={isView} openDropdown={openDropdown} />
        <InputField label="Max Passes / Person" field="maxPass" placeholder="e.g. 5" required keyboardType="number-pad" bk={bk} update={update} isView={isView} />
      </View>

      {/* Pricing */}
      {bk.chargeType === "Paid" && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Pricing</Text>
          <InputField label="Razorpay Key" field="razorpayKey" placeholder="Enter Razorpay Key" bk={bk} update={update} isView={isView} />
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>Include Tax</Text>
            <Switch
              value={!!bk.includeTax}
              onValueChange={() => !isView && update("includeTax", !bk.includeTax)}
              trackColor={{ false: "#e2e8f0", true: "#bae6fd" }}
              thumbColor={bk.includeTax ? "#0284c7" : "#94a3b8"}
              disabled={isView}
            />
          </View>
          <SelectField label="Price Type" field="priceType" placeholder="Select Price Type" bk={bk} isView={isView} openDropdown={openDropdown} />
          <SelectField label="Currency"   field="currency"   placeholder="Select Currency"   bk={bk} isView={isView} openDropdown={openDropdown} />
          <DatePickerField label="Early Bird Expiry Date" field="earlyBirdExpire" bk={bk} onOpen={openPicker} isView={isView} />
        </View>
      )}

      {/* Dropdown Modal */}
      <Modal visible={!!dropdownType} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.dropdownCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select {dropdownType}</Text>
              <TouchableOpacity onPress={() => setDropdownType(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={dropdownList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.dropdownItem} onPress={() => selectItem(item)}>
                  <Text style={s.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 400 }}
            />
          </View>
        </View>
      </Modal>

      {/* iOS Date Picker Sheet */}
      {Platform.OS === "ios" && pickerVisible && (
        <Modal visible transparent animationType="slide">
          <View style={s.pickerOverlay}>
            <View style={s.pickerSheet}>
              <View style={s.pickerHeader}>
                <Text style={s.pickerHeaderTitle}>📅  Select Date</Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity onPress={() => setPickerVisible(false)} style={s.pickerCancelBtn}>
                    <Text style={s.pickerCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => applyPicker(tempDate)} style={s.pickerDoneBtn}>
                    <Text style={s.pickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="inline"
                onChange={onPickerChange}
                style={{ backgroundColor: "#fff" }}
                themeVariant="light"
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android Date Picker */}
      {Platform.OS === "android" && pickerVisible && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="calendar"
          onChange={onPickerChange}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#0284c7", marginBottom: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "bold", color: "#334155", marginBottom: 5 },
  req: { color: "#ef4444" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  selectInput: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "#f8fafc" },
  rowFields: { flexDirection: "row", gap: 10 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f8fafc", marginBottom: 10 },
  toggleLabel: { fontSize: 13, color: "#334155", fontWeight: "600" },

  // Picker button
  pickerBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "#f8fafc" },
  pickerBtnText: { fontSize: 14, color: "#0f172a", flex: 1 },
  pickerPlaceholder: { color: "#94a3b8" },

  // Dropdown
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  dropdownCard: { backgroundColor: "#fff", borderRadius: 16, width: "90%", padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 12, marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemText: { fontSize: 14, color: "#0f172a" },

  // iOS picker sheet
  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  pickerSheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32, overflow: "hidden" },
  pickerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  pickerHeaderTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  pickerCancelBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#f1f5f9" },
  pickerCancelText: { color: "#64748b", fontWeight: "bold", fontSize: 14 },
  pickerDoneBtn: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, backgroundColor: "#0284c7" },
  pickerDoneText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
