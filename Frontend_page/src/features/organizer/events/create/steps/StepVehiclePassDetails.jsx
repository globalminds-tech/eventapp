import React, { useState, useEffect } from "react";
import { Trash2, Plus, AlertCircle, Car, Tag, X } from "lucide-react";

const StepVehiclePassDetails = ({ formData, setFormData }) => {
  const vehicleDetails = formData.vehicleProvision?.details || [];
  const addOnDetails = formData.vehicleProvision?.addons || [];

  // Add-On Details State
  const [isParent, setIsParent] = useState(false);
  const [addOnName, setAddOnName] = useState("");
  const [addOnPrice, setAddOnPrice] = useState("");

  const [warning, setWarning] = useState({ show: false, message: "" });

  useEffect(() => {
    if (!formData.vehicleProvision?.details || formData.vehicleProvision.details.length === 0) {
      setFormData((prev) => ({
        ...prev,
        vehicleProvision: {
          ...(prev?.vehicleProvision || {}),
          details: [
            { vehicleType: "Two Wheeler Pass", priceINR: "50" },
            { vehicleType: "Four Wheeler Pass", priceINR: "150" },
            { vehicleType: "Heavy Vehicle / Truck", priceINR: "300" },
          ],
        },
      }));
    }
  }, []);

  const showModal = (msg) => {
    setWarning({ show: true, message: msg });
    setTimeout(() => setWarning({ show: false, message: "" }), 4000);
  };

  const addVehicleDetail = () => {
    const newItem = {
      vehicleType: "",
      priceINR: "0",
    };

    setFormData({
      ...formData,
      eventDetails: {
        ...formData.eventDetails,
        vehiclePass: true,
      },
      vehicleProvision: {
        ...formData.vehicleProvision,
        details: [...vehicleDetails, newItem],
      },
    });
  };

  const updateVehicleDetail = (index, field, value) => {
    const updated = [...vehicleDetails];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      vehicleProvision: {
        ...formData.vehicleProvision,
        details: updated,
      },
    });
  };

  const addAddOn = () => {
    if (!addOnName.trim()) return showModal("Add-On Name is required");
    if (!addOnPrice || addOnPrice === "0") return showModal("Price is required");

    const newItem = {
      isParent,
      addOnName,
      price: addOnPrice,
    };

    setFormData({
      ...formData,
      vehicleProvision: {
        ...formData.vehicleProvision,
        addons: [...addOnDetails, newItem],
      },
    });

    setIsParent(false);
    setAddOnName("");
    setAddOnPrice("");
  };

  const removeVehicle = (index) => {
    const updated = vehicleDetails.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      vehicleProvision: { ...formData.vehicleProvision, details: updated },
    });
  };

  const removeAddOn = (index) => {
    const updated = addOnDetails.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      vehicleProvision: { ...formData.vehicleProvision, addons: updated },
    });
  };

  const inputClasses =
    "w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all";
  const tableHeaderClasses =
    "bg-slate-100 text-slate-800 text-[11px] font-extrabold uppercase tracking-wider p-3 text-left border-b border-slate-200/90 sticky top-0 z-20 shadow-xs";

  return (
    <div className="space-y-4 pt-1 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT SECTION: VEHICLE DETAILS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <Car className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">
                Vehicle Pass Types & Rates
              </h4>
            </div>
            <button
              type="button"
              onClick={addVehicleDetail}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1 border-none cursor-pointer"
            >
              <Plus size={13} />
              Add Pass Type
            </button>
          </div>

          {/* Scroll Area Container (Max-Height 220px to prevent UI expansion) */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse relative bg-white">
                <thead>
                  <tr>
                    <th className={tableHeaderClasses}>Vehicle Pass Type</th>
                    <th className={`${tableHeaderClasses} w-36`}>Pass Rate (₹)</th>
                    <th className={`${tableHeaderClasses} w-14 text-right`}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {vehicleDetails.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-6 text-center text-slate-400 text-xs italic">
                        No vehicle pass types added yet. Click "+ Add Pass Type" to create one.
                      </td>
                    </tr>
                  ) : (
                    vehicleDetails.map((item, index) => (
                      <tr key={index} className="bg-white hover:bg-slate-50/50 transition-colors">
                        <td className="p-2.5">
                          <input
                            placeholder="e.g. 2-Wheeler Parking Pass"
                            value={item.vehicleType}
                            onChange={(e) => updateVehicleDetail(index, "vehicleType", e.target.value)}
                            className={inputClasses}
                          />
                        </td>
                        <td className="p-2.5">
                          <div className="relative flex items-center">
                            <span className="absolute left-2.5 text-xs font-black text-slate-400">₹</span>
                            <input
                              placeholder="100"
                              value={item.priceINR}
                              onChange={(e) =>
                                updateVehicleDetail(index, "priceINR", e.target.value.replace(/[^0-9.]/g, ""))
                              }
                              className="w-full h-9 bg-white border border-slate-200 rounded-xl pl-6 pr-2 text-xs font-extrabold outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                          </div>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => removeVehicle(index)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
                            title="Delete Pass Type"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: ADD-ON DETAILS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-50 rounded-lg">
                <Tag className="w-4 h-4 text-cyan-600" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">
                Parking Add-Ons & Valet Services
              </h4>
            </div>
            <span className="text-[10px] font-extrabold uppercase text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
              INR (₹)
            </span>
          </div>

          {/* Scroll Area Container (Max-Height 220px to prevent UI expansion) */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse relative bg-white">
                <thead>
                  <tr>
                    <th className={`${tableHeaderClasses} w-16 text-center`}>Parent</th>
                    <th className={tableHeaderClasses}>Add-On Name</th>
                    <th className={`${tableHeaderClasses} w-28`}>Price (₹)</th>
                    <th className={`${tableHeaderClasses} w-14 text-right`}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="bg-slate-100 sticky top-10 z-10 border-b-2 border-slate-200 shadow-xs">
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={isParent}
                        onChange={(e) => setIsParent(e.target.checked)}
                        className="w-4 h-4 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        placeholder="e.g. VIP Valet Service"
                        value={addOnName}
                        onChange={(e) => setAddOnName(e.target.value)}
                        className={inputClasses}
                      />
                    </td>
                    <td className="p-2">
                      <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-xs font-black text-slate-400">₹</span>
                        <input
                          placeholder="250"
                          value={addOnPrice}
                          onChange={(e) => setAddOnPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                          className="w-full h-9 bg-white border border-slate-200 rounded-xl pl-6 pr-2 text-xs font-extrabold outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={addAddOn}
                        className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-extrabold hover:opacity-95 shadow-xs transition flex items-center justify-center border-none cursor-pointer ml-auto"
                        title="Add Parking Add-On"
                      >
                        <Plus size={14} />
                      </button>
                    </td>
                  </tr>

                  {addOnDetails.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-400 text-xs italic">
                        No parking add-ons added yet. Fill input above and click "+" to add.
                      </td>
                    </tr>
                  ) : (
                    addOnDetails.map((item, index) => (
                      <tr key={index} className="bg-white hover:bg-slate-50/50 transition-colors">
                        <td className="p-2 text-center">
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                              item.isParent ? "bg-cyan-100 text-cyan-800" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.isParent ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="p-2 text-xs font-semibold text-slate-800">{item.addOnName}</td>
                        <td className="p-2 text-xs font-extrabold text-slate-900">₹{item.price}</td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeAddOn(index)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
                            title="Remove Add-On"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* WARNING TOAST */}
      {warning.show && (
        <div className="fixed bottom-6 right-6 z-[110] animate-in slide-in-from-right-full duration-300">
          <div className="bg-amber-500 text-white p-4 rounded-xl shadow-xl flex items-center gap-3 border border-amber-600">
            <AlertCircle size={18} />
            <p className="text-xs font-bold">{warning.message}</p>
            <button
              onClick={() => setWarning({ show: false, message: "" })}
              className="ml-2 p-1 hover:bg-amber-600 rounded-lg transition border-none bg-transparent text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepVehiclePassDetails;
