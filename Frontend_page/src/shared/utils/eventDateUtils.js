/**
 * Helper utility to determine whether an event has concluded (date has passed).
 * 
 * Rules:
 * 1. An event is concluded if its end_date (or start_date for 1-day events) is before today.
 * 2. If end_date is today, the event is concluded if end_time is provided and current time is past end_time.
 */
export function isEventConcluded(event) {
  if (!event) return false;

  const rawEnd = event.end_date || event.endDate || event.end || event.start_date || event.startDate || event.date;
  if (!rawEnd) return false;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  let endFormatted = "";
  if (typeof rawEnd === "string") {
    endFormatted = rawEnd.split("T")[0];
  } else if (rawEnd instanceof Date) {
    endFormatted = rawEnd.toISOString().split("T")[0];
  } else {
    return false;
  }

  // If the end date is prior to today, the event is concluded
  if (todayStr > endFormatted) {
    return true;
  }

  // If the end date is today, check if end_time has passed
  if (todayStr === endFormatted) {
    const rawEndTime = event.end_time || event.endTime || event.time;
    if (rawEndTime && typeof rawEndTime === "string" && rawEndTime.includes(":")) {
      try {
        const parts = rawEndTime.split(":");
        const endHour = parseInt(parts[0], 10);
        const endMin = parseInt(parts[1] || "0", 10);
        const endDateTime = new Date();
        endDateTime.setHours(endHour, endMin, 0, 0);

        if (today > endDateTime) {
          return true;
        }
      } catch (e) {
        // Fallback to not concluded if time format is unrecognized
      }
    }
  }

  return false;
}
