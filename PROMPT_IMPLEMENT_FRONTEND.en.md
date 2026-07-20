# Prompt: Finish the Village System Frontend (wire it to the backend)

> Copy everything below and paste it to an AI (e.g. Claude Code) opened inside the
> `village-system/` folder, with `village-system-backend/` sitting next to it.

---

## Role & goal

You are a React (Vite + React Router + Tailwind + axios + SweetAlert2) engineer working in
`village-system`. The backend (`../village-system-backend`, Echo + Supabase) is **already
implemented** and is the **source of truth** for the API contract. Several frontend pages still
run on local mock data or `console.log`/`alert` stubs and are not wired to the API yet. Your job
is to finish wiring the frontend so every feature works end to end against the real backend.

**Important:** before wiring each page, read the corresponding Go response struct in
`../village-system-backend/internals/<domain>/response.go` (and the request struct / route in
`cmd/echo/main.go`) to confirm exact field names and the HTTP shape. Do not guess.

## How the app already works (reuse these, do not reinvent)

- **HTTP:** always go through the shared axios instance `src/api/axiosConfig.js` (`import api from
  '../api/axiosConfig'`). It auto-attaches `Authorization: Bearer <accessToken>` and already handles
  401 → refresh-token → retry. **Do not** use raw `fetch` (see the Login cleanup task below).
- **Endpoints:** all paths live in `src/api/endpoints.js` as `ENDPOINTS.<DOMAIN>.<ACTION>`. The
  backend groups you'll need are already declared there: `AUTH, ANNOUNCEMENTS, PAYMENTS, USER,
  MEMBER, ISSUES, TRANSACTIONS`. Never hardcode a URL string in a component.
- **Response envelope:** every endpoint returns `{ code, message, data }`. Read the payload as
  `response.data.data`. Success `code` is `"0000"`; some routes use business codes (`"0004"` user
  not active, `"0005"` username exists) — the pages that need them already check them.
- **Auth state:** `src/context/AuthContext.jsx` exposes `{ user, loading, login, logout,
  refreshProfile }`. `user` is populated from `GET /user/profile`.
- **Uploads are multipart/form-data.** Build a `FormData`, append fields, and **let the browser set
  the `Content-Type`** (do NOT manually set `Content-Type: multipart/...` — that breaks the
  boundary). The shared `api` instance is fine for this; just pass the `FormData` as the body.
- **Reuse existing UI:** `Pagination`, `Sidebar`, `Header`, and the modal components already exist
  and are styled — wire data into them, don't rebuild them.

## Cross-cutting task 0 — Role-based access (do this FIRST; it blocks the admin pages)

Right now **every** user sees every menu item (including admin-only pages like จัดการสมาชิก,
บัญชีหมู่บ้าน, ติดตามการชำระเงิน, รับปัญหา/แจ้งซ่อม) and can navigate to them. The app has no notion
of the current user's role. The JWT contains `roles_id`, but `GET /user/profile`
(`ResponseProfile`) does **not** return it, so the frontend currently cannot tell admins from
residents.

Pick ONE approach and apply it consistently:

- **Recommended — expose role from the backend:** add `RolesId`/a human `Role` field to
  `../village-system-backend/internals/users/response.go` `ResponseProfile` (map from the `users`
  row's `roles_id`; admin role UUID is `019a6920-4820-7172-8513-2874579f4344`, user role is
  `...4345`, both in `constants/status.go`). Then in `AuthContext` expose `user.role` (`"admin"` |
  `"user"`), and:
  - `Sidebar.jsx`: tag each menu item with `roles: ['admin']` or `['user','admin']` and filter by
    `user.role`. Admin-only items: `/admin-report`, `/admin-payment-tracking`,
    `/admin-account-manage`, `/admin-user-manage`.
  - `ProtectedRoute.jsx` (or a new `AdminRoute`): gate the admin routes so a resident hitting the
    URL directly is redirected/blocked, not just hidden in the menu.
- **Frontend-only alternative** (if you must not touch the backend): decode the JWT
  `accessToken` client-side (it already carries `roles_id`) and compare against the admin UUID. This
  keeps everything in the frontend but duplicates the role constant.

State which approach you took. If you touch the backend, keep `go build ./...` green.

## Page-by-page wiring

For each of these: replace the mock/stub with a real call, add loading + error handling
(SweetAlert2 is already the convention), and after a successful create/update, refetch the list
rather than mutating local state.

### 1. Dashboard — create announcement *(GET already works)*
- `Dashboard.jsx` already loads announcements via `ANNOUNCEMENTS.GET_ALL`. **Bug to fix:** it sorts
  with `[...targetData].sort((a, b) => b.id - a.id)` but `id` is a UUID string — that subtraction is
  `NaN` and does nothing. Sort by `date` (the backend field) descending, or drop the sort.
- `AddNewsModal.jsx` currently calls `onSave(newsData)` with local data and never hits the API.
  Wire it to **`POST ANNOUNCEMENTS.CREATE`** as `FormData`: fields `title`, `content`, `category`,
  and each file appended as `images` (the backend form field is `images`, max 3, jpeg/png). On
  success, close and let `Dashboard.fetchNews()` reload. `newsData.images` holds real `File` objects.

### 2. ReportIssue — submit a maintenance report
- `ReportIssue.jsx` `handleSubmit` currently does `console.log` + `alert`. Wire it to
  **`POST ISSUES.CREATE`** as `FormData`: `category`, `subject`, `description`, and each file
  appended as **`images`** (note: the component state calls them `report.files`, but the backend
  form field is `images`). On success, navigate to `/report-history`.

### 3. ReportHistory — the resident's own reports
- Replace the mock `reports` array with **`GET ISSUES.GET_MINE`** → `response.data.data`
  (`[]ResponseIssue`: `id, subject, category, date, status, description, userImages[], adminReply,
  adminImages[]`). The mock carried a per-item `color`; instead derive the badge color from
  `status`: `รอดำเนินการ`→amber, `กำลังดำเนินการ`→blue, `เสร็จสิ้น`→green. `ReportDetailModal`
  already reads `userImages/adminReply/adminImages/description/date/status`, so it will work once
  real data flows in.

### 4. AdminReportManage + AdminReplyModal — triage & reply *(admin)*
- `AdminReportManage.jsx`: replace the mock `reports` with **`GET ISSUES.GET_ALL`** (same
  `ResponseIssue` shape).
- `AdminReplyModal.jsx` `handleSubmit` currently calls `onUpdate` with local state (and sends image
  **previews**, not files). Wire it to **`PUT ISSUES.REPLY(report.id)`** as `FormData`: `status`,
  `adminReply` (the `replyText`), and each file appended as **`adminImages`** — send the real `File`
  objects from `adminFiles`, not the `previews` URLs. On success, refetch the list in the parent.
  Status values must be the exact Thai strings the modal already uses.

### 5. Payment + PaymentModal — submit a fee transfer
- `PaymentModal.jsx` currently destructures only `({ isOpen, onClose, amount })` and `handleConfirm`
  does `console.log` + `alert`. Also accept the **`paymentType`** prop (Payment.jsx already passes
  it). Wire `handleConfirm` to **`POST PAYMENTS.SUBMIT`** as `FormData`: `amount`, `paymentType`
  (`"monthly"` | `"yearly"`), and the single slip file appended as **`slip`** (`selectedFile`). On
  success, close + toast.
- (Optional, if you add a history view) `GET PAYMENTS.GET_HISTORY` returns `[]ResponsePayment`
  (`id, amount, status, slipUrl, createdAt`); `slipUrl` is a short-lived signed URL — render it
  directly, don't cache it.

### 6. AdminPaymentTracking — outstanding fees + LINE notify *(admin)*
- Replace the mock `payments` with **`GET PAYMENTS.TRACKING`** → `[]ResponsePaymentTracking`
  (`id, houseNo, name, lineId, monthlyFee, outstandingAmount, currentMonthStatus, overdueMonths`) —
  every field the page already renders.
- `handleNotifyLine(user)` currently `alert`s. Wire it to **`POST PAYMENTS.NOTIFY`** with JSON body
  `{ houseNo: user.houseNo }`. On success, toast. (Backend logs & no-ops if no LINE token is
  configured — a `0000` response still means "accepted".)

### 7. AdminAccountManage + AddTransactionModal — village ledger *(admin)*
- Replace the mock `transactions` with **`GET TRANSACTIONS.GET_ALL`** → `[]ResponseTransaction`
  (`id, title, type, amount, date, category`). Note the backend has **no `time` field** — the page's
  time filter must be dropped or made optional (don't crash on `t.time`).
- `AddTransactionModal.jsx` `handleSubmit` currently builds a local object. Wire it to
  **`POST TRANSACTIONS.CREATE`** as `FormData`: `title`, `type` (`"income"`|`"expense"`), `amount`,
  `date` (`YYYY-MM-DD`), `category`, and each receipt appended as **`files`**. On success, refetch.

## Consistency cleanups (do these too)

- **Login.jsx** bypasses the shared setup: it uses raw `fetch` with a hardcoded
  `API_HOST = "http://localhost:1323"` and its own `LOGIN_ENDPOINT`. Migrate it to
  `api.post(ENDPOINTS.AUTH.LOGIN, credentials)` so there's a single source for the base URL and auth
  handling. Keep the existing `code === "0004"` (not-active) branch and the `login(accessToken,
  refreshToken)` call — the login response is camelCase (`data.data.accessToken/refreshToken`).
- `BASE_URL` in `src/api/endpoints.js` is hardcoded to `http://localhost:1323`. Leave it for local
  dev but note it's the single switch for deploy.
- Make sure newly-wired list pages handle the **empty/`null` data** case (the envelope's `data` can
  be `null` when there are no rows) — guard with `Array.isArray(...) ? ... : []` like Dashboard and
  AdminUserManage already do.

## Field-name gotchas (verified against the backend)

- Upload form-field names differ from local state names: ReportIssue `files`→**`images`**,
  AddTransactionModal `files`→**`files`** (matches), PaymentModal single file→**`slip`**,
  AddNewsModal `images`→**`images`**, AdminReplyModal `adminFiles`→**`adminImages`**.
- `member/status` (already wired) expects snake_case `{ user_id, status, update_by }` — leave as is.
- `refresh-token` response is snake_case (`access_token`) — already handled in `axiosConfig.js`.
- Everything else (profile, announcements, issues, payments, tracking, transactions) is camelCase in
  both directions.

## Acceptance criteria

1. `npm run build` and `npm run lint` pass.
2. No page renders mock/hardcoded arrays anymore; every list comes from the API, every
   create/update/notify hits the API and then refetches.
3. Residents cannot see or reach admin-only pages; admins can.
4. All uploads go out as `multipart/form-data` with the correct field names above and succeed
   against the running backend.
5. Loading and error states exist on every wired page (SweetAlert2 / existing spinners).
6. No raw `fetch` and no hardcoded endpoint strings remain outside `endpoints.js`.

## Suggested order of work

1. Role-based access (task 0) — unblocks and secures the admin pages.
2. Login.jsx cleanup + verify auth/refresh still works end to end.
3. Announcements create (Dashboard/AddNewsModal) — simplest full multipart round-trip to validate
   your FormData pattern before repeating it.
4. Issues (ReportIssue → ReportHistory → AdminReportManage/AdminReplyModal).
5. Payments (Payment/PaymentModal) + AdminPaymentTracking + notify.
6. Transactions (AdminAccountManage/AddTransactionModal).

## Before you start

Run the backend (`cd ../village-system-backend && go run ./cmd/echo`, listens on `:1323`), then
produce a short **gap analysis** (page → current state → endpoint to wire → field mapping) and a
step-by-step plan, and confirm it before writing code.
