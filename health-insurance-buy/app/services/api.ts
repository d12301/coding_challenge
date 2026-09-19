export interface QuoteRequest {
  age: number;
  hasPreExistingConditions: boolean;
}

export interface QuoteResponse {
  quoteId: string;
  premium: number;
  expires_at: string;
}

const API_BASE_URL = 'http://localhost:3001/api/v1/insurance';

export async function generateQuote(data: QuoteRequest): Promise<QuoteResponse> {
  const response = await fetch(`${API_BASE_URL}/quote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to generate quote');
  }

  return response.json();
}

export async function checkoutQuote(
  quoteId: string,
  paymentToken: string,
  idempotencyKey: string
): Promise<{ success: boolean; policyId: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'idempotency_key': idempotencyKey,
    },
    body: JSON.stringify({
      quoteId,
      paymentToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Payment processing failed');
  }

  return response.json();
}

export async function submitMedicalDeclaration(data: {
  quoteId: string;
  hasDiabetes: boolean;
  hasHeartCondition: boolean;
}): Promise<{ success: boolean; quoteId: string; status: string }> {
  const response = await fetch(`${API_BASE_URL}/medical-declaration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to submit medical declaration');
  }

  return response.json();
}
