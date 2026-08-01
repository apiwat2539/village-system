// แยกส่วน Host เพื่อให้เปลี่ยนที่เดียวเวลา Deploy
// VITE_API_BASE_URL (ถ้าตั้งไว้ใน .env.local) ชนะเสมอ ไม่งั้น fallback ตาม mode:
// - `npm run build`/deploy จริง -> backend บน snapdeploy (absolute URL)
// - `npm run dev` -> "" (relative) เพื่อให้ยิงผ่าน Vite dev-server proxy
//   (vite.config.js server.proxy) เสมอ ไม่ว่าจะเปิดจาก localhost หรือแชร์
//   ผ่าน ngrok tunnel เดียว — เลี่ยงปัญหา "localhost ของฝั่งไหน" ไปเลย
const DEFAULT_BASE_URL = import.meta.env.PROD
    ? "https://village-system-backend-b7adb.containers.snapdeploy.app"
    : "";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/api/v1/login",
        REGISTER: "/api/v1/register",
        REFRESH_TOKEN: "/api/v1/refresh-token",
        LOGOUT: "/api/v1/logout",
        // GET returns { authorizeUrl } to redirect the browser to LINE.
        LINE_LOGIN_URL: "/api/v1/auth/line/login",
        // POST { code, state } from the LINE redirect back to the frontend's
        // own callback route. Response.status is "login" | "pending" | "register_required".
        LINE_CALLBACK: "/api/v1/auth/line/callback",
        // POST { registrationTicket, ...profile fields } when status was "register_required".
        LINE_REGISTER: "/api/v1/auth/line/register",
        // POST { registrationTicket, username, password } สำหรับคนที่มีบัญชีเดิมอยู่แล้ว
        // ผูก LINE เข้ากับบัญชีนั้นแทนการสมัครใหม่ — ตอบกลับเหมือน LINE_CALLBACK
        LINE_LINK: "/api/v1/auth/line/link",
    },
    ANNOUNCEMENTS: {
        GET_ALL: "/api/v1/announcements",
        GET_BY_ID: (id) => `/api/v1/announcements/${id}`, // ถ้ามี path parameter
        CREATE: "/api/v1/announcements",
    },
    PAYMENTS: {
        GET_HISTORY: "/api/v1/payments",
        SUBMIT: "/api/v1/payments",
        SUMMARY: "/api/v1/payments/summary",
        MY_BILLS: "/api/v1/payments/bills",
        PENDING: "/api/v1/payments/pending",
        APPROVE: (id) => `/api/v1/payments/${id}/approve`,
        REJECT: (id) => `/api/v1/payments/${id}/reject`,
        RECEIPT: (id) => `/api/v1/payments/${id}/receipt`,
        TRACKING: "/api/v1/payment/tracking/status",
        NOTIFY: "/api/v1/admin/notify-line",
    },
    USER: {
        PROFILE: "/api/v1/user/profile",
        UPDATE_PROFILE: "/api/v1/user/profile",
    },
    MEMBER: {
        GET_ALL: "/api/v1/member",
        UPDATE_STATUS: "/api/v1/member/status",
    },
    ISSUES: {
        CREATE: "/api/v1/issues",
        GET_MINE: "/api/v1/issues",
        GET_ALL: "/api/v1/issues/all",
        REPLY: (id) => `/api/v1/issues/${id}/reply`,
    },
    TRANSACTIONS: {
        GET_ALL: "/api/v1/transactions",
        GET_BY_ID: (id) => `/api/v1/transactions/${id}`,
        CREATE: "/api/v1/transactions",
        // range: "month" | "year" | "all"
        OVERVIEW: (range) => `/api/v1/transactions/overview?range=${range}`,
    },
    FEE_CONFIG: {
        GET_RATES: "/api/v1/fee-config/rates",
        CREATE_RATE: "/api/v1/fee-config/rates",
        GET_HOUSES: "/api/v1/fee-config/houses",
        SET_HOUSE: "/api/v1/fee-config/houses",
    },
    BILLS: {
        GENERATE: "/api/v1/bills/generate",
        CREATE: "/api/v1/bills",
        ISSUE_INVOICE: (id) => `/api/v1/bills/${id}/invoice`,
        GET_INVOICE: (id) => `/api/v1/bills/${id}/invoice`,
    },
    // ทะเบียนผู้รับเงิน (คู่ค้าที่ถูกหักภาษี ณ ที่จ่าย)
    PAYEES: {
        GET_ALL: "/api/v1/payees",
        CREATE: "/api/v1/payees",
        UPDATE: (id) => `/api/v1/payees/${id}`,
    },
    // ระบบเบิกจ่าย + คำนวณภาษีหัก ณ ที่จ่าย
    DISBURSEMENTS: {
        // ประเภทเงินได้ + อัตราภาษีมาตรฐาน ดึงจาก backend เสมอ (อย่า hardcode ซ้ำฝั่งนี้)
        INCOME_TYPES: "/api/v1/disbursements/income-types",
        PREVIEW_WHT: "/api/v1/disbursements/preview-wht",
        GET_ALL: (status) => (status ? `/api/v1/disbursements?status=${status}` : "/api/v1/disbursements"),
        CREATE: "/api/v1/disbursements",
        GET_BY_ID: (id) => `/api/v1/disbursements/${id}`,
        APPROVE: (id) => `/api/v1/disbursements/${id}/approve`,
        REJECT: (id) => `/api/v1/disbursements/${id}/reject`,
        PAY: (id) => `/api/v1/disbursements/${id}/pay`,
        WHT_CERTIFICATE: (id) => `/api/v1/disbursements/${id}/wht-certificate`,
    },
    // การนำส่งภาษีหัก ณ ที่จ่ายให้กรมสรรพากร (ภ.ง.ด.3 / ภ.ง.ด.53)
    TAX_FILINGS: {
        SUMMARY: (period) => `/api/v1/tax-filings/summary?period=${period}`,
        DETAIL: (form, period) => `/api/v1/tax-filings/${form}?period=${period}`,
        // format: "txt" (ไฟล์ใบแนบ TIS-620 สำหรับอัปโหลด e-Filing) | "csv" (ไว้ตรวจทาน)
        EXPORT: (form, period, format) => `/api/v1/tax-filings/${form}/export?period=${period}&format=${format}`,
        SUBMIT: "/api/v1/tax-filings/submit",
        HISTORY: "/api/v1/tax-filings/history",
    },
};

// หมวดรายจ่าย ใช้ร่วมกับหมวดใน AddTransactionModal เพื่อให้รายงานการเงินรวมยอดได้ตรงกัน
export const EXPENSE_CATEGORIES = [
    "ซ่อมแซม/บำรุงรักษา",
    "เงินเดือนพนักงาน",
    "ค่าน้ำ-ไฟฟ้าส่วนกลาง",
    "ค่าใช้จ่ายอื่นๆ",
];

export const PAYEE_TYPES = [
    { value: "individual", label: "บุคคลธรรมดา (ยื่น ภ.ง.ด.3)" },
    { value: "juristic", label: "นิติบุคคล (ยื่น ภ.ง.ด.53)" },
];

export const PAYMENT_METHODS = ["โอนเงิน", "เงินสด", "เช็ค"];

export const HOUSE_TYPES = ["ทาวน์โฮม", "บ้านแฝด"];