import * as XLSX from 'xlsx';

/**
 * Excel & CSV Service for Bulk Category Import and 7-Step Event Creation Auto-Fill
 */

// Preset Demo Data for instant 1-Click Auto-Fill of 7-Step Event Creation Wizard
export const DEMO_EVENT_DATA = {
  // Step 1: Event Details
  step1: {
    eventName: "Global Tech & Startup Summit 2026",
    eventCode: "GTSS-2026",
    category: "Tech",
    subCategory: "Software & AI",
    customCategory: "",
    eventType: "Public",
    occurrence: "Single",
    visibility: "Public",
    startDate: "2026-10-15",
    endDate: "2026-10-17",
    startTime: "09:00",
    endTime: "18:00",
    venue: "Grand Convention Center, Tech Park",
    address: "100 Innovation Way, Cyber City, Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560100",
    description: "The premier global tech conference bringing together AI pioneers, startup founders, developers, and venture capitalists for 3 days of keynotes and networking.",
    amenities: ["Free High-Speed Wi-Fi", "AC Auditorium", "VIP Lounge", "Food Court", "Parking Space", "Live Broadcast"],
    tags: ["Tech", "AI", "Startups", "Networking", "Innovation", "Conference"],
    includeProgram: "Yes",
    mail: true,
    whatsapp: true,
    print: true,
    visitorMail: true,
    visitorName: true,
    visitorPhoto: true,
    visitorMobile: true,
    documentProof: true,
    dayPass: true,
    isInternationalInclude: true,
    welcomeKit: true,
    food: true,
    vehiclePass: true,
  },

  // Step 2: Booking & Ticket Tiers
  step2: {
    bookingStartDate: "2026-09-01",
    bookingEndDate: "2026-10-14",
    capacity: 2500,
    entryType: "Paid",
    chargeType: "Per Ticket",
    currency: "INR",
    includeTax: true,
    ticketTiers: [
      {
        id: 1,
        title: "Early Bird General Access",
        passType: "General",
        price: 1499,
        maxPass: 5,
        totalQuantity: 1000,
        perks: "Access to main hall, exhibition zone, and welcome kit.",
        earlyBirdExpire: "2026-09-20T23:59:59"
      },
      {
        id: 2,
        title: "VIP Executive Pass",
        passType: "VIP",
        price: 4999,
        maxPass: 3,
        totalQuantity: 300,
        perks: "Front row seating, VIP lounge buffet lunch, speaker meet & greet.",
        earlyBirdExpire: "2026-09-30T23:59:59"
      },
      {
        id: 3,
        title: "Student Pass",
        passType: "Student",
        price: 499,
        maxPass: 2,
        totalQuantity: 500,
        perks: "Student ID verification required. Access to hackathon & keynotes.",
        earlyBirdExpire: "2026-10-10T23:59:59"
      }
    ]
  },

  // Step 3: Stall & Floor Plan Layout
  step3: {
    floorType: "Grid Matrix",
    dayBased: true,
    personPassPerStall: 4,
    includeTax: true,
    taxes: "18% GST Included",
    totalStalls: 40,
    stallTypes: [
      { name: "Premium Corner Booth (3x3m)", price: 25000, count: 10 },
      { name: "Standard Shell Scheme (3x3m)", price: 15000, count: 20 },
      { name: "Startup Bare Space (2x2m)", price: 8000, count: 10 }
    ]
  },

  // Step 4: Documents & Media
  step4: {
    bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
    eventLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
    promotionalVideo: "https://www.youtube.com/watch?v=demo_tech_summit",
    brochureUrl: "https://example.com/docs/tech_summit_2026_brochure.pdf",
    files: [
      { fileName: "Event_Proposal.pdf", fileType: "PDF", docType: "Proposal" },
      { fileName: "Safety_Permit_BBMP.pdf", fileType: "PDF", docType: "Permit" }
    ]
  },

  // Step 5: Terms & Policies
  step5: {
    policyGroup: "Standard Event Policies",
    termsList: [
      { policyName: "Cancellation & Refund", description: "Full refund available up to 7 days before the event start date. 50% refund thereafter." },
      { policyName: "Code of Conduct", description: "All attendees, speakers, and sponsors must adhere to professional anti-harassment guidelines." },
      { policyName: "Identity Verification", description: "Government issued Photo ID mandatory for entry badge collection at the registration desk." }
    ]
  },

  // Step 6: Vendors & Sponsors
  step6: {
    sponsors: [
      { name: "Apex Tech Ventures", tier: "Title Sponsor", logo: "", contribution: "₹10,00,000" },
      { name: "CloudScale Systems", tier: "Platinum Sponsor", logo: "", contribution: "₹5,00,000" }
    ],
    vendors: [
      { vendorName: "Royal Catering Services", serviceType: "Food & Beverage", contact: "+91 9876543210" },
      { vendorName: "SoundVision AV Works", serviceType: "Audio/Visual & Stage Lighting", contact: "+91 9123456789" }
    ]
  },

  // Step 7: Guests & Food Perks
  step7: {
    guests: [
      { guestName: "Dr. Sarah Lin", designation: "AI Director @ Global Mind Labs", contact: "sarah.lin@example.com" },
      { guestName: "Vikram Malhotra", designation: "Founder & CEO @ ScaleUp India", contact: "vikram@scaleup.in" }
    ],
    foodMeals: [
      { mealType: "Breakfast", options: "Veg & Non-Veg Buffet", timings: "08:30 - 10:00 AM" },
      { mealType: "Executive Lunch", options: "Multi-Cuisine VIP Spread", timings: "13:00 - 14:30 PM" }
    ]
  }
};

/**
 * Parses uploaded Excel (.xlsx, .xls) or CSV file into JSON array
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        resolve({
          sheetNames: workbook.SheetNames,
          data: jsonData,
          workbook: workbook
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Downloads a sample Excel file for Category Bulk Ingestion
 */
export const downloadCategorySampleExcel = () => {
  const sampleCategories = [
    { "Main Category": "Music & Concerts", "Subcategory": "EDM / Electronic", "Description": "Live electronic music festivals and DJ sets" },
    { "Main Category": "Music & Concerts", "Subcategory": "Rock & Metal", "Description": "Rock bands and live metal gigs" },
    { "Main Category": "Tech & Innovation", "Subcategory": "Software & AI", "Description": "AI hackathons, software keynotes, and dev meetups" },
    { "Main Category": "Tech & Innovation", "Subcategory": "Web3 & Crypto", "Description": "Blockchain summits and decentralized tech expos" },
    { "Main Category": "Sports & Fitness", "Subcategory": "Cricket", "Description": "Cricket tournaments, leagues, and coaching camps" },
    { "Main Category": "Sports & Fitness", "Subcategory": "Marathon & Running", "Description": "City marathons, 10K runs, and fitness expos" },
    { "Main Category": "Food & Festivals", "Subcategory": "Street Food Fest", "Description": "Local street food vendor showcases and tasting" },
    { "Main Category": "Arts & Theatre", "Subcategory": "Standup Comedy", "Description": "Live comedy shows and open mics" }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleCategories);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
  XLSX.writeFile(workbook, "Sample_Categories_Bulk_Import.xlsx");
};

/**
 * Downloads a sample Excel file for 7-Step Event Creation Wizard
 */
export const downloadEventCreationSampleExcel = () => {
  const eventSheet = [
    {
      "Event Name": "Global Tech Summit 2026",
      "Event Code": "GTS-2026",
      "Category": "Tech",
      "Subcategory": "Software & AI",
      "Event Type": "Public",
      "Start Date": "2026-10-15",
      "End Date": "2026-10-17",
      "Start Time": "09:00",
      "End Time": "18:00",
      "Venue": "Grand Convention Center",
      "Address": "100 Innovation Way, Cyber City",
      "City": "Bangalore",
      "State": "Karnataka",
      "Pincode": "560100",
      "Description": "Premier global tech conference",
      "General Ticket Price": 1499,
      "VIP Ticket Price": 4999,
      "Total Capacity": 2500,
      "Stall Count": 40
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(eventSheet);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "EventDetails");
  XLSX.writeFile(workbook, "Sample_Event_Creation_Wizard.xlsx");
};
