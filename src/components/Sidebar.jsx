import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Megaphone, CreditCard, Wrench, User, Clock, FilePlusCorner, File, ClipboardList, Users } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ใช้เช็คว่าตอนนี้อยู่หน้าไหนเพื่อทำแถบสีไฮไลท์

  const menuItems = [
    { icon: <Megaphone size={20}/>, label: "ประกาศข่าวสาร", path: "/dashboard" },
    { icon: <Wrench size={20}/>, label: "แจ้งปัญหา/ซ่อมแซม", path: "/report" },
    { icon: <ClipboardList size={20}/>, label: "ประวัติการแจ้งเรื่อง", path: "/report-history" },
    { icon: <FilePlusCorner size={20}/>, label: "รับปัญหา/แจ้งซ่อม", path: "/admin-report" },
    { icon: <CreditCard size={20}/>, label: "ชำระค่าส่วนกลาง", path: "/payment" },
    { icon: <Clock size={20}/>, label: "สถานะค่าส่วนกลาง", path: "/admin-payment-tracking" },
    { icon: <File size={20}/>, label: "บัญชีหมู่บ้าน", path: "/admin-account-manage" },
    { icon: <Users size={20}/>, label: "จัดการสมาชิก", path: "/admin-user-manage" },
    { icon: <User size={20}/>, label: "ข้อมูลส่วนตัว", path: "/profile" },
  ];

  return (
    <aside className="w-64 bg-indigo-700 text-white hidden md:block min-h-screen">
      <div className="p-6 text-2xl font-bold border-b border-indigo-500 cursor-pointer" onClick={() => navigate('/dashboard')}>
        VillageConnect
      </div>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <div 
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition ${
              location.pathname === item.path ? 'bg-indigo-800 shadow-inner' : 'hover:bg-indigo-600'
            }`}
          >
            {item.icon} <span className="ml-3 font-medium">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;