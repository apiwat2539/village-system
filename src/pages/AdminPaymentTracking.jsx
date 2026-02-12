import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import { Search, AlertCircle, CheckCircle2, MessageCircle, Home, Inbox } from 'lucide-react';

const AdminPaymentTracking = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  
  // --- 1. Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [payments] = useState([
    { id: 1, houseNo: "99/1", name: "สมชาย รักดี", lineId: "somchai_line", monthlyFee: 500, outstandingAmount: 0, currentMonthStatus: "paid", overdueMonths: 0 },
    { id: 2, houseNo: "99/2", name: "สมศรี มีสุข", lineId: "somsri_line", monthlyFee: 500, outstandingAmount: 1000, currentMonthStatus: "pending", overdueMonths: 2 },
    { id: 3, houseNo: "99/3", name: "วิชัย ใจกล้า", lineId: "wichai_line", monthlyFee: 500, outstandingAmount: 500, currentMonthStatus: "pending", overdueMonths: 1 },
    { id: 4, houseNo: "99/4", name: "มานี มานะ", lineId: "manee_ch", monthlyFee: 500, outstandingAmount: 0, currentMonthStatus: "paid", overdueMonths: 0 },
    { id: 5, houseNo: "99/1", name: "สมชาย รักดี", lineId: "somchai_line", monthlyFee: 500, outstandingAmount: 0, currentMonthStatus: "paid", overdueMonths: 0 },
    { id: 6, houseNo: "99/2", name: "สมศรี มีสุข", lineId: "somsri_line", monthlyFee: 500, outstandingAmount: 1000, currentMonthStatus: "pending", overdueMonths: 2 },
    { id: 7, houseNo: "99/3", name: "วิชัย ใจกล้า", lineId: "wichai_line", monthlyFee: 500, outstandingAmount: 500, currentMonthStatus: "pending", overdueMonths: 1 },
    { id: 8, houseNo: "99/4", name: "มานี มานะ", lineId: "manee_ch", monthlyFee: 500, outstandingAmount: 0, currentMonthStatus: "paid", overdueMonths: 0 },
    // ... สามารถเพิ่มข้อมูล Mock Data เพิ่มเติมได้ที่นี่
  ]);

  // --- 2. Filter Logic (หุ้มด้วย useMemo เพื่อประสิทธิภาพ) ---
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = p.houseNo.includes(searchTerm) || p.name.includes(searchTerm);
      const matchStatus = filterStatus === 'ทั้งหมด' || 
                         (filterStatus === 'ค้างชำระ' && p.outstandingAmount > 0) ||
                         (filterStatus === 'จ่ายแล้ว' && p.outstandingAmount === 0);
      return matchSearch && matchStatus;
    });
  }, [searchTerm, filterStatus, payments]);

  // --- 3. Pagination Logic ---
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayments, currentPage]);

  // ฟังก์ชันรีเซ็ตหน้าเมื่อมีการ Filter
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // กลับไปหน้าแรกเสมอเมื่อค้นหา
  };

  const handleFilter = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // กลับไปหน้าแรกเสมอเมื่อกรอง
  };

  const handleNotifyLine = (user) => {
    alert(`ส่งข้อความแจ้งเตือนยอดค้างชำระ ${user.outstandingAmount} บาท ไปยังคุณ ${user.name} เรียบร้อยแล้ว`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-kanit">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800">ติดตามการชำระเงิน</h2>
                <p className="text-sm text-slate-500">ตรวจสอบสถานะค่าส่วนกลางและแจ้งเตือนลูกบ้าน ({filteredPayments.length} รายการ)</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาบ้านเลขที่/ชื่อ..." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <select 
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-600"
                  value={filterStatus}
                  onChange={handleFilter}
                >
                  <option value="ทั้งหมด">สถานะทั้งหมด</option>
                  <option value="ค้างชำระ">ค้างชำระ</option>
                  <option value="จ่ายแล้ว">จ่ายแล้ว</option>
                </select>
              </div>
            </div>

            {filteredPayments.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">บ้านเลขที่ / ชื่อ</th>
                          <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">ยอดรายเดือน</th>
                          <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">ยอดค้างชำระ</th>
                          <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">สถานะ</th>
                          <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {currentItems.map((item) => (
                          <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="p-5">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                                  <Home size={16} />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 text-sm">{item.houseNo}</div>
                                  <div className="text-xs text-slate-400">{item.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-5 text-center text-sm font-medium text-slate-600">
                              ฿{item.monthlyFee.toLocaleString()}
                            </td>
                            <td className="p-5 text-center">
                               <div className={`text-sm font-black ${item.outstandingAmount > 0 ? 'text-red-500' : 'text-slate-300'}`}>
                                 ฿{item.outstandingAmount.toLocaleString()}
                               </div>
                               {item.overdueMonths > 0 && <div className="text-[10px] text-red-400 mt-1">ค้าง {item.overdueMonths} เดือน</div>}
                            </td>
                            <td className="p-5">
                              <div className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full mx-auto w-fit ${item.outstandingAmount === 0 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                {item.outstandingAmount === 0 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                <span className="text-[11px] font-bold uppercase">{item.outstandingAmount === 0 ? 'ปกติ' : 'มียอดค้าง'}</span>
                              </div>
                            </td>
                            <td className="p-5 text-center">
                              {item.outstandingAmount > 0 && (
                                <button 
                                  onClick={() => handleNotifyLine(item)}
                                  className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition shadow-sm active:scale-95"
                                >
                                  <MessageCircle size={18} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {currentItems.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3 font-bold">
                            {item.houseNo.split('/')[1] || 'H'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">บ้านเลขที่ {item.houseNo}</div>
                            <div className="text-xs text-slate-500">{item.name}</div>
                          </div>
                        </div>
                        <div className={`py-1 px-3 rounded-full text-[10px] font-black uppercase ${item.outstandingAmount === 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {item.outstandingAmount === 0 ? 'PAID' : 'OVERDUE'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">ยอดรายเดือน</p>
                          <p className="font-bold text-slate-700">฿{item.monthlyFee}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">ยอดค้างชำระ</p>
                          <p className={`font-black ${item.outstandingAmount > 0 ? 'text-red-500' : 'text-slate-800'}`}>฿{item.outstandingAmount}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-slate-400">
                           {item.overdueMonths > 0 ? `ค้างทั้งหมด ${item.overdueMonths} เดือน` : 'ไม่มีประวัติค้างชำระ'}
                        </div>
                        {item.outstandingAmount > 0 && (
                          <button 
                            onClick={() => handleNotifyLine(item)}
                            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition"
                          >
                            <MessageCircle size={14} /> แจ้งเตือน
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- Pagination Component --- */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="text-slate-300" size={40} />
                </div>
                <h3 className="text-slate-800 font-bold text-lg">ไม่พบข้อมูลสมาชิก</h3>
                <p className="text-slate-400 text-sm">ลองค้นหาด้วยบ้านเลขที่อื่น หรือเปลี่ยนตัวกรองสถานะ</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPaymentTracking;