import React, { useState, useRef } from 'react';
import { X, Copy, UploadCloud, CheckCircle, Image as ImageIcon } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, amount }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null); // ใช้สำหรับอ้างอิง input file

  if (!isOpen) return null;

  const bankInfo = {
    bankName: "ธนาคารกสิกรไทย (K-Bank)",
    accountNumber: "123-4-56789-0",
    accountName: "นิติบุคคลหมู่บ้านวิลเลจคอนเนค"
  };

  // ฟังก์ชันเมื่อมีการเลือกไฟล์
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // สร้างลิงก์ชั่วคราวเพื่อแสดงรูป
    }
  };

  const handleConfirm = () => {
    // ตรงนี้คือจุดที่เราจะส่งไฟล์ไปที่ Golang Backend ในอนาคต
    console.log("ไฟล์สลิปที่จะส่ง:", selectedFile);
    alert("ส่งหลักฐานเรียบร้อย! นิติบุคคลจะตรวจสอบภายใน 24 ชม.");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">ชำระค่าส่วนกลาง</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-6">
          {/* ข้อมูลบัญชี */}
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">{bankInfo.bankName}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-mono font-bold text-indigo-900">{bankInfo.accountNumber}</span>
              <button 
                onClick={() => {navigator.clipboard.writeText(bankInfo.accountNumber); alert("คัดลอกแล้ว");}}
                className="text-indigo-600 p-1 hover:bg-white rounded-md transition"
              >
                <Copy size={16}/>
              </button>
            </div>
            <p className="text-xs text-indigo-700 mt-1">ชื่อบัญชี: {bankInfo.accountName}</p>
          </div>

          {/* ส่วนอัปโหลดสลิป */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">แนบหลักฐานการโอน (สลิป)</label>
            
            {/* Input File แบบซ่อน */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            {previewUrl ? (
              /* แสดงรูปตัวอย่างเมื่อเลือกแล้ว */
              <div className="relative group rounded-2xl overflow-hidden border-2 border-indigo-100 h-56">
                <img src={previewUrl} className="w-full h-full object-cover" alt="Slip Preview" />
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <p className="text-white text-xs font-bold">เปลี่ยนรูปภาพ</p>
                </div>
              </div>
            ) : (
              /* แสดงปุ่มอัปโหลดถ้ายังไม่ได้เลือกรูป */
              <div 
                onClick={() => fileInputRef.current.click()}
                className="w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition group"
              >
                <UploadCloud className="text-gray-300 group-hover:text-indigo-400 mb-2" size={32} />
                <p className="text-xs text-gray-400">คลิกเพื่อเลือกไฟล์รูปสลิป</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ยอดชำระสุทธิ</span>
              <span className="font-bold text-gray-800">฿{amount.toLocaleString()}</span>
            </div>
            <button 
              disabled={!selectedFile}
              onClick={handleConfirm}
              className={`w-full py-4 rounded-2xl font-bold transition shadow-lg ${
                selectedFile 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              ยืนยันการแจ้งโอน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;