import { useEffect, useState, useMemo } from 'react';
import { FaPlus, FaSearch, FaTrashAlt, FaDownload, FaFileExcel } from 'react-icons/fa';
import axios from '../api/axiosConfig';
import Layout from '../components/layout/Layout';
import Loader from '../components/ui/Loader';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().split('-').slice(0, 2).join('-'));

  const categories = ['Rent', 'Utilities', 'Equipment', 'Maintenance', 'Staff Salary', 'Marketing', 'Insurance', 'Other'];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await axios.get('/expenses');
      setExpenses(response.data.data || []);
    } catch (err) {
      setError('Unable to load expenses.');
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseMonth = expense.date.split('-').slice(0, 2).join('-');
      const matchesSearch = [expense.category, expense.description].some((value) =>
        value?.toLowerCase().includes(search.toLowerCase())
      );
      return matchesSearch && expenseMonth === filterMonth;
    });
  }, [expenses, search, filterMonth]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  }, [filteredExpenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount || !form.date) {
      setError('Please fill all required fields.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await axios.post('/expenses', form);
      await loadExpenses();
      setForm({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save expense.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/expenses/${id}`);
      await loadExpenses();
    } catch (err) {
      setError('Unable to delete expense.');
    }
  };

  const downloadExcel = () => {
    const csvContent = [
      ['Date', 'Category', 'Description', 'Amount'].join(','),
      ...filteredExpenses.map(exp => 
        [exp.date, exp.category, exp.description, exp.amount].join(',')
      )
    ].join('\n');
    
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    link.download = `expenses_${filterMonth}.csv`;
    link.click();
  };

  if (loading) return <Loader />;

  return (
    <Layout>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Expenses</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Track and manage gym expenses by category.</p>
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft mb-8 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Add Expense</h3>
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-5">
          <select
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            required
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="Amount"
            required
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            required
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button 
            type="submit" 
            disabled={saving} 
            className="rounded-3xl bg-sky-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-400 dark:bg-orange-500 dark:hover:bg-orange-400"
          >
            {saving ? 'Saving...' : <><FaPlus className="inline mr-2" />Add</>}
          </button>
        </form>
      </div>

      {error && <div className="rounded-3xl border border-red-600 bg-red-50 px-4 py-3 text-red-700 mb-4 dark:bg-red-950 dark:text-red-300">{error}</div>}

      {/* Summary */}
      <div className="grid gap-6 xl:grid-cols-3 mb-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Total Expenses</p>
          <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">₹{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Total Entries</p>
          <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">{filteredExpenses.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Average Expense</p>
          <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">₹{filteredExpenses.length ? (totalExpenses / filteredExpenses.length).toFixed(2) : '0.00'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category or description"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <button 
          onClick={downloadExcel}
          className="rounded-3xl border border-slate-200 bg-emerald-50 px-6 py-3 text-base font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-400"
        >
          <FaFileExcel className="inline mr-2" />Download CSV
        </button>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
          <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-900 dark:divide-slate-800 dark:text-slate-200">
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No expenses found.
                </td>
              </tr>
            )}
            {filteredExpenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-semibold">{expense.category}</td>
                <td className="px-6 py-4">{expense.description || '-'}</td>
                <td className="px-6 py-4 text-sky-600 dark:text-orange-400 font-semibold">₹{Number(expense.amount).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Expenses;
