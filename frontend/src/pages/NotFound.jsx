import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-center px-4">
    <h1 className="text-6xl font-bold text-orange-400">404</h1>
    <p className="mt-4 text-xl text-slate-300">Page not found.</p>
    <Link to="/" className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 text-base font-semibold text-slate-950 hover:bg-orange-400">
      Back to dashboard
    </Link>
  </div>
);

export default NotFound;
