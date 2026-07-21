// PromptPay QR payload generator (Thai QR Payment / EMVCo standard).
// Implemented manually (no extra dependency) — same field set as the
// widely-used "promptpay-qr" npm package's algorithm.

const ID_PAYLOAD_FORMAT = '00';
const ID_POI_METHOD = '01';
const ID_MERCHANT_INFO_BOT = '29';
const ID_TRANSACTION_CURRENCY = '53';
const ID_TRANSACTION_AMOUNT = '54';
const ID_COUNTRY_CODE = '58';
const ID_CRC = '63';

const POI_METHOD_STATIC = '11';
const POI_METHOD_DYNAMIC = '12';

const MERCHANT_INFO_GUID = '00';
const BOT_ID_MOBILE = '01';
const BOT_ID_TAX_ID = '02';
const BOT_ID_EWALLET = '03';
const GUID_PROMPTPAY = 'A000000677010111';

const CURRENCY_THB = '764';
const COUNTRY_TH = 'TH';

function formatTLV(id, value) {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

// Detects the PromptPay proxy type from the ID's digit count and normalizes it:
// 13 digits -> national ID / juristic tax ID, 15 digits -> e-wallet ID,
// anything else -> mobile number (normalized to "0066xxxxxxxxx").
function normalizeTarget(promptPayId) {
  const digits = promptPayId.replace(/[^0-9]/g, '');

  if (digits.length === 13) {
    return formatTLV(BOT_ID_TAX_ID, digits);
  }
  if (digits.length === 15) {
    return formatTLV(BOT_ID_EWALLET, digits);
  }

  let phone = digits;
  if (phone.startsWith('66')) phone = phone.slice(2);
  if (phone.startsWith('0')) phone = phone.slice(1);
  phone = `0066${phone}`;
  return formatTLV(BOT_ID_MOBILE, phone);
}

// CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF, no reflect, no final XOR) —
// the checksum algorithm required by the EMVCo QR spec.
function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Build a PromptPay QR payload string.
 * @param {string} promptPayId - mobile number, 13-digit tax/national ID, or 15-digit e-wallet ID
 * @param {number} [amount] - amount in THB; omit or 0 for an open-amount QR
 * @returns {string}
 */
export function generatePromptPayPayload(promptPayId, amount) {
  const merchantInfo = formatTLV(MERCHANT_INFO_GUID, GUID_PROMPTPAY) + normalizeTarget(promptPayId);
  const hasAmount = amount && amount > 0;

  let payload =
    formatTLV(ID_PAYLOAD_FORMAT, '01') +
    formatTLV(ID_POI_METHOD, hasAmount ? POI_METHOD_DYNAMIC : POI_METHOD_STATIC) +
    formatTLV(ID_MERCHANT_INFO_BOT, merchantInfo) +
    formatTLV(ID_COUNTRY_CODE, COUNTRY_TH) +
    formatTLV(ID_TRANSACTION_CURRENCY, CURRENCY_THB);

  if (hasAmount) {
    payload += formatTLV(ID_TRANSACTION_AMOUNT, amount.toFixed(2));
  }

  payload += `${ID_CRC}04`;
  payload += crc16(payload);

  return payload;
}
