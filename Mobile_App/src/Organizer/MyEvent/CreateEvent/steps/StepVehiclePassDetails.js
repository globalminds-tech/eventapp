import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Modal, FlatList } from "react-native";
import { Plus, Trash2, X } from "lucide-react-native";

export default function StepVehiclePassDetails({ formData, setFormData, isView }) {
  const vehicleDetails = formData.vehicleProvision?.details || [];
  const addOnDetails = formData.vehicleProvision?.addons || [];

  // Add-On Entry States
  const [isParent, setIsParent] = useState(false);
  const [addOnName, setAddOnName] = useState("");
  const [addOnPrice, setAddOnPrice] = useState("");

  useEffect(() => {
    if (!formData.vehicleProvision?.details || formData.vehicleProvision.details.length === 0) {
      setFormData((prev) => ({
        ...prev,
        vehicleProvision: {
          ...(prev?.vehicleProvision || {}),
          details: [
            { vehicleType: "Two Wheeler", priceINR: "0", priceUSD: "0" },
            { vehicleType: "Four Wheeler", priceINR: "0", priceUSD: "0" },
            { vehicleType: "Heavy Vehicle", priceINR: "0", priceUSD: "0" },
          ],
        },
      }));
    }
  }, []);

  const updateDetails = (details) => {
    setFormData((prev) => ({
      ...prev,
      vehicleProvision: { ...prev.vehicleProvision, details },
    }));
  };

  const updateAddons = (addons) => {
    setFormData((prev) => ({
      ...prev,
      vehicleProvision: { ...prev.vehicleProvision, addons },
    }));
  };

  const addVehicleRow = () => {
    updateDetails([...vehicleDetails, { vehicleType: "", priceINR: "0", priceUSD: "0" }]);
  };

  const removeVehicleRow = (idx) => {
    updateDetails(vehicleDetails.filter((_, i) => i !== idx));
  };

  const updateVehicleRow = (idx, field, val) => {
    const updated = [...vehicleDetails];
    updated[idx] = { ...updated[idx], [field]: val };
    updateDetails(updated);
  };

  const handleAddAddon = () => {
    if (!addOnName.trim()) { alert("Add-On Name is required"); return; }
    if (!addOnPrice || addOnPrice === "0") { alert("Price is required"); return; }

    const newAddon = {
      isParent,
      addOnName: addOnName.trim(),
      price: addOnPrice.trim(),
    };

    updateAddons([...addOnDetails, newAddon]);
    setIsParent(false);
    setAddOnName("");
    setAddOnPrice("");
  };

  const handleRemoveAddon = (idx) => {
    updateAddons(addOnDetails.filter((_, i) => i !== idx));
  };

  return (
    <View>
      {/* Vehicle Details */}
      <View style={s.section}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>Vehicle Types</Text>
          {!isView && (
            <TouchableOpacity style={s.addBtn} onPress={addVehicleRow}>
              <Plus size={14} color="#0284c7" /><Text style={s.addBtnText}>Add Type</Text>
            </TouchableOpacity>
          )}
        </View>

        {vehicleDetails.map((item, idx) => (
          <View key={idx} style={s.itemCard}>
            <View style={s.itemHeader}>
              <Text style={s.itemLabel}>Vehicle #{idx + 1}</Text>
              {!isView && <TouchableOpacity onPress={() => removeVehicleRow(idx)}><Trash2 size={16} color="#ef4444" /></TouchableOpacity>}
            </View>
            <TextInput style={s.input} value={item.vehicleType} onChangeText={(v) => updateVehicleRow(idx, "vehicleType", v)} placeholder="e.g. Electric Vehicle" placeholderTextColor="#94a3b8" editable={!isView} />
            <View style={[s.rowFields, { marginTop: 8 }]}>
              <View style={[s.inputWithPrefix, { flex: 1 }]}>
                <Text style={s.prefix}>₹</Text>
                <TextInput style={s.inputInner} value={item.priceINR} onChangeText={(v) => updateVehicleRow(idx, "priceINR", v)} placeholder="Price INR" placeholderTextColor="#94a3b8" keyboardType="numeric" editable={!isView} />
              </View>
              <View style={[s.inputWithPrefix, { flex: 1 }]}>
                <Text style={s.prefix}>$</Text>
                <TextInput style={s.inputInner} value={item.priceUSD} onChangeText={(v) => updateVehicleRow(idx, "priceUSD", v)} placeholder="Price USD" placeholderTextColor="#94a3b8" keyboardType="numeric" editable={!isView} />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Add-on Details */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Vehicle Add-Ons</Text>

        {!isView && (
          <View style={s.addonForm}>
            <View style={s.toggleRow}>
              <Text style={s.toggleLabel}>Is Parent Add-On</Text>
              <Switch value={isParent} onValueChange={setIsParent} trackColor={{ false: "#e2e8f0", true: "#bae6fd" }} thumbColor={isParent ? "#0284c7" : "#94a3b8"} />
            </View>
            <TextInput style={s.input} value={addOnName} onChangeText={setAddOnName} placeholder="Add-On Name (e.g. VIP Parking Slot)" placeholderTextColor="#94a3b8" />
            <View style={[s.inputWithPrefix, { marginTop: 8 }]}>
              <Text style={s.prefix}>₹</Text>
              <TextInput style={s.inputInner} value={addOnPrice} onChangeText={setAddOnPrice} placeholder="Price" placeholderTextColor="#94a3b8" keyboardType="numeric" />
            </View>
            <TouchableOpacity style={s.addAddonBtn} onPress={handleAddAddon}>
              <Plus size={16} color="#0284c7" />
              <Text style={s.addAddonBtnText}>Confirm & Add Add-On</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add-on List */}
        {addOnDetails.length === 0 ? (
          <Text style={s.emptyText}>No Add-ons added yet.</Text>
        ) : (
          addOnDetails.map((item, idx) => (
            <View key={idx} style={s.addonCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.addonName}>{item.addOnName}</Text>
                <Text style={s.addonMeta}>Parent: {item.isParent ? "Yes" : "No"}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Text style={s.priceText}>₹{item.price}</Text>
                {!isView && (
                  <TouchableOpacity onPress={() => handleRemoveAddon(idx)}>
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#0284c7", marginBottom: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  rowFields: { flexDirection: "row", gap: 10 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { color: "#0284c7", fontSize: 12, fontWeight: "bold" },
  itemCard: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: "#f8fafc" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  itemLabel: { fontSize: 12, fontWeight: "bold", color: "#64748b" },
  inputWithPrefix: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "#f8fafc" },
  prefix: { fontSize: 14, fontWeight: "bold", color: "#64748b", marginRight: 6 },
  inputInner: { flex: 1, color: "#0f172a", fontSize: 14, height: "100%" },
  // Addon
  addonForm: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, padding: 12, marginBottom: 14 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, marginBottom: 8 },
  toggleLabel: { fontSize: 13, color: "#334155", fontWeight: "600" },
  addAddonBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 2, borderColor: "#bae6fd", borderStyle: "dashed", borderRadius: 10, padding: 12, marginTop: 12, backgroundColor: "#fff" },
  addAddonBtnText: { color: "#0284c7", fontWeight: "bold", fontSize: 14 },
  emptyText: { color: "#94a3b8", fontSize: 13, textAlign: "center", paddingVertical: 20 },
  addonCard: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: "#f8fafc" },
  addonName: { fontSize: 14, fontWeight: "bold", color: "#0f172a" },
  addonMeta: { fontSize: 11, color: "#64748b", marginTop: 2 },
  priceText: { fontSize: 14, fontWeight: "bold", color: "#0284c7" },
});
