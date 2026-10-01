import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Printer, Trash2 } from "lucide-react";
import { fmt } from "@/lib/parta";

export default function BillsTable({ bills, onView, onEdit, onPrint, onDelete }) {
  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-3 py-2.5 font-medium">Inv. No</th>
            <th className="px-3 py-2.5 font-medium">Date</th>
            <th className="px-3 py-2.5 font-medium">Client</th>
            <th className="px-3 py-2.5 font-medium">Item</th>
            <th className="px-3 py-2.5 font-medium text-right">Weight (Qtl)</th>
            <th className="px-3 py-2.5 font-medium text-right">Bags</th>
            <th className="px-3 py-2.5 font-medium text-right">Grand Total</th>
            <th className="px-3 py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            <tr key={bill.id} className="border-b last:border-0 hover:bg-accent/50">
              <td className="px-3 py-2.5 font-semibold">{bill.invoice_no}</td>
              <td className="px-3 py-2.5">{bill.bill_date}</td>
              <td className="px-3 py-2.5">
                <span className="font-medium">{bill.client_name}</span>
                <span className="text-muted-foreground"> · {bill.location}</span>
              </td>
              <td className="px-3 py-2.5">{bill.item_name || "—"}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{fmt(bill.total_weight || 0)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{bill.total_bags || 0}</td>
              <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                ₹ {fmt(bill.grand_total || 0)}
              </td>
              <td className="px-3 py-2.5 text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onPrint(bill)} title="Print">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onView(bill)} title="View">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(bill)} title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(bill.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}