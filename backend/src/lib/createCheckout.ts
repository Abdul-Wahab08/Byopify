type createCheckoutbody = {
    products: string[];
    prices: Record<string,
        Array<{
            amount_type: "fixed";
            price_amount: number;
            price_currency: string;
        }>
    >;
    successUrl: string;
    returnUrl?: string;
    external_customer_id?: string;
    customer_email?: string;
    metadata?: Record<string, string | number | boolean>;
};

type PolarCheckoutResponse = {
  id: string;
  url: string;
};

export async function createCheckout(body: createCheckoutbody) {
    const response = await fetch(`${process.env.POLAR_API_BASE}/v1/checkouts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.POLAR_ACCESS_TOKEN}`
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Polar checkout failed: ${response.status} ${errorText}`);
    }

    const checkout: PolarCheckoutResponse = await response.json();

    return {
        id: checkout.id,
        url: checkout.url
    }
}