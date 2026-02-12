import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Save, Home, MessageCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header'; 

const Profile = () => {
  // ข้อมูลจำลอง (ในอนาคตจะดึงมาจาก API)
  const [profile, setProfile] = useState({
    firstName: 'สมชาย',
    lastName: 'สายลุย',
    username: 'somchai_99', // ห้ามแก้
    password: 'password1234',
    lineId: 'somchai_line',
    houseNo: '99/123'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
    // ตรงนี้ไว้ใส่ Logic ส่งค่าไป Backend Golang
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. ใส่ Sidebar ไว้ด้านซ้ายสุด */}
      <Sidebar />

      {/* 2. พื้นที่เนื้อหาหลักทางขวา */}
      <main className="flex-1 p-8">
        {/* 3. ใส่ Header ไว้ด้านบน */}
        <Header />

        {/* 4. ส่วนของ Form ข้อมูลส่วนตัว (เอาโค้ดเดิมมาวางตรงนี้) */}
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Header */}
                <div className="bg-indigo-700 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                    <User className="mr-2" /> ข้อมูลส่วนตัว
                </h2>
                {!isEditing && (
                    <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-lg text-sm transition"
                    >
                    แก้ไขข้อมูล
                    </button>
                )}
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-6">
                
                {/* Username (Disabled) */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username (ไม่สามารถแก้ไขได้)</label>
                    <p className="text-gray-600 font-mono">{profile.username}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง</label>
                    <input 
                        type="text"
                        disabled={!isEditing}
                        className="w-full border p-2 rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={profile.firstName}
                        onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    />
                    </div>
                    {/* Last Name */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                    <input 
                        type="text"
                        disabled={!isEditing}
                        className="w-full border p-2 rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={profile.lastName}
                        onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    />
                    </div>
                </div>

                {/* Password Section */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Lock size={14} className="mr-1"/> รหัสผ่าน
                    </label>
                    <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"}
                        disabled={!isEditing}
                        className="w-full border p-2 rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition pr-10"
                        value={profile.password}
                        onChange={(e) => setProfile({...profile, password: e.target.value})}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    </div>
                </div>

                {/* Line ID & House No */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <MessageCircle size={14} className="mr-1 text-green-500"/> Line ID
                    </label>
                    <input 
                        type="text"
                        disabled={!isEditing}
                        className="w-full border p-2 rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={profile.lineId}
                        onChange={(e) => setProfile({...profile, lineId: e.target.value})}
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Home size={14} className="mr-1 text-blue-500"/> บ้านเลขที่
                    </label>
                    <input 
                        type="text"
                        disabled={!isEditing}
                        className="w-full border p-2 rounded-lg disabled:bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={profile.houseNo}
                        onChange={(e) => setProfile({...profile, houseNo: e.target.value})}
                    />
                    </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                    <div className="flex space-x-3 pt-4">
                    <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 shadow-md transition font-medium flex items-center justify-center"
                    >
                        <Save size={18} className="mr-2"/> บันทึกข้อมูล
                    </button>
                    </div>
                )}
                </form>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;