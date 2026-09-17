export interface JupiterTokenPriceData {
  id?: string;
  usdPrice: number;
  decimals?: number;
  priceChange24h?: number;
  liquidity?: number;
}

export type JupiterPriceResponse = Record<string, JupiterTokenPriceData>;

const JUPITER_PRICE_V3_URL = "https://api.jup.ag/price/v3";

export async function fetchJupiterPrices(
  mintAddresses: string[]
): Promise<JupiterPriceResponse> {
  if (!mintAddresses.length) return {};

  const queryIds = mintAddresses.join(",");
  const url = `${JUPITER_PRICE_V3_URL}?ids=${encodeURIComponent(queryIds)}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const apiKey = process.env.NEXT_PUBLIC_JUPITER_API_KEY;
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 15 },
    });

    if (!res.ok) {
      console.warn(`Jupiter Price API returned status ${res.status}`);
      return {};
    }

    const data = (await res.json()) as JupiterPriceResponse;
    return data || {};
  } catch (error) {
    console.error("Failed to fetch prices from Jupiter API:", error);
    return {};
  }
}
