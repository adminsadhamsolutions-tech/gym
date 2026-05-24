import { useEffect, useMemo, useState } from 'react';
import { FaSync, FaSearch, FaWhatsapp, FaCheck, FaEye } from 'react-icons/fa';
import axios from '../api/axiosConfig';
import Layout from '../components/layout/Layout';
import Loader from '../components/ui/Loader';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';
import { buildExpiryMessage, buildWhatsAppUrl } from '../utils/whatsappHelpers';

const Renewals = () => {
  const [members, setMembers] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sendingWhatsapp, setSendingWhatsapp] = useState(null);
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [renewalForm, setRenewalForm] = useState({
    package_id: '',
    amount: '',
    new_end_date: '',
    notes: ''
  });
  const [processingRenewal, setProcessingRenewal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, packagesRes] = await Promise.all([
          axios.get('/members'),
          axios.get('/packages')
        ]);
        const expired = membersRes.data.data.filter(m => new Date(m.end_date) < new Date());
        setMembers(expired);
        setAllPackages(packagesRes.data.data || []);
      } catch (err) {
        setError('Could not load member data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = [member.full_name, member.mobile_number, member.package_name].some((value) =>
        value?.toLowerCase().includes(search.toLowerCase())
      );
      return matchesSearch;
    });
  }, [members, search]);

  const handleSendRenewalAlert = async (member) => {
    setSendingWhatsapp(member.id);
    try {
      const whatsappUrl = buildWhatsAppUrl(member.mobile_number, buildExpiryMessage(member));
      window.open(whatsappUrl, '_blank');
      await axios.post('/whatsapp', {
        action: 'send_renewal_reminder',
        member_id: member.id
      });
      setMembers(members.map((m) => (m.id === member.id ? { ...m, renewal_message_status: 'sent' } : m)));
      setSuccessMessage('Renewal alert sent successfully!');
    } catch (err) {
      setError('Unable to send renewal reminder.');
    } finally {
      setSendingWhatsapp(null);
    }
  };

  const handleOpenRenewalModal = (member) => {
    setSelectedMember(member);
    setRenewalForm({
      package_id: member.package_id || '',
      amount: '',
      new_end_date: '',
      notes: ''
    });
    setRenewalModalOpen(true);
  };

  const handleProcessRenewal = async (e) => {
    e.preventDefault();
    
    if (!renewalForm.new_end_date) {
      setError('Please select renewal end date.');
      return;
    }

    setProcessingRenewal(true);
    try {
      await axios.post('/renewals', {
        member_id: selectedMember.id,
        new_end_date: renewalForm.new_end_date,
        notes: renewalForm.notes || `Renewed with amount: ₹${renewalForm.amount || '0'}`
      });
      
      setMembers(members.filter(m => m.id !== selectedMember.id));
      setRenewalModalOpen(false);
      setSuccessMessage('Membership renewed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process renewal.');
    } finally {
      setProcessingRenewal(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Layout>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Membership Renewals</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Process renewals for expired memberships and manage member subscriptions.</p>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
      )}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* Search */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft mb-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="relative">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name or phone"
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Expired Members Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
          <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Member</th>
              <th className="px-6 py-4 font-semibold">Package</th>
              <th className="px-6 py-4 font-semibold">Expired Date</th>
              <th className="px-6 py-4 font-semibold">Days Expired</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-900 dark:divide-slate-800 dark:text-slate-200">
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No expired members to renew.
                </td>
              </tr>
            )}
            {filteredMembers.map((member) => {
              const daysExpired = Math.floor((new Date() - new Date(member.end_date)) / (1000 * 60 * 60 * 24));
              return (
                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                  <td className="px-6 py-5">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{member.full_name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{member.mobile_number}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-200">{member.package_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-200">{new Date(member.end_date).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full px-3 py-1 text-sm font-semibold bg-red-500/15 text-red-700 dark:bg-red-500/15 dark:text-red-300">
                      {daysExpired} days
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {/* View Details */}
                      <button
                        onClick={() => handleOpenRenewalModal(member)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 transition"
                      >
                        <FaEye /> Renew
                      </button>

                      {/* WhatsApp Alert */}
                      {member.renewal_message_status !== 'sent' && (
                        <button
                          onClick={() => handleSendRenewalAlert(member)}
                          disabled={sendingWhatsapp === member.id}
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition"
                        >
                          <FaWhatsapp />
                          {sendingWhatsapp === member.id ? 'Sending...' : 'Alert'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Renewal Modal */}
      {selectedMember && (
        <Modal
          isOpen={renewalModalOpen}
          onClose={() => setRenewalModalOpen(false)}
          title={`Renew Membership - ${selectedMember.full_name}`}
          size="lg"
        >
          <div className="grid gap-8">
            {/* Member Information */}
            <div className="grid grid-cols-2 gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
              <h3 className="col-span-2 text-lg font-semibold text-slate-900 dark:text-white">Current Member Information</h3>
              
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Name</div>
                <div className="font-medium text-slate-900 dark:text-white">{selectedMember.full_name}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Phone</div>
                <div className="font-medium text-slate-900 dark:text-white">{selectedMember.mobile_number}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Current Package</div>
                <div className="font-medium text-slate-900 dark:text-white">{selectedMember.package_name}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Last End Date</div>
                <div className="font-medium text-slate-900 dark:text-white">{new Date(selectedMember.end_date).toLocaleDateString('en-IN')}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Days Expired</div>
                <div className="font-medium text-red-600 dark:text-red-400">
                  {Math.floor((new Date() - new Date(selectedMember.end_date)) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Amount Due</div>
                <div className="font-medium text-red-600 dark:text-red-400">₹{selectedMember.remaining_amount}</div>
              </div>
            </div>

            {/* Payment History (if available from API) */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment & Renewal History</h3>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Cash Payment</div>
                    <div className="font-semibold text-slate-900 dark:text-white">₹{selectedMember.cash_payment || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Online Payment</div>
                    <div className="font-semibold text-slate-900 dark:text-white">₹{selectedMember.online_payment || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Total Paid</div>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{(Number(selectedMember.cash_payment) || 0) + (Number(selectedMember.online_payment) || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Member Since</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{new Date(selectedMember.joining_date).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Renewal Form */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Renewal Details</h3>
              <form onSubmit={handleProcessRenewal} className="grid gap-4">
                
                {/* Package Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Select Package</label>
                  <select
                    value={renewalForm.package_id}
                    onChange={(e) => setRenewalForm({ ...renewalForm, package_id: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">Select a package</option>
                    {allPackages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - ₹{pkg.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Amount (Optional)</label>
                  <input
                    type="number"
                    value={renewalForm.amount}
                    onChange={(e) => setRenewalForm({ ...renewalForm, amount: e.target.value })}
                    placeholder="Leave empty if not specified"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">New Membership End Date*</label>
                  <input
                    type="date"
                    value={renewalForm.new_end_date}
                    onChange={(e) => setRenewalForm({ ...renewalForm, new_end_date: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Notes (Optional)</label>
                  <textarea
                    value={renewalForm.notes}
                    onChange={(e) => setRenewalForm({ ...renewalForm, notes: e.target.value })}
                    placeholder="Add any additional notes"
                    rows="3"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={processingRenewal}
                    className="flex-1 rounded-2xl bg-sky-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50 dark:bg-orange-500 dark:hover:bg-orange-400"
                  >
                    {processingRenewal ? 'Processing...' : 'Complete Renewal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenewalModalOpen(false)}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default Renewals;
