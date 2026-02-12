import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, UserCircle } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  // ข้อมูลจำลอง
  const user = { firstName: "สมชาย", houseNo: "99/123" };

  return (
    <header className="sticky top-0 z-[90] flex justify-between items-center mb-6 bg-white/80 backdrop-blur-md p-4 md:px-8 shadow-sm border-b border-gray-100 flex-shrink-0">
      
      {/* ฝั่งซ้าย: เมนู (มือถือ) + ข้อมูลผู้ใช้ */}
      <div className="flex items-center min-w-0"> {/* min-w-0 ช่วยให้ truncate ทำงาน */}
        <button 
          onClick={onMenuClick}
          className="p-2 mr-3 bg-slate-50 text-slate-600 rounded-xl lg:hidden hover:bg-slate-100 transition active:scale-95"
          aria-label="Open Menu"
        >
          <Menu size={22} />
        </button>
        
        <div 
          className="flex items-center cursor-pointer group min-w-0" 
          onClick={() => navigate('/profile')}
        >
          <div className="hidden sm:flex w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full items-center justify-center mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <UserCircle size={24} />
          </div>
          <div className="truncate">
            <h1 className="text-sm md:text-base font-bold text-gray-800 truncate">
              สวัสดี, {user.firstName}
            </h1>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium">
              บ้านเลขที่: {user.houseNo}
            </p>
          </div>
        </div>
      </div>

      {/* ฝั่งขวา: ปุ่มออกจากระบบ */}
      <button 
        onClick={() => {
          // เพิ่มการยืนยันก่อนออก หรือล้างค่า Token ในอนาคต
          if(window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
            navigate('/');
          }
        }} 
        className="flex items-center text-slate-400 font-bold hover:text-red-500 px-3 py-2 rounded-xl transition-colors text-sm whitespace-nowrap"
      >
        <span className="hidden sm:inline mr-2">ออกจากระบบ</span>
        <LogOut size={18}/>
      </button>
    </header>
  );
};

export default Header;