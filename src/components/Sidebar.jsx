import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Megaphone, CreditCard, Wrench, User, Clock, FilePlus, File, ClipboardList, Users, Settings, X, BarChart3, Receipt, Landmark, UserSquare2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// เมนูถูกจัดเป็นหมวดตาม "งานที่ทำ" ไม่ใช่ตามสิทธิ์ เพราะแอดมินใช้ทั้งเมนูลูกบ้าน
// และเมนูงานหลังบ้านสลับกันไปมา — การกรองด้วย roles ทำทีหลังทั้งรายเมนูและรายหมวด
const MENU_GROUPS = [
  {
    label: 'บริการลูกบ้าน',
    items: [
      { icon: <Megaphone size={20} />, label: 'ประกาศข่าวสาร', path: '/dashboard', roles: ['admin', 'user'] },
      { icon: <Wrench size={20} />, label: 'แจ้งปัญหา/ซ่อมแซม', path: '/report', roles: ['admin', 'user'] },
      { icon: <ClipboardList size={20} />, label: 'ประวัติการแจ้งเรื่อง', path: '/report-history', roles: ['admin', 'user'] },
      { icon: <CreditCard size={20} />, label: 'ชำระค่าส่วนกลาง', path: '/payment', roles: ['admin', 'user'] },
    ],
  },
  {
    label: 'งานหมู่บ้าน',
    items: [
      { icon: <FilePlus size={20} />, label: 'รับปัญหา/แจ้งซ่อม', path: '/admin-report', roles: ['admin'] },
      { icon: <Users size={20} />, label: 'จัดการสมาชิก', path: '/admin-user-manage', roles: ['admin'] },
    ],
  },
  {
    label: 'รายรับ · ค่าส่วนกลาง',
    items: [
      { icon: <Clock size={20} />, label: 'สถานะค่าส่วนกลาง', path: '/admin-payment-tracking', roles: ['admin'] },
      { icon: <Settings size={20} />, label: 'ตั้งค่าค่าส่วนกลาง', path: '/admin-fee-config', roles: ['admin'] },
    ],
  },
  {
    label: 'รายจ่าย · ภาษี',
    items: [
      { icon: <Receipt size={20} />, label: 'รายการเบิกจ่าย', path: '/admin-disbursement', roles: ['admin'] },
      { icon: <UserSquare2 size={20} />, label: 'ทะเบียนผู้รับเงิน', path: '/admin-payee', roles: ['admin'] },
      { icon: <Landmark size={20} />, label: 'ภาษีหัก ณ ที่จ่าย', path: '/admin-tax-filing', roles: ['admin'] },
    ],
  },
  {
    label: 'รายงาน',
    items: [
      { icon: <File size={20} />, label: 'บัญชีหมู่บ้าน', path: '/admin-account-manage', roles: ['admin'] },
      { icon: <BarChart3 size={20} />, label: 'ภาพรวมการเงิน', path: '/admin-finance-overview', roles: ['admin'] },
    ],
  },
  {
    label: 'บัญชีของฉัน',
    items: [
      { icon: <User size={20} />, label: 'ข้อมูลส่วนตัว', path: '/profile', roles: ['admin', 'user'] },
    ],
  },
];

// หน้าย่อยที่ไม่มีเมนูของตัวเอง ให้ไฮไลต์เมนูต้นทางแทน เวลาผู้ใช้อยู่หน้านั้น
const RELATED_PATHS = {
  '/admin-disbursement': ['/admin-wht-certificate'],
  '/admin-payment-tracking': ['/admin-receipt', '/admin-invoice'],
};

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // เก็บเฉพาะหมวดที่ผู้ใช้ "กดเอง" — หมวดที่ยังไม่ถูกกดจะเปิด/ปิดตามหน้าปัจจุบัน
  // (คำนวณตอน render ไม่ต้องใช้ effect คอยซิงก์กับ route)
  //
  // Sidebar ถูก mount ใหม่ทุกครั้งที่เปลี่ยนหน้า (แต่ละ page render เอง) จึงเก็บ
  // สถานะที่กดไว้ใน localStorage ไม่งั้นหมวดที่กางไว้จะหุบทุกครั้งที่คลิกเมนู
  const [toggled, setToggled] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebarGroups') || '{}');
    } catch {
      return {};
    }
  });

  const isActive = (path) =>
    location.pathname === path ||
    (RELATED_PATHS[path] || []).some((prefix) => location.pathname.startsWith(prefix));

  const groups = MENU_GROUPS
    .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(user?.role)) }))
    .filter((group) => group.items.length > 0);

  const totalItems = groups.reduce((count, group) => count + group.items.length, 0);

  // ลูกบ้านมีเมนูไม่กี่อัน กางทิ้งไว้ทั้งหมดอ่านง่ายกว่า ส่วนแอดมินที่เมนูเยอะ
  // จะกางเฉพาะหมวดของหน้าที่อยู่ ที่เหลือหุบไว้
  const isGroupOpen = (group) =>
    toggled[group.label] ?? (totalItems <= 6 || group.items.some((item) => isActive(item.path)));

  const toggleGroup = (label) => {
    const group = groups.find((g) => g.label === label);
    const next = { ...toggled, [label]: !isGroupOpen(group) };
    setToggled(next);
    localStorage.setItem('sidebarGroups', JSON.stringify(next));
  };

  const goTo = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) onClose(); // ปิดเมนูอัตโนมัติเมื่อกดบนมือถือ
  };

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

        {/* รายการเมนู แบ่งเป็นหมวด ย่อ/ขยายได้ */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar">
          {groups.map((group) => {
            const opened = isGroupOpen(group);
            const hasActiveItem = group.items.some((item) => isActive(item.path));

            return (
              <div key={group.label} className="pb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span className={hasActiveItem && !opened ? 'text-indigo-400' : ''}>{group.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${opened ? '' : '-rotate-90'}`} />
                </button>

                {opened && (
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <div
                        key={item.path}
                        onClick={() => goTo(item.path)}
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                          isActive(item.path)
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className={`${isActive(item.path) ? 'text-white' : 'group-hover:text-indigo-400'} transition-colors`}>
                          {item.icon}
                        </span>
                        <span className="ml-3 font-medium text-sm">{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
