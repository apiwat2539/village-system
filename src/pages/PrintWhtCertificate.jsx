import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, Loader2, ArrowLeft } from 'lucide-react';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import WhtCertificateDocument from '../components/documents/WhtCertificateDocument';

const PrintWhtCertificate = () => {
  const { disbursementId } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const hasAutoPrinted = useRef(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(ENDPOINTS.DISBURSEMENTS.WHT_CERTIFICATE(disbursementId));
        setData(res.data.data);
      } catch (err) {
        console.error('Get wht certificate error:', err);
        setError(err.response?.data?.message || 'ไม่สามารถออกหนังสือรับรองการหักภาษี ณ ที่จ่ายได้');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificate();
  }, [disbursementId]);

  useEffect(() => {
    if (data && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true;
      setTimeout(() => window.print(), 300);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center font-kanit p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/admin-disbursement" className="text-indigo-600 underline">กลับหน้ารายการเบิกจ่าย</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 py-6">
      <div className="no-print max-w-3xl mx-auto mb-4 px-4 flex justify-between items-center font-kanit">
        <Link to="/admin-disbursement" className="flex items-center gap-1 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={18} /> กลับ
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Printer size={18} /> พิมพ์หนังสือรับรอง 50 ทวิ
        </button>
      </div>
      <WhtCertificateDocument data={data} />
    </div>
  );
};

export default PrintWhtCertificate;
