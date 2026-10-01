import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { fmt } from "@/lib/parta";

const EXPENSES = [
  { key: "bardana_amount", label: "Bardana" },
  { key: "mandi_tax_amount", label: "Mandi Tax" },
  { key: "commission_amount", label: "Commission" },
  { key: "sutali", label: "Sutali" },
  { key: "labour", label: "Labour" },
  { key: "hammali", label: "Hammali" },
];

export default function BillDetailDialog({ bill, onClose, onPrint }) {
  const open = !!bill;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {bill && (
          <>
            <DialogHeader>
              <DialogTitle>
                Bill {bill.invoice_no} — {bill.client_name}
              </DialogTitle>
              <DialogDescription>
                {bill.bill_date} · FY {bill.financial_year} · {bill.location}
                {bill.item_name ? ` · ${bill.item_name}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-3 py-2 font-medium">Marka</th>
                    <th className="px-3 py-2 font-medium text-right">Weight (Qtl)</th>
                    <th className="px-3 py-2 font-medium text-right">Rate</th>
                    <th className="px-3 py-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(bill.lines || []).map((line, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-3 py-2">{line.marka || "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmt(line.weight || 0)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmt(line.rate || 0)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {fmt(line.amount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Weight: {fmt(bill.total_weight || 0)} Qtl</Badge>
              <Badge variant="secondary">Bags: {bill.total_bags || 0}</Badge>
              <Badge variant="secondary">
                Mandi Tax: {bill.mandi_tax_percent || 0}%
              </Badge>
              <Badge variant="secondary">Commission: {bill.commission_percent || 0}%</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {EXPENSES.map((e) => (
                <div key={e.key} className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">{e.label}</span>
                  <span className="tabular-nums font-medium">{fmt(bill[e.key] || 0)}</span>
                </div>
              ))}
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Total</span>
                <span className="tabular-nums font-medium">{fmt(bill.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Total Expenses</span>
                <span className="tabular-nums font-medium">{fmt(bill.total_expenses || 0)}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Parta w/o Exp</span>
                <span className="tabular-nums font-medium">{fmt(bill.parta_without_expenses || 0)}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Parta with Exp</span>
                <span className="tabular-nums font-medium">{fmt(bill.parta_with_expenses || 0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="font-heading font-bold">Grand Total</span>
              <span className="text-xl font-bold tabular-nums">₹ {fmt(bill.grand_total || 0)}</span>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => onPrint(bill)}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}