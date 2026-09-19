"use client";

import { useState, useTransition } from "react";
import { submitMedicalDeclaration, QuoteResponse } from "../services/api";
import CountdownTimer from "./CountdownTimer";

interface MedicalDeclarationFormProps {
  quote: QuoteResponse;
  onDeclarationSubmitted: () => void;
  onExpire: () => void;
}

export default function MedicalDeclarationForm({ quote, onDeclarationSubmitted, onExpire }: MedicalDeclarationFormProps) {
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHeartCondition, setHasHeartCondition] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const handleExpire = () => {
    setIsExpired(true);
    onExpire();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;

    setError(null);

    startTransition(async () => {
      try {
        const response = await submitMedicalDeclaration({
          quoteId: quote.quoteId,
          hasDiabetes,
          hasHeartCondition,
        });

        if (response.success) {
          onDeclarationSubmitted();
        } else {
          setError("Failed to process declaration.");
        }
      } catch (err) {
        setError("An error occurred while submitting your medical declaration.");
      }
    });
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Medical Declaration</h2>
      
      <div className="mb-6 flex justify-center">
        <CountdownTimer expiresAt={quote.expires_at} onExpire={handleExpire} />
      </div>

      <p className="text-sm text-gray-600 mb-6">
        To complete your policy evaluation, please answer the following questions truthfully.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <input
              type="checkbox"
              id="diabetes"
              checked={hasDiabetes}
              onChange={(e) => setHasDiabetes(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isPending || isExpired}
            />
            <label htmlFor="diabetes" className="text-sm font-medium text-gray-800 select-none cursor-pointer">
              I have been diagnosed with Diabetes
            </label>
          </div>

          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <input
              type="checkbox"
              id="heartCondition"
              checked={hasHeartCondition}
              onChange={(e) => setHasHeartCondition(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isPending || isExpired}
            />
            <label htmlFor="heartCondition" className="text-sm font-medium text-gray-800 select-none cursor-pointer">
              I have been diagnosed with a Heart Condition
            </label>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {isExpired ? (
          <div className="text-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            Your quote has expired. Please recalculate your premium.
          </div>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Submit & Continue to Checkout"
            )}
          </button>
        )}
      </form>
    </div>
  );
}
