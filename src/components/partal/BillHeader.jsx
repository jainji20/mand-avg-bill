import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function BillHeader({
  billDate,
  onDateChange,
  clients,
  clientName,
  onClientChange,
  itemName,
  onItemChange,
  invoiceNo,
  setFieldRef,
  onEnter,
}) {
  const selectedClient = clients.find((c) => c.client_name === clientName);

  const handleKeyDown = (key) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter(key);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="bill-date">Date</Label>
          <Input
            id="bill-date"
            type="date"
            ref={setFieldRef("bill-date")}
            value={billDate}
            onChange={(e) => onDateChange(e.target.value)}
            onKeyDown={handleKeyDown("bill-date")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bill-client">Client</Label>
          <Input
            id="bill-client"
            list="client-list"
            placeholder="Type or select client"
            ref={setFieldRef("bill-client")}
            value={clientName}
            onChange={(e) => onClientChange(e.target.value)}
            onKeyDown={handleKeyDown("bill-client")}
          />
          <datalist id="client-list">
            {clients.map((c) => (
              <option key={c.id} value={c.client_name} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bill-item">Item</Label>
          <Input
            id="bill-item"
            placeholder="e.g. Lahsan"
            ref={setFieldRef("bill-item")}
            value={itemName}
            onChange={(e) => onItemChange(e.target.value)}
            onKeyDown={handleKeyDown("bill-item")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Invoice No.</Label>
          <div className="h-9 px-3 flex items-center rounded-md border bg-muted/50 font-semibold tabular-nums">
            {invoiceNo}
          </div>
        </div>
      </div>
      {selectedClient && (
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline">{selectedClient.location}</Badge>
          <Badge variant="outline">Mandi Tax: {selectedClient.mandi_tax_percent}%</Badge>
          <Badge variant="outline">Commission: {selectedClient.commission_percent}%</Badge>
        </div>
      )}
    </div>
  );
}