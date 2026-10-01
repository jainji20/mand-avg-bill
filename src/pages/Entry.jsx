import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Save, Printer } from "lucide-react";
import BillHeader from "@/components/partal/BillHeader";
import ItemRowsTable from "@/components/partal/ItemRowsTable";
import BillTotals from "@/components/partal/BillTotals";
import ExpensesPanel from "@/components/partal/ExpensesPanel";
import BillSummary from "@/components/partal/BillSummary";
import { financialYear, markaBags, num, fmt, round2 } from "@/lib/parta";

let uidCounter = 1;
const newRow = () => ({ uid: uidCounter++, weight: "", rate: "", marka: "" });
const EMPTY_EXPENSES = {
  bardana_bags: "",
  bardana_rate: "",
  sutali: "",
  labour: "",
  hammali: "",
};

export default function Entry() {
  const [clients, setClients] = useState([]);
  const [rows, setRows] = useState([newRow()]);
  const [expenses, setExpenses] = useState(EMPTY_EXPENSES);
  const [mandiTaxPct, setMandiTaxPct] = useState("");
  const [commissionPct, setCommissionPct] = useState("");
  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0, 10));
  const [clientName, setClientName] = useState("");
  const [itemName, setItemName] = useState("");
  const [invoiceNo, setInvoiceNo] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const editId = new URLSearchParams(window.location.search).get("edit");
  const prefilling = useRef(false);

  const fieldRefs = useRef({});
  const pendingFocus = useRef(null);
  const setFieldRef = (key) => (el) => {
    fieldRefs.current[key] = el;
  };

  useEffect(() => {
    (async () => {
      setClients(await base44.entities.Client.list("client_name"));
      setLoading(false);
      fieldRefs.current["bill-date"]?.focus();
    })();
  }, []);

  // Next invoice number resets each financial year (not while editing a saved bill)
  useEffect(() => {
    if (!editId) refreshInvoiceNo(billDate);
  }, [billDate]);

  // Edit mode: load the saved bill into the form
  useEffect(() => {
    if (!editId) return;
    (async () => {
      prefilling.current = true;
      const bill = await base44.entities.Bill.get(editId);
      setBillDate(bill.bill_date);
      setClientName(bill.client_name);
      setItemName(bill.item_name || "");
      setInvoiceNo(bill.invoice_no);
      setRows(
        (bill.lines || []).map((l) => ({
          uid: uidCounter++,
          weight: l.weight ?? "",
          rate: l.rate ?? "",
          marka: l.marka ?? "",
        }))
      );
      setExpenses({
        bardana_bags: bill.bardana_bags ?? "",
        bardana_rate: bill.bardana_rate ?? "",
        sutali: bill.sutali ?? "",
        labour: bill.labour ?? "",
        hammali: bill.hammali ?? "",
      });
      setMandiTaxPct(bill.mandi_tax_percent ?? "");
      setCommissionPct(bill.commission_percent ?? "");
    })();
  }, [editId]);

  const refreshInvoiceNo = async (date) => {
    const fyBills = await base44.entities.Bill.filter({ financial_year: financialYear(date) });
    const maxNo = fyBills.reduce((m, b) => Math.max(m, b.invoice_no || 0), 0);
    setInvoiceNo(maxNo + 1);
  };

  useEffect(() => {
    if (pendingFocus.current) {
      fieldRefs.current[pendingFocus.current]?.focus();
      pendingFocus.current = null;
    }
  }, [rows]);

  const selectedClient = clients.find((c) => c.client_name === clientName);

  // Auto-fill from client master, still editable per bill for special cases
  useEffect(() => {
    if (prefilling.current) {
      prefilling.current = false; // keep the saved bill's own percentages when editing
      return;
    }
    if (selectedClient) {
      setMandiTaxPct(selectedClient.mandi_tax_percent ?? "");
      setCommissionPct(selectedClient.commission_percent ?? "");
    }
  }, [clientName]);

  const itemTotals = rows.reduce(
    (acc, r) => ({
      totalWeight: acc.totalWeight + num(r.weight),
      totalAmount: acc.totalAmount + round2(num(r.weight) * num(r.rate)),
      totalBags: acc.totalBags + markaBags(r.marka),
    }),
    { totalWeight: 0, totalAmount: 0, totalBags: 0 }
  );

  const exp = {
    bardana: round2(num(expenses.bardana_bags) * num(expenses.bardana_rate)),
    mandi: round2((itemTotals.totalAmount * num(mandiTaxPct)) / 100),
    sutali: num(expenses.sutali),
    labour: num(expenses.labour),
    hammali: num(expenses.hammali),
  };
  exp.commission = round2(
    ((itemTotals.totalAmount + exp.bardana + exp.mandi + exp.sutali + exp.labour + exp.hammali) *
      num(commissionPct)) /
      100
  );
  exp.total = round2(exp.bardana + exp.mandi + exp.sutali + exp.labour + exp.hammali + exp.commission);

  // Grand total is always rounded UP to the whole rupee
  const grandTotal = Math.ceil(itemTotals.totalAmount + exp.total);
  const partaWithout = itemTotals.totalWeight > 0
    ? round2(itemTotals.totalAmount / itemTotals.totalWeight)
    : 0;
  const partaWith = itemTotals.totalWeight > 0 ? round2(grandTotal / itemTotals.totalWeight) : 0;

  const focusOrder = [
    "bill-date",
    "bill-client",
    "bill-item",
    ...rows.flatMap((_, i) => [`w-${i}`, `r-${i}`, `m-${i}`]),
    "exp-bardana_bags",
    "exp-bardana_rate",
    "exp-sutali",
    "exp-labour",
    "exp-hammali",
    "exp-mandi_tax",
    "exp-commission",
    "save-btn",
  ];

  const advanceFocus = (key) => {
    // Enter on the last Marka adds the next row (when the row has data)
    if (key.startsWith("m-")) {
      const i = Number(key.slice(2));
      const row = rows[i];
      if (i === rows.length - 1 && (num(row?.weight) > 0 || num(row?.rate) > 0)) {
        addRow();
        return;
      }
    }
    const idx = focusOrder.indexOf(key);
    fieldRefs.current[focusOrder[idx + 1]]?.focus();
  };

  const addRow = () => {
    setRows((rs) => [...rs, newRow()]);
    pendingFocus.current = `w-${rows.length}`;
  };

  const updateRow = (i, key, value) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));

  const deleteRow = (i) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));

  const handleSave = async (printAfter = false) => {
    if (!selectedClient) {
      toast({ title: "Select a client before saving", variant: "destructive" });
      fieldRefs.current["bill-client"]?.focus();
      return;
    }
    const lines = rows
      .filter((r) => num(r.weight) > 0 || num(r.rate) > 0 || String(r.marka).trim())
      .map((r) => ({
        weight: num(r.weight),
        rate: num(r.rate),
        amount: round2(num(r.weight) * num(r.rate)),
        marka: String(r.marka || "").trim(),
      }));
    if (lines.length === 0 || num(itemTotals.totalWeight) === 0) {
      toast({ title: "Add at least one row with weight", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        invoice_no: invoiceNo,
        financial_year: financialYear(billDate),
        bill_date: billDate,
        client_id: selectedClient.id,
        client_name: selectedClient.client_name,
        location: selectedClient.location,
        item_name: itemName.trim(),
        lines,
        mandi_tax_percent: num(mandiTaxPct),
        commission_percent: num(commissionPct),
        bardana_bags: num(expenses.bardana_bags),
        bardana_rate: num(expenses.bardana_rate),
        sutali: exp.sutali,
        labour: exp.labour,
        hammali: exp.hammali,
        total_weight: itemTotals.totalWeight,
        total_amount: itemTotals.totalAmount,
        total_bags: itemTotals.totalBags,
        mandi_tax_amount: exp.mandi,
        bardana_amount: exp.bardana,
        commission_amount: exp.commission,
        total_expenses: exp.total,
        grand_total: grandTotal,
        parta_without_expenses: partaWithout,
        parta_with_expenses: partaWith,
      };
      if (editId) {
        await base44.entities.Bill.update(editId, payload);
        toast({
          title: `Bill ${invoiceNo} updated`,
          description: `Grand Total: ₹ ${fmt(grandTotal)}`,
        });
        if (printAfter) {
          navigate(`/bill-print?id=${editId}`);
        } else {
          navigate("/bills");
        }
        return;
      }
      const created = await base44.entities.Bill.create(payload);
      toast({
        title: `Bill ${invoiceNo} saved`,
        description: `Grand Total: ₹ ${fmt(grandTotal)}`,
      });
      if (printAfter) {
        navigate(`/bill-print?id=${created.id}`);
        return;
      }
      // Reset for the next bill
      setRows([newRow()]);
      setExpenses(EMPTY_EXPENSES);
      setClientName("");
      setItemName("");
      setMandiTaxPct("");
      setCommissionPct("");
      await refreshInvoiceNo(billDate);
      fieldRefs.current["bill-date"]?.focus();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">
        {editId ? `Edit Bill ${invoiceNo}` : "New Bill"}
      </h1>
      <BillHeader
        billDate={billDate}
        onDateChange={setBillDate}
        clients={clients}
        clientName={clientName}
        onClientChange={setClientName}
        itemName={itemName}
        onItemChange={setItemName}
        invoiceNo={invoiceNo}
        setFieldRef={setFieldRef}
        onEnter={advanceFocus}
      />
      <ItemRowsTable
        rows={rows}
        onChange={updateRow}
        onDelete={deleteRow}
        onAdd={addRow}
        onEnter={advanceFocus}
        setFieldRef={setFieldRef}
      />
      <BillTotals
        totalWeight={itemTotals.totalWeight}
        totalAmount={itemTotals.totalAmount}
        totalBags={itemTotals.totalBags}
      />
      <div className="mt-6">
        <ExpensesPanel
          expenses={expenses}
          onChange={(key, value) => setExpenses((x) => ({ ...x, [key]: value }))}
          setFieldRef={setFieldRef}
          onEnter={advanceFocus}
          bardanaAmount={exp.bardana}
          mandiTaxPct={mandiTaxPct}
          commissionPct={commissionPct}
          onPercentChange={(key, value) =>
            key === "mandi_tax" ? setMandiTaxPct(value) : setCommissionPct(value)
          }
          mandiTaxAmount={exp.mandi}
          commissionAmount={exp.commission}
        />
        <BillSummary
          totalAmount={itemTotals.totalAmount}
          totalExpenses={exp.total}
          grandTotal={grandTotal}
          partaWithout={partaWithout}
          partaWith={partaWith}
        />
      </div>
      <div className="mt-6 flex items-center justify-end gap-4">
        <p className="text-xs text-muted-foreground hidden sm:block">
          Enter moves to the next field · Enter on the last Marka adds a new row · Alt+Enter adds a row anywhere
        </p>
        <Button
          size="lg"
          variant="outline"
          onClick={() => handleSave(false)}
          disabled={saving}
          className="min-w-40"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : editId ? `Update Bill ${invoiceNo}` : `Save Bill ${invoiceNo}`}
        </Button>
        <Button
          size="lg"
          onClick={() => handleSave(true)}
          disabled={saving}
          className="min-w-40"
        >
          <Printer className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : editId ? "Update & Print" : "Save & Print"}
        </Button>
      </div>
    </div>
  );
}