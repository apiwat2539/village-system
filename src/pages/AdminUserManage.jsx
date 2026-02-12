import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import { UserCheck, UserX, ShieldCheck, Search, Mail, Home, Phone } from 'lucide-react';

const AdminUserManage = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' หรือ 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [users, setUsers] = useState([
    { id: 1, name: "สมชาย รักดี", email: "somchai@email.com", houseNo: "99/1", phone: "081-234-5678", status: "pending", role: "user" },
    { id: 2, name: "สมชาย รักดี", email: "somchai@email.com", houseNo: "99/1", phone: "081-234-5678", status: "pending", role: "user" },
    { id: 3, name: "สมชาย รักดี", email: "somchai@email.com", houseNo: "99/1", phone: "081-234-5678", status: "pending", role: "user" },
    { id: 4, name: "สมชาย รักดี", email: "somchai@email.com", houseNo: "99/1", phone: "081-234-5678", status: "pending", role: "user" },
    { id: 5, name: "สมชาย รักดี", email: "somchai@email.com", houseNo: "99/1", phone: "081-234-5678", status: "pending", role: "user" },
    { id: 6, name: "สมชาย รักดี", email: "somchai@email.com", houseNo: "99/1", phone: "081-234-5678", status: "pending", role: "user" },
    { id: 7, name: "สมชาย รักดี", email: "somchai@email.com", houseNo: "99/1", phone: "081-234-5678", status: "pending", role: "user" },
    { id: 8, name: "สมชาย รักดี", email: "somchai@email.com", houseNo: "99/1", phone: "081-234-5678", status: "pending", role: "user" },
    { id: 9, name: "สมชาย รักดี", email: "somchai@email.com", houseNo: "99/1", phone: "081-234-5678", status: "pending", role: "user" },
    { id: 10, name: "สมศรี มีสุข", email: "somsri@email.com", houseNo: "99/2", phone: "082-345-6789", status: "active", role: "user" },
    { id: 11, name: "วิชัย ใจกล้า", email: "wichai@email.com", houseNo: "99/3", phone: "083-456-7890", status: "disabled", role: "user" },
    { id: 12, name: "สมศรี มีสุข", email: "somsri@email.com", houseNo: "99/2", phone: "082-345-6789", status: "active", role: "user" },
    { id: 13, name: "วิชัย ใจกล้า", email: "wichai@email.com", houseNo: "99/3", phone: "083-456-7890", status: "disabled", role: "user" },
    { id: 14, name: "สมศรี มีสุข", email: "somsri@email.com", houseNo: "99/2", phone: "082-345-6789", status: "active", role: "user" },
    { id: 15, name: "วิชัย ใจกล้า", email: "wichai@email.com", houseNo: "99/3", phone: "083-456-7890", status: "disabled", role: "user" },
    { id: 16, name: "สมศรี มีสุข", email: "somsri@email.com", houseNo: "99/2", phone: "082-345-6789", status: "active", role: "user" },
    { id: 17, name: "วิชัย ใจกล้า", email: "wichai@email.com", houseNo: "99/3", phone: "083-456-7890", status: "disabled", role: "user" },
    { id: 18, name: "สมศรี มีสุข", email: "somsri@email.com", houseNo: "99/2", phone: "082-345-6789", status: "active", role: "user" },
    { id: 19, name: "วิชัย ใจกล้า", email: "wichai@email.com", houseNo: "99/3", phone: "083-456-7890", status: "disabled", role: "user" },
  ]);

  // ฟังก์ชันจัดการสถานะ
  const handleUpdateStatus = (id, newStatus) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    const action = newStatus === 'active' ? "อนุมัติ" : "ปิดการใช้งาน";
    alert(`${action} ผู้ใช้เรียบร้อยแล้ว`);
  };

  // --- Logic กรองข้อมูล ---
  const filteredUsers = users.filter(user => {
    // 1. แยก Tab: Pending คือรออนุมัติเท่านั้น / All คือคนที่เป็นสมาชิกแล้วหรือถูกปิดใช้งาน
    const matchTab = activeTab === 'pending' 
      ? user.status === 'pending' 
      : (user.status === 'active' || user.status === 'disabled'); // ไม่เอา pending ในแถบนี้

    // 2. ค้นหาด้วยชื่อหรือบ้านเลขที่
    const matchSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.houseNo.includes(searchTerm);

    return matchTab && matchSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentItems = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 p-8">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-800">จัดการสมาชิกหมู่บ้าน</h2>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ เลขที่บ้าน..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white rounded-2xl border border-slate-200 w-fit mb-8 shadow-sm">
          <button 
            onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center transition ${
              activeTab === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            รออนุมัติ {users.filter(u => u.status === 'pending').length > 0 && 
              <span className="ml-2 bg-white text-amber-600 px-2 py-0.5 rounded-full text-[10px]">
                {users.filter(u => u.status === 'pending').length}
              </span>
            }
          </button>
          <button 
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center transition ${
              activeTab === 'all' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            สมาชิกในระบบ (Active/Disabled)
          </button>
        </div>

        {/* User Cards / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentItems.map((user) => (
            <div key={user.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl">
                  {user.name[0]}
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  user.status === 'active' ? 'bg-green-100 text-green-600' : 
                  user.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                }`}>
                  {user.status === 'active' ? 'อนุมัติแล้ว' : user.status === 'pending' ? 'รออนุมัติ' : 'ปิดการใช้งาน'}
                </span>
              </div>

              <h4 className="font-bold text-slate-800 mb-1">{user.name}</h4>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-xs text-slate-500"><Home size={14} className="mr-2"/> บ้านเลขที่ {user.houseNo}</div>
                <div className="flex items-center text-xs text-slate-500"><Mail size={14} className="mr-2"/> {user.email}</div>
                <div className="flex items-center text-xs text-slate-500"><Phone size={14} className="mr-2"/> {user.phone}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {user.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(user.id, 'active')}
                      className="flex items-center justify-center py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition"
                    >
                      <UserCheck size={14} className="mr-1"/> อนุมัติ
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(user.id, 'disabled')}
                      className="flex items-center justify-center py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                    >
                      ปฏิเสธ
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleUpdateStatus(user.id, user.status === 'active' ? 'disabled' : 'active')}
                    className={`col-span-2 flex items-center justify-center py-2 rounded-xl text-xs font-bold transition ${
                      user.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    {user.status === 'active' ? <><UserX size={14} className="mr-1"/> ปิดการใช้งาน</> : <><ShieldCheck size={14} className="mr-1"/> เปิดการใช้งาน</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination ที่เป็น Component ตามที่คุณต้องการ */}
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={(page) => setCurrentPage(page)} 
        />
      </main>
    </div>
  );
};

export default AdminUserManage;