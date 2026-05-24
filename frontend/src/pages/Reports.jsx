import { useEffect, useMemo, useState } from 'react';
import { FaFileExcel, FaFilePdf, FaFilter } from 'react-icons/fa';
import axios from '../api/axiosConfig';
import Layout from '../components/layout/Layout';
import Loader from '../components/ui/Loader';

const Reports = () => {
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
       const [expensesRes, membersRes] = await Promise.all([
  axios.get('/expenses'),
  axios.get('/members')
]);

const membersData = membersRes.data.data || [];

const convertedPayments = membersData.flatMap((member) => {
  const rows = [];

  if (Number(member.cash_payment) > 0) {
    rows.push({
      id: `cash-${member.id}`,
      member_id: member.id,
      member_name: member.full_name,
      type: 'cash',
      amount: Number(member.cash_payment),
      created_at: member.created_at,
      remaining_amount: member.remaining_amount
    });
  }

  if (Number(member.online_payment) > 0) {
    rows.push({
      id: `online-${member.id}`,
      member_id: member.id,
      member_name: member.full_name,
      type: 'online',
      amount: Number(member.online_payment),
      created_at: member.created_at,
      remaining_amount: member.remaining_amount
    });
  }

  return rows;
});

setPayments(convertedPayments);
setExpenses(expensesRes.data.data || []);
setMembers(membersData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    const filteredPayments = payments.filter(p => {
      const pDate = new Date(p.created_at);
      return pDate >= start && pDate <= end;
    });

    const filteredExpenses = expenses.filter(e => {
      const eDate = new Date(e.date);
      return eDate >= start && eDate <= end;
    });

    return { filteredPayments, filteredExpenses };
  }, [payments, expenses, startDate, endDate]);

  const ledgerData = useMemo(() => {
    const totalIncome = filteredData.filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const cashIncome = filteredData.filteredPayments.filter(p => p.type === 'cash').reduce((sum, p) => sum + Number(p.amount), 0);
    const onlineIncome = filteredData.filteredPayments.filter(p => p.type === 'online').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = filteredData.filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalIncome - totalExpenses;

    return {
      totalIncome,
      cashIncome,
      onlineIncome,
      totalExpenses,
      netProfit,
      incomeCount: filteredData.filteredPayments.length,
      expenseCount: filteredData.filteredExpenses.length
    };
  }, [filteredData]);

  const expensesByCategory = useMemo(() => {
    const grouped = {};
    filteredData.filteredExpenses.forEach(e => {
      grouped[e.category] = (grouped[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(grouped).map(([category, amount]) => ({ category, amount }));
  }, [filteredData.filteredExpenses]);

  const downloadCSV = () => {
    let csvContent = 'INCOME & EXPENSE LEDGER\n';
    csvContent += `Period: ${startDate} to ${endDate}\n\n`;
    csvContent += 'INCOME SUMMARY\n';
    csvContent += `Total Income,${ledgerData.totalIncome.toFixed(2)}\n`;
    csvContent += `Cash Income,${ledgerData.cashIncome.toFixed(2)}\n`;
    csvContent += `Online Income,${ledgerData.onlineIncome.toFixed(2)}\n\n`;
    csvContent += 'EXPENSE SUMMARY\n';
    csvContent += `Total Expenses,${ledgerData.totalExpenses.toFixed(2)}\n`;
    expensesByCategory.forEach(e => {
      csvContent += `${e.category},${e.amount.toFixed(2)}\n`;
    });
    csvContent += '\nNET PROFIT\n';
    csvContent += `Net Profit,${ledgerData.netProfit.toFixed(2)}\n\n`;
    csvContent += 'DETAILED TRANSACTIONS\n';
    csvContent += 'Date,Type,Description,Amount\n';
    
    filteredData.filteredPayments.forEach(p => {
      csvContent += `${new Date(p.created_at).toLocaleDateString()},Income,Payment from ${p.member_name || 'Unknown'} (${p.type}),${p.amount.toFixed(2)}\n`;
    });
    
    filteredData.filteredExpenses.forEach(e => {
      csvContent += `${e.date},Expense,${e.category} - ${e.description || ''},${e.amount.toFixed(2)}\n`;
    });

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    link.download = `ledger_${startDate}_to_${endDate}.csv`;
    link.click();
  };

  if (loading) return <Loader />;

  return (
    <Layout>
      <div>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Financial Ledger</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Income and expense tracking with comprehensive financial reports.</p>
      </div>

      {/* Date Range Filter */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft mb-6 mt-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-slate-600 dark:text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Date Range</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <button 
            onClick={downloadCSV}
            className="rounded-3xl border border-slate-200 bg-emerald-50 px-6 py-3 text-base font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-400 self-end"
          >
            <FaFileExcel className="inline mr-2" />Download CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 xl:grid-cols-3 mb-6">
        <div className="rounded-3xl border-l-4 border-l-sky-500 border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Total Income</p>
          <p className="text-4xl font-semibold text-sky-600 dark:text-orange-400">₹{ledgerData.totalIncome.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-2 dark:text-slate-400">{ledgerData.incomeCount} transactions</p>
        </div>
        <div className="rounded-3xl border-l-4 border-l-red-500 border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Total Expenses</p>
          <p className="text-4xl font-semibold text-red-600 dark:text-red-400">₹{ledgerData.totalExpenses.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-2 dark:text-slate-400">{ledgerData.expenseCount} transactions</p>
        </div>
        <div className={`rounded-3xl border-l-4 ${ledgerData.netProfit >= 0 ? 'border-l-emerald-500' : 'border-l-red-500'} border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950`}>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Net Profit</p>
          <p className={`text-4xl font-semibold ${ledgerData.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>₹{ledgerData.netProfit.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-2 dark:text-slate-400">Income - Expenses</p>
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="grid gap-6 xl:grid-cols-3 mb-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Income Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Cash</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">₹{ledgerData.cashIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">Online</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">₹{ledgerData.onlineIncome.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Total</span>
              <span className="font-bold text-sky-600 dark:text-orange-400">₹{ledgerData.totalIncome.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Expense Breakdown</h3>
          <div className="space-y-3">
            {expensesByCategory.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No expenses in this period.</p>
            ) : (
              <>
                {expensesByCategory.map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300">{exp.category}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">₹{exp.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Total</span>
                  <span className="font-bold text-red-600 dark:text-red-400">₹{ledgerData.totalExpenses.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Transactions */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft overflow-x-auto dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">All Transactions</h3>
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-900 dark:divide-slate-800 dark:text-slate-200">
            {filteredData.filteredPayments.length === 0 && filteredData.filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No transactions in this period.
                </td>
              </tr>
            )}
            {[
              ...filteredData.filteredPayments.map(p => ({
                date: new Date(p.created_at).toLocaleDateString(),
                type: 'Income',
                description: `Payment from ${p.member_name || 'Unknown'} (${p.type})`,
                amount: p.amount,
                isIncome: true
              })),
              ...filteredData.filteredExpenses.map(e => ({
                date: e.date,
                type: 'Expense',
                description: `${e.category} - ${e.description || ''}`,
                amount: e.amount,
                isIncome: false
              }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date)).map((row, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4">{row.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.isIncome ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {row.type}
                  </span>
                </td>
                <td className="px-6 py-4">{row.description}</td>
                <td className={`px-6 py-4 font-semibold text-right ${row.isIncome ? 'text-sky-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
                  {row.isIncome ? '+' : '-'}₹{row.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Reports;
