/**
 * Supabase Storage Integration Utility
 * Uploads category banner images to Supabase storage 'categories' bucket.
 * Falls back to Base64 DataURL if Supabase credentials are missing or offline.
 */

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

export const uploadCategoryImageToSupabase = async (file, bucketName = "categories") => {
  if (!file) return "";

  // Helper to convert file to Base64 DataURL (Fallback)
  const fileToBase64 = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(f);
    });

  // If Supabase environment is configured, attempt direct storage upload
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucketName}/${fileName}`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (response.ok) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`;
        return publicUrl;
      }
    } catch (err) {
      console.warn("Supabase Storage upload warning, falling back to Base64 DataURL:", err);
    }
  }

  // Fallback: Convert to Base64 DataURL for instant local preview & storage
  return await fileToBase64(file);
};
