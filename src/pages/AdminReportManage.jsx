import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AdminReplyModal from '../components/AdminReplyModal';
import Pagination from '../components/Pagination';
import { MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import Swal from 'sweetalert2';

const AdminReportManage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(ENDPOINTS.ISSUES.GET_ALL);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setReports(data);
    } catch (err) {
      console.error("Fetch issues error:", err);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลเรื่องแจ้งปัญหาได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 1. Filter ข้อมูลก่อน
  const filteredReports = filterStatus === 'ทั้งหมด'
    ? reports
    : reports.filter(r => r.status === filterStatus);

  // 2. คำนวณ Pagination ข้อมูล (backend เรียงใหม่สุดมาก่อนให้แล้ว)
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const currentItems = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 p-8">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* ส่วนหัวและตัวกรอง (เหมือนเดิม) */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">จัดการเรื่องแจ้งปัญหา</h2>
          <div className="flex space-x-2 bg-white p-1 rounded-xl border border-slate-200">
            {['ทั้งหมด', 'รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น'].map(s => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setCurrentPage(1); }} // เมื่อเปลี่ยน filter ให้กลับไปหน้า 1
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterStatus === s ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">รหัส / วันที่</th>
                  <th className="p-4">หัวข้อเรื่อง</th>
                  <th className="p-4">หมวดหมู่</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-800">{report.id}</div>
                      <div className="text-[10px] text-slate-400">{report.date}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 text-sm">{report.subject}</td>
                    <td className="p-4 text-xs text-slate-500">{report.category}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${report.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-600' :
                          report.status === 'กำลังดำเนินการ' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        {/* เงื่อนไข: ถ้าสถานะไม่ใช่ 'เสร็จสิ้น' ถึงจะแสดงปุ่มจัดการ */}
                        {report.status !== 'เสร็จสิ้น' ? (
                          <button
                            onClick={() => { setSelectedReport(report); setIsModalOpen(true); }}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition group relative"
                            title="จัดการรายงาน"
                          >
                            <MessageSquare size={16} />
                            {/* Tooltip */}
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow-xl whitespace-nowrap">
                              ตอบกลับ / อัปเดตสถานะ
                            </span>
                          </button>
                        ) : (
                          // ถ้าเสร็จแล้ว อาจจะแสดงไอคอน Check สีเขียวจางๆ หรือปล่อยว่างไว้
                          <div className="p-2 text-green-500 opacity-50" title="ดำเนินการเสร็จสิ้นแล้ว">
                            <CheckCircle2 size={18} />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400 italic">ไม่พบเรื่องแจ้งปัญหา</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* 2. เรียกใช้ Pagination Component แทน Code ชุดเดิม */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        <AdminReplyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          report={selectedReport}
          onUpdate={() => {
            setIsModalOpen(false);
            fetchReports();
          }}
        />
      </main>
    </div>
  );
};

export default AdminReportManage;
