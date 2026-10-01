import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import BillsTable from "@/components/partal/BillsTable";
import BillDetailDialog from "@/components/partal/BillDetailDialog";
import { Plus } from "lucide-react";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fy, setFy] = useState("all");
  const [clientQuery, setClientQuery] = useState("");
  const [viewBill, setViewBill] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const all = await base44.entities.Bill.list("-created_date", 200);
    setBills(all);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const financialYears = useMemo(
    () => [...new Set(bills.map((b) => b.financial_year))].sort().reverse(),
    [bills]
  );

  const filtered = useMemo(
    () =>
      bills.filter(
        (b) =>
          (fy === "all" || b.financial_year === fy) &&
          (!clientQuery.trim() ||
            b.client_name.toLowerCase().includes(clientQuery.trim().toLowerCase()))
      ),
    [bills, fy, clientQuery]
  );

  const handleDelete = async () => {
    await base44.entities.Bill.delete(deleteId);
    setDeleteId(null);
    toast({ title: "Bill deleted" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Saved Bills</h1>
        <Button onClick={() => navigate("/entry")}>
          <Plus className="h-4 w-4 mr-2" />
          New Bill
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="w-full sm:w-56 space-y-1.5">
          <Label>Financial Year</Label>
          <Select value={fy} onValueChange={setFy}>
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {financialYears.map((year) => (
                <SelectItem key={year} value={year}>
                  FY {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-72 space-y-1.5">
          <Label>Client</Label>
          <Input
            placeholder="Search by client name…"
            value={clientQuery}
            onChange={(e) => setClientQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
          {bills.length === 0
            ? "No bills saved yet — create one from the Entry tab."
            : "No bills match these filters."}
        </div>
      ) : (
        <BillsTable
          bills={filtered}
          onView={setViewBill}
          onEdit={(bill) => navigate(`/entry?edit=${bill.id}`)}
          onPrint={(bill) => navigate(`/bill-print?id=${bill.id}`)}
          onDelete={setDeleteId}
        />
      )}

      <BillDetailDialog
        bill={viewBill}
        onClose={() => setViewBill(null)}
        onPrint={(bill) => navigate(`/bill-print?id=${bill.id}`)}
      />

      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this bill?</DialogTitle>
            <DialogDescription>
              This bill will be permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}