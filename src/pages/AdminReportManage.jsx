import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AdminReplyModal from '../components/AdminReplyModal';
import Pagination from '../components/Pagination';
import { MessageSquare, CheckCircle2 } from 'lucide-react';

const AdminReportManage = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [reports, setReports] = useState([
    { id: "REQ-001", subject: "ไฟทางหน้าบ้านดับ", category: "ซ่อมแซม", status: "รอดำเนินการ", date: "01/02/2026", description: "ไฟกิ่งซอย 4 ดับ 2 ดวงครับ" },
    { id: "REQ-002", subject: "ท่อน้ำแตก", category: "ประปา", status: "กำลังดำเนินการ", date: "02/02/2026", description: "น้ำซึมออกจากพื้นถนน" },
    { id: "REQ-003", subject: "หญ้าสวนกลางยาวเกินไป", category: "สวน", status: "เสร็จสิ้น", date: "03/02/2026", description: "รบกวนส่งคนมาตัดหญ้า" },
    { id: "REQ-004", subject: "ขยะตกหล่น", category: "ความสะอาด", status: "รอดำเนินการ", date: "04/02/2026", description: "ถังขยะหน้าบ้าน 99/5 เต็ม" },
    { id: "REQ-005", subject: "กล้องวงจรปิดดับ", category: "ความปลอดภัย", status: "เสร็จสิ้น", date: "05/02/2026", description: "กล้องหน้าหมู่บ้านดับ" },
    { id: "REQ-006", subject: "ป้ายซอยเอียง", category: "ซ่อมแซม", status: "รอดำเนินการ", date: "06/02/2026", description: "ป้ายซอย 2 เอียงมาก" },
    // สามารถเพิ่มข้อมูลจำลองได้เรื่อยๆ เพื่อทดสอบหน้า
  ]);

  // 1. Filter ข้อมูลก่อน
  const filteredReports = filterStatus === 'ทั้งหมด' 
    ? reports 
    : reports.filter(r => r.status === filterStatus);

  // 2. คำนวณ Pagination ข้อมูล
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const currentItems = filteredReports
    .slice()
    .reverse() // เอาอันใหม่ขึ้นก่อน
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <Header />
        
        {/* ส่วนหัวและตัวกรอง (เหมือนเดิม) */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">จัดการเรื่องแจ้งปัญหา</h2>
          <div className="flex space-x-2 bg-white p-1 rounded-xl border border-slate-200">
            {['ทั้งหมด', 'รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น'].map(s => (
              <button 
                key={s}
                onClick={() => { setFilterStatus(s); setCurrentPage(1); }} // เมื่อเปลี่ยน filter ให้กลับไปหน้า 1
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === s ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                  {/* ... ข้อมูลในแถวเหมือนเดิม ... */}
                  <td className="p-4">
                    <div className="text-xs font-bold text-slate-800">{report.id}</div>
                    <div className="text-[10px] text-slate-400">{report.date}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 text-sm">{report.subject}</td>
                  <td className="p-4 text-xs text-slate-500">{report.category}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      report.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-600' : 
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
                          <MessageSquare size={16}/>
                          {/* Tooltip */}
                          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow-xl whitespace-nowrap">
                            ตอบกลับ / อัปเดตสถานะ
                          </span>
                        </button>
                      ) : (
                        // ถ้าเสร็จแล้ว อาจจะแสดงไอคอน Check สีเขียวจางๆ หรือปล่อยว่างไว้
                        <div className="p-2 text-green-500 opacity-50" title="ดำเนินการเสร็จสิ้นแล้ว">
                          <CheckCircle2 size={18}/>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
          onUpdate={(updatedData) => {
            setReports(reports.map(r => r.id === updatedData.id ? updatedData : r));
          }}
        />
      </main>
    </div>
  );
};

export default AdminReportManage;