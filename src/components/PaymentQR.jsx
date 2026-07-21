import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, CheckCircle2, Landmark } from 'lucide-react';
import { PAYMENT_CONFIG } from '../config/paymentConfig';
import { generatePromptPayPayload } from '../utils/promptpay';

const CopyableField = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <span className="text-base font-mono font-bold text-slate-800">{value}</span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="text-slate-400 p-1.5 hover:bg-white rounded-md transition"
      >
        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
      </button>
    </div>
  );
};

// Shared QR/payment-info block for the payment page and printed invoices.
// Renders a real PromptPay QR when PAYMENT_CONFIG.promptPayId is set;
// otherwise falls back to a bank-transfer info card (never fakes a QR out
// of a plain account number — that would produce an unscannable/incorrect code).
const PaymentQR = ({ amount, size = 176 }) => {
  const { bankName, accountNo, accountName, promptPayId } = PAYMENT_CONFIG;

  if (amount != null && amount <= 0) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
        <CheckCircle2 className="text-green-500 mx-auto mb-2" size={28} />
        <p className="text-sm font-bold text-green-700">ชำระครบแล้ว ไม่มียอดค้างชำระ</p>
      </div>
    );
  }

  if (promptPayId) {
    const payload = generatePromptPayPayload(promptPayId, amount);
    return (
      <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 text-center">
        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">สแกนจ่ายด้วยพร้อมเพย์ (PromptPay)</p>
        <div className="bg-white p-3 rounded-xl inline-block shadow-sm">
          <QRCodeSVG value={payload} size={size} level="M" />
        </div>
        {amount > 0 && <p className="text-xl font-black text-indigo-900 mt-3">฿{Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>}
        {accountName && <p className="text-xs text-indigo-700 mt-1">บัญชี: {accountName}</p>}
        <div className="mt-4 pt-4 border-t border-indigo-100 text-left">
          <CopyableField label={`สำรอง: ${bankName}`} value={accountNo} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
      <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">
        <Landmark size={12} /> {bankName}
      </div>
      <CopyableField label="เลขบัญชี" value={accountNo} />
      {accountName && <p className="text-xs text-indigo-700 mt-2">ชื่อบัญชี: {accountName}</p>}
      <p className="text-[11px] text-indigo-400 mt-2">ยังไม่รองรับ QR พร้อมเพย์ กรุณาโอนตามเลขบัญชีนี้</p>
    </div>
  );
};

export default PaymentQR;
