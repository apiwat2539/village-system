import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Settings, Plus, Home, Loader2, Save } from 'lucide-react';
import api from '../api/axiosConfig';
import { ENDPOINTS, HOUSE_TYPES } from '../api/endpoints';
import Swal from 'sweetalert2';

const thisMonth = () => new Date().toISOString().slice(0, 7); // "YYYY-MM"

const AdminFeeConfig = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [rates, setRates] = useState([]);
  const [houses, setHouses] = useState([]);

  // ฟอร์มเพิ่มเรตใหม่
  const [rateForm, setRateForm] = useState({ houseType: HOUSE_TYPES[0], amount: '', effectiveFrom: thisMonth() });

  // ค่าที่ admin แก้ค้างไว้ต่อบ้าน { [houseNo]: { houseType, startMonth } }
  const [houseEdits, setHouseEdits] = useState({});

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [ratesRes, housesRes] = await Promise.all([
        api.get(ENDPOINTS.FEE_CONFIG.GET_RATES),
        api.get(ENDPOINTS.FEE_CONFIG.GET_HOUSES),
      ]);
      setRates(Array.isArray(ratesRes.data.data) ? ratesRes.data.data : []);
      const houseData = Array.isArray(housesRes.data.data) ? housesRes.data.data : [];
      setHouses(houseData);
      // seed edits ด้วยค่าปัจจุบัน
      const seed = {};
      houseData.forEach((h) => {
        seed[h.houseNo] = {
          houseType: h.houseType || HOUSE_TYPES[0],
          startMonth: h.startMonth ? h.startMonth.slice(0, 7) : thisMonth(),
        };
      });
      setHouseEdits(seed);
    } catch (err) {
      console.error("Fetch fee config error:", err);
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถดึงข้อมูลตั้งค่าค่าส่วนกลางได้', icon: 'error', confirmButtonText: 'ตกลง' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAddRate = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'กำลังบันทึกเรต...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await api.post(ENDPOINTS.FEE_CONFIG.CREATE_RATE, {
        houseType: rateForm.houseType,
        amount: parseFloat(rateForm.amount),
        effectiveFrom: rateForm.effectiveFrom,
      });
      await Swal.fire({ title: 'สำเร็จ', text: 'เพิ่มเรตค่าส่วนกลางเรียบร้อยแล้ว', icon: 'success', confirmButtonText: 'ตกลง' });
      setRateForm({ houseType: HOUSE_TYPES[0], amount: '', effectiveFrom: thisMonth() });
      fetchAll();
    } catch (err) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message || 'ไม่สามารถบันทึกเรตได้', icon: 'error', confirmButtonText: 'ตกลง' });
    }
  };

  const handleSaveHouse = async (houseNo) => {
    const edit = houseEdits[houseNo];
    Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await api.put(ENDPOINTS.FEE_CONFIG.SET_HOUSE, {
        houseNo,
        houseType: edit.houseType,
        startMonth: edit.startMonth,
      });
      await Swal.fire({ title: 'สำเร็จ', text: `ตั้งค่าบ้าน ${houseNo} เรียบร้อยแล้ว`, icon: 'success', confirmButtonText: 'ตกลง' });
      fetchAll();
    } catch (err) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message || 'ไม่สามารถบันทึกได้', icon: 'error', confirmButtonText: 'ตกลง' });
    }
  };

  const setEdit = (houseNo, patch) => {
    setHouseEdits((prev) => ({ ...prev, [houseNo]: { ...prev[houseNo], ...patch } }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-kanit">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center">
              <Settings className="mr-3 text-indigo-600" size={28} /> ตั้งค่าค่าส่วนกลาง
            </h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <>
                {/* ส่วนที่ 1: เรตค่าส่วนกลาง */}
                <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-700 mb-4">อัตราค่าส่วนกลาง (ต่อเดือน)</h3>

                  <form onSubmit={handleAddRate} className="flex flex-wrap gap-3 items-end mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">ประเภทบ้าน</label>
                      <select className="w-full text-sm border border-slate-200 p-2 rounded-lg outline-none bg-white"
                        value={rateForm.houseType} onChange={(e) => setRateForm({ ...rateForm, houseType: e.target.value })}>
                        {HOUSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">จำนวนเงิน (บาท)</label>
                      <input required type="number" min="1" className="w-full text-sm border border-slate-200 p-2 rounded-lg outline-none"
                        value={rateForm.amount} onChange={(e) => setRateForm({ ...rateForm, amount: e.target.value })} />
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">มีผลตั้งแต่เดือน</label>
                      <input required type="month" className="w-full text-sm border border-slate-200 p-2 rounded-lg outline-none"
                        value={rateForm.effectiveFrom} onChange={(e) => setRateForm({ ...rateForm, effectiveFrom: e.target.value })} />
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center">
                      <Plus size={16} className="mr-1" /> เพิ่มเรต
                    </button>
                  </form>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[10px] font-bold text-slate-400 uppercase border-b">
                        <tr>
                          <th className="p-3">ประเภทบ้าน</th>
                          <th className="p-3 text-right">จำนวนเงิน/เดือน</th>
                          <th className="p-3">มีผลตั้งแต่</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {rates.map((r) => (
                          <tr key={r.id}>
                            <td className="p-3 font-medium text-slate-700">{r.houseType}</td>
                            <td className="p-3 text-right font-bold text-slate-800">฿{r.amount.toLocaleString()}</td>
                            <td className="p-3 text-slate-500">{r.effectiveFrom?.slice(0, 7)}</td>
                          </tr>
                        ))}
                        {rates.length === 0 && (
                          <tr><td colSpan="3" className="p-8 text-center text-slate-400 italic">ยังไม่มีการตั้งเรต</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* ส่วนที่ 2: ตั้งค่ารายบ้าน */}
                <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center"><Home size={18} className="mr-2 text-indigo-500" /> ตั้งค่าการเก็บเงินรายบ้าน</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[10px] font-bold text-slate-400 uppercase border-b">
                        <tr>
                          <th className="p-3">บ้านเลขที่ / ชื่อ</th>
                          <th className="p-3">ประเภทบ้าน</th>
                          <th className="p-3">เริ่มเก็บเดือน</th>
                          <th className="p-3 text-right">เครดิตคงเหลือ</th>
                          <th className="p-3 text-center">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {houses.map((h) => (
                          <tr key={h.houseNo} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{h.houseNo}</div>
                              <div className="text-xs text-slate-400">{h.name}</div>
                            </td>
                            <td className="p-3">
                              <select className="text-sm border border-slate-200 p-1.5 rounded-lg outline-none bg-white"
                                value={houseEdits[h.houseNo]?.houseType || HOUSE_TYPES[0]}
                                onChange={(e) => setEdit(h.houseNo, { houseType: e.target.value })}>
                                {HOUSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </td>
                            <td className="p-3">
                              <input type="month" className="text-sm border border-slate-200 p-1.5 rounded-lg outline-none"
                                value={houseEdits[h.houseNo]?.startMonth || thisMonth()}
                                onChange={(e) => setEdit(h.houseNo, { startMonth: e.target.value })} />
                            </td>
                            <td className="p-3 text-right text-slate-500">
                              {h.houseType ? `฿${(h.creditBalance || 0).toLocaleString()}` : <span className="text-amber-500 text-xs">ยังไม่ตั้งค่า</span>}
                            </td>
                            <td className="p-3 text-center">
                              <button onClick={() => handleSaveHouse(h.houseNo)}
                                className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition inline-flex items-center">
                                <Save size={14} className="mr-1" /> บันทึก
                              </button>
                            </td>
                          </tr>
                        ))}
                        {houses.length === 0 && (
                          <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">ยังไม่มีสมาชิกในระบบ</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminFeeConfig;
