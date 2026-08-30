import React, { useState, useEffect } from "react";
import { Plus, X, Upload, Pencil, Trash2, Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { categoryApi } from "@/features/catalog/api/category.api";
import { uploadCategoryImageToSupabase } from "@/Services/supabaseClient";

export default function CategoryMaster() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCatId, setDeletingCatId] = useState(null);

  // Quick Inline Add Subcategory State
  const [activeSubInputId, setActiveSubInputId] = useState(null);
  const [quickSubName, setQuickSubName] = useState("");

  // Form State
  const [catName, setCatName] = useState("");
  const [subCatName, setSubCatName] = useState("");
  const [catImageFile, setCatImageFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryApi.getCategories();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.categories) ? res.categories : (Array.isArray(res) ? res : []));
      setCategories(list);
    } catch (err) {
      console.warn("Failed to fetch API categories:", err);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCatImageFile(file);
    const preview = URL.createObjectURL(file);
    setCatImagePreview(preview);
  };

  const resetForm = () => {
    setCatName("");
    setSubCatName("");
    setCatImageFile(null);
    setCatImagePreview("");
    setShowAddModal(false);
    setEditingCategory(null);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name || "");
    const subsStr = Array.isArray(cat.subcategories) ? cat.subcategories.join(", ") : (cat.subcategories || "");
    setSubCatName(subsStr);
    setCatImagePreview(cat.category_image || "");
    setCatImageFile(null);
    setShowAddModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      showNotification("Category Name is required", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      let imageUrl = catImagePreview;
      if (catImageFile) {
        imageUrl = await uploadCategoryImageToSupabase(catImageFile);
      }

      const subsArray = subCatName ? subCatName.split(",").map((s) => s.trim()).filter(Boolean) : [];

      const payload = {
        name: catName.trim(),
        subcategories: subsArray,
        category_image: imageUrl || "",
        status: "Active",
      };

      if (editingCategory) {
        // Edit Mode via Feature API Layer
        const catId = editingCategory.id;
        await categoryApi.updateCategory(catId, payload);
        showNotification(`Category "${catName}" updated successfully!`, "success");
      } else {
        // Create Mode via Feature API Layer
        await categoryApi.createCategory(payload);
        showNotification(`Category "${catName}" created successfully!`, "success");
      }
      fetchCategories();
      resetForm();
    } catch (err) {
      showNotification(`Failed to save category "${catName}"`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCatId) return;
    try {
      await categoryApi.deleteCategory(deletingCatId);
      showNotification("Category deleted successfully!", "success");
      fetchCategories();
    } catch (err) {
      showNotification("Failed to delete category", "error");
    } finally {
      setDeletingCatId(null);
    }
  };

  const handleQuickAddSubcategory = async (cat) => {
    if (!quickSubName.trim()) return;
    const existingSubs = Array.isArray(cat.subcategories) ? cat.subcategories : (cat.subcategories ? cat.subcategories.split(",") : []);
    const updatedSubs = [...existingSubs, quickSubName.trim()];

    try {
      await categoryApi.updateCategory(cat.id, { subcategories: updatedSubs });
      showNotification(`Added subcategory "${quickSubName}" to ${cat.name}`, "success");
      fetchCategories();
    } catch (err) {
      showNotification("Failed to add subcategory", "error");
    } finally {
      setQuickSubName("");
      setActiveSubInputId(null);
    }
  };

  const filteredCategories = categories.filter((c) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(c.subcategories) ? c.subcategories.join(" ") : (c.subcategories || "")).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      {/* ── SIMPLE & CLEAN HEADING BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Category & Subcategory Master
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Create, edit, and manage event main categories and subcategories in a structured table.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search category or subcategory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 pr-8 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          </div>

          <Button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl border-none cursor-pointer gap-1.5 shadow-md hover:opacity-95 transition-all"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg animate-fadeIn">
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="border-none bg-transparent text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* ── TABLE CONTAINER ── */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-3.5 pl-5">Category Image</th>
                <th className="p-3.5">Category Name</th>
                <th className="p-3.5">Subcategories</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCategories.map((cat) => {
                const subList = Array.isArray(cat.subcategories) ? cat.subcategories : (cat.subcategories ? cat.subcategories.split(",") : []);

                return (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Category Image Thumbnail */}
                    <td className="p-3.5 pl-5">
                      {cat.category_image ? (
                        <img src={cat.category_image} alt={cat.name} className="w-14 h-11 object-cover rounded-lg border border-slate-200 shadow-xs" />
                      ) : (
                        <div className="w-14 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                          No Image
                        </div>
                      )}
                    </td>

                    {/* Category Name */}
                    <td className="p-3.5 font-extrabold text-slate-900 text-sm">
                      {cat.name}
                    </td>

                    {/* Subcategories (Chips + Inline Add) */}
                    <td className="p-3.5">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
                        {subList.map((sub, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200/80 rounded-md font-semibold text-xs shadow-2xs">
                            {sub.trim()}
                          </span>
                        ))}

                        {/* Inline Add Subcategory Pill */}
                        {activeSubInputId === cat.id ? (
                          <div className="flex items-center gap-1 bg-white border border-purple-400 p-0.5 rounded-lg shadow-xs">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Subcategory..."
                              value={quickSubName}
                              onChange={(e) => setQuickSubName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") handleQuickAddSubcategory(cat); }}
                              className="w-28 h-6 px-2 text-xs font-semibold outline-none border-none bg-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuickAddSubcategory(cat)}
                              className="p-1 bg-purple-600 text-white rounded-md text-[10px] font-bold border-none cursor-pointer hover:bg-purple-700"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => { setActiveSubInputId(null); setQuickSubName(""); }}
                              className="p-1 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setActiveSubInputId(cat.id); setQuickSubName(""); }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md cursor-pointer transition-all"
                          >
                            <PlusCircle size={12} />
                            <span>+ Subcategory</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-extrabold text-[10px]">
                        ACTIVE
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border-none cursor-pointer"
                          title="Edit Category"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingCatId(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-none cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCategories.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    {searchQuery ? `No categories found matching "${searchQuery}".` : 'No categories found in database. Click "+ Add Category" to create one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── ADD / EDIT CATEGORY MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingCategory ? "Edit Category" : "Add New Main Category"}
              </h3>
              <button onClick={resetForm} className="border-none bg-transparent cursor-pointer text-slate-400"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health & Wellness"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subcategories (comma separated):</label>
                <input
                  type="text"
                  placeholder="e.g. Yoga, Marathon, Dental Expo"
                  value={subCatName}
                  onChange={(e) => setSubCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-slate-900"
                />
              </div>

              {/* Optional Category Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Image <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                {catImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
                    <img src={catImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setCatImageFile(null); setCatImagePreview(""); }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full border-none cursor-pointer shadow-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-purple-400 bg-slate-50 transition-all">
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Choose Image File</span>
                    <span className="text-[10px] text-slate-400">Supports JPG, PNG, WebP (Max 5MB)</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={resetForm} className="text-xs cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer border-none disabled:opacity-50">
                  {isSubmitting ? "Saving..." : (editingCategory ? "Update Category" : "Save Category")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deletingCatId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Delete Category?</h3>
              <p className="text-xs text-slate-500 mt-1">Are you sure you want to delete this main category? This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDeletingCatId(null)} className="text-xs cursor-pointer">Cancel</Button>
              <Button type="button" onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer border-none">
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
