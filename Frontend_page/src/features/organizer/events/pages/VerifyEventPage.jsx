import React, { useState } from "react";
import { Select, SelectItem } from "@/components/ui/Select";

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
          <label className="text-gray-700 font-medium text-xs">View By:</label>
          <Select
            value={viewBy}
            onValueChange={(val) => setViewBy(val)}
            className="w-40"
            triggerClassName="h-9 bg-white border-gray-300 rounded-xl text-xs font-semibold focus:ring-blue-500"
          >
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Verified">Verified</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </Select>
        </div>
      </div>

      {/* Empty State */}
      <div className="border border-gray-300 rounded-lg bg-white shadow p-12 text-center text-gray-500">
        No events to display
      </div>
    </div>
  );
}