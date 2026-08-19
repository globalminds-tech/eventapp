import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Plus, Trash2, Image } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

const DOC_TYPES = ["Aadhar", "PAN", "GST", "License", "Other"];

export default function Step4Documents({ formData, setFormData, isView }) {
  const docs = formData.documents || { banner: null, bannerPreview: null, docs: [] };

  const updateDocs = (key, value) => {
    setFormData((prev) => ({ ...prev, documents: { ...prev.documents, [key]: value } }));
  };

  const pickBanner = async () => {
    if (isView) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        updateDocs("banner", { uri: asset.uri, type: asset.type === "video" ? "video/mp4" : "image/jpeg", name: asset.fileName || "banner.jpg" });
        updateDocs("bannerPreview", asset.uri);
      }
    } catch (err) {
      console.error("Image picker error", err);
    }
  };

  const addDoc = () => {
    const d = [...(docs.docs || [])];
    d.push({ id: null, type: "", number: "", file: null, preview: null, name: "", isExisting: false });
    updateDocs("docs", d);
  };

  const removeDoc = (idx) => {
    updateDocs("docs", docs.docs.filter((_, i) => i !== idx));
  };

  const updateDoc = (idx, key, val) => {
    const d = [...(docs.docs || [])];
    d[idx] = { ...d[idx], [key]: val };
    updateDocs("docs", d);
  };

  const pickDocFile = async (idx) => {
    if (isView) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        updateDoc(idx, "file", { uri: asset.uri, type: "image/jpeg", name: asset.fileName || `doc_${idx}.jpg` });
        updateDoc(idx, "preview", asset.uri);
        updateDoc(idx, "name", asset.fileName || `doc_${idx}.jpg`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View>
      {/* Banner */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Event Banner <Text style={s.req}>*</Text></Text>
        <TouchableOpacity style={s.bannerPicker} onPress={pickBanner} disabled={isView}>
          {docs.bannerPreview ? (
            <View style={s.bannerPreviewWrap}>
              <Image size={24} color="#16a34a" />
              <Text style={s.bannerPreviewText} numberOfLines={1}>Banner selected ✓</Text>
            </View>
          ) : (
            <View style={s.bannerPlaceholder}>
              <Image size={32} color="#94a3b8" />
              <Text style={s.bannerPlaceholderText}>Tap to select banner image/video</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Documents */}
      <View style={s.section}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>Documents ({(docs.docs || []).length})</Text>
          {!isView && (
            <TouchableOpacity style={s.addBtn} onPress={addDoc}>
              <Plus size={14} color="#0284c7" /><Text style={s.addBtnText}>Add Document</Text>
            </TouchableOpacity>
          )}
        </View>

        {(docs.docs || []).length === 0 ? (
          <Text style={s.emptyText}>No documents added yet.</Text>
        ) : (
          docs.docs.map((doc, idx) => (
            <View key={idx} style={s.docCard}>
              <View style={s.docHeader}>
                <Text style={s.docLabel}>Document #{idx + 1}{doc.isExisting && " (Existing)"}</Text>
                {!isView && <TouchableOpacity onPress={() => removeDoc(idx)}><Trash2 size={16} color="#ef4444" /></TouchableOpacity>}
              </View>

              <Text style={s.label}>Document Type</Text>
              <View style={s.radioRow}>
                {DOC_TYPES.map((dt) => (
                  <TouchableOpacity key={dt} style={[s.radio, doc.type === dt && s.radioSelected]}
                    onPress={() => !isView && updateDoc(idx, "type", dt)} disabled={isView}>
                    <Text style={[s.radioText, doc.type === dt && { color: "#0284c7" }]}>{dt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.label}>Document Number</Text>
              <TextInput style={s.input} value={doc.number} onChangeText={(v) => updateDoc(idx, "number", v)} placeholder="Enter document number" placeholderTextColor="#94a3b8" editable={!isView} />

              {!doc.isExisting && (
                <TouchableOpacity style={s.filePicker} onPress={() => pickDocFile(idx)} disabled={isView}>
                  <Text style={s.filePickerText}>{doc.name || "Tap to select file"}</Text>
                </TouchableOpacity>
              )}
              {doc.isExisting && doc.name && (
                <Text style={s.existingFile}>📄 {doc.name}</Text>
              )}
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
  req: { color: "#ef4444" },
  label: { fontSize: 12, fontWeight: "bold", color: "#334155", marginBottom: 5, marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  bannerPicker: { borderWidth: 2, borderColor: "#bae6fd", borderStyle: "dashed", borderRadius: 12, padding: 20, alignItems: "center" },
  bannerPlaceholder: { alignItems: "center", gap: 8 },
  bannerPlaceholderText: { color: "#94a3b8", fontSize: 13 },
  bannerPreviewWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  bannerPreviewText: { color: "#16a34a", fontWeight: "bold", fontSize: 14 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { color: "#0284c7", fontSize: 12, fontWeight: "bold" },
  emptyText: { color: "#94a3b8", fontSize: 13, textAlign: "center", paddingVertical: 20 },
  docCard: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: "#f8fafc" },
  docHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  docLabel: { fontSize: 12, fontWeight: "bold", color: "#64748b" },
  radioRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  radio: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#fff" },
  radioSelected: { borderColor: "#0284c7", backgroundColor: "#f0f9ff" },
  radioText: { fontSize: 11, color: "#475569", fontWeight: "bold" },
  filePicker: { borderWidth: 1, borderColor: "#bae6fd", borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: "#f0f9ff", alignItems: "center" },
  filePickerText: { color: "#0284c7", fontSize: 13, fontWeight: "600" },
  existingFile: { marginTop: 8, fontSize: 12, color: "#64748b" },
});
