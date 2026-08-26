import React, { useState, useEffect } from "react";
import { Trash2, Edit, X, Plus } from "lucide-react";

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
      setFormData(prev => ({
        ...prev,
        vehicleProvision: {
          ...(prev?.vehicleProvision || {}),
          details: [
            { vehicleType: "Two Wheeler", priceINR: "0", priceUSD: "0" },
            { vehicleType: "Four Wheeler", priceINR: "0", priceUSD: "0" },
            { vehicleType: "Heavy Vehicle", priceINR: "0", priceUSD: "0" }
          ]
        }
      }));
    }
  }, []);

  const showModal = (msg) => {
    setWarning({ show: true, message: msg });
    setTimeout(() => setWarning({ show: false, message: "" }), 5000);
  };

  const addVehicleDetail = () => {
    const newItem = {
      vehicleType: "",
      priceINR: "0",
      priceUSD: "0",
    };

    setFormData({
      ...formData,
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
      [field]: value
    };
    setFormData({
      ...formData,
      vehicleProvision: {
        ...formData.vehicleProvision,
        details: updated
      }
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

  const inputClasses = "w-full h-9 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-semibold";
  const tableHeaderClasses = "bg-slate-50 text-slate-700 text-[11px] font-bold p-2.5 text-left border-b border-slate-200";
  const tableCellClasses = "p-2.5 text-xs text-slate-800 border-b border-slate-100 font-semibold";

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* LEFT SECTION: VEHICLE DETAILS */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80">
          <h2 className="text-sm font-extrabold text-slate-900 mb-3 border-l-4 border-cyan-500 pl-2.5">Vehicle Details</h2>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={tableHeaderClasses}>Action</th>
                  <th className={tableHeaderClasses}>Vehicle Type</th>
                  <th className={tableHeaderClasses}>Entry Price *</th>
                </tr>
              </thead>
              <tbody>
                {vehicleDetails.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-400 text-sm italic">
                      No Vehicle Details Found.
                    </td>
                  </tr>
                ) : (
                  vehicleDetails.map((item, index) => (
                    <tr key={index} className="bg-white">
                      <td className="p-3 border-b border-gray-100">
                        <div className="flex gap-2">
                          <button
                            onClick={addVehicleDetail}
                            className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-all"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => removeVehicle(index)}
                            className="p-1.5 rounded border border-gray-200 text-red-400 hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 border-b border-gray-100">
                        <input
                          placeholder="Vehicle Type"
                          value={item.vehicleType}
                          onChange={(e) => updateVehicleDetail(index, "vehicleType", e.target.value)}
                          className={inputClasses}
                        />
                      </td>
                      <td className="p-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 h-[40px] w-full">
                            <span className="text-gray-500 mr-2">₹</span>
                            <input
                              placeholder="Price in"
                              value={item.priceINR}
                              onChange={(e) => updateVehicleDetail(index, "priceINR", e.target.value.replace(/[^0-9.]/g, ""))}
                              className="bg-transparent outline-none w-full text-sm"
                            />
                          </div>
                          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 h-[40px] w-32">
                            <span className="text-gray-500 mr-2">$</span>
                            <input
                              placeholder="0"
                              value={item.priceUSD}
                              onChange={(e) => updateVehicleDetail(index, "priceUSD", e.target.value.replace(/[^0-9.]/g, ""))}
                              className="bg-transparent outline-none w-full text-sm"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SECTION: ADD-ON DETAILS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-blue-600 mb-6">Add-On Details</h2>

          <div className="mb-4">
            <div className="inline-block border-b-2 border-blue-600 px-4 py-2 text-blue-600 font-bold text-sm">
              NATIONAL
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={tableHeaderClasses}>Action</th>
                  <th className={tableHeaderClasses}>Is Parent</th>
                  <th className={tableHeaderClasses}>Add-On Name</th>
                  <th className={tableHeaderClasses}>Price *</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="p-3 border-b border-gray-100">
                    <div className="flex gap-2">
                      <button onClick={addAddOn} className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-600 transition-all">
                        <Plus size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-100 text-center">
                    <input
                      type="checkbox"
                      checked={isParent}
                      onChange={(e) => setIsParent(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3 border-b border-gray-100">
                    <input
                      placeholder="Add-On Name"
                      value={addOnName}
                      onChange={(e) => setAddOnName(e.target.value)}
                      className={inputClasses}
                    />
                  </td>
                  <td className="p-3 border-b border-gray-100">
                    <input
                      placeholder="0.00"
                      value={addOnPrice}
                      onChange={(e) => setAddOnPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                      className={inputClasses}
                    />
                  </td>
                </tr>
                {addOnDetails.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-400 text-sm italic">
                      No Data Found.
                    </td>
                  </tr>
                ) : (
                  addOnDetails.map((item, index) => (
                    <tr key={index}>
                      <td className={tableCellClasses}>
                        <button onClick={() => removeAddOn(index)} className="p-1.5 rounded border border-gray-200 text-red-400 hover:bg-red-50 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </td>
                      <td className={tableCellClasses + " text-center"}>{item.isParent ? "Yes" : "No"}</td>
                      <td className={tableCellClasses}>{item.addOnName}</td>
                      <td className={tableCellClasses}>{item.price}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* WARNING TOAST */}
      {warning.show && (
        <div className="fixed bottom-6 right-6 z-[110] animate-in slide-in-from-right-full duration-500">
          <div className="bg-[#ff8a3d] text-white p-5 rounded-xl shadow-2xl flex items-start gap-4 max-w-sm relative overflow-hidden border-l-8 border-orange-600/30">
            <div className="flex-1 pr-6">
              <h3 className="font-bold text-lg mb-1 leading-tight">Warning</h3>
              <p className="text-sm font-medium opacity-95">{warning.message}</p>
            </div>
            <button onClick={() => setWarning({ show: false, message: "" })} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepVehiclePassDetails;
