import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AddTransactionModal from '../components/AddTransactionModal';
import { 
  TrendingUp, TrendingDown, Plus, Filter, 
  ChevronLeft, ChevronRight, Calendar, Clock as ClockIcon, FileText 
} from 'lucide-react';
import Pagination from '../components/Pagination';

const AdminAccountManage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('income'); // 'income' หรือ 'expense'
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State สำหรับ Filter
  const [filter, setFilter] = useState({ date: '', month: '', year: '', time: '' });
  
  // ข้อมูลจำลอง (Mock Data)
  const [transactions, setTransactions] = useState([
    { id: "TXN-001", title: "ค่าส่วนกลางบ้าน 99/1", type: "income", amount: 1200, date: "2026-02-06", time: "10:30", category: "ค่าส่วนกลาง" },
    { id: "TXN-002", title: "ค่าส่วนกลางบ้าน 99/1", type: "income", amount: 1200, date: "2026-02-06", time: "10:30", category: "ค่าส่วนกลาง" },
    { id: "TXN-003", title: "ค่าส่วนกลางบ้าน 99/1", type: "income", amount: 1200, date: "2026-02-06", time: "10:30", category: "ค่าส่วนกลาง" },
    { id: "TXN-004", title: "ค่าส่วนกลางบ้าน 99/1", type: "income", amount: 1200, date: "2026-02-06", time: "10:30", category: "ค่าส่วนกลาง" },
    { id: "TXN-005", title: "ค่าส่วนกลางบ้าน 99/1", type: "income", amount: 1200, date: "2026-02-06", time: "10:30", category: "ค่าส่วนกลาง" },
    { id: "TXN-006", title: "ค่าส่วนกลางบ้าน 99/1", type: "income", amount: 1200, date: "2026-02-06", time: "10:30", category: "ค่าส่วนกลาง" },
    { id: "TXN-007", title: "ค่าส่วนกลางบ้าน 99/1", type: "income", amount: 1200, date: "2026-02-06", time: "10:30", category: "ค่าส่วนกลาง" },
    { id: "TXN-008", title: "ค่าส่วนกลางบ้าน 99/1", type: "income", amount: 1200, date: "2026-02-06", time: "10:30", category: "ค่าส่วนกลาง" },
    { id: "TXN-009", title: "ค่าส่วนกลางบ้าน 99/1", type: "income", amount: 1200, date: "2026-02-06", time: "10:30", category: "ค่าส่วนกลาง" },
    { id: "TXN-010", title: "ค่าส่วนกลางบ้าน 99/1", type: "income", amount: 1200, date: "2026-02-06", time: "10:30", category: "ค่าส่วนกลาง" },
    { id: "TXN-011", title: "ค่าจ้างซ่อมท่อกลาง", type: "expense", amount: 3500, date: "2026-02-06", time: "14:00", category: "ซ่อมแซม" },
    { id: "TXN-012", title: "ค่าจ้างซ่อมท่อกลาง", type: "expense", amount: 3500, date: "2026-02-06", time: "14:00", category: "ซ่อมแซม" },
    { id: "TXN-013", title: "ค่าจ้างซ่อมท่อกลาง", type: "expense", amount: 3500, date: "2026-02-06", time: "14:00", category: "ซ่อมแซม" },
    { id: "TXN-014", title: "ค่าจ้างซ่อมท่อกลาง", type: "expense", amount: 3500, date: "2026-02-06", time: "14:00", category: "ซ่อมแซม" },
    { id: "TXN-015", title: "ค่าจ้างซ่อมท่อกลาง", type: "expense", amount: 3500, date: "2026-02-06", time: "14:00", category: "ซ่อมแซม" },
    { id: "TXN-016", title: "ค่าจ้างซ่อมท่อกลาง", type: "expense", amount: 3500, date: "2026-02-06", time: "14:00", category: "ซ่อมแซม" },
    { id: "TXN-017", title: "ค่าจ้างซ่อมท่อกลาง", type: "expense", amount: 3500, date: "2026-02-06", time: "14:00", category: "ซ่อมแซม" },
    { id: "TXN-018", title: "ค่าจ้างซ่อมท่อกลาง", type: "expense", amount: 3500, date: "2026-02-06", time: "14:00", category: "ซ่อมแซม" },
    { id: "TXN-019", title: "ค่าจ้างซ่อมท่อกลาง", type: "expense", amount: 3500, date: "2026-02-06", time: "14:00", category: "ซ่อมแซม" },
    // ... เพิ่มข้อมูลอื่นๆ เพื่อทดสอบ Filter/Pagination
  ]);

  // --- Logic กรองข้อมูลตาม Tab และ Filter ---
  const filteredData = transactions.filter(t => {
    const matchTab = t.type === activeTab;
    const matchDate = filter.date ? t.date === filter.date : true;
    const matchMonth = filter.month ? t.date.startsWith(filter.month) : true;
    const matchYear = filter.year ? t.date.startsWith(filter.year) : true;
    const matchTime = filter.time ? t.time.startsWith(filter.time) : true;
    return matchTab && matchDate && matchMonth && matchYear && matchTime;
  });

  // --- สรุปยอด (อิงตาม Tab ปัจจุบัน) ---
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7);
  
  const dailyTotal = filteredData.filter(t => t.date === today).reduce((sum, t) => sum + t.amount, 0);
  const monthlyTotal = filteredData.filter(t => t.date.startsWith(currentMonth)).reduce((sum, t) => sum + t.amount, 0);

  // --- Pagination Logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
    // 2. คำนวณ Pagination ข้อมูล
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData
    .slice()
    .reverse() // เอาอันใหม่ขึ้นก่อน
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 p-8">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-800">บัญชีหมู่บ้าน</h2>
          {activeTab === 'expense' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center shadow-lg"
            >
              <Plus size={20} className="mr-1" /> เพิ่มรายการเบิกจ่าย
            </button>
          )}
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
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase italic">เวลา (ชม:นาที)</label>
            <input type="time" className="w-full text-xs border border-slate-100 p-2 rounded-lg outline-none focus:ring-1 ring-indigo-500" value={filter.time} onChange={(e) => setFilter({...filter, time: e.target.value})} />
          </div>
          <button onClick={() => setFilter({ date: '', month: '', year: '', time: '' })} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition">ล้างตัวกรอง</button>
        </div>

        {/* ตารางแสดงรายการ */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b">
              <tr>
                <th className="p-5">วันเวลาที่ทำรายการ</th>
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
                    <div className="flex items-center text-slate-400 text-xs mt-1 pl-5">
                      <ClockIcon size={12} className="mr-1"/> {t.time} น.
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

          {/* Pagination */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(newExp) => setTransactions([...transactions, {...newExp, type: 'expense', time: new Date().toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}])} />
      </main>
    </div>
  );
};

export default AdminAccountManage;