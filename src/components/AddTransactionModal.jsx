import React, { useState, useRef } from 'react';
import { X, Save, PlusCircle, MinusCircle, DollarSign, Upload, FileText } from 'lucide-react';

const AddTransactionModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'ซ่อมแซม/บำรุงรักษา',
    files: []
  });
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setFormData(prev => ({
      ...prev,
      // ใช้เครื่องหมาย || [] เพื่อป้องกันกรณี prev.files เป็น null/undefined
      files: [...(prev.files || []), ...selectedFiles] 
    }));

    const newPreviews = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setPreviews(prev => [...(prev || []), ...newPreviews]);
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      id: `TXN-${Date.now()}`,
      attachments: previews // ส่งรายการ Preview ไปแสดงในตาราง
    });
    // Reset
    setFormData({ title: '', type: 'expense', amount: '', date: new Date().toISOString().split('T')[0], category: 'ซ่อมแซม/บำรุงรักษา', files: [] });
    setPreviews([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[130] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DollarSign size={20} />
            <h3 className="font-bold">เพิ่มรายการทางบัญชี</h3>
          </div>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* ส่วนเลือกประเภท (Income/Expense) เหมือนเดิม */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${formData.type === 'income' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-500'}`}>รายรับ</button>
            <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${formData.type === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500'}`}>รายจ่าย</button>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">หัวข้อรายการ</label>
            <input required type="text" className="w-full border border-slate-200 p-2.5 rounded-xl outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">จำนวนเงิน (บาท)</label>
              <input required type="number" className="w-full border border-slate-200 p-2.5 rounded-xl outline-none" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">วันที่</label>
              <input required type="date" className="w-full border border-slate-200 p-2.5 rounded-xl outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          {/* เพิ่มส่วนอัปโหลดไฟล์/ใบเสร็จ */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">แนบไฟล์/ใบเสร็จ (หลายไฟล์)</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*,.pdf" 
              multiple // เพิ่มคุณสมบัติเลือกได้หลายไฟล์
              className="hidden" 
            />
            
            <div 
              onClick={() => fileInputRef.current.click()} 
              className="h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition mb-4"
            >
              <Upload size={24} className="text-slate-300 mb-1" />
              <p className="text-[10px] text-slate-400">คลิกเพื่ออัปโหลดรูปภาพหรือ PDF</p>
            </div>

            {/* ส่วนแสดงรายการไฟล์ที่เลือก */}
            <div className="grid grid-cols-3 gap-2">
              {previews.map((file, index) => (
                <div key={index} className="relative group h-20 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  <img src={file.url} className="w-full h-full object-cover" alt="preview" />
                  <button 
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={10}/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition flex items-center justify-center shadow-lg shadow-slate-200">
            <Save size={18} className="mr-2" /> บันทึกรายการ
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;