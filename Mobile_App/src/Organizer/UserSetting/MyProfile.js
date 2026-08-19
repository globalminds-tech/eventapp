import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CloudUpload,
  Save,
  User,
  ChevronDown,
  X,
  Search
} from "lucide-react-native";
import { getUserProfile, updateUserProfile, getCountries, getStates, getCities } from "@Services/api";
import { useDispatch } from "react-redux";
import { setUser } from "@Redux/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const MyProfile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const dispatch = useDispatch();

  const [userId, setUserId] = useState(null);

  const [countries, setCountries] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    mobile: "",
    email: "",
    address: "",
    country: "",
    state: "",
    city: "",
    profile_image: "",
    organization_name: ""
  });

  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Load userId from AsyncStorage on mount
  useEffect(() => {
    const getStoredUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("userId") || await AsyncStorage.getItem("User_id") || await AsyncStorage.getItem("id");
        if (id) {
          setUserId(id);
          setFormData(prev => ({ ...prev, id }));
        }
      } catch (err) {
        console.error("Error reading user id:", err);
      }
    };
    getStoredUserId();
  }, []);

  useEffect(() => {
    loadCountries();
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  // Fetch states when country changes
  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countries.find(c => c.country_name === formData.country);
      if (selectedCountry) {
        loadStates(selectedCountry.id);
      }
    } else {
      setStatesList([]);
      setCitiesList([]);
    }
  }, [formData.country, countries]);

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.state && formData.country) {
      const selectedCountry = countries.find(c => c.country_name === formData.country);
      const selectedState = statesList.find(s => s.state_name === formData.state);
      if (selectedCountry && selectedState) {
        loadCities(selectedCountry.id, selectedState.id);
      }
    } else {
      setCitiesList([]);
    }
  }, [formData.state, statesList, formData.country, countries]);

  const loadCountries = async () => {
    try {
      const res = await getCountries();
      setCountries(res || []);
    } catch (err) {
      console.error("Error loading countries:", err);
    }
  };

  const loadStates = async (countryCode) => {
    setLoadingStates(true);
    try {
      const res = await getStates(countryCode);
      setStatesList(res || []);
    } catch (err) {
      console.error("Error loading states:", err);
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (countryCode, stateCode) => {
    setLoadingCities(true);
    try {
      const res = await getCities(countryCode, stateCode);
      setCitiesList(res || []);
    } catch (err) {
      console.error("Error loading cities:", err);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCountrySelect = (c) => {
    setFormData(prev => ({ ...prev, country: c.country_name, state: "", city: "" }));
    setCountrySearch(c.country_name);
    setStateSearch("");
    setCitySearch("");
    setShowCountryDropdown(false);
    loadStates(c.id);
  };

  const handleStateSelect = (s) => {
    setFormData(prev => ({ ...prev, state: s.state_name, city: "" }));
    setStateSearch(s.state_name);
    setCitySearch("");
    setShowStateDropdown(false);
    const country = countries.find(c => c.country_name === formData.country);
    if (country) {
      loadCities(country.id, s.id);
    }
  };

  const handleCitySelect = (c) => {
    setFormData(prev => ({ ...prev, city: c.city_name }));
    setCitySearch(c.city_name);
    setShowCityDropdown(false);
  };

  const handleClearCountry = () => {
    setFormData(prev => ({ ...prev, country: "", state: "", city: "" }));
    setCountrySearch("");
    setStateSearch("");
    setCitySearch("");
    setStatesList([]);
    setCitiesList([]);
    setShowCountryDropdown(true);
  };

  const handleClearState = () => {
    setFormData(prev => ({ ...prev, state: "", city: "" }));
    setStateSearch("");
    setCitySearch("");
    setCitiesList([]);
    setShowStateDropdown(true);
  };

  const handleClearCity = () => {
    setFormData(prev => ({ ...prev, city: "" }));
    setCitySearch("");
    setShowCityDropdown(true);
  };

  const filteredCountries = countrySearch && countrySearch !== formData.country
    ? countries.filter(c => c.country_name.toLowerCase().includes(countrySearch.toLowerCase()))
    : countries;

  const filteredStates = stateSearch && stateSearch !== formData.state
    ? statesList.filter(s => s.state_name.toLowerCase().includes(stateSearch.toLowerCase()))
    : statesList;

  const filteredCities = citySearch && citySearch !== formData.city
    ? citiesList.filter(c => c.city_name.toLowerCase().includes(citySearch.toLowerCase()))
    : citiesList;

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getUserProfile(userId);
      if (res.status === "success") {
        const data = res.data;

        setFormData({
          id: data.id,
          name: data.name || "",
          mobile: data.mobile || "",
          email: data.email || "",
          address: data.address || "",
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          profile_image: data.profile_image || "",
          organization_name: data.organization_name || ""
        });

        setCountrySearch(data.country || "");
        setStateSearch(data.state || "");
        setCitySearch(data.city || "");

        if (data.profile_image) setProfileImage(data.profile_image);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUploadPlaceholder = () => {
    Alert.alert(
      "Upload Image",
      "Please select or capture an image (File Picker placeholder)",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mock Image",
          onPress: () => {
            // Simulated base64 profile image
            const mockBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
            setProfileImage(mockBase64);
            setFormData(prev => ({ ...prev, profile_image: mockBase64 }));
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await updateUserProfile(formData);
      if (res.status === "success") {
        setMessage({ type: "success", text: "Profile updated successfully!" });

        // Instant sync with AsyncStorage
        await AsyncStorage.setItem("name", formData.name).catch(() => {});
        await AsyncStorage.setItem("profile_image", formData.profile_image).catch(() => {});

        const role = await AsyncStorage.getItem("role").catch(() => null) || "organizer";

        dispatch(setUser({
          id: formData.id,
          name: formData.name,
          role: role,
          profile_image: formData.profile_image
        }));
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setMessage({ type: "error", text: "Error connecting to server." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>My Profile</Text>
            <Text style={styles.pageSubtitle}>Update your account details and preferences</Text>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Save size={18} color="#ffffff" />
            )}
            <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Profile"}</Text>
          </TouchableOpacity>
        </View>

        {message.text ? (
          <View
            style={[
              styles.messageBox,
              message.type === "success" ? styles.messageSuccess : styles.messageError,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.type === "success" ? styles.messageTextSuccess : styles.messageTextError,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ) : null}

        {/* PROFILE PICTURE CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile Photo</Text>
          <View style={styles.photoContainer}>
            <View style={styles.avatarWrapper}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <User size={96} color="#e2e8f0" />
              )}
            </View>

            <TouchableOpacity style={styles.uploadBtn} onPress={handleImageUploadPlaceholder}>
              <CloudUpload size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.photoTips}>
            <Text style={styles.photoTipText}>Supported formats: JPG, PNG, WEBP</Text>
            <Text style={[styles.photoTipText, { marginTop: 2 }]}>Max size: 5MB</Text>
          </View>
        </View>

        {/* DETAILS SECTION */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.cardTitle}>Identity Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleTextChange("name", text)}
              placeholder="Enter your name"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Contact Number <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.mobile}
              keyboardType="phone-pad"
              maxLength={13}
              onChangeText={(text) => {
                if (/^\+?\d*$/.test(text)) {
                  handleTextChange("mobile", text);
                }
              }}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address (Locked)</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={formData.email}
              editable={false}
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.hintText}>Contact support to change your registered email</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Organization Name <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.organization_name}
              onChangeText={(text) => handleTextChange("organization_name", text)}
              placeholder="Enter organization name"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* LOCATION & ADDRESS */}
        <View style={[styles.card, { marginTop: 16, zIndex: 10 }]}>
          <Text style={styles.cardTitle}>
            Location & Address <Text style={{ color: "red" }}>*</Text>
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Work/Home Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              value={formData.address}
              onChangeText={(text) => handleTextChange("address", text)}
              placeholder="Street, Building, Apartment..."
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* COUNTRY DROPDOWN */}
          <View style={[styles.inputGroup, { zIndex: 30 }]}>
            <Text style={styles.label}>Country</Text>
            <View style={styles.dropdownInputWrapper}>
              <Search size={16} color="#94a3b8" style={styles.dropdownSearchIcon} />
              <TextInput
                style={styles.dropdownInput}
                placeholder="Search Country"
                placeholderTextColor="#94a3b8"
                value={countrySearch}
                onChangeText={(val) => {
                  setCountrySearch(val);
                  setShowCountryDropdown(true);
                  if (val === "") {
                    setFormData(prev => ({ ...prev, country: "", state: "", city: "" }));
                    setStateSearch("");
                    setCitySearch("");
                  }
                }}
                onFocus={() => setShowCountryDropdown(true)}
              />
              <View style={styles.dropdownRightBtns}>
                {countrySearch ? (
                  <TouchableOpacity onPress={handleClearCountry} style={styles.dropdownClearBtn}>
                    <X size={14} color="#64748b" />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity onPress={() => setShowCountryDropdown(!showCountryDropdown)}>
                  <ChevronDown size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {showCountryDropdown && (
              <View style={styles.dropdownList}>
                {filteredCountries.length === 0 ? (
                  <Text style={styles.dropdownEmptyText}>No countries found</Text>
                ) : (
                  filteredCountries.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.dropdownOption,
                        formData.country === c.country_name && styles.dropdownOptionSelected,
                      ]}
                      onPress={() => handleCountrySelect(c)}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          formData.country === c.country_name && styles.dropdownOptionTextSelected,
                        ]}
                      >
                        {c.country_name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* STATE DROPDOWN */}
          <View style={[styles.inputGroup, { zIndex: 20 }]}>
            <Text style={styles.label}>State</Text>
            <View style={styles.dropdownInputWrapper}>
              <Search size={16} color="#94a3b8" style={styles.dropdownSearchIcon} />
              <TextInput
                style={[styles.dropdownInput, !formData.country && styles.dropdownInputDisabled]}
                placeholder={formData.country ? "Search State" : "Select Country first"}
                placeholderTextColor="#94a3b8"
                value={stateSearch}
                editable={!!formData.country}
                onChangeText={(val) => {
                  setStateSearch(val);
                  setShowStateDropdown(true);
                  if (val === "") {
                    setFormData(prev => ({ ...prev, state: "", city: "" }));
                    setCitySearch("");
                  }
                }}
                onFocus={() => setShowStateDropdown(true)}
              />
              <View style={styles.dropdownRightBtns}>
                {stateSearch && formData.country ? (
                  <TouchableOpacity onPress={handleClearState} style={styles.dropdownClearBtn}>
                    <X size={14} color="#64748b" />
                  </TouchableOpacity>
                ) : null}
                {loadingStates ? (
                  <ActivityIndicator size="small" color="#2563eb" style={{ marginRight: 4 }} />
                ) : (
                  <TouchableOpacity
                    disabled={!formData.country}
                    onPress={() => setShowStateDropdown(!showStateDropdown)}
                  >
                    <ChevronDown size={16} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {showStateDropdown && (
              <View style={styles.dropdownList}>
                {loadingStates ? (
                  <ActivityIndicator size="small" color="#2563eb" style={{ padding: 12 }} />
                ) : filteredStates.length === 0 ? (
                  <Text style={styles.dropdownEmptyText}>No states found</Text>
                ) : (
                  filteredStates.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.dropdownOption,
                        formData.state === s.state_name && styles.dropdownOptionSelected,
                      ]}
                      onPress={() => handleStateSelect(s)}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          formData.state === s.state_name && styles.dropdownOptionTextSelected,
                        ]}
                      >
                        {s.state_name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* CITY DROPDOWN */}
          <View style={[styles.inputGroup, { zIndex: 10 }]}>
            <Text style={styles.label}>City</Text>
            <View style={styles.dropdownInputWrapper}>
              <Search size={16} color="#94a3b8" style={styles.dropdownSearchIcon} />
              <TextInput
                style={[styles.dropdownInput, !formData.state && styles.dropdownInputDisabled]}
                placeholder={formData.state ? "Search City" : "Select State first"}
                placeholderTextColor="#94a3b8"
                value={citySearch}
                editable={!!formData.state}
                onChangeText={(val) => {
                  setCitySearch(val);
                  setShowCityDropdown(true);
                  if (val === "") {
                    setFormData(prev => ({ ...prev, city: "" }));
                  }
                }}
                onFocus={() => setShowCityDropdown(true)}
              />
              <View style={styles.dropdownRightBtns}>
                {citySearch && formData.state ? (
                  <TouchableOpacity onPress={handleClearCity} style={styles.dropdownClearBtn}>
                    <X size={14} color="#64748b" />
                  </TouchableOpacity>
                ) : null}
                {loadingCities ? (
                  <ActivityIndicator size="small" color="#2563eb" style={{ marginRight: 4 }} />
                ) : (
                  <TouchableOpacity
                    disabled={!formData.state}
                    onPress={() => setShowCityDropdown(!showCityDropdown)}
                  >
                    <ChevronDown size={16} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {showCityDropdown && (
              <View style={styles.dropdownList}>
                {loadingCities ? (
                  <ActivityIndicator size="small" color="#2563eb" style={{ padding: 12 }} />
                ) : filteredCities.length === 0 ? (
                  <Text style={styles.dropdownEmptyText}>No cities found</Text>
                ) : (
                  filteredCities.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.dropdownOption,
                        formData.city === c.city_name && styles.dropdownOptionSelected,
                      ]}
                      onPress={() => handleCitySelect(c)}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          formData.city === c.city_name && styles.dropdownOptionTextSelected,
                        ]}
                      >
                        {c.city_name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
  },
  pageSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#94a3b8",
  },
  saveBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13,
  },
  messageBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  messageSuccess: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  messageError: {
    backgroundColor: "#fef2f2",
    borderColor: "#fca5a5",
  },
  messageText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  messageTextSuccess: {
    color: "#059669",
  },
  messageTextError: {
    color: "#dc2626",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: "center",
    position: "relative",
    marginBottom: 12,
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadBtn: {
    position: "absolute",
    bottom: 0,
    right: "32%",
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 20,
    elevation: 3,
  },
  photoTips: {
    alignItems: "center",
  },
  photoTipText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  inputGroup: {
    marginBottom: 14,
    position: "relative",
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#64748b",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "bold",
  },
  inputDisabled: {
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  hintText: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
  },
  dropdownInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  dropdownSearchIcon: {
    marginRight: 8,
  },
  dropdownInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "bold",
  },
  dropdownInputDisabled: {
    color: "#94a3b8",
  },
  dropdownRightBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownClearBtn: {
    padding: 2,
  },
  dropdownList: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    padding: 4,
  },
  dropdownEmptyText: {
    padding: 12,
    textAlign: "center",
    color: "#94a3b8",
    fontWeight: "bold",
    fontSize: 13,
  },
  dropdownOption: {
    padding: 10,
    borderRadius: 8,
  },
  dropdownOptionSelected: {
    backgroundColor: "#2563eb",
  },
  dropdownOptionText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "bold",
  },
  dropdownOptionTextSelected: {
    color: "#ffffff",
  },
});

export default MyProfile;
