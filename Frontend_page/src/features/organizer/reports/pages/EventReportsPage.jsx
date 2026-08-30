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
            <label className="text-sm font-medium">
              Event <span className="text-red-500">*</span>
            </label>
            <select className="w-full border rounded-md p-2 mt-1 text-gray-500">
              <option>Select Event</option>
            </select>
          </div>

          {/* Event Date */}
          <div>
            <label className="text-sm font-medium">Event Date</label>
            <div className="flex">
              <input type="date" className="w-full border rounded-l-md p-2" />
              <div className="bg-blue-600 text-white px-3 flex items-center rounded-r-md">
                <Calendar size={18} />
              </div>
            </div>
          </div>

          {/* Pass Category */}
          <div>
            <label className="text-sm font-medium">Pass Category</label>
            <select className="w-full border rounded-md p-2 mt-1 text-gray-500">
              <option>Select Pass Category</option>
            </select>
          </div>

          {/* Meal Category */}
          <div>
            <label className="text-sm font-medium">Meal Category</label>
            <select className="w-full border rounded-md p-2 mt-1 text-gray-500">
              <option>Select Meal Category</option>
            </select>
          </div>

          {/* Hall */}
          <div>
            <label className="text-sm font-medium">Hall</label>
            <select className="w-full border rounded-md p-2 mt-1 text-gray-500">
              <option>Select Hall</option>
            </select>
          </div>

          {/* Program */}
          <div>
            <label className="text-sm font-medium">Program</label>
            <select className="w-full border rounded-md p-2 mt-1 text-gray-500">
              <option>Select Program</option>
            </select>
          </div>

          {/* Slot */}
          <div>
            <label className="text-sm font-medium">Slot</label>
            <select className="w-full border rounded-md p-2 mt-1 text-gray-500">
              <option>Select Slot</option>
            </select>
          </div>

          {/* Meal Type */}
          <div>
            <label className="text-sm font-medium">Meal Type</label>
            <select className="w-full border rounded-md p-2 mt-1 text-gray-400">
              <option>Select Meal type</option>
            </select>
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
