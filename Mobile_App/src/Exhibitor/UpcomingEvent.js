import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MapPin, Calendar, LayoutGrid, Grid, LayoutList, List as ListIcon, Menu, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react-native";
import MediaRenderer from "../components/MediaRenderer";
import { getHomeEventshow } from "@Services/api";
import { useSelector } from "react-redux";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const UpcomingEvent = () => {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigation = useNavigation();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    fetchEvents();

    const saveUser = async () => {
      try {
        if (user?.id && user?.name) {
          await AsyncStorage.setItem("userId", String(user.id));
          await AsyncStorage.setItem("userName", user.name);
        }
      } catch(e) {}
    };
    saveUser();
  }, [user]);

  const [storedUser, setStoredUser] = useState({});
  useEffect(() => {
    const fetchUser = async () => {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("userName");
      setStoredUser({ id, name });
    }
    fetchUser();
  }, []);

  const displayUser = user?.id ? user : storedUser;

  const fetchEvents = async () => {
    try {
      const data = await getHomeEventshow();

      const formatted = data.map((e) => ({
        id: e.id,
        title: e.event_name,
        location: `${e.venue}, ${e.address}`,
        date: e.start_date,
        endDate: e.end_date,
        image: e.banner_url || "https://via.placeholder.com/400",
        banner_type: e.banner_type,
      }));

      formatted.sort((a, b) => {
        const aClosed = new Date(a.date).setHours(23, 59, 59, 999) < new Date();
        const bClosed = new Date(b.date).setHours(23, 59, 59, 999) < new Date();

        if (aClosed !== bClosed) return aClosed ? 1 : -1;
        return new Date(a.date) - new Date(b.date);
      });

      setEvents(formatted);
    } catch (err) {
      console.log("Error fetching events:", err);
    }
  };

  const handleBookStall = (event) => {
    navigation.navigate("BookStall", { eventId: event.id, event });
  };

  // Pagination Logic
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = events.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const isListView = viewMode === "list";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Header & Controls Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.userName}>{displayUser.name || "Exhibitor"} ??</Text>
            </View>
          </View>

          <View style={styles.viewModeContainer}>
            <TouchableOpacity 
              style={styles.viewModeBtn}
              onPress={() => setShowViewMenu(!showViewMenu)}
            >
              <Menu size={18} color="#f97316" />
              <Text style={styles.viewModeText}>View Mode</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showViewMenu && (
          <View style={styles.viewMenuDropdown}>
            {[
              { id: "grid", name: "Grid view", icon: LayoutGrid },
              { id: "list", name: "List view", icon: ListIcon },
            ].map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.menuItem, viewMode === mode.id && styles.menuItemActive]}
                onPress={() => { setViewMode(mode.id); setShowViewMenu(false); setCurrentPage(1); }}
              >
                <mode.icon size={18} color={viewMode === mode.id ? "#f97316" : "#94a3b8"} />
                <Text style={[styles.menuItemText, viewMode === mode.id && styles.menuItemTextActive]}>
                  {mode.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Events Container */}
        <View style={[styles.eventsContainer, !isListView && styles.eventsGrid]}>
          {currentEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#334155" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No events found for this page</Text>
            </View>
          ) : (
            currentEvents.map((event) => {
              const isClosed = new Date(event.date).setHours(23, 59, 59, 999) < new Date();
              
              return (
                <View key={event.id} style={[styles.eventCard, !isListView && styles.eventCardGrid]}>
                  
                  {/* Image Section */}
                  <View style={[styles.imageContainer, isListView ? styles.imageContainerList : styles.imageContainerGrid]}>
                    <MediaRenderer
                      src={event.image}
                      type={event.banner_type}
                      style={styles.eventImage}
                    />
                    {!isListView && (
                      <View style={styles.imageOverlay}>
                        <View style={[styles.statusBadge, isClosed ? styles.statusClosed : styles.statusOpen]}>
                          <Text style={styles.statusText}>{isClosed ? "COMPLETED" : "UPCOMING"}</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Content Section */}
                  <View style={[styles.cardContent, isListView ? styles.cardContentList : styles.cardContentGrid]}>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.eventTitle, isListView && { width: '100%' }]} numberOfLines={2}>
                        {event.title}
                      </Text>

                      <View style={styles.metaContainer}>
                        <View style={styles.metaRow}>
                          <MapPin size={14} color="#f97316" />
                          <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
                        </View>
                        <View style={styles.metaRow}>
                          <Calendar size={14} color="#f97316" />
                          <Text style={styles.metaText}>{new Date(event.date).toDateString()}</Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => !isClosed && handleBookStall(event)}
                      disabled={isClosed}
                      style={[styles.bookBtn, isClosed ? styles.bookBtnClosed : styles.bookBtnOpen, isListView && styles.bookBtnList]}
                    >
                      <Text style={[styles.bookBtnText, isClosed && styles.bookBtnTextClosed]}>
                        {isClosed ? "Booking Closed" : "Book Stall"}
                      </Text>
                      {!isClosed && <ArrowRight size={14} color="#fff" />}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity 
              style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]} 
              onPress={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} color={currentPage === 1 ? "#334155" : "#fff"} />
            </TouchableOpacity>

            <View style={styles.pageNumbers}>
              {[...Array(totalPages)].map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.pageNumberBtn, currentPage === i + 1 && styles.pageNumberBtnActive]}
                  onPress={() => paginate(i + 1)}
                >
                  <Text style={[styles.pageNumberText, currentPage === i + 1 && styles.pageNumberTextActive]}>
                    {i + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]} 
              onPress={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={20} color={currentPage === totalPages ? "#334155" : "#fff"} />
            </TouchableOpacity>
          </View>
        )}
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  header: { marginBottom: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { padding: 8, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, marginRight: 16 },
  welcomeContainer: { flex: 1 },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#f97316' }, // Simplified gradient
  
  viewModeContainer: { alignItems: 'flex-end', zIndex: 100 },
  viewModeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16 },
  viewModeText: { fontSize: 12, fontWeight: 'bold', color: '#cbd5e1' },
  
  viewMenuDropdown: { position: 'absolute', top: 110, right: 0, width: 160, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16, paddingVertical: 8, zIndex: 101 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  menuItemActive: { backgroundColor: 'rgba(249,115,22,0.1)' },
  menuItemText: { fontSize: 12, color: '#94a3b8' },
  menuItemTextActive: { color: '#f97316', fontWeight: 'bold' },
  
  eventsContainer: { gap: 16 },
  eventsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  emptyState: { paddingVertical: 60, alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.5)', borderRadius: 24, borderWidth: 1, borderColor: '#1e293b', borderStyle: 'dashed' },
  emptyIcon: { marginBottom: 16, opacity: 0.5 },
  emptyText: { color: '#64748b', fontWeight: '500' },
  
  eventCard: { backgroundColor: 'rgba(15,23,42,0.4)', borderRadius: 24, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' },
  eventCardGrid: { width: (width - 48) / 2, marginBottom: 16 },
  
  imageContainer: { overflow: 'hidden' },
  imageContainerList: { width: '100%', height: 160 },
  imageContainerGrid: { width: '100%', height: 120 },
  eventImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2,6,23,0.3)' },
  statusBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusOpen: { backgroundColor: '#f97316' },
  statusClosed: { backgroundColor: '#334155' },
  statusText: { fontSize: 8, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  
  cardContent: { padding: 16 },
  cardContentList: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' },
  cardContentGrid: { flexDirection: 'column' },
  
  cardInfo: { flex: 1, minWidth: '60%' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 12 },
  metaContainer: { gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 12, color: '#94a3b8', flex: 1 },
  
  bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginTop: 16 },
  bookBtnList: { marginTop: 0, width: 'auto' },
  bookBtnOpen: { backgroundColor: '#f97316' },
  bookBtnClosed: { backgroundColor: 'rgba(30,41,59,0.5)', borderWidth: 1, borderColor: 'rgba(51,65,85,0.5)' },
  bookBtnText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  bookBtnTextClosed: { color: '#64748b' },
  
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 40 },
  pageBtn: { padding: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12 },
  pageBtnDisabled: { opacity: 0.5 },
  pageNumbers: { flexDirection: 'row', gap: 8 },
  pageNumberBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b' },
  pageNumberBtnActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  pageNumberText: { color: '#64748b', fontWeight: 'bold' },
  pageNumberTextActive: { color: '#fff' },
});

export default UpcomingEvent;
