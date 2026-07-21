import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MonthlyTrendChart from '../components/finance/MonthlyTrendChart';
import CategoryBarList from '../components/finance/CategoryBarList';
import { Wallet, TrendingUp, TrendingDown, Scale, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import Swal from 'sweetalert2';

const RANGE_LABEL = { month: 'เดือนนี้', year: 'ปีนี้', all: 'ทั้งหมด' };

const formatBaht = (n) => Math.round(n || 0).toLocaleString('th-TH');

const AdminFinanceOverview = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [range, setRange] = useState('month');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async (r) => {
    setIsLoading(true);
    try {
      const res = await api.get(ENDPOINTS.TRANSACTIONS.OVERVIEW(r));
      setData(res.data.data);
    } catch (err) {
      console.error('Fetch finance overview error:', err);
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถดึงข้อมูลภาพรวมการเงินได้', icon: 'error', confirmButtonText: 'ตกลง' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(range);
  }, [range]);

  const net = data?.rangeNet ?? 0;

  return (
    <div className="flex min-h-screen bg-gray-50 font-kanit">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800">ภาพรวมการเงิน</h2>
              <p className="text-sm text-slate-500">สรุปรายรับ-รายจ่ายของหมู่บ้าน</p>
            </div>

            {isLoading && !data ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <>
                {/* เงินกองกลางคงเหลือ */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 shadow-lg text-white">
                  <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">
                    <Wallet size={16} /> เงินกองกลางคงเหลือ (สะสมทั้งหมด)
                  </div>
                  <h3 className="text-4xl font-black">฿{formatBaht(data.fundsOnHand)}</h3>
                </div>

                {/* ปุ่มสลับช่วงเวลา */}
                <div className="flex p-1 bg-white rounded-2xl border border-slate-200 w-fit shadow-sm">
                  {Object.entries(RANGE_LABEL).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setRange(key)}
                      className={`px-5 py-2 rounded-xl font-bold text-sm transition ${
                        range === key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* การ์ดสรุปตามช่วงที่เลือก */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-green-600 text-xs font-bold uppercase tracking-widest mb-2">
                      <TrendingUp size={16} /> รายรับ ({RANGE_LABEL[range]})
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">฿{formatBaht(data.totalIncome)}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest mb-2">
                      <TrendingDown size={16} /> รายจ่าย ({RANGE_LABEL[range]})
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">฿{formatBaht(data.totalExpense)}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 ${net >= 0 ? 'text-indigo-500' : 'text-red-500'}`}>
                      <Scale size={16} /> สุทธิ ({RANGE_LABEL[range]})
                    </div>
                    <h3 className={`text-2xl font-black ${net >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                      {net >= 0 ? '+' : '-'}฿{formatBaht(Math.abs(net))}
                    </h3>
                  </div>
                </div>

                {/* แถบเตือนรายการรออนุมัติ */}
                {data.pendingCount > 0 && (
                  <div
                    onClick={() => navigate('/admin-payment-tracking')}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition"
                  >
                    <div className="flex items-center gap-3 text-amber-700">
                      <AlertCircle size={20} />
                      <p className="text-sm font-bold">
                        มีรายการชำระเงินรออนุมัติ {data.pendingCount} รายการ (฿{formatBaht(data.pendingAmount)}) — ยังไม่นับเป็นรายรับ
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-amber-400" />
                  </div>
                )}

                {/* กราฟแนวโน้มรายเดือน */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-slate-700 mb-4">แนวโน้มรายรับ-รายจ่าย (6 เดือนล่าสุด)</h4>
                  <MonthlyTrendChart data={data.monthlyTrend} />
                </div>

                {/* สัดส่วนตามหมวดหมู่ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CategoryBarList title={`รายรับแยกหมวด (${RANGE_LABEL[range]})`} data={data.incomeByCategory} />
                  <CategoryBarList title={`รายจ่ายแยกหมวด (${RANGE_LABEL[range]})`} data={data.expenseByCategory} />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminFinanceOverview;
