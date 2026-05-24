import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDollarSign, FaUsers, FaCheckCircle, FaExclamationTriangle, FaWhatsapp, FaBell, FaClock } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from '../api/axiosConfig';
import Card from '../components/ui/Card';
import Layout from '../components/layout/Layout';
import Loader from '../components/ui/Loader';
import Alert from '../components/ui/Alert';
import { buildExpiryMessage, buildWhatsAppUrl } from '../utils/whatsappHelpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [membersRes, paymentsRes] = await Promise.all([
          axios.get('/members'),
          axios.get('/payments')
        ]);
        setMembers(membersRes.data.data || []);
        setPayments(paymentsRes.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSendExpiryAlert = async (member) => {
    setSendingWhatsapp(member.id);
    try {
      const whatsappUrl = buildWhatsAppUrl(member.mobile_number, buildExpiryMessage(member));
      window.open(whatsappUrl, '_blank');
      await axios.post('/whatsapp', {
        action: 'send_expiry_alert',
        member_id: member.id
      });
      setMembers(members.map((m) => (m.id === member.id ? { ...m, renewal_message_status: 'sent' } : m)));
      setSuccessMessage('Renewal alert sent successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setSendingWhatsapp(null);
    }
  };

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((member) => new Date(member.end_date) >= new Date()).length;
    const expired = total - active;
    const todayRevenue = payments
      .filter((pay) => new Date(pay.created_at).toDateString() === new Date().toDateString())
      .reduce((sum, pay) => sum + Number(pay.amount), 0);
    const monthlyRevenue = payments
      .filter((pay) => new Date(pay.created_at).getMonth() === new Date().getMonth())
      .reduce((sum, pay) => sum + Number(pay.amount), 0);

    const expiryAlerts = members.filter((member) => {
      const diff = new Date(member.end_date) - new Date();
      return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 10;
    });

    const recentExpiry = members.filter((member) => {
      const diff = new Date(member.end_date) - new Date();
      return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 3;
    });

    return { total, active, expired, todayRevenue, monthlyRevenue, expiryAlerts, recentExpiry };
  }, [members, payments]);

  const chartData = {
    labels: ['Active', 'Expired'],
    datasets: [
      {
        label: 'Member Status',
        data: [stats.active, stats.expired],
        backgroundColor: ['#10b981', '#ef4444'],
      },
    ],
  };

  if (loading) return <Loader />;

  return (
    <Layout>
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
      )}

      <div className="mb-6">
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Welcome to your Gym ERP system. Monitor your memberships and revenue at a glance.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-4 mb-6">
        <button 
          onClick={() => navigate('/members')}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950 cursor-pointer hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 mb-3">Total Members</p>
              <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">{stats.total}</p>
            </div>
            <FaUsers className="text-4xl text-sky-600 dark:text-orange-400" />
          </div>
        </button>
        <button 
          onClick={() => navigate('/members')}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950 cursor-pointer hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 mb-3">Active Members</p>
              <p className="text-4xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
            </div>
            <FaCheckCircle className="text-4xl text-emerald-600 dark:text-emerald-400" />
          </div>
        </button>
        <button 
          onClick={() => navigate('/renewals')}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950 cursor-pointer hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 mb-3">Expired Members</p>
              <p className="text-4xl font-semibold text-red-600 dark:text-red-400">{stats.expired}</p>
            </div>
            <FaExclamationTriangle className="text-4xl text-red-600 dark:text-red-400" />
          </div>
        </button>
        <button 
          onClick={() => navigate('/payments')}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950 cursor-pointer hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 mb-3">Today Collection</p>
              <p className="text-4xl font-semibold text-sky-600 dark:text-orange-400">₹{stats.todayRevenue.toFixed(2)}</p>
            </div>
            <FaDollarSign className="text-4xl text-sky-600 dark:text-orange-400" />
          </div>
        </button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3 mb-6">
        <Card title="Monthly Revenue" value={`₹${stats.monthlyRevenue.toFixed(2)}`} variant="accent">
          <p className="text-sm text-slate-900 dark:text-slate-950">Revenue from cash and online payments this month.</p>
        </Card>
        <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Performance</p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Member Status Distribution</h2>
            </div>
          </div>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent Payments */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <FaDollarSign className="text-sky-600 dark:text-orange-400" />
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent Payments</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Latest transactions</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Latest 5</span>
          </div>
          <div className="space-y-3">
            {payments.length > 0 ? payments.slice(-5).reverse().map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.member_name || 'Member'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <FaClock className="inline mr-1" size={10} />
                      {new Date(item.created_at).toLocaleDateString('en-IN')} • {item.type === 'cash' ? 'Cash' : 'Online'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">₹{item.amount}</div>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">No payments yet</p>
            )}
          </div>
        </div>

        {/* Expiry & Renewal Alerts */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <FaBell className="text-yellow-600 dark:text-yellow-400" />
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Renewal Notifications</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Next 10 days expiry</p>
              </div>
            </div>
            {stats.expiryAlerts.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">
                {stats.expiryAlerts.length}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {stats.expiryAlerts.length > 0 ? stats.expiryAlerts.slice(0, 5).map((member) => {
              const daysLeft = Math.ceil((new Date(member.end_date) - new Date()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft <= 3;
              return (
                <div 
                  key={member.id} 
                  className={`rounded-2xl border p-4 ${isUrgent 
                    ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950' 
                    : 'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className={`font-semibold ${isUrgent ? 'text-red-900 dark:text-red-200' : 'text-yellow-900 dark:text-yellow-200'}`}>
                        {member.full_name}
                      </p>
                      <p className={`text-xs mt-1 ${isUrgent ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                        <FaClock className="inline mr-1" size={10} />
                        Expires in {daysLeft} days • {new Date(member.end_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    {member.renewal_message_status !== 'sent' && (
                      <button
                        onClick={() => handleSendExpiryAlert(member)}
                        disabled={sendingWhatsapp === member.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition"
                      >
                        <FaWhatsapp size={12} />
                        {sendingWhatsapp === member.id ? 'Sending...' : 'Alert'}
                      </button>
                    )}
                    {member.renewal_message_status === 'sent' && (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✓ Sent</span>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8">
                <FaCheckCircle className="inline text-4xl text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="text-slate-500 dark:text-slate-400">No membership expiry alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
