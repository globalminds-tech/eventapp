import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Modal, TextInput, ActivityIndicator, Image, KeyboardAvoidingView, Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { getMyBookings, getBookingById, updateBooking, getCountries, getStates, getCities } from "@Services/api";
import { X, ChevronDown, CheckCircle, AlertCircle, Phone, User as UserIcon, Building2 } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Reusable Searchable Dropdown ---
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
        <ScrollView style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
          {data
            .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
            .map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.dropdownItem} 
                onPress={() => onSelect(item)}
              >
                <Text style={styles.dropdownItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// --- Reusable Text Input Component (Module-level to prevent keyboard focus loss) ---
const BookingInputField = ({ label, value, onChangeText, error, keyboardType, maxLength, multiline }) => (
  <View style={{ flex: 1 }}>
    {label && <Text style={styles.formLabel}>{label}</Text>}
    <TextInput 
      style={[styles.input, multiline && styles.textArea, error && styles.inputError]} 
      value={value} 
      onChangeText={onChangeText}
      keyboardType={keyboardType || "default"}
      maxLength={maxLength}
      multiline={multiline}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// --- Reusable Booking Details Modal (Module-level) ---
const ViewBookingModal = ({ visible, selectedData, closeModal }) => {
  if (!visible || !selectedData) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <View style={{ gap: 24 }}>
              <View>
                <Text style={styles.detailLabel}>EVENT</Text>
                <Text style={styles.detailValueLarge}>{selectedData.event_name}</Text>
              </View>

              <View style={styles.twoColGrid}>
                <View style={{ gap: 16 }}>
                  <View>
                    <Text style={styles.detailLabel}>FULL NAME</Text>
                    <Text style={styles.detailValue}>{selectedData.first_name} {selectedData.last_name}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>EMAIL</Text>
                    <Text style={styles.detailValue}>{selectedData.email}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>MOBILE</Text>
                    <Text style={styles.detailValue}>{selectedData.mobile}</Text>
                  </View>
                </View>

                <View style={{ gap: 16 }}>
                  <View>
                    <Text style={styles.detailLabel}>COMPANY</Text>
                    <Text style={styles.detailValue}>{selectedData.company_name}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>DESIGNATION</Text>
                    <Text style={styles.detailValue}>{selectedData.designation}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>STATUS</Text>
                    <Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>{selectedData.status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.addressBox}>
                <Text style={styles.detailLabel}>ADDRESS</Text>
                <Text style={styles.detailValue}>{selectedData.address}</Text>
                <View style={styles.addressGrid}>
                  <View style={{flex: 1}}>
                    <Text style={styles.detailLabelSmall}>City</Text>
                    <Text style={styles.detailValueSmall}>{selectedData.city}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.detailLabelSmall}>State</Text>
                    <Text style={styles.detailValueSmall}>{selectedData.state}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.detailLabelSmall}>Pincode</Text>
                    <Text style={styles.detailValueSmall}>{selectedData.pin_code}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.twoColGrid}>
                <View>
                  <Text style={styles.detailLabel}>STALL AREA</Text>
                  <Text style={styles.detailValue}>{selectedData.stall_area}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>PRODUCTS</Text>
                  <Text style={styles.detailValue}>{selectedData.products}</Text>
                </View>
              </View>

              {selectedData.messages && (
                <View style={styles.messageBox}>
                  <Text style={styles.messageLabel}>ADDITIONAL MESSAGES</Text>
                  <Text style={styles.messageValue}>{selectedData.messages}</Text>
                </View>
              )}

              {selectedData.visiting_card_url && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.detailLabel}>VISITING CARD</Text>
                  <Image 
                    source={{ uri: selectedData.visiting_card_url }} 
                    style={styles.visitingCardImage} 
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// --- Reusable Booking Edit Modal (Module-level to prevent keyboard focus loss) ---
const EditBookingModal = ({
  visible,
  form,
  fieldErrors,
  handleChangeText,
  closeModal,
  handleUpdate,
  setShowCountryModal,
  setShowStateModal,
  setShowCityModal
}) => {
  if (!visible || !form) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.detailModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Booking</Text>
            <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <View style={{ gap: 16 }}>
              <View style={styles.formRow}>
                <BookingInputField
                  label="First Name"
                  value={form.first_name}
                  onChangeText={(v) => handleChangeText("first_name", v)}
                  error={fieldErrors.first_name}
                />
                <View style={{ width: 8 }} />
                <BookingInputField
                  label="Last Name"
                  value={form.last_name}
                  onChangeText={(v) => handleChangeText("last_name", v)}
                  error={fieldErrors.last_name}
                />
              </View>

              <View style={styles.formRow}>
                <BookingInputField
                  label="Email"
                  value={form.email}
                  onChangeText={(v) => handleChangeText("email", v)}
                  error={fieldErrors.email}
                  keyboardType="email-address"
                />
                <View style={{ width: 8 }} />
                <BookingInputField
                  label="Mobile"
                  value={form.mobile}
                  onChangeText={(v) => handleChangeText("mobile", v)}
                  error={fieldErrors.mobile}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <View style={styles.formRow}>
                <BookingInputField
                  label="Company"
                  value={form.company_name}
                  onChangeText={(v) => handleChangeText("company_name", v)}
                  error={fieldErrors.company_name}
                />
                <View style={{ width: 8 }} />
                <BookingInputField
                  label="Designation"
                  value={form.designation}
                  onChangeText={(v) => handleChangeText("designation", v)}
                />
              </View>

              {/* Location Editing */}
              <View style={styles.formRow}>
                <View style={{flex: 1, marginRight: 8}}>
                  <Text style={styles.formLabel}>Country</Text>
                  <TouchableOpacity 
                    style={[styles.input, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, fieldErrors.country && styles.inputError]} 
                    onPress={() => setShowCountryModal(true)}
                  >
                    <Text style={{color: form.country ? '#0f172a' : '#94a3b8'}}>{form.country || "Select"}</Text>
                    <ChevronDown size={16} color="#64748b" />
                  </TouchableOpacity>
                  {fieldErrors.country && <Text style={styles.errorText}>{fieldErrors.country}</Text>}
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.formLabel}>State</Text>
                  <TouchableOpacity 
                    style={[styles.input, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, fieldErrors.state && styles.inputError]} 
                    onPress={() => setShowStateModal(true)}
                  >
                    <Text style={{color: form.state ? '#0f172a' : '#94a3b8'}}>{form.state || "Select"}</Text>
                    <ChevronDown size={16} color="#64748b" />
                  </TouchableOpacity>
                  {fieldErrors.state && <Text style={styles.errorText}>{fieldErrors.state}</Text>}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={{flex: 1, marginRight: 8}}>
                  <Text style={styles.formLabel}>City</Text>
                  <TouchableOpacity 
                    style={[styles.input, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, fieldErrors.city && styles.inputError]} 
                    onPress={() => setShowCityModal(true)}
                  >
                    <Text style={{color: form.city ? '#0f172a' : '#94a3b8'}}>{form.city || "Select"}</Text>
                    <ChevronDown size={16} color="#64748b" />
                  </TouchableOpacity>
                  {fieldErrors.city && <Text style={styles.errorText}>{fieldErrors.city}</Text>}
                </View>
                <BookingInputField
                  label="Pincode"
                  value={form.pin_code}
                  onChangeText={(v) => handleChangeText("pin_code", v)}
                  error={fieldErrors.pin_code}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              <View style={styles.formRow}>
                <BookingInputField
                  label="Stall Area"
                  value={form.stall_area}
                  onChangeText={(v) => handleChangeText("stall_area", v)}
                  error={fieldErrors.stall_area}
                />
                <View style={{ width: 8 }} />
                <BookingInputField
                  label="Products"
                  value={form.products}
                  onChangeText={(v) => handleChangeText("products", v)}
                  error={fieldErrors.products}
                />
              </View>

              <View>
                <BookingInputField
                  label="Address"
                  value={form.address}
                  onChangeText={(v) => handleChangeText("address", v)}
                  error={fieldErrors.address}
                  multiline
                />
              </View>

              <View>
                <BookingInputField
                  label="Additional Messages"
                  value={form.messages}
                  onChangeText={(v) => handleChangeText("messages", v)}
                  multiline
                />
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const MyBookings = () => {
  const navigation = useNavigation();

  const [bookings, setBookings] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [modalType, setModalType] = useState("");
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  const reduxUser = useSelector((state) => state.user);
  const [storedUser, setStoredUser] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("userName");
      setStoredUser({ id, name });
    };
    loadUser();
  }, []);

  const user = reduxUser?.id ? reduxUser : storedUser;

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id]);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const loadCountries = async () => {
    try {
      const data = await getCountries();
      setCountries(data.map(c => ({ id: c.id, name: c.country_name })));
    } catch (err) { console.error(err); }
  };

  const loadStates = async (countryCode) => {
    try {
      const data = await getStates(countryCode);
      setStates(data.map(s => ({ id: s.id, name: s.state_name })));
    } catch (err) { console.error(err); }
  };

  const loadCities = async (countryCode, stateCode) => {
    try {
      const data = await getCities(countryCode, stateCode);
      setCities(data.map(c => ({ id: c.id, name: c.city_name })));
    } catch (err) { console.error(err); }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyBookings(user.id);
      if (res.success) {
        setBookings(res.data);
      } else {
        setError("Failed to fetch bookings");
      }
    } catch (err) {
      setError("An error occurred while fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const openView = async (id) => {
    try {
      const res = await getBookingById(id);
      if (res.success) {
        setSelectedData(res.data);
        setModalType("view");
      }
    } catch (err) {
      setError("Failed to load booking details");
    }
  };

  const openEdit = async (id) => {
    try {
      const res = await getBookingById(id);
      if (res.success) {
        setForm(res.data);
        setModalType("edit");
        setCountrySearch(res.data.country || "");
        setStateSearch(res.data.state || "");
        setCitySearch(res.data.city || "");

        const cList = await getCountries();
        const formattedCList = cList.map(c => ({ id: c.id, name: c.country_name }));
        setCountries(formattedCList);

        if (res.data.country) {
          const mCountry = formattedCList.find(c => c.name.toLowerCase() === res.data.country.toLowerCase());
          if (mCountry) {
            const sList = await getStates(mCountry.id);
            const formattedSList = sList.map(s => ({ id: s.id, name: s.state_name }));
            setStates(formattedSList);

            if (res.data.state) {
              const mState = formattedSList.find(s => s.name.toLowerCase() === res.data.state.toLowerCase());
              if (mState) {
                const cityL = await getCities(mCountry.id, mState.id);
                setCities(cityL.map(c => ({ id: c.id, name: c.city_name })));
              }
            }
          }
        }
      }
    } catch (err) {
      setError("Failed to load booking for editing");
    }
  };

  const closeModal = () => {
    setModalType("");
    setSelectedData(null);
    setForm({});
    setError("");
    setFieldErrors({});
  };

  const handleChangeText = (name, value) => {
    setFieldErrors({ ...fieldErrors, [name]: "" });

    if (name === "email" || name === "mobile" || name === "pin_code") {
      value = value.replace(/\s/g, "");
    } else {
      value = value.trimStart();
    }

    if (name === "mobile" || name === "pin_code") {
      if (value !== "" && !/^\d*$/.test(value)) return;
      if (name === "mobile" && value.length > 10) return;
      if (name === "pin_code" && value.length > 6) return;
    }

    if (["first_name", "last_name", "city", "state", "country"].includes(name)) {
      if (value !== "" && !/^[a-zA-Z\s]*$/.test(value)) return;
    }

    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "first_name", "last_name", "email", "mobile", "company_name", 
      "country", "state", "city", "address", "stall_area", "products", "pin_code"
    ];

    requiredFields.forEach((field) => {
      if (!form[field] || form[field].trim() === "") {
        newErrors[field] = "Required";
      }
    });

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (form.mobile && !/^\d{10}$/.test(form.mobile)) {
      newErrors.mobile = "10 digits required";
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    try {
      setError("");
      const res = await updateBooking(form.id, form);
      if (res.success) {
        showNotification("Booking updated successfully!", "success");
        closeModal();
        fetchBookings();
      } else {
        showNotification("Failed to update booking", "error");
      }
    } catch (err) {
      showNotification("An error occurred while updating", "error");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>My Stall Bookings</Text>
          <Text style={styles.pageSubtitle}>Manage and view your event stall bookings</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 8 }}>
            <Text style={styles.backLink}>? Back to Home</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{bookings.length} Booking{bookings.length !== 1 ? "s" : ""}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={styles.errorBox}>
            <AlertCircle color="#b91c1c" size={24} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.errorBoxTitle}>Something went wrong</Text>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading your bookings...</Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={styles.emptyIconBox}>
              <Text style={{ fontSize: 32 }}>??</Text>
            </View>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>You haven't made any stall bookings yet. Start by creating your first booking!</Text>
          </View>
        ) : (
          bookings.map((item) => {
            const statusLabel = item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || "Pending";
            const isApproved = item.status === "approved" || item.status === "confirmed";

            return (
              <View key={item.id} style={styles.card}>
                <View style={[
                  styles.statusBadge, 
                  isApproved ? styles.statusConfirmed : (item.status === 'pending' ? styles.statusPending : styles.statusDefault)
                ]}>
                  <Text style={[
                    styles.statusText,
                    isApproved ? styles.statusTextConfirmed : (item.status === 'pending' ? styles.statusTextPending : styles.statusTextDefault)
                  ]}>{statusLabel}</Text>
                </View>

                <Text style={styles.eventTitle} numberOfLines={2}>{item.event_name}</Text>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <UserIcon size={16} color="#2563eb" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Organizer</Text>
                    <Text style={styles.infoValue}>{item.first_name} {item.last_name}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Phone size={16} color="#2563eb" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Contact</Text>
                    <Text style={styles.infoValue}>{item.mobile}</Text>
                  </View>
                </View>

                {item.company_name && (
                  <View style={styles.infoRow}>
                    <Building2 size={16} color="#2563eb" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Company</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>{item.company_name}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => openView(item.id)}>
                    <Text style={styles.viewBtnText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.editBtn, isApproved && styles.editBtnDisabled]} 
                    onPress={() => openEdit(item.id)}
                    disabled={isApproved}
                  >
                    <Text style={[styles.editBtnText, isApproved && styles.editBtnTextDisabled]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* View Booking Details Modal */}
      <ViewBookingModal
        visible={modalType === "view"}
        selectedData={selectedData}
        closeModal={closeModal}
      />

      {/* Edit Booking Modal */}
      <EditBookingModal
        visible={modalType === "edit"}
        form={form}
        fieldErrors={fieldErrors}
        handleChangeText={handleChangeText}
        closeModal={closeModal}
        handleUpdate={handleUpdate}
        setShowCountryModal={setShowCountryModal}
        setShowStateModal={setShowStateModal}
        setShowCityModal={setShowCityModal}
      />

      {/* Toast Notification */}
      {toast.show && (
        <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
          <View style={[styles.toastIconWrapper, toast.type === "success" ? {backgroundColor: 'rgba(5, 150, 105, 0.2)'} : {backgroundColor: 'rgba(225, 29, 72, 0.2)'}]}>
            {toast.type === "success" ? <CheckCircle size={16} color="#fff" /> : <AlertCircle size={16} color="#fff" />}
          </View>
          <Text style={styles.toastMessage}>{toast.message}</Text>
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
          setForm({...form, country: item.name, state: "", city: ""});
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
          setForm({...form, state: item.name, city: ""});
          setStateSearch(""); setShowStateModal(false);
          const country = countries.find(c => c.name === form.country);
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
          setForm({...form, city: item.name});
          setCitySearch(""); setShowCityModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  pageSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  backLink: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  countBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  countBadgeText: { color: '#1d4ed8', fontWeight: 'bold' },

  scrollContent: { padding: 16, paddingBottom: 40 },
  centerContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { color: '#64748b', marginTop: 16, fontWeight: '500' },
  emptyIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  emptyText: { color: '#64748b', textAlign: 'center', paddingHorizontal: 32 },

  errorBox: { flexDirection: 'row', backgroundColor: '#fef2f2', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca', marginBottom: 16 },
  errorBoxTitle: { fontWeight: 'bold', color: '#b91c1c' },
  errorBoxText: { color: '#dc2626', fontSize: 12, marginTop: 4 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  statusBadge: { position: 'absolute', top: 16, right: 16, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  statusConfirmed: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#fef3c7' },
  statusDefault: { backgroundColor: '#f1f5f9' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  statusTextConfirmed: { color: '#15803d' },
  statusTextPending: { color: '#b45309' },
  statusTextDefault: { color: '#334155' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', paddingRight: 80, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoTextContainer: { marginLeft: 12 },
  infoLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  
  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  viewBtn: { flex: 1, backgroundColor: '#3b82f6', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  viewBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  editBtn: { flex: 1, backgroundColor: '#10b981', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  editBtnDisabled: { backgroundColor: '#cbd5e1' },
  editBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  editBtnTextDisabled: { color: '#64748b' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  detailModalContainer: { backgroundColor: '#fff', borderRadius: 16, maxHeight: '90%', overflow: 'hidden' },
  modalHeader: { backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  modalBody: { padding: 20 },
  
  detailLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginBottom: 4 },
  detailValueLarge: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  twoColGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  addressBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  addressGrid: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  detailLabelSmall: { fontSize: 10, color: '#64748b', fontWeight: '500' },
  detailValueSmall: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  messageBox: { backgroundColor: '#eff6ff', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe' },
  messageLabel: { fontSize: 10, fontWeight: 'bold', color: '#1d4ed8', marginBottom: 4 },
  messageValue: { fontSize: 14, color: '#0f172a' },
  visitingCardImage: { width: '100%', height: 200, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },

  formRow: { flexDirection: 'row', justifyContent: 'space-between' },
  formLabel: { fontSize: 10, fontWeight: 'bold', color: '#475569', marginBottom: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 10, marginTop: 4, fontWeight: 'bold' },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 16 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: '#334155', fontWeight: 'bold' },
  saveBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#10b981', borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },

  dropdownModal: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, height: '60%', position: 'absolute', bottom: 0, left: 0, right: 0 },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dropdownTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  dropdownSearch: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, marginBottom: 12 },
  dropdownScroll: { flex: 1 },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemText: { fontSize: 16, color: '#334155' },

  toast: { position: 'absolute', top: 40, right: 16, left: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', padding: 16, borderRadius: 12, zIndex: 9999 },
  toastSuccess: { backgroundColor: '#059669' },
  toastError: { backgroundColor: '#e11d48' },
  toastIconWrapper: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  toastMessage: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default MyBookings;
