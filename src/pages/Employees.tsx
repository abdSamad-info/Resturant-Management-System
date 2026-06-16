import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Employee, SalaryHistory } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  CheckCircle, 
  Coins, 
  Calendar, 
  Phone, 
  UserPlus, 
  ChevronRight, 
  History, 
  User, 
  DollarSign,
  Search,
  Check,
  X
} from 'lucide-react';

export default function Employees() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Interactive Form controls
  const [isAdding, setIsAdding] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Advance Panel controls
  const [advanceTargetId, setAdvanceTargetId] = useState<string | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState('');

  // Increment Panel controls
  const [incrementTargetId, setIncrementTargetId] = useState<string | null>(null);
  const [incrementType, setIncrementType] = useState<'fixed' | 'percentage'>('fixed');
  const [incrementValue, setIncrementValue] = useState('');
  const [incrementRemarks, setIncrementRemarks] = useState('');

  // History Drawer controls
  const [historyTargetId, setHistoryTargetId] = useState<string | null>(null);

  // New Employee state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState('Chef');
  const [newSalaryType, setNewSalaryType] = useState<'daily' | 'monthly'>('monthly');
  const [newSalaryAmount, setNewSalaryAmount] = useState('');

  // Edit Employee state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSalaryType, setEditSalaryType] = useState<'daily' | 'monthly'>('monthly');
  const [editSalaryAmount, setEditSalaryAmount] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Queries
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: apiService.getEmployees
  });

  const { data: activeSalaryHistory = [] } = useQuery({
    queryKey: ['salaryHistory', historyTargetId],
    queryFn: () => historyTargetId ? apiService.getSalaryHistory(historyTargetId) : Promise.resolve([]),
    enabled: !!historyTargetId
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: apiService.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      showSuccess('Employee registered successfully!');
      setIsAdding(false);
      resetAddForm();
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to register employee')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Employee> }) => apiService.updateEmployee(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      showSuccess('Employee profile updated successfully!');
      setEditingEmployee(null);
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to update employee')
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      showSuccess('Employee profile purged successfully!');
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to delete employee')
  });

  const advanceMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => apiService.giveAdvance(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      showSuccess('Advance wage loan allocated successfully!');
      setAdvanceTargetId(null);
      setAdvanceAmount('');
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to allocate advance')
  });

  const clearAdvanceMutation = useMutation({
    mutationFn: apiService.clearAdvance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      showSuccess('Advance loan ledger settled cleanly!');
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to settle advance balance')
  });

  const incrementMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { incrementType: 'fixed' | 'percentage'; incrementValue: number; remarks?: string } }) => apiService.addIncrement(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      showSuccess('Scale promotion authorized successfully!');
      setIncrementTargetId(null);
      setIncrementValue('');
      setIncrementRemarks('');
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to apply increment')
  });

  const isMutating = createMutation.isPending || 
                     updateMutation.isPending || 
                     deleteMutation.isPending || 
                     advanceMutation.isPending || 
                     clearAdvanceMutation.isPending || 
                     incrementMutation.isPending;

  const resetAddForm = () => {
    setNewName('');
    setNewPhone('');
    setNewCategory('Chef');
    setNewSalaryType('monthly');
    setNewSalaryAmount('');
  };

  const startEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditName(emp.name);
    setEditPhone(emp.phone);
    setEditCategory(emp.category);
    setEditSalaryType(emp.salaryType);
    setEditSalaryAmount(String(emp.currentSalary));
    setEditIsActive(emp.isActive);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const sal = Number(newSalaryAmount);
    if (isNaN(sal) || sal <= 0) {
      showError('Compensation must be a valid positive amount.');
      return;
    }
    createMutation.mutate({
      name: newName,
      phone: newPhone,
      category: newCategory,
      salaryType: newSalaryType,
      dailyWage: newSalaryType === 'daily' ? sal : undefined,
      monthlySalary: newSalaryType === 'monthly' ? sal : undefined
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    const sal = Number(editSalaryAmount);
    if (isNaN(sal) || sal <= 0) {
      showError('Compensation must be a valid positive amount.');
      return;
    }

    updateMutation.mutate({
      id: editingEmployee._id,
      payload: {
        name: editName,
        phone: editPhone,
        category: editCategory,
        salaryType: editSalaryType,
        dailyWage: editSalaryType === 'daily' ? sal : undefined,
        monthlySalary: editSalaryType === 'monthly' ? sal : undefined,
        isActive: editIsActive
      }
    });
  };

  // Delete confirmation states
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmationId(id);
    setDeleteConfirmationName(name);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
      deleteMutation.mutate(deleteConfirmationId, {
        onSuccess: () => {
          setDeleteConfirmationId(null);
          setDeleteConfirmationName('');
        }
      });
    }
  };

  const handleGiveAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceTargetId) return;
    const amt = Number(advanceAmount);
    if (isNaN(amt) || amt <= 0) {
      showError('Advance level must be a positive number.');
      return;
    }
    advanceMutation.mutate({ id: advanceTargetId, amount: amt });
  };

  const handleApplyIncrement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incrementTargetId) return;
    const val = Number(incrementValue);
    if (isNaN(val) || val <= 0) {
      showError('Increment value must be a positive number.');
      return;
    }
    incrementMutation.mutate({
      id: incrementTargetId,
      payload: {
        incrementType,
        incrementValue: val,
        remarks: incrementRemarks
      }
    });
  };

  const handleClearAdvanceDeficit = (id: string, name: string) => {
    clearAdvanceMutation.mutate(id);
  };

  // Searching and Filtering
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        emp.phone.includes(searchTerm) || 
                        emp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'All' || emp.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const categories = ['All', 'Chef', 'Waiter', 'Cleaner', 'Manager'];

  return (
    <div className="space-y-8 relative">
      {/* Syncing/Updating overlay loader */}
      {isMutating && (
        <div id="staff-sync-loading-overlay" className="fixed inset-0 bg-slate-900/35 backdrop-blur-[1px] z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white px-6 py-4.5 rounded-2xl shadow-xl flex items-center gap-3.5 border border-slate-100">
            <div className="h-5 w-5 rounded-full border-2 border-[#166534] border-t-transparent animate-spin" />
            <span className="text-xs font-bold text-slate-800">Processing background registration & updates...</span>
          </div>
        </div>
      )}

      {/* Upper Brand Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-slate-900 tracking-tight text-3xl">Staff Registry & Payroll</h1>
          <p className="text-xs text-slate-500 font-medium mt-1.5">Manage employee profiles, compensation models, advance loan ledgers, and scale upgrades.</p>
        </div>
        <button
          id="btn-trigger-add-employee"
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingEmployee(null);
          }}
          className="bg-[#166534] text-white rounded-xl px-4 py-2.5 hover:bg-[#11552a] active:bg-[#0c3e1e] shadow-sm text-xs font-bold flex items-center gap-2 self-start cursor-pointer transition-colors"
        >
          {isAdding ? <X className="h-4 w-4 shrink-0" /> : <UserPlus className="h-4 w-4 shrink-0" />}
          <span>{isAdding ? 'Close Panel' : 'Register Employee'}</span>
        </button>
      </div>

      {/* Add Employee Form Drawer */}
      {isAdding && (
        <div id="add-employee-panel" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-display font-bold text-slate-800 text-base mb-4">Register New Employee</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Full Name</label>
              <input
                id="input-new-name"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Muhammad Ali"
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none transition-colors font-medium bg-slate-50/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Phone Contact</label>
              <input
                id="input-new-phone"
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+923001234567"
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none transition-colors font-medium bg-slate-50/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Designation / Role</label>
              <select
                id="select-new-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none bg-white font-semibold transition-colors"
              >
                <option value="Chef">Chef</option>
                <option value="Waiter">Waiter</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Compensation Model</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewSalaryType('monthly')}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${newSalaryType === 'monthly' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-500'}`}
                >
                  Monthly Scale
                </button>
                <button
                  type="button"
                  onClick={() => setNewSalaryType('daily')}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${newSalaryType === 'daily' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-500'}`}
                >
                  Daily Wage
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">
                {newSalaryType === 'monthly' ? 'Monthly Salary (Rs)' : 'Daily Wage (Rs)'}
              </label>
              <input
                id="input-new-salary"
                type="number"
                required
                value={newSalaryAmount}
                onChange={(e) => setNewSalaryAmount(e.target.value)}
                placeholder={newSalaryType === 'monthly' ? '45000' : '800'}
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none transition-colors font-medium"
              />
            </div>
            <div className="flex items-end">
              <button
                id="btn-submit-new-employee"
                type="submit"
                className="w-full bg-[#166534] hover:bg-[#11552a] text-white rounded-xl py-2.5 shadow-sm font-bold text-xs cursor-pointer transition-colors"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Employee Form Drawer */}
      {editingEmployee && (
        <div id="edit-employee-panel" className="bg-white p-6 rounded-3xl border-2 border-[#166534]/15 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-slate-800 text-base">Modify Profile: {editingEmployee.name}</h3>
            <button 
              onClick={() => setEditingEmployee(null)}
              className="text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block font-sans">Full Name</label>
              <input
                id="input-edit-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none font-medium transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block font-sans">Phone contact</label>
              <input
                id="input-edit-phone"
                type="text"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none font-medium transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block font-sans">Category Selection</label>
              <select
                id="select-edit-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none bg-white font-semibold transition-colors animate-none"
              >
                <option value="Chef">Chef</option>
                <option value="Waiter">Waiter</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block font-sans">Deficit Active Toggle</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditIsActive(true)}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${editIsActive ? 'bg-[#166534] text-white shadow-xs' : 'text-slate-500 hover:text-slate-650'}`}
                >
                  Active Staff
                </button>
                <button
                  type="button"
                  onClick={() => setEditIsActive(false)}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${!editIsActive ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-650'}`}
                >
                  On Leave
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block font-sans">Compensation Model</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  disabled
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg ${editSalaryType === 'monthly' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400'}`}
                >
                  Monthly Scale
                </button>
                <button
                  type="button"
                  disabled
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg ${editSalaryType === 'daily' ? 'bg-white text-slate-800 shadow-xs text-slate-400' : 'text-slate-400'}`}
                >
                  Daily Wage
                </button>
              </div>
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block font-sans">Compensation Base (Rs.) (Unadjusted base rate)</label>
              <input
                id="input-edit-salary"
                type="number"
                required
                value={editSalaryAmount}
                onChange={(e) => setEditSalaryAmount(e.target.value)}
                className="w-full text-sm border border-slate-200 hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none font-semibold transition-colors"
              />
            </div>
            <div className="flex items-end">
              <button
                id="btn-edit-employee-submit"
                type="submit"
                className="w-full bg-[#166534] hover:bg-[#11552a] text-white rounded-xl py-2.5 shadow-sm font-bold text-xs cursor-pointer transition-all"
              >
                Confirm Updates
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Advance Cash Allocation Modal Frame/Overlay */}
      {advanceTargetId && (
        <div id="advance-form-panel" className="bg-amber-50/60 border border-amber-200/80 p-6 rounded-3xl max-w-md shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-amber-900 text-sm flex items-center gap-2">
              <Coins className="h-4 w-4 shrink-0 text-amber-700" />
              <span>Allocate Advance Cash</span>
            </h3>
            <button onClick={() => setAdvanceTargetId(null)} className="text-amber-700 hover:text-amber-900 p-1">
              <X className="h-4 w-4 shrink-0" />
            </button>
          </div>
          <form onSubmit={handleGiveAdvance} className="space-y-3">
            <p className="text-xs text-amber-950/80 font-medium leading-relaxed font-sans">Input amount given in advance. It will be recorded inside employee profile balance sheet and deducted synchronously on payouts.</p>
            <div className="flex gap-3">
              <input
                id="input-advance-amount"
                type="number"
                required
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                placeholder="Rs. 5000"
                className="flex-1 text-sm border border-amber-250 focus:border-amber-500 rounded-xl p-2.5 bg-white outline-none font-semibold transition-all"
              />
              <button 
                id="btn-submit-advance"
                type="submit"
                className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl px-4 py-2.5 cursor-pointer transition-colors"
              >
                Log Loan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Salary Increment Action Plate */}
      {incrementTargetId && (
        <div id="increment-form-panel" className="bg-[#166534]/5 border border-[#166534]/10 p-6 rounded-3xl max-w-lg shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-[#166534] text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 shrink-0 text-[#166534]" />
              <span>Promote Base Compensation</span>
            </h3>
            <button onClick={() => setIncrementTargetId(null)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-4 w-4 shrink-0" />
            </button>
          </div>
          <form onSubmit={handleApplyIncrement} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase block font-sans">Increment Base Scale</label>
                <select
                  id="select-increment-type"
                  value={incrementType}
                  onChange={(e) => setIncrementType(e.target.value as 'fixed' | 'percentage')}
                  className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-white outline-none font-semibold"
                >
                  <option value="fixed">Fixed Amount (+Rs)</option>
                  <option value="percentage">Percentage (+%)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase block font-sans">Adjustment Value</label>
                <input
                  id="input-increment-value"
                  type="number"
                  required
                  value={incrementValue}
                  onChange={(e) => setIncrementValue(e.target.value)}
                  placeholder={incrementType === 'fixed' ? 'Rs. 2500' : '10%'}
                  className="w-full text-sm border border-slate-200 rounded-xl p-2.5 outline-none font-semibold"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase block font-sans">Performance Remarks</label>
              <input
                id="input-increment-remarks"
                type="text"
                value={incrementRemarks}
                onChange={(e) => setIncrementRemarks(e.target.value)}
                placeholder="Superb discipline and customer feedback"
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>
            <button
               id="btn-submit-increment"
               type="submit"
               className="w-full bg-[#166534] hover:bg-[#11552a] text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
            >
              Authorize Scale Up
            </button>
          </form>
        </div>
      )}

      {/* Salary history overlay frame */}
      {historyTargetId && (
        <div id="salary-history-dialog" className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm max-w-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
              <History className="h-4 w-4 shrink-0 text-slate-650" />
              <span>Wage Progress & Increment Ledger</span>
            </h3>
            <button onClick={() => setHistoryTargetId(null)} className="text-slate-400 hover:text-slate-650 p-1">
              <X className="h-4 w-4 shrink-0" />
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {activeSalaryHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center font-medium font-sans">No historic scale promotions recorded for this employee.</p>
            ) : (
              activeSalaryHistory.map((h) => (
                <div key={h._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-[#166534] uppercase tracking-wider text-[10px] block font-sans">{h.incrementType} Adjustment</span>
                    <p className="text-slate-600 font-semibold font-sans">Remarks: {h.remarks}</p>
                    <div className="flex items-center text-[10px] text-slate-400 gap-1 mt-1 font-medium font-sans">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{h.incrementDate}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase font-sans">Payout promoted</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">Rs. {h.previousSalary} ➔ Rs. {h.newSalary}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation custom modal overlay dialog */}
      {deleteConfirmationId && (
        <div id="delete-alert-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1.5px] z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white p-6.5 rounded-3xl max-w-sm w-full border border-slate-100 shadow-xl space-y-4">
            <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-600 shrink-0" />
              <span>Purge Employee Record?</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed font-sans">
              Are you sure you want to delete the employee record for <strong className="text-slate-800">{deleteConfirmationName}</strong>? This action cannot be undone. All logs connected to their payouts will remain archived.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                id="btn-confirm-delete-cancel"
                onClick={() => {
                  setDeleteConfirmationId(null);
                  setDeleteConfirmationName('');
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-bold rounded-xl py-2.5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-purge"
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl py-2.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Yes, Purge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and category filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 shrink-0" />
          <input
            id="employee-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, category, phone..."
            className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none hover:border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 transition-colors font-medium bg-slate-50/20"
          />
        </div>
        
        {/* Category filtering */}
        <div id="employee-tabs" className="flex overflow-x-auto w-full sm:w-auto gap-1 border-slate-100 pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${selectedCategory === cat ? 'bg-[#166534] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-55 hover:text-slate-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Employees Grid Listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl h-44 animate-pulse p-6" />
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white p-16 text-center border border-slate-200 rounded-3xl flex flex-col items-center justify-center shadow-xs">
          <User className="h-12 w-12 text-slate-300 mb-3 shrink-0" />
          <h4 className="font-display font-bold text-slate-700 text-sm">No employee profiles found</h4>
          <p className="text-xs text-slate-450 max-w-sm mt-1 mb-0 font-medium font-sans">Refine your active keyword or use the "Register Employee" button to add a new team member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEmployees.map((emp) => (
            <div 
              id={`employee-card-${emp._id}`}
              key={emp._id} 
              className={`bg-white border p-6 rounded-3xl transition-all relative overflow-hidden flex flex-col justify-between h-full min-h-[220px] ${!emp.isActive ? 'border-slate-200 bg-slate-50/40 opacity-80' : 'border-slate-200 shadow-xs hover:shadow-sm'}`}
            >
              <div className="space-y-4">
                {/* Profile Header card info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${!emp.isActive ? 'bg-slate-100 text-slate-400' : 'bg-[#166534]/5 text-[#166534]'}`}>
                      <User className="h-5 w-5 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-slate-900 text-sm leading-tight flex items-center gap-2">
                        <span>{emp.name}</span>
                        {!emp.isActive && <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100/60">On Leave</span>}
                      </h4>
                      <p className="text-[11px] text-[#166534] font-bold uppercase tracking-wider mt-0.5 font-sans">{emp.category}</p>
                    </div>
                  </div>
                  
                  {/* Actions Trash & Edit */}
                  <div className="flex items-center gap-1 bg-slate-50/65 p-1 rounded-xl border border-slate-200 shrink-0">
                    <button
                      id={`btn-edit-employee-${emp._id}`}
                      onClick={() => startEdit(emp)}
                      className="p-1.5 text-slate-500 hover:text-[#166534] hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit3 className="h-4 w-4 shrink-0" />
                    </button>
                    <button
                      id={`btn-delete-employee-${emp._id}`}
                      onClick={() => handleDelete(emp._id, emp.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Delete profile"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Sub details attributes */}
                <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wide block">Contact Contact</span>
                    <p className="text-slate-600 font-semibold flex items-center gap-1 m-0">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{emp.phone}</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wide block">Compensation Scale</span>
                    <p className="text-slate-800 font-bold m-0 flex items-baseline gap-1">
                      <span>Rs. {emp.currentSalary}</span>
                      <span className="font-medium text-slate-500 text-[10px] uppercase">/ {emp.salaryType}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Advance & increment operations triggers */}
              <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wide text-slate-400 font-bold block">Advance Balance</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded-lg border border-transparent ${emp.advanceBalance > 0 ? 'text-amber-800 bg-amber-50 border-amber-100/50' : 'text-slate-400 bg-slate-50'}`}>
                      Rs. {emp.advanceBalance}
                    </span>
                    {emp.advanceBalance > 0 && (
                      <button
                        id={`btn-clear-advance-${emp._id}`}
                        onClick={() => handleClearAdvanceDeficit(emp._id, emp.name)}
                        className="text-[10px] text-[#166534] hover:text-[#11552a] hover:underline font-bold cursor-pointer pb-0.5"
                        title="Deduct dues from ledger payouts"
                      >
                        Settle Balance
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    id={`btn-trigger-advance-${emp._id}`}
                    onClick={() => {
                      setAdvanceTargetId(emp._id);
                      setIncrementTargetId(null);
                      setHistoryTargetId(null);
                    }}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/50 rounded-xl text-slate-600 hover:text-[#166534] flex items-center gap-1 text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                    title="Give salary advance"
                  >
                    <Coins className="h-3.5 w-3.5 shrink-0" />
                    <span>Advance</span>
                  </button>
                  <button
                    id={`btn-trigger-increment-${emp._id}`}
                    onClick={() => {
                      setIncrementTargetId(emp._id);
                      setAdvanceTargetId(null);
                      setHistoryTargetId(null);
                    }}
                    className="px-3 py-2 bg-[#166534]/5 hover:bg-[#11552a]/10 text-[#166534] border border-[#166534]/15 rounded-xl flex items-center gap-1 text-[10px] font-bold transition-all cursor-pointer"
                    title="Promote Salary"
                  >
                    <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                    <span>Scale Up</span>
                  </button>
                  <button
                    id={`btn-trigger-history-${emp._id}`}
                    onClick={() => {
                      setHistoryTargetId(emp._id);
                      setAdvanceTargetId(null);
                      setIncrementTargetId(null);
                    }}
                    className="p-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs"
                    title="View historical increments log"
                  >
                    <History className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
