"use client";

import { useState } from "react";
import QuoteForm from "./components/QuoteForm";
import MedicalDeclarationForm from "./components/MedicalDeclarationForm";
import CheckoutPayment from "./components/CheckoutPayment";
import { QuoteResponse } from "./services/api";

export default function Home() {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [step, setStep] = useState<"quote" | "medical" | "checkout">("quote");

  const handleQuoteGenerated = (newQuote: QuoteResponse) => {
    setQuote(newQuote);
    setStep("medical");
  };

  const handleDeclarationSubmitted = () => {
    setStep("checkout");
  };

  const handleRecalculate = () => {
    setQuote(null);
    setStep("quote");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight sm:text-5xl">
            CareShield Max
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Comprehensive health insurance for you and your family.
          </p>
        </div>

        <div className="flex justify-center">
          {step === "quote" && (
            <QuoteForm onQuoteGenerated={handleQuoteGenerated} />
          )}
          {step === "medical" && quote && (
            <MedicalDeclarationForm
              quote={quote}
              onDeclarationSubmitted={handleDeclarationSubmitted}
              onExpire={handleRecalculate}
            />
          )}
          {step === "checkout" && quote && (
            <CheckoutPayment quote={quote} onRecalculate={handleRecalculate} />
          )}
        </div>
      </div>
    </main>
  );
}
