import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, 
  KeyboardAvoidingView, Platform, Modal 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Send, MessageCircle } from "lucide-react-native";
import { chatWithBot } from "@Services/api";

// --- Event data (mirrors DB) --------------------------------------------------
const EVENTS = [
  {
    id: 1, code: "EVT-0001", name: "AR Rahman Concert 2025",
    category: "Music", date: "Apr 4, 2026", startTime: "5:15 PM", endTime: "11:00 PM",
    venue: "YMCA", address: "Chennai, Tamil Nadu", amenities: "Non-stop music",
    visibility: "Public", capacity: "50,000", pass: "Single Pass",
    entry: "Multi Entry", charge: "Free", bookingStart: "Mar 31, 2026",
    bookingEnd: "Apr 4, 2026", maxPass: 3, currency: null,
  },
  {
    id: 2, code: "EVT-0002", name: "Anna University Basketball Tournament",
    category: "Education", date: "Apr 4, 2026", startTime: "4:00 PM", endTime: "8:00 PM",
    venue: "YMCA", address: "Chennai, Tamil Nadu",
    amenities: "Food, Drinks, Sports, Entertainment",
    visibility: "Public", capacity: "2,000", pass: "Group Pass",
    entry: "Multi Entry", charge: "Paid", bookingStart: "Apr 2, 2026",
    bookingEnd: "Apr 4, 2026", maxPass: 4, currency: "INR (?)",
  },
  {
    id: 3, code: "EVT-0003", name: "Technical Symposium",
    category: "Technology", date: "Apr 11, 2026", startTime: "11:00 AM", endTime: "6:00 PM",
    venue: "YMCA", address: "Chennai, Tamil Nadu",
    amenities: "Lectures, New technologies",
    visibility: "Public", capacity: "500", pass: "Group Pass",
    entry: "Multi Entry", charge: "Free", bookingStart: "Apr 9, 2026",
    bookingEnd: "Apr 10, 2026", maxPass: null, currency: null,
  },
  {
    id: 4, code: "EVT-0004", name: "Honda CAR EXPO",
    category: "Business", date: "Apr 25, 2026", startTime: "10:00 AM", endTime: "5:00 PM",
    venue: "YMCA", address: "Chennai, Tamil Nadu",
    amenities: "Car exhibition, Music, New innovations",
    visibility: "Public", capacity: "400", pass: "Group Pass",
    entry: "Multi Entry", charge: "Free", bookingStart: "Apr 15, 2026",
    bookingEnd: "Apr 24, 2026", maxPass: 3, currency: null,
  },
];

// --- Smart local response engine ---------------------------------------------
function buildResponse(msg) {
  const m = msg.toLowerCase();
  const matches = (keywords) => keywords.some((k) => m.includes(k));

  if (matches(["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy"]))
    return { text: "Hello! ?? I'm EventBot. I can help you find events, check tickets, venues, schedules, and more. What are you looking for today?", cards: [] };

  if (matches(["thank", "thanks", "great", "awesome", "perfect"]))
    return { text: "You're welcome! ?? Is there anything else I can help you with?", cards: [] };

  if (matches(["bye", "goodbye", "see you", "exit"]))
    return { text: "Goodbye! ?? Come back anytime to explore events. Have a great day!", cards: [] };

  if (matches(["help", "what can you", "what do you", "capabilities"]))
    return {
      text: "Here's what I can help you with:",
      cards: [],
      list: ["?? Upcoming & past events", "?? Ticket types & pricing (free/paid)", "?? Venue & address details", "?? Event capacity", "? Schedules & timings", "?? Categories (Music, Tech, Business, Education)", "? Amenities & facilities", "?? Pass types & booking dates", "?? Public / Private events"],
    };

  if (matches(["concert", "rahman", "ar rahman", "music event"]))
    return { text: "Here's the detail for the AR Rahman Concert:", cards: [EVENTS[0]], detail: true };

  if (matches(["basketball", "tournament", "anna university", "sports"]))
    return { text: "Here's the detail for the Basketball Tournament:", cards: [EVENTS[1]], detail: true };

  if (matches(["symposium", "technical", "tech event"]))
    return { text: "Here's the detail for the Technical Symposium:", cards: [EVENTS[2]], detail: true };

  if (matches(["car expo", "honda", "expo", "car show", "automobile"]))
    return { text: "Here's the detail for the Honda CAR EXPO:", cards: [EVENTS[3]], detail: true };

  if (matches(["all event", "list event", "every event", "show event", "total event", "how many event"]))
    return { text: `We have **${EVENTS.length} approved events** coming up:`, cards: EVENTS };

  if (m.includes("upcoming"))
    return { text: "Here are all upcoming events:", cards: EVENTS };

  if (matches(["previous", "past", "completed", "finished"]))
    return { text: "There are no past events on record. All current events are upcoming.", cards: [] };

  if (matches(["free event", "free entry", "no charge", "no cost", "which are free", "free to attend"])) {
    const free = EVENTS.filter((e) => e.charge === "Free");
    return { text: `${free.length} events have free entry:`, cards: free };
  }

  if (matches(["paid", "cost", "price", "fee", "charge", "how much", "ticket price", "ticket cost"])) {
    return { text: "Here are the pricing details for all events:", cards: EVENTS, showField: "pricing" };
  }

  if (m.includes("capacity") || m.includes("how many people") || m.includes("seats"))
    return { text: "Here are the capacity details:", cards: EVENTS, showField: "capacity" };

  if (matches(["venue", "location", "place", "where", "address", "street", "how to reach"]))
    return { text: "All events are held at:", cards: EVENTS, showField: "venue" };

  if (matches(["time", "timing", "schedule", "when", "start time", "end time"]))
    return { text: "Here are the event schedules:", cards: EVENTS, showField: "timing" };

  if (matches(["booking", "book", "register", "registration", "booking date", "booking start", "booking end"]))
    return { text: "Here are the booking windows:", cards: EVENTS, showField: "booking" };

  if (matches(["category", "categories", "type of event", "event type"])) {
    const cats = [...new Set(EVENTS.map((e) => e.category))];
    return { text: `We have events in ${cats.length} categories: **${cats.join(", ")}**`, cards: EVENTS, showField: "category" };
  }

  const cat = ["music", "education", "technology", "business"].find((c) => m.includes(c));
  if (cat) {
    const filtered = EVENTS.filter((e) => e.category.toLowerCase() === cat);
    return { text: `Events in the **${cat.charAt(0).toUpperCase() + cat.slice(1)}** category:`, cards: filtered };
  }

  if (matches(["amenity", "amenities", "facilities", "what's included", "whats included"]))
    return { text: "Here are the amenities for each event:", cards: EVENTS, showField: "amenities" };

  if (matches(["pass", "pass type", "single pass", "group pass"]))
    return { text: "Here are the pass types available:", cards: EVENTS, showField: "pass" };

  if (matches(["public event", "private event", "visibility", "open to all"]))
    return { text: "Here's the visibility for each event:", cards: EVENTS, showField: "visibility" };

  if (matches(["how many", "count", "number of"]))
    return { text: `There are currently **${EVENTS.length} approved events** in the system. Would you like me to list them all?`, cards: [] };

  return {
    text: "I'm not sure I understood that. Try asking about:",
    cards: [],
    list: ["Upcoming events", "Ticket prices or free events", "Event timings", "Venue locations", "Capacity details", "Pass types"],
  };
}

// --- EventCard component ------------------------------------------------------
function EventCard({ ev, showField }) {
  const isFree = ev.charge === "Free";

  const Tag = ({ bg, color, border, text }) => (
    <View style={[styles.tag, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.tagText, { color: color }]}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.eventCard}>
      <Text style={styles.eventCardTitle}>?? {ev.name}</Text>
      <View style={styles.tagRow}>
        {(!showField || showField === "category") && <Tag bg="#EAF3DE" color="#3B6D11" border="#C0DD97" text={`?? ${ev.category}`} />}
        {(!showField || showField === "timing") && (
          <>
            <Tag bg="#E6F1FB" color="#185FA5" border="#B5D4F4" text={`?? ${ev.date}`} />
            <Tag bg="#E6F1FB" color="#185FA5" border="#B5D4F4" text={`? ${ev.startTime} – ${ev.endTime}`} />
          </>
        )}
        {(!showField || showField === "venue") && (
          <>
            <Tag bg="#EEEDFE" color="#533AB7" border="#AFA9EC" text={`?? ${ev.venue}`} />
            <Tag bg="#EEEDFE" color="#533AB7" border="#AFA9EC" text={`?? ${ev.address}`} />
          </>
        )}
        {(!showField || showField === "pricing") && (
          <Tag 
            bg={isFree ? "#EAF3DE" : "#FAECE7"} 
            color={isFree ? "#3B6D11" : "#993C1D"} 
            border={isFree ? "#C0DD97" : "#F0997B"} 
            text={isFree ? "? Free entry" : `?? Paid · ${ev.currency}`} 
          />
        )}
        {(!showField || showField === "capacity") && <Tag bg="#FAEEDA" color="#854F0B" border="#FAC775" text={`?? Capacity: ${ev.capacity}`} />}
        {(!showField || showField === "pass") && <Tag bg="#FBEAF0" color="#993556" border="#F4C0D1" text={`?? ${ev.pass}`} />}
        {(!showField || showField === "amenities") && <Tag bg="#F1EFE8" color="#5F5E5A" border="#D3D1C7" text={`? ${ev.amenities}`} />}
        {(!showField || showField === "booking") && (
          <>
            <Tag bg="#EAF3DE" color="#3B6D11" border="#C0DD97" text={`?? Opens: ${ev.bookingStart}`} />
            <Tag bg="#FAECE7" color="#993C1D" border="#F0997B" text={`?? Closes: ${ev.bookingEnd}`} />
          </>
        )}
        {(!showField || showField === "visibility") && <Tag bg="#E6F1FB" color="#185FA5" border="#B5D4F4" text={`?? ${ev.visibility}`} />}
        {showField === undefined && (
          <Tag 
            bg={isFree ? "#EAF3DE" : "#FAECE7"} 
            color={isFree ? "#3B6D11" : "#993C1D"} 
            border={isFree ? "#C0DD97" : "#F0997B"} 
            text={isFree ? "? Free" : "?? Paid"} 
          />
        )}
      </View>
      {showField === "detail" && (
        <View style={styles.detailBox}>
          <Text style={styles.detailText}>?? Capacity: {ev.capacity}  |  ?? {ev.pass}  |  ?? {ev.entry}</Text>
          {ev.maxPass && <Text style={styles.detailText}>?? Max passes per person: {ev.maxPass}</Text>}
          <Text style={styles.detailText}>? {ev.amenities}</Text>
        </View>
      )}
    </View>
  );
}

// --- Message renderer ---------------------------------------------------------
function MessageContent({ content, role }) {
  if (!content) return null;
  const { text, cards, list, showField } = content;
  const textColor = role === "bot" ? "#1a1a1a" : "#ffffff";

  const renderText = (t) =>
    t.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith("**") ? (
        <Text key={i} style={{ fontWeight: "bold", color: textColor }}>{part.slice(2, -2)}</Text>
      ) : (
        <Text key={i} style={{ color: textColor }}>{part}</Text>
      )
    );

  return (
    <View>
      <Text style={{ fontSize: 13.5, lineHeight: 22, color: textColor }}>{renderText(text)}</Text>
      {list && list.length > 0 && (
        <View style={{ marginTop: 8, paddingLeft: 8 }}>
          {list.map((item, i) => (
            <Text key={i} style={{ fontSize: 13, lineHeight: 22, color: textColor }}>• {item}</Text>
          ))}
        </View>
      )}
      {cards && cards.map((ev) => (
        <EventCard key={ev.id} ev={ev} showField={showField} />
      ))}
    </View>
  );
}

// --- QUICK SUGGESTIONS -------------------------------------------------------
const QUICK_SUGGESTIONS = [
  "Upcoming events", "Free events", "Event timings", "Ticket prices",
  "Venue locations", "Event capacity", "Pass types", "All categories",
];

// --- MAIN CHATBOT COMPONENT ---------------------------------------------------
export default function Chatbot({ userId = null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1, role: "bot",
      content: {
        text: "?? Hi! I'm EventBot — your smart event assistant. I can help you explore events, check tickets, venues, timings, and more!",
        cards: [],
        list: ["Try: 'Show all upcoming events'", "Try: 'Which events are free?'", "Try: 'What are the timings?'"],
      },
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
    }
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");

    const userMsg = { id: Date.now(), role: "user", content: { text: msg, cards: [] }, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    
    // Auto scroll down
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    let botContent;

    try {
      const data = await chatWithBot(msg, userId);
      if (data && data.reply) {
        botContent = { text: data.reply, cards: [] };
      }
    } catch (_) {
      // Fallback
    }

    if (!botContent) {
      botContent = buildResponse(msg);
    }

    setTyping(false);
    const botMsg = { id: Date.now() + 1, role: "bot", content: botContent, time: new Date() };
    setMessages((prev) => [...prev, botMsg]);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    if (!open) setUnread((n) => n + 1);
  }, [input, userId, open]);

  const fmtTime = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => { setOpen(true); setUnread(0); }}
        activeOpacity={0.8}
      >
        <MessageCircle color="#fff" size={24} />
        {!open && unread > 0 && (
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{unread}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent={true} onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            style={styles.window} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerAvatar}>
                <Text style={{ fontSize: 20 }}>??</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>EventBot Assistant</Text>
                <View style={styles.headerStatusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.headerStatus}>Online · Assistant</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
                <X color="#fff" size={18} />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.messages} 
              contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg) => (
                <View key={msg.id} style={styles.msgWrapper}>
                  <View style={[styles.msgRow, msg.role === "user" ? styles.msgRowUser : styles.msgRowBot]}>
                    <View style={[styles.avatar, msg.role === "bot" ? styles.avatarBot : styles.avatarUser]}>
                      <Text style={[styles.avatarText, { color: msg.role === "bot" ? "#fff" : "#4B70F5" }]}>
                        {msg.role === "bot" ? "??" : "U"}
                      </Text>
                    </View>
                    <View style={[styles.bubble, msg.role === "bot" ? styles.bubbleBot : styles.bubbleUser]}>
                      <MessageContent content={msg.content} role={msg.role} />
                    </View>
                  </View>
                  <Text style={[styles.timestamp, msg.role === "user" ? styles.timestampUser : styles.timestampBot]}>
                    {fmtTime(msg.time)}
                  </Text>
                </View>
              ))}

              {typing && (
                <View style={[styles.msgRow, styles.msgRowBot, { marginTop: 12 }]}>
                  <View style={[styles.avatar, styles.avatarBot]}>
                    <Text style={styles.avatarText}>??</Text>
                  </View>
                  <View style={styles.typingBubble}>
                    <Text style={{ fontSize: 12, color: "#666" }}>Typing...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Quick Suggestions */}
            <View style={styles.suggestionsWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions} keyboardShouldPersistTaps="handled">
                {QUICK_SUGGESTIONS.map((s) => (
                  <TouchableOpacity key={s} style={styles.sugBtn} onPress={() => sendMessage(s)}>
                    <Text style={styles.sugBtnText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Input */}
            <View style={styles.inputArea}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask about events, tickets, venues…"
                placeholderTextColor="#94a3b8"
                onSubmitEditing={() => sendMessage()}
                returnKeyType="send"
              />
              <TouchableOpacity 
                style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
                onPress={() => sendMessage()}
                disabled={!input.trim()}
              >
                <Send size={16} color={!input.trim() ? "#94a3b8" : "#fff"} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4B70F5",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#4B70F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 9999,
  },
  fabBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E24B4A",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  fabBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  
  // Modal window
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  window: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    overflow: "hidden",
  },

  // Header
  header: {
    backgroundColor: "#4B70F5",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  headerStatusContainer: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#A8FFDC" },
  headerStatus: { fontSize: 12, color: "rgba(255,255,255,0.85)" },
  closeBtn: { padding: 8, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 8 },

  // Messages
  messages: { flex: 1, backgroundColor: "#F7F9FB" },
  msgWrapper: { marginBottom: 16 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowUser: { flexDirection: "row-reverse" },
  msgRowBot: { flexDirection: "row" },
  
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarBot: { backgroundColor: "#4B70F5" },
  avatarUser: { backgroundColor: "#E4E9FF" },
  avatarText: { fontSize: 11, fontWeight: "bold" },
  
  bubble: { maxWidth: "82%", padding: 12 },
  bubbleBot: {
    borderTopLeftRadius: 4, borderTopRightRadius: 16, borderBottomRightRadius: 16, borderBottomLeftRadius: 16,
    backgroundColor: "#ffffff", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  bubbleUser: {
    borderTopLeftRadius: 16, borderTopRightRadius: 4, borderBottomRightRadius: 16, borderBottomLeftRadius: 16,
    backgroundColor: "#4B70F5", shadowColor: "#4B70F5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 2,
  },
  
  timestamp: { fontSize: 10, color: "#aaa", marginTop: 4 },
  timestampUser: { textAlign: "right", paddingRight: 36 },
  timestampBot: { textAlign: "left", paddingLeft: 36 },
  
  typingBubble: { padding: 12, backgroundColor: "#fff", borderRadius: 16, borderTopLeftRadius: 4 },

  // Suggestions
  suggestionsWrapper: { borderTopWidth: 1, borderTopColor: "#eef0f3", backgroundColor: "#fff" },
  suggestions: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  sugBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#FFF5F0", borderWidth: 1, borderColor: "#FFD8C2", borderRadius: 20 },
  sugBtnText: { fontSize: 12, color: "#E65100" },

  // Input area
  inputArea: {
    flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#fff",
    borderTopWidth: 1, borderTopColor: "#eef0f3",
  },
  input: {
    flex: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, backgroundColor: "#F7F9FB",
    borderWidth: 1, borderColor: "#e0e5ea", borderRadius: 24, color: "#1a1a1a", marginRight: 8,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#4B70F5", alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: "#f1f5f9" },

  // Event Card Internal
  eventCard: { backgroundColor: "#F9FAFF", borderWidth: 1, borderColor: "#E4E9FF", borderRadius: 12, padding: 12, marginTop: 8 },
  eventCardTitle: { fontSize: 13, fontWeight: "bold", color: "#3563E9", marginBottom: 6 },
  tagRow: { flexDirection: "row", flexWrap: "wrap" },
  tag: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginRight: 4, marginBottom: 4 },
  tagText: { fontSize: 11, fontWeight: "500" },
  detailBox: { marginTop: 8 },
  detailText: { fontSize: 12, color: "#666", marginBottom: 2 },
});
