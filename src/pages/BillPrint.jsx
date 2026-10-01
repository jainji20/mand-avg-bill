import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { fmt, fmtWeight } from "@/lib/parta";

const EXPENSES = [
  { key: "bardana_amount", label: "Bardana" },
  { key: "mandi_tax_amount", label: "Mandi Tax" },
  { key: "commission_amount", label: "Commission" },
  { key: "sutali", label: "Sutali" },
  { key: "labour", label: "Labour" },
  { key: "hammali", label: "Hammali" },
];

export default function BillPrint() {
  const [bill, setBill] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const id = new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }
    (async () => {
      try {
        setBill(await base44.entities.Bill.get(id));
      } catch {
        setNotFound(true);
      }
    })();
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Bill not found.</p>
        <Button variant="outline" onClick={() => navigate("/bills")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bills
        </Button>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const lines = bill.lines || [];
  const displayDate = (bill.bill_date || "").split("-").reverse().join("-");

  return (
    <div className="min-h-screen bg-muted/40 print:bg-background">
      <div className="max-w-3xl mx-auto p-4 print:p-0">
        <div className="flex gap-2 mb-4 print:hidden">
          <Button variant="outline" onClick={() => navigate("/bills")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        <div className="bg-background p-8 shadow-sm print:shadow-none print:p-0">
          {/* Header — client name & location centered, no company name */}
          <div className="text-center border-b-2 border-foreground pb-2 mb-3">
            <div className="text-2xl font-bold font-heading uppercase tracking-wide">
              {bill.client_name}
            </div>
            <div className="text-sm mt-1">{bill.location}</div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm mb-3">
            <span>
              Bill No: <span className="font-semibold">{bill.invoice_no}</span>
            </span>
            <span>
              Date: <span className="font-semibold">{displayDate}</span>
            </span>
            <span>
              Total Bags:{" "}
              <span className="text-lg font-bold tabular-nums">{bill.total_bags || 0}</span>
            </span>
          </div>
          {bill.item_name && (
            <div className="text-sm mb-2">
              Item: <span className="font-semibold">{bill.item_name}</span>
            </div>
          )}

          {/* Items */}
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="px-2 py-1 text-left font-semibold">S.No</th>
                <th className="px-2 py-1 text-right font-semibold">Weight (Qtl)</th>
                <th className="px-2 py-1 text-right font-semibold">Rate</th>
                <th className="px-2 py-1 text-left font-semibold">Marka</th>
                <th className="px-2 py-1 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-2 py-1">{i + 1}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{fmtWeight(line.weight || 0)}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{fmt(line.rate || 0)}</td>
                  <td className="px-2 py-1">{line.marka || "—"}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{fmt(line.amount || 0)}</td>
                </tr>
              ))}
              <tr className="border-b-2 border-foreground font-semibold">
                <td className="px-2 py-1">Total</td>
                <td className="px-2 py-1 text-right tabular-nums">{fmtWeight(bill.total_weight || 0)}</td>
                <td className="px-2 py-1" colSpan={2}></td>
                <td className="px-2 py-1 text-right tabular-nums">{fmt(bill.total_amount || 0)}</td>
              </tr>
            </tbody>
          </table>

          {/* Expenses + Parta */}
          <div className="mt-3">
            <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-sm">
              {EXPENSES.map((e) => (
                <div key={e.key} className="flex items-baseline justify-between gap-2">
                  <span>
                    {e.label}
                    {e.key === "bardana_amount" && (bill.bardana_bags || bill.bardana_rate) && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        ({fmt(bill.bardana_bags || 0)} bags × ₹ {fmt(bill.bardana_rate || 0)})
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums">{fmt(bill[e.key] || 0)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-baseline justify-between border-t-2 border-foreground font-semibold text-sm mt-2 pt-1">
              <span>Total Expenses</span>
              <span className="tabular-nums">{fmt(bill.total_expenses || 0)}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 text-sm mt-1">
              <div className="flex items-baseline justify-between gap-2">
                <span>Parta (without expenses)</span>
                <span className="tabular-nums">{fmt(bill.parta_without_expenses || 0)}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span>Parta (with expenses)</span>
                <span className="tabular-nums">{fmt(bill.parta_with_expenses || 0)}</span>
              </div>
            </div>
          </div>

          {/* Grand total */}
          <div className="flex items-center justify-between border-t-2 border-foreground mt-3 pt-2">
            <span className="font-bold uppercase">Grand Total</span>
            <span className="text-xl font-bold tabular-nums">₹ {fmt(bill.grand_total || 0)}</span>
          </div>

        </div>
      </div>
    </div>
  );
}