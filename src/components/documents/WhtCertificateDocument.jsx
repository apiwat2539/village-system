import React from 'react';

const formatBaht = (n) => (n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Checkbox = ({ checked, label }) => (
  <span className="inline-flex items-center gap-1 mr-4">
    <span className="inline-block w-3.5 h-3.5 border border-slate-700 text-center leading-[13px] text-[10px]">
      {checked ? '✓' : ''}
    </span>
    {label}
  </span>
);

// หนังสือรับรองการหักภาษี ณ ที่จ่าย ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร (แบบ 50 ทวิ)
// วางโครงตามหัวข้อในแบบราชการ เพื่อให้พิมพ์แล้วใช้แนบให้ผู้รับเงินได้จริง
const WhtCertificateDocument = ({ data }) => {
  if (!data) return null;

  return (
    <div className="print-area bg-white text-slate-800 p-10 max-w-3xl mx-auto font-kanit text-[13px]">
      <div className="text-center border-b-2 border-slate-800 pb-3 mb-5">
        <h1 className="text-lg font-bold">หนังสือรับรองการหักภาษี ณ ที่จ่าย</h1>
        <p className="text-slate-500">ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร</p>
        <p className="text-slate-500 text-xs">เล่มที่ / เลขที่ {data.certificateNo}</p>
      </div>

      <section className="mb-4">
        <p className="font-bold mb-1">ผู้มีหน้าที่หักภาษี ณ ที่จ่าย</p>
        <p>{data.payer.name}</p>
        <p className="text-slate-600">
          เลขประจำตัวผู้เสียภาษีอากร: {data.payer.taxId || '—'}
          {data.payer.branchNo ? `  (สาขา ${data.payer.branchNo})` : ''}
        </p>
        <p className="text-slate-600 whitespace-pre-line">ที่อยู่: {data.payer.address}</p>
      </section>

      <section className="mb-4 border-t border-slate-200 pt-3">
        <p className="font-bold mb-1">ผู้ถูกหักภาษี ณ ที่จ่าย ({data.payeeTypeLabel})</p>
        <p>{data.payee.name}</p>
        <p className="text-slate-600">
          เลขประจำตัวผู้เสียภาษีอากร: {data.payee.taxId}
          {data.payee.branchNo ? `  (สาขา ${data.payee.branchNo})` : ''}
        </p>
        <p className="text-slate-600 whitespace-pre-line">ที่อยู่: {data.payee.address}</p>
      </section>

      <section className="mb-4 border-t border-slate-200 pt-3">
        <p className="font-bold mb-1">ลำดับที่ในแบบยื่นรายการ</p>
        <div className="text-slate-700">
          <Checkbox checked={data.formType === 'pnd3'} label="ภ.ง.ด.3" />
          <Checkbox checked={data.formType === 'pnd53'} label="ภ.ง.ด.53" />
        </div>
      </section>

      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-slate-100 border-y border-slate-300">
            <th className="text-left py-2 px-3">ประเภทเงินได้พึงประเมินที่จ่าย</th>
            <th className="text-center py-2 px-3 w-28">วัน เดือน ปี ที่จ่าย</th>
            <th className="text-right py-2 px-3 w-32">จำนวนเงินที่จ่าย</th>
            <th className="text-right py-2 px-3 w-32">ภาษีที่หักและนำส่ง</th>
          </tr>
        </thead>
        <tbody>
          {(data.items || []).map((item, idx) => (
            <tr key={idx} className="border-b border-slate-200">
              <td className="py-2 px-3">{item.description} <span className="text-slate-400">(มาตรา {item.section})</span></td>
              <td className="py-2 px-3 text-center">{item.paymentDate}</td>
              <td className="py-2 px-3 text-right">{formatBaht(item.amount)}</td>
              <td className="py-2 px-3 text-right">{formatBaht(item.taxAmount)}</td>
            </tr>
          ))}
          <tr className="font-bold border-y-2 border-slate-800">
            <td className="py-2 px-3" colSpan={2}>รวมเงินที่จ่ายและภาษีที่หักนำส่ง</td>
            <td className="py-2 px-3 text-right">{formatBaht(data.totalAmount)}</td>
            <td className="py-2 px-3 text-right">{formatBaht(data.totalTax)}</td>
          </tr>
        </tbody>
      </table>

      <p className="mb-4">
        รวมเงินภาษีที่หักนำส่ง (ตัวอักษร): <span className="font-bold">{data.totalTaxText}</span>
      </p>

      <section className="mb-8 border-t border-slate-200 pt-3">
        <p className="font-bold mb-1">เงื่อนไขการหักภาษี ณ ที่จ่าย</p>
        <div className="text-slate-700">
          <Checkbox checked={data.condition === 1} label="หัก ณ ที่จ่าย" />
          <Checkbox checked={data.condition === 2} label="ออกภาษีให้ตลอดไป" />
          <Checkbox checked={data.condition === 3} label="ออกภาษีให้ครั้งเดียว" />
          <Checkbox checked={data.condition === 4} label="อื่น ๆ" />
        </div>
      </section>

      <p className="text-xs text-slate-500 mb-6">
        ขอรับรองว่าข้อความและตัวเลขดังกล่าวข้างต้นถูกต้องตรงกับความจริงทุกประการ
      </p>

      <div className="grid grid-cols-2 gap-6 text-center">
        <div />
        <div>
          <div className="border-t border-slate-400 pt-2 mx-8">ผู้จ่ายเงิน</div>
          <p className="text-slate-500 mt-1">วันที่ออกหนังสือรับรอง {data.issuedAt}</p>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 mt-6">อ้างอิงใบเบิกจ่ายเลขที่ {data.docNo}</p>
    </div>
  );
};

export default WhtCertificateDocument;
