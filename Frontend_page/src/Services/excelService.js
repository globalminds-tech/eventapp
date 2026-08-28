import * as XLSX from 'xlsx';

/**
 * Excel & CSV Service for Bulk Category Import and 5-Step Event Creation Auto-Fill
 */

// Today ISO date helper
const getFutureIsoDate = (daysAhead = 15) => {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Preset Demo Data for instant 1-Click Auto-Fill of 5-Step Event Creation Wizard
export const DEMO_EVENT_DATA = {
  // Step 1: Event Identity
  eventDetails: {
    eventName: "MRC Grand Music & Cultural Fest 2026",
    eventCode: "EVT-2026-MRC",
    category: "Music",
    subCategory: "Live Orchestra & Fusion",
    customCategory: "",
    eventType: "OneTime",
    occurrence: "Single",
    visibility: "Public",
    startDate: getFutureIsoDate(15),
    endDate: getFutureIsoDate(15),
    startTime: "18:00",
    endTime: "23:00",
    venue: "Grand Convention Center (Chennai)",
    address: "123 MRC Nagar, Chennai, Tamil Nadu 600028",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600028",
    description: "The premier grand musical festival featuring top classical and fusion artists live in Chennai.",
    amenities: ["Free High-Speed Wi-Fi", "AC Auditorium", "VIP Lounge", "Food Court", "Parking Space"],
    tags: ["Music", "Concert", "Chennai", "Culture"],
    isInternationalInclude: false,
    includeFood: true,
    includeVehiclePass: true,
    includeDocument: true,
  },

  // Step 2: Tickets & Pricing
  booking: {
    entryType: "Paid",
    chargeType: "Paid",
    capacity: "500",
    maxPass: "4",
    priceINR: "499",
    maxPassPerUser: "4",
    priceType: "National",
    currency: "Indian Rupee - INR (₹)",
    rsvpApproval: "Automatic",
    includeTax: true,
    refundTerms: "Full refund up to 48 Hours before event",
  },

  // Step 3: Facilities, Stalls & Layout
  layout: {
    stalls: [
      { stallName: "A1 - Premium Tech Booth", size: "10x10", visibility: "Public", type: "Paid", priceINR: "5000" },
      { stallName: "A2 - Standard Expo Booth", size: "10x10", visibility: "Public", type: "Paid", priceINR: "3500" },
    ],
    stallList: [
      { stallName: "A1 - Premium Tech Booth", size: "10x10", visibility: "Public", type: "Paid", priceINR: "5000" },
      { stallName: "A2 - Standard Expo Booth", size: "10x10", visibility: "Public", type: "Paid", priceINR: "3500" },
    ],
  },
  foodProvision: {
    items: [
      { catererName: "Royal Catering", mealType: "Lunch", foodType: "Veg", priceINR: "350", menuDetails: "Multi-cuisine Buffet Spread" },
      { catererName: "Snack Corner", mealType: "Snacks", foodType: "Veg", priceINR: "120", menuDetails: "Tea & Fresh Pastries" }
    ],
    coupons: [
      { couponType: "VIP Buffet Lunch Pass", rate: "350", count: "100" },
      { couponType: "Snack & Beverage Voucher", rate: "120", count: "250" },
    ],
  },
  vehicleProvision: {
    details: [
      { vehicleType: "Two Wheeler Pass", priceINR: "50" },
      { vehicleType: "Four Wheeler Pass", priceINR: "150" },
      { vehicleType: "Heavy Vehicle / Truck", priceINR: "300" },
    ],
    addons: [
      { isParent: true, addOnName: "VIP Valet Parking Service", price: "250" }
    ],
  },

  // Step 4: Partners & Sponsors
  vendorSponsor: {
    sponsors: [
      { sponsorName: "TechCorp Global", sponsorshipType: "Title Sponsor", amount: "150000" }
    ],
    vendors: [
      { vendorName: "Royal Catering Services", serviceType: "Food & Beverage", contactNo: "+91 9876543210" }
    ],
    guests: [
      { name: "Dr. A. Subramanian", designation: "Minister of Cultural Affairs", topic: "Keynote Address on Cultural Revival" }
    ],
  },
  vendors: {
    sponsors: [
      { sponsorName: "TechCorp Global", sponsorshipType: "Title Sponsor", amount: "150000" }
    ],
    vendors: [
      { vendorName: "Royal Catering Services", serviceType: "Food & Beverage", contactNo: "+91 9876543210" }
    ],
    guests: [
      { name: "Dr. A. Subramanian", designation: "Minister of Cultural Affairs", topic: "Keynote Address on Cultural Revival" }
    ],
  },

  // Step 5: Terms & Policies
  terms: [
    {
      policyGroup: "Cancellation Policy",
      policyType: "General Cancellation",
      policyName: "Standard 48-Hour Refund Policy",
      description: "Full refund available up to 48 hours before the event start date.",
      isDefault: true
    },
    {
      policyGroup: "Safety Policy",
      policyType: "Venue Security",
      policyName: "Mandatory Government ID Verification",
      description: "All attendees must present a valid government-issued photo ID at entry.",
      isDefault: true
    }
  ],
  termsDetails: [
    {
      policyGroup: "Cancellation Policy",
      policyType: "General Cancellation",
      policyName: "Standard 48-Hour Refund Policy",
      description: "Full refund available up to 48 hours before the event start date.",
      isDefault: true
    },
    {
      policyGroup: "Safety Policy",
      policyType: "Venue Security",
      policyName: "Mandatory Government ID Verification",
      description: "All attendees must present a valid government-issued photo ID at entry.",
      isDefault: true
    }
  ],

  // Step backward compatibility
  step1: {
    eventName: "MRC Grand Music & Cultural Fest 2026",
    category: "Music",
    startDate: getFutureIsoDate(15),
    eventType: "OneTime",
  },
  step2: { capacity: "500", maxPass: "4" },
  step3: { totalStalls: 2 },
  step4: {},
  step5: {},
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
 * Downloads a sample Excel file for 5-Step Event Creation Wizard
 */
export const downloadEventCreationSampleExcel = () => {
  const eventSheet = [
    {
      "Event Name": "MRC Grand Music & Cultural Fest 2026",
      "Event Code": "EVT-2026-MRC",
      "Category": "Music",
      "Subcategory": "Live Orchestra & EDM",
      "Event Type": "OneTime",
      "Start Date": getFutureIsoDate(15),
      "End Date": getFutureIsoDate(15),
      "Start Time": "18:00",
      "End Time": "23:00",
      "Venue": "Grand Convention Center (Chennai)",
      "Address": "123 MRC Nagar, Chennai, Tamil Nadu 600028",
      "City": "Chennai",
      "State": "Tamil Nadu",
      "Pincode": "600028",
      "Ticket Price": 499,
      "Total Capacity": 500
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(eventSheet);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "EventDetails");
  XLSX.writeFile(workbook, "Sample_Event_Creation_Wizard.xlsx");
};
