import React from 'react';
import { ORG_INFO } from '../../config/orgInfo';

const paymentMethodLabel = {
  slip: 'โอนเงิน (แนบสลิป)',
  cash: 'เงินสด',
  transfer: 'โอนเงิน',
};

const ReceiptDocument = ({ data }) => {
  if (!data) return null;

  return (
    <div className="print-area bg-white text-slate-800 p-10 max-w-3xl mx-auto font-kanit text-sm">
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">{ORG_INFO.name}</h1>
          <p className="text-slate-500 whitespace-pre-line">{ORG_INFO.address}</p>
          {ORG_INFO.taxId && <p className="text-slate-500">เลขประจำตัวผู้เสียภาษี: {ORG_INFO.taxId}</p>}
          {ORG_INFO.phone && <p className="text-slate-500">โทร: {ORG_INFO.phone}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-emerald-700">ใบเสร็จรับเงิน</h2>
          <p className="text-slate-500">Receipt</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="font-bold mb-1">ได้รับเงินจาก</p>
          <p>บ้านเลขที่ {data.houseNo}</p>
          {data.ownerName && <p>{data.ownerName}</p>}
        </div>
        <div className="text-right">
          <p><span className="text-slate-500">เลขที่ใบเสร็จ:</span> <span className="font-bold">{data.receiptNo}</span></p>
          <p><span className="text-slate-500">วันที่รับชำระ:</span> {data.receiptedAt}</p>
          <p><span className="text-slate-500">วิธีชำระ:</span> {paymentMethodLabel[data.paymentMethod] || data.paymentMethod}</p>
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-slate-100 border-y border-slate-300">
            <th className="text-left py-2 px-3">รายการ</th>
            <th className="text-right py-2 px-3">จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {(data.items || []).map((item, idx) => (
            <tr key={idx} className="border-b border-slate-200">
              <td className="py-2 px-3">
                {item.isCredit
                  ? 'ยอดเกินสะสมเป็นเครดิต'
                  : `ค่าส่วนกลาง งวด ${item.billingMonth ? item.billingMonth.slice(0, 7) : '-'}`}
              </td>
              <td className="py-2 px-3 text-right">{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-10">
        <div className="w-64">
          <div className="flex justify-between py-2 border-t-2 border-slate-800 font-bold text-base">
            <span>รวมรับชำระ</span>
            <span>{data.totalReceived.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-16 text-center">
        <div>
          <div className="border-t border-slate-400 pt-2 mx-8">ผู้รับเงิน</div>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-2 mx-8">ผู้ชำระเงิน</div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDocument;
