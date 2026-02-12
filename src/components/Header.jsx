import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  // ข้อมูลจำลอง (ในอนาคตจะดึงจาก Context หรือ Redux)
  const user = { firstName: "สมชาย", houseNo: "99/123" };

  return (
    <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="cursor-pointer hover:opacity-70 transition" onClick={() => navigate('/profile')}>
        <h1 className="text-xl font-bold text-gray-800">ยินดีต้อนรับคุณ, {user.firstName}</h1>
        <p className="text-gray-500 text-sm font-medium">บ้านเลขที่: {user.houseNo}</p>
      </div>
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-red-500 font-semibold hover:bg-red-50 px-4 py-2 rounded-lg transition"
      >
        <LogOut size={20} className="mr-2"/> ออกจากระบบ
      </button>
    </header>
  );
};

export default Header;