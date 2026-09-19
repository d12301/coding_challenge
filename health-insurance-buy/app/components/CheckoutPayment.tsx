"use client";

import { useState, useTransition, useRef } from "react";
import { checkoutQuote, QuoteResponse } from "../services/api";
import CountdownTimer from "./CountdownTimer";

interface CheckoutPaymentProps {
  quote: QuoteResponse;
  onRecalculate: () => void;
}

export default function CheckoutPayment({ quote, onRecalculate }: CheckoutPaymentProps) {
  const [isExpired, setIsExpired] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");
  const [policyId, setPolicyId] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const handleExpire = () => {
    setIsExpired(true);
  };

  const handlePayment = () => {
    startTransition(async () => {
      try {
        const idempotencyKey = idempotencyKeyRef.current;
        const response = await checkoutQuote(quote.quoteId, "mock_token_123", idempotencyKey);
        if (response.success) {
          setPaymentStatus("success");
          setPolicyId(response.policyId);
        } else {
          setPaymentStatus("error");
        }
      } catch (error) {
        setPaymentStatus("error");
      }
    });
  };

  if (paymentStatus === "success") {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100 max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Your CareShield Max policy has been issued.</p>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Policy Number</p>
          <p className="text-lg font-mono font-bold text-gray-900">{policyId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Checkout</h2>
      
      <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 mb-8 space-y-4">
        <div className="flex justify-between items-center border-b border-blue-100 pb-4">
          <span className="text-gray-600 font-medium">Quote Reference</span>
          <span className="font-mono text-gray-900">{quote.quoteId}</span>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-gray-600 font-medium">Total Premium</span>
          <span className="text-3xl font-bold text-gray-900">
            ₹{quote.premium.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="mb-8 flex justify-center">
        <CountdownTimer expiresAt={quote.expires_at} onExpire={handleExpire} />
      </div>

      {paymentStatus === "error" && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center border border-red-200">
          Payment processing failed. Please try again.
        </div>
      )}

      {isExpired ? (
        <button
          onClick={onRecalculate}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
        >
          Recalculate Premium
        </button>
      ) : (
        <button
          onClick={handlePayment}
          disabled={isPending || isExpired}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition-colors flex justify-center items-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </>
          ) : (
            `Pay ₹${quote.premium.toLocaleString('en-IN')} Now`
          )}
        </button>
      )}
    </div>
  );
}
