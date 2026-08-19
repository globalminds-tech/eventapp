import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle, XCircle, Clock, User, MapPin, Calendar, Utensils, AlertCircle, ShieldCheck } from "lucide-react-native";
import { validateQr } from "@Services/api";

export default function QRValidation({ route, navigation }) {
  // Assume id is passed in route params
  const id = route?.params?.id || "fallback-id"; 
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const performValidation = async () => {
      try {
        setLoading(true);
        const data = await validateQr(id);
        setResult(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to validate ticket");
      } finally {
        setLoading(false);
      }
    };

    performValidation();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={s.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" style={{ marginBottom: 16 }} />
        <Text style={s.loadingText}>VALIDATING TICKET...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={s.centerContainer}>
        <View style={s.errorIconBox}>
          <AlertCircle size={48} color="#dc2626" />
        </View>
        <Text style={s.errorTitle}>Invalid Ticket</Text>
        <Text style={s.errorDesc}>{error}</Text>
        <TouchableOpacity style={s.tryAgainBtn} onPress={() => navigation?.goBack()}>
          <Text style={s.tryAgainText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isSuccess = result?.status === "success";

  return (
    <SafeAreaView style={[s.container, { backgroundColor: isSuccess ? "#f0fdf4" : "#fff7ed" }]}>
      <View style={[s.card, { borderBottomColor: isSuccess ? "#22c55e" : "#f97316" }]}>
        
        {/* Header Info */}
        <View style={[s.cardHeader, { backgroundColor: isSuccess ? "#22c55e" : "#f97316" }]}>
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            {isSuccess ? <ShieldCheck size={64} color="#fff" /> : <XCircle size={64} color="#fff" />}
          </View>
          <Text style={s.statusTitle}>
            {isSuccess ? "VERIFIED ?" : "ALREADY USED"}
          </Text>
          <Text style={s.statusMsg}>{result?.message}</Text>
        </View>

        {/* Visitor Info */}
        <View style={s.cardBody}>
          
          <View style={s.section}>
            <Text style={s.sectionLabel}>VISITOR DETAILS</Text>
            <View style={s.infoBox}>
              <View style={s.infoIconBox}>
                <User size={24} color="#9ca3af" />
              </View>
              <View>
                <Text style={s.infoLabel}>NAME</Text>
                <Text style={s.infoValue}>{result?.details?.visitor_name}</Text>
              </View>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>EVENT INFORMATION</Text>
            <View style={{ gap: 12 }}>
              <View style={s.rowItem}>
                <Calendar size={20} color="#3b82f6" />
                <Text style={s.rowTextBold}>{result?.details?.event_name}</Text>
              </View>
              <View style={s.rowItem}>
                <MapPin size={20} color="#9ca3af" />
                <Text style={s.rowText}>{result?.details?.venue}</Text>
              </View>
              <View style={s.rowItem}>
                <Clock size={20} color="#9ca3af" />
                <Text style={s.rowText}>{result?.details?.date} at {result?.details?.time}</Text>
              </View>
            </View>
          </View>

          <View style={s.grid}>
            {result?.details?.include_food && (
              <View style={s.gridItem}>
                <Text style={s.sectionLabel}>MEAL</Text>
                <View style={s.rowItemSmall}>
                  <Utensils size={16} color={result?.details?.food === 'Veg' ? '#22c55e' : '#ef4444'} />
                  <Text style={s.gridItemValue}>{result?.details?.food}</Text>
                </View>
              </View>
            )}
            <View style={s.gridItem}>
              <Text style={s.sectionLabel}>TYPE</Text>
              <Text style={s.gridItemValue}>VISITOR</Text>
            </View>
          </View>

          {!isSuccess && result?.details?.scanned_at && (
            <View style={s.scannedBox}>
              <AlertCircle size={20} color="#dc2626" />
              <Text style={s.scannedText}>
                Last scanned on {new Date(result.details.scanned_at).toLocaleString()}
              </Text>
            </View>
          )}

        </View>
      </View>

      <Text style={s.footerText}>DIGITAL VERIFICATION SYSTEM V2.0</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  centerContainer: { flex: 1, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: { color: "#6b7280", fontWeight: "bold", fontSize: 14, letterSpacing: 2 },
  errorIconBox: { width: 96, height: 96, backgroundColor: "#fee2e2", borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  errorTitle: { fontSize: 24, fontWeight: "900", color: "#111827", marginBottom: 8 },
  errorDesc: { color: "#6b7280", textAlign: "center", marginBottom: 32 },
  tryAgainBtn: { backgroundColor: "#111827", paddingHorizontal: 32, paddingVertical: 12, borderRadius: 16 },
  tryAgainText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
  
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 400, backgroundColor: "#ffffff", borderRadius: 40, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, borderBottomWidth: 8 },
  cardHeader: { padding: 40, alignItems: "center" },
  statusTitle: { fontSize: 28, fontWeight: "900", color: "#ffffff", fontStyle: "italic", letterSpacing: -1 },
  statusMsg: { color: "#ffffff", opacity: 0.8, fontWeight: "bold", fontSize: 12, letterSpacing: 2, marginTop: 4, textTransform: "uppercase" },
  
  cardBody: { padding: 32 },
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 10, fontWeight: "900", color: "#9ca3af", letterSpacing: 2, marginBottom: 16 },
  
  infoBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9fafb", padding: 16, borderRadius: 24, gap: 16 },
  infoIconBox: { width: 48, height: 48, backgroundColor: "#ffffff", borderRadius: 16, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  infoLabel: { fontSize: 12, fontWeight: "bold", color: "#9ca3af" },
  infoValue: { fontSize: 18, fontWeight: "900", color: "#111827" },
  
  rowItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowTextBold: { fontWeight: "bold", color: "#374151", fontSize: 16 },
  rowText: { fontWeight: "500", color: "#6b7280", fontSize: 14 },
  
  grid: { flexDirection: "row", gap: 16 },
  gridItem: { flex: 1, backgroundColor: "#f9fafb", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "#f3f4f6" },
  rowItemSmall: { flexDirection: "row", alignItems: "center", gap: 8 },
  gridItemValue: { fontSize: 16, fontWeight: "900", color: "#1f2937" },
  
  scannedBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fee2e2", padding: 16, borderRadius: 24, gap: 12, marginTop: 16 },
  scannedText: { fontSize: 12, fontWeight: "bold", color: "#7f1d1d", flex: 1 },
  
  footerText: { textAlign: "center", marginTop: 32, color: "#9ca3af", fontSize: 12, fontWeight: "bold", letterSpacing: 2, opacity: 0.5 }
});
