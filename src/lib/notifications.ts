import type { OrderStatus } from "@/types";

const STATUS_MESSAGES: Partial<Record<OrderStatus, { customer?: string; courier?: string; seller?: string }>> = {
  confirmed: {
    customer: "Your Vendorz order has been confirmed and is being prepared.",
    seller: "New order confirmed — start preparing it.",
  },
  preparing: {
    customer: "Your order is being prepared.",
  },
  courier_assigned: {
    customer: "A courier has been assigned and is on the way to collect your order.",
    courier: "You have a new delivery job on Vendorz. Check the app for details.",
  },
  courier_travelling: {
    customer: "Your courier is heading to collect your order.",
  },
  collected: {
    customer: "Your order has been collected and is on its way to you!",
  },
  in_transit: {
    customer: "Your order is in transit.",
  },
  approaching: {
    customer: "Your courier is almost at your location. Get ready!",
  },
  delivered: {
    customer: "Your order has been delivered! Thank you for using Vendorz.",
  },
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "+263" + digits.slice(1);
  if (digits.startsWith("263")) return "+" + digits;
  if (digits.startsWith("+")) return phone;
  return "+263" + digits;
}

async function sendSMS(to: string, message: string) {
  const apiUrl = process.env.SMS_GATEWAY_URL;
  const apiKey = process.env.SMS_GATEWAY_API_KEY;
  if (!apiUrl || !apiKey) return;

  if (process.env.NOTIFY_DRY_RUN === "true") {
    console.log("[SMS DRY RUN]", to, message);
    return;
  }

  try {
    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ to: normalizePhone(to), message, from: "Vendorz" }),
    });
  } catch (e) {
    console.error("[SMS] Failed to send to", to, e);
  }
}

async function sendWhatsApp(to: string, message: string) {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const instance = process.env.EVOLUTION_INSTANCE;
  const apiKey = process.env.EVOLUTION_API_KEY;
  if (!apiUrl || !instance || !apiKey) return;

  if (process.env.NOTIFY_DRY_RUN === "true") {
    console.log("[WhatsApp DRY RUN]", to, message);
    return;
  }

  try {
    await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": apiKey },
      body: JSON.stringify({ number: normalizePhone(to), text: message }),
    });
  } catch (e) {
    console.error("[WhatsApp] Failed to send to", to, e);
  }
}

export async function notifyOrderStatus({
  status,
  customerPhone,
  courierPhone,
  sellerPhone,
  orderRef,
}: {
  status: OrderStatus;
  customerPhone?: string | null;
  courierPhone?: string | null;
  sellerPhone?: string | null;
  orderRef: string;
}) {
  const messages = STATUS_MESSAGES[status];
  if (!messages) return;

  const suffix = ` Order ref: ${orderRef} — vendorz.co.zw`;
  const sends: Promise<void>[] = [];

  if (customerPhone && messages.customer) {
    const msg = messages.customer + suffix;
    sends.push(sendSMS(customerPhone, msg));
    sends.push(sendWhatsApp(customerPhone, msg));
  }
  if (courierPhone && messages.courier) {
    const msg = messages.courier + suffix;
    sends.push(sendSMS(courierPhone, msg));
    sends.push(sendWhatsApp(courierPhone, msg));
  }
  if (sellerPhone && messages.seller) {
    sends.push(sendSMS(sellerPhone, messages.seller + suffix));
  }

  await Promise.allSettled(sends);
}

export async function notifyPaymentReceived(customerPhone: string, amount: number, orderRef: string) {
  const msg = `Payment of $${amount.toFixed(2)} received for your Vendorz order. Ref: ${orderRef}`;
  await Promise.allSettled([sendSMS(customerPhone, msg), sendWhatsApp(customerPhone, msg)]);
}
