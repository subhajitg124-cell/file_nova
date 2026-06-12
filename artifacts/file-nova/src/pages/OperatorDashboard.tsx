/**
 * OperatorDashboard Component
 * Dedicated high-fidelity workspace for Cyber Cafe operators to manage multiple clients,
 * batch-process documents, customize workflows, and print customer transaction receipts.
 */

import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Users,
  Plus,
  Printer,
  Keyboard,
  UserPlus,
  CheckCircle2,
  Trash2,
  Zap,
  ChevronRight,
  TrendingUp,
  FolderSync,
  FileText,
  Clock,
  ChevronLeft,
  X,
  CreditCard,
  Layers
} from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string;
  scheme: string;
  status: "waiting" | "processing" | "completed";
  filesCount: number;
  cost: number;
  timeAdded: string;
}

export default function OperatorDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: "cust_1", name: "Rajesh Kumar", phone: "9876543210", scheme: "WBJEE 2026 Resizing", status: "waiting", filesCount: 3, cost: 50, timeAdded: "10:15 AM" },
    { id: "cust_2", name: "Priya Das", phone: "8765432109", scheme: "Aikyashree Scholarship", status: "processing", filesCount: 5, cost: 80, timeAdded: "10:30 AM" },
    { id: "cust_3", name: "Amit Banerjee", phone: "7654321098", scheme: "PAN Card + Aadhaar Masking", status: "completed", filesCount: 2, cost: 40, timeAdded: "09:45 AM" },
  ]);

  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(customers[1]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newScheme, setNewScheme] = useState("WBJEE 2026 Resizing");
  const [newCost, setNewCost] = useState(50);
  
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptCustomer, setReceiptCustomer] = useState<Customer | null>(null);
  
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + N -> Add new customer
      if (e.shiftKey && e.key.toUpperCase() === "N") {
        e.preventDefault();
        setShowAddModal(true);
      }
      // Shift + P -> Print Receipt for active customer
      if (e.shiftKey && e.key.toUpperCase() === "P") {
        e.preventDefault();
        if (activeCustomer) {
          handleOpenReceipt(activeCustomer);
        } else {
          toast.error("No active customer selected to print receipt.");
        }
      }
      // Shift + K -> Show shortcuts helper
      if (e.shiftKey && e.key.toUpperCase() === "K") {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCustomer]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) {
      toast.error("Name and Phone number are required.");
      return;
    }
    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      name: newName,
      phone: newPhone,
      scheme: newScheme,
      status: "waiting",
      filesCount: 0,
      cost: Number(newCost) || 30,
      timeAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setCustomers([newCust, ...customers]);
    setActiveCustomer(newCust);
    setShowAddModal(false);
    setNewName("");
    setNewPhone("");
    setNewScheme("WBJEE 2026 Resizing");
    setNewCost(50);
    toast.success(`Customer ${newName} added to queue!`);
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    if (confirm(`Remove ${name} from the queue?`)) {
      const filtered = customers.filter(c => c.id !== id);
      setCustomers(filtered);
      if (activeCustomer?.id === id) {
        setActiveCustomer(filtered[0] || null);
      }
      toast.info(`Customer profile deleted.`);
    }
  };

  const handleUpdateStatus = (id: string, nextStatus: Customer["status"]) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        return { ...c, status: nextStatus };
      }
      return c;
    });
    setCustomers(updated);
    if (activeCustomer?.id === id) {
      setActiveCustomer({ ...activeCustomer, status: nextStatus });
    }
    toast.success(`Status updated to ${nextStatus}.`);
  };

  const handleOpenReceipt = (cust: Customer) => {
    setReceiptCustomer(cust);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative print:bg-white print:text-black">
      {/* Background radial effects */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent pointer-events-none z-0" />

      {/* Header bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between lg:px-8 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition">
            <ChevronLeft className="h-4 w-4" />
            Pricing Plans
          </Link>
          <div className="h-px w-4 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-violet-500/10">
              <Layers className="h-full w-auto text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-violet-400">FileNova Elite</span>
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
              </div>
              <h1 className="text-sm font-bold text-white leading-none mt-0.5">Cyber Cafe Operator Console</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-slate-400 hover:text-white transition cursor-pointer"
            title="Shortcuts Panel"
          >
            <Keyboard className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-black text-white hover:opacity-90 shadow-md shadow-violet-500/10 transition cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Client</span>
          </button>
        </div>
      </header>

      {/* Main workspace layout */}
      <div className="flex-1 grid lg:grid-cols-[1fr_2.2fr] gap-6 p-4 lg:p-8 max-w-7xl mx-auto w-full relative z-10 print:p-0 print:block">
        
        {/* Left Column: Customer Queue */}
        <section className="bg-slate-900/40 border border-white/[0.06] rounded-3xl p-5 space-y-4 backdrop-blur-md flex flex-col justify-between max-h-[80vh] overflow-y-auto print:hidden">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-violet-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-wider">Client Queue ({customers.length})</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Shift Active
              </span>
            </div>

            <div className="space-y-2.5">
              {customers.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-slate-950/20">
                  <Users className="h-8 w-8 mx-auto text-slate-500 opacity-40 mb-2" />
                  <p className="text-xs font-bold text-slate-400">Queue is currently empty</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Click 'Add Client' to start queuing profiles.</p>
                </div>
              ) : (
                customers.map((c) => {
                  const isActive = activeCustomer?.id === c.id;
                  let statusColor = "bg-slate-800 text-slate-400 border-white/[0.04]";
                  if (c.status === "processing") statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse";
                  if (c.status === "completed") statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveCustomer(c)}
                      className={`group rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer relative ${
                        isActive
                          ? "border-violet-500 bg-violet-600/5 shadow-md shadow-violet-500/5"
                          : "border-white/[0.06] bg-slate-950/40 hover:bg-slate-950/80 hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-white truncate group-hover:text-violet-350 transition-colors">{c.name}</h3>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{c.phone}</p>
                        </div>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[8.5px] font-black uppercase ${statusColor}`}>
                          {c.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-white/[0.04] pt-2.5 mt-3 text-[10px] text-slate-400">
                        <span className="truncate max-w-[130px] font-medium">📋 {c.scheme}</span>
                        <span className="font-bold text-white">₹{c.cost}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-4 mt-4 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Aggregated Shift Revenue:</span>
            <span className="font-black text-emerald-400 text-sm">₹{customers.reduce((acc, c) => acc + c.cost, 0)}</span>
          </div>
        </section>

        {/* Right Column: Work Space / Actions Panel */}
        <section className="space-y-6 print:block">
          {activeCustomer ? (
            <>
              {/* Profile Card */}
              <div className="rounded-3xl border border-white/[0.06] bg-slate-900/40 p-6 backdrop-blur-md space-y-6 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.06]">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-violet-400">Active Working Client</span>
                    <h2 className="text-xl font-black text-white mt-1">{activeCustomer.name}</h2>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Mobile: <span className="font-mono">{activeCustomer.phone}</span> · Enrolled: {activeCustomer.timeAdded}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenReceipt(activeCustomer)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] px-3.5 py-2 text-xs font-bold text-slate-200 transition cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print Receipt</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(activeCustomer.id, activeCustomer.name)}
                      className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-rose-500/10 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Client Profile"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Info Fields / Service Details */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-slate-950/40 border border-white/[0.04] p-4 rounded-2xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Selected Scheme Preset</span>
                    <span className="text-xs font-bold text-white mt-1.5 block">📋 {activeCustomer.scheme}</span>
                  </div>
                  <div className="bg-slate-950/40 border border-white/[0.04] p-4 rounded-2xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Billed Charge Amount</span>
                    <span className="text-xs font-black text-emerald-400 mt-1.5 block">₹{activeCustomer.cost}</span>
                  </div>
                  <div className="bg-slate-950/40 border border-white/[0.04] p-4 rounded-2xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Change Operation Status</span>
                    <div className="mt-1.5 flex gap-1">
                      <select
                        title="Change Operation Status"
                        value={activeCustomer.status}
                        onChange={(e) => handleUpdateStatus(activeCustomer.id, e.target.value as any)}
                        className="bg-slate-900 border border-white/10 rounded-lg px-2 py-0.5 text-[10.5px] font-bold text-white outline-none"
                      >
                        <option value="waiting">Waiting</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Batch Resizer operations Panel */}
              <div className="rounded-3xl border border-white/[0.06] bg-slate-900/40 p-6 backdrop-blur-md space-y-4 text-left">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Quick Operator Actions</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Perform bulk resizing and compression operations for admission portals.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Resize to 20KB", desc: "For signature uploads", action: "compress-20" },
                    { label: "Resize to 50KB", desc: "For passport photographs", action: "compress-50" },
                    { label: "Aadhaar Masking", desc: "Redact digits automatically", action: "mask-aadhaar" },
                    { label: "Compile to ZIP", desc: "Merge active client documents", action: "zip-docs" },
                  ].map((act, index) => (
                    <button
                      key={index}
                      onClick={() => toast.success(`Simulating '${act.label}' action for ${activeCustomer.name}.`)}
                      className="rounded-2xl border border-white/[0.05] bg-slate-950/40 hover:bg-slate-950 hover:border-violet-500/40 p-4 transition-all text-left flex flex-col justify-between h-28 cursor-pointer group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-650 group-hover:text-white transition-colors">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block mt-2">{act.label}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{act.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Simulated file dropzone for bulk uploads */}
                <div className="border border-dashed border-white/10 bg-slate-950/30 rounded-2xl p-8 text-center space-y-2 mt-4 hover:border-violet-500/30 transition duration-300">
                  <div className="h-10 w-10 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-center mx-auto text-slate-400">
                    <FolderSync className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-white">Drag & drop client files here to batch process</p>
                  <p className="text-[10px] text-slate-500">Supports PDF, JPEG, PNG · Maximum 10 files simultaneously</p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-white/[0.06] bg-slate-900/40 p-12 backdrop-blur-md text-center text-slate-400">
              <Users className="h-12 w-12 mx-auto text-violet-400/40 mb-4 animate-pulse" />
              <h3 className="text-base font-bold text-white">No active client selected</h3>
              <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto">Select a client from the left queue dashboard or add a new customer to launch the document workspace.</p>
            </div>
          )}
        </section>
      </div>

      {/* ── MODALS SECTION ── */}

      {/* Modal 1: Add Customer */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print:hidden">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-[#0d1323] p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-lg border border-white/10 hover:bg-white/5 flex items-center justify-center transition cursor-pointer text-slate-400 hover:text-white"
              title="Close Modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-left space-y-1">
              <h3 className="text-lg font-black text-white">Queue New Client</h3>
              <p className="text-xs text-slate-400">Add customer metadata and form preset settings to the queue.</p>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label htmlFor="client-name" className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Customer Name</label>
                <input
                  id="client-name"
                  type="text"
                  placeholder="e.g. Subhajit Ghosh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="client-phone" className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone / WhatsApp Number</label>
                <input
                  id="client-phone"
                  type="text"
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="client-scheme" className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Scheme / Document preset</label>
                <select
                  id="client-scheme"
                  value={newScheme}
                  onChange={(e) => setNewScheme(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-violet-500"
                >
                  <option value="WBJEE 2026 Resizing">WBJEE 2026 Resizing</option>
                  <option value="JEE Main Photo Crop">JEE Main Photo Crop</option>
                  <option value="NEET Application Set">NEET Application Set</option>
                  <option value="Aikyashree Scholarship">Aikyashree Scholarship</option>
                  <option value="PAN Card + Aadhaar Masking">PAN Card + Aadhaar Masking</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="client-charge" className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Billed Service Cost (₹)</label>
                <input
                  id="client-charge"
                  type="number"
                  placeholder="50"
                  value={newCost}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-violet-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-black text-white hover:opacity-90 transition shadow-md shadow-violet-500/10 cursor-pointer"
              >
                Add Customer Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Shortcuts Helper */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print:hidden">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-[#0d1323] p-6 shadow-2xl space-y-4 text-left">
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-lg border border-white/10 hover:bg-white/5 flex items-center justify-center transition cursor-pointer text-slate-400 hover:text-white"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-black text-white">Keyboard Shortcuts Console</h3>
            <p className="text-xs text-slate-400">Boost your workflow speed with global hotkeys.</p>

            <div className="space-y-2.5 border-t border-white/[0.05] pt-3 text-xs">
              {[
                { keys: ["Shift", "N"], desc: "Open new client form modal" },
                { keys: ["Shift", "P"], desc: "Print receipt for active customer" },
                { keys: ["Shift", "K"], desc: "Toggle keyboard shortcuts help" },
                { keys: ["Esc"], desc: "Close any open modal window" },
              ].map((sc, index) => (
                <div key={index} className="flex justify-between items-center py-1.5 border-b border-white/[0.02]">
                  <span className="font-semibold text-slate-350">{sc.desc}</span>
                  <div className="flex gap-1">
                    {sc.keys.map((k) => (
                      <kbd key={k} className="bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-white font-bold">{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Receipt Print View */}
      {showReceiptModal && receiptCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print:p-0 print:absolute print:inset-0 print:bg-white print:text-black">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-slate-900 p-6 shadow-2xl space-y-6 print:border-none print:bg-white print:p-0 print:text-black text-left">
            
            {/* Close Button - hidden in print */}
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-lg border border-white/10 hover:bg-white/5 flex items-center justify-center transition cursor-pointer text-slate-400 hover:text-white print:hidden"
              title="Close Modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Receipt Invoice Sheet */}
            <div id="receipt-invoice-sheet" className="space-y-4">
              <div className="text-center pb-4 border-b border-white/10 print:border-black/15">
                <h2 className="text-lg font-black text-white print:text-black">FILENOVA CYBER SERVICE RECEIPT</h2>
                <p className="text-[10px] text-slate-400 print:text-black/60 font-semibold mt-0.5">High-Speed Digital Document Hub</p>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs border-b border-white/10 print:border-black/15 pb-4">
                <span className="text-slate-400 print:text-black/60 font-semibold">Receipt Number:</span>
                <span className="text-white print:text-black font-mono font-bold text-right">#FN-{receiptCustomer.id.toUpperCase().slice(-6)}</span>

                <span className="text-slate-400 print:text-black/60 font-semibold">Date / Time:</span>
                <span className="text-white print:text-black font-semibold text-right">{new Date().toLocaleDateString("en-IN")} · {receiptCustomer.timeAdded}</span>

                <span className="text-slate-400 print:text-black/60 font-semibold">Operator:</span>
                <span className="text-white print:text-black font-semibold text-right">Console Mode</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-500 print:text-black/60 uppercase tracking-wider block">Customer Details</span>
                <div className="rounded-xl bg-slate-950/40 border border-white/[0.04] p-3 text-xs space-y-1.5 print:bg-slate-100 print:border-black/10">
                  <div className="flex justify-between">
                    <span className="text-slate-450 print:text-black/60 font-medium">Name:</span>
                    <span className="font-bold text-white print:text-black">{receiptCustomer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450 print:text-black/60 font-medium">Phone:</span>
                    <span className="font-mono text-white print:text-black font-bold">{receiptCustomer.phone}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-white/10 print:border-black/15 pt-4">
                <span className="text-[10px] font-black text-slate-500 print:text-black/60 uppercase tracking-wider block">Rendered Services</span>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-350 print:text-black font-semibold">📋 {receiptCustomer.scheme}</span>
                  <span className="font-bold text-white print:text-black">₹{receiptCustomer.cost}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline border-t border-dashed border-white/10 print:border-black/15 pt-4">
                <span className="text-xs font-black text-white print:text-black">Total Paid (Inc. GST)</span>
                <span className="text-lg font-black text-emerald-400 print:text-black">₹{receiptCustomer.cost}</span>
              </div>

              <div className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3 py-2 text-[10px] font-black text-emerald-400 print:border-black/10 print:text-black print:bg-slate-100">
                <CreditCard className="h-4.5 w-4.5" /> PAID VIA CASH / UPI ON DELIVERY
              </div>
            </div>

            {/* Print trigger - hidden in print */}
            <div className="flex gap-2 border-t border-white/10 pt-4 print:hidden">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-3 rounded-xl border border-white/[0.08] hover:bg-white/5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-505 text-white font-black text-xs shadow-lg shadow-violet-500/10 cursor-pointer transition"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
