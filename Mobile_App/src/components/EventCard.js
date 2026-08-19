import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MapPin, Calendar, Star, Heart, TrendingUp } from "lucide-react-native";
import MediaRenderer from "./MediaRenderer";

export const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <View style={styles.timerContainer}>
      {timeLeft.days > 0 && (
        <>
          <View style={styles.timeBlock}>
            <Text style={styles.timeText}>{timeLeft.days}d</Text>
          </View>
          <Text style={styles.timeDot}>•</Text>
        </>
      )}
      <View style={styles.timeBlock}>
        <Text style={styles.timeText}>{String(timeLeft.hours || 0).padStart(2, "0")}h</Text>
      </View>
      <Text style={styles.timeDot}>•</Text>
      <View style={styles.timeBlock}>
        <Text style={styles.timeText}>{String(timeLeft.minutes || 0).padStart(2, "0")}m</Text>
      </View>
      <Text style={styles.timeDot}>•</Text>
      <View style={styles.timeBlock}>
        <Text style={styles.timeText}>{String(timeLeft.seconds || 0).padStart(2, "0")}s</Text>
      </View>
    </View>
  );
};

export const EventCard = ({ event, isFeatured = false, isLiked, onToggleLike, onShowDetail }) => {
  const navigation = useNavigation();

  const handleBookNow = () => {
    console.log("Clicked Event ID:", event.id);
    navigation.navigate('UsersBooking', { eventId: event.id, event });
  };

  const priceDisplay =
    event.entry_type === "Donation" ? "Donation" :
    event.entry_type === "Free" || event.price === 0 ? "Free" :
    `${event.currency}${event.price}`;

  const isClosed = new Date() > new Date(event.bookingEnds);

  if (isFeatured) {
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => onShowDetail(event.id)}
        style={styles.featuredContainer}
      >
        <MediaRenderer
          src={event.image}
          type={event.banner_type}
          alt={event.title}
          style={styles.featuredImage}
        />

        <View style={styles.overlay} />

        {event.trending && (
          <View style={styles.trendingBadgeContainer}>
            <View style={styles.trendingBadge}>
              <TrendingUp size={14} color="#ffffff" />
              <Text style={styles.trendingText}>Trending Now</Text>
            </View>
          </View>
        )}

        <View style={styles.featuredContentContainer}>
          <View style={styles.featuredContent}>
            <View style={styles.featuredHeaderRow}>
              <View style={styles.featuredTitleContainer}>
                <Text style={styles.featuredTitle} numberOfLines={1}>{event.title}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={14} color="#d1d5db" />
                  <Text style={styles.featuredLocation} numberOfLines={1}>{event.location}</Text>
                </View>
              </View>
              <View style={styles.featuredPriceContainer}>
                <Text style={styles.featuredPrice}>{priceDisplay}</Text>
              </View>
            </View>

            <View style={styles.featuredBottomRow}>
              <View style={styles.ratingRow}>
                <View style={styles.ratingBadge}>
                  <Star size={14} color="#facc15" fill="#facc15" />
                  <Text style={styles.ratingText}>{event.rating}</Text>
                </View>
                <Text style={styles.reviewsText}>({event.reviews} reviews)</Text>
              </View>
              
              <TouchableOpacity
                disabled={isClosed}
                onPress={handleBookNow}
                style={[styles.featuredBookButton, isClosed ? styles.buttonClosed : styles.buttonOpen]}
              >
                <Text style={[styles.featuredBookButtonText, isClosed ? styles.textClosed : styles.textOpen]}>
                  {isClosed ? "Booking Closed" : "Book Now"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => onShowDetail(event.id)}
      style={styles.cardContainer}
    >
      <View style={styles.imageContainer}>
        <MediaRenderer
          src={event.image}
          type={event.banner_type}
          alt={event.title}
          style={styles.cardImage}
        />
        <View style={styles.imageOverlay} />

        <View style={styles.categoryBadgeContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onToggleLike(event.id)}
          style={styles.likeButton}
        >
          <Heart
            size={16}
            color={isLiked ? "#ef4444" : "#ffffff"}
            fill={isLiked ? "#ef4444" : "transparent"}
          />
        </TouchableOpacity>

        <View style={styles.cardPriceContainer}>
          <Text style={styles.cardPrice}>{priceDisplay}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <View>
            <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
            <View style={styles.cardRatingRow}>
              <View style={styles.ratingBadgeSm}>
                <Star size={14} color="#facc15" fill="#facc15" />
                <Text style={styles.ratingTextSm}>{event.rating}</Text>
              </View>
              <Text style={styles.reviewsTextSm}>({event.reviews})</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <MapPin size={14} color="#14b8a6" />
              <Text style={styles.detailText} numberOfLines={1}>{event.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={14} color="#14b8a6" />
              <Text style={styles.detailText} numberOfLines={1}>
                {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {event.endDate && event.endDate !== event.date && (
                  ` - ${new Date(event.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                )}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {!isClosed && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>BOOKING CLOSES IN</Text>
              <CountdownTimer targetDate={event.bookingEnds} />
            </View>
          )}

          <TouchableOpacity
            disabled={isClosed}
            onPress={handleBookNow}
            style={[styles.bookButton, isClosed ? styles.buttonClosedAlt : styles.buttonOpenAlt]}
          >
            <Text style={styles.bookButtonText}>
              {isClosed ? "Booking Closed" : "Book Ticket"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeBlock: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderRadius: 8,
  },
  timeText: {
    color: '#fb923c',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timeDot: {
    color: '#64748b',
    fontSize: 12,
  },
  featuredContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    height: '100%',
    width: '100%',
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  trendingBadgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f97316',
    borderRadius: 20,
  },
  trendingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuredContentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  featuredContent: {
    gap: 12,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredLocation: {
    fontSize: 14,
    color: '#d1d5db',
  },
  featuredPriceContainer: {
    alignItems: 'flex-end',
  },
  featuredPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fb923c',
  },
  featuredBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  reviewsText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  featuredBookButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonOpen: {
    backgroundColor: '#ffffff',
  },
  buttonClosed: {
    backgroundColor: '#334155',
  },
  featuredBookButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textOpen: {
    color: '#0f172a',
  },
  textClosed: {
    color: '#94a3b8',
  },
  cardContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
  },
  imageContainer: {
    height: 160,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
  },
  categoryBadgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  likeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 20,
    zIndex: 10,
  },
  cardPriceContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fb923c',
  },
  contentContainer: {
    padding: 16,
    flex: 1,
  },
  mainContent: {
    flex: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    minHeight: 40,
  },
  cardRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingBadgeSm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingTextSm: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  reviewsTextSm: {
    fontSize: 12,
    color: '#64748b',
  },
  detailsContainer: {
    gap: 6,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#94a3b8',
    flex: 1,
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  countdownContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.5)',
    gap: 6,
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bookButton: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOpenAlt: {
    backgroundColor: '#f97316',
  },
  buttonClosedAlt: {
    backgroundColor: '#334155',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default EventCard;
