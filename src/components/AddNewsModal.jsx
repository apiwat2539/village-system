import React, { useState, useRef } from 'react';
import { X, Upload, Megaphone, Type, FileText, Tag, Save, Star, Image as ImageIcon } from 'lucide-react';

const AddNewsModal = ({ isOpen, onClose, onSave }) => {
  const [newsData, setNewsData] = useState({
    title: '',
    content: '',
    category: 'ประกาศทั่วไป',
    images: [] // เปลี่ยนเป็น Array เพื่อรองรับหลายไฟล์
  });
  
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    // อัปเดตไฟล์เข้าไปใน State
    setNewsData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...selectedFiles]
    }));

    // สร้าง Preview URLs
    const newPreviews = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setPreviews(prev => [...(prev || []), ...newPreviews]);
  };

  const removeFile = (index) => {
    const updatedImages = [...newsData.images];
    updatedImages.splice(index, 1);
    setNewsData({ ...newsData, images: updatedImages });

    URL.revokeObjectURL(previews[index].url);
    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ภาพแรก (index 0) จะถูกส่งไปในฐานะ coverImage โดยปริยาย
    onSave(newsData);
    onClose();
    // ล้างข้อมูลหลังบันทึก
    setNewsData({ title: '', content: '', category: 'ประกาศทั่วไป', images: [] });
    setPreviews([]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm font-kanit">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="bg-indigo-700 p-6 text-white flex justify-between items-center font-kanit">
          <div className="flex items-center space-x-2">
            <Megaphone size={24} />
            <h2 className="text-xl font-bold">สร้างประกาศข่าวสารใหม่</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* จัดการรูปภาพ (หน้าปก + รูปประกอบ) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between items-center">
              <span>รูปภาพประกอบประกาศ</span>
              <span className="text-[10px] text-indigo-500 font-normal">* ภาพแรกจะถูกใช้เป็นภาพหน้าปกอัตโนมัติ</span>
            </label>
            
            <input 
              type="file" 
              multiple 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            {/* ส่วนแสดงภาพหน้าปก (ภาพที่ 0) */}
            {previews.length > 0 ? (
              <div className="space-y-3">
                <div className="relative h-56 w-full rounded-2xl overflow-hidden border-2 border-indigo-500 group shadow-md">
                  <img src={previews[0].url} className="w-full h-full object-cover" alt="Cover" />
                  <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-full flex items-center shadow-lg font-bold">
                    <Star size={10} className="mr-1 fill-white" /> ภาพหน้าปก
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeFile(0)}
                    className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* ส่วนแสดงรูปอื่นๆ (Thumbnails) */}
                <div className="grid grid-cols-4 gap-2">
                  {previews.slice(1).map((file, index) => (
                    <div key={index + 1} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={file.url} className="w-full h-full object-cover" alt="Thumbnail" />
                      <button 
                        type="button"
                        onClick={() => removeFile(index + 1)}
                        className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-indigo-300 transition"
                  >
                    <Upload size={18} />
                    <span className="text-[9px] mt-1 font-bold">เพิ่มรูป</span>
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current.click()}
                className="h-40 w-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition group"
              >
                <Upload className="text-slate-300 group-hover:text-indigo-400 mb-2" size={32} />
                <p className="text-sm text-slate-400">คลิกเพื่อเลือกรูปภาพประกอบ (เลือกได้หลายรูป)</p>
              </div>
            )}
          </div>

          {/* หัวข้อข่าว */}
          <div>
            <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
              <Type size={16} className="mr-2 text-indigo-500" /> หัวข้อประกาศ
            </label>
            <input 
              required
              type="text"
              placeholder="แจ้งข่าวสารหรือหัวข้อกิจกรรม..."
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-kanit"
              value={newsData.title}
              onChange={(e) => setNewsData({...newsData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                <Tag size={16} className="mr-2 text-indigo-500" /> หมวดหมู่
              </label>
              <select 
                className="w-full border border-slate-200 p-3 rounded-xl outline-none bg-white focus:ring-2 focus:ring-indigo-500 transition text-sm font-kanit"
                value={newsData.category}
                onChange={(e) => setNewsData({...newsData, category: e.target.value})}
              >
                <option value="ประกาศทั่วไป">ประกาศทั่วไป</option>
                <option value="กิจกรรม">กิจกรรม</option>
                <option value="การแจ้งซ่อม">การแจ้งซ่อม</option>
                <option value="ความปลอดภัย">ความปลอดภัย</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">วันที่ประกาศ</label>
              <div className="p-3 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 text-sm italic">
                {new Date().toLocaleDateString('th-TH')}
              </div>
            </div>
          </div>

          {/* เนื้อหาข่าว */}
          <div>
            <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
              <FileText size={16} className="mr-2 text-indigo-500" /> เนื้อหาข่าว
            </label>
            <textarea 
              required
              rows="5"
              placeholder="กรอกรายละเอียดข่าวสารที่ต้องการแจ้งลูกบ้าน..."
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-kanit"
              value={newsData.content}
              onChange={(e) => setNewsData({...newsData, content: e.target.value})}
            ></textarea>
          </div>

          <div className="pt-4 flex space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center transition"
            >
              <Save size={18} className="mr-2" /> เผยแพร่ประกาศ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewsModal;