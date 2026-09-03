import React, { useState } from "react";
import { Trash2, Edit, X, Plus } from "lucide-react";
import { Select, SelectItem } from "@/components/ui/Select";

const Step7FoodProvision = ({ formData, setFormData }) => {
  const foodItems = (formData.foodProvision?.items && formData.foodProvision.items.length > 0)
    ? formData.foodProvision.items
    : (formData.foodProvision?.coupons || []);

  const [tempInput, setTempInput] = useState({
    catererName: "",
    mealType: "Breakfast",
    foodType: "Veg",
    priceINR: "",
    menuDetails: "",
  });

  const updateTempInput = (field, value) => {
    setTempInput((prev) => ({ ...prev, [field]: value }));
  };

  const [warning, setWarning] = useState({ show: false, message: "" });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, index: null });
  const [editModal, setEditModal] = useState({ isOpen: false, index: null, data: {} });

  const showModal = (msg) => {
    setWarning({ show: true, message: msg });
    setTimeout(() => setWarning({ show: false, message: "" }), 5000);
  };

  const addFoodItem = () => {
    if (!tempInput.catererName.trim()) return showModal("Caterer/Stall Name is required");
    if (!tempInput.mealType) return showModal("Meal Type is required");
    if (!tempInput.foodType) return showModal("Food Type is required");
    if (!tempInput.priceINR || tempInput.priceINR === "0") return showModal("Price in INR is required");

    const newItem = {
      catererName: tempInput.catererName,
      mealType: tempInput.mealType,
      foodType: tempInput.foodType,
      priceINR: tempInput.priceINR,
      menuDetails: tempInput.menuDetails,
    };

    const updatedItems = [...foodItems, newItem];

    setFormData({
      ...formData,
      eventDetails: {
        ...formData.eventDetails,
        food: true,
      },
      foodProvision: {
        ...formData.foodProvision,
        items: updatedItems,
      },
    });

    setTempInput({
      catererName: "",
      mealType: "Breakfast",
      foodType: "Veg",
      priceINR: "",
      menuDetails: "",
    });
  };

  const openEdit = (index) => {
    const item = foodItems[index];
    setEditModal({
      isOpen: true,
      index,
      data: { ...item },
    });
  };

  const handleUpdate = () => {
    const { data, index } = editModal;
    if (!data.catererName?.trim()) return showModal("Caterer Name is required");
    if (!data.priceINR || data.priceINR === "0") return showModal("Price in INR is required");

    const updatedItems = [...foodItems];
    updatedItems[index] = data;

    setFormData({
      ...formData,
      foodProvision: {
        ...formData.foodProvision,
        items: updatedItems,
      },
    });
    setEditModal({ isOpen: false, index: null, data: {} });
  };

  const handleDeleteConfirm = () => {
    const { index } = deleteModal;
    if (index === null) return;

    const updatedItems = foodItems.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      foodProvision: {
        ...formData.foodProvision,
        items: updatedItems,
      },
    });
    setDeleteModal({ isOpen: false, index: null });
  };

  const inputClasses =
    "w-full h-9 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-400 text-xs font-semibold";
  const selectClasses = `${inputClasses} cursor-pointer`;
  const labelClasses = "block text-xs font-bold text-slate-700 mb-1 ml-1";
  const cardClasses = "bg-white p-4 rounded-xl shadow-xs border border-slate-200/80";
  const sectionTitleClasses = "text-sm font-extrabold text-slate-900 mb-3 border-l-4 border-cyan-500 pl-2.5";
  const tableHeaderClasses = "bg-slate-50 text-slate-700 text-[11px] font-bold tracking-wider p-2.5 text-left border-b border-slate-200";
  const tableCellClasses = "p-2.5 text-xs text-slate-800 border-b border-slate-100 font-semibold";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT SIDE: FORM */}
        <div className={`${cardClasses} space-y-4 h-auto`}>
          <h2 className={sectionTitleClasses}>Food Provision Details</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
              <div className="sm:col-span-2">
                <label className={labelClasses}>Caterer / Stall Name <span className="text-red-500">*</span></label>
                <input
                  maxLength={50}
                  placeholder="e.g. Royal Caterers"
                  value={tempInput.catererName}
                  onChange={(e) => updateTempInput("catererName", e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <Select
                  label="Meal Type"
                  value={tempInput.mealType}
                  onValueChange={(val) => updateTempInput("mealType", val)}
                  triggerClassName="bg-white border-slate-200 rounded-xl h-9 text-xs font-semibold focus:ring-cyan-500"
                >
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                  <SelectItem value="High Tea">High Tea</SelectItem>
                  <SelectItem value="All Day">All Day</SelectItem>
                </Select>
              </div>

              <div>
                <Select
                  label="Food Type"
                  value={tempInput.foodType}
                  onValueChange={(val) => updateTempInput("foodType", val)}
                  triggerClassName="bg-white border-slate-200 rounded-xl h-9 text-xs font-semibold focus:ring-cyan-500"
                >
                  <SelectItem value="Veg">Veg</SelectItem>
                  <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </Select>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 sm:col-span-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Meal Pass Price (₹ INR) <span className="text-red-500">*</span></label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-black text-slate-400">₹</span>
                  <input
                    placeholder="250"
                    value={tempInput.priceINR}
                    maxLength={10}
                    onChange={(e) => updateTempInput("priceINR", e.target.value.replace(/[^0-9.]/g, ""))}
                    className="w-full h-9 bg-white border border-slate-200 rounded-xl pl-7 pr-3 text-xs font-extrabold outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClasses}>Menu Details / Included Items</label>
              <textarea
                placeholder="e.g. Rice, Dal, Roti, Paneer Butter Masala, Sweet"
                value={tempInput.menuDetails}
                onChange={(e) => updateTempInput("menuDetails", e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 sm:col-span-2">
              <button
                onClick={addFoodItem}
                className="w-full h-9 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-xs border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>Confirm & Add Food Provision</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: SUMMARY TABLE */}
        <div className="space-y-8">
          <div className={cardClasses}>
            <h2 className={sectionTitleClasses}>Food Provision Summary</h2>
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={tableHeaderClasses}>Action</th>
                      <th className={tableHeaderClasses}>Caterer</th>
                      <th className={tableHeaderClasses}>Meal & Type</th>
                      <th className={tableHeaderClasses}>Price (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodItems.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-gray-400 italic bg-gray-50/30">
                          No food provisions added yet. Fill the form on the left.
                        </td>
                      </tr>
                    ) : (
                      foodItems.map((item, index) => (
                        <tr key={index} className="hover:bg-indigo-50/50 transition-colors duration-200 group">
                          <td className="p-4 border-b border-gray-50 flex gap-3">
                            <button
                              onClick={() => openEdit(index)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, index })}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                          <td className={`${tableCellClasses} font-semibold text-purple-700`}>{item.catererName}</td>
                          <td className={tableCellClasses}>
                            <span className="font-bold block text-gray-800">{item.mealType}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.foodType === 'Veg' ? 'bg-green-100 text-green-700' : item.foodType === 'Non-Veg' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                              {item.foodType}
                            </span>
                          </td>
                          <td className={`${tableCellClasses} font-bold`}>{item.priceINR}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WARNING TOAST */}
      {warning.show && (
        <div className="fixed bottom-6 right-6 z-[110] animate-in slide-in-from-right-full duration-500">
          <div className="bg-[#ff8a3d] text-white p-5 rounded-xl shadow-2xl flex items-start gap-4 max-w-sm relative overflow-hidden group border-l-8 border-orange-600/30">
            <div className="flex-1 pr-6">
              <h3 className="font-bold text-lg mb-1 leading-tight">Warning</h3>
              <p className="text-sm font-medium opacity-95">{warning.message}</p>
            </div>
            <button
              onClick={() => setWarning({ show: false, message: "" })}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Edit Food Provision</h3>
              <button onClick={() => setEditModal({ isOpen: false, index: null, data: {} })} className="text-white hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                value={editModal.data.catererName || ""}
                onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, catererName: e.target.value } }))}
                className={inputClasses}
                placeholder="Caterer Name"
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={editModal.data.mealType || ""}
                  onValueChange={(val) => setEditModal(prev => ({ ...prev, data: { ...prev.data, mealType: val } }))}
                  placeholder="Select Meal"
                  triggerClassName="bg-white border-slate-200 rounded-xl h-10 text-xs font-semibold focus:ring-cyan-500"
                >
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                  <SelectItem value="High Tea">High Tea</SelectItem>
                  <SelectItem value="All Day">All Day</SelectItem>
                </Select>
                <Select
                  value={editModal.data.foodType || ""}
                  onValueChange={(val) => setEditModal(prev => ({ ...prev, data: { ...prev.data, foodType: val } }))}
                  placeholder="Select Food"
                  triggerClassName="bg-white border-slate-200 rounded-xl h-10 text-xs font-semibold focus:ring-cyan-500"
                >
                  <SelectItem value="Veg">Veg</SelectItem>
                  <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </Select>
              </div>
              <div>
                <label className={labelClasses}>Meal Pass Price (₹ INR)</label>
                <input
                  value={editModal.data.priceINR || ""}
                  onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, priceINR: e.target.value.replace(/[^0-9.]/g, "") } }))}
                  className={inputClasses}
                  placeholder="Price INR"
                />
              </div>
              <textarea
                value={editModal.data.menuDetails || ""}
                onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, menuDetails: e.target.value } }))}
                className={`${inputClasses} h-auto py-3 rounded-2xl resize-none`}
                placeholder="Menu Details"
                rows={3}
              />
              <button onClick={handleUpdate} className="w-full py-3 bg-indigo-600 text-white rounded-full font-bold">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Delete Food Provision</h3>
            <p className="text-sm text-gray-600">Are you sure you want to remove this item?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal({ isOpen: false, index: null })}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-full font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-red-600 text-white rounded-full font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step7FoodProvision;