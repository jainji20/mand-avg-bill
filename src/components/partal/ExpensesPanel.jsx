import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmt } from "@/lib/parta";

const MANUAL_FIELDS = [
  { key: "bardana_bags", label: "Bardana Bags", placeholder: "0" },
  { key: "bardana_rate", label: "Bardana Rate", placeholder: "0" },
  { key: "sutali", label: "Sutali", placeholder: "0" },
  { key: "labour", label: "Labour", placeholder: "0" },
  { key: "hammali", label: "Hammali", placeholder: "0" },
];

const PCT_FIELDS = [
  { key: "mandi_tax", label: "Mandi Tax %", amountLabel: "Mandi Tax Amount" },
  { key: "commission", label: "Commission %", amountLabel: "Commission Amount" },
];

export default function ExpensesPanel({
  expenses,
  onChange,
  setFieldRef,
  onEnter,
  bardanaAmount,
  mandiTaxPct,
  commissionPct,
  onPercentChange,
  mandiTaxAmount,
  commissionAmount,
}) {
  const handleKeyDown = (key) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter(key);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 mb-6">
      <h2 className="font-heading font-semibold mb-4">Expenses</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {MANUAL_FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`exp-${field.key}`}>{field.label}</Label>
            <Input
              id={`exp-${field.key}`}
              type="number"
              step="any"
              placeholder={field.placeholder}
              ref={setFieldRef(`exp-${field.key}`)}
              value={expenses[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
              onKeyDown={handleKeyDown(`exp-${field.key}`)}
            />
          </div>
        ))}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Bardana Amount (Bags × Rate)</p>
          <p className="text-base font-semibold tabular-nums leading-9">{fmt(bardanaAmount)}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t">
        {PCT_FIELDS.map((field) => (
          <div key={field.key} className="flex items-end gap-4">
            <div className="space-y-1.5 w-28 shrink-0">
              <Label htmlFor={`exp-${field.key}`}>{field.label}</Label>
              <Input
                id={`exp-${field.key}`}
                type="number"
                step="any"
                placeholder="0"
                ref={setFieldRef(`exp-${field.key}`)}
                value={field.key === "mandi_tax" ? mandiTaxPct : commissionPct}
                onChange={(e) => onPercentChange(field.key, e.target.value)}
                onKeyDown={handleKeyDown(`exp-${field.key}`)}
              />
            </div>
            <div className="text-right flex-1">
              <p className="text-xs text-muted-foreground">{field.amountLabel}</p>
              <p className="text-lg font-semibold tabular-nums">
                {fmt(field.key === "mandi_tax" ? mandiTaxAmount : commissionAmount)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Percentages auto-fill from the client master — edit them for a special case on this bill.
      </p>
    </div>
  );
}