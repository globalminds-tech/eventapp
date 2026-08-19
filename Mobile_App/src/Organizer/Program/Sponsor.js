import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Save,
  Search,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";

const Sponsor = () => {
  function getToday() {
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const [page, setPage] = useState("list"); // list | sponsorForm | accountForm | view
  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const [sponsorList, setSponsorList] = useState([
    {
      id: 1,
      sponsorCode: "SPO-4",
      sponsorName: "Vikas",
      primaryContactNo: "9080798079",
      secondaryContactNo: "",
      mailId: "vikas19052004@gmail.com",
      address: "perumbakkam",
      status: "Active",
      createdBy: "Sakthi",
      createdOn: "07/03/2026",
      modifiedBy: "Sakthi",
      modifiedOn: "07/03/2026",
      country: "INDIA",
      state: "TAMIL NADU",
      city: "CHENNAI",
      documents: [],
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountDocuments: [],
    },
  ]);

  const initialForm = {
    sponsorCode: "",
    sponsorName: "",
    primaryContactNo: "",
    secondaryContactNo: "",
    mailId: "",
    address: "",
    status: "Active",
    createdBy: "Sakthi",
    createdOn: getToday(),
    modifiedBy: "Sakthi",
    modifiedOn: getToday(),
    country: "INDIA",
    state: "TAMIL NADU",
    city: "CHENNAI",
    documents: [],
    currentDocumentType: "",
    currentDocumentNumber: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountDocuments: [],
  };

  const [formData, setFormData] = useState(initialForm);
  const [sponsorUploadFile, setSponsorUploadFile] = useState(null);
  const [accountUploadFile, setAccountUploadFile] = useState(null);
  const [errors, setErrors] = useState({});

  const filteredSponsors = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return sponsorList;

    return sponsorList.filter((item) =>
      [
        item.sponsorCode, item.sponsorName, item.primaryContactNo, item.mailId, item.address,
        item.status, item.createdBy, item.createdOn, item.modifiedBy, item.modifiedOn,
      ].join(" ").toLowerCase().includes(keyword)
    );
  }, [searchKeyword, sponsorList]);

  const totalPages = Math.max(1, Math.ceil(filteredSponsors.length / itemsPerPage));
  const paginatedData = filteredSponsors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchKeyword, itemsPerPage]);

  const resetAll = () => {
    setFormData({ ...initialForm, createdOn: getToday(), modifiedOn: getToday() });
    setSponsorUploadFile(null);
    setAccountUploadFile(null);
    setEditId(null);
    setViewItem(null);
    setErrors({});
  };

  const handleAddNew = () => {
    resetAll();
    setPage("sponsorForm");
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({
      ...initialForm,
      ...item,
      modifiedBy: "Sakthi",
      modifiedOn: getToday(),
    });
    setErrors({});
    setPage("sponsorForm");
  };

  const handleView = (item) => {
    setViewItem(item);
    setPage("view");
  };

  const handleDelete = (id) => {
    setSponsorList((prev) => prev.filter((item) => item.id !== id));
  };

  const updateField = (field, value) => {
    let updatedValue = value;
    if (field === "primaryContactNo" || field === "secondaryContactNo") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }
    if (field === "mailId") updatedValue = value.toLowerCase();
    if (field === "ifscCode") updatedValue = value.toUpperCase().replace(/\s/g, "");
    if (field === "accountNumber") updatedValue = value.replace(/\D/g, "");

    setFormData((prev) => ({ ...prev, [field]: updatedValue }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateSponsorForm = () => {
    const newErrors = {};
    const contactRegex = /^[0-9]{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;

    if (!formData.sponsorName.trim()) newErrors.sponsorName = "Required";
    if (!formData.primaryContactNo.trim()) newErrors.primaryContactNo = "Required";
    else if (!contactRegex.test(formData.primaryContactNo)) newErrors.primaryContactNo = "Invalid format";
    if (formData.secondaryContactNo && !contactRegex.test(formData.secondaryContactNo)) newErrors.secondaryContactNo = "Invalid format";
    if (!formData.mailId.trim()) newErrors.mailId = "Required";
    else if (!emailRegex.test(formData.mailId)) newErrors.mailId = "Invalid email";
    if (!formData.address.trim()) newErrors.address = "Required";

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateAccountForm = () => {
    const newErrors = {};
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    const accountRegex = /^[0-9]{6,18}$/;

    if (!formData.accountHolderName.trim()) newErrors.accountHolderName = "Required";
    if (!formData.bankName.trim()) newErrors.bankName = "Required";
    if (!formData.accountNumber.trim()) newErrors.accountNumber = "Required";
    else if (!accountRegex.test(formData.accountNumber)) newErrors.accountNumber = "Invalid format";
    if (!formData.ifscCode.trim()) newErrors.ifscCode = "Required";
    else if (!ifscRegex.test(formData.ifscCode) && !swiftRegex.test(formData.ifscCode)) newErrors.ifscCode = "Invalid IFSC/SWIFT";

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateSponsorForm()) return;
    setPage("accountForm");
  };

  const handleSave = () => {
    if (!validateAccountForm()) return;

    if (editId) {
      setSponsorList((prev) =>
        prev.map((item) =>
          item.id === editId ? { ...item, ...formData, modifiedBy: "Sakthi", modifiedOn: getToday() } : item
        )
      );
    } else {
      const nextId = sponsorList.length > 0 ? Math.max(...sponsorList.map((item) => item.id)) + 1 : 1;
      const sponsorCode = formData.sponsorCode && formData.sponsorCode.trim() ? formData.sponsorCode : `SPO-${nextId + 3}`;
      setSponsorList((prev) => [
        ...prev,
        { id: nextId, ...formData, sponsorCode, createdBy: "Sakthi", createdOn: getToday(), modifiedBy: "Sakthi", modifiedOn: getToday() },
      ]);
    }
    resetAll();
    setPage("list");
  };

  const mockFileUpload = (type) => {
    Alert.alert("Upload Document", "File picker would open here.", [
      { text: "Mock File", onPress: () => {
        if (type === "sponsor") setSponsorUploadFile({ name: "document.pdf" });
        else setAccountUploadFile({ name: "account_doc.pdf" });
      }},
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.pagination}>
        <TouchableOpacity style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]} disabled={currentPage === 1} onPress={() => setCurrentPage(p => Math.max(1, p - 1))}>
          <ChevronLeft size={20} color={currentPage === 1 ? "#cbd5e1" : "#475569"} />
        </TouchableOpacity>
        <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
        <TouchableOpacity style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]} disabled={currentPage === totalPages} onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
          <ChevronRight size={20} color={currentPage === totalPages ? "#cbd5e1" : "#475569"} />
        </TouchableOpacity>
      </View>
    );
  };

  if (page === "view") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setPage("list")} style={styles.backBtn}>
              <ArrowLeft size={20} color="#475569" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Sponsor View</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sponsor Details</Text>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Code:</Text><Text style={styles.detailValue}>{viewItem.sponsorCode}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Name:</Text><Text style={styles.detailValue}>{viewItem.sponsorName}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Primary Contact:</Text><Text style={styles.detailValue}>{viewItem.primaryContactNo}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Secondary Contact:</Text><Text style={styles.detailValue}>{viewItem.secondaryContactNo || "-"}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Email:</Text><Text style={styles.detailValue}>{viewItem.mailId}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Address:</Text><Text style={styles.detailValue}>{viewItem.address}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Status:</Text><Text style={styles.detailValue}>{viewItem.status}</Text></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Holder Name:</Text><Text style={styles.detailValue}>{viewItem.accountHolderName || "-"}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Bank Name:</Text><Text style={styles.detailValue}>{viewItem.bankName || "-"}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Account Number:</Text><Text style={styles.detailValue}>{viewItem.accountNumber || "-"}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>IFSC Code:</Text><Text style={styles.detailValue}>{viewItem.ifscCode || "-"}</Text></View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === "sponsorForm" || page === "accountForm") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => page === "accountForm" ? setPage("sponsorForm") : setPage("list")} style={styles.backBtn}>
              <ArrowLeft size={20} color="#475569" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>{editId ? "Edit Sponsor" : "New Sponsor"}</Text>
          </View>

          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, page === "sponsorForm" ? styles.stepDotActive : styles.stepDotCompleted]}><Text style={styles.stepNum}>1</Text></View>
            <Text style={[styles.stepText, page === "sponsorForm" && styles.stepTextActive]}>Sponsor</Text>
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, page === "accountForm" && styles.stepDotActive]}><Text style={styles.stepNum}>2</Text></View>
            <Text style={[styles.stepText, page === "accountForm" && styles.stepTextActive]}>Account</Text>
          </View>

          {page === "sponsorForm" ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Sponsor Details</Text>
              
              <Text style={styles.label}>Sponsor Name *</Text>
              <TextInput style={[styles.input, errors.sponsorName && styles.inputError]} value={formData.sponsorName} onChangeText={(v) => updateField("sponsorName", v)} />
              {errors.sponsorName && <Text style={styles.errorText}>{errors.sponsorName}</Text>}
              
              <Text style={styles.label}>Primary Contact No *</Text>
              <TextInput style={[styles.input, errors.primaryContactNo && styles.inputError]} value={formData.primaryContactNo} onChangeText={(v) => updateField("primaryContactNo", v)} keyboardType="numeric" maxLength={10} />
              {errors.primaryContactNo && <Text style={styles.errorText}>{errors.primaryContactNo}</Text>}

              <Text style={styles.label}>Secondary Contact No</Text>
              <TextInput style={[styles.input, errors.secondaryContactNo && styles.inputError]} value={formData.secondaryContactNo} onChangeText={(v) => updateField("secondaryContactNo", v)} keyboardType="numeric" maxLength={10} />
              {errors.secondaryContactNo && <Text style={styles.errorText}>{errors.secondaryContactNo}</Text>}

              <Text style={styles.label}>Mail ID *</Text>
              <TextInput style={[styles.input, errors.mailId && styles.inputError]} value={formData.mailId} onChangeText={(v) => updateField("mailId", v)} keyboardType="email-address" autoCapitalize="none" />
              {errors.mailId && <Text style={styles.errorText}>{errors.mailId}</Text>}

              <Text style={styles.label}>Address *</Text>
              <TextInput style={[styles.input, {height: 80}, errors.address && styles.inputError]} value={formData.address} onChangeText={(v) => updateField("address", v)} multiline />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

              <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
                <Text style={styles.primaryBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Account Details</Text>
              
              <Text style={styles.label}>Account Holder Name *</Text>
              <TextInput style={[styles.input, errors.accountHolderName && styles.inputError]} value={formData.accountHolderName} onChangeText={(v) => updateField("accountHolderName", v)} />
              {errors.accountHolderName && <Text style={styles.errorText}>{errors.accountHolderName}</Text>}
              
              <Text style={styles.label}>Bank Name *</Text>
              <TextInput style={[styles.input, errors.bankName && styles.inputError]} value={formData.bankName} onChangeText={(v) => updateField("bankName", v)} />
              {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}
              
              <Text style={styles.label}>Account Number *</Text>
              <TextInput style={[styles.input, errors.accountNumber && styles.inputError]} value={formData.accountNumber} onChangeText={(v) => updateField("accountNumber", v)} keyboardType="numeric" />
              {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
              
              <Text style={styles.label}>IFSC / SWIFT Code *</Text>
              <TextInput style={[styles.input, errors.ifscCode && styles.inputError]} value={formData.ifscCode} onChangeText={(v) => updateField("ifscCode", v)} autoCapitalize="characters" />
              {errors.ifscCode && <Text style={styles.errorText}>{errors.ifscCode}</Text>}

              <TouchableOpacity style={styles.uploadArea} onPress={() => mockFileUpload("account")}>
                <Upload size={32} color="#94a3b8" />
                <Text style={{color: "#64748b", marginTop: 8}}>Upload Account Document</Text>
                {accountUploadFile && <Text style={{color: "#3b82f6", marginTop: 4}}>{accountUploadFile.name}</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
                <Text style={styles.primaryBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // LIST PAGE
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Sponsors</Text>
          <TouchableOpacity style={styles.newBtn} onPress={handleAddNew}>
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.searchBar}>
            <Search size={16} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search sponsors..."
              value={searchKeyword}
              onChangeText={setSearchKeyword}
            />
          </View>

          {paginatedData.length === 0 ? (
            <View style={styles.emptyContainer}><Text style={styles.emptyText}>No sponsors found.</Text></View>
          ) : (
            paginatedData.map((item) => (
              <View key={item.id} style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <View style={styles.codeBadge}><Text style={styles.codeText}>{item.sponsorCode}</Text></View>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleView(item)}><Eye size={16} color="#475569" /></TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}><Pencil size={16} color="#475569" /></TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, {borderColor: "#fecdd3"}]} onPress={() => handleDelete(item.id)}><Trash2 size={16} color="#e11d48" /></TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.sponsorName}>{item.sponsorName}</Text>
                <Text style={styles.sponsorText}>Contact: {item.primaryContactNo}</Text>
                <Text style={styles.sponsorText}>Email: {item.mailId}</Text>
                <Text style={styles.sponsorText}>Status: {item.status}</Text>
              </View>
            ))
          )}
          <Pagination />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Sponsor;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  backBtn: { padding: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10 },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#1e293b", flex: 1 },
  newBtn: { backgroundColor: "#2563eb", width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 16, marginBottom: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  emptyContainer: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "bold" },
  listCard: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, marginBottom: 12 },
  listCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  codeBadge: { backgroundColor: "#eff6ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  codeText: { color: "#2563eb", fontWeight: "bold", fontSize: 12 },
  actionsRow: { flexDirection: "row", gap: 6 },
  actionBtn: { padding: 6, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8 },
  sponsorName: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 6 },
  sponsorText: { fontSize: 13, color: "#475569", marginBottom: 2 },
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 8 },
  pageBtn: { width: 40, height: 40, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  pageBtnDisabled: { backgroundColor: "#f8fafc" },
  pageText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  stepIndicator: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  stepDotActive: { backgroundColor: "#3b82f6" },
  stepDotCompleted: { backgroundColor: "#10b981" },
  stepNum: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  stepText: { fontSize: 12, fontWeight: "bold", color: "#94a3b8", marginLeft: 8 },
  stepTextActive: { color: "#3b82f6" },
  stepLine: { width: 40, height: 2, backgroundColor: "#e2e8f0", marginHorizontal: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "bold", color: "#475569", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  inputError: { borderColor: "red" },
  errorText: { color: "red", fontSize: 11, marginTop: 4 },
  primaryBtn: { backgroundColor: "#3b82f6", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 24 },
  primaryBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  uploadArea: { marginTop: 16, padding: 24, borderWidth: 1, borderStyle: "dashed", borderColor: "#cbd5e1", borderRadius: 12, alignItems: "center", backgroundColor: "#f8fafc" },
  detailRow: { flexDirection: "row", marginBottom: 12 },
  detailLabel: { width: 140, fontSize: 14, fontWeight: "bold", color: "#64748b" },
  detailValue: { flex: 1, fontSize: 14, color: "#0f172a" },
});
