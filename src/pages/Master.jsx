import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import ClientForm from "@/components/partal/ClientForm";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function Master() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // null | {} (new) | client (edit)

  const loadClients = async () => {
    setLoading(true);
    const list = await base44.entities.Client.list("-created_date");
    setClients(list);
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await base44.entities.Client.update(editing.id, data);
      } else {
        await base44.entities.Client.create(data);
      }
      setEditing(null);
      await loadClients();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Delete client "${client.client_name}"?`)) return;
    await base44.entities.Client.delete(client.id);
    await loadClients();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Client Master</h1>
          <p className="text-sm text-muted-foreground">
            Mandi tax and commission percentages auto-apply on bills
          </p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing({})}>
            <Plus className="h-4 w-4 mr-1" />
            Add Client
          </Button>
        )}
      </div>

      {editing && (
        <ClientForm
          initialData={editing?.id ? editing : null}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          saving={saving}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No clients yet. Click "Add Client" to create one.
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium">Client Name</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium text-right">Mandi Tax %</th>
                <th className="px-4 py-3 font-medium text-right">Commission %</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{client.client_name}</td>
                  <td className="px-4 py-3">{client.location}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{client.mandi_tax_percent}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{client.commission_percent}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(client)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(client)}
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
      )}
    </div>
  );
}