import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Logic สำหรับคำนวณว่าจะแสดงเลขหน้าไหนบ้าง
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5; // จำนวนปุ่มที่จะแสดง (ไม่รวมจุดไข่ปลา)

    if (totalPages <= showMax + 2) {
      // ถ้าหน้าทั้งหมดมีน้อย แสดงทุกหน้า
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // ถ้าหน้าเยอะ ให้ใช้ Logic จุดไข่ปลา
      if (currentPage <= 3) {
        // กรณีอยู่หน้าแรกๆ: [1, 2, 3, 4, '...', total]
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // กรณีอยู่หน้าท้ายๆ: [1, '...', total-3, total-2, total-1, total]
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // กรณีอยู่ตรงกลาง: [1, '...', current-1, current, current+1, '...', total]
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="p-5 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 rounded-b-3xl gap-4">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        หน้า {currentPage} จาก {totalPages}
      </p>
      
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)} 
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition shadow-sm"
        >
          <ChevronLeft size={16}/>
        </button>

        {/* Page Numbers with Ellipsis */}
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className="px-2 text-slate-400">
                <MoreHorizontal size={16} />
              </span>
            );
          }
          return (
            <button 
              key={page} 
              onClick={() => onPageChange(page)} 
              className={`w-9 h-9 rounded-xl text-xs font-bold transition shadow-sm ${
                currentPage === page 
                ? 'bg-slate-800 text-white border-slate-800' 
                : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-500 hover:text-indigo-500'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)} 
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition shadow-sm"
        >
          <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );
};

export default Pagination;