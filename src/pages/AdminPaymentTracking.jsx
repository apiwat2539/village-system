import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import { Bell, Search, Filter, AlertCircle, CheckCircle2, MessageCircle } from 'lucide-react';

const AdminPaymentTracking = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ข้อมูลจำลองของลูกบ้านและการชำระเงิน
  const [payments, setPayments] = useState([
    { id: 1, houseNo: "99/1", name: "สมชาย รักดี", lineId: "somchai_line", monthlyFee: 500, outstandingAmount: 0, currentMonthStatus: "paid", overdueMonths: 0 },
    { id: 2, houseNo: "99/2", name: "สมศรี มีสุข", lineId: "somsri_line", monthlyFee: 500, outstandingAmount: 1000, currentMonthStatus: "pending", overdueMonths: 2 },
    { id: 3, houseNo: "99/3", name: "วิชัย ใจกล้า", lineId: "wichai_line", monthlyFee: 500, outstandingAmount: 500, currentMonthStatus: "pending", overdueMonths: 1 },
    { id: 4, houseNo: "99/4", name: "มานี มานะ", lineId: "manee_ch", monthlyFee: 500, outstandingAmount: 0, currentMonthStatus: "paid", overdueMonths: 0 },
    { id: 5, houseNo: "99/1", name: "สมชาย รักดี", lineId: "somchai_line", monthlyFee: 500, outstandingAmount: 0, currentMonthStatus: "paid", overdueMonths: 0 },
    { id: 6, houseNo: "99/2", name: "สมศรี มีสุข", lineId: "somsri_line", monthlyFee: 500, outstandingAmount: 1000, currentMonthStatus: "pending", overdueMonths: 2 },
    { id: 7, houseNo: "99/3", name: "วิชัย ใจกล้า", lineId: "wichai_line", monthlyFee: 500, outstandingAmount: 500, currentMonthStatus: "pending", overdueMonths: 1 },
    { id: 8, houseNo: "99/4", name: "มานี มานะ", lineId: "manee_ch", monthlyFee: 500, outstandingAmount: 0, currentMonthStatus: "paid", overdueMonths: 0 },
    { id: 9, houseNo: "99/1", name: "สมชาย รักดี", lineId: "somchai_line", monthlyFee: 500, outstandingAmount: 0, currentMonthStatus: "paid", overdueMonths: 0 },
    { id: 10, houseNo: "99/2", name: "สมศรี มีสุข", lineId: "somsri_line", monthlyFee: 500, outstandingAmount: 1000, currentMonthStatus: "pending", overdueMonths: 2 },
    { id: 11, houseNo: "99/3", name: "วิชัย ใจกล้า", lineId: "wichai_line", monthlyFee: 500, outstandingAmount: 500, currentMonthStatus: "pending", overdueMonths: 1 },
    { id: 12, houseNo: "99/4", name: "มานี มานะ", lineId: "manee_ch", monthlyFee: 500, outstandingAmount: 0, currentMonthStatus: "paid", overdueMonths: 0 },
    // ... เพิ่มข้อมูลตามต้องการ
  ]);

  // ฟังก์ชันส่งการแจ้งเตือน LINE
  const handleNotifyLine = (user) => {
    // ในอนาคตจะเชื่อมต่อกับ backend: axios.post('/api/notify-line', { lineId: user.lineId })
    console.log(`ส่งการแจ้งเตือนไปที่ LINE ID: ${user.lineId}`);
    alert(`ส่งข้อความแจ้งเตือนยอดค้างชำระ ${user.outstandingAmount} บาท ไปยังคุณ ${user.name} เรียบร้อยแล้ว`);
  };

  // กรองข้อมูล
  const filteredPayments = payments.filter(p => {
    const matchSearch = p.houseNo.includes(searchTerm) || p.name.includes(searchTerm);
    const matchStatus = filterStatus === 'ทั้งหมด' || 
                       (filterStatus === 'ค้างชำระ' && p.outstandingAmount > 0) ||
                       (filterStatus === 'จ่ายแล้ว' && p.outstandingAmount === 0);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const currentItems = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 p-8">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-800">ติดตามการชำระค่าส่วนกลาง</h2>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาบ้านเลขที่/ชื่อ..." 
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              <option value="ค้างชำระ">ค้างชำระ</option>
              <option value="จ่ายแล้ว">จ่ายแล้ว</option>
            </select>
          </div>
        </div>

        {/* ตารางข้อมูล */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">บ้านเลขที่ / ชื่อ</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">ยอดรายเดือน</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">ยอดค้างชำระ</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">เดือนที่ค้าง</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">สถานะ</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">แจ้งเตือน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 text-sm">{item.houseNo}</div>
                      <div className="text-xs text-slate-500">{item.name}</div>
                    </td>
                    <td className="p-4 text-center text-sm font-semibold text-slate-600">
                      ฿{item.monthlyFee.toLocaleString()}
                    </td>
                    <td className={`p-4 text-center text-sm font-bold ${item.outstandingAmount > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      ฿{item.outstandingAmount.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      {item.overdueMonths > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                          ค้าง {item.overdueMonths} เดือน
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.outstandingAmount === 0 ? (
                        <div className="flex items-center justify-center text-green-500 gap-1">
                          <CheckCircle2 size={16} />
                          <span className="text-xs font-bold">ปกติ</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-amber-500 gap-1">
                          <AlertCircle size={16} />
                          <span className="text-xs font-bold">มียอดค้าง</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.outstandingAmount > 0 && (
                        <button 
                          onClick={() => handleNotifyLine(item)}
                          className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition group relative"
                          title="ส่งแจ้งเตือน LINE"
                        >
                          <MessageCircle size={18} />
                          {/* Tooltip เล็กๆ */}
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-24 p-1 bg-slate-800 text-white text-[10px] rounded shadow-lg">
                            ส่ง LINE Notify
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminPaymentTracking;