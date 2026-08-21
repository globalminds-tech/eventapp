import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Switch, Modal, FlatList, Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronDown, X, Calendar, Clock } from "lucide-react-native";
import { get_Venues_details } from "@Services/api";
import { useEffect } from "react";

const CATEGORIES = ["Conference","Exhibition","Workshop","Seminar","Webinar","Concert","Sports","Festival","Other"];
const VISIBILITY_OPTIONS = ["Public","Private","Internal"];
const EVENT_TYPES = ["OneTime","Recurring"];
const OCCURRENCE_OPTIONS = ["Daily","Weekly","Monthly","Yearly"];

// ── Subcomponents (module-level to prevent keyboard blur) ─────────────────────

const SelectField = ({ label, field, placeholder, ed, isView, openDropdown }) => (
  <View style={s.fieldWrap}>
    <Text style={s.label}>{label} <Text style={s.req}>*</Text></Text>
    <TouchableOpacity style={s.selectInput} onPress={() => !isView && openDropdown(field)} disabled={isView}>
      <Text style={{ color: ed[field] ? "#0f172a" : "#94a3b8", fontSize: 14, flex: 1 }}>{ed[field] || placeholder}</Text>
      <ChevronDown size={16} color="#64748b" />
    </TouchableOpacity>
  </View>
);

const InputField = ({ label, field, placeholder, required, multiline, keyboardType, ed, update, isView }) => (
  <View style={s.fieldWrap}>
    <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
    <TextInput
      style={[s.input, multiline && { height: 80, textAlignVertical: "top" }]}
      value={ed[field] || ""}
      onChangeText={(v) => update(field, v)}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      multiline={multiline}
      editable={!isView}
      keyboardType={keyboardType}
    />
  </View>
);

const ToggleRow = ({ label, field, ed, isView, toggleBool }) => (
  <View style={s.toggleRow}>
    <Text style={s.toggleLabel}>{label}</Text>
    <Switch
      value={!!ed[field]}
      onValueChange={() => !isView && toggleBool(field)}
      trackColor={{ false: "#e2e8f0", true: "#bae6fd" }}
      thumbColor={ed[field] ? "#0284c7" : "#94a3b8"}
      disabled={isView}
    />
  </View>
);

const DatePickerField = ({ label, field, required, ed, onOpen, isView }) => (
  <View style={s.fieldWrap}>
    <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
    <TouchableOpacity style={s.pickerBtn} onPress={() => !isView && onOpen(field, "date")} disabled={isView}>
      <Calendar size={16} color="#0284c7" />
      <Text style={[s.pickerBtnText, !ed[field] && s.pickerPlaceholder]}>
        {ed[field] || "Select date"}
      </Text>
    </TouchableOpacity>
  </View>
);

const TimePickerField = ({ label, field, required, ed, onOpen, isView }) => {
  const display = ed[field]
    ? (() => {
        const [h, m] = (ed[field] || "00:00").split(":");
        const hNum = parseInt(h) || 0;
        const ampm = hNum >= 12 ? "PM" : "AM";
        const h12 = hNum % 12 || 12;
        return `${h12}:${(m || "00").padStart(2, "0")} ${ampm}`;
      })()
    : null;

  return (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
      <TouchableOpacity style={s.pickerBtn} onPress={() => !isView && onOpen(field, "time")} disabled={isView}>
        <Clock size={16} color="#7c3aed" />
        <Text style={[s.pickerBtnText, !display && s.pickerPlaceholder]}>
          {display || "Select time"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function Step1EventDetails({ formData, setFormData, organizerId, isView }) {
  const ed = formData.eventDetails || {};
  const [venues, setVenues] = useState([]);
  const [dropdownType, setDropdownType] = useState(null);
  const [dropdownList, setDropdownList] = useState([]);

  // Picker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState(null);
  const [pickerMode, setPickerMode] = useState("date");
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await get_Venues_details(organizerId);
        setVenues(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
    };
    if (organizerId) loadVenues();
  }, [organizerId]);

  const update = (key, value) =>
    setFormData((prev) => ({ ...prev, eventDetails: { ...prev.eventDetails, [key]: value } }));

  const toggleBool = (key) => update(key, !ed[key]);

  const openDropdown = (type) => {
    setDropdownType(type);
    if (type === "category") setDropdownList(CATEGORIES);
    else if (type === "visibility") setDropdownList(VISIBILITY_OPTIONS);
    else if (type === "eventType") setDropdownList(EVENT_TYPES);
    else if (type === "occurrence") setDropdownList(OCCURRENCE_OPTIONS);
    else if (type === "venue") setDropdownList(venues.map((v) => v.venue_name));
  };

  const selectItem = (val) => {
    update(dropdownType, val);
    if (dropdownType === "venue") {
      const v = venues.find((ve) => ve.venue_name === val);
      if (v) update("address", v.address || "");
    }
    setDropdownType(null);
  };

  // Open date/time picker
  const openPicker = (field, mode) => {
    let date = new Date();
    const cur = ed[field];
    if (cur) {
      if (mode === "date") {
        const d = new Date(cur);
        if (!isNaN(d.getTime())) date = d;
      } else {
        const [h, m] = (cur || "00:00").split(":");
        date.setHours(parseInt(h) || 0, parseInt(m) || 0, 0);
      }
    }
    setTempDate(date);
    setPickerField(field);
    setPickerMode(mode);
    setPickerVisible(true);
  };

  const applyPicker = (date) => {
    if (!date) return;
    if (pickerMode === "date") {
      const y = date.getFullYear();
      const mo = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      update(pickerField, `${y}-${mo}-${d}`);
    } else {
      const h = String(date.getHours()).padStart(2, "0");
      const m = String(date.getMinutes()).padStart(2, "0");
      update(pickerField, `${h}:${m}`);
    }
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

  // Inline Add Location Modal state
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLocAddress, setNewLocAddress] = useState("");

  const handleAddNewLocation = () => {
    if (!newLocName) {
      Alert.alert("Missing Name", "Please enter a location name.");
      return;
    }
    const newVenueObj = { venue_name: newLocName, address: newLocAddress };
    setVenues((prev) => [newVenueObj, ...prev]);
    update("venue", newLocName);
    update("address", newLocAddress);
    setShowAddLocationModal(false);
    setNewLocName("");
    setNewLocAddress("");
    Alert.alert("Location Added", `"${newLocName}" has been added and selected.`);
  };

  const handleDownloadExcelTemplate = () => {
    Alert.alert(
      "Download Template",
      "Sample Excel Event Template (.xlsx) format:\nColumns: EventName, Category, Description, Venue, Address, StartDate, EndDate, Capacity, PassFeeINR",
      [{ text: "OK" }]
    );
  };

  const handleExcelPDFAutoFill = () => {
    Alert.alert(
      "Auto-Fill from Excel/PDF",
      "Parsing spreadsheet details...",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import Sample Event Data",
          onPress: () => {
            setFormData((prev) => ({
              ...prev,
              eventDetails: {
                ...prev.eventDetails,
                eventName: "TechInnovate Summit 2026",
                category: "Conference",
                description: "Annual flagship technology conference covering AI, Cloud, and Product Innovation.",
                venue: "Grand Convention Center",
                address: "45 Technology Parkway, Tech Corridor",
                startDate: "2026-10-15",
                endDate: "2026-10-17",
                startTime: "09:00",
                endTime: "18:00",
                tags: "AI, Technology, Product",
                amenities: "WiFi, AC, Catering, Parking",
              },
              bookingSettings: {
                ...prev.bookingSettings,
                entryType: "Paid",
                passFeeINR: "1499",
                capacity: "500",
              },
            }));
            Alert.alert("Extracted Successfully", "Event details auto-filled from spreadsheet!");
          },
        },
      ]
    );
  };

  return (
    <View>
      {/* Excel / PDF Auto-Fill Toolbar */}
      {!isView && (
        <View style={s.excelToolbar}>
          <Text style={s.excelToolbarTitle}>⚡ Smart Quick-Fill</Text>
          <View style={s.excelBtnRow}>
            <TouchableOpacity style={s.excelBtnOutline} onPress={handleDownloadExcelTemplate}>
              <Text style={s.excelBtnOutlineText}>📥 Download Template (.xlsx)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.excelBtnPrimary} onPress={handleExcelPDFAutoFill}>
              <Text style={s.excelBtnPrimaryText}>📄 Import Excel / PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Basic Info */}

      <View style={s.section}>
        <Text style={s.sectionTitle}>Basic Information</Text>
        <SelectField label="Category" field="category" placeholder="Select Category" ed={ed} isView={isView} openDropdown={openDropdown} />
        <InputField label="Event Name" field="eventName" placeholder="Enter event name" required ed={ed} update={update} isView={isView} />
        <InputField label="Description" field="description" placeholder="Event description..." required multiline ed={ed} update={update} isView={isView} />
        <InputField label="Tags" field="tags" placeholder="e.g. tech, conference" ed={ed} update={update} isView={isView} />
        <InputField label="Amenities" field="amenities" placeholder="e.g. WiFi, Parking" ed={ed} update={update} isView={isView} />
      </View>

      {/* Options */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Event Options</Text>
        <View style={s.fieldWrap}>
          <Text style={s.label}>Include Program</Text>
          <View style={s.radioRow}>
            {["Yes","No"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[s.radio, ed.includeProgram === opt && s.radioSelected]}
                onPress={() => !isView && update("includeProgram", opt)}
                disabled={isView}
              >
                <Text style={[s.radioText, ed.includeProgram === opt && { color: "#0284c7" }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <SelectField label="Visibility" field="visibility" placeholder="Select Visibility" ed={ed} isView={isView} openDropdown={openDropdown} />
      </View>

      {/* Communication */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Communication Channels</Text>
        <ToggleRow label="Mail" field="mail" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="WhatsApp" field="whatsapp" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Print" field="print" ed={ed} isView={isView} toggleBool={toggleBool} />
      </View>

      {/* Visitor Details */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Visitor Details Required</Text>
        <ToggleRow label="Visitor Mail" field="visitorMail" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Visitor Name" field="visitorName" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Visitor Photo" field="visitorPhoto" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Visitor Mobile" field="visitorMobile" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Document Proof" field="documentProof" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Day Pass" field="dayPass" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="International Include" field="isInternationalInclude" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Aadhar" field="aadhar" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Passport" field="passport" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Welcome Kit" field="welcomeKit" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Food Provision" field="food" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Vehicle Pass" field="vehiclePass" ed={ed} isView={isView} toggleBool={toggleBool} />
        <ToggleRow label="Vehicle Number" field="vehicleNumber" ed={ed} isView={isView} toggleBool={toggleBool} />
      </View>

      {/* Event Schedule */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Event Schedule</Text>
        <SelectField label="Event Type" field="eventType" placeholder="Select Type" ed={ed} isView={isView} openDropdown={openDropdown} />
        {ed.eventType === "Recurring" && (
          <SelectField label="Occurrence" field="occurrence" placeholder="Select Occurrence" ed={ed} isView={isView} openDropdown={openDropdown} />
        )}
        <View style={s.rowFields}>
          <View style={{ flex: 1 }}>
            <DatePickerField label="Start Date" field="startDate" required ed={ed} onOpen={openPicker} isView={isView} />
          </View>
          <View style={{ flex: 1 }}>
            <TimePickerField label="Start Time" field="startTime" required ed={ed} onOpen={openPicker} isView={isView} />
          </View>
        </View>
        <View style={s.rowFields}>
          <View style={{ flex: 1 }}>
            <DatePickerField label="End Date" field="endDate" required ed={ed} onOpen={openPicker} isView={isView} />
          </View>
          <View style={{ flex: 1 }}>
            <TimePickerField label="End Time" field="endTime" required ed={ed} onOpen={openPicker} isView={isView} />
          </View>
        </View>
      </View>

      {/* Venue */}
      <View style={s.section}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={s.sectionTitle}>Venue</Text>
          {!isView && (
            <TouchableOpacity style={s.addInlineBtn} onPress={() => setShowAddLocationModal(true)}>
              <Text style={s.addInlineBtnText}>+ Add New Location</Text>
            </TouchableOpacity>
          )}
        </View>
        <SelectField label="Venue" field="venue" placeholder="Select Venue" ed={ed} isView={isView} openDropdown={openDropdown} />
        <InputField label="Address" field="address" placeholder="Enter venue address" required multiline ed={ed} update={update} isView={isView} />
      </View>

      {/* Add New Location Modal Dialog */}
      <Modal visible={showAddLocationModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.dropdownCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add New Location</Text>
              <TouchableOpacity onPress={() => setShowAddLocationModal(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              <Text style={s.label}>Location / Venue Name *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. City Convention Center"
                placeholderTextColor="#94a3b8"
                value={newLocName}
                onChangeText={setNewLocName}
              />
              <Text style={[s.label, { marginTop: 12 }]}>Address</Text>
              <TextInput
                style={[s.input, { height: 70, textAlignVertical: "top" }]}
                placeholder="e.g. 123 Main Boulevard, Chennai"
                placeholderTextColor="#94a3b8"
                multiline
                value={newLocAddress}
                onChangeText={setNewLocAddress}
              />
              <TouchableOpacity style={s.submitModalBtn} onPress={handleAddNewLocation}>
                <Text style={s.submitModalBtnText}>Save & Select Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>


      {/* Date / Time Picker Modal (iOS) */}
      {Platform.OS === "ios" && pickerVisible && (
        <Modal visible transparent animationType="slide">
          <View style={s.pickerOverlay}>
            <View style={s.pickerSheet}>
              {/* Header */}
              <View style={s.pickerHeader}>
                <Text style={s.pickerHeaderTitle}>
                  {pickerMode === "date" ? "📅  Select Date" : "🕐  Select Time"}
                </Text>
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
                mode={pickerMode}
                display={pickerMode === "date" ? "inline" : "spinner"}
                onChange={onPickerChange}
                style={{ backgroundColor: "#fff" }}
                themeVariant="light"
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android: renders inline when visible */}
      {Platform.OS === "android" && pickerVisible && (
        <DateTimePicker
          value={tempDate}
          mode={pickerMode}
          display={pickerMode === "date" ? "calendar" : "clock"}
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
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  toggleLabel: { fontSize: 13, color: "#334155", fontWeight: "600" },
  radioRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  radio: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#f8fafc" },
  radioSelected: { borderColor: "#0284c7", backgroundColor: "#f0f9ff" },
  radioText: { fontSize: 13, color: "#475569", fontWeight: "bold" },
  rowFields: { flexDirection: "row", gap: 10 },

  // Picker buttons
  pickerBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "#f8fafc" },
  pickerBtnText: { fontSize: 14, color: "#0f172a", flex: 1 },
  pickerPlaceholder: { color: "#94a3b8" },

  // Dropdown modal
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

  // Excel Toolbar & Inline Modal styles
  excelToolbar: { backgroundColor: "#f0f9ff", borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#bae6fd" },
  excelToolbarTitle: { fontSize: 14, fontWeight: "800", color: "#0369a1", marginBottom: 8 },
  excelBtnRow: { flexDirection: "row", gap: 10 },
  excelBtnOutline: { flex: 1, borderWidth: 1, borderColor: "#0284c7", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 8, alignItems: "center", backgroundColor: "#fff" },
  excelBtnOutlineText: { fontSize: 12, fontWeight: "700", color: "#0284c7" },
  excelBtnPrimary: { flex: 1, backgroundColor: "#0284c7", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 8, alignItems: "center" },
  excelBtnPrimaryText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  addInlineBtn: { backgroundColor: "#e0f2fe", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  addInlineBtnText: { fontSize: 12, fontWeight: "700", color: "#0369a1" },
  submitModalBtn: { backgroundColor: "#0284c7", borderRadius: 8, paddingVertical: 12, alignItems: "center", marginTop: 16 },
  submitModalBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});

