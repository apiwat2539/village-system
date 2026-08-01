import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PayeeModal from '../components/PayeeModal';
import { Users, Plus, Loader2, Pencil } from 'lucide-react';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import Swal from 'sweetalert2';

const AdminPayee = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [payees, setPayees] = useState([]);
  const [modalPayee, setModalPayee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPayees = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(ENDPOINTS.PAYEES.GET_ALL);
      setPayees(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error('Fetch payees error:', err);
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถดึงข้อมูลผู้รับเงินได้', icon: 'error', confirmButtonText: 'ตกลง' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayees();
  }, []);

  const openCreate = () => {
    setModalPayee(null);
    setIsModalOpen(true);
  };

  const openEdit = (payee) => {
    setModalPayee(payee);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-kanit">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center">
                  <Users className="mr-3 text-indigo-600" size={28} /> ทะเบียนผู้รับเงิน
                </h2>
                <p className="text-sm text-slate-500">
                  ข้อมูลชุดนี้ถูกใช้พิมพ์ลงหนังสือรับรองหัก ณ ที่จ่าย (50 ทวิ) และไฟล์ใบแนบ ภ.ง.ด.3/53
                </p>
              </div>
              <button onClick={openCreate}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-700">
                <Plus size={18} /> เพิ่มผู้รับเงิน
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="animate-spin mb-4" size={40} />
                  <p>กำลังโหลดข้อมูล...</p>
                </div>
              ) : payees.length === 0 ? (
                <p className="text-center text-slate-400 py-16">ยังไม่มีผู้รับเงินในทะเบียน</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="text-left py-3 px-4">ชื่อผู้รับเงิน</th>
                        <th className="text-left py-3 px-4">ประเภท</th>
                        <th className="text-left py-3 px-4">เลขผู้เสียภาษี</th>
                        <th className="text-left py-3 px-4">แบบที่ยื่น</th>
                        <th className="text-center py-3 px-4">สถานะ</th>
                        <th className="text-right py-3 px-4">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payees.map((payee) => (
                        <tr key={payee.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-700">{payee.displayName}</p>
                            <p className="text-xs text-slate-400 truncate max-w-xs">{payee.address}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{payee.typeLabel}</td>
                          <td className="py-3 px-4 text-slate-600">
                            {payee.taxId}
                            {payee.branchNo && payee.branchNo !== '00000' && (
                              <span className="text-xs text-slate-400"> (สาขา {payee.branchNo})</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{payee.taxFormLabel}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${payee.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {payee.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button onClick={() => openEdit(payee)}
                              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                              <Pencil size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <PayeeModal
          onClose={() => setIsModalOpen(false)}
          onSaved={fetchPayees}
          payee={modalPayee}
        />
      )}
    </div>
  );
};

export default AdminPayee;
