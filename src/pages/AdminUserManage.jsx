import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import { UserCheck, UserX, ShieldCheck, Search, Mail, Home, Phone, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const AdminUserManage = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' หรือ 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลจาก API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(ENDPOINTS.MEMBER.GET_ALL);
      const data = Array.isArray(response.data.data) ? response.data.data : [];

      // Map API fields to frontend format
      const mappedUsers = data.map(item => ({
        id: item.id,
        name: `${item.firstname} ${item.lastname}`,
        email: item.username, // mapping username to email property
        houseNo: item.houseNo || '',
        phone: item.mobileNo || '',
        status: item.status || 'pending',
        role: item.role || 'user'
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error("Fetch users error:", err);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลสมาชิกได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ฟังก์ชันจัดการสถานะ
  const handleUpdateStatus = async (id, newStatus) => {
    const actionMap = {
      active: 'อนุมัติ',
      reject: 'ไม่อนุมัติ',
      disabled: 'ปิดการใช้งาน'
    };

    const action = actionMap[newStatus] || 'อัปเดต';

    Swal.fire({
      title: 'กำลังดำเนินการ...',
      text: `กรุณารอสักครู่ กำลัง${action}ผู้ใช้`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await api.post(ENDPOINTS.MEMBER.UPDATE_STATUS, {
        user_id: id,
        status: newStatus,
        update_by: currentUser?.username || "Admin"
      });

      await fetchUsers();

      Swal.fire({
        title: 'สำเร็จ',
        text: `${action}ผู้ใช้เรียบร้อยแล้ว`,
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });
    } catch (err) {
      console.error("Update status error:", err);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: `ไม่สามารถ${action}ผู้ใช้ได้`,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
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
            className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center transition ${activeTab === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
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
            className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center transition ${activeTab === 'all' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            สมาชิกในระบบ (Active/Disabled)
          </button>
        </div>

        {/* User Cards / List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4 text-indigo-600" size={40} />
            <p>กำลังโหลดข้อมูลสมาชิก...</p>
          </div>
        ) : currentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentItems.map((user) => (
              <div key={user.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl">
                    {user.name ? user.name[0] : '?'}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${user.status === 'active' ? 'bg-green-100 text-green-600' :
                    user.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {user.status === 'active' ? 'อนุมัติแล้ว' : user.status === 'pending' ? 'รออนุมัติ' : 'ปิดการใช้งาน'}
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 mb-1">{user.name}</h4>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-xs text-slate-500"><Home size={14} className="mr-2" /> บ้านเลขที่ {user.houseNo}</div>
                  <div className="flex items-center text-xs text-slate-500"><Mail size={14} className="mr-2" /> {user.email}</div>
                  <div className="flex items-center text-xs text-slate-500"><Phone size={14} className="mr-2" /> {user.phone}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {user.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(user.id, 'active')}
                        className="flex items-center justify-center py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition"
                      >
                        <UserCheck size={14} className="mr-1" />
                        อนุมัติ
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(user.id, 'reject')}
                        className="flex items-center justify-center py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition"
                      >
                        <UserX size={14} className="mr-1" />
                        ไม่อนุมัติ
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(user.id, user.status === 'active' ? 'disabled' : 'active')}
                      className={`col-span-2 flex items-center justify-center py-2 rounded-xl text-xs font-bold transition ${user.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                        }`}
                    >
                      {user.status === 'active' ? <><UserX size={14} className="mr-1" /> ปิดการใช้งาน</> : <><ShieldCheck size={14} className="mr-1" /> เปิดการใช้งาน</>}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 mb-8">
            <p className="text-slate-400">ไม่พบข้อมูลสมาชิกในระบบ</p>
          </div>
        )}

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