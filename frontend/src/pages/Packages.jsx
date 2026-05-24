import { useEffect, useState } from 'react';
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaBoxOpen,
  FaRupeeSign,
  FaCalendarAlt,
} from 'react-icons/fa';

import axios from '../api/axiosConfig';
import Layout from '../components/layout/Layout';
import Loader from '../components/ui/Loader';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    duration_days: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const loadPackages = async () => {
    try {
      const response = await axios.get('/packages');
      setPackages(response.data.data || []);
    } catch (err) {
      setError('Unable to load packages.');
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      await loadPackages();
      setLoading(false);
    };

    fetchPackages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {
      if (editId) {
        await axios.post(`/packages/${editId}`, form, {
          headers: {
            'X-HTTP-Method-Override': 'PUT',
          },
        });
      } else {
        await axios.post('/packages', form);
      }

      setForm({
        name: '',
        price: '',
        duration_days: '',
      });

      setEditId(null);

      await loadPackages();
    } catch (err) {
      setError('Unable to save package.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pkg) => {
    setForm({
      name: pkg.name,
      price: pkg.price,
      duration_days: pkg.duration_days,
    });

    setEditId(pkg.id);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this package?'
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`/packages/${id}`);
      await loadPackages();
    } catch (err) {
      setError('Unable to delete package.');
    }
  };

  if (loading) return <Loader />;

  return (
    <Layout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 rounded-[30px] bg-gradient-to-r from-sky-500 to-blue-600 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Membership Packages
            </h1>

            <p className="mt-2 text-sm text-sky-100">
              Create and manage gym membership plans easily.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-sky-100">Total Packages</p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                {packages.length}
              </h2>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-sky-100">Status</p>
              <h2 className="mt-1 text-xl font-bold text-white">Active</h2>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          {/* FORM */}
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                <FaPlus />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editId ? 'Update Package' : 'Add New Package'}
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Fill package details below
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* PACKAGE NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Package Name
                </label>

                <input
                  type="text"
                  placeholder="Example: Premium Plan"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-sky-900"
                />
              </div>

              {/* PRICE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Package Price
                </label>

                <div className="relative">
                  <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="number"
                    placeholder="5000"
                    value={form.price}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-sky-900"
                  />
                </div>
              </div>

              {/* DURATION */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Duration (Days)
                </label>

                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="number"
                    placeholder="30"
                    value={form.duration_days}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        duration_days: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-sky-900"
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-70"
                >
                  {saving
                    ? 'Saving...'
                    : editId
                    ? 'Update Package'
                    : 'Create Package'}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(null);
                      setForm({
                        name: '',
                        price: '',
                        duration_days: '',
                      });
                    }}
                    className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {error && (
                <div className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* PACKAGES LIST */}
          <div className="space-y-5">
            {packages.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[30px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-950">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <FaBoxOpen />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  No Packages Found
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Create your first membership package now.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950"
                  >
                    {/* TOP */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl text-sky-600">
                          <FaBoxOpen />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {pkg.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Membership Package
                        </p>
                      </div>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        Active
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Price
                        </p>

                        <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                          ₹{pkg.price}
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Duration
                        </p>

                        <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                          {pkg.duration_days}
                          <span className="ml-1 text-sm font-medium">
                            Days
                          </span>
                        </h3>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                      >
                        <FaTrashAlt />
                        Delete
                      </button>
                    </div>

                    {/* DECORATION */}
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500/10 blur-2xl"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Packages;