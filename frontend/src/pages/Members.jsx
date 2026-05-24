import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaTrashAlt, FaEdit, FaWhatsapp, FaEye } from 'react-icons/fa';
import axios from '../api/axiosConfig';
import Layout from '../components/layout/Layout';
import Loader from '../components/ui/Loader';
import Alert from '../components/ui/Alert';
import ImagePreviewModal from '../components/ui/ImagePreviewModal';
import Modal from '../components/ui/Modal';
import { buildExpiryMessage, buildWhatsAppUrl } from '../utils/whatsappHelpers';


const Members = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sendingWhatsapp, setSendingWhatsapp] = useState(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('/members');
        setMembers(response.data.data || []);
      } catch (err) {
        setError('Could not load member data.');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = [member.full_name, member.mobile_number, member.package_name].some((value) =>
        value?.toLowerCase().includes(search.toLowerCase())
      );
      const isActive = new Date(member.end_date) >= new Date();
      const statusMatch = statusFilter === 'all' || (statusFilter === 'active' ? isActive : !isActive);
      return matchesSearch && statusMatch;
    });
  }, [members, search, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member permanently?')) return;
    try {
      await axios.delete(`/members/${id}`);
      setMembers(members.filter((item) => item.id !== id));
      setSuccessMessage('Member deleted successfully');
    } catch (err) {
      setError('Unable to delete member.');
    }
  };

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
      setSuccessMessage('WhatsApp message sent successfully!');
    } catch (err) {
      setError('Unable to send WhatsApp alert.');
    } finally {
      setSendingWhatsapp(null);
    }
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setDetailsModalOpen(true);
  };

  const handleViewImage = (member) => {
    if (member.photo) {
      setSelectedImage(`http://localhost/gym/backend/${member.photo}`);
      setImagePreviewOpen(true);
    }
  };

  if (loading) return <Loader />;

  return (
    <Layout>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Members</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Manage active and expired memberships, payments, and member data.</p>
        </div>
        <Link to="/members/new" className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 dark:bg-orange-500 dark:hover:bg-orange-400">
          <FaPlus /> Add Member
        </Link>
      </div>

      {/* Alerts */}
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
      )}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_260px] mb-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members, package, or phone"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
          <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Member</th>
              <th className="px-6 py-4 font-semibold">Package</th>
              <th className="px-6 py-4 font-semibold">Membership Dates</th>
              <th className="px-6 py-4 font-semibold">Payment Info</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-900 dark:divide-slate-800 dark:text-slate-200">
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No member matches the filter.
                </td>
              </tr>
            )}
            {filteredMembers.map((member) => {
              const active = new Date(member.end_date) >= new Date();
              const joinDate = new Date(member.joining_date).toLocaleDateString('en-IN');
              const endDate = new Date(member.end_date).toLocaleDateString('en-IN');
              const totalPayment = (Number(member.cash_payment) || 0) + (Number(member.online_payment) || 0);
              const daysLeft = Math.ceil((new Date(member.end_date) - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {member.photo ? (
                        <button
                          onClick={() => handleViewImage(member)}
                          className="relative group"
                        >
                          <img
                            src={`http://localhost/gym/backend/${member.photo}`}
                            alt={member.full_name}
                            className="h-12 w-12 rounded-2xl object-cover cursor-pointer transition hover:opacity-80"
                            onError={(e) => {
                              e.target.src = '/default-user.png';
                            }}
                          />
                          <div className="absolute inset-0 rounded-2xl bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <FaEye className="text-white" />
                          </div>
                        </button>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{member.full_name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{member.mobile_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-900 dark:text-slate-200">{member.package_name}</td>
                  <td className="px-6 py-5">
                    <div className="text-sm">
                      <div className="font-medium text-slate-900 dark:text-white">From: {joinDate}</div>
                      <div className="text-slate-600 dark:text-slate-400">To: {endDate}</div>
                      {!active && daysLeft < 0 && (
                        <div className="text-red-600 dark:text-red-400 font-medium mt-1">Expired {Math.abs(daysLeft)} days ago</div>
                      )}
                      {active && daysLeft <= 10 && (
                        <div className="text-yellow-600 dark:text-yellow-400 font-medium mt-1">{daysLeft} days left</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm">
                      <div className="font-medium text-slate-900 dark:text-white">Paid: ₹{totalPayment}</div>
                      <div className="text-red-600 dark:text-red-400 font-medium">Due: ₹{member.remaining_amount}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-red-500/15 text-red-700 dark:bg-red-500/15 dark:text-red-300'}`}>
                      {active ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleViewDetails(member)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 transition"
                      >
                        <FaEye /> Details
                      </button>
                      <Link to={`/members/edit/${member.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition">
                        <FaEdit /> Edit
                      </Link>
                      {!active && member.renewal_message_status !== 'sent' && (
                        <button
                          onClick={() => handleSendExpiryAlert(member)}
                          disabled={sendingWhatsapp === member.id}
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition"
                        >
                          <FaWhatsapp /> {sendingWhatsapp === member.id ? 'Sending...' : 'Alert'}
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(member.id)} 
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-500 transition"
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        imageUrl={selectedImage}
        title="Member Profile Photo"
      />

      {/* Member Details Modal */}
      {selectedMember && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Member Details - ${selectedMember.full_name}`}
          size="md"
        >
          <div className="grid gap-6">
            {/* Profile Section */}
            {selectedMember.photo && (
              <div className="flex justify-center">
                <img
                  src={`http://localhost/gym/backend/${selectedMember.photo}`}
                  alt={selectedMember.full_name}
                  className="h-32 w-32 rounded-2xl object-cover"
                  onError={(e) => {
                    e.target.src = '/default-user.png';
                  }}
                />
              </div>
            )}

            {/* Contact Info */}
            <div className="grid gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Name</div>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedMember.full_name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Phone</div>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedMember.mobile_number}</div>
                </div>
              </div>
            </div>

            {/* Membership Info */}
            <div className="grid gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Membership Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Package</div>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedMember.package_name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Start Date</div>
                  <div className="font-medium text-slate-900 dark:text-white">{new Date(selectedMember.joining_date).toLocaleDateString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">End Date</div>
                  <div className="font-medium text-slate-900 dark:text-white">{new Date(selectedMember.end_date).toLocaleDateString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Status</div>
                  <div className={`font-medium ${new Date(selectedMember.end_date) >= new Date() ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {new Date(selectedMember.end_date) >= new Date() ? 'Active' : 'Expired'}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Cash Payment</div>
                  <div className="font-medium text-slate-900 dark:text-white">₹{selectedMember.cash_payment || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Online Payment</div>
                  <div className="font-medium text-slate-900 dark:text-white">₹{selectedMember.online_payment || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Total Paid</div>
                  <div className="font-medium text-emerald-600 dark:text-emerald-400">₹{(Number(selectedMember.cash_payment) || 0) + (Number(selectedMember.online_payment) || 0)}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Amount Due</div>
                  <div className="font-medium text-red-600 dark:text-red-400">₹{selectedMember.remaining_amount}</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default Members;
