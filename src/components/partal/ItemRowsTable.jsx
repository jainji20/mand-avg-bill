import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { num, fmt } from "@/lib/parta";

export default function ItemRowsTable({
  rows,
  onChange,
  onDelete,
  onAdd,
  onEnter,
  setFieldRef,
}) {
  const handleKeyDown = (key) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.altKey) {
        onAdd(); // Alt+Enter adds a new row
      } else {
        onEnter(key);
      }
    }
  };

  return (
    <div className="rounded-lg border bg-card overflow-x-auto mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-3 py-2.5 font-medium w-14">S.No</th>
            <th className="px-3 py-2.5 font-medium text-right">Weight (Qtl)</th>
            <th className="px-3 py-2.5 font-medium text-right">Rate (per Qtl)</th>
            <th className="px-3 py-2.5 font-medium text-right">Amount</th>
            <th className="px-3 py-2.5 font-medium">Marka</th>
            <th className="px-3 py-2.5 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.uid} className="border-b last:border-0 hover:bg-muted/20">
              <td className="px-3 py-1.5 text-muted-foreground tabular-nums">{i + 1}</td>
              <td className="px-3 py-1.5">
                <Input
                  className="text-right h-8 border-0 bg-transparent focus-visible:ring-1"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  ref={setFieldRef(`w-${i}`)}
                  value={row.weight}
                  onChange={(e) => onChange(i, "weight", e.target.value)}
                  onKeyDown={handleKeyDown(`w-${i}`)}
                />
              </td>
              <td className="px-3 py-1.5">
                <Input
                  className="text-right h-8 border-0 bg-transparent focus-visible:ring-1"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  ref={setFieldRef(`r-${i}`)}
                  value={row.rate}
                  onChange={(e) => onChange(i, "rate", e.target.value)}
                  onKeyDown={handleKeyDown(`r-${i}`)}
                />
              </td>
              <td className="px-3 py-1.5 text-right font-medium tabular-nums">
                {fmt(num(row.weight) * num(row.rate))}
              </td>
              <td className="px-3 py-1.5">
                <Input
                  className="h-8 border-0 bg-transparent focus-visible:ring-1"
                  placeholder="e.g. 5 BA"
                  ref={setFieldRef(`m-${i}`)}
                  value={row.marka}
                  onChange={(e) => onChange(i, "marka", e.target.value)}
                  onKeyDown={handleKeyDown(`m-${i}`)}
                />
              </td>
              <td className="px-3 py-1.5">
                {rows.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onDelete(i)}
                    title="Delete row"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 border-t">
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Row
        </Button>
      </div>
    </div>
  );
}