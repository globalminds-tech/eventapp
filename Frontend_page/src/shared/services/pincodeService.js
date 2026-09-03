/**
 * Shared Postal Pincode Auto-Fill Service
 * Uses official Indian Postal Pincode API with automatic fallback to Zippopotam
 */
export async function lookupPincode(pincode) {
  const clean = String(pincode || "").replace(/\D/g, "").slice(0, 6);
  if (clean.length !== 6) {
    return { success: false, error: "Pincode must be 6 digits" };
  }

  // 1. Primary: Official Postal Pincode API for India
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (
        Array.isArray(data) &&
        data[0]?.Status === "Success" &&
        Array.isArray(data[0]?.PostOffice) &&
        data[0].PostOffice.length > 0
      ) {
        const po = data[0].PostOffice[0];
        const city = po.District || po.Division || po.Block || po.Circle || "";
        const state = po.State || "";
        const postOffices = data[0].PostOffice.map((p) => p.Name).filter(Boolean);
        return {
          success: true,
          city,
          state,
          district: po.District || "",
          region: po.Region || "",
          postOffices,
        };
      }
    }
  } catch (err) {
    console.warn("India Post API lookup error, attempting fallback...", err);
  }

  // 2. Secondary Fallback: Zippopotam API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.zippopotam.us/in/${clean}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.places && data.places.length > 0) {
        const place = data.places[0];
        return {
          success: true,
          city: place["place name"] || "",
          state: place["state"] || "",
          district: place["state abbreviation"] || "",
          postOffices: data.places.map((p) => p["place name"]).filter(Boolean),
        };
      }
    }
  } catch (err) {
    console.warn("Zippopotam fallback lookup error:", err);
  }

  return { success: false, error: "Location details not found for this pincode" };
}
