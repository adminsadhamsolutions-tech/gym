import Layout from '../components/layout/Layout';

const Settings = () => {
  return (
    <Layout>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Settings</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Update system preferences, admin details, and API environment settings.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">App Configuration</h3>
            <p className="mt-3 text-slate-500 dark:text-slate-400">Use the backend environment file to manage database and JWT settings.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">UI Theme</h3>
                <p className="mt-3 text-slate-500 dark:text-slate-400">Light theme with skyblue accents and dark mode with orange accents.</p>
              </div>
            </div>
          </div>
    </Layout>
  );
};

export default Settings;
