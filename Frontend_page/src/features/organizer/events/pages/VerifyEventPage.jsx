import React, { useState } from "react";

export default function EventVerification() {
  const [search, setSearch] = useState("");
  const [viewBy, setViewBy] = useState("All");

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8">Event Verification</h1>

      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex items-center w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search by Event Names"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-gray-700 font-medium">View By:</label>
          <select
            value={viewBy}
            onChange={(e) => setViewBy(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      <div className="border border-gray-300 rounded-lg bg-white shadow p-12 text-center text-gray-500">
        No events to display
      </div>
    </div>
  );
}