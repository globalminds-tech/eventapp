import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MapPin, 
  Calendar, 
  Utensils, 
  Loader2, 
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { validateQr } from "@/Services/api";

export default function QRValidation() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const performValidation = async () => {
      try {
        setLoading(true);
        const data = await validateQr(id);
        setResult(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to validate ticket");
      } finally {
        setLoading(false);
      }
    };

    performValidation();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/80 flex flex-col items-center text-center animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-4">
            <Loader2 className="w-7 h-7 text-cyan-600 animate-spin" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">Validating Pass</h3>
          <p className="text-xs text-slate-400 mt-1 font-semibold">Checking attendee gate authorization...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-rose-200/80 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mb-1">Invalid Ticket</h1>
          <p className="text-xs text-slate-500 mb-6 font-medium max-w-xs">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition shadow-sm cursor-pointer"
          >
            Scan Next Ticket
          </button>
        </div>
      </div>
    );
  }

  const isSuccess = result.status === "success";

  return (
    <div className={`min-h-screen p-6 flex flex-col items-center justify-center ${isSuccess ? 'bg-green-50' : 'bg-orange-50'}`}>
      <div className="max-w-md w-full animate-fade-in">
        
        {/* Status Card */}
        <div className={`bg-white rounded-[40px] shadow-2xl overflow-hidden border-b-8 ${isSuccess ? 'border-green-500' : 'border-orange-500'}`}>
           
           {/* Header Info */}
           <div className={`p-10 text-center ${isSuccess ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
              <div className="flex justify-center mb-4">
                 {isSuccess ? 
                    <ShieldCheck className="w-16 h-16" /> : 
                    <XCircle className="w-16 h-16" />
                 }
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                 {isSuccess ? "Verified ✓" : "Already Used"}
              </h1>
              <p className="opacity-80 font-bold mt-1 uppercase text-xs tracking-widest">
                 {result.message}
              </p>
           </div>

           {/* Visitor Info */}
           <div className="p-8 space-y-8">
              
              {result.details.ticket_code && (
                <div className="bg-cyan-50 border border-cyan-100 p-3.5 rounded-2xl flex items-center justify-between">
                   <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Ticket Code</span>
                   <span className="font-mono font-black text-cyan-700 text-sm tracking-wider">{result.details.ticket_code}</span>
                </div>
              )}

              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-4">Visitor Details</p>
                 <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl">
                    <div className="w-12 h-12 bg-white shadow-sm rounded-2xl flex items-center justify-center">
                       <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-gray-400 uppercase">Name</p>
                       <p className="text-lg font-black text-gray-900 leading-none">{result.details.visitor_name}</p>
                    </div>
                 </div>
              </div>

              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-4">Event Information</p>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <Calendar className="w-5 h-5 text-blue-500" />
                       <p className="font-bold text-gray-700">{result.details.event_name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                       <MapPin className="w-5 h-5 text-gray-400" />
                       <p className="font-medium text-gray-500">{result.details.venue}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                       <Clock className="w-5 h-5 text-gray-400" />
                       <p className="font-medium text-gray-500">{result.details.date} at {result.details.time}</p>
                    </div>
                 </div>
              </div>

              <div className={`grid ${result.details.include_food ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                 {result.details.include_food && (
                    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Meal</p>
                        <div className="flex items-center gap-2">
                        <Utensils className={`w-4 h-4 ${result.details.food === 'Veg' ? 'text-green-500' : 'text-red-500'}`} />
                        <span className="font-black text-gray-800">{result.details.food}</span>
                        </div>
                    </div>
                 )}
                 <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Type</p>
                    <span className="font-black text-gray-800">VISITOR</span>
                 </div>
              </div>

              {!isSuccess && result.details.scanned_at && (
                 <div className="p-4 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-xs font-bold text-red-900 leading-tight">
                       Last scanned on {new Date(result.details.scanned_at).toLocaleString()}
                    </p>
                 </div>
              )}

           </div>
        </div>

        <p className="text-center mt-8 text-gray-400 text-xs font-bold tracking-widest uppercase opacity-50">
           Digital Verification System v2.0
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  );
}
