// แยกส่วน Host เพื่อให้เปลี่ยนที่เดียวเวลา Deploy
// VITE_API_BASE_URL (ถ้าตั้งไว้ใน .env) ชนะเสมอ ไม่งั้น fallback ตาม mode:
// `npm run dev` -> localhost, `npm run build`/deploy จริง -> backend บน snapdeploy
const DEFAULT_BASE_URL = import.meta.env.PROD
    ? "https://village-system-backend-b7adb.containers.snapdeploy.app"
    : "http://localhost:1323";

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
};

export const HOUSE_TYPES = ["ทาวน์โฮม", "บ้านแฝด"];