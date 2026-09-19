"use client";

import { useState, useTransition } from "react";
import { generateQuote, QuoteResponse } from "../services/api";

interface QuoteFormProps {
  onQuoteGenerated: (quote: QuoteResponse) => void;
}

export default function QuoteForm({ onQuoteGenerated }: QuoteFormProps) {
  const [age, setAge] = useState<number | "">("");
  const [hasPreExistingConditions, setHasPreExistingConditions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof age !== "number" || age < 18 || age > 100) {
      setError("Please enter a valid age between 18 and 100.");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const quote = await generateQuote({
          age,
          hasPreExistingConditions,
        });
        onQuoteGenerated(quote);
      } catch (err) {
        setError("Failed to generate quote. Please try again.");
      }
    });
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Get Your CareShield Max Quote</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
            Your Age
          </label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="e.g. 35"
            min="18"
            max="100"
            required
            disabled={isPending}
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="preExisting"
            checked={hasPreExistingConditions}
            onChange={(e) => setHasPreExistingConditions(e.target.checked)}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isPending}
          />
          <label htmlFor="preExisting" className="text-sm font-medium text-gray-700 select-none">
            I have pre-existing medical conditions
          </label>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculating...
            </>
          ) : (
            "Calculate Premium"
          )}
        </button>
      </form>
    </div>
  );
}
