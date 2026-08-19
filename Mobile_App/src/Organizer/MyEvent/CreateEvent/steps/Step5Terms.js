import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";
import { Plus, Trash2, ChevronDown, X } from "lucide-react-native";
import { getPolicies } from "@Services/api";

const POLICY_GROUPS = ["General", "Cancellation", "Refund", "Privacy", "Terms of Use", "Code of Conduct", "Other"];
const POLICY_TYPES = ["Mandatory", "Optional"];

const EMPTY_TERM = { policyGroup: "", policyType: "", policyName: "", description: "", isDefault: false };

export default function Step5Terms({ formData, setFormData, organizerId, isView }) {
  const terms = formData.terms || [];
  const [policies, setPolicies] = useState([]);
  const [dropdownType, setDropdownType] = useState(null);
  const [dropdownList, setDropdownList] = useState([]);
  const [editIdx, setEditIdx] = useState(null);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const res = await getPolicies(organizerId);
        setPolicies(res && Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      }
    };
    if (organizerId) loadPolicies();
  }, [organizerId]);

  const updateTerms = (newTerms) => {
    setFormData((prev) => ({ ...prev, terms: newTerms }));
  };

  const addTerm = () => updateTerms([...terms, { ...EMPTY_TERM }]);
  const removeTerm = (idx) => updateTerms(terms.filter((_, i) => i !== idx));
  const updateTerm = (idx, key, val) => {
    const t = [...terms];
    t[idx] = { ...t[idx], [key]: val };
    updateTerms(t);
  };

  const openDropdown = (idx, type) => {
    setEditIdx(idx);
    setDropdownType(type);
    if (type === "policyGroup") setDropdownList(POLICY_GROUPS);
    else if (type === "policyType") setDropdownList(POLICY_TYPES);
    else if (type === "policyName") {
      setDropdownList(policies.map((p) => p.policy_name || p.name || "Unnamed"));
    }
  };

  const selectItem = (val) => {
    if (editIdx !== null && dropdownType) {
      updateTerm(editIdx, dropdownType, val);
      if (dropdownType === "policyName") {
        const matched = policies.find((p) => (p.policy_name || p.name) === val);
        if (matched) {
          updateTerm(editIdx, "description", matched.description || matched.policy_description || "");
          updateTerm(editIdx, "policyGroup", matched.policy_group || matched.group || "");
        }
      }
    }
    setDropdownType(null);
    setEditIdx(null);
  };

  return (
    <View>
      <View style={s.section}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>Terms & Conditions ({terms.length})</Text>
          {!isView && (
            <TouchableOpacity style={s.addBtn} onPress={addTerm}>
              <Plus size={14} color="#0284c7" /><Text style={s.addBtnText}>Add Term</Text>
            </TouchableOpacity>
          )}
        </View>

        {terms.length === 0 ? (
          <Text style={s.emptyText}>No terms added. Tap "Add Term" to get started.</Text>
        ) : (
          terms.map((term, idx) => (
            <View key={idx} style={s.termCard}>
              <View style={s.termHeader}>
                <Text style={s.termLabel}>Term #{idx + 1}</Text>
                {!isView && <TouchableOpacity onPress={() => removeTerm(idx)}><Trash2 size={16} color="#ef4444" /></TouchableOpacity>}
              </View>

              <Text style={s.label}>Policy Name</Text>
              <TouchableOpacity style={s.selectInput} onPress={() => !isView && openDropdown(idx, "policyName")} disabled={isView}>
                <Text style={{ color: term.policyName ? "#0f172a" : "#94a3b8", fontSize: 14, flex: 1 }}>{term.policyName || "Select Policy"}</Text>
                <ChevronDown size={14} color="#64748b" />
              </TouchableOpacity>

              <Text style={s.label}>Policy Group</Text>
              <TouchableOpacity style={s.selectInput} onPress={() => !isView && openDropdown(idx, "policyGroup")} disabled={isView}>
                <Text style={{ color: term.policyGroup ? "#0f172a" : "#94a3b8", fontSize: 14, flex: 1 }}>{term.policyGroup || "Select Group"}</Text>
                <ChevronDown size={14} color="#64748b" />
              </TouchableOpacity>

              <Text style={s.label}>Policy Type</Text>
              <View style={s.radioRow}>
                {POLICY_TYPES.map((pt) => (
                  <TouchableOpacity key={pt} style={[s.radio, term.policyType === pt && s.radioSelected]}
                    onPress={() => !isView && updateTerm(idx, "policyType", pt)} disabled={isView}>
                    <Text style={[s.radioText, term.policyType === pt && { color: "#0284c7" }]}>{pt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Description</Text>
              <TextInput
                style={[s.input, { height: 80, textAlignVertical: "top" }]}
                value={term.description}
                onChangeText={(v) => updateTerm(idx, "description", v)}
                placeholder="Policy description..."
                placeholderTextColor="#94a3b8"
                multiline
                editable={!isView}
              />
            </View>
          ))
        )}
      </View>

      {/* Dropdown Modal */}
      <Modal visible={!!dropdownType} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.dropdownCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select {dropdownType}</Text>
              <TouchableOpacity onPress={() => { setDropdownType(null); setEditIdx(null); }}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList data={dropdownList} keyExtractor={(item, i) => item + i} renderItem={({ item }) => (
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
  label: { fontSize: 12, fontWeight: "bold", color: "#334155", marginBottom: 5, marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  selectInput: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "#f8fafc" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { color: "#0284c7", fontSize: 12, fontWeight: "bold" },
  emptyText: { color: "#94a3b8", fontSize: 13, textAlign: "center", paddingVertical: 20 },
  termCard: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: "#f8fafc" },
  termHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  termLabel: { fontSize: 12, fontWeight: "bold", color: "#64748b" },
  radioRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  radio: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: "#fff" },
  radioSelected: { borderColor: "#0284c7", backgroundColor: "#f0f9ff" },
  radioText: { fontSize: 12, color: "#475569", fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  dropdownCard: { backgroundColor: "#fff", borderRadius: 16, width: "90%", padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 12, marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemText: { fontSize: 14, color: "#0f172a" },
});
