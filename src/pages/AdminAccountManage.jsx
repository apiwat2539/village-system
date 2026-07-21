import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AddTransactionModal from '../components/AddTransactionModal';
import {
  TrendingUp, TrendingDown, Plus,
  Calendar, Loader2
} from 'lucide-react';
import Pagination from '../components/Pagination';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import Swal from 'sweetalert2';

const AdminAccountManage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('income'); // 'income' หรือ 'expense'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State สำหรับ Filter (backend มีแค่ date ไม่มี time)
  const [filter, setFilter] = useState({ date: '', month: '' });

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(ENDPOINTS.TRANSACTIONS.GET_ALL);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setTransactions(data);
    } catch (err) {
      console.error("Fetch transactions error:", err);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลบัญชีหมู่บ้านได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- Logic กรองข้อมูลตาม Tab และ Filter ---
  const filteredData = transactions.filter(t => {
    const matchTab = t.type === activeTab;
    const matchDate = filter.date ? t.date === filter.date : true;
    const matchMonth = filter.month ? t.date.startsWith(filter.month) : true;
    return matchTab && matchDate && matchMonth;
  });

  // --- สรุปยอด (อิงตาม Tab ปัจจุบัน) ---
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7);

  const dailyTotal = filteredData.filter(t => t.date === today).reduce((sum, t) => sum + t.amount, 0);
  const monthlyTotal = filteredData.filter(t => t.date.startsWith(currentMonth)).reduce((sum, t) => sum + t.amount, 0);

  // --- Pagination Logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // backend เรียงใหม่สุดมาก่อนให้แล้ว (order by created_at desc)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 p-8">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-800">บัญชีหมู่บ้าน</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center shadow-lg ${
              activeTab === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <Plus size={20} className="mr-1" /> {activeTab === 'income' ? 'บันทึกรับเงิน (Manual)' : 'เพิ่มรายการเบิกจ่าย'}
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white rounded-2xl border border-slate-200 w-fit mb-8 shadow-sm">
          <button
            onClick={() => { setActiveTab('income'); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center transition ${activeTab === 'income' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <TrendingUp size={18} className="mr-2"/> รายรับ (เงินเข้า)
          </button>
          <button
            onClick={() => { setActiveTab('expense'); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center transition ${activeTab === 'expense' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <TrendingDown size={18} className="mr-2"/> รายการเบิกจ่าย
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">ยอด{activeTab === 'income' ? 'รับ' : 'จ่าย'}วันนี้</p>
            <h3 className="text-3xl font-black text-slate-800">฿{dailyTotal.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">ยอด{activeTab === 'income' ? 'รับ' : 'จ่าย'}เดือนนี้</p>
            <h3 className="text-3xl font-black text-slate-800">฿{monthlyTotal.toLocaleString()}</h3>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase italic">ระบุวันที่</label>
            <input type="date" className="w-full text-xs border border-slate-100 p-2 rounded-lg outline-none focus:ring-1 ring-indigo-500" value={filter.date} onChange={(e) => setFilter({...filter, date: e.target.value})} />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase italic">ระบุเดือน/ปี</label>
            <input type="month" className="w-full text-xs border border-slate-100 p-2 rounded-lg outline-none focus:ring-1 ring-indigo-500" value={filter.month} onChange={(e) => setFilter({...filter, month: e.target.value})} />
          </div>
          <button onClick={() => setFilter({ date: '', month: '' })} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition">ล้างตัวกรอง</button>
        </div>

        {/* ตารางแสดงรายการ */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b">
                <tr>
                  <th className="p-5">วันที่ทำรายการ</th>
                  <th className="p-5">รายการ / หมวดหมู่</th>
                  <th className="p-5 text-right">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {currentItems.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="p-5">
                      <div className="flex items-center text-slate-800 font-medium">
                        <Calendar size={14} className="mr-2 text-slate-300"/> {t.date}
                      </div>
                    </td>
                    <td className="p-5 text-slate-700">
                      <div className="font-bold">{t.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{t.category}</div>
                    </td>
                    <td className={`p-5 text-right font-black ${activeTab === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {activeTab === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-20 text-center text-slate-300 italic">ไม่พบรายการข้อมูลในเงื่อนไขที่กำหนด</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultType={activeTab}
          onSave={() => {
            setIsModalOpen(false);
            fetchTransactions();
          }}
        />
      </main>
    </div>
  );
};

export default AdminAccountManage;
