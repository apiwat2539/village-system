import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Wrench, Upload, X, Send, AlertCircle, Clock, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportIssue = () => {
  const navigate = useNavigate();
  
  // 1. เปลี่ยน State สำหรับเก็บข้อมูลไฟล์
  const [report, setReport] = useState({
    category: '',
    subject: '',
    description: '',
    files: [] // เก็บ File Objects จริง
  });
  
  const [previews, setPreviews] = useState([]); // เก็บ URL สำหรับ Preview รูป
  const fileInputRef = useRef(null);

  const categories = [
    "แจ้งซ่อมแซมภายในบ้าน",
    "แจ้งซ่อมพื้นที่ส่วนกลาง (ไฟทาง/ถนน)",
    "ปัญหาขยะ/ความสะอาด",
    "ความปลอดภัย/รปภ.",
    "อื่นๆ"
  ];

  // 2. ปรับ Logic การเลือกไฟล์ (รองรับหลายไฟล์)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // อัปเดตไฟล์เข้าไปใน Array เดิม (Spread Operator)
    setReport(prev => ({
      ...prev,
      files: [...(prev.files || []), ...files]
    }));

    // สร้าง URL สำหรับ Preview รูปใหม่ๆ
    const newPreviews = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setPreviews(prev => [...(prev || []), ...newPreviews]);
  };

  // 3. ฟังก์ชันลบรูปที่ไม่ต้องการออก
  const removeFile = (index) => {
    // ลบออกจากรายการไฟล์ที่จะส่ง
    const updatedFiles = [...report.files];
    updatedFiles.splice(index, 1);
    setReport({ ...report, files: updatedFiles });

    // ลบออกจากรายการ Preview และคืนค่า Memory
    URL.revokeObjectURL(previews[index].url);
    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // จำลองการส่งข้อมูล (ในอนาคตคือส่วนของ Axios POST ส่ง Multipart Form Data)
    console.log("ส่งข้อมูล:", {
      ...report,
      fileCount: report.files.length
    });

    alert("ส่งเรื่องแจ้งปัญหาเรียบร้อยแล้ว!");
    navigate('/report-history'); 
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <Header />

        <div className="max-w-3xl mx-auto mb-4 flex justify-end">
          <button 
            onClick={() => navigate('/report-history')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-4 py-2 rounded-lg transition"
          >
            <Clock size={16} className="mr-2" /> ดูประวัติการแจ้งเรื่องทั้งหมด
          </button>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white flex items-center">
              <Wrench className="mr-3" size={24} />
              <div>
                <h2 className="text-xl font-bold font-kanit">แจ้งปัญหา / ขอรับบริการซ่อมแซม</h2>
                <p className="text-indigo-100 text-xs">กรุณากรอกรายละเอียดเพื่อให้เจ้าหน้าที่เข้าตรวจสอบ</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* หมวดหมู่ปัญหา */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">หมวดหมู่ปัญหา</label>
                <select 
                  required
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition text-sm"
                  value={report.category}
                  onChange={(e) => setReport({...report, category: e.target.value})}
                >
                  <option value="">เลือกหมวดหมู่...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* หัวข้อเรื่อง */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">หัวข้อเรื่อง</label>
                <input 
                  type="text"
                  required
                  placeholder="เช่น กิ่งไม้บังไฟทาง, ท่อระปาซึม"
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                  value={report.subject}
                  onChange={(e) => setReport({...report, subject: e.target.value})}
                />
              </div>

              {/* รายละเอียด */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">รายละเอียดเพิ่มเติม</label>
                <textarea 
                  rows="4"
                  required
                  placeholder="ระบุจุดที่เกิดปัญหา หรือรายละเอียดที่ต้องการให้ช่างทราบ..."
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                  value={report.description}
                  onChange={(e) => setReport({...report, description: e.target.value})}
                ></textarea>
              </div>

              {/* อัปโหลดหลายไฟล์ภาพ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">แนบภาพประกอบ (เลือกได้หลายภาพ)</label>
                <input 
                  type="file"
                  multiple // รองรับการเลือกหลายไฟล์
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                >
                  <Upload className="text-gray-300 mb-2" size={32} />
                  <p className="text-sm text-gray-400 font-medium">คลิกเพื่ออัปโหลดรูปภาพ</p>
                  <p className="text-[10px] text-gray-300 mt-1">สามารถเลือกได้มากกว่า 1 รูป</p>
                </div>

                {/* แสดง Preview รูปภาพแบบ Grid */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                    {previews.map((file, index) => (
                      <div key={file.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={file.url} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                  <Send size={18} className="mr-2" /> ส่งเรื่องแจ้งปัญหา
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-6 flex items-start p-4 bg-amber-50 rounded-xl border border-amber-100">
            <AlertCircle className="text-amber-500 mr-3 flex-shrink-0" size={20} />
            <p className="text-[11px] text-amber-700">
              * ข้อมูลการแจ้งปัญหาพร้อมภาพประกอบจะถูกส่งไปที่ทีมนิติบุคคลโดยตรง คุณสามารถติดตามสถานะการดำเนินการได้ที่เมนู "ประวัติการแจ้งเรื่อง"
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportIssue;