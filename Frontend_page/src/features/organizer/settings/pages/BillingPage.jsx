import React from "react";

export const Billing = () => {
  return (
    <div className="bg-white border rounded shadow-sm p-6">

      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        My Billings
      </h1>

      <div className="grid grid-cols-2 gap-6">

        {/* LEFT PANEL */}
        <div className="border rounded p-5">

          <h2 className="text-xl text-blue-600 font-semibold mb-4">
            Billing Address
          </h2>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Address
            </label>

            <textarea
              className="w-full border rounded p-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* City State Country */}
          <div className="grid grid-cols-3 gap-4">

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                defaultValue="CHENNAI"
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                defaultValue="TAMIL NADU"
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                defaultValue="INDIA"
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="border rounded p-5">

          <h2 className="text-xl text-blue-600 font-semibold mb-4">
            Payment History
          </h2>

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-x-auto">

            <table className="w-full min-w-max">

              <thead>
                <tr className="bg-sky-600 text-white">
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Plan Code</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Invoice</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-sky-50/50 transition-colors duration-200 group bg-white">
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">Mar 3, 2025</td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">Upgraded to Enterprise Plan</td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">EP005</td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">₹5,000.99</td>

                  <td className="px-4 py-3 text-center">
                    <button className="border rounded px-2 py-1 hover:bg-gray-100 text-slate-600">
                      🖨
                    </button>
                  </td>
                </tr>
              </tbody>

            </table>

          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">

            <span>
              Showing 1 to 1 of 1 entries
            </span>

            <div className="flex items-center gap-2">

              <button className="border px-2 py-1 rounded hover:bg-gray-100">
                «
              </button>

              <button className="bg-blue-600 text-white px-3 py-1 rounded">
                1
              </button>

              <button className="border px-2 py-1 rounded hover:bg-gray-100">
                »
              </button>

              <select className="border p-1 rounded ml-2">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};