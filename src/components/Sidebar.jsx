import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Megaphone, CreditCard, Wrench, User, Clock, FilePlus, File, ClipboardList, Users, X } from 'lucide-react';

// ✅ 1. ต้องรับ { isOpen, onClose } เข้ามาเป็น Props
const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <Megaphone size={20}/>, label: "ประกาศข่าวสาร", path: "/dashboard" },
    { icon: <Wrench size={20}/>, label: "แจ้งปัญหา/ซ่อมแซม", path: "/report" },
    { icon: <ClipboardList size={20}/>, label: "ประวัติการแจ้งเรื่อง", path: "/report-history" },
    { icon: <FilePlus size={20}/>, label: "รับปัญหา/แจ้งซ่อม", path: "/admin-report" },
    { icon: <CreditCard size={20}/>, label: "ชำระค่าส่วนกลาง", path: "/payment" },
    { icon: <Clock size={20}/>, label: "สถานะค่าส่วนกลาง", path: "/admin-payment-tracking" },
    { icon: <File size={20}/>, label: "บัญชีหมู่บ้าน", path: "/admin-account-manage" },
    { icon: <Users size={20}/>, label: "จัดการสมาชิก", path: "/admin-user-manage" },
    { icon: <User size={20}/>, label: "ข้อมูลส่วนตัว", path: "/profile" },
  ];

  return (
    <>
      {/* 1. Backdrop สำหรับมือถือ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
          onClick={onClose}
        ></div>
      )}
    
      {/* 2. Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white z-[110]
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
      `}>
        {/* Header ของ Sidebar / ปุ่มปิด */}
        <div className="flex items-center justify-between p-6 bg-slate-800/50">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">M</div>
             <span className="font-bold text-lg tracking-wide">VillageConnect</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-slate-700 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* รายการเมนู */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar">
          {menuItems.map((item) => (
            <div 
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth < 1024) onClose(); // ปิดเมนูอัตโนมัติเมื่อกดบนมือถือ
              }}
              className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                location.pathname === item.path 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`${location.pathname === item.path ? 'text-white' : 'group-hover:text-indigo-400'} transition-colors`}>
                {item.icon}
              </span>
              <span className="ml-3 font-medium text-sm">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;