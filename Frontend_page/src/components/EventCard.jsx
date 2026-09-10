import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Star,
  Heart,
  TrendingUp
} from "lucide-react";
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
    <div className="flex gap-2 text-xs font-mono">
      {timeLeft.days > 0 && (
        <>
          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg">
            {timeLeft.days}d
          </span>
          <span className="text-slate-500">•</span>
        </>
      )}
      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg">
        {String(timeLeft.hours || 0).padStart(2, "0")}h
      </span>
      <span className="text-slate-500">•</span>
      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg">
        {String(timeLeft.minutes || 0).padStart(2, "0")}m
      </span>
      <span className="text-slate-500">•</span>
      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg">
        {String(timeLeft.seconds || 0).padStart(2, "0")}s
      </span>
    </div>
  );
};

export const EventCard = ({ event, isFeatured = false, isLiked, onToggleLike, onShowDetail }) => {
  const navigate = useNavigate();

  const handleBookNow = (e) => {
    e.stopPropagation();
    console.log("Clicked Event ID:", event.id); // ✅ debug
    navigate(`/usersbooking/${event.id}`, { state: { event } });
  };

  const priceDisplay =
    event.entry_type === "Donation" ? "Donation" :
    event.entry_type === "Free" || event.price === 0 ? "Free" :
    `${event.currency}${event.price}`;

  if (isFeatured) {
    return (
      <div
        onClick={() => onShowDetail(event.id)}
        className="group relative overflow-hidden rounded-2xl h-full cursor-pointer"
      >
        {/* Featured card with image and overlay */}
        <MediaRenderer
          src={event.image}
          type={event.banner_type}
          alt={event.title}
          className="w-full h-full group-hover:scale-105 transition-transform duration-700 object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Trending Badge */}
        {event.trending && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white text-xs font-bold">
              <TrendingUp size={14} />
              Trending Now
            </div>
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2 hover:text-orange-400 transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-300 flex items-center gap-2">
                  <MapPin size={14} />
                  {event.location}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-400">
                  {priceDisplay}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-white font-semibold">
                    {event.rating}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  ({event.reviews} reviews)
                </span>
              </div>
              <button
                onClick={handleBookNow}
                disabled={new Date() > new Date(event.bookingEnds)}
                className={`px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 ${new Date() > new Date(event.bookingEnds)
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-white text-slate-900 hover:bg-gray-100"
                  }`}
              >
                {new Date() > new Date(event.bookingEnds) ? "Booking Closed" : "Book Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onShowDetail(event.id)}
      className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="relative h-32 sm:h-40 overflow-hidden bg-slate-900 shrink-0">
        <MediaRenderer
          src={event.image}
          type={event.banner_type}
          alt={event.title}
          className="w-full h-full group-hover:scale-110 transition-transform duration-700 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-slate-900/60 backdrop-blur-md rounded-lg text-[10px] sm:text-xs font-bold text-slate-200 border border-slate-700/50">
            {event.category}
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(event.id);
          }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-slate-900/60 backdrop-blur-md rounded-full hover:bg-slate-800 transition-colors z-10 cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
          />
        </button>

        {/* Price */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
          <span className="text-sm sm:text-lg font-bold text-orange-400">
            {priceDisplay}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <div className="flex-grow space-y-2.5 sm:space-y-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 hover:text-orange-400 transition-colors min-h-[32px] sm:min-h-[40px]">
              {event.title}
            </h3>
            <div className="flex items-center justify-between mt-1.5 sm:mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-[11px] sm:text-xs font-semibold text-slate-300">
                  {event.rating}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-500">({event.reviews})</span>
            </div>
          </div>

          <div className="space-y-1.5 text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
              <span>
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                {event.endDate && event.endDate !== event.date && (
                  <> - {new Date(event.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 space-y-3">
          {/* Countdown or Closed Time */}
          {new Date() <= new Date(event.bookingEnds) && (
            <div className="pt-3 border-t border-slate-700/50 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking closes in</span>
              <CountdownTimer targetDate={event.bookingEnds} />
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleBookNow}
            disabled={new Date() > new Date(event.bookingEnds)}
            className={`w-full py-2 rounded-lg text-white text-xs font-bold transition-all transform hover:scale-105 active:scale-95 ${new Date() > new Date(event.bookingEnds)
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/20"
              }`}
          >
            {new Date() > new Date(event.bookingEnds) ? "Booking Closed" : "Book Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
};
