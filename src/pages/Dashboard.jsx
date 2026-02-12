import React, { useState } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NewsModal from '../components/NewsModal';
import AddNewsModal from '../components/AddNewsModal';
import Pagination from '../components/Pagination';

const imageDefault = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000";

const Dashboard = () => {
  // --- 1. States สำหรับ UI Control ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ควบคุม Sidebar มือถือ
  const [selectedNews, setSelectedNews] = useState(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // --- 2. Pagination Logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ข้อมูลข่าวสาร (Mock Data)
  const [targetData] = useState([
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
      images: ["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1000"]
    },
    {
        id: 3,
        title: "ซ่อมบำรุงลิฟต์อาคาร A",
        content: "เนื่องจากพบความผิดปกติของระบบประตูลิฟต์ ทางนิติฯ จึงขอปิดซ่อมบำรุงในวันที่ 12 ก.พ. นี้ เวลา 10:00 - 15:00 น.",
        date: "08 ก.พ. 2026",
        category: "การแจ้งซ่อม",
        images: null
    },
    {
        id: 4,
        title: "กิจกรรมทำบุญตักบาตรปีใหม่",
        content: "ขอเชิญลูกบ้านทุกท่านร่วมทำบุญตักบาตรอาหารแห้ง ณ วงเวียนหน้าหมู่บ้าน ในวันอาทิตย์ที่ 1 มีนาคมนี้",
        date: "01 ก.พ. 2026",
        category: "กิจกรรม",
        images: ["https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1000"]
    },
    {
        id: 5,
        title: "ยกระดับความปลอดภัยทางเข้า",
        content: "หมู่บ้านได้ติดตั้งระบบ Scan ทะเบียนรถยนต์เพิ่มเพื่อความสะดวกและรัดกุมในการคัดกรองบุคคลภายนอก",
        date: "28 ม.ค. 2026",
        category: "ความปลอดภัย",
        images: null
    }
  ]);

  // คำนวณ Pagination (เรียงลำดับใหม่ล่าสุดขึ้นก่อน)
  const sortedData = [...targetData].reverse();
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentItems = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNewsClick = (news) => {
    setSelectedNews(news);
    setIsNewsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-kanit">
      
      {/* 1. Sidebar - ส่ง Props เพื่อควบคุมเมนูบนมือถือ */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. Header - ส่ง Props เพื่อเปิดเมนูบนมือถือ */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* ส่วนหัวของ Section ประกาศ */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold flex items-center text-slate-800">
                <Megaphone className="mr-3 text-indigo-600" size={28} /> 
                ประกาศและข่าวสารภายในหมู่บ้าน
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-200 transition active:scale-95"
              >
                <Plus size={20} className="mr-2" /> สร้างประกาศ
              </button>
            </div>
            
            {/* รายการประกาศข่าวสาร */}
            <div className="flex flex-col gap-4">
              {currentItems.map((news) => (
                <div 
                  key={news.id}
                  onClick={() => handleNewsClick(news)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 cursor-pointer group flex flex-col md:flex-row h-auto md:h-48"
                >
                  {/* ส่วนรูปภาพ (ซ้าย/บน) */}
                  <div className="w-full md:w-64 h-48 md:h-full overflow-hidden flex-shrink-0 bg-slate-100">
                    <img
                      src={news.images && news.images.length > 0 
                        ? (typeof news.images[0] === 'string' ? news.images[0] : news.images[0].url) 
                        : imageDefault
                      } 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                      alt="news-thumbnail" 
                      onError={(e) => { e.target.src = imageDefault; }}
                    />
                  </div>

                  {/* ส่วนเนื้อหา (ขวา/ล่าง) */}
                  <div className="p-5 md:p-6 flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg">
                          {news.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{news.date}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition truncate mb-2">
                        {news.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {news.content}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                      อ่านรายละเอียดทั้งหมด →
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Component */}
            <div className="pt-4">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* --- Modals Section --- */}
      <AddNewsModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={(data) => {
          console.log("Saving news:", data);
          setIsAddModalOpen(false);
        }}
      />

      <NewsModal 
        isOpen={isNewsModalOpen} 
        onClose={() => setIsNewsModalOpen(false)} 
        news={selectedNews} 
      />
    </div>
  );
};

export default Dashboard;