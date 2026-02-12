import React, { useState } from 'react';
import { Upload, Camera } from 'lucide-react';

const Services = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* ส่วนชำระเงิน */}
      <section className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4 text-green-600">ชำระค่าส่วนกลาง</h2>
        <div className="border-2 border-dashed border-gray-200 p-6 text-center rounded-lg">
          <p className="mb-2">ยอดคงค้าง: <span className="text-2xl font-bold">1,200 บาท</span></p>
          <input type="file" id="slip" className="hidden" />
          <label htmlFor="slip" className="cursor-pointer flex flex-col items-center text-indigo-600">
            <Upload size={40} />
            <span>อัปโหลดหลักฐานการโอนเงิน (Slip)</span>
          </label>
        </div>
      </section>

      {/* ส่วนแจ้งปัญหา */}
      <section className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4 text-orange-600">แจ้งปัญหา / ซ่อมแซม</h2>
        <textarea className="w-full border p-3 rounded-lg mb-4" rows="3" placeholder="ระบุปัญหาที่พบ..."></textarea>
        <div className="flex items-center space-x-4">
          <button className="flex items-center bg-gray-100 px-4 py-2 rounded-md border hover:bg-gray-200">
            <Camera size={20} className="mr-2"/> แนบรูป/วิดีโอ
          </button>
          <button className="flex-1 bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600">ส่งแจ้งปัญหา</button>
        </div>
      </section>
    </div>
  );
};
export default Services;