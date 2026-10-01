import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X } from "lucide-react";

const FIELDS = [
  { key: "client_name", label: "Client Name", type: "text", placeholder: "e.g. Shree Rishabh Trading Co" },
  { key: "location", label: "Location (City)", type: "text", placeholder: "e.g. Bilimora" },
  { key: "mandi_tax_percent", label: "Mandi Tax %", type: "number", placeholder: "e.g. 1.5" },
  { key: "commission_percent", label: "Commission %", type: "number", placeholder: "e.g. 3" },
];

export default function ClientForm({ initialData, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    client_name: "",
    location: "",
    mandi_tax_percent: "",
    commission_percent: "",
    ...(initialData || {}),
  });
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () => {
    if (!String(form.client_name).trim()) {
      setError("Client name is required");
      inputRefs.current[0]?.focus();
      return;
    }
    setError("");
    onSave({
      client_name: String(form.client_name).trim(),
      location: String(form.location || "").trim(),
      mandi_tax_percent: parseFloat(form.mandi_tax_percent) || 0,
      commission_percent: parseFloat(form.commission_percent) || 0,
    });
  };

  const handleKeyDown = (idx) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (idx < FIELDS.length - 1) {
        inputRefs.current[idx + 1]?.focus();
      } else {
        submit();
      }
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 mb-6">
      <h2 className="font-heading font-semibold mb-4">
        {initialData ? "Edit Client" : "Add Client"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FIELDS.map((field, idx) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              ref={(el) => (inputRefs.current[idx] = el)}
              type={field.type}
              step="any"
              placeholder={field.placeholder}
              value={form[field.key]}
              onChange={handleChange(field.key)}
              onKeyDown={handleKeyDown(idx)}
              autoFocus={idx === 0}
            />
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      <div className="flex gap-2 mt-4">
        <Button onClick={submit} disabled={saving}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Saving..." : initialData ? "Update" : "Save"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Tip: press Enter to move to the next field
      </p>
    </div>
  );
}