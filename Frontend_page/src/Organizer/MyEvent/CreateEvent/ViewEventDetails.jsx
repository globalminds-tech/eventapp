import React, { useEffect, useState } from "react";
import { getFullEventDetails } from "../../../Services/api";
import { X, Calendar, Clock, MapPin, Users, Ticket, Tag, FileText, AlertCircle, Eye } from "lucide-react";
import MediaRenderer from "../../../components/MediaRenderer";

const ViewEventDetails = ({ eventId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getFullEventDetails(eventId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatDateOnly = (dateString) => {
    if (!dateString) return null;
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toISOString().split("T")[0]; // YYYY-MM-DD formatting
    } catch {
      return dateString;
    }
  };

  const isTruthy = (val) => val === true || val === 1 || val === "1" || val === "true" || val === "Yes" || val === "yes";

  const { eventDetails = {}, booking = {}, layout = {}, documents = {}, terms = [], vendors = [], sponsors = [], guests = [] } = data || {};

  const food_items = data.food_items || data.food || data.foodProvision?.items || data.foodProvision?.foodItems || [];
  const vehicle_details = data.vehicle_details || data.vehicles || data.vehicleProvision?.details || data.vehicleProvision?.vehicles || [];
  const vehicle_addons = data.vehicle_addons || data.addons || data.vehicleProvision?.addons || [];
  const docList = documents?.docs || documents?.additionalDocs || documents?.existingFiles || data.files || [];

  const hasFood = isTruthy(eventDetails?.food) || food_items.length > 0;
  const hasVehicle = isTruthy(eventDetails?.vehicle_pass || eventDetails?.vehiclePass) || vehicle_details.length > 0 || vehicle_addons.length > 0;

  const tabs = [
    { id: 1, label: "Event Details" },
    { id: 2, label: "Booking" },
    ...(hasFood ? [{ id: 7, label: "Food Provision" }] : []),
    ...(hasVehicle ? [{ id: 8, label: "Vehicle Provision" }] : []),
    { id: 3, label: "Layout & Stall" },
    { id: 4, label: "Documents" },
    { id: 5, label: "Terms" },
    { id: 6, label: "Vendor & Partners" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in px-6 py-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden relative">

        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {eventDetails?.eventName || eventDetails?.event_name || 'Event Details'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Read-only view of the event configuration</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-all focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* TABS */}
        <div className="px-8 border-b border-gray-200 bg-white shadow-sm z-10 flex overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 text-sm font-semibold whitespace-nowrap transition-all border-b-2
                ${activeTab === tab.id
                  ? "border-indigo-600 text-indigo-700 bg-indigo-50/30"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">

          {/* TAB 1: Event Details */}
          {activeTab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <Tag className="w-5 h-5 text-indigo-500" /> General Info
                  </h3>

                  {/* Banner Preview */}
                  {(eventDetails?.banner_url || eventDetails?.bannerPreview) && (
                    <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      <MediaRenderer
                        src={eventDetails.banner_url || eventDetails.bannerPreview}
                        type={eventDetails.banner_type || eventDetails.bannerType || "image"}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <DetailItem label="Event Category" value={eventDetails?.category ? `${eventDetails.category}${eventDetails.subCategory || eventDetails.sub_category ? ` (${eventDetails.subCategory || eventDetails.sub_category})` : ''}` : ''} />
                    <DetailItem label="Event Name" value={eventDetails?.eventName || eventDetails?.event_name} />
                    <DetailItem label="About Event" value={eventDetails?.description} />
                    <DetailItem label="Amenities" value={eventDetails?.amenities} />
                    <DetailItem label="Tags" value={eventDetails?.tags} />
                    <DetailItem label="Status" value={eventDetails?.status || "Active"} isBadge />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <Calendar className="w-5 h-5 text-emerald-500" /> Time & Place
                  </h3>
                  <div className="space-y-4">
                    <DetailItem label="Event Type" value={eventDetails?.eventType || eventDetails?.event_type || "One-Time"} />
                    <div className="grid grid-cols-2 gap-4">
                      <DetailItem label="Start Date" value={formatDateOnly(eventDetails?.startDate || eventDetails?.start_date)} />
                      <DetailItem label="Start Time" value={eventDetails?.startTime || eventDetails?.start_time} />
                      <DetailItem label="End Date" value={formatDateOnly(eventDetails?.endDate || eventDetails?.end_date)} />
                      <DetailItem label="End Time" value={eventDetails?.endTime || eventDetails?.end_time} />
                    </div>
                    {eventDetails?.occurrence && <DetailItem label="Frequency" value={eventDetails.occurrence} />}
                    <div className="pt-2 border-t border-gray-50">
                      <DetailItem label="Venue" value={eventDetails?.venue} />
                      <DetailItem label="Address" value={eventDetails?.address} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-purple-500" /> Settings & Requirements
                  </h3>
                  <div className="space-y-4">
                    <DetailItem label="Visibility" value={eventDetails?.visibility || "Public"} />
                    <DetailItem label="Include Program" value={eventDetails?.includeProgram || eventDetails?.include_program || "No"} />

                    <div className="pt-2">
                      <p className="text-xs font-bold text-gray-500 mb-2">Communication</p>
                      <div className="flex gap-2 flex-wrap">
                        {isTruthy(eventDetails?.mail) && <Badge>Email</Badge>}
                        {isTruthy(eventDetails?.whatsapp) && <Badge>WhatsApp</Badge>}
                        {isTruthy(eventDetails?.print) && <Badge>Print</Badge>}
                        {!isTruthy(eventDetails?.mail) && !isTruthy(eventDetails?.whatsapp) && !isTruthy(eventDetails?.print) && (
                          <span className="text-xs text-gray-400 italic">None selected</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs font-bold text-gray-500 mb-2">On-spot requirements</p>
                      <div className="flex gap-2 flex-wrap">
                        {isTruthy(eventDetails?.visitorMail || eventDetails?.visitor_mail) && <Badge>Email ID</Badge>}
                        {isTruthy(eventDetails?.visitorName || eventDetails?.visitor_name) && <Badge>Full Name</Badge>}
                        {isTruthy(eventDetails?.visitorPhoto || eventDetails?.visitor_photo) && <Badge>Photo</Badge>}
                        {isTruthy(eventDetails?.visitorMobile || eventDetails?.visitor_mobile) && <Badge>Mobile</Badge>}
                        {isTruthy(eventDetails?.documentProof || eventDetails?.document_proof) && <Badge>ID Proof</Badge>}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <DetailItem label="Day Pass" value={isTruthy(eventDetails?.dayPass || eventDetails?.day_pass) ? 'Yes' : 'No'} />
                      <DetailItem label="International" value={isTruthy(eventDetails?.isInternationalInclude || eventDetails?.is_international_include) ? 'Yes' : 'No'} />
                    </div>

                    <div className="pt-2 border-t border-gray-50">
                      <p className="text-xs font-bold text-gray-500 mb-2">Mandatory documents</p>
                      <div className="flex gap-2 flex-wrap">
                        {isTruthy(eventDetails?.aadhar) && <Badge color="indigo">Aadhar</Badge>}
                        {isTruthy(eventDetails?.passport) && <Badge color="indigo">Passport</Badge>}
                        {isTruthy(eventDetails?.vehicleNumber || eventDetails?.vehicle_number) && <Badge color="indigo">Vehicle Number</Badge>}
                        {!isTruthy(eventDetails?.aadhar) && !isTruthy(eventDetails?.passport) && !isTruthy(eventDetails?.vehicleNumber || eventDetails?.vehicle_number) && (
                          <span className="text-xs text-gray-400 italic">None mandatory</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Booking */}
          {activeTab === 2 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-8">
                <Ticket className="w-6 h-6 text-indigo-500" /> Booking Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-indigo-600 tracking-wider border-b pb-2">Schedule & limits</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Booking Start Date" value={formatDateOnly(booking?.bookingStartDate || booking?.booking_start_date)} />
                    <DetailItem label="Booking End Date" value={formatDateOnly(booking?.bookingEndDate || booking?.booking_end_date)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Total Capacity" value={booking?.totalCapacity || booking?.capacity || 500} />
                    <DetailItem label="Max Pass Per User" value={booking?.maxPass || booking?.maxPerUser || booking?.max_pass || 4} />
                  </div>
                  <DetailItem label="Pass Type" value={booking?.passType || booking?.pass_type || "Single Pass"} />
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-indigo-600 tracking-wider border-b pb-2">Form visibility configuration</h4>
                  <DetailItem label="Title Setup" value={`${booking?.titleType || booking?.title_type || 'N/A'} - ${isTruthy(booking?.titleSelection || booking?.title_selection) ? 'Required' : 'Optional'}`} />
                  <DetailItem label="Designation Setup" value={`${booking?.designationType || booking?.designation_type || 'N/A'} - ${isTruthy(booking?.designationSelection || booking?.designation_selection) ? 'Required' : 'Optional'}`} />
                  <DetailItem label="Company Setup" value={`${booking?.companyType || booking?.company_type || 'N/A'} - ${isTruthy(booking?.companySelection || booking?.company_selection) ? 'Required' : 'Optional'}`} />
                </div>

                <div className="space-y-6 md:col-span-2 mt-4">
                  <h4 className="text-sm font-bold text-indigo-600 tracking-wider border-b pb-2">Pricing & entry</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem label="Entry Type" value={booking?.entryType || booking?.entry_type || "Single Entry"} />
                    <DetailItem label="Charge Type" value={booking?.chargeType || booking?.charge_type || "Free"} />
                    <DetailItem label="Include Tax" value={isTruthy(booking?.includeTax || booking?.include_tax) ? 'Yes' : 'No'} />
                  </div>
                  {(booking?.chargeType === 'Paid' || booking?.charge_type === 'Paid') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <DetailItem label="Ticket Price (INR)" value={`₹${booking?.priceINR || booking?.price_inr || booking?.price || 0}`} />
                      <DetailItem label="Price Type" value={booking?.priceType || booking?.price_type || "National"} />
                      <DetailItem label="Currency" value={booking?.currency || "INR"} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Food Provision */}
          {activeTab === 7 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                  <Users size={22} />
                </div>
                Food Provision Details
              </h3>

              {(!food_items || food_items.length === 0) ? (
                <p className="text-gray-500 italic py-8 text-center bg-gray-50 rounded-xl">No food details configured.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {food_items.map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DetailItem label="Caterer Name" value={item.caterer_name} />
                        <DetailItem label="Meal Type" value={item.meal_type} />
                        <DetailItem label="Food Type" value={item.food_type} />
                        <DetailItem label="Price (INR)" value={`₹${item.price_inr}`} />
                        <DetailItem label="Price (USD)" value={`$${item.price_usd}`} />
                        <div className="md:col-span-3">
                          <DetailItem label="Menu Details" value={item.menu_details} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: Vehicle Provision */}
          {activeTab === 8 && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <MapPin size={22} />
                  </div>
                  Vehicle Pass Details
                </h3>

                {(!vehicle_details || vehicle_details.length === 0) ? (
                  <p className="text-gray-500 italic py-8 text-center bg-gray-50 rounded-xl">No vehicle details configured.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {vehicle_details.map((item, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <DetailItem label="Vehicle Type" value={item.vehicle_type} />
                        <div className="flex gap-6 mt-3">
                          <DetailItem label="Price (INR)" value={`₹${item.price_inr}`} />
                          <DetailItem label="Price (USD)" value={`$${item.price_usd}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-6">Vehicle Add-ons</h3>
                {(!vehicle_addons || vehicle_addons.length === 0) ? (
                  <p className="text-gray-500 italic py-6 text-center bg-gray-50 rounded-xl">No add-ons configured.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicle_addons.map((addon, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{addon.addon_name}</p>
                          {addon.is_parent === 1 && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Parent</span>}
                        </div>
                        <p className="font-bold text-indigo-600">₹{addon.price}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Layout & Stall */}
          {activeTab === 3 && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-8 items-center justify-between">
                <div className="flex gap-8">
                  <DetailItem label="Floor Type" value={layout?.floorType || layout?.floor_type || layout?.layout?.floor_type || 'Stall'} />
                  <DetailItem label="Day Based" value={isTruthy(layout?.dayBased || layout?.day_based || layout?.layout?.day_based) ? 'Yes' : 'No'} />
                  <DetailItem label="Include Tax" value={isTruthy(layout?.includeTax || layout?.include_tax || layout?.layout?.include_tax) ? 'Yes' : 'No'} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Stall Configured</h3>

                {(!layout?.stalls && !layout?.stallList && (!data?.stalls || data.stalls.length === 0)) ? (
                  <p className="text-gray-500 italic py-8 text-center bg-gray-50 rounded-xl">No stalls configured.</p>
                ) : (
                  <div className="overflow-x-auto rounded-3xl shadow-xl">
                    <table className="w-full">
                      <thead className="bg-sky-600 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-wider">Stall name</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-wider">Size</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-wider">Visibility</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-wider">Price (INR)</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-wider">Prime price (INR)</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white tracking-wider">Prime seat check</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(layout?.stalls || layout?.stallList || data?.stalls || []).map((stall, idx) => (
                          <tr key={idx} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                            <td className="px-6 py-4 font-medium text-gray-900">{stall.stall_name || stall.stallName}</td>
                            <td className="px-6 py-4 text-gray-600">{stall.stall_size || stall.size}</td>
                            <td className="px-6 py-4 text-gray-600">{stall.stall_type || stall.type}</td>
                            <td className="px-6 py-4 text-gray-600">{stall.visibility || "Public"}</td>
                            <td className="px-6 py-4 text-gray-900 font-medium text-right">₹{stall.price_inr || stall.priceINR || stall.price || 0}</td>
                            <td className="px-6 py-4 text-gray-900 font-medium text-right">₹{stall.prime_price_inr || stall.primePriceINR || 0}</td>
                            <td className="px-6 py-4 text-center">
                              {isTruthy(stall.prime_seat || stall.primeSeat) ? '✅' : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Documents */}
          {activeTab === 4 && (
            <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -mr-10 -mt-10" />

                <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-3 relative">
                  <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                    <FileText size={22} />
                  </div>
                  Event Verification Documents
                </h3>

                {(!docList || docList.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                    <div className="px-6 py-4 bg-gray-100 rounded-full mb-4">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-bold tracking-widest text-xs">No documents uploaded</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                    {docList.map((doc, idx) => {
                      const fileUrl = doc.file_url || doc.file_path || doc.preview;
                      const fileType = doc.file_type || doc.type || 'file';
                      return (
                        <div key={idx} className="group overflow-hidden bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500 flex flex-col">
                          {/* Top Preview/Icon */}
                          <div className="h-40 bg-slate-900 relative overflow-hidden group/media">
                            {fileUrl ? (
                              fileType?.includes('image') || fileUrl.match(/\.(jpeg|jpg|png|webp|gif)$/i) ? (
                                <MediaRenderer
                                  src={fileUrl}
                                  type="image"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 gap-3">
                                  <div className="px-6 py-4 bg-slate-700/50 rounded-2xl shadow-inner group-hover/media:scale-110 group-hover/media:text-indigo-400 transition-all duration-500">
                                    <FileText size={40} />
                                  </div>
                                  <span className="text-[10px] font-black tracking-[0.2em]">Document file</span>
                                </div>
                              )
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                <FileText size={48} className="mb-2 opacity-50" />
                                <span className="text-[10px] font-black tracking-tighter">Document preview</span>
                              </div>
                            )}

                            {/* Floating Type Badge */}
                            <div className="absolute top-4 left-4 z-10">
                              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-black text-indigo-600 rounded-full shadow-sm border border-indigo-50 leading-none">
                                {doc.doc_type || doc.type || 'DOCUMENT'}
                              </span>
                            </div>

                            {/* Hover Overlay View Button */}
                            {fileUrl && (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-indigo-600/60 backdrop-blur-[2px] opacity-0 group-hover/media:opacity-100 transition-all duration-300 flex items-center justify-center z-20"
                              >
                                <div className="px-6 py-2.5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 transform translate-y-4 group-hover/media:translate-y-0 transition-transform duration-500">
                                  <Eye size={16} /> View Document
                                </div>
                              </a>
                            )}
                          </div>

                          {/* Info Part */}
                          <div className="p-6 flex flex-col gap-1">
                            <h4 className="text-lg font-black text-gray-900 leading-tight">
                              {doc.doc_type || doc.type || 'Event Document'}
                            </h4>
                            <p className="text-sm font-bold text-gray-400 mb-4">{doc.file_name || doc.name || 'Uploaded File'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Terms */}
          {activeTab === 5 && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Terms & Policies Configured</h3>

                {(!terms || terms.length === 0) ? (
                  <p className="text-gray-500 text-center py-8 italic bg-gray-50 rounded-xl">No terms attached to this event.</p>
                ) : (
                  <div className="space-y-4">
                    {terms.map((term, idx) => (
                      <div key={idx} className="relative flex flex-col p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                            {term.policy_group || term.policyGroup || "General"} &gt; {term.policy_type || term.policyType || "Policy"}
                          </span>
                          {(term.is_default || term.isDefault) && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-extrabold uppercase">
                              Default Policy
                            </span>
                          )}
                        </div>
                        <span className="text-gray-900 font-bold text-sm">
                          {term.policy_name || term.policyName || term.name || `Policy #${idx + 1}`}
                        </span>
                        <p className="text-xs font-medium text-gray-600 leading-relaxed pt-1">
                          {term.description || term.details || term.policy_name || term.policyName || "Standard terms apply."}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Vendor, Sponsors & Guests */}
          {activeTab === 6 && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                  <Users className="w-6 h-6 text-indigo-500" /> Vendors, Sponsors & Guests
                </h3>

                {/* Vendors */}
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-indigo-600 tracking-wider border-b pb-2 mb-4">Vendors</h4>
                  {(!vendors || vendors.length === 0) ? (
                    <p className="text-gray-500 text-sm">No vendors attached.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vendors.map((v, idx) => (
                        <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-100 focus-within:ring-2 ring-indigo-500 transition">
                          <DetailItem label="Vendor Name" value={v.vendor_name} />
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <DetailItem label="Type" value={v.vendor_type} />
                            <DetailItem label="Pass Count" value={v.pass_count} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sponsors */}
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-indigo-600 tracking-wider border-b pb-2 mb-4">Sponsors</h4>
                  {(!sponsors || sponsors.length === 0) ? (
                    <p className="text-gray-500 text-sm ">No sponsors attached.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sponsors.map((v, idx) => (
                        <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-100 transition">
                          <DetailItem label="Sponsor Name" value={v.sponsor_name} />
                          <div className="mt-3">
                            <DetailItem label="Sponsorship Type" value={v.sponsorship_type} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Guests */}
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 tracking-wider border-b pb-2 mb-4">Guests</h4>
                  {(!guests || guests.length === 0) ? (
                    <p className="text-gray-500 text-sm">No guests attached.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {guests.map((v, idx) => (
                        <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-100 transition flex gap-4 items-center">
                          {(v.image_url || v.image) ? (
                            <img
                              src={v.image_url || v.image}
                              alt={v.guest_name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-300 font-black text-xl shrink-0">
                              {v.guest_name ? v.guest_name.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <DetailItem label="Guest Name" value={v.guest_name} />
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <DetailItem label="Designation" value={v.designation} />
                              <DetailItem label="Contact" value={v.contact} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// UI Components
const DetailItem = ({ label, value, isBadge }) => (
  <div>
    <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-1">
      {label && label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
    </p>
    {isBadge ? (
      <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
        {value || 'N/A'}
      </span>
    ) : (
      <p className="text-gray-900 font-medium">{value === null || value === '' || value === undefined ? <span className="text-gray-400 italic">Not set</span> : value}</p>
    )}
  </div>
);

const Badge = ({ children, color = "emerald" }) => (
  <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold bg-${color}-50 text-${color}-700 border border-${color}-100`}>
    {children}
  </span>
);

export default ViewEventDetails;
