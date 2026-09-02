import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  StyleSheet, ActivityIndicator, Modal, FlatList,
  KeyboardAvoidingView, Platform, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  Send, Upload, User, Mail, Phone, Building2, 
  MapPin, FileText, CheckCircle, AlertCircle, X, ChevronDown 
} from "lucide-react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { bookStall, getEventById, getCountries, getStates, getCities } from "@Services/api";
import { useSelector } from "react-redux";

const { height } = Dimensions.get('window');

const SearchableDropdown = ({ visible, onClose, data, search, setSearch, onSelect, placeholder }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.dropdownModal}>
        <View style={styles.dropdownHeader}>
          <Text style={styles.dropdownTitle}>Select {placeholder}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.dropdownSearch}
          placeholder={`Search ${placeholder}...`}
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
        <FlatList
          data={data.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.dropdownItem} 
              onPress={() => onSelect(item)}
            >
              <Text style={styles.dropdownItemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyDropdownText}>No results found</Text>}
        />
      </View>
    </View>
  </Modal>
);

const InputField = ({ label, name, placeholder, keyboardType = "default", maxLength, icon: IconComponent, value, onChangeText, error }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>
      {IconComponent && <IconComponent size={14} color="#4f46e5" style={{ marginRight: 4 }} />}
      {label} {error ? <Text style={styles.errorStar}>*</Text> : null}
    </Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      maxLength={maxLength}
      placeholderTextColor="#9ca3af"
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const StallBooking = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const user = useSelector((state) => state.user);
  
  // Accept both ways of passing params to be safe
  const eventId = route.params?.eventId || route.params?.id;
  const passedEvent = route.params?.event;

  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const initialFormData = {
    title: "Mr.",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    designation: "",
    companyName: "",
    country: "",
    state: "",
    city: "",
    address: "",
    message: "",
    pinCode: "",
    stallArea: "",
    products: "",
    visitingCard: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  useEffect(() => {
    if (passedEvent) {
      setEventName(passedEvent.title);
    } else if (eventId) {
      fetchEvent();
    }
    loadCountries();
  }, [eventId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToastMsg = (message, type = "success") => {
    setToast({ message, type });
  };

  const loadCountries = async () => {
    try {
      const data = await getCountries();
      setCountries(data.map(c => ({ id: c.id, name: c.country_name })));
    } catch (err) {
      console.error(err);
    }
  };

  const loadStates = async (countryCode) => {
    try {
      const data = await getStates(countryCode);
      setStates(data.map(s => ({ id: s.id, name: s.state_name })));
    } catch (err) {
      console.error(err);
    }
  };

  const loadCities = async (countryCode, stateCode) => {
    try {
      const data = await getCities(countryCode, stateCode);
      setCities(data.map(c => ({ id: c.id, name: c.city_name })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvent = async () => {
    try {
      const res = await getEventById(eventId);
      setEventName(res.event_name);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeText = (name, value) => {
    setErrors({ ...errors, [name]: "" });

    if (name === "email" || name === "mobile" || name === "pinCode") {
      value = value.replace(/\s/g, "");
    } else {
      value = value.trimStart();
    }

    if (name === "mobile" || name === "pinCode") {
      if (value !== "" && !/^\d*$/.test(value)) return;
      if (name === "mobile" && value.length > 10) return;
      if (name === "pinCode" && value.length > 6) return;
    }

    if (["firstName", "lastName", "city", "state", "country"].includes(name)) {
      if (value !== "" && !/^[a-zA-Z\s]*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleDocumentPick = async () => {
    // Basic fallback since expo-document-picker requires installation
    showToastMsg("Document picking requires expo-document-picker setup", "error");
  };

  const handleSubmit = async () => {
    setLoading(true);

    const newErrors = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'mobile', 'companyName', 'country', 'state', 'city', 'address', 'stallArea', 'products', 'pinCode'];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = "Required";
      }
    });

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "10 digits required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if(key !== 'visitingCard') {
        submitData.append(key, formData[key]);
      }
    });

    submitData.append("event_id", eventId);
    submitData.append("user_id", user.id);
    submitData.append("eventName", eventName);

    try {
      await bookStall(submitData);
      showToastMsg("✓ Stall Booked Successfully!", "success");
      setFormData(initialFormData);
      setTimeout(() => navigation.navigate("Exhibitor_Home"), 3000);
    } catch (err) {
      console.error(err);
      showToastMsg(err.response?.data?.message || "Failed to book stall.", "error");
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Building2 size={12} color="#2563eb" />
              <Text style={styles.badgeText}>Exhibition Booth</Text>
            </View>
            <Text style={styles.pageTitle}>{eventName || "Reserve Your Booth"}</Text>
            <Text style={styles.pageSubtitle}>Showcase your brand at the exhibition</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTopBar} />
            
            <View style={styles.cardBody}>
              {/* Personal Info */}
              <View style={styles.sectionHeader}>
                <User size={16} color="#2563eb" />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputWrapper, { flex: 0.4 }]}>
                  <Text style={styles.label}>Title</Text>
                  <TouchableOpacity style={styles.input} onPress={() => {/* Handle Title dropdown if needed, hardcode for simplicity */}}>
                    <Text style={{color: '#111827'}}>{formData.title}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <InputField 
                    label="First Name" 
                    name="firstName" 
                    placeholder="John" 
                    value={formData.firstName}
                    onChangeText={(val) => handleChangeText("firstName", val)}
                    error={errors.firstName}
                  />
                </View>
              </View>
              <InputField 
                label="Last Name" 
                name="lastName" 
                placeholder="Doe" 
                value={formData.lastName}
                onChangeText={(val) => handleChangeText("lastName", val)}
                error={errors.lastName}
              />
              
              <InputField 
                label="Email" 
                name="email" 
                placeholder="john@company.com" 
                keyboardType="email-address" 
                icon={Mail} 
                value={formData.email}
                onChangeText={(val) => handleChangeText("email", val)}
                error={errors.email}
              />
              <InputField 
                label="Mobile" 
                name="mobile" 
                placeholder="10 Digits" 
                keyboardType="numeric" 
                maxLength={10} 
                icon={Phone} 
                value={formData.mobile}
                onChangeText={(val) => handleChangeText("mobile", val)}
                error={errors.mobile}
              />
              <InputField 
                label="Designation" 
                name="designation" 
                placeholder="Sales Manager" 
                value={formData.designation}
                onChangeText={(val) => handleChangeText("designation", val)}
                error={errors.designation}
              />

              <InputField 
                label="Company" 
                name="companyName" 
                placeholder="Your Company" 
                value={formData.companyName}
                onChangeText={(val) => handleChangeText("companyName", val)}
                error={errors.companyName}
              />
              <InputField 
                label="Stall Area" 
                name="stallArea" 
                placeholder="e.g. 3x3 meters" 
                value={formData.stallArea}
                onChangeText={(val) => handleChangeText("stallArea", val)}
                error={errors.stallArea}
              />
              <InputField 
                label="Products" 
                name="products" 
                placeholder="e.g. Software, Electronics" 
                value={formData.products}
                onChangeText={(val) => handleChangeText("products", val)}
                error={errors.products}
              />

              {/* Location Info */}
              <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <MapPin size={16} color="#2563eb" />
                <Text style={styles.sectionTitle}>Location</Text>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Country</Text>
                <TouchableOpacity 
                  style={[styles.input, styles.dropdownSelect, errors.country && styles.inputError]} 
                  onPress={() => setShowCountryModal(true)}
                >
                  <Text style={formData.country ? styles.inputText : styles.placeholderText}>
                    {formData.country || "Select Country"}
                  </Text>
                  <ChevronDown size={16} color="#6b7280" />
                </TouchableOpacity>
                {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>State</Text>
                <TouchableOpacity 
                  style={[styles.input, styles.dropdownSelect, errors.state && styles.inputError]} 
                  onPress={() => setShowStateModal(true)}
                >
                  <Text style={formData.state ? styles.inputText : styles.placeholderText}>
                    {formData.state || "Select State"}
                  </Text>
                  <ChevronDown size={16} color="#6b7280" />
                </TouchableOpacity>
                {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>City</Text>
                <TouchableOpacity 
                  style={[styles.input, styles.dropdownSelect, errors.city && styles.inputError]} 
                  onPress={() => setShowCityModal(true)}
                >
                  <Text style={formData.city ? styles.inputText : styles.placeholderText}>
                    {formData.city || "Select City"}
                  </Text>
                  <ChevronDown size={16} color="#6b7280" />
                </TouchableOpacity>
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </View>

              <InputField 
                label="Pin Code" 
                name="pinCode" 
                placeholder="Postal Code" 
                keyboardType="numeric" 
                maxLength={6} 
                value={formData.pinCode}
                onChangeText={(val) => handleChangeText("pinCode", val)}
                error={errors.pinCode}
              />
              
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.address && styles.inputError]}
                  placeholder="Street Address"
                  value={formData.address}
                  onChangeText={(val) => handleChangeText("address", val)}
                  multiline
                  numberOfLines={3}
                  maxLength={100}
                />
                <Text style={styles.charCount}>{formData.address.length}/100</Text>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}><Upload size={14} color="#4f46e5" /> Visiting Card</Text>
                <TouchableOpacity style={styles.fileUploadBtn} onPress={handleDocumentPick}>
                  <Text style={styles.fileUploadText}>Select File</Text>
                </TouchableOpacity>
              </View>

              {/* Message */}
              <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <FileText size={16} color="#2563eb" />
                <Text style={styles.sectionTitle}>Additional Details</Text>
              </View>
              
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any additional details..."
                  value={formData.message}
                  onChangeText={(val) => handleChangeText("message", val)}
                  multiline
                  numberOfLines={3}
                  maxLength={100}
                />
                <Text style={styles.charCount}>{formData.message.length}/100</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>Reserve Stall</Text>
                      <Send size={16} color="#fff" style={{marginLeft: 8}} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.disclaimer}>By submitting, you agree to our terms</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast Notification */}
      {toast && (
        <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
          {toast.type === "success" ? <CheckCircle size={20} color="#059669" /> : <AlertCircle size={20} color="#e11d48" />}
          <View style={styles.toastContent}>
            <Text style={styles.toastTitle}>{toast.type === "success" ? "Success" : "Error"}</Text>
            <Text style={styles.toastMessage}>{toast.message}</Text>
          </View>
          <TouchableOpacity onPress={() => setToast(null)}>
            <X size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      )}

      {/* Dropdown Modals */}
      <SearchableDropdown 
        visible={showCountryModal} 
        onClose={() => setShowCountryModal(false)}
        data={countries}
        search={countrySearch}
        setSearch={setCountrySearch}
        placeholder="Country"
        onSelect={(item) => {
          setFormData({...formData, country: item.name, state: "", city: ""});
          setCountrySearch(""); setShowCountryModal(false);
          loadStates(item.id);
        }}
      />
      
      <SearchableDropdown 
        visible={showStateModal} 
        onClose={() => setShowStateModal(false)}
        data={states}
        search={stateSearch}
        setSearch={setStateSearch}
        placeholder="State"
        onSelect={(item) => {
          setFormData({...formData, state: item.name, city: ""});
          setStateSearch(""); setShowStateModal(false);
          const country = countries.find(c => c.name === formData.country);
          if (country) loadCities(country.id, item.id);
        }}
      />

      <SearchableDropdown 
        visible={showCityModal} 
        onClose={() => setShowCityModal(false)}
        data={cities}
        search={citySearch}
        setSearch={setCitySearch}
        placeholder="City"
        onSelect={(item) => {
          setFormData({...formData, city: item.name});
          setCitySearch(""); setShowCityModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  header: { alignItems: 'center', marginBottom: 24, marginTop: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 24, marginBottom: 8 },
  badgeText: { color: '#1d4ed8', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: '#4b5563', textAlign: 'center' },

  card: { backgroundColor: '#fff', borderRadius: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, overflow: 'hidden' },
  cardTopBar: { height: 4, backgroundColor: '#3b82f6' }, // Simplified gradient
  cardBody: { padding: 20 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  
  row: { flexDirection: 'row', alignItems: 'center' },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginBottom: 6, flexDirection: 'row', alignItems: 'center' },
  errorStar: { color: '#ef4444' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827' },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  textArea: { height: 80, textAlignVertical: 'top' },
  charCount: { fontSize: 10, color: '#9ca3af', textAlign: 'right', marginTop: 4 },
  
  dropdownSelect: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputText: { color: '#111827', fontSize: 14 },
  placeholderText: { color: '#9ca3af', fontSize: 14 },

  fileUploadBtn: { backgroundColor: '#e0e7ff', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#c7d2fe', borderStyle: 'dashed' },
  fileUploadText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 12 },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#f3f4f6', borderRadius: 8 },
  cancelBtnText: { color: '#374151', fontWeight: 'bold', fontSize: 14 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#2563eb', borderRadius: 8 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  disclaimer: { textAlign: 'center', fontSize: 10, color: '#6b7280', marginTop: 16 },

  toast: { position: 'absolute', top: 40, right: 16, left: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 32, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, borderLeftWidth: 4, zIndex: 9999 },
  toastSuccess: { borderLeftColor: '#10b981' },
  toastError: { borderLeftColor: '#f43f5e' },
  toastContent: { flex: 1, marginLeft: 12 },
  toastTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  toastMessage: { fontSize: 12, color: '#64748b' },

  // Dropdown Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  dropdownModal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: height * 0.6, padding: 20 },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dropdownTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  closeBtn: { padding: 4 },
  dropdownSearch: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 12 },
  dropdownItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemText: { fontSize: 16, color: '#334155' },
  emptyDropdownText: { textAlign: 'center', color: '#94a3b8', padding: 20 },
});

export default StallBooking;
