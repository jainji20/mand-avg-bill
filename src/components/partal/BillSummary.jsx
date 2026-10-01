import React from "react";
import { fmt } from "@/lib/parta";

export default function BillSummary({
  totalAmount,
  totalExpenses,
  grandTotal,
  partaWithout,
  partaWith,
}) {
  const rows = [
    { label: "Total Amount", value: fmt(totalAmount) },
    { label: "Total Expenses", value: fmt(totalExpenses) },
    { label: "Parta (without expenses) / Qtl", value: fmt(partaWithout) },
    { label: "Parta (with expenses) / Qtl", value: fmt(partaWith) },
  ];

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="font-heading font-semibold mb-4">Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-xs text-muted-foreground mb-1">{row.label}</p>
            <p className="text-lg font-semibold tabular-nums">{row.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <p className="font-heading font-bold">Grand Total</p>
        <p className="text-2xl font-bold tabular-nums">{fmt(grandTotal)}</p>
      </div>
    </div>
  );
}