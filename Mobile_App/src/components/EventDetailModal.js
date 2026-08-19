import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, TextInput, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  X, MapPin, Phone, Globe, ChevronLeft, Facebook, Twitter, Linkedin,
  Layers, Star as StarIcon
} from "lucide-react-native";
import MediaRenderer from "./MediaRenderer";
import OrganizerDetailCard from "./OrganizerDetailCard";

const formatDateLong = (dateString) => {
  if (!dateString) return "-";
  const parts = dateString.split(" ");
  if (parts.length >= 4) {
    return parts.slice(0, 4).join(" ");
  }
  return dateString;
};

const EventDetailModal = ({ selectedEventId, fullData, closeModal, visible = true }) => {
  const navigation = useNavigation();
  const [currentTab, setCurrentTab] = useState('about');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [masterPolicies, setMasterPolicies] = useState([]);

  useEffect(() => {
    if (fullData?.eventDetails?.user_id || fullData?.eventDetails?.created_by) {
      import("@Services/api").then(({ getPolicies }) => {
        if(getPolicies) {
          getPolicies(fullData?.eventDetails?.user_id).then(res => {
            setMasterPolicies(res.data || []);
          }).catch(err => console.error("Failed to fetch master policies", err));
        }
      }).catch(err => console.log("API not imported", err));
    }
  }, [fullData?.eventDetails?.user_id]);

  const getTermDescription = (term) => {
    const existingDesc = term.description || term.policy_description || term.policy_desc;
    if (existingDesc) return existingDesc;

    const matched = masterPolicies.find(p =>
      (p.policy_name === term.policyName || p.policy_name === term.policy_name) &&
      (p.policy_group === term.policyGroup || p.policy_group === term.policy_group)
    );
    return matched?.description || "";
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  if (!selectedEventId || !fullData) return null;

  const handleBookNow = () => {
    if (closeModal) closeModal();
    navigation.navigate("UsersBooking", { eventId: selectedEventId });
  };

  const tabs = [
    { id: 'about', label: 'ABOUT' },
    { id: 'amenities', label: 'AMENITIES' },
    { id: 'gallery', label: 'GALLERY' },
    { id: 'tnc', label: 'T & C' },
    { id: 'reviews', label: 'REVIEWS' },
    { id: 'pricing', label: 'PRICING' }
  ];

  const capacity = parseInt(fullData?.booking?.capacity) || 0;
  const registered = parseInt(fullData?.booking?.registered) || 0;
  const isFull = capacity > 0 && registered >= capacity;
  const isPast = new Date(fullData?.eventDetails?.end_date) < new Date().setHours(0, 0, 0, 0);
  const isClosed = isFull || isPast;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={closeModal}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          
          {/* Header Buttons */}
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              closeModal();
              navigation.navigate("Home");
            }}
          >
            <ChevronLeft size={16} color="#fff" />
            <Text style={styles.homeButtonText}>HOME</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <X size={20} color="#fff" />
          </TouchableOpacity>

          {/* Banner */}
          <View style={styles.bannerContainer}>
            {fullData?.eventDetails?.banner_url ? (
              <MediaRenderer
                src={fullData.eventDetails.banner_url}
                type={fullData.eventDetails.banner_type}
                style={styles.bannerImage}
              />
            ) : (
              <View style={styles.bannerFallback} />
            )}
            <View style={styles.bannerOverlay} />

            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{fullData?.eventDetails?.event_name}</Text>
              
              <View style={styles.breadcrumb}>
                <Text style={styles.breadcrumbText}>HOME</Text>
                <Text style={styles.breadcrumbSeparator}> &gt; </Text>
                <Text style={styles.breadcrumbText}>{fullData?.eventDetails?.category || "EXPO"}</Text>
                <Text style={styles.breadcrumbSeparator}> &gt; </Text>
                <Text style={styles.breadcrumbCurrent}>{fullData?.eventDetails?.event_name}</Text>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>3</Text>
                  <Text style={styles.statLabel}>EVENTS HOSTED</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>FOLLOWERS</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>REVIEWS</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Venue Info */}
          <View style={styles.venueBar}>
            <View style={styles.venueItem}>
              <MapPin size={18} color="#3b82f6" style={styles.venueIcon} />
              <Text style={styles.venueTitle}>{fullData?.eventDetails?.venue}</Text>
              <Text style={styles.venueSubtitle}>{fullData?.eventDetails?.address || "Location unavailable"}</Text>
            </View>
            <View style={styles.venueItem}>
              <Phone size={18} color="#3b82f6" style={styles.venueIcon} />
              <Text style={styles.venueTitle}>{fullData?.organizer?.phone || "-"}</Text>
              <Text style={styles.venueSubtitle}>Organiser Phone</Text>
            </View>
            <View style={[styles.venueItem, styles.venueItemNoBorder]}>
              <Globe size={18} color="#3b82f6" style={styles.venueIcon} />
              <Text style={styles.enquiryText}>For Enquiries:</Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://sportalytics.in/')}>
                <Text style={styles.linkText}>https://sportalytics.in/</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent} keyboardShouldPersistTaps="handled">
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabButton, currentTab === tab.id && styles.activeTabButton]}
                  onPress={() => setCurrentTab(tab.id)}
                >
                  <Text style={[styles.tabButtonText, currentTab === tab.id && styles.activeTabButtonText]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Main Content & Sidebar */}
          <View style={styles.mainContentArea}>
            
            {/* Left Content */}
            <View style={styles.leftContent}>
              <View style={styles.card}>
                
                {currentTab === 'about' && (
                  <View>
                    <Text style={styles.sectionTitle}>ABOUT THE EVENT</Text>
                    <Text style={styles.descriptionText}>
                      {fullData?.eventDetails?.description || "Step into a world where a single thread and a simple hook transform into breathtaking art. 'Stitches & Stories' is a celebration of crochet, showcasing the intricate beauty, boundless creativity, and rich heritage of this time-honored craft."}
                    </Text>

                    <View style={styles.tagsContainer}>
                      <Text style={styles.tagsLabel}>Tags :</Text>
                      <View style={styles.tagsList}>
                        {fullData?.eventDetails?.tags ? (
                          (Array.isArray(fullData.eventDetails.tags)
                            ? fullData.eventDetails.tags
                            : fullData.eventDetails.tags.split(',')
                          ).map((tag, i) => (
                            <View key={i} style={styles.tagBadge}>
                              <Text style={styles.tagText}>{tag.trim()}</Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.noTagsText}>No tags</Text>
                        )}
                      </View>
                    </View>

                    {fullData?.guests?.length > 0 && (
                      <View style={styles.guestsContainer}>
                        <Text style={styles.guestsTitle}>SPECIAL GUESTS</Text>
                        <View style={styles.guestsGrid}>
                          {fullData.guests.map((guest, i) => (
                            <View key={i} style={styles.guestCard}>
                              {(guest.image_url || guest.image) ? (
                                <Image source={{ uri: guest.image_url || guest.image }} style={styles.guestImage} />
                              ) : (
                                <View style={styles.guestAvatarPlaceholder}>
                                  <Text style={styles.guestAvatarText}>{guest.guest_name ? guest.guest_name.charAt(0).toUpperCase() : '??'}</Text>
                                </View>
                              )}
                              <View style={styles.guestInfo}>
                                <Text style={styles.guestName}>{guest.guest_name}</Text>
                                <Text style={styles.guestRole}>{guest.designation}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {currentTab === 'pricing' && (
                  <View>
                    <Text style={styles.sectionTitle}>REGISTRATION PRICING DETAILS</Text>
                    <Text style={styles.pricingSubtitle}>National Pricing</Text>
                    <View style={styles.tableContainer}>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 2 }]}>Price Category</Text>
                        <Text style={[styles.tableCell, styles.tableHeaderCell]}>Till</Text>
                        <Text style={[styles.tableCell, styles.tableHeaderCell]}>Till On Spot</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.tableCellBold, { flex: 2 }]}>Visitors</Text>
                        <Text style={styles.tableCell}>?{fullData?.eventDetails?.pass_fee || "0.00"}</Text>
                        <Text style={styles.tableCell}>?{fullData?.eventDetails?.pass_fee || "0.00"}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {currentTab === 'gallery' && (
                  <View>
                    <Text style={styles.sectionTitle}>GALLERY</Text>
                    <View style={styles.galleryContainer}>
                      <View style={styles.galleryImageWrapper}>
                        <MediaRenderer
                          src={fullData?.eventDetails?.banner_url}
                          type={fullData?.eventDetails?.banner_type}
                          style={styles.galleryImage}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {currentTab === 'tnc' && (
                  <View>
                    <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
                    <View style={styles.tncList}>
                      {fullData?.terms?.length > 0 ? (
                        fullData.terms.map((term, i) => (
                          <View key={i} style={styles.tncCard}>
                            <Text style={styles.tncTitle}>{term.policyName || term.policy_name || term.policyGroup || term.policy_group || "Policy"}</Text>
                            <View style={styles.tncMeta}>
                              <Text style={styles.tncMetaText}>{term.policyGroup || term.policy_group}</Text>
                              <Text style={styles.tncMetaSeparator}>•</Text>
                              <Text style={[styles.tncMetaText, { color: '#2563eb' }]}>{term.policyType || term.policy_type}</Text>
                              {(term.isDefault || term.is_default) && (
                                <View style={styles.defaultBadge}>
                                  <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.tncDescription}>
                              {stripHtml(getTermDescription(term))}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noDataText}>Standard terms and conditions apply to this event.</Text>
                      )}
                    </View>
                  </View>
                )}

                {currentTab === 'amenities' && (
                  <View>
                    {fullData?.eventDetails?.amenities && (
                      <View style={styles.amenitiesSection}>
                        <Text style={styles.sectionTitle}>EVENT AMENITIES DESCRIPTION</Text>
                        <Text style={styles.descriptionText}>
                          {Array.isArray(fullData.eventDetails.amenities) ? fullData.eventDetails.amenities.join(', ') : fullData.eventDetails.amenities}
                        </Text>
                      </View>
                    )}

                    {(fullData?.layout?.amenities?.length > 0 || fullData?.amenities?.length > 0 || fullData?.layout?.master?.amenities?.length > 0) && (
                      <View style={styles.amenitiesSection}>
                        <Text style={styles.sectionTitle}>AMENITIES</Text>
                        <View style={styles.amenitiesGrid}>
                          {(fullData?.layout?.amenities || fullData?.amenities || fullData?.layout?.master?.amenities || []).map((amenity, i) => (
                            <View key={i} style={styles.amenityCard}>
                              <View>
                                <Text style={styles.amenityName}>{amenity.amenity}</Text>
                                <Text style={styles.amenityStall}>Stall: {amenity.stallName || amenity.stall_name || "N/A"}</Text>
                              </View>
                              <View style={styles.amenityRight}>
                                {amenity.qty && (
                                  <View style={styles.qtyBadge}><Text style={styles.qtyText}>Qty: {amenity.qty}</Text></View>
                                )}
                                {amenity.cost_inr && (
                                  <Text style={styles.amenityPrice}>?{amenity.cost_inr}</Text>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {(!(fullData?.layout?.stalls?.length > 0 || fullData?.stalls?.length > 0) &&
                      !(fullData?.layout?.amenities?.length > 0 || fullData?.amenities?.length > 0 || fullData?.layout?.master?.amenities?.length > 0)) && (
                        <View style={styles.emptyState}>
                          <Layers size={40} color="#cbd5e1" />
                          <Text style={styles.emptyStateText}>No amenities or stalls listed</Text>
                        </View>
                    )}
                  </View>
                )}

                {currentTab === 'reviews' && (
                  <View>
                    <Text style={styles.sectionTitle}>REVIEWS</Text>
                    <View style={styles.reviewsSummary}>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} size={20} fill="#facc15" color="#facc15" />)}
                        <Text style={styles.reviewsCountText}>(120 Reviews)</Text>
                      </View>
                      <View style={styles.barsContainer}>
                        {[5, 4, 3, 2, 1].map((star) => (
                          <View key={star} style={styles.barRow}>
                            <Text style={styles.barLabel}>{star} Star</Text>
                            <View style={styles.barTrack}>
                              <View style={[styles.barFill, { width: '0%' }]} />
                            </View>
                            <Text style={styles.barPercent}>0%</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>SUBMIT YOUR REVIEW</Text>
                    <View style={styles.submitReviewContainer}>
                      <Text style={styles.ratingPrompt}>Your Rating for this Event :</Text>
                      <View style={styles.interactiveStars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <TouchableOpacity key={s} onPress={() => setReviewRating(s)}>
                            <StarIcon size={24} fill={reviewRating >= s ? "#facc15" : "none"} color={reviewRating >= s ? "#facc15" : "#cbd5e1"} />
                          </TouchableOpacity>
                        ))}
                      </View>

                      <TextInput
                        style={styles.reviewInput}
                        value={reviewComment}
                        onChangeText={setReviewComment}
                        placeholder="Share Your Thoughts..."
                        multiline
                        textAlignVertical="top"
                      />

                      <TouchableOpacity style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>SUBMIT REVIEW</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

              </View>
            </View>

            {/* Right Sidebar */}
            <View style={styles.sidebar}>
              
              {/* Book Now Button */}
              <TouchableOpacity
                disabled={isClosed}
                onPress={handleBookNow}
                style={[styles.sidebarBookButton, isClosed ? styles.sidebarBookButtonClosed : styles.sidebarBookButtonOpen]}
              >
                <Text style={styles.sidebarBookButtonText}>
                  {isClosed ? "BOOKING CLOSED" : "BOOK NOW"}
                </Text>
              </TouchableOpacity>

              {/* Event Details */}
              <View style={styles.detailsCard}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsHeaderTitle}>EVENT DETAILS</Text>
                </View>
                <View style={styles.detailsContent}>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Start Date</Text>
                    <Text style={styles.detailsValue}>: {formatDateLong(fullData?.eventDetails?.start_date)}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>End Date</Text>
                    <Text style={styles.detailsValue}>: {formatDateLong(fullData?.eventDetails?.end_date)}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Address</Text>
                    <View style={styles.detailsValueContainer}>
                      <Text style={styles.detailsValueSeparator}>:</Text>
                      <Text style={styles.detailsValueText}>
                        {fullData?.eventDetails?.venue}{fullData?.eventDetails?.address ? `, ${fullData?.eventDetails?.address}` : ""}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Organizer Details */}
              <OrganizerDetailCard organizerData={fullData?.organizer} />

            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8faff' },
  container: { flex: 1 },
  contentContainer: { paddingBottom: 40 },
  
  // Buttons
  homeButton: {
    position: 'absolute', top: 24, left: 24, zIndex: 110,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
  },
  homeButtonText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  closeButton: {
    position: 'absolute', top: 24, right: 24, zIndex: 110,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 8, borderRadius: 20,
  },

  // Banner
  bannerContainer: { width: '100%', height: 260, backgroundColor: '#0f172a', position: 'relative' },
  bannerImage: { width: '100%', height: '100%', opacity: 0.7 },
  bannerFallback: { width: '100%', height: '100%', backgroundColor: '#1e293b' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  bannerContent: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  bannerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' },
  breadcrumbText: { fontSize: 10, fontWeight: 'bold', color: '#eab308', letterSpacing: 1 },
  breadcrumbSeparator: { fontSize: 10, color: '#94a3b8', marginHorizontal: 4 },
  breadcrumbCurrent: { fontSize: 10, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  statsContainer: { flexDirection: 'row', gap: 24 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 9, fontWeight: 'bold', color: '#cbd5e1', letterSpacing: 1, marginTop: 4 },

  // Venue Bar
  venueBar: { backgroundColor: '#fff', flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 16 },
  venueItem: { flex: 1, minWidth: '33%', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#e2e8f0', paddingVertical: 8 },
  venueItemNoBorder: { borderRightWidth: 0 },
  venueIcon: { marginBottom: 8 },
  venueTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' },
  venueSubtitle: { fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 2 },
  enquiryText: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  linkText: { fontSize: 11, fontWeight: 'bold', color: '#3b82f6', textDecorationLine: 'underline', marginTop: 2 },

  // Tabs
  tabContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tabScrollContent: { paddingHorizontal: 16 },
  tabButton: { paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTabButton: { borderBottomColor: '#3f63fc' },
  tabButtonText: { fontSize: 11, fontWeight: 'bold', color: '#64748b', letterSpacing: 1 },
  activeTabButtonText: { color: '#3f63fc' },

  // Main Area
  mainContentArea: { padding: 16, flexDirection: 'column', gap: 16 },
  leftContent: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 24, borderWidth: 1, borderColor: '#f1f5f9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#3f63fc', letterSpacing: 1, marginBottom: 16 },
  descriptionText: { fontSize: 12, color: '#475569', lineHeight: 20 },
  
  // Tags
  tagsContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  tagsLabel: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' },
  tagsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagText: { fontSize: 10, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' },
  noTagsText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },

  // Guests
  guestsContainer: { marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  guestsTitle: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1, marginBottom: 16 },
  guestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  guestCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, flex: 1, minWidth: '45%' },
  guestImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  guestAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  guestAvatarText: { fontSize: 12, fontWeight: 'bold', color: '#2563eb' },
  guestInfo: { flex: 1 },
  guestName: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  guestRole: { fontSize: 10, fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' },

  // Pricing Table
  pricingSubtitle: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
  tableContainer: { borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 8, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableCell: { flex: 1, paddingHorizontal: 16, fontSize: 12, color: '#475569' },
  tableHeaderCell: { fontWeight: 'bold', fontSize: 10, color: '#64748b', paddingVertical: 12, letterSpacing: 1 },
  tableCellBold: { fontWeight: 'bold', color: '#334155' },

  // Gallery
  galleryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  galleryImageWrapper: { width: '100%', aspectRatio: 16/9, borderRadius: 12, overflow: 'hidden', borderWidth: 4, borderColor: '#fff', elevation: 2 },
  galleryImage: { width: '100%', height: '100%' },

  // T&C
  tncList: { gap: 16 },
  tncCard: { padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
  tncTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  tncMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(219, 234, 254, 0.6)' },
  tncMetaText: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  tncMetaSeparator: { color: '#cbd5e1' },
  defaultBadge: { backgroundColor: '#d1fae5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 'auto' },
  defaultBadgeText: { fontSize: 9, fontWeight: '900', color: '#059669' },
  tncDescription: { fontSize: 12, color: '#475569', lineHeight: 20 },
  noDataText: { fontSize: 14, color: '#94a3b8', fontStyle: 'italic' },

  // Amenities
  amenitiesSection: { marginBottom: 24 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amenityCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1, minWidth: '45%' },
  amenityName: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  amenityStall: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginTop: 2 },
  amenityRight: { alignItems: 'flex-end', gap: 4 },
  qtyBadge: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  qtyText: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
  amenityPrice: { fontSize: 14, fontWeight: '900', color: '#2563eb' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { fontSize: 12, fontWeight: 'bold', color: '#cbd5e1', letterSpacing: 1, marginTop: 8 },

  // Reviews
  reviewsSummary: { gap: 16 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewsCountText: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },
  barsContainer: { gap: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barLabel: { fontSize: 12, fontWeight: 'bold', color: '#475569', width: 48 },
  barTrack: { flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#cbd5e1' },
  barPercent: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', width: 32 },
  
  submitReviewContainer: { gap: 16 },
  ratingPrompt: { fontSize: 14, fontWeight: '500', color: '#475569' },
  interactiveStars: { flexDirection: 'row', gap: 8 },
  reviewInput: { height: 120, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 14, color: '#1e293b' },
  submitButton: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },

  // Sidebar
  sidebar: { flex: undefined, gap: 16 },
  sidebarBookButton: { width: '100%', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  sidebarBookButtonOpen: { backgroundColor: '#3f63fc' },
  sidebarBookButtonClosed: { backgroundColor: '#e2e8f0' },
  sidebarBookButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  
  detailsCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 8, overflow: 'hidden' },
  detailsHeader: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  detailsHeaderTitle: { fontSize: 11, fontWeight: 'bold', color: '#3f63fc', letterSpacing: 1 },
  detailsContent: { padding: 24, gap: 16 },
  detailsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  detailsLabel: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', width: 80 },
  detailsValueContainer: { flex: 1, flexDirection: 'row', gap: 4 },
  detailsValueSeparator: { fontSize: 12, color: '#475569' },
  detailsValue: { fontSize: 12, color: '#475569', flex: 1 },
  detailsValueText: { fontSize: 12, color: '#475569', flex: 1 },
});

export default EventDetailModal;
