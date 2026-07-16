// Most SMM providers (JustAnotherPanel, Peakerr, SMMWIZ, Followiz, ...) expose
// the same "Perfect Panel" compatible REST API: a single POST endpoint that
// takes `key` + `action` and returns JSON. This client works with any of them —
// only the api_url / api_key differ per provider (stored in the `providers` table).

type ProviderCreds = { api_url: string; api_key: string };

async function callProvider(creds: ProviderCreds, params: Record<string, string | number>) {
  const body = new URLSearchParams({ key: creds.api_key, ...toStringRecord(params) });
  const res = await fetch(creds.api_url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Tedarikçi API hatası: HTTP ${res.status}`);
  return res.json();
}

function toStringRecord(params: Record<string, string | number>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) out[k] = String(v);
  return out;
}

export async function providerPlaceOrder(
  creds: ProviderCreds,
  args: { providerServiceId: string; link: string; quantity: number }
) {
  const data = await callProvider(creds, {
    action: "add",
    service: args.providerServiceId,
    link: args.link,
    quantity: args.quantity,
  });
  if (data.error) throw new Error(data.error);
  return { providerOrderId: String(data.order) };
}

export async function providerOrderStatus(creds: ProviderCreds, providerOrderId: string) {
  const data = await callProvider(creds, { action: "status", order: providerOrderId });
  if (data.error) throw new Error(data.error);
  return {
    status: data.status as string, // Pending | In progress | Completed | Partial | Canceled
    startCount: data.start_count ? Number(data.start_count) : null,
    remains: data.remains ? Number(data.remains) : null,
    charge: data.charge ? Number(data.charge) : null,
  };
}

export async function providerServiceList(creds: ProviderCreds) {
  return callProvider(creds, { action: "services" });
}

export async function providerBalance(creds: ProviderCreds) {
  const data = await callProvider(creds, { action: "balance" });
  if (data.error) throw new Error(data.error);
  return { balance: Number(data.balance), currency: data.currency as string };
}

// Maps a provider's free-text status to our internal enum.
export function normalizeProviderStatus(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("pending")) return "pending";
  if (s.includes("progress") || s.includes("processing")) return "in_progress";
  if (s.includes("partial")) return "partial";
  if (s.includes("cancel")) return "canceled";
  if (s.includes("complete")) return "completed";
  return "processing";
}
