// eslint-disable-next-line @typescript-eslint/no-require-imports
const Paynow = require("paynow");

export function createPaynowClient() {
  const client = new Paynow(
    process.env.PAYNOW_INTEGRATION_ID!,
    process.env.PAYNOW_INTEGRATION_KEY!
  );
  client.resultUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/callback`;
  client.returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/customer/orders/`;
  return client;
}

export type PaymentMethod = "ecocash" | "zipit" | "card";
