import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Modal, FlatList } from "react-native";
import { Plus, Trash2, Edit, X, ChevronDown } from "lucide-react-native";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks", "High Tea", "All Day"];
const FOOD_TYPES = ["Veg", "Non-Veg", "Both"];

export default function StepFoodDetails({ formData, setFormData, isView }) {
  const foodItems = formData.foodProvision?.items || [];
  const [catererName, setCatererName] = useState("");
  const [mealType, setMealType] = useState("Breakfast");
  const [foodType, setFoodType] = useState("Veg");
  const [priceINR, setPriceINR] = useState("");
  const [priceUSD, setPriceUSD] = useState("");
  const [menuDetails, setMenuDetails] = useState("");

  const [dropdownType, setDropdownType] = useState(null); // "mealType" | "foodType"
  const [dropdownList, setDropdownList] = useState([]);
  
  // For Edit modal
  const [editIndex, setEditIndex] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const updateFoodItems = (items) => {
    setFormData((prev) => ({
      ...prev,
      foodProvision: { ...prev.foodProvision, items },
    }));
  };

  const handleAdd = () => {
    if (!catererName.trim()) { alert("Caterer/Stall Name is required"); return; }
    if (!priceINR.trim() || priceINR === "0") { alert("Price in INR is required"); return; }

    const newItem = {
      catererName: catererName.trim(),
      mealType,
      foodType,
      priceINR: priceINR.trim(),
      priceUSD: priceUSD.trim() || "0",
      menuDetails: menuDetails.trim(),
    };

    updateFoodItems([...foodItems, newItem]);
    setCatererName("");
    setPriceINR("");
    setPriceUSD("");
    setMenuDetails("");
  };

  const handleUpdate = () => {
    if (!editItem.catererName.trim()) { alert("Caterer Name is required"); return; }
    if (!editItem.priceINR.trim() || editItem.priceINR === "0") { alert("Price in INR is required"); return; }

    const updated = [...foodItems];
    updated[editIndex] = editItem;
    updateFoodItems(updated);
    setEditIndex(null);
    setEditItem(null);
  };

  const handleRemove = (index) => {
    updateFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const openDropdown = (type) => {
    setDropdownType(type);
    if (type === "mealType") setDropdownList(MEAL_TYPES);
    else if (type === "foodType") setDropdownList(FOOD_TYPES);
  };

  const selectDropdownItem = (val) => {
    if (editIndex !== null && editItem) {
      setEditItem((prev) => ({ ...prev, [dropdownType]: val }));
    } else {
      if (dropdownType === "mealType") setMealType(val);
      else if (dropdownType === "foodType") setFoodType(val);
    }
    setDropdownType(null);
  };

  return (
    <View>
      {/* Food Provision Form */}
      {!isView && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Food Provision Details</Text>
          <Text style={s.label}>Caterer / Stall Name <Text style={s.req}>*</Text></Text>
          <TextInput style={s.input} value={catererName} onChangeText={setCatererName} placeholder="e.g. Royal Caterers" placeholderTextColor="#94a3b8" />

          <View style={s.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Meal Type <Text style={s.req}>*</Text></Text>
              <TouchableOpacity style={s.selectInput} onPress={() => openDropdown("mealType")}>
                <Text style={{ fontSize: 13, color: "#0f172a" }}>{mealType}</Text>
                <ChevronDown size={14} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Food Type <Text style={s.req}>*</Text></Text>
              <TouchableOpacity style={s.selectInput} onPress={() => openDropdown("foodType")}>
                <Text style={{ fontSize: 13, color: "#0f172a" }}>{foodType}</Text>
                <ChevronDown size={14} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Price In INR <Text style={s.req}>*</Text></Text>
              <TextInput style={s.input} value={priceINR} onChangeText={setPriceINR} placeholder="? 0.00" placeholderTextColor="#94a3b8" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Price In USD</Text>
              <TextInput style={s.input} value={priceUSD} onChangeText={setPriceUSD} placeholder="$ 0.00" placeholderTextColor="#94a3b8" keyboardType="numeric" />
            </View>
          </View>

          <Text style={s.label}>Menu Details / Included Items</Text>
          <TextInput style={[s.input, { height: 70, textAlignVertical: "top" }]} value={menuDetails} onChangeText={setMenuDetails} placeholder="e.g. Rice, Dal, Roti, paneer..." placeholderTextColor="#94a3b8" multiline />

          <TouchableOpacity style={s.addItemBtn} onPress={handleAdd}>
            <Plus size={16} color="#0284c7" />
            <Text style={s.addItemBtnText}>Add Food Provision</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Food Provision Summary */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Food Provision Summary ({foodItems.length})</Text>
        {foodItems.length === 0 ? (
          <Text style={s.emptyText}>No food provisions added yet.</Text>
        ) : (
          foodItems.map((item, idx) => (
            <View key={idx} style={s.itemCard}>
              <View style={s.itemHeader}>
                <Text style={s.catererName}>{item.catererName}</Text>
                {!isView && (
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity onPress={() => { setEditIndex(idx); setEditItem({ ...item }); }}>
                      <Edit size={16} color="#0284c7" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemove(idx)}>
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaText}>{item.mealType} ({item.foodType})</Text>
                <Text style={s.priceText}>?{item.priceINR} / ${item.priceUSD || "0"}</Text>
              </View>
              {item.menuDetails ? (
                <Text style={s.menuText} numberOfLines={1}>{item.menuDetails}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      {/* Edit Modal */}
      <Modal visible={editIndex !== null} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Edit Food Provision</Text>
              <TouchableOpacity onPress={() => { setEditIndex(null); setEditItem(null); }}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            {editItem && (
              <View style={{ gap: 10 }}>
                <Text style={s.label}>Caterer / Stall Name</Text>
                <TextInput style={s.input} value={editItem.catererName} onChangeText={(v) => setEditItem((p) => ({ ...p, catererName: v }))} />

                <View style={s.rowFields}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.label}>Meal Type</Text>
                    <TouchableOpacity style={s.selectInput} onPress={() => openDropdown("mealType")}>
                      <Text style={{ fontSize: 13, color: "#0f172a" }}>{editItem.mealType}</Text>
                      <ChevronDown size={14} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.label}>Food Type</Text>
                    <TouchableOpacity style={s.selectInput} onPress={() => openDropdown("foodType")}>
                      <Text style={{ fontSize: 13, color: "#0f172a" }}>{editItem.foodType}</Text>
                      <ChevronDown size={14} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={s.rowFields}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.label}>Price In INR</Text>
                    <TextInput style={s.input} value={editItem.priceINR} onChangeText={(v) => setEditItem((p) => ({ ...p, priceINR: v }))} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.label}>Price In USD</Text>
                    <TextInput style={s.input} value={editItem.priceUSD} onChangeText={(v) => setEditItem((p) => ({ ...p, priceUSD: v }))} keyboardType="numeric" />
                  </View>
                </View>

                <Text style={s.label}>Menu Details</Text>
                <TextInput style={[s.input, { height: 60, textAlignVertical: "top" }]} value={editItem.menuDetails} onChangeText={(v) => setEditItem((p) => ({ ...p, menuDetails: v }))} multiline />

                <TouchableOpacity style={s.saveBtn} onPress={handleUpdate}>
                  <Text style={s.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Selection Dropdown Modal */}
      <Modal visible={!!dropdownType} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.dropdownCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select {dropdownType === "mealType" ? "Meal Type" : "Food Type"}</Text>
              <TouchableOpacity onPress={() => setDropdownType(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList data={dropdownList} keyExtractor={(item) => item} renderItem={({ item }) => (
              <TouchableOpacity style={s.dropdownItem} onPress={() => selectDropdownItem(item)}>
                <Text style={s.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            )} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#0284c7", marginBottom: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  label: { fontSize: 12, fontWeight: "bold", color: "#334155", marginBottom: 5, marginTop: 8 },
  req: { color: "#ef4444" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  selectInput: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "#f8fafc" },
  rowFields: { flexDirection: "row", gap: 10, marginTop: 4 },
  addItemBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 2, borderColor: "#bae6fd", borderStyle: "dashed", borderRadius: 10, padding: 12, marginTop: 14, backgroundColor: "#f0f9ff" },
  addItemBtnText: { color: "#0284c7", fontWeight: "bold", fontSize: 14 },
  emptyText: { color: "#94a3b8", fontSize: 13, textAlign: "center", paddingVertical: 20 },
  itemCard: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: "#f8fafc" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  catererName: { fontSize: 14, fontWeight: "bold", color: "#0f172a" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  metaText: { fontSize: 12, color: "#64748b", fontWeight: "500" },
  priceText: { fontSize: 12, color: "#0284c7", fontWeight: "bold" },
  menuText: { fontSize: 11, color: "#94a3b8", fontStyle: "italic" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, width: "100%", padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 12, marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  dropdownCard: { backgroundColor: "#fff", borderRadius: 16, width: "90%", padding: 20 },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemText: { fontSize: 14, color: "#0f172a" },
  saveBtn: { backgroundColor: "#0284c7", borderRadius: 8, padding: 12, alignItems: "center", marginTop: 14 },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
