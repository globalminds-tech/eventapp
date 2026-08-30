import { useState, useEffect } from "react";
import { getMyContacts, createMyContact, deleteMyContact, updateMyContact } from "@/Services/api";
import { Save, Trash2, Search, ChevronDown, ListFilter, UserPlus, Pencil, Eye } from "lucide-react";

const GroupCard = ({ group, stats, onDetail }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible hover:shadow-md transition-shadow relative">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">{group}</h3>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <div className="flex gap-0.5">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden font-medium">
                <button 
                  onClick={(e) => { e.stopPropagation(); onDetail(); setShowMenu(false); }}
                  className="w-full px-4 py-2.5 text-xs text-left hover:bg-blue-50 flex items-center gap-2 text-slate-600"
                >
                  <Eye size={14} /> View
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDetail(); setShowMenu(false); }}
                  className="w-full px-4 py-2.5 text-xs text-left hover:bg-blue-50 flex items-center gap-2 text-slate-600"
                >
                  <Pencil size={14} /> Edit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4 cursor-pointer" onClick={onDetail}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            <ListFilter size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contacts</div>
            <div className="text-lg font-black text-slate-800">{stats.count}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 relative">
            <div className="bg-blue-500 w-2 h-2 rounded-full absolute -top-1 -right-1"></div>
            <svg className="w-6 h-6 text-blue-500 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</div>
            <div className={`text-sm font-bold ${stats.status === 'Active' ? 'text-blue-600' : 'text-slate-400'}`}>{stats.status}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Contacts = () => {
  const [page, setPage] = useState("home");
  const [manual, setManual] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [showUserTypeDropdown, setShowUserTypeDropdown] = useState(false);
  const [userTypeSearch, setUserTypeSearch] = useState("");

  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");

  const [editId, setEditId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    userType: "",
    groupName: ""
  });

  const USER_TYPES = ["Leiten Admin", "Organizer", "Exhibitor"];
  const GROUP_NAMES = ["Leiten", "Developers"];

  // FETCH CONTACTS
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await getMyContacts();
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts: ", error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "mobile") {
      const numericValue = e.target.value.replace(/\D/g, "");
      if (numericValue.length > 10) return;
      setFormData({ ...formData, [e.target.name]: numericValue });
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addContact = async () => {
    if (!formData.name || !formData.email || !formData.mobile || !formData.userType || !formData.groupName) {
      alert("Please fill all mandatory fields.");
      return;
    }
    if (formData.mobile && formData.mobile.length !== 10) {
      alert("Please enter a valid 10-digit Contact Number.");
      return;
    }

    try {
      if (editId) {
        await updateMyContact(editId, formData);
      } else {
        await createMyContact(formData);
      }
      fetchContacts();
      clearForm();
    } catch (error) {
      console.error("Error saving contact: ", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteMyContact(id);
        fetchContacts();
      } catch (error) {
        console.error("Error deleting contact: ", error);
      }
    }
  };

  const handleEdit = (contact) => {
    setEditId(contact.id);
    setFormData({
      name: contact.name,
      email: contact.email,
      mobile: contact.mobile,
      userType: contact.user_type || contact.userType,
      groupName: contact.group_name || contact.groupName
    });
    setManual(true);
    setPage("contacts"); // Ensure we go to the form page
  };

  const clearForm = () => {
    setEditId(null);
    setFormData({
      name: "",
      email: "",
      mobile: "",
      userType: "",
      groupName: ""
    });
  };

  const getGroupStats = (groupName) => {
    const groupContacts = contacts.filter(c => (c.group_name || c.groupName) === groupName);
    return {
      count: groupContacts.length,
      status: groupContacts.length > 0 ? "Active" : "Inactive"
    };
  };

  if (page === "home") {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans">
        <div className="flex justify-between items-center bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <h1 className="text-xl font-bold text-slate-700">My Contacts</h1>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 items-center gap-2">
                <Search size={16} className="text-slate-400" />
                <input placeholder="Search by Contact Group" className="bg-transparent text-sm outline-none w-48" />
             </div>
             <button 
               onClick={() => { setPage("contacts"); setSelectedGroup(null); }}
               className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
             >
                <UserPlus size={20} />
             </button>
          </div>
        </div>

        <div className="p-8">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)]">
              <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center max-w-md text-center">
                 <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
                    <UserPlus size={40} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-2">Build Your Network</h2>
                 <p className="text-slate-500 mb-8 leading-relaxed">Manage your organizers, exhibitors, and admins in one centralized contact hub.</p>
                 
                 <div className="flex flex-col w-full gap-3">
                   <button 
                     onClick={() => setPage("contacts")}
                     className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                   >
                     Create New Contact
                   </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="max-w-[1400px] mx-auto">
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Contact Groups</h2>
                  <button 
                    onClick={() => { setPage("contacts"); setSelectedGroup(null); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                  >
                     <UserPlus size={18} />
                     Add New
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                  {GROUP_NAMES.map(group => (
                    <GroupCard 
                      key={group}
                      group={group}
                      stats={getGroupStats(group)}
                      onDetail={() => { setSelectedGroup(group); setPage("contacts"); }}
                    />
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Filter contacts based on selected group if viewing group detail
  const displayContacts = selectedGroup 
    ? contacts.filter(c => (c.group_name || c.groupName) === selectedGroup)
    : contacts;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-700">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-700">My Contacts</h1>
        <div className="flex items-center gap-3">
           <button onClick={addContact} className="p-2 text-slate-400 hover:text-blue-600 border rounded-lg transition-colors"><Save size={18} /></button>
           <button className="p-2 text-slate-400 hover:text-red-500 border rounded-lg transition-colors"><Trash2 size={18} /></button>
           <button className="p-2 text-slate-400 hover:text-blue-500 border rounded-lg transition-colors"><Search size={18} /></button>
           <button onClick={() => setPage("home")} className="ml-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">Back</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 p-6 max-w-[1920px] mx-auto">
        {/* LEFT PANEL */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#4461f2] mb-6 tracking-tight">Contact Details</h2>

          <div className="flex items-center justify-center gap-4 mb-8 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className={`text-sm font-bold ${manual ? 'text-slate-800' : 'text-slate-400'}`}>Manual</span>
            <button
              onClick={() => setManual(!manual)}
              className={`relative w-14 h-7 flex items-center rounded-full transition-colors duration-300
              ${manual ? "bg-[#4461f2]" : "bg-slate-300"}`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 absolute left-1
                ${manual ? "translate-x-7" : "translate-x-0"}`}
              />
            </button>
            <span className={`text-sm font-bold ${!manual ? 'text-slate-800' : 'text-slate-400'}`}>Document</span>
          </div>

          {manual ? (
            <div className="space-y-5">
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Name"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Mail ID <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Mail ID"
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter Contact Number"
                  maxLength={10}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    User Type <span className="text-red-500">*</span>
                  </label>
                  <div 
                    onClick={() => setShowUserTypeDropdown(!showUserTypeDropdown)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <span className={formData.userType ? "text-slate-700" : "text-slate-300"}>
                      {formData.userType || "User Type"}
                    </span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${showUserTypeDropdown ? 'rotate-180' : ''}`} />
                  </div>

                  {showUserTypeDropdown && (
                    <div className="absolute bottom-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                       <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                          <Search size={14} className="text-slate-400" />
                          <input 
                            className="bg-transparent text-xs outline-none w-full"
                            placeholder="Search..."
                            value={userTypeSearch}
                            onChange={(e) => setUserTypeSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                       </div>
                       <div className="max-h-40 overflow-auto">
                          {USER_TYPES.filter(t => t.toLowerCase().includes(userTypeSearch.toLowerCase())).map(type => (
                            <div 
                              key={type}
                              onClick={() => {
                                setFormData({...formData, userType: type});
                                setShowUserTypeDropdown(false);
                              }}
                              className="px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                            >
                              {type}
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <div 
                    onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <span className={formData.groupName ? "text-slate-700" : "text-slate-300"}>
                      {formData.groupName || "Group Name"}
                    </span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${showGroupDropdown ? 'rotate-180' : ''}`} />
                  </div>

                  {showGroupDropdown && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                       <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                          <Search size={14} className="text-slate-400" />
                          <input 
                            className="bg-transparent text-xs outline-none w-full"
                            placeholder="Search..."
                            value={groupSearch}
                            onChange={(e) => setGroupSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                       </div>
                       <div className="max-h-40 overflow-auto">
                          {GROUP_NAMES.filter(t => t.toLowerCase().includes(groupSearch.toLowerCase())).map(group => (
                            <div 
                              key={group}
                              onClick={() => {
                                setFormData({...formData, groupName: group});
                                setShowGroupDropdown(false);
                              }}
                              className="px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                            >
                              {group}
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={addContact}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all active:scale-95"
                >
                  {editId ? "Update Contact" : "Add Contact"}
                </button>
                <button
                  onClick={clearForm}
                  className="flex-1 border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-all active:scale-95"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-4 bg-slate-50/50">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                   <ListFilter size={32} />
                </div>
                <p className="text-slate-500 font-medium">Drag and drop your contact file here</p>
                <button className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all">
                   Browse Files
                </button>
              </div>
              
              <button className="mt-6 flex items-center gap-2 text-blue-600 font-bold hover:underline">
                 <Download size={18} />
                 Download Template
              </button>

              <div className="w-full bg-amber-50/50 border border-amber-100 rounded-2xl p-5 mt-8">
                <h3 className="text-amber-800 font-bold text-sm mb-3 flex items-center gap-2">
                   💡 Tips for Success
                </h3>
                <ul className="text-xs text-amber-700 space-y-2.5">
                  <li className="flex gap-2"><span>•</span> Use the official Excel template provided above</li>
                  <li className="flex gap-2"><span>•</span> Do not change the column headers or file name</li>
                  <li className="flex gap-2"><span>•</span> Ensure mobile numbers are exactly 10 digits</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* SUMMARY TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#4461f2] tracking-tight">
              {selectedGroup ? `${selectedGroup} Contacts` : "Summary"}
            </h2>
            {selectedGroup && (
               <button 
                onClick={() => setSelectedGroup(null)}
                className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"
               >
                 Show All
               </button>
            )}
          </div>

          <div className="flex-1 overflow-auto rounded-xl border border-slate-100">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Name </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Mail ID </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Mobile No </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">User Type </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Group Name </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayContacts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-24 text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                         <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <Search size={24} />
                         </div>
                         <p className="font-medium text-slate-400">No Data Found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayContacts.map((contact, index) => (
                    <tr key={index} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                      <td className="px-6 py-4 flex items-center justify-center gap-3">
                         <button 
                           onClick={() => handleEdit(contact)}
                           className="text-slate-300 hover:text-blue-500 transition-colors"
                         >
                            <Pencil size={16} />
                         </button>
                         <button 
                           onClick={() => handleDelete(contact.id)}
                           className="text-slate-300 hover:text-red-500 transition-colors"
                         >
                            <Trash2 size={16} />
                         </button>
                      </td>
                      <td className="px-6 py-4 font-medium border-l border-slate-50">{contact.name}</td>
                      <td className="px-6 py-4 text-slate-500 border-l border-slate-50">{contact.email}</td>
                      <td className="px-6 py-4 text-slate-500 border-l border-slate-50">{contact.mobile}</td>
                      <td className="px-6 py-4 border-l border-slate-50">
                        <span className="bg-blue-100/50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                           {contact.user_type || contact.userType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 border-l border-slate-50 font-medium">{contact.group_name || contact.groupName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between px-6 py-4 bg-slate-50 rounded-xl border border-slate-100">
             <div className="text-[11px] text-slate-500 font-medium">
               Showing <span className="text-slate-800 font-bold">{displayContacts.length === 0 ? 0 : 1}</span> to <span className="text-slate-800 font-bold">{displayContacts.length}</span> of <span className="text-slate-800 font-bold">{displayContacts.length}</span> entries
             </div>
             
             <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-slate-400">{'<<'}</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-slate-400">{'<'}</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-blue-600 font-bold text-xs shadow-sm">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-slate-400">{'>'}</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-slate-400">{'>>'}</button>
                <select className="ml-2 bg-white border border-slate-200 rounded-lg text-[10px] p-1.5 outline-none font-bold text-slate-600">
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
}
