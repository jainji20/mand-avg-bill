import React from "react";
import { fmt, fmtWeight } from "@/lib/parta";

export default function BillTotals({ totalWeight, totalAmount, totalBags }) {
  const items = [
    { label: "Total Weight (Qtl)", value: fmtWeight(totalWeight) },
    { label: "Total Amount", value: fmt(totalAmount) },
    { label: "Total Bags (from Marka)", value: fmt(totalBags) },
  ];

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className="text-xl font-bold tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}