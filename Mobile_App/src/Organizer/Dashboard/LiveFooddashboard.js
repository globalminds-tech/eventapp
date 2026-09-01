import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import {
  Coffee, Utensils, Pizza, Moon, Users, Store, UserPlus, ChevronDown
} from "lucide-react-native";
import { getevent } from "@Services/api";

export const LiveFoodDashboard = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [event, setEvent] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [mealType, setMealType] = useState("");

  const [data, setData] = useState({
    guests_inside: 0,
    total_capacity: 0,
    waiting_outside: 0
  });

  const fetchEvents = async () => {
    try {
      const res = await getevent();
      let extractedEvents = [];
      if (Array.isArray(res)) {
        extractedEvents = res;
      } else if (res && Array.isArray(res.data)) {
        extractedEvents = res.data;
      } else if (res && res.data && Array.isArray(res.data.data)) {
        extractedEvents = res.data.data;
      }
      setEvents(extractedEvents);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getFoodCount = async () => {
    // Mock API call to match frontend logic
    // const res = await getFoodCountAPI({ event_id: event, meal_time: mealTime, meal_type: mealType });
    // For now, simulate response based on selection to give realistic UI experience
    setData({
      guests_inside: Math.floor(Math.random() * 300),
      total_capacity: 500,
      waiting_outside: Math.floor(Math.random() * 50)
    });
  };

  useEffect(() => {
    if (event && mealTime && mealType) {
      getFoodCount();
    } else {
      setData({ guests_inside: 0, total_capacity: 0, waiting_outside: 0 });
    }
  }, [event, mealTime, mealType]);

  const mealIcon = () => {
    if (mealTime === "Breakfast") return <Coffee size={40} color="#4f46e5" />;
    if (mealTime === "Lunch") return <Utensils size={40} color="#4f46e5" />;
    if (mealTime === "Snacks") return <Pizza size={40} color="#4f46e5" />;
    if (mealTime === "Dinner") return <Moon size={40} color="#4f46e5" />;
    return <Store size={40} color="#4f46e5" />;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.title}>Live Food Count</Text>

        <View style={styles.filtersContainer}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={event}
              onValueChange={(val) => { setEvent(val); setMealTime(""); setMealType(""); }}
              style={styles.picker}
            >
              <Picker.Item label="Select Event" value="" color="#6b7280" />
              {events.map((ev) => (
                <Picker.Item key={ev.id} label={ev.event_name || ev.name} value={ev.id} />
              ))}
            </Picker>
          </View>

          <View style={[styles.pickerWrapper, !event && styles.pickerDisabled]}>
            <Picker
              selectedValue={mealTime}
              onValueChange={(val) => { setMealTime(val); setMealType(""); }}
              enabled={!!event}
              style={styles.picker}
            >
              <Picker.Item label="Select Meal Time" value="" color="#6b7280" />
              <Picker.Item label="Breakfast" value="Breakfast" />
              <Picker.Item label="Lunch" value="Lunch" />
              <Picker.Item label="Snacks" value="Snacks" />
              <Picker.Item label="Dinner" value="Dinner" />
            </Picker>
          </View>

          <View style={[styles.pickerWrapper, !mealTime && styles.pickerDisabled]}>
            <Picker
              selectedValue={mealType}
              onValueChange={(val) => setMealType(val)}
              enabled={!!mealTime}
              style={styles.picker}
            >
              <Picker.Item label="Select Meal Type" value="" color="#6b7280" />
              <Picker.Item label="Veg" value="Veg" />
              <Picker.Item label="Non Veg" value="Non Veg" />
            </Picker>
          </View>
        </View>

        <View style={styles.cardsGrid}>
          {/* Guests Inside */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Guests Inside Dining Area</Text>
            <View style={styles.iconContainer}>
              <Users size={40} color="#4f46e5" />
            </View>
            <Text style={styles.cardValue}>{data.guests_inside}</Text>
          </View>

          {/* Total Capacity */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Dining Capacity</Text>
            <View style={styles.iconContainer}>
              {mealIcon()}
            </View>
            <Text style={styles.cardValue}>{data.total_capacity}</Text>
          </View>

          {/* Waiting Outside */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Guests Waiting Outside</Text>
            <View style={styles.iconContainer}>
              <UserPlus size={40} color="#4f46e5" />
            </View>
            <Text style={styles.cardValue}>{data.waiting_outside}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContent: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 24 },
  
  filtersContainer: { gap: 16, marginBottom: 32 },
  pickerWrapper: { backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#d1d5db", overflow: "hidden" },
  pickerDisabled: { backgroundColor: "#e5e7eb" },
  picker: { height: 50, color: "#111827" },

  cardsGrid: { gap: 24 },
  card: { backgroundColor: "#ffffff", padding: 24, borderRadius: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 16, textAlign: "center" },
  iconContainer: { marginBottom: 20 },
  cardValue: { fontSize: 40, fontWeight: "800", color: "#111827" },
});

export default LiveFoodDashboard;
