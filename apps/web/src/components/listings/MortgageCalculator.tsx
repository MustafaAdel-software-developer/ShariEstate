"use client";

import { useState } from "react";

interface MortgageCalculatorProps {
  price: number;
}

export function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const [downPayment, setDownPayment] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [term, setTerm] = useState(30);

  const loanAmount = price * (1 - downPayment / 100);
  const monthlyRate = rate / 100 / 12;
  const payments = term * 12;
  const monthly =
    monthlyRate === 0
      ? loanAmount / payments
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, payments)) /
        (Math.pow(1 + monthlyRate, payments) - 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">Mortgage Calculator</h3>
      <p className="mt-1 text-sm text-slate-500">Estimate your monthly payment</p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500">Down Payment: {downPayment}%</label>
          <input type="range" min={0} max={50} value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="mt-1 w-full" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Interest Rate: {rate}%</label>
          <input type="range" min={3} max={10} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-1 w-full" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Loan Term</label>
          <select value={term} onChange={(e) => setTerm(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value={15}>15 years</option>
            <option value={20}>20 years</option>
            <option value={30}>30 years</option>
          </select>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-center">
        <p className="text-sm text-slate-600">Estimated Monthly Payment</p>
        <p className="text-3xl font-bold text-emerald-700">
          ${monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="mt-1 text-xs text-slate-500">Principal & interest only. Taxes and insurance not included.</p>
      </div>
    </div>
  );
}
