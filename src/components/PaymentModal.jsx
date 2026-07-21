import React, { useState, useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import PaymentQR from './PaymentQR';

const PaymentModal = ({ isOpen, onClose, amount, paymentType, targetBillId, label }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null); // ใช้สำหรับอ้างอิง input file

  if (!isOpen) return null;

  // ฟังก์ชันเมื่อมีการเลือกไฟล์
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // สร้างลิงก์ชั่วคราวเพื่อแสดงรูป
    }
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append('amount', amount);
      form.append('paymentType', paymentType);
      if (targetBillId) form.append('targetBillId', targetBillId);
      form.append('slip', selectedFile);

      await api.post(ENDPOINTS.PAYMENTS.SUBMIT, form);

      await Swal.fire({
        title: 'สำเร็จ',
        text: 'ส่งหลักฐานเรียบร้อย! นิติบุคคลจะตรวจสอบภายใน 24 ชม.',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ไม่สามารถส่งหลักฐานการโอนได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">ชำระค่าส่วนกลาง</h3>
            {label && <p className="text-xs text-indigo-500 font-bold mt-0.5">{label}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-6">
          {/* QR พร้อมเพย์ / ข้อมูลบัญชีสำหรับโอน */}
          <PaymentQR amount={amount} />

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
              disabled={!selectedFile || isSubmitting}
              onClick={handleConfirm}
              className={`w-full py-4 rounded-2xl font-bold transition shadow-lg ${
                selectedFile && !isSubmitting
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? 'กำลังส่ง...' : 'ยืนยันการแจ้งโอน'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;