import React from 'react';
import { X, Clock, CheckCircle2, MessageCircle, Image as ImageIcon } from 'lucide-react';

const ReportDetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  // Helper function สำหรับการเรนเดอร์กลุ่มรูปภาพ
  const renderImageGallery = (images) => {
    if (!images || images.length === 0) return null;

    // ตรวจสอบว่าเป็น Array หรือไม่ (เผื่อกรณีข้อมูลเก่าเป็น string ตัวเดียว)
    const imageList = Array.isArray(images) ? images : [images];

    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {imageList.map((img, index) => (
          <div 
            key={index} 
            className={`rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 ${
              imageList.length === 1 ? 'col-span-2' : 'col-span-1'
            }`}
          >
            <img 
              src={typeof img === 'string' ? img : img.url} 
              alt={`Attachment ${index + 1}`} 
              className="w-full h-32 md:h-40 object-cover hover:scale-105 transition duration-500 cursor-zoom-in"
              onClick={() => window.open(typeof img === 'string' ? img : img.url, '_blank')}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={20} />
            <h3 className="font-bold font-kanit text-lg">รายละเอียดการแจ้งเรื่อง</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* ส่วนที่ 1: ข้อมูลที่ลูกบ้านแจ้ง */}
          <div className="relative pl-8 border-l-2 border-dashed border-indigo-200">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm"></div>
            <div className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">ข้อมูลการแจ้งเรื่อง</div>
            <h4 className="text-lg font-bold text-slate-800 leading-tight">{data.subject}</h4>
            <div className="inline-block bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-md mt-1 font-bold">
              {data.category}
            </div>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              {data.description || "ไม่มีรายละเอียดเพิ่มเติม"}
            </p>
            
            {/* แสดงรูปภาพหลายรูปจากลูกบ้าน */}
            <div className="mt-4">
               <p className="text-[10px] font-bold text-slate-400 mb-2 flex items-center">
                 <ImageIcon size={12} className="mr-1"/> ภาพประกอบจากผู้แจ้ง:
               </p>
               {data.userImages && data.userImages.length > 0 ? (
                 renderImageGallery(data.userImages)
               ) : (
                 <div className="text-[11px] text-slate-400 italic py-2">ไม่มีรูปภาพประกอบ</div>
               )}
            </div>
            
            <div className="flex items-center mt-4 text-[11px] text-slate-400">
              <Clock size={12} className="mr-1" /> แจ้งเมื่อ: {data.date}
            </div>
          </div>

          {/* ส่วนที่ 2: การตอบกลับจาก Admin */}
          <div className="relative pl-8 border-l-2 border-slate-200">
            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
              data.status === 'เสร็จสิ้น' ? 'bg-green-500' : 'bg-amber-500'
            }`}></div>
            <div className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">สถานะการดำเนินการ</div>
            
            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-3 ${
              data.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {data.status}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
              <div className="flex items-center text-slate-800 font-bold text-sm mb-2">
                <MessageCircle size={16} className="mr-2 text-indigo-500" />
                บันทึกจากเจ้าหน้าที่
              </div>
              <p className="text-sm text-slate-600 italic leading-relaxed">
                {data.adminReply || "กำลังรอเจ้าหน้าที่เข้าตรวจสอบและดำเนินการ..."}
              </p>

              {/* แสดงรูปภาพหลายรูปจาก Admin (เมื่อซ่อมเสร็จ) */}
              {data.adminImages && data.adminImages.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 mb-2">ภาพถ่ายยืนยันการแก้ไข:</p>
                  {renderImageGallery(data.adminImages)}
                </div>
              )}
            </div>
            
            {data.finishDate && (
              <div className="mt-3 text-[11px] text-slate-400 font-medium">
                ดำเนินการสำเร็จเมื่อ: {data.finishDate}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition shadow-sm active:scale-[0.98]"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;