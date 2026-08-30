import React from "react";
import { useNavigate } from "react-router-dom";

export default function Cancellation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-[#111827] flex flex-col font-sans select-none pb-24">
      {/* Hero Section with Unsplash Background */}
      <div 
        className="h-[200px] w-full bg-cover bg-center relative"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center px-6 md:px-12">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Cancellation and Refund Policy</h1>
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => navigate("/")}
              className="text-[#eab308] font-medium hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Home
            </button>
            <span className="text-white/60">&gt;</span>
            <span className="text-white/80 font-medium">Cancellation and Refund Policy</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto w-full px-6 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold text-[#2563eb] mb-6">
          Cancellations and Refunds Policy
        </h2>

        {/* Section 1 */}
        <div className="mt-6">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">1. Cancellations, Refunds, and Modifications</h3>
          
          <div className="mt-3">
            <h4 className="text-sm md:text-base font-bold text-[#111827] mb-1">1.1 Customer Cancellations</h4>
            <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-4">
              If a customer cancels their booking, the refund terms depend on the event organizer's cancellation policy, which will be stated at the time of booking. Refunds may be partial or full depending on the timing of the cancellation and the terms of the event organizer.
            </p>
          </div>

          <div className="mt-3">
            <h4 className="text-sm md:text-base font-bold text-[#111827] mb-1">1.2 Event Organizer Cancellations</h4>
            <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-4">
              If an event organizer cancels an event, the customer will be entitled to a full refund, minus any non-refundable platform fees and transaction charges.
            </p>
          </div>

          <div className="mt-3">
            <h4 className="text-sm md:text-base font-bold text-[#111827] mb-1">1.3 Modification of Bookings</h4>
            <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-4">
              Modifications to event bookings (such as date or time changes) can be made subject to approval by both the customer and the event organizer in accordance with their mutual agreement. Platform owners are not responsible for modifications or cancellations and merely act as an intermediary for the event booking process.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">2. Late Payments</h3>
          <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-3">
            <strong className="text-[#111827]">Customer Delays:</strong> If a customer fails to complete payment by the booking deadline, the platform may cancel the event or booking. A late fee may be applied, depending on the platform's policy.
          </p>
          <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
            <strong className="text-[#111827]">Event Organizer Delays:</strong> If an event organizer delays in receiving or providing funds for an event, it may result in the suspension or termination of their ability to list.
          </p>
        </div>

        {/* Section 3 */}
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">3. Dispute Resolution</h3>
          
          <div className="mt-3">
            <h4 className="text-sm md:text-base font-bold text-[#111827] mb-1">3.1 Customer Disputes</h4>
            <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-4">
              Customers must first contact the event organizer directly via the platform's messaging system for any event-related issues. If the issue cannot be resolved, the platform will mediate and work to resolve the dispute.
            </p>
          </div>

          <div className="mt-3">
            <h4 className="text-sm md:text-base font-bold text-[#111827] mb-1">3.2 Event Organizer Disputes</h4>
            <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-4">
              Event organizers who have concerns with the platform's processing of payments or policies must notify the platform immediately. The platform will review and attempt to resolve the dispute.
            </p>
          </div>

          <div className="mt-3">
            <h4 className="text-sm md:text-base font-bold text-[#111827] mb-1">3.3 Arbitration</h4>
            <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-4">
              Any disputes that cannot be resolved amicably shall be settled through binding arbitration in [jurisdiction/country], in accordance with the [insert relevant arbitration rules].
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">4. Platform's Rights and Responsibilities</h3>
          <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-3">
            <strong className="text-[#111827]">Intermediary Role:</strong> The platform acts as an intermediary to facilitate the booking and payment between the customer and event organizer. The platform is not responsible for the delivery of services or the quality of events.
          </p>
          <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
            <strong className="text-[#111827]">Suspension of Services:</strong> The platform reserves the right to suspend or terminate access to any user (customer or event organizer) who violates these Terms and Conditions or engages in fraudulent activity.
          </p>
        </div>

        {/* Section 5 */}
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">5. Intellectual Property</h3>
          <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
            The content available on the platform, including text, images, logos, designs, and other media, is owned or licensed by the platform owners. You may not use any of these materials without express permission from the platform owners. Users may not upload, share, or distribute content that violates the intellectual property rights of others.
          </p>
        </div>

        {/* Section 6 */}
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">6. User Conduct</h3>
          <p className="text-sm md:text-base text-[#4b5563] leading-relaxed mb-3">
            <strong className="text-[#111827]">Customer Responsibilities:</strong> Customers agree to provide accurate information when making a booking and comply with the event organizer's policies, including their cancellation policy and any event-specific rules.
          </p>
          <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
            <strong className="text-[#111827]">Event Organizer Responsibilities:</strong> Event organizers agree to provide accurate descriptions of their events, ensure availability on the listed dates, and comply with all applicable laws and regulations in the execution of their services. Users must not engage in fraudulent or malicious activities, including using false information, attempting to manipulate payments, or violating the privacy of other users.
          </p>
        </div>

        {/* Section 7 */}
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">7. Limitation of Liability</h3>
          <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
            The platform owners are not liable for any direct, indirect, incidental, or consequential damages resulting from the use of the platform, including issues related to event cancellations, poor service quality, or financial transactions.
          </p>
        </div>

        {/* Section 8 */}
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-bold text-[#111827] mb-3">8. Modifications to the Terms</h3>
          <p className="text-sm md:text-base text-[#4b5563] leading-relaxed">
            The platform owners reserve the right to modify these Terms and Conditions at any time. Users will be notified of any significant changes, and continued use of the platform after such modifications will constitute acceptance of the updated terms.
          </p>
        </div>
      </div>
    </div>
  );
}