/**
 * Supabase Storage Integration Utility
 * Uploads category banner images to Supabase storage bucket.
 * Throws explicit errors if upload fails — zero fallbacks to Base64.
 */

import { ENV } from "@/config/env";

const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL || ENV.SUPABASE_URL || "https://oebnblvwjvtsngubzcic.supabase.co").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || ENV.SUPABASE_ANON_KEY || "";

export const uploadCategoryImageToSupabase = async (file, bucketName = "event-assets") => {
  if (!file) return "";

  // 1. Try Backend Upload Endpoint (Uses Supabase Service Role Key)
  try {
    const formData = new FormData();
    formData.append("file", file);

    const backendRes = await fetch("http://localhost:5001/superadmin/api/upload-category-image", {
      method: "POST",
      body: formData,
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.success && data.url) {
        return data.url;
      } else {
        throw new Error(data.message || "Failed to upload image to Supabase Storage.");
      }
    } else {
      throw new Error(`Server returned HTTP ${backendRes.status} during image upload.`);
    }
  } catch (backendErr) {
    // 2. Direct Supabase Storage REST API Upload (If frontend anon key configured)
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucketName}/${fileName}`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": file.type || "image/jpeg",
        },
        body: file,
      });

      if (response.ok) {
        return `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`;
      } else {
        const errorText = await response.text();
        throw new Error(`Supabase Storage REST API Error (${response.status}): ${errorText}`);
      }
    }

    // Throw explicit error to UI
    throw new Error(backendErr.message || "Supabase Storage upload failed.");
  }
};
