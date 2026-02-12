import React, { useState } from 'react';
import { Megaphone, CreditCard, Wrench, User, LogOut, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // เพิ่มการ import
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NewsModal from '../components/NewsModal';
import AddNewsModal from '../components/AddNewsModal';
import Pagination from '../components/Pagination';

const imageDefault = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000";

const Dashboard = () => {
  // ข้อมูลจำลอง (Mock Data)
  const [user] = useState({ firstName: "สมชาย", houseNo: "99/123", status: "Approved" });
  // 2. ประกาศ State ไว้ที่นี่ (ข้างในฟังก์ชัน Dashboard)
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [totalAmount] = useState(1200); // ยอดเงินตัวอย่าง

  const [selectedNews, setSelectedNews] = useState(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- ส่วน Pagination Logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // กำหนดว่า 1 หน้าจะโชว์กี่ประกาศ

  // ข้อมูลข่าวสาร (ในอนาคตดึงจาก Go API)
  const targetData = [
    {
      id: 1,
      title: "ประกาศฉีดพ่นยากำจัดยุงลาย",
      content: "นิติบุคคลจะดำเนินการฉีดพ่นยากำจัดยุงลายในวันเสาร์ที่ 10 นี้ เวลา 09.00 - 12.00 น. ขอให้ลูกบ้านปิดประตูหน้าต่างให้มิดชิด",
      date: "05 มิ.ย. 2024",
      category: "ความปลอดภัย",
      images: [
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1000",
      ]
    },
    {
      id: 2,
      title: "แจ้งปิดปรับปรุงสระว่ายน้ำ",
      content: "สระว่ายน้ำจะปิดให้บริการชั่วคราวเพื่อทำความสะอาดใหญ่และซ่อมแซมระบบกรองน้ำ ตั้งแต่วันที่ 15-17 มิ.ย. นี้",
      date: "03 มิ.ย. 2024",
      category: "พื้นที่ส่วนกลาง",
      images: [
        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1000"
      ]
    },
    {
      id: 3,
      title: "ประกาศฉีดพ่นยากำจัดยุงลาย",
      content: "นิติบุคคลจะดำเนินการฉีดพ่นยากำจัดยุงลายในวันเสาร์ที่ 10 นี้ เวลา 09.00 - 12.00 น. ขอให้ลูกบ้านปิดประตูหน้าต่างให้มิดชิด",
      date: "05 มิ.ย. 2024",
      category: "ความปลอดภัย",
      images: [
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000"
      ]
    },
    {
      id: 4,
      title: "แจ้งปิดปรับปรุงสระว่ายน้ำ",
      content: "สระว่ายน้ำจะปิดให้บริการชั่วคราวเพื่อทำความสะอาดใหญ่และซ่อมแซมระบบกรองน้ำ ตั้งแต่วันที่ 15-17 มิ.ย. นี้",
      date: "03 มิ.ย. 2024",
      category: "พื้นที่ส่วนกลาง",
      images: [
        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1000"
      ]
    },
    {
      id: 5,
      title: "ประกาศฉีดพ่นยากำจัดยุงลาย",
      content: "นิติบุคคลจะดำเนินการฉีดพ่นยากำจัดยุงลายในวันเสาร์ที่ 10 นี้ เวลา 09.00 - 12.00 น. ขอให้ลูกบ้านปิดประตูหน้าต่างให้มิดชิด",
      date: "05 มิ.ย. 2024",
      category: "ความปลอดภัย",
      images: [
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000"
      ]
    },
    {
      id: 6,
      title: "Test test",
      content: "สระว่ายน้ำจะปิดให้บริการชั่วคราวเพื่อทำความสะอาดใหญ่และซ่อมแซมระบบกรองน้ำ ตั้งแต่วันที่ 15-17 มิ.ย. นี้",
      date: "03 มิ.ย. 2024",
      category: "พื้นที่ส่วนกลาง",
      images: null
    }
  ];

  // 2. คำนวณ Pagination ข้อมูล
  const totalPages = Math.ceil(targetData.length / itemsPerPage);
  const currentItems = targetData
    .slice()
    .reverse() // เอาอันใหม่ขึ้นก่อน
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNewsClick = (news) => {
    setSelectedNews(news);
    setIsNewsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {/* 1. Sidebar (แถบด้านซ้าย) */}
      <Sidebar /> {/* เรียกใช้ Sidebar ที่แยกออกมา */}

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Header /> {/* เรียกใช้ Header ที่แยกออกมา */}

        {/* ส่วนประกาศข่าวสาร (ขยายเป็น 1 แถวต่อ 1 ประกาศ) */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center text-slate-800">
              <Megaphone className="mr-2 text-indigo-600" size={24} /> ประกาศล่าสุด
            </h2>
            <div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 flex items-center"
              >
                <Plus size={20} className="mr-2" /> เพิ่มประกาศใหม่
              </button>

              <AddNewsModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSave={(data) => {
                  // Logic สำหรับการบันทึกข้อมูลเข้า List
                  alert("เผยแพร่ประกาศเรียบร้อย!");
                }}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* เปลี่ยนจาก newsList.map เป็น currentItems.map */}
            {currentItems.map((news) => (
              <div key={news.id} onClick={() => { setSelectedNews(news); setIsNewsModalOpen(true); }} className="...">
               <div 
                  key={news.id}
                  onClick={() => handleNewsClick(news)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col sm:flex-row h-auto sm:h-44"
                >
                  {/* ส่วนรูปภาพ (ซ้าย) */}
                  <div className="w-full sm:w-64 h-48 sm:h-full overflow-hidden flex-shrink-0 bg-slate-100">
                    <img
                      src={news.images && news.images.length > 0 
                        ? (typeof news.images[0] === 'string' ? news.images[0] : news.images[0].url) 
                        : imageDefault // รูป Default
                      } 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                      alt="news" 
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000";
                      }}
                    />
                  </div>

                  {/* ส่วนเนื้อหา (ขวา) */}
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                          {news.category}
                        </span>
                        <span className="text-[11px] text-slate-400">{news.date}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition mb-2">
                        {news.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {news.content}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center text-xs font-bold text-indigo-600">
                      อ่านรายละเอียดเพิ่มเติม...
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Standard Pagination Style */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />

          {/* 3. เรียกใช้ Modal */}
          <NewsModal 
            isOpen={isNewsModalOpen} 
            onClose={() => setIsNewsModalOpen(false)} 
            news={selectedNews} 
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;