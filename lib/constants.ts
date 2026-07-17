// Edit these with your real bank account details — this is the single place
// the whole site pulls payment info from.
export const BANK_INFO = {
  accountName: "Melih Keleş",
  iban: "TR35 0006 2000 3930 0006 6345 75",
  bankName: "Garanti BBVA",
};

// Minimum order total (TRY) — orders below this are rejected at checkout.
export const MIN_ORDER_AMOUNT = 50;

// Automatic bulk-quantity discount: orders with quantity >= threshold get
// this percentage knocked off automatically, no coupon code needed. This
// stacks independently of coupon codes (coupons are capped at one-per-order,
// but this automatic tier discount is separate from that rule).
export const BULK_DISCOUNT_THRESHOLD = 5000;
export const BULK_DISCOUNT_PERCENT = 10;

// Welcome discount for a customer's very first order ever (matched by email,
// no coupon code needed — auto-detected server-side).
export const WELCOME_DISCOUNT_PERCENT = 10;

// Review-reward discount code: percent off, and how long the code lasts.
export const REVIEW_DISCOUNT_PERCENT = 5;
export const REVIEW_DISCOUNT_VALID_DAYS = 30;
