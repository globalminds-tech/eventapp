import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, Image, Switch, ScrollView
} from "react-native";
import { Plus, Trash2, Edit, X, ChevronDown, Users, Award, UserPlus, UploadCloud, Search } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import {
  getVendorTypes,
  getVendorNames,
  getSponsorNames,
  createVendor,
  createSponsor,
  getVendors,
  getSponsors
} from "@Services/api";

const SPONSORSHIP_TIERS = ["Title Sponsor", "Event Sponsor", "Gift Sponsor"];

export default function Step6VendorSponsor({ formData, setFormData, organizerId, isView }) {
  // Lists
  const [vendorList, setVendorList] = useState([]);
  const [sponsorList, setSponsorList] = useState([]);
  const [guestList, setGuestList] = useState([]);

  // Selected details
  const [vendorType, setVendorType] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorship, setSponsorship] = useState("");

  // API Lists
  const [vendorTypes, setVendorTypes] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  const [sponsorNames, setSponsorNames] = useState([]);
  const [organizerVendors, setOrganizerVendors] = useState([]);
  const [organizerSponsors, setOrganizerSponsors] = useState([]);

  // Guest Fields
  const [guestName, setGuestName] = useState("");
  const [designation, setDesignation] = useState("");
  const [contact, setContact] = useState("");
  const [guestImage, setGuestImage] = useState(null);

  // Modals / Dropdowns
  const [dropdownType, setDropdownType] = useState(null); // "vendorType" | "vendorName" | "sponsorName" | "sponsorship"
  const [dropdownList, setDropdownList] = useState([]);
  
  const [showQuickVendor, setShowQuickVendor] = useState(false);
  const [showQuickSponsor, setShowQuickSponsor] = useState(false);

  // Quick Add forms
  const [newVendor, setNewVendor] = useState({ vendor_type: "Suppliers", vendor_name: "", company_name: "", primary_contact: "", mail_id: "", address: "" });
  const [newSponsor, setNewSponsor] = useState({ sponsor_name: "", primary_contact: "", mail_id: "", address: "" });

  useEffect(() => {
    if (formData?.vendors) {
      setVendorList(formData.vendors.vendors || []);
      setSponsorList(formData.vendors.sponsors || []);
      setGuestList(formData.vendors.guests || []);
    }
  }, []);

  const sync = (vendors, sponsors, guests) => {
    setFormData((prev) => ({
      ...prev,
      vendors: { vendors, sponsors, guests },
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const types = await getVendorTypes();
        setVendorTypes(types || []);
        const sps = await getSponsorNames();
        setSponsorNames(sps || []);

        if (organizerId) {
          const vendorsRes = await getVendors(organizerId);
          setOrganizerVendors(vendorsRes.data || []);
          const sponsorsList = await getSponsors(organizerId);
          setOrganizerSponsors(sponsorsList || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [organizerId]);

  useEffect(() => {
    const loadNames = async () => {
      if (!vendorType) return;
      try {
        const names = await getVendorNames(vendorType);
        setVendorNames(names || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadNames();
  }, [vendorType]);

  // Actions
  const handleAddVendor = () => {
    if (!vendorType || !vendorName) return;
    const updated = [...vendorList, { vendorType, vendorName, passCount: 1 }];
    setVendorList(updated);
    sync(updated, sponsorList, guestList);
    setVendorType("");
    setVendorName("");
  };

  const handleRemoveVendor = (idx) => {
    const updated = vendorList.filter((_, i) => i !== idx);
    setVendorList(updated);
    sync(updated, sponsorList, guestList);
  };

  const handleAddSponsor = () => {
    if (!sponsorName || !sponsorship) return;
    const updated = [...sponsorList, { sponsorName, sponsorship }];
    setSponsorList(updated);
    sync(vendorList, updated, guestList);
    setSponsorName("");
    setSponsorship("");
  };

  const handleRemoveSponsor = (idx) => {
    const updated = sponsorList.filter((_, i) => i !== idx);
    setSponsorList(updated);
    sync(vendorList, updated, guestList);
  };

  const pickGuestPhoto = async () => {
    if (isView) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
      if (!result.canceled && result.assets?.length > 0) {
        setGuestImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGuest = () => {
    if (!guestName.trim() || !contact.trim()) {
      alert("Guest Name and Contact are required");
      return;
    }
    const newGuest = {
      name: guestName.trim(),
      designation: designation.trim(),
      contact: contact.trim(),
      image: guestImage || "",
    };
    const updated = [...guestList, newGuest];
    setGuestList(updated);
    sync(vendorList, sponsorList, updated);
    setGuestName("");
    setDesignation("");
    setContact("");
    setGuestImage(null);
  };

  const handleRemoveGuest = (idx) => {
    const updated = guestList.filter((_, i) => i !== idx);
    setGuestList(updated);
    sync(vendorList, sponsorList, updated);
  };

  const openDropdown = (type) => {
    setDropdownType(type);
    if (type === "vendorType") {
      const globalTypes = vendorTypes.map((v) => v.vendor_type);
      const orgTypes = organizerVendors.map((v) => v.vendor_type);
      setDropdownList(Array.from(new Set([...orgTypes, ...globalTypes].filter(Boolean))));
    }
    else if (type === "vendorName") {
      const globalNames = vendorNames.map((v) => v.vendor_name);
      const orgNames = organizerVendors.filter((v) => v.vendor_type === vendorType).map((v) => v.vendor_name);
      setDropdownList(Array.from(new Set([...orgNames, ...globalNames].filter(Boolean))));
    }
    else if (type === "sponsorName") {
      const globalSponsors = sponsorNames.map((s) => s.sponsor_name);
      const orgSponsors = organizerSponsors.map((s) => s.sponsor_name);
      setDropdownList(Array.from(new Set([...orgSponsors, ...globalSponsors].filter(Boolean))));
    }
    else if (type === "sponsorship") setDropdownList(SPONSORSHIP_TIERS);
  };

  const selectDropdownItem = (val) => {
    if (dropdownType === "vendorType") { setVendorType(val); setVendorName(""); }
    else if (dropdownType === "vendorName") setVendorName(val);
    else if (dropdownType === "sponsorName") setSponsorName(val);
    else if (dropdownType === "sponsorship") setSponsorship(val);
    setDropdownType(null);
  };

  const submitQuickVendor = async () => {
    if (!newVendor.vendor_name || !newVendor.company_name || !newVendor.primary_contact || !newVendor.mail_id) {
      alert("Please fill all required fields");
      return;
    }
    try {
      await createVendor({ ...newVendor, organizer_id: organizerId });
      const types = await getVendorTypes();
      setVendorTypes(types || []);
      if (organizerId) {
        const vendorsRes = await getVendors(organizerId);
        setOrganizerVendors(vendorsRes.data || []);
      }
      alert("Vendor created successfully!");
      setShowQuickVendor(false);
      setNewVendor({ vendor_type: "Suppliers", vendor_name: "", company_name: "", primary_contact: "", mail_id: "", address: "" });
    } catch (err) {
      alert("Error creating vendor");
    }
  };

  const submitQuickSponsor = async () => {
    if (!newSponsor.sponsor_name || !newSponsor.primary_contact || !newSponsor.mail_id) {
      alert("Please fill all required fields");
      return;
    }
    try {
      await createSponsor({ ...newSponsor, organizer_id: organizerId });
      const sps = await getSponsorNames();
      setSponsorNames(sps || []);
      if (organizerId) {
        const sponsorsList = await getSponsors(organizerId);
        setOrganizerSponsors(sponsorsList || []);
      }
      alert("Sponsor created successfully!");
      setShowQuickSponsor(false);
      setNewSponsor({ sponsor_name: "", primary_contact: "", mail_id: "", address: "" });
    } catch (err) {
      alert("Error creating sponsor");
    }
  };

  return (
    <View>
      {/* Vendor Section */}
      <View style={s.section}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>Vendor Details</Text>
          {!isView && (
            <TouchableOpacity onPress={() => setShowQuickVendor(true)}>
              <Text style={s.quickAddBtn}>+ Quick Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isView && (
          <View style={{ gap: 10 }}>
            <TouchableOpacity style={s.selectInput} onPress={() => openDropdown("vendorType")}>
              <Text style={{ fontSize: 13, color: vendorType ? "#0f172a" : "#94a3b8" }}>{vendorType || "Select Vendor Type"}</Text>
              <ChevronDown size={14} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity style={[s.selectInput, !vendorType && { opacity: 0.5 }]} onPress={() => vendorType && openDropdown("vendorName")} disabled={!vendorType}>
              <Text style={{ fontSize: 13, color: vendorName ? "#0f172a" : "#94a3b8" }}>{vendorName || "Select Vendor"}</Text>
              <ChevronDown size={14} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity style={s.addButton} onPress={handleAddVendor}>
              <Plus size={16} color="#fff" />
              <Text style={s.addButtonText}>Add Vendor</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Vendor List */}
        {vendorList.length > 0 && (
          <View style={{ marginTop: 14 }}>
            {vendorList.map((v, idx) => (
              <View key={idx} style={s.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemMainText}>{v.vendorName}</Text>
                  <Text style={s.itemSubText}>{v.vendorType}</Text>
                </View>
                {!isView && (
                  <TouchableOpacity onPress={() => handleRemoveVendor(idx)}>
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Sponsor Section */}
      <View style={s.section}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>Sponsorships</Text>
          {!isView && (
            <TouchableOpacity onPress={() => setShowQuickSponsor(true)}>
              <Text style={s.quickAddBtn}>+ Quick Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isView && (
          <View style={{ gap: 10 }}>
            <TouchableOpacity style={s.selectInput} onPress={() => openDropdown("sponsorName")}>
              <Text style={{ fontSize: 13, color: sponsorName ? "#0f172a" : "#94a3b8" }}>{sponsorName || "Select Sponsor"}</Text>
              <ChevronDown size={14} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity style={s.selectInput} onPress={() => openDropdown("sponsorship")}>
              <Text style={{ fontSize: 13, color: sponsorship ? "#0f172a" : "#94a3b8" }}>{sponsorship || "Select Sponsorship Tier"}</Text>
              <ChevronDown size={14} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity style={s.addButton} onPress={handleAddSponsor}>
              <Plus size={16} color="#fff" />
              <Text style={s.addButtonText}>Add Sponsor</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sponsor List */}
        {sponsorList.length > 0 && (
          <View style={{ marginTop: 14 }}>
            {sponsorList.map((sp, idx) => (
              <View key={idx} style={s.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemMainText}>{sp.sponsorName}</Text>
                  <Text style={s.itemSubText}>{sp.sponsorship}</Text>
                </View>
                {!isView && (
                  <TouchableOpacity onPress={() => handleRemoveSponsor(idx)}>
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Special Guest Section */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Special Guests</Text>

        {!isView && (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <TouchableOpacity style={s.guestPhotoPicker} onPress={pickGuestPhoto}>
                {guestImage ? (
                  <Image source={{ uri: guestImage }} style={s.guestPhoto} />
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <UploadCloud size={20} color="#94a3b8" />
                    <Text style={{ fontSize: 8, color: "#94a3b8", fontWeight: "bold" }}>PHOTO</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={{ flex: 1, gap: 8 }}>
                <TextInput style={s.input} value={guestName} onChangeText={setGuestName} placeholder="Guest Name *" placeholderTextColor="#94a3b8" />
                <TextInput style={s.input} value={designation} onChangeText={setDesignation} placeholder="Designation" placeholderTextColor="#94a3b8" />
              </View>
            </View>

            <TextInput style={s.input} value={contact} onChangeText={setContact} placeholder="Contact Number *" placeholderTextColor="#94a3b8" keyboardType="phone-pad" />

            <TouchableOpacity style={s.addButton} onPress={handleAddGuest}>
              <Plus size={16} color="#fff" />
              <Text style={s.addButtonText}>Invite Guest</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Guest List */}
        {guestList.length > 0 && (
          <View style={{ marginTop: 14 }}>
            {guestList.map((g, idx) => (
              <View key={idx} style={s.itemCard}>
                {g.image ? (
                  <Image source={{ uri: g.image }} style={s.guestThumb} />
                ) : (
                  <View style={s.guestThumbPlaceholder}>
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 10 }}>{g.name?.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.itemMainText}>{g.name}</Text>
                  <Text style={s.itemSubText}>{g.designation || "Guest"} � {g.contact}</Text>
                </View>
                {!isView && (
                  <TouchableOpacity onPress={() => handleRemoveGuest(idx)}>
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Dropdown Modal */}
      <Modal visible={!!dropdownType} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.dropdownCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Item</Text>
              <TouchableOpacity onPress={() => setDropdownType(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList data={dropdownList} keyExtractor={(item, i) => item + i} renderItem={({ item }) => (
              <TouchableOpacity style={s.dropdownItem} onPress={() => selectDropdownItem(item)}>
                <Text style={s.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            )} />
          </View>
        </View>
      </Modal>

      {/* Quick Add Vendor Modal */}
      <Modal visible={showQuickVendor} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={s.quickModalCard} keyboardShouldPersistTaps="handled">
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Quick Add Vendor</Text>
              <TouchableOpacity onPress={() => setShowQuickVendor(false)}><X size={20} color="#64748b" /></TouchableOpacity>
            </View>
            <View style={{ gap: 10 }}>
              <Text style={s.label}>Type *</Text>
              <TouchableOpacity style={s.selectInput} onPress={() => { setDropdownList(["Suppliers", "Contractors", "Distributors"]); setDropdownType("vendor_type_selection"); }}>
                <Text>{newVendor.vendor_type}</Text>
              </TouchableOpacity>
              <Text style={s.label}>Vendor Name *</Text>
              <TextInput style={s.input} value={newVendor.vendor_name} onChangeText={(v) => setNewVendor((p) => ({ ...p, vendor_name: v }))} placeholder="Vendor Name" />
              <Text style={s.label}>Company Name *</Text>
              <TextInput style={s.input} value={newVendor.company_name} onChangeText={(v) => setNewVendor((p) => ({ ...p, company_name: v }))} placeholder="Company Name" />
              <Text style={s.label}>Contact *</Text>
              <TextInput style={s.input} value={newVendor.primary_contact} onChangeText={(v) => setNewVendor((p) => ({ ...p, primary_contact: v }))} placeholder="Contact No" keyboardType="phone-pad" />
              <Text style={s.label}>Email *</Text>
              <TextInput style={s.input} value={newVendor.mail_id} onChangeText={(v) => setNewVendor((p) => ({ ...p, mail_id: v }))} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" />
              <Text style={s.label}>Address</Text>
              <TextInput style={[s.input, { height: 60 }]} value={newVendor.address} onChangeText={(v) => setNewVendor((p) => ({ ...p, address: v }))} placeholder="Address" multiline />
              <TouchableOpacity style={s.saveBtn} onPress={submitQuickVendor}>
                <Text style={s.saveBtnText}>Save Vendor</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Quick Add Sponsor Modal */}
      <Modal visible={showQuickSponsor} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={s.quickModalCard} keyboardShouldPersistTaps="handled">
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Quick Add Sponsor</Text>
              <TouchableOpacity onPress={() => setShowQuickSponsor(false)}><X size={20} color="#64748b" /></TouchableOpacity>
            </View>
            <View style={{ gap: 10 }}>
              <Text style={s.label}>Sponsor Name *</Text>
              <TextInput style={s.input} value={newSponsor.sponsor_name} onChangeText={(v) => setNewSponsor((p) => ({ ...p, sponsor_name: v }))} placeholder="Sponsor Name" />
              <Text style={s.label}>Contact *</Text>
              <TextInput style={s.input} value={newSponsor.primary_contact} onChangeText={(v) => setNewSponsor((p) => ({ ...p, primary_contact: v }))} placeholder="Contact No" keyboardType="phone-pad" />
              <Text style={s.label}>Email *</Text>
              <TextInput style={s.input} value={newSponsor.mail_id} onChangeText={(v) => setNewSponsor((p) => ({ ...p, mail_id: v }))} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" />
              <Text style={s.label}>Address</Text>
              <TextInput style={[s.input, { height: 60 }]} value={newSponsor.address} onChangeText={(v) => setNewSponsor((p) => ({ ...p, address: v }))} placeholder="Address" multiline />
              <TouchableOpacity style={s.saveBtn} onPress={submitQuickSponsor}>
                <Text style={s.saveBtnText}>Save Sponsor</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Internal Dropdown for Quick Vendor Type */}
      <Modal visible={dropdownType === "vendor_type_selection"} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.dropdownCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Type</Text>
              <TouchableOpacity onPress={() => setDropdownType(null)}><X size={20} color="#64748b" /></TouchableOpacity>
            </View>
            <FlatList data={["Suppliers", "Contractors", "Distributors"]} keyExtractor={(item) => item} renderItem={({ item }) => (
              <TouchableOpacity style={s.dropdownItem} onPress={() => { setNewVendor((p) => ({ ...p, vendor_type: item })); setDropdownType(null); }}>
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
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#0284c7", flex: 1 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  quickAddBtn: { fontSize: 12, color: "#0284c7", fontWeight: "bold" },
  label: { fontSize: 11, fontWeight: "bold", color: "#64748b" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  selectInput: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "#f8fafc" },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#0284c7", borderRadius: 8, padding: 12, marginTop: 4 },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  itemCard: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, marginBottom: 8, backgroundColor: "#f8fafc" },
  itemMainText: { fontSize: 14, fontWeight: "bold", color: "#0f172a" },
  itemSubText: { fontSize: 11, color: "#64748b", marginTop: 2 },
  guestPhotoPicker: { width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: "#cbd5e1", borderStyle: "dashed", backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  guestPhoto: { width: "100%", height: "100%" },
  guestThumb: { width: 40, height: 40, borderRadius: 20 },
  guestThumbPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#0284c7", justifyContent: "center", alignItems: "center" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  dropdownCard: { backgroundColor: "#fff", borderRadius: 16, width: "90%", padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 12, marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemText: { fontSize: 14, color: "#0f172a" },
  quickModalCard: { backgroundColor: "#fff", borderRadius: 16, width: "100%", padding: 20, gap: 10 },
  saveBtn: { backgroundColor: "#16a34a", borderRadius: 8, padding: 12, alignItems: "center", marginTop: 14 },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
