import React from "react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-[#111827] flex flex-col font-sans select-none pb-24">
      {/* Hero Section with Unsplash Background */}
      <div 
        className="h-[200px] w-full bg-cover bg-center relative"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center px-6 md:px-12">
          <h1 className="text-3xl font-bold text-white mb-2">Terms and Conditions</h1>
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => navigate("/")}
              className="text-[#eab308] font-medium hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Home
            </button>
            <span className="text-white/60">&gt;</span>
            <span className="text-white/80 font-medium">Terms and Conditions</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto w-full px-6 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold text-[#2563eb] mb-6">
          Terms & Conditions for Use of the Book My Event
        </h2>
        
        <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-6">
          These Terms and Conditions ("Agreement") govern the use of the Book My Event website and services ("Platform"). Including the booking, payment, and interaction between customers, event organizers, and platform owners. By using the Platform, you ("User") agree to be bound by these terms.
        </p>

        {/* Section 1 */}
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">1. Introduction</h3>
          <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-4">
            These Terms and Conditions apply to the relationship between the platform owners ("we", "us", or "our"), event organizers ("Event Organizers"), and customers ("Customers") using our platform to book, organize, and pay for events. This Agreement governs the services provided by the platform, including but not limited to the payment processes, event booking, and dispute resolution.
          </p>
        </div>

        {/* Section 2 */}
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">2. Parties</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="text-[#4b5563] mt-1">•</span>
              <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
                <strong className="text-[#111827]">Customer:</strong> The person or entity who books an event through the platform.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#4b5563] mt-1">•</span>
              <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
                <strong className="text-[#111827]">Event Organizer:</strong> The person or entity providing the event services (such as venues, performers, equipment) for booking on the platform.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#4b5563] mt-1">•</span>
              <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
                <strong className="text-[#111827]">Platform Owners:</strong> The owners and operators of the platform, which acts as an intermediary to facilitate event bookings and related payments.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">3. Account Creation and Eligibility</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="text-[#4b5563] mt-1">•</span>
              <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
                To use the platform, you must create an account by providing accurate and complete information. You must be at least 18 years of age to book events or offer services through the platform.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#4b5563] mt-1">•</span>
              <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#4b5563] mt-1">•</span>
              <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
                You agree to immediately notify the platform of any unauthorized use of your account.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">4. Payment and Fees</h3>
          
          <div className="mt-4">
            <h4 className="text-sm md:text-base font-bold text-[#111827] mb-1">4.1 Payment Methods</h4>
            <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-4">
              Payments for event bookings on the platform must be made through the following methods: Credit/Debit cards (Visa, MasterCard, etc.), online payment services (PayPal, Stripe), or bank transfer, as available on the platform. Payments made through the platform are processed via third-party gateways to ensure secure transactions.
            </p>
          </div>

          <div className="mt-4">
            <h4 className="text-sm md:text-base font-bold text-[#111827] mb-1">4.2 Platform Fees</h4>
            <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-4">
              The platform charges a service fee, which is deducted from the total payment made by the customer to the event organizer. The applicable service fee is disclosed at the time of booking. Additional transaction fees, as imposed by payment processors, may apply and are either passed on to the customer or event organizer.
            </p>
          </div>

          <div className="mt-4">
            <h4 className="text-sm md:text-base font-bold text-[#111827] mb-1">4.3 Payment to Event Organizer</h4>
            <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-4">
              Event organizers will receive payment for their services, minus the platform's service fees, after the event is confirmed and payment is processed. Event organizers must provide accurate payment details (e.g., bank account or online wallet information) to receive funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
