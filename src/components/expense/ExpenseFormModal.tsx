import React, { useState, useEffect } from 'react';
import { X, Plus, Tag, Calendar, CreditCard, Banknote, Smartphone, Building2, AlertCircle, Receipt, DollarSign, Edit3 } from 'lucide-react';
import type { Expense } from '../../types';
import { useApp } from '../../context/AppContext';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
}) => {
  const { expenseCategories, addExpenseCategory, addExpense, updateExpense } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(expenseCategories[0] || 'Rent');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('cash');
  const [notes, setNotes] = useState('');
  const [vendor, setVendor] = useState('');
  const [error, setError] = useState('');

  // Inline add category state
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setShowAddCat(false);
    setNewCatName('');

    if (expenseToEdit) {
      setTitle(expenseToEdit.title || expenseToEdit.description || '');
      setCategory(expenseToEdit.category || 'Other');
      setAmount(expenseToEdit.amount || '');
      setDate(expenseToEdit.date || new Date().toISOString().slice(0, 10));
      setPaymentMethod(expenseToEdit.paymentMethod || 'cash');
      setNotes(expenseToEdit.notes || '');
      setVendor(expenseToEdit.vendor || '');
    } else {
      setTitle('');
      setCategory(expenseCategories[0] || 'Rent');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('cash');
      setNotes('');
      setVendor('');
    }
  }, [isOpen, expenseToEdit, expenseCategories]);

  if (!isOpen) return null;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addExpenseCategory(newCatName.trim());
    setCategory(newCatName.trim());
    setNewCatName('');
    setShowAddCat(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an expense title or description.');
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter an expense amount greater than ₹0.');
      return;
    }

    if (expenseToEdit) {
      updateExpense({
        ...expenseToEdit,
        title: title.trim(),
        description: title.trim(),
        category,
        amount: numAmount,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
        vendor: vendor.trim() || undefined,
      });
    } else {
      addExpense({
        title: title.trim(),
        description: title.trim(),
        category,
        amount: numAmount,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
        vendor: vendor.trim() || undefined,
        status: 'recorded',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-scale-up my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              {expenseToEdit ? <Edit3 className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg tracking-tight">
                {expenseToEdit ? 'Edit Expense Record' : 'Record Business Expense'}
              </h3>
              <p className="text-xs text-rose-200/80">Store operating & daily expenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Expense Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expense Title / Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Shop monthly electricity bill, Packaging boxes"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-base text-xs sm:text-sm font-medium"
              required
            />
          </div>

          {/* Category Selector + Add New Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Category <span className="text-red-500">*</span>
              </label>
              {!showAddCat && (
                <button
                  type="button"
                  onClick={() => setShowAddCat(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Category
                </button>
              )}
            </div>

            {showAddCat ? (
              <div className="flex items-center gap-1.5 p-2 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="input-base text-xs py-1.5 flex-1 bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="btn-primary text-xs px-3 py-1.5 shrink-0"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCat(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="input-base text-xs"
              >
                {expenseCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="input-base pl-8 font-mono font-bold text-sm text-rose-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="input-base text-xs"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Paid Via <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
                { id: 'upi', label: 'UPI / QR', icon: <Smartphone className="w-4 h-4" /> },
                { id: 'card', label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'other', label: 'Other', icon: <Building2 className="w-4 h-4" /> },
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === m.id
                      ? 'border-rose-600 bg-rose-50/70 text-rose-700 shadow-sm ring-1 ring-rose-500 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vendor / Supplier (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor / Recipient <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. BESCOM, landlord name"
                value={vendor}
                onChange={e => setVendor(e.target.value)}
                className="input-base text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Receipt #543"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="input-base text-xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs px-6 py-2 gap-1.5 shadow-md shadow-rose-500/20 bg-rose-600 hover:bg-rose-700 border-rose-600"
            >
              <Receipt className="w-3.5 h-3.5" />
              {expenseToEdit ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
