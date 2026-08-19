import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getevent } from "@Services/api";
import {
  Coffee, Utensils, Pizza, Moon,
  Users, Store, UserPlus, ChevronDown
} from "lucide-react-native";

const MEAL_TIMES = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const MEAL_TYPES = ["Veg", "Non Veg"];

const SelectPicker = ({ label, value, options, onSelect, disabled }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={[pickerStyles.wrapper, disabled && pickerStyles.disabled]}>
      <Text style={pickerStyles.label}>{label}</Text>
      <TouchableOpacity
        style={pickerStyles.trigger}
        onPress={() => !disabled && setOpen(!open)}
        disabled={disabled}
      >
        <Text style={[pickerStyles.triggerText, !value && { color: "#94a3b8" }]}>
          {value || `Select ${label}`}
        </Text>
        <ChevronDown size={16} color="#64748b" />
      </TouchableOpacity>
      {open && (
        <View style={pickerStyles.dropdown}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={pickerStyles.option}
              onPress={() => { onSelect(opt); setOpen(false); }}
            >
              <Text style={[pickerStyles.optionText, value === opt && { color: "#2563eb", fontWeight: "bold" }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export const LiveFoodDashboard = () => {
  const [events, setEvents] = useState([]);
  const [event, setEvent] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [mealType, setMealType] = useState("");
  const [data, setData] = useState({
    guests_inside: 0,
    total_capacity: 0,
    waiting_outside: 0,
  });

  const getEvents = async () => {
    try {
      const res = await getevent();
      setEvents(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { getEvents(); }, []);

  useEffect(() => {
    if (event && mealTime && mealType) {
      // getFoodCount would be called here when API is ready
      // getFoodCount({ event_id: event, meal_time: mealTime, meal_type: mealType });
    }
  }, [event, mealTime, mealType]);

  const MealIcon = () => {
    const props = { size: 56, color: "#4f46e5" };
    if (mealTime === "Breakfast") return <Coffee {...props} />;
    if (mealTime === "Lunch")     return <Utensils {...props} />;
    if (mealTime === "Snacks")    return <Pizza {...props} />;
    if (mealTime === "Dinner")    return <Moon {...props} />;
    return <Store {...props} />;
  };

  const statCards = [
    { title: "Guests Inside Dining Area", value: data.guests_inside, icon: <Users size={40} color="#4f46e5" /> },
    { title: "Total Dining Capacity",     value: data.total_capacity, icon: <MealIcon /> },
    { title: "Guests Waiting Outside",    value: data.waiting_outside, icon: <UserPlus size={40} color="#4f46e5" /> },
  ];

  const eventOptions = events.map(e => e.event_name);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Live Food Count</Text>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <SelectPicker
            label="Event"
            value={events.find(e => e.id == event)?.event_name || ""}
            options={eventOptions}
            onSelect={(name) => {
              const found = events.find(e => e.event_name === name);
              setEvent(found?.id || "");
              setMealTime(""); setMealType("");
            }}
          />
          <SelectPicker
            label="Meal Time"
            value={mealTime}
            options={MEAL_TIMES}
            onSelect={(val) => { setMealTime(val); setMealType(""); }}
            disabled={!event}
          />
          <SelectPicker
            label="Meal Type"
            value={mealType}
            options={MEAL_TYPES}
            onSelect={setMealType}
            disabled={!mealTime}
          />
        </View>

        {/* Stat Cards */}
        {statCards.map((card) => (
          <View key={card.title} style={styles.statCard}>
            <Text style={styles.statCardTitle}>{card.title}</Text>
            <View style={styles.statCardIcon}>{card.icon}</View>
            <Text style={styles.statCardValue}>{card.value}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#0f172a", marginBottom: 20 },
  filtersContainer: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 16, marginBottom: 20, gap: 12 },
  statCard: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 20, marginBottom: 14, alignItems: "center" },
  statCardTitle: { fontSize: 15, fontWeight: "600", color: "#334155", marginBottom: 16, textAlign: "center" },
  statCardIcon: { marginBottom: 16 },
  statCardValue: { fontSize: 48, fontWeight: "bold", color: "#0f172a" },
});

const pickerStyles = StyleSheet.create({
  wrapper: { position: "relative", zIndex: 10 },
  disabled: { opacity: 0.5 },
  label: { fontSize: 11, fontWeight: "bold", color: "#64748b", marginBottom: 4, textTransform: "uppercase" },
  trigger: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  triggerText: { fontSize: 14, color: "#0f172a", fontWeight: "500" },
  dropdown: { position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, zIndex: 999 },
  option: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  optionText: { fontSize: 14, color: "#334155" },
});

export default LiveFoodDashboard;
