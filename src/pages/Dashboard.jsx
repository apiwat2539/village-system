import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Loader2 } from 'lucide-react'; // เพิ่ม Loader2
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NewsModal from '../components/NewsModal';
import AddNewsModal from '../components/AddNewsModal';
import Pagination from '../components/Pagination';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

const imageDefault = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000";

// Backend ส่ง date มาเป็น string "YYYY-MM-DD HH:MM:SS" (ไม่ใช่ created_at) แปลงเป็นวันที่ไทยให้อ่านง่าย
const formatNewsDate = (dateStr) => {
  if (!dateStr) return '';
  const parsed = new Date(dateStr.replace(' ', 'T'));
  return isNaN(parsed) ? dateStr : parsed.toLocaleDateString('th-TH');
};

const Dashboard = () => {
  // --- 1. States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // เปลี่ยนจาก Mock Data เป็น Empty Array
  const [targetData, setTargetData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 2. Pagination Logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ดึงข้อมูลจาก API
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      // เรียกใช้ API ผ่าน Axios Config ที่เราทำไว้ (แนบ Token อัตโนมัติ)
      const response = await api.get(ENDPOINTS.ANNOUNCEMENTS.GET_ALL); // ตรวจสอบชื่อใน endpoints.js ให้ตรงกัน

      // ตรวจสอบว่า response.data เป็น Array หรือไม่
      const announcementsData = Array.isArray(response.data.data) ? response.data.data : [];
      setTargetData(announcementsData);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // คำนวณ Pagination (เรียงลำดับใหม่ล่าสุดขึ้นก่อน - id เป็น UUID เรียงตัวเลขไม่ได้ จึงเรียงตาม date แทน)
  const sortedData = [...targetData].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentItems = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNewsClick = (news) => {
    setSelectedNews(news);
    setIsNewsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-kanit">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

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

            {/* ส่วนการแสดงผลรายการข่าว */}
            {isLoading ? (
              // Loading State
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p>กำลังโหลดข้อมูลประกาศ...</p>
              </div>
            ) : currentItems.length > 0 ? (
              <div className="flex flex-col gap-4">
                {currentItems.map((news) => (
                  <div
                    key={news.id}
                    onClick={() => handleNewsClick(news)}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 cursor-pointer group flex flex-col md:flex-row h-auto md:h-48"
                  >
                    <div className="w-full md:w-64 h-48 md:h-full overflow-hidden flex-shrink-0 bg-slate-100">
                      <img
                        src={
                          news.image_url || // ถ้า API ส่งมาเป็นฟิลด์เดียว
                          (news.images && news.images.length > 0
                            ? (typeof news.images[0] === 'string' ? news.images[0] : news.images[0].url)
                            : imageDefault)
                        }
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                        alt="news-thumbnail"
                        onError={(e) => { e.target.src = imageDefault; }}
                      />
                    </div>

                    <div className="p-5 md:p-6 flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg">
                            {news.category || "ทั่วไป"}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {formatNewsDate(news.date)}
                          </span>
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
            ) : (
              // Empty State
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                <p className="text-slate-400">ยังไม่มีประกาศใหม่ในขณะนี้</p>
              </div>
            )}

            {totalPages > 1 && (
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
            )}
          </div>
        </main>
      </div>

      <AddNewsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={() => {
          setIsAddModalOpen(false);
          fetchNews(); // โหลดข้อมูลใหม่หลังจากเซฟ
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