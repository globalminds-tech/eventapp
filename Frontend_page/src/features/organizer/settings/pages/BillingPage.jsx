import React from "react";

export const Billing = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 sm:p-6">

      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-5">
        My Billings
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* LEFT PANEL */}
        <div className="border border-slate-200/80 rounded-xl p-4 sm:p-5">

          <h2 className="text-lg text-blue-600 font-semibold mb-4">
            Billing Address
          </h2>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-medium mb-1">
              Address
            </label>

            <textarea
              className="w-full border border-slate-300 rounded-lg p-2.5 h-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* City State Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <div>
              <label className="block font-medium text-slate-700 text-xs mb-1">
                City
              </label>
              <input
                type="text"
                defaultValue="CHENNAI"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-xs mb-1">
                State
              </label>
              <input
                type="text"
                defaultValue="TAMIL NADU"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-xs mb-1">
                Country
              </label>
              <input
                type="text"
                defaultValue="INDIA"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="border border-slate-200/80 rounded-xl p-4 sm:p-5">

          <h2 className="text-lg text-blue-600 font-semibold mb-4">
            Payment History
          </h2>

          {/* Table */}
          <div className="responsive-table-wrap bg-white rounded-xl shadow-xs border border-slate-200/80">

            <table className="w-full min-w-[550px]">

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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 text-xs text-slate-500">

            <span>
              Showing 1 to 1 of 1 entries
            </span>

            <div className="flex items-center gap-2">

              <button className="border border-slate-200 px-2 py-1 rounded hover:bg-slate-100">
                «
              </button>

              <button className="bg-blue-600 text-white px-3 py-1 rounded font-bold">
                1
              </button>

              <button className="border border-slate-200 px-2 py-1 rounded hover:bg-slate-100">
                »
              </button>

              <select className="border border-slate-200 p-1 rounded ml-2 text-xs bg-white">
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