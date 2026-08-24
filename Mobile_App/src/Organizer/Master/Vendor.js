import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet, ActivityIndicator, Modal, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import {
  Eye, Plus, X, Trash2, Search, ChevronLeft, ChevronRight, Info, Edit, Mail, Phone, MapPin, Briefcase
} from "lucide-react-native";
import {
  getVendors, createVendor, getVendorById, deleteVendor, updateVendor, getCountries, getStates, getCities
} from "@Services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function VendorPage({ navigation }) {
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [fieldErrors, setFieldErrors] = useState({});

  const Redexorganizer = useSelector((state) => state.user);
  const [organizerId, setOrganizerId] = useState("");

  const [form, setForm] = useState({
    vendor_type: "",
    vendor_name: "",
    company_name: "",
    primary_contact: "",
    secondary_contact: "",
    mail_id: "",
    country: "",
    state: "",
    city: "",
    address: "",
    bank_name: "",
    account_holder: "",
    ifsc_code: "",
    account_number: "",
    status: "Active"
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [showDropdownType, setShowDropdownType] = useState(null); // 'country', 'state', 'city'
  const [dropdownList, setDropdownList] = useState([]);

  const [documents, setDocuments] = useState([
    { document_type: "", document_number: "", document_file: "DummyDataURL", preview: "" }
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      const uId = Redexorganizer?.id || (await AsyncStorage.getItem("userId"));
      setOrganizerId(uId);
    };
    fetchUser();
  }, [Redexorganizer]);

  useEffect(() => {
    if (organizerId) {
      loadVendors();
    }
    loadCountries();
  }, [organizerId]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await getVendors(organizerId);
      setVendors(res.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load vendors", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const res = await getCountries();
      setCountries(res || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadStates = async (countryName) => {
    const selectedCountry = countries.find(c => c.country_name === countryName);
    if (!selectedCountry) return;
    try {
      const res = await getStates(selectedCountry.id);
      setStates(res || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadCities = async (stateName) => {
    const selectedCountry = countries.find(c => c.country_name === form.country);
    const selectedState = states.find(s => s.state_name === stateName);
    if (!selectedCountry || !selectedState) return;
    try {
      const res = await getCities(selectedCountry.id, selectedState.id);
      setCities(res || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReset = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      vendor_type: "",
      vendor_name: "",
      company_name: "",
      primary_contact: "",
      secondary_contact: "",
      mail_id: "",
      country: "",
      state: "",
      city: "",
      address: "",
      bank_name: "",
      account_holder: "",
      ifsc_code: "",
      account_number: "",
      status: "Active"
    });
    setDocuments([{ document_type: "", document_number: "", document_file: "DummyDataURL", preview: "" }]);
    setFieldErrors({});
  };

  const handleChange = (name, value) => {
    let val = value;
    if (["primary_contact", "secondary_contact", "account_number"].includes(name)) {
      val = val.replace(/\D/g, "");
    }
    setForm({ ...form, [name]: val });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDocChange = (index, name, value) => {
    const temp = [...documents];
    let val = value;
    if (name === "document_number") {
      const type = temp[index].document_type;
      if (type === "Aadhar") {
        val = value.replace(/\D/g, "").slice(0, 12);
      } else if (type === "PAN") {
        val = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
      }
    }
    temp[index][name] = val;
    setDocuments(temp);
  };

  const addDocument = () => {
    if (documents.length >= 3) {
      showToast("Maximum 3 documents allowed", "error");
      return;
    }
    setDocuments([...documents, { document_type: "", document_number: "", document_file: "DummyDataURL", preview: "" }]);
  };

  const removeDocument = (index) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((_, i) => i !== index));
    } else {
      setDocuments([{ document_type: "", document_number: "", document_file: "DummyDataURL", preview: "" }]);
    }
  };

  const handleSubmit = async () => {
    const errors = {};
    if (!form.vendor_type) errors.vendor_type = "Vendor type is required";
    if (!form.vendor_name) errors.vendor_name = "Vendor name is required";
    if (!form.company_name) errors.company_name = "Company name is required";
    if (!form.primary_contact) errors.primary_contact = "Primary contact is required";
    if (!form.mail_id) {
      errors.mail_id = "Mail ID is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail_id)) {
      errors.mail_id = "Invalid email format";
    }
    if (!form.country) errors.country = "Country is required";
    if (!form.state) errors.state = "State is required";
    if (!form.city) errors.city = "City is required";
    if (!form.address) errors.address = "Address is required";
    if (!form.account_holder) errors.account_holder = "Account holder is required";
    if (!form.bank_name) errors.bank_name = "Bank name is required";
    if (!form.account_number) errors.account_number = "Account number is required";
    if (!form.ifsc_code) errors.ifsc_code = "IFSC code is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast("Please fill all mandatory fields", "error");
      return;
    }

    // Document validation
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      if (!doc.document_type && !doc.document_number) continue;
      if (!doc.document_type || !doc.document_number) {
        showToast(`Document ${i + 1}: Complete all fields`, "error");
        return;
      }
      if (doc.document_type === "Aadhar" && doc.document_number.length !== 12) {
        showToast(`Document ${i + 1}: Aadhar must be 12 digits`, "error");
        return;
      }
      if (doc.document_type === "PAN" && doc.document_number.length !== 10) {
        showToast(`Document ${i + 1}: PAN must be 10 characters`, "error");
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        organizer_id: organizerId,
        documents: documents.filter(d => d.document_type && d.document_number),
      };

      if (isEditing) {
        await updateVendor(editId, payload);
        showToast("Vendor Updated Successfully!");
      } else {
        await createVendor(payload);
        showToast("Vendor Created Successfully!");
      }

      setShowForm(false);
      handleReset(); // ✅ fixed: was incorrectly calling resetForm() which doesn't exist
      loadVendors();
    } catch (error) {
      console.error("Save vendor error:", error?.response?.data || error?.message || error);
      showToast(error?.response?.data?.message || error?.response?.data?.error || "Failed to save vendor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const res = await getVendorById(id);
      const data = res.data;
      setForm({
        vendor_type: data.vendor_type || "",
        vendor_name: data.vendor_name || "",
        company_name: data.company_name || "",
        primary_contact: data.primary_contact || "",
        secondary_contact: data.secondary_contact || "",
        mail_id: data.mail_id || "",
        country: data.country || "",
        state: data.state || "",
        city: data.city || "",
        address: data.address || "",
        bank_name: data.bank_name || "",
        account_holder: data.account_holder || "",
        ifsc_code: data.ifsc_code || "",
        account_number: data.account_number || "",
        status: data.status || "Active"
      });

      if (data.country) {
        loadStates(data.country);
      }

      if (data.documents && data.documents.length > 0) {
        setDocuments(data.documents.map(d => ({
          document_type: d.document_type,
          document_number: d.document_number,
          document_file: d.document_file || "DummyDataURL",
          preview: ""
        })));
      } else {
        setDocuments([{ document_type: "", document_number: "", document_file: "DummyDataURL", preview: "" }]);
      }

      setEditId(id);
      setIsEditing(true);
      setShowForm(true);
    } catch (error) {
      showToast("Failed to load details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Vendor",
      "Are you sure you want to delete this vendor?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteVendor(id);
              showToast("Vendor Deleted Successfully!");
              loadVendors();
            } catch {
              showToast("Failed to delete vendor", "error");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const openSelectModal = (type) => {
    setShowDropdownType(type);
    if (type === "country") {
      setDropdownList(countries.map(c => c.country_name));
    } else if (type === "state") {
      setDropdownList(states.map(s => s.state_name));
    } else if (type === "city") {
      setDropdownList(cities.map(c => c.city_name));
    }
  };

  const selectDropdownItem = (val) => {
    const type = showDropdownType;
    setShowDropdownType(null);
    handleChange(type, val);
    if (type === "country") {
      setForm(prev => ({ ...prev, state: "", city: "" }));
      loadStates(val);
    } else if (type === "state") {
      setForm(prev => ({ ...prev, city: "" }));
      loadCities(val);
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      (v.vendor_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.company_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  const renderVendorCard = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Briefcase size={18} color="#0284c7" />
          <Text style={s.cardTitle}>{item.vendor_name}</Text>
        </View>
        <View style={[s.statusBadge, item.status === "Active" ? s.bgGreen : s.bgRed]}>
          <Text style={[s.statusText, item.status === "Active" ? s.textGreen : s.textRed]}>{item.status}</Text>
        </View>
      </View>
      <View style={s.cardBody}>
        <Text style={s.companyText}>{item.company_name} ({item.vendor_type})</Text>
        <View style={s.infoRow}><Mail size={14} color="#64748b" /><Text style={s.infoValue}>{item.mail_id}</Text></View>
        <View style={s.infoRow}><Phone size={14} color="#64748b" /><Text style={s.infoValue}>{item.primary_contact}</Text></View>
        <View style={s.infoRow}><MapPin size={14} color="#64748b" /><Text style={s.infoValue} numberOfLines={1}>{item.city}, {item.state}, {item.country}</Text></View>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.actionBtnView} onPress={async () => {
          const detail = await getVendorById(item.id);
          setViewData(detail.data);
        }}>
          <Eye size={16} color="#0284c7" />
          <Text style={s.actionTextBlue}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtnEdit} onPress={() => handleEdit(item.id)}>
          <Edit size={16} color="#d97706" />
          <Text style={s.actionTextAmber}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtnDelete} onPress={() => handleDelete(item.id)}>
          <Trash2 size={16} color="#ef4444" />
          <Text style={s.actionTextRed}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Vendor Management</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => { handleReset(); setShowForm(true); }}>
          <Plus size={18} color="#fff" />
          <Text style={s.addBtnText}>Add Vendor</Text>
        </TouchableOpacity>
      </View>

      {toast.show && (
        <View style={[s.toast, toast.type === "success" ? s.toastSuccess : s.toastError]}>
          <Text style={s.toastText}>{toast.message}</Text>
        </View>
      )}

      <View style={s.searchContainer}>
        <Search size={18} color="#94a3b8" style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Search vendors..."
          placeholderTextColor="#94a3b8"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : (
        <FlatList
          data={currentVendors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderVendorCard}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.empty}>
              <Info size={36} color="#cbd5e1" />
              <Text style={s.emptyText}>No vendors found</Text>
            </View>
          }
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={s.pagination}>
          <TouchableOpacity disabled={currentPage === 1} onPress={() => setCurrentPage(p => Math.max(1, p - 1))} style={s.pageBtn}>
            <ChevronLeft size={20} color={currentPage === 1 ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
          <Text style={s.pageText}>{currentPage} / {totalPages}</Text>
          <TouchableOpacity disabled={currentPage === totalPages} onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={s.pageBtn}>
            <ChevronRight size={20} color={currentPage === totalPages ? "#cbd5e1" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      )}

      {/* VIEW DETAILS MODAL */}
      <Modal visible={!!viewData} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Vendor Details</Text>
              <TouchableOpacity onPress={() => setViewData(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            {viewData && (
              <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
                <View style={s.detailRow}><Text style={s.detailLabel}>Type:</Text><Text style={s.detailVal}>{viewData.vendor_type}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Name:</Text><Text style={s.detailVal}>{viewData.vendor_name}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Company:</Text><Text style={s.detailVal}>{viewData.company_name}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Mail ID:</Text><Text style={s.detailVal}>{viewData.mail_id}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Primary Contact:</Text><Text style={s.detailVal}>{viewData.primary_contact}</Text></View>
                {viewData.secondary_contact && <View style={s.detailRow}><Text style={s.detailLabel}>Secondary Contact:</Text><Text style={s.detailVal}>{viewData.secondary_contact}</Text></View>}
                <View style={s.detailRow}><Text style={s.detailLabel}>Location:</Text><Text style={s.detailVal}>{viewData.address}, {viewData.city}, {viewData.state}, {viewData.country}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Bank Name:</Text><Text style={s.detailVal}>{viewData.bank_name}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Account Holder:</Text><Text style={s.detailVal}>{viewData.account_holder}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Account No:</Text><Text style={s.detailVal}>{viewData.account_number}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>IFSC Code:</Text><Text style={s.detailVal}>{viewData.ifsc_code}</Text></View>
                <View style={s.detailRow}><Text style={s.detailLabel}>Status:</Text><Text style={s.detailVal}>{viewData.status}</Text></View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* CREATE/EDIT FORM MODAL */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { maxHeight: "90%" }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{isEditing ? "Edit Vendor" : "Add Vendor"}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
              <Text style={s.inputLabel}>Vendor Type *</Text>
              <View style={{ flexDirection: "row", gap: 10, marginVertical: 8 }}>
                {["Event Management", "Catering", "Production", "Logistics", "Security", "Other"].map((vt) => (
                  <TouchableOpacity key={vt} style={[s.radio, form.vendor_type === vt && s.radioSelected]} onPress={() => handleChange("vendor_type", vt)}>
                    <Text style={[s.radioText, form.vendor_type === vt && { color: "#0284c7" }]}>{vt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {fieldErrors.vendor_type && <Text style={s.errText}>{fieldErrors.vendor_type}</Text>}

              <Text style={s.inputLabel}>Vendor Name *</Text>
              <TextInput style={s.input} value={form.vendor_name} onChangeText={(v) => handleChange("vendor_name", v)} placeholder="Enter Name" />
              {fieldErrors.vendor_name && <Text style={s.errText}>{fieldErrors.vendor_name}</Text>}

              <Text style={s.inputLabel}>Company Name *</Text>
              <TextInput style={s.input} value={form.company_name} onChangeText={(v) => handleChange("company_name", v)} placeholder="Enter Company Name" />
              {fieldErrors.company_name && <Text style={s.errText}>{fieldErrors.company_name}</Text>}

              <Text style={s.inputLabel}>Mail ID *</Text>
              <TextInput style={s.input} keyboardType="email-address" autoCapitalize="none" value={form.mail_id} onChangeText={(v) => handleChange("mail_id", v)} placeholder="email@domain.com" />
              {fieldErrors.mail_id && <Text style={s.errText}>{fieldErrors.mail_id}</Text>}

              <Text style={s.inputLabel}>Primary Contact *</Text>
              <TextInput style={s.input} keyboardType="number-pad" value={form.primary_contact} onChangeText={(v) => handleChange("primary_contact", v)} placeholder="10-digit number" />
              {fieldErrors.primary_contact && <Text style={s.errText}>{fieldErrors.primary_contact}</Text>}

              <Text style={s.inputLabel}>Secondary Contact</Text>
              <TextInput style={s.input} keyboardType="number-pad" value={form.secondary_contact} onChangeText={(v) => handleChange("secondary_contact", v)} placeholder="Secondary contact (optional)" />

              {/* Country State City */}
              <Text style={s.inputLabel}>Country *</Text>
              <TouchableOpacity style={s.selectInput} onPress={() => openSelectModal("country")}>
                <Text style={{ color: form.country ? "#0f172a" : "#94a3b8" }}>{form.country || "Select Country"}</Text>
              </TouchableOpacity>
              {fieldErrors.country && <Text style={s.errText}>{fieldErrors.country}</Text>}

              <Text style={s.inputLabel}>State *</Text>
              <TouchableOpacity style={s.selectInput} onPress={() => openSelectModal("state")}>
                <Text style={{ color: form.state ? "#0f172a" : "#94a3b8" }}>{form.state || "Select State"}</Text>
              </TouchableOpacity>
              {fieldErrors.state && <Text style={s.errText}>{fieldErrors.state}</Text>}

              <Text style={s.inputLabel}>City *</Text>
              <TouchableOpacity style={s.selectInput} onPress={() => openSelectModal("city")}>
                <Text style={{ color: form.city ? "#0f172a" : "#94a3b8" }}>{form.city || "Select City"}</Text>
              </TouchableOpacity>
              {fieldErrors.city && <Text style={s.errText}>{fieldErrors.city}</Text>}

              <Text style={s.inputLabel}>Address *</Text>
              <TextInput style={[s.input, { height: 60 }]} multiline numberOfLines={2} value={form.address} onChangeText={(v) => handleChange("address", v)} placeholder="Address" />
              {fieldErrors.address && <Text style={s.errText}>{fieldErrors.address}</Text>}

              {/* Bank Details */}
              <Text style={s.sectionHeader}>Bank Details</Text>
              
              <Text style={s.inputLabel}>Bank Name *</Text>
              <TextInput style={s.input} value={form.bank_name} onChangeText={(v) => handleChange("bank_name", v)} placeholder="e.g. State Bank of India" />
              {fieldErrors.bank_name && <Text style={s.errText}>{fieldErrors.bank_name}</Text>}

              <Text style={s.inputLabel}>Account Holder Name *</Text>
              <TextInput style={s.input} value={form.account_holder} onChangeText={(v) => handleChange("account_holder", v)} placeholder="e.g. John Doe" />
              {fieldErrors.account_holder && <Text style={s.errText}>{fieldErrors.account_holder}</Text>}

              <Text style={s.inputLabel}>Account Number *</Text>
              <TextInput style={s.input} keyboardType="number-pad" value={form.account_number} onChangeText={(v) => handleChange("account_number", v)} placeholder="Account number" />
              {fieldErrors.account_number && <Text style={s.errText}>{fieldErrors.account_number}</Text>}

              <Text style={s.inputLabel}>IFSC Code *</Text>
              <TextInput style={s.input} autoCapitalize="characters" value={form.ifsc_code} onChangeText={(v) => handleChange("ifsc_code", v)} placeholder="IFSC Code" />
              {fieldErrors.ifsc_code && <Text style={s.errText}>{fieldErrors.ifsc_code}</Text>}

              {isEditing && (
                <>
                  <Text style={s.inputLabel}>Status</Text>
                  <View style={{ flexDirection: "row", gap: 10, marginVertical: 8 }}>
                    {["Active", "Inactive"].map((st) => (
                      <TouchableOpacity key={st} style={[s.radio, form.status === st && s.radioSelected]} onPress={() => setForm({ ...form, status: st })}>
                        <Text style={[s.radioText, form.status === st && { color: "#0284c7" }]}>{st}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Documents */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Verification Documents</Text>
                <TouchableOpacity style={s.addDocBtn} onPress={addDocument}>
                  <Plus size={14} color="#0284c7" />
                  <Text style={s.addDocText}>Add Document</Text>
                </TouchableOpacity>
              </View>

              {documents.map((doc, idx) => (
                <View key={idx} style={s.docCard}>
                  <View style={s.docHeader}>
                    <Text style={s.docNumberLabel}>Document #{idx + 1}</Text>
                    <TouchableOpacity onPress={() => removeDocument(idx)}>
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  <Text style={s.inputLabel}>Document Type</Text>
                  <View style={{ flexDirection: "row", gap: 10, marginVertical: 8 }}>
                    {["Aadhar", "PAN"].map((dt) => (
                      <TouchableOpacity key={dt} style={[s.radio, doc.document_type === dt && s.radioSelected]} onPress={() => handleDocChange(idx, "document_type", dt)}>
                        <Text style={[s.radioText, doc.document_type === dt && { color: "#0284c7" }]}>{dt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={s.inputLabel}>Document Number</Text>
                  <TextInput style={s.input} placeholder="Enter number" value={doc.document_number} onChangeText={(v) => handleDocChange(idx, "document_number", v)} />
                </View>
              ))}

              <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
                <Text style={s.submitBtnText}>Submit Details</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DROPDOWN SELECT MODAL */}
      <Modal visible={!!showDropdownType} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.dropdownModalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select {showDropdownType}</Text>
              <TouchableOpacity onPress={() => setShowDropdownType(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={dropdownList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.dropdownItem} onPress={() => selectDropdownItem(item)}>
                  <Text style={s.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 400 }}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#0c4a6e" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0284c7", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  
  toast: { position: "absolute", top: 80, left: 16, right: 16, padding: 12, borderRadius: 8, zIndex: 100, alignItems: "center" },
  toastSuccess: { backgroundColor: "#d1fae5" },
  toastError: { backgroundColor: "#ffe4e6" },
  toastText: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", margin: 16, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: "#0f172a", fontSize: 14 },

  list: { paddingHorizontal: 16, paddingBottom: 80 },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 10, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: "bold", color: "#0f172a", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  bgGreen: { backgroundColor: "#dcfce7" },
  bgRed: { backgroundColor: "#fee2e2" },
  textGreen: { color: "#15803d", fontSize: 10, fontWeight: "bold" },
  textRed: { color: "#b91c1c", fontSize: 10, fontWeight: "bold" },

  cardBody: { gap: 6 },
  companyText: { fontSize: 12, fontWeight: "bold", color: "#0284c7" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoValue: { fontSize: 13, color: "#334155", flex: 1 },

  cardActions: { flexDirection: "row", justifyContent: "space-around", marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  actionBtnView: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  actionBtnEdit: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  actionBtnDelete: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  actionTextBlue: { fontSize: 13, fontWeight: "bold", color: "#0284c7" },
  actionTextAmber: { fontSize: 13, fontWeight: "bold", color: "#d97706" },
  actionTextRed: { fontSize: 13, fontWeight: "bold", color: "#ef4444" },

  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  pageBtn: { padding: 8 },
  pageText: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginHorizontal: 16 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, width: "100%", padding: 20 },
  dropdownModalCard: { backgroundColor: "#fff", borderRadius: 16, width: "90%", padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 12, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  modalBody: { gap: 12 },

  detailRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 8 },
  detailLabel: { width: 120, fontSize: 13, color: "#64748b", fontWeight: "bold" },
  detailVal: { flex: 1, fontSize: 13, color: "#0f172a" },

  inputLabel: { fontSize: 12, fontWeight: "bold", color: "#334155", marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, color: "#0f172a", fontSize: 14, backgroundColor: "#f8fafc" },
  selectInput: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 12, height: 44, justifyContent: "center", backgroundColor: "#f8fafc" },
  errText: { color: "#ef4444", fontSize: 11, fontWeight: "bold", marginTop: 2 },

  radio: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#f8fafc", marginBottom: 6 },
  radioSelected: { borderColor: "#0284c7", backgroundColor: "#f0f9ff" },
  radioText: { fontSize: 13, color: "#475569", fontWeight: "bold" },

  sectionHeader: { fontSize: 15, fontWeight: "bold", color: "#0f172a", borderTopWidth: 1, borderTopColor: "#e2e8f0", marginTop: 20, paddingTop: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#0f172a" },
  addDocBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addDocText: { color: "#0284c7", fontSize: 12, fontWeight: "bold" },

  docCard: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: "#f8fafc" },
  docHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 6, marginBottom: 8 },
  docNumberLabel: { fontSize: 12, fontWeight: "bold", color: "#64748b" },

  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemText: { fontSize: 14, color: "#0f172a" },

  submitBtn: { backgroundColor: "#0284c7", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 24, marginBottom: 40 },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold" }
});
