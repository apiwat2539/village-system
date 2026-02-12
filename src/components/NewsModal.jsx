import React from 'react';
import { X, Calendar, User, Tag, ImageIcon } from 'lucide-react';

const NewsModal = ({ isOpen, onClose, news }) => {
  if (!isOpen || !news) return null;

  const imageList = Array.isArray(news.images) ? news.images : (news.image ? [news.image] : []);
  const coverImage = imageList.length > 0 
    ? (typeof imageList[0] === 'string' ? imageList[0] : imageList[0].url)
    : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000";
  const galleryImages = imageList.slice(1);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm font-kanit">
      {/* ปรับ max-h-full และ flex-col เพื่อคุมพื้นที่ */}
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        {/* 1. Header & Cover (Fixed ส่วนบน) */}
        <div className="relative h-48 md:h-64 w-full flex-shrink-0">
          <img 
            src={coverImage} 
            className="w-full h-full object-cover"
            alt="news-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 backdrop-blur-md transition shadow-lg z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Content (ส่วนที่ Scroll ได้) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-[10px] md:text-xs text-slate-400 mb-4">
            <div className="flex items-center bg-slate-100 px-2.5 py-1 rounded-full">
              <Calendar size={12} className="mr-1 text-indigo-500" />
              {news.date || "7 ก.พ. 2569"}
            </div>
            <div className="flex items-center bg-indigo-50 px-2.5 py-1 rounded-full font-bold text-indigo-600 uppercase">
              <Tag size={12} className="mr-1" />
              {news.category || "ประกาศ"}
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 leading-tight">
            {news.title}
          </h2>

          <div className="text-slate-600 leading-relaxed text-sm md:text-base space-y-4">
            <p className="whitespace-pre-line">{news.content}</p>
            
            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div className="pt-4">
                <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase flex items-center tracking-wider">
                  <ImageIcon size={14} className="mr-2"/> ภาพประกอบเพิ่มเติม
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {galleryImages.map((img, index) => (
                    <div 
                      key={index} 
                      className="aspect-video rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-zoom-in group"
                      onClick={() => window.open(typeof img === 'string' ? img : img.url, '_blank')}
                    >
                      <img 
                        src={typeof img === 'string' ? img : img.url} 
                        alt="gallery"
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-[11px] text-slate-400 pt-6 border-t border-slate-50 italic">
              จึงเรียนมาเพื่อโปรดทราบ นิติบุคคลหมู่บ้านจัดสรร
            </p>
          </div>
        </div>

        {/* 3. Footer (Fixed ส่วนล่าง - ไม่หลุดจอแน่นอน) */}
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 hover:text-indigo-600 transition shadow-sm active:scale-95"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;