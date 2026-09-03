import {
  Search,
  XCircle,
  Calendar,
  Users,
  Mic,
  Utensils,
  UserCheck,
  Drumstick,
} from "lucide-react";
import { Select, SelectItem } from "@/components/ui/Select";

export const EventReports = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-700 mb-4">
        Event Reports
      </h1>

      {/* Filter Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="grid grid-cols-4 gap-6">
          {/* Event */}
          <div>
            <Select
              label="Event *"
              placeholder="Select Event"
              triggerClassName="w-full border-slate-200 rounded-xl p-2 mt-1 text-xs font-semibold h-10 bg-white focus:ring-blue-500"
            >
              <SelectItem value="All">All Events</SelectItem>
              <SelectItem value="MRC">MRC Grand Music Fest 2026</SelectItem>
              <SelectItem value="Craft">Valluvar Kottam Craft Expo</SelectItem>
            </Select>
          </div>

          {/* Event Date */}
          <div>
            <label className="text-sm font-medium">Event Date</label>
            <div className="flex mt-1">
              <input type="date" className="w-full border border-slate-200 rounded-l-xl p-2 text-xs font-semibold h-10" />
              <div className="bg-blue-600 text-white px-3 flex items-center rounded-r-xl">
                <Calendar size={18} />
              </div>
            </div>
          </div>

          {/* Pass Category */}
          <div>
            <Select
              label="Pass Category"
              placeholder="Select Pass Category"
              triggerClassName="w-full border-slate-200 rounded-xl p-2 mt-1 text-xs font-semibold h-10 bg-white focus:ring-blue-500"
            >
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="VIP">VIP Gold Pass</SelectItem>
              <SelectItem value="General">General Admission</SelectItem>
            </Select>
          </div>

          {/* Meal Category */}
          <div>
            <Select
              label="Meal Category"
              placeholder="Select Meal Category"
              triggerClassName="w-full border-slate-200 rounded-xl p-2 mt-1 text-xs font-semibold h-10 bg-white focus:ring-blue-500"
            >
              <SelectItem value="All">All Meals</SelectItem>
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
            </Select>
          </div>

          {/* Hall */}
          <div>
            <Select
              label="Hall"
              placeholder="Select Hall"
              triggerClassName="w-full border-slate-200 rounded-xl p-2 mt-1 text-xs font-semibold h-10 bg-white focus:ring-blue-500"
            >
              <SelectItem value="All">All Halls</SelectItem>
              <SelectItem value="Hall A">Main Hall A</SelectItem>
              <SelectItem value="Hall B">Conference Hall B</SelectItem>
            </Select>
          </div>

          {/* Program */}
          <div>
            <Select
              label="Program"
              placeholder="Select Program"
              triggerClassName="w-full border-slate-200 rounded-xl p-2 mt-1 text-xs font-semibold h-10 bg-white focus:ring-blue-500"
            >
              <SelectItem value="All">All Programs</SelectItem>
              <SelectItem value="Inauguration">Inauguration Ceremony</SelectItem>
              <SelectItem value="Keynote">Keynote Address</SelectItem>
            </Select>
          </div>

          {/* Slot */}
          <div>
            <Select
              label="Slot"
              placeholder="Select Slot"
              triggerClassName="w-full border-slate-200 rounded-xl p-2 mt-1 text-xs font-semibold h-10 bg-white focus:ring-blue-500"
            >
              <SelectItem value="All">All Slots</SelectItem>
              <SelectItem value="Morning">Morning (09:00 - 13:00)</SelectItem>
              <SelectItem value="Evening">Evening (14:00 - 18:00)</SelectItem>
            </Select>
          </div>

          {/* Meal Type */}
          <div>
            <Select
              label="Meal Type"
              placeholder="Select Meal type"
              triggerClassName="w-full border-slate-200 rounded-xl p-2 mt-1 text-xs font-semibold h-10 bg-white focus:ring-blue-500"
            >
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Veg">Vegetarian</SelectItem>
              <SelectItem value="Non-Veg">Non-Vegetarian</SelectItem>
            </Select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button className="flex items-center gap-2 border border-blue-600 text-blue-600 px-5 py-2 rounded-md hover:bg-blue-50">
            <Search size={18} />
            Search
          </button>

          <button className="flex items-center gap-2 border border-blue-600 text-blue-600 px-5 py-2 rounded-md hover:bg-blue-50">
            <XCircle size={18} />
            Clear
          </button>
        </div>
      </div>

      {/* Tips Box */}
      <div className="bg-yellow-100 border border-yellow-400 text-sm rounded-md p-4 mt-6">
        <span className="font-semibold">💡 Tips</span>
        <p className="mt-1">
          Click on the container{" "}
          <b>(Event / Program / Food Bookings & Check-Ins)</b>
          to view the details of Visitors.
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* Event Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Event Bookings & Check-Ins</h2>

          <div className="flex justify-between">
            <div className="flex gap-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <Calendar size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Event Bookings</p>
                <p className="font-bold">0</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <Users size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Participants</p>
                <p className="font-bold">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Program Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Program Bookings & Check-Ins</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <Mic size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total No of Programs</p>
                <p className="font-bold">0</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <Calendar size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Program Bookings</p>
                <p className="font-bold">0</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <UserCheck size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Participants</p>
                <p className="font-bold">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Food Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Food Bookings & Check-Ins</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <Utensils size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Food Bookings</p>
                <p className="font-bold">0</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <UserCheck size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Check-In Visitors</p>
                <p className="font-bold">0</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <Utensils size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Veg Check-In</p>
                <p className="font-bold">0</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <Drumstick size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Non-Veg Check-In</p>
                <p className="font-bold">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
