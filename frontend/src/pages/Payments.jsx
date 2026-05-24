import { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaSearch, FaDownload, FaFileExcel, FaWhatsapp, FaCalendarAlt } from 'react-icons/fa';
import axios from '../api/axiosConfig';
import Layout from '../components/layout/Layout';
import Loader from '../components/ui/Loader';
import Alert from '../components/ui/Alert';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [payment, setPayment] = useState({ member_id: '', type: 'cash', amount: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [sendingWhatsapp, setSendingWhatsapp] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const membersRes = await axios.get('/members');
        const membersData = membersRes.data.data || [];

        const convertedPayments = membersData.flatMap((member) => {
          const rows = [];

          if (Number(member.cash_payment) > 0) {
            rows.push({
              id: `cash-${member.id}`,
              member_id: member.id,
              member_name: member.full_name,
              type: 'cash',
              amount: member.cash_payment,
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
              amount: member.online_payment,
              created_at: member.created_at,
              remaining_amount: member.remaining_amount
            });
          }

          return rows;
        });

        setPayments(convertedPayments);
        setMembers(membersData);
      } catch (err) {
        console.error(err);
        setError('Unable to load payments.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await axios.post('/payments', payment);
      const updated = await axios.get('/payments');
      setPayments(updated.data.data || []);
      setPayment({ member_id: '', type: 'cash', amount: '' });
      setSuccessMessage('Payment recorded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save payment.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPayments = useMemo(() => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());

    return payments.filter((payment) => {
      const paymentDate = new Date(payment.created_at);
      const memberName = payment.member_name || '';

      const matchesSearch = memberName.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || payment.type === filterType;

      let matchesPeriod = true;

      if (filterPeriod === 'today') {
        matchesPeriod = paymentDate.toDateString() === today.toDateString();
      } else if (filterPeriod === 'week') {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        matchesPeriod = paymentDate >= currentWeekStart && paymentDate <= weekEnd;
      } else if (filterPeriod === 'month') {
        matchesPeriod = paymentDate.getMonth() === today.getMonth() && 
                        paymentDate.getFullYear() === today.getFullYear();
      } else if (filterPeriod === 'custom' && customDateFrom && customDateTo) {
        const fromDate = new Date(customDateFrom);
        const toDate = new Date(customDateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesPeriod = paymentDate >= fromDate && paymentDate <= toDate;
      } else if (filterPeriod === 'custom') {
        matchesPeriod = false;
      }

      return matchesSearch && matchesType && matchesPeriod;
    });
  }, [payments, search, filterType, filterPeriod, customDateFrom, customDateTo]);

  const stats = useMemo(() => {
    const totalAmount = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const cashAmount = filteredPayments.filter(p => p.type === 'cash')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const onlineAmount = filteredPayments.filter(p => p.type === 'online')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return { totalAmount, cashAmount, onlineAmount };
  }, [filteredPayments]);

  const pendingBalance = useMemo(() => {
    return payments.reduce((balance, item) => balance + Number(item.remaining_amount || 0), 0);
  }, [payments]);

  const handleSendPaymentReceipt = async (paymentRecord) => {
    setSendingWhatsapp(paymentRecord.id);
    try {
      const member = members.find((m) => m.id === paymentRecord.member_id);
      if (!member) return;

      const whatsappMessage = `Hi ${member.full_name}!\n\nPayment Receipt\nAmount: ₹${paymentRecord.amount}\nMode: ${paymentRecord.type === 'cash' ? 'Cash' : 'Online'}\nDate: ${new Date(paymentRecord.created_at).toLocaleDateString('en-IN')}\n\nThank you for your payment!`;

      const whatsappUrl = `https://wa.me/${member.mobile_number.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');

      await axios.post('/whatsapp', {
        action: 'send_payment_receipt',
        member_id: member.id,
        amount: paymentRecord.amount,
        type: paymentRecord.type
      });

      setSuccessMessage('Payment receipt sent successfully!');
    } catch (err) {
      setError('Unable to send payment receipt.');
    } finally {
      setSendingWhatsapp(null);
    }
  };

  const downloadCSV = () => {
    const csvContent = [
      ['Date', 'Member', 'Type', 'Amount'].join(','),
      ...filteredPayments.map(p => [
        new Date(p.created_at).toLocaleDateString('en-IN'),
        p.member_name || 'Unknown',
        p.type,
        p.amount
      ].join(','))
    ].join('\n');

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) return <Loader />;

  return (
    <Layout>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px] mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Payments</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Record cash and online payments and review payment history.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">Pending Balance</h3>
          <p className="text-4xl font-semibold text-sky-600 dark:text-orange-400">
            ₹{pendingBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
      )}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* Record Payment */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft mb-8 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Record Payment</h3>
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-4">
          <select
            value={payment.member_id}
            onChange={(e) => setPayment(prev => ({ ...prev, member_id: e.target.value }))}
            required
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Select Member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.full_name}</option>
            ))}
          </select>

          <select
            value={payment.type}
            onChange={(e) => setPayment(prev => ({ ...prev, type: e.target.value }))}
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="cash">Cash</option>
            <option value="online">Online</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            value={payment.amount}
            onChange={(e) => setPayment(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="Amount"
            required
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-3xl bg-sky-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50 dark:bg-orange-500 dark:hover:bg-orange-400"
          >
            {saving ? 'Saving...' : <><FaPlus className="inline mr-2" />Save</>}
          </button>
        </form>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 xl:grid-cols-3 mb-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Total Collected</p>
          <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">₹{stats.totalAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Cash</p>
          <p className="text-4xl font-semibold text-sky-600 dark:text-orange-400">₹{stats.cashAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Online</p>
          <p className="text-4xl font-semibold text-sky-600 dark:text-orange-400">₹{stats.onlineAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 lg:grid-cols-5 mb-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by member name"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="cash">Cash Only</option>
          <option value="online">Online Only</option>
        </select>

        <select
          value={filterPeriod}
          onChange={(e) => {
            setFilterPeriod(e.target.value);
            if (e.target.value !== 'custom') {
              setCustomDateFrom('');
              setCustomDateTo('');
            }
          }}
          className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="all">All Periods</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Date</option>
        </select>

        {filterPeriod === 'custom' && (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-950">
              <div className="relative">
                <FaCalendarAlt className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-950">
              <div className="relative">
                <FaCalendarAlt className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          </>
        )}

        {filterPeriod !== 'custom' && (
          <button
            onClick={downloadCSV}
            className="rounded-3xl border border-slate-200 bg-emerald-50 px-6 py-3 text-base font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-400"
          >
            <FaFileExcel className="inline mr-2" />Export CSV
          </button>
        )}
      </div>

      {filterPeriod === 'custom' && (
        <div className="flex justify-end mb-6">
          <button
            onClick={downloadCSV}
            disabled={!customDateFrom || !customDateTo}
            className="rounded-3xl border border-slate-200 bg-emerald-50 px-6 py-3 text-base font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-400"
          >
            <FaFileExcel className="inline mr-2" />Export CSV
          </button>
        </div>
      )}

      {/* Payment History */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft overflow-x-auto dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Payment History</h3>
        <table className="min-w-full divide-y divide-slate-200 text-left text-slate-900 dark:divide-slate-800 dark:text-slate-200">
          <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Member</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No payments found.
                </td>
              </tr>
            )}
            {filteredPayments.slice().reverse().map((paymentRow) => (
              <tr key={paymentRow.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                <td className="px-6 py-4">{paymentRow.member_name || 'Unknown'}</td>
                <td className="px-6 py-4 capitalize">{paymentRow.type}</td>
                <td className="px-6 py-4 text-sky-600 dark:text-orange-400 font-semibold">
                  ₹{Number(paymentRow.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4">{new Date(paymentRow.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleSendPaymentReceipt(paymentRow)}
                    disabled={sendingWhatsapp === paymentRow.id}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition"
                  >
                    <FaWhatsapp /> {sendingWhatsapp === paymentRow.id ? '...' : 'Receipt'}
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

export default Payments;