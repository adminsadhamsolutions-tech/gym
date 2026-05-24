import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaWhatsapp, FaCamera, FaImage } from 'react-icons/fa';
import axios from '../api/axiosConfig';
import Layout from '../components/layout/Layout';
import Loader from '../components/ui/Loader';
import Alert from '../components/ui/Alert';
import { buildJoinMessage, buildWhatsAppUrl } from '../utils/whatsappHelpers';

const initialState = {
  full_name: '',
  mobile_number: '',
  joining_date: '',
  end_date: '',
  package_id: '',
  cash_payment: 0,
  online_payment: 0,
  remaining_amount: 0,
  whatsapp_added: 'no',
  join_message_status: 'pending',
  renewal_message_status: 'pending',
  photo: null,
};

const MemberForm = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [form, setForm] = useState(initialState);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createdMember, setCreatedMember] = useState(null);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesRes, membersRes] = await Promise.all([
          axios.get('/packages'),
          mode === 'edit' ? axios.get(`/members/${id}`) : Promise.resolve({ data: { data: [] } })
        ]);

        setPackages(packagesRes.data.data || []);

        if (mode === 'edit') {
          const selected = membersRes.data.data;
          if (selected) {
            setForm({
              ...selected,
              photo: null,
            });
          }
        }
      } catch (err) {
        setError('Unable to load form data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, mode]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'photo') {
      setForm((prev) => ({ ...prev, photo: files?.[0] || null }));
      // Generate preview
      if (files?.[0]) {
        const reader = new FileReader();
        reader.onload = (e) => setPhotoPreview(e.target.result);
        reader.readAsDataURL(files[0]);
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCameraCapture = (event) => {
    const { files } = event.target;
    if (files?.[0]) {
      setForm((prev) => ({ ...prev, photo: files[0] }));
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(files[0]);
      setSuccessMessage('Photo captured successfully!');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null) payload.append(key, value);
      });

      if (mode === 'create') {
        const response = await axios.post('/members', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        setCreatedMember(response.data.data);
        setSuccessMessage('Member created successfully!');
      } else {
        await axios.post(`/members/${id}`, payload, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-HTTP-Method-Override': 'PUT',
          }
        });
        setSuccessMessage('Member updated successfully!');
        setTimeout(() => navigate('/members'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save member.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendWhatsAppMessage = async () => {
    const memberData = createdMember || form;
    if (!memberData.full_name || !memberData.mobile_number) {
      setError('Please fill in member name and mobile number.');
      return;
    }

    setSendingWhatsapp(true);
    try {
      const whatsappUrl = buildWhatsAppUrl(memberData.mobile_number, buildJoinMessage({
        ...memberData,
        package_name: memberData.package_name || packages.find((pkg) => String(pkg.id) === String(memberData.package_id))?.name || 'Standard'
      }));
      window.open(whatsappUrl, '_blank');
      if (memberData.id) {
        await axios.post('/whatsapp', {
          action: 'send_join_message',
          member_id: memberData.id
        });
      }
      setSuccessMessage('Welcome message sent successfully!');
      setTimeout(() => navigate('/members'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send WhatsApp message.');
    } finally {
      setSendingWhatsapp(false);
    }
  };

  if (loading) return <Loader />;

  if (createdMember && mode === 'create') {
    return (
      <Layout>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft max-w-md mx-auto mt-20 dark:border-slate-800 dark:bg-slate-950">
          {successMessage && (
            <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
          )}
          <div className="text-center mb-6 mt-4">
            <div className="text-5xl text-sky-600 mb-4 dark:text-orange-400">✓</div>
            <h2 className="text-3xl font-semibold text-slate-950 dark:text-slate-100">Member Created!</h2>
            <p className="text-slate-500 mt-2 dark:text-slate-400">Would you like to send a welcome message via WhatsApp?</p>
          </div>
          <div className="space-y-4">
            <button
              onClick={handleSendWhatsAppMessage}
              disabled={sendingWhatsapp}
              className="w-full flex items-center justify-center gap-2 rounded-3xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
            >
              <FaWhatsapp /> {sendingWhatsapp ? 'Sending...' : 'Send WhatsApp Message'}
            </button>
            <button
              onClick={() => navigate('/members')}
              className="w-full rounded-3xl border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 transition dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Skip for now
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-slate-950 dark:text-slate-100">{mode === 'create' ? 'Add Member' : 'Edit Member'}</h2>
            <p className="text-slate-500 dark:text-slate-400">Capture membership details and payment information.</p>
          </div>
          <button onClick={() => navigate('/members')} className="rounded-full border border-slate-200 px-5 py-3 text-slate-700 hover:bg-slate-100 transition dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">
            Back to list
          </button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        )}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name*</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mobile Number*</label>
            <input name="mobile_number" value={form.mobile_number} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Joining Date*</label>
            <input name="joining_date" type="date" value={form.joining_date} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date*</label>
            <input name="end_date" type="date" value={form.end_date} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Package*</label>
            <select name="package_id" value={form.package_id} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
              <option value="">Select package</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>{pkg.name} - ₹{pkg.price}</option>
              ))}
            </select>
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Member Photo</label>
            <div className="relative">
              <input
                ref={fileInputRef}
                name="photo"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <FaImage /> Choose Photo
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-white hover:bg-sky-400 transition dark:bg-orange-500 dark:hover:bg-orange-400"
                  title="Capture photo with camera"
                >
                  <FaCamera />
                </button>
              </div>
            </div>
            {photoPreview && (
              <div className="mt-3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cash Payment</label>
            <input name="cash_payment" type="number" value={form.cash_payment} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Online Payment</label>
            <input name="online_payment" type="number" value={form.online_payment} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Remaining Amount</label>
            <input name="remaining_amount" type="number" value={form.remaining_amount} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">WhatsApp Added</label>
            <select name="whatsapp_added" value={form.whatsapp_added} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Join Message Status</label>
            <select name="join_message_status" value={form.join_message_status} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Renewal Message Status</label>
            <select name="renewal_message_status" value={form.renewal_message_status} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <button type="submit" disabled={saving} className="w-full rounded-3xl bg-sky-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50 dark:bg-orange-500 dark:hover:bg-orange-400">
              {saving ? 'Saving...' : mode === 'create' ? 'Create Member' : 'Update Member'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default MemberForm;
