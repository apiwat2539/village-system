import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ReportDetailModal from '../components/ReportDetailModal';
import { Clock, Loader2, ChevronRight } from 'lucide-react';
import Pagination from '../components/Pagination';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

// สีของ badge ตามสถานะจริงจาก backend (constants.IssueStatus* ใน village-system-backend)
const statusColor = (status) => {
  if (status === 'เสร็จสิ้น') return 'bg-green-100 text-green-700';
  if (status === 'กำลังดำเนินการ') return 'bg-blue-100 text-blue-700';
  return 'bg-amber-100 text-amber-700'; // รอดำเนินการ
};

const ReportHistory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ส่วนของ Pagination Logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // แสดง 5 รายการต่อหน้า

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(ENDPOINTS.ISSUES.GET_MINE);
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setReports(data);
      } catch (err) {
        console.error("Fetch issues error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // backend เรียงใหม่สุดมาก่อนให้แล้ว (order by created_at desc)
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const currentItems = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleViewDetail(item)}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group flex justify-between items-center animate-in fade-in slide-in-from-bottom-2"
                  >
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor(item.status)} mb-2 inline-block`}>
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
            </>
          )}
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
