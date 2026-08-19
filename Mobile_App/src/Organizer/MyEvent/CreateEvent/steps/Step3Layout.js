import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Modal, FlatList } from "react-native";
import { Plus, Trash2, ChevronDown, X } from "lucide-react-native";

const FLOOR_TYPES = ["Stall", "Seat", "Open"];
const STALL_TYPES = ["Standard", "Premium", "VIP", "Corner"];
const STALL_SIZES = ["Small", "Medium", "Large", "XL"];
const VISIBILITY_OPTIONS = ["Public", "Private"];

const EMPTY_STALL = { stallName: "", size: "", sizeRange: "", visibility: "Public", type: "", priceINR: "", priceUSD: "", primeSeat: false, primePriceINR: "", primePriceUSD: "" };
const EMPTY_AMENITY = { stallName: "", amenity: "", qty: "" };

export default function Step3Layout({ formData, setFormData, isView }) {
  const layout = formData.layout || { stalls: [], amenities: [] };
  const [dropdownType, setDropdownType] = useState(null);
  const [dropdownList, setDropdownList] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editField, setEditField] = useState(null);

  const updateLayout = (key, value) => {
    setFormData((prev) => ({ ...prev, layout: { ...prev.layout, [key]: value } }));
  };

  // Stall Management
  const addStall = () => updateLayout("stalls", [...(layout.stalls || []), { ...EMPTY_STALL }]);
  const removeStall = (idx) => updateLayout("stalls", layout.stalls.filter((_, i) => i !== idx));
  const updateStall = (idx, key, val) => {
    const s = [...(layout.stalls || [])];
    s[idx] = { ...s[idx], [key]: val };
    updateLayout("stalls", s);
  };

  // Amenity Management
  const addAmenity = () => updateLayout("amenities", [...(layout.amenities || []), { ...EMPTY_AMENITY }]);
  const removeAmenity = (idx) => updateLayout("amenities", layout.amenities.filter((_, i) => i !== idx));
  const updateAmenity = (idx, key, val) => {
    const a = [...(layout.amenities || [])];
    a[idx] = { ...a[idx], [key]: val };
    updateLayout("amenities", a);
  };

  const openStallDropdown = (idx, field, type) => {
    setEditIdx(idx);
    setEditField(field);
    setDropdownType(type);
    if (type === "stallType") setDropdownList(STALL_TYPES);
    else if (type === "stallSize") setDropdownList(STALL_SIZES);
    else if (type === "stallVisibility") setDropdownList(VISIBILITY_OPTIONS);
  };

  const selectItem = (val) => {
    if (editField && editIdx !== null) updateStall(editIdx, editField, val);
    setDropdownType(null);
    setEditIdx(null);
    setEditField(null);
  };

  return (
    <View>
      {/* Floor Type */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Layout Configuration</Text>
        <Text style={s.label}>Floor Type <Text style={s.req}>*</Text></Text>
        <View style={s.radioRow}>
          {FLOOR_TYPES.map((ft) => (
            <TouchableOpacity key={ft} style={[s.radio, layout.floorType === ft && s.radioSelected]}
              onPress={() => !isView && updateLayout("floorType", ft)} disabled={isView}>
              <Text style={[s.radioText, layout.floorType === ft && { color: "#0284c7" }]}>{ft}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.toggleRow}>
          <Text style={s.toggleLabel}>Day Based</Text>
          <Switch value={!!layout.dayBased} onValueChange={() => !isView && updateLayout("dayBased", !layout.dayBased)}
            trackColor={{ false: "#e2e8f0", true: "#bae6fd" }} thumbColor={layout.dayBased ? "#0284c7" : "#94a3b8"} disabled={isView} />
        </View>
        <Text style={s.label}>Person Pass</Text>
        <TextInput style={s.input} value={String(layout.personPass || "")} onChangeText={(v) => updateLayout("personPass", v)} placeholder="e.g. 2" placeholderTextColor="#94a3b8" keyboardType="number-pad" editable={!isView} />
        <View style={[s.toggleRow, { marginTop: 10 }]}>
          <Text style={s.toggleLabel}>Include Tax</Text>
          <Switch value={!!layout.includeTax} onValueChange={() => !isView && updateLayout("includeTax", !layout.includeTax)}
            trackColor={{ false: "#e2e8f0", true: "#bae6fd" }} thumbColor={layout.includeTax ? "#0284c7" : "#94a3b8"} disabled={isView} />
        </View>
      </View>

      {/* Stalls */}
      {layout.floorType === "Stall" && (
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Stalls ({(layout.stalls || []).length})</Text>
            {!isView && (
              <TouchableOpacity style={s.addBtn} onPress={addStall}>
                <Plus size={14} color="#0284c7" /><Text style={s.addBtnText}>Add Stall</Text>
              </TouchableOpacity>
            )}
          </View>
          {(layout.stalls || []).map((stall, idx) => (
            <View key={idx} style={s.itemCard}>
              <View style={s.itemHeader}>
                <Text style={s.itemLabel}>Stall #{idx + 1}</Text>
                {!isView && <TouchableOpacity onPress={() => removeStall(idx)}><Trash2 size={16} color="#ef4444" /></TouchableOpacity>}
              </View>
              <TextInput style={s.input} value={stall.stallName} onChangeText={(v) => updateStall(idx, "stallName", v)} placeholder="Stall Name" placeholderTextColor="#94a3b8" editable={!isView} />
              <View style={[s.rowFields, { marginTop: 8 }]}>
                <TouchableOpacity style={[s.selectInput, { flex: 1 }]} onPress={() => !isView && openStallDropdown(idx, "type", "stallType")}>
                  <Text style={{ color: stall.type ? "#0f172a" : "#94a3b8", fontSize: 13, flex: 1 }}>{stall.type || "Type"}</Text>
                  <ChevronDown size={14} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity style={[s.selectInput, { flex: 1 }]} onPress={() => !isView && openStallDropdown(idx, "size", "stallSize")}>
                  <Text style={{ color: stall.size ? "#0f172a" : "#94a3b8", fontSize: 13, flex: 1 }}>{stall.size || "Size"}</Text>
                  <ChevronDown size={14} color="#64748b" />
                </TouchableOpacity>
              </View>
              <View style={[s.rowFields, { marginTop: 8 }]}>
                <TextInput style={[s.input, { flex: 1 }]} value={String(stall.priceINR || "")} onChangeText={(v) => updateStall(idx, "priceINR", v)} placeholder="Price (INR)" placeholderTextColor="#94a3b8" keyboardType="number-pad" editable={!isView} />
                <TextInput style={[s.input, { flex: 1 }]} value={String(stall.priceUSD || "")} onChangeText={(v) => updateStall(idx, "priceUSD", v)} placeholder="Price (USD)" placeholderTextColor="#94a3b8" keyboardType="number-pad" editable={!isView} />
              </View>
              <View style={[s.toggleRow, { marginTop: 8 }]}>
                <Text style={s.toggleLabel}>Prime Seat</Text>
                <Switch value={!!stall.primeSeat} onValueChange={() => !isView && updateStall(idx, "primeSeat", !stall.primeSeat)}
                  trackColor={{ false: "#e2e8f0", true: "#bae6fd" }} thumbColor={stall.primeSeat ? "#0284c7" : "#94a3b8"} disabled={isView} />
              </View>
              {stall.primeSeat && (
                <View style={[s.rowFields, { marginTop: 8 }]}>
                  <TextInput style={[s.input, { flex: 1 }]} value={String(stall.primePriceINR || "")} onChangeText={(v) => updateStall(idx, "primePriceINR", v)} placeholder="Prime INR" placeholderTextColor="#94a3b8" keyboardType="number-pad" editable={!isView} />
                  <TextInput style={[s.input, { flex: 1 }]} value={String(stall.primePriceUSD || "")} onChangeText={(v) => updateStall(idx, "primePriceUSD", v)} placeholder="Prime USD" placeholderTextColor="#94a3b8" keyboardType="number-pad" editable={!isView} />
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Amenities */}
      <View style={s.section}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>Amenities ({(layout.amenities || []).length})</Text>
          {!isView && (
            <TouchableOpacity style={s.addBtn} onPress={addAmenity}>
              <Plus size={14} color="#0284c7" /><Text style={s.addBtnText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
        {(layout.amenities || []).map((am, idx) => (
          <View key={idx} style={s.itemCard}>
            <View style={s.itemHeader}>
              <Text style={s.itemLabel}>Amenity #{idx + 1}</Text>
              {!isView && <TouchableOpacity onPress={() => removeAmenity(idx)}><Trash2 size={16} color="#ef4444" /></TouchableOpacity>}
            </View>
            <TextInput style={s.input} value={am.stallName} onChangeText={(v) => updateAmenity(idx, "stallName", v)} placeholder="For Stall" placeholderTextColor="#94a3b8" editable={!isView} />
            <View style={[s.rowFields, { marginTop: 8 }]}>
              <TextInput style={[s.input, { flex: 2 }]} value={am.amenity} onChangeText={(v) => updateAmenity(idx, "amenity", v)} placeholder="Amenity Name" placeholderTextColor="#94a3b8" editable={!isView} />
              <TextInput style={[s.input, { flex: 1 }]} value={String(am.qty || "")} onChangeText={(v) => updateAmenity(idx, "qty", v)} placeholder="Qty" placeholderTextColor="#94a3b8" keyboardType="number-pad" editable={!isView} />
            </View>
          </View>
        ))}
      </View>

      {/* Dropdown Modal */}
      <Modal visible={!!dropdownType} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.dropdownCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select</Text>
              <TouchableOpacity onPress={() => setDropdownType(null)}><X size={20} color="#64748b" /></TouchableOpacity>
            </View>
            <FlatList data={dropdownList} keyExtractor={(item) => item} renderItem={({ item }) => (
              <TouchableOpacity style={s.dropdownItem} onPress={() => selectItem(item)}>
                <Text style={s.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            )} style={{ maxHeight: 400 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#0284c7", marginBottom: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "bold", color: "#334155", marginBottom: 5 },
  req: { color: "#ef4444" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  selectInput: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "#f8fafc" },
  radioRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  radio: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#f8fafc" },
  radioSelected: { borderColor: "#0284c7", backgroundColor: "#f0f9ff" },
  radioText: { fontSize: 13, color: "#475569", fontWeight: "bold" },
  rowFields: { flexDirection: "row", gap: 8 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  toggleLabel: { fontSize: 13, color: "#334155", fontWeight: "600" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { color: "#0284c7", fontSize: 12, fontWeight: "bold" },
  itemCard: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: "#f8fafc" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  itemLabel: { fontSize: 12, fontWeight: "bold", color: "#64748b" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  dropdownCard: { backgroundColor: "#fff", borderRadius: 16, width: "90%", padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 12, marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemText: { fontSize: 14, color: "#0f172a" },
});
