import React, { useState, useRef } from 'react';
import { X, Save, Upload, CheckCircle2, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';

const AdminReplyModal = ({ isOpen, onClose, report, onUpdate }) => {
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState('');
  
  // 1. เปลี่ยนจากรูปเดียวเป็น Array
  const [adminFiles, setAdminFiles] = useState([]); 
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen || !report) return null;

  // 2. ฟังก์ชันจัดการไฟล์หลายไฟล์
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // เก็บไฟล์จริงเข้า State
    setAdminFiles(prev => [...(prev || []), ...files]);

    // สร้าง URL สำหรับ Preview
    const newPreviews = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setPreviews(prev => [...(prev || []), ...newPreviews]);
  };

  // 3. ฟังก์ชันลบรูปที่เลือกออก
  const removeFile = (index) => {
    const updatedFiles = [...adminFiles];
    updatedFiles.splice(index, 1);
    setAdminFiles(updatedFiles);

    URL.revokeObjectURL(previews[index].url); // คืน Memory
    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...report,
      adminReply: replyText,
      status: status,
      // ส่งรายการรูปภาพทั้งหมดกลับไป (หรือส่ง previews ไปโชว์ในตาราง)
      adminImages: previews, 
      finishDate: status === "เสร็จสิ้น" ? new Date().toLocaleDateString('th-TH') : null
    });
    
    // ล้างข้อมูลหลังบันทึก
    setAdminFiles([]);
    setPreviews([]);
    setReplyText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[120] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold">จัดการคำขอ: {report.id}</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {/* ข้อมูลที่ลูกบ้านแจ้ง (โชว์รูปหลายรูปของลูกบ้านด้วยถ้ามี) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase">สิ่งที่ลูกบ้านแจ้ง</p>
            <h4 className="font-bold text-slate-800">{report.subject}</h4>
            <p className="text-sm text-slate-600 mt-1">{report.description}</p>
            
            {/* แสดงรูปภาพที่ลูกบ้านแนบมา (รองรับ Array) */}
            {report.userImages && report.userImages.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {report.userImages.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={typeof img === 'string' ? img : img.url} 
                    className="w-20 h-20 object-cover rounded-lg border shadow-sm flex-shrink-0" 
                  />
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* ฟอร์มตอบกลับ */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">อัปเดตสถานะ</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'รอดำเนินการ', value: 'รอดำเนินการ', color: 'border-amber-500 text-amber-600', icon: <AlertCircle size={14}/> },
                { label: 'กำลังดำเนินการ', value: 'กำลังดำเนินการ', color: 'border-blue-500 text-blue-600', icon: <Clock size={14}/> },
                { label: 'เสร็จสิ้น', value: 'เสร็จสิ้น', color: 'border-green-500 text-green-600', icon: <CheckCircle2 size={14}/> },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setStatus(item.value)}
                  className={`flex items-center justify-center p-2 border-2 rounded-xl text-xs font-bold transition ${
                    status === item.value ? item.color + ' bg-slate-50 shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ข้อความตอบกลับ/หมายเหตุจากช่าง</label>
            <textarea 
              required
              rows="3"
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition text-sm"
              placeholder="ระบุรายละเอียดการแก้ไขปัญหา..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            ></textarea>
          </div>

          {/* อัปโหลดไฟล์ภาพยืนยันการแก้ไข */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">แนบภาพยืนยันการแก้ไข (ได้หลายภาพ)</label>
            <input 
              type="file" 
              multiple // สำคัญ: เลือกได้หลายไฟล์
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            
            <div 
              onClick={() => fileInputRef.current.click()} 
              className="h-20 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition mb-3"
            >
              <Upload size={20} className="text-slate-300 mb-1" />
              <p className="text-[10px] text-slate-400">คลิกเพื่ออัปโหลดรูปภาพงานที่เสร็จแล้ว</p>
            </div>

            {/* แสดง Preview รูปที่ Admin เลือก */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {previews.map((file, index) => (
                  <div key={file.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                    <img src={file.url} className="w-full h-full object-cover" alt="admin-preview" />
                    <button 
                      type="button" 
                      onClick={() => removeFile(index)} 
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md"
                    >
                      <X size={10}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition flex items-center justify-center shadow-lg active:scale-[0.98]">
            <Save size={18} className="mr-2" /> บันทึกการอัปเดต
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminReplyModal;