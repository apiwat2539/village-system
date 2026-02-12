import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ReportDetailModal from '../components/ReportDetailModal';
import { Clock, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import Pagination from '../components/Pagination';

const ReportHistory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- ส่วนของ Pagination Logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // แสดง 5 รายการต่อหน้า

  // ข้อมูลจำลอง (เพิ่มข้อมูลให้เยอะขึ้นเพื่อทดสอบการแบ่งหน้า)
  const [reports] = useState([
    { id: "REQ-001", subject: "ไฟทางหน้าบ้านดับ", category: "แจ้งซ่อม", date: "20 พ.ค. 2024", status: "เสร็จสิ้น", color: "bg-green-100 text-green-700", userImages: ["https://example.com/image1.jpg","https://example.com/image1.jpg"],  adminReply: "test test", adminImages: ["https://example.com/image1.jpg","https://example.com/image1.jpg"]},
    { id: "REQ-002", subject: "ท่อน้ำแตกหน้าบ้าน", category: "แจ้งซ่อม", date: "18 พ.ค. 2024", status: "กำลังดำเนินการ", color: "bg-blue-100 text-blue-700" },
    { id: "REQ-003", subject: "ขยะหน้าบ้านไม่ได้รับการจัดเก็บ", category: "ความสะอาด", date: "15 พ.ค. 2024", status: "รอดำเนินการ", color: "bg-amber-100 text-amber-700" },
    { id: "REQ-004", subject: "กิ่งไม้พาดสายไฟ", category: "ความปลอดภัย", date: "10 พ.ค. 2024", status: "เสร็จสิ้น", color: "bg-green-100 text-green-700" },
    { id: "REQ-005", subject: "สุนัขจรจัดในโครงการ", category: "ความปลอดภัย", date: "05 พ.ค. 2024", status: "เสร็จสิ้น", color: "bg-green-100 text-green-700" },
    { id: "REQ-006", subject: "กล้อง CCTV ซอย 3 เสีย", category: "ความปลอดภัย", date: "01 พ.ค. 2024", status: "รอดำเนินการ", color: "bg-amber-100 text-amber-700" },
  ]);

  // 2. คำนวณ Pagination ข้อมูล
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const currentItems = reports
    .slice()
    .reverse() // เอาอันใหม่ขึ้นก่อน
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-8">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 font-kanit">ประวัติการแจ้งเรื่อง</h2>
            <p className="text-sm text-slate-500">ทั้งหมด {reports.length} รายการ</p>
          </div>
          
          <div className="space-y-4">
            {currentItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleViewDetail(item)}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group flex justify-between items-center animate-in fade-in slide-in-from-bottom-2"
              >
                <div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.color} mb-2 inline-block`}>
                    {item.status}
                  </span>
                  <h3 className="text-lg font-bold group-hover:text-indigo-600 transition text-slate-800">{item.subject}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Clock size={14} className="mr-1" /> {item.date} • {item.category}
                  </p>
                </div>
                <div className="flex items-center text-slate-300 group-hover:text-indigo-500 transition">
                  <span className="text-xs mr-2 hidden sm:block">ดูรายละเอียด</span>
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}

            {/* หากไม่มีข้อมูล */}
            {reports.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">ยังไม่มีประวัติการแจ้งเรื่องของคุณ</p>
              </div>
            )}
          </div>

          {/* --- ส่วนปุ่ม Pagination --- */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {/* เรียกใช้ Modal */}
        <ReportDetailModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          data={selectedReport} 
        />
      </main>
    </div>
  );
};

export default ReportHistory;