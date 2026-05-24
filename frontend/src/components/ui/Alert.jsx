import { useEffect } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const Alert = ({ type = 'info', message, onClose, autoClose = 5000 }) => {
  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
  };

  const textColors = {
    success: 'text-emerald-700 dark:text-emerald-300',
    error: 'text-red-700 dark:text-red-300',
    warning: 'text-yellow-700 dark:text-yellow-300',
    info: 'text-blue-700 dark:text-blue-300'
  };

  const icons = {
    success: <FaCheckCircle className="text-emerald-600 dark:text-emerald-400" />,
    error: <FaExclamationTriangle className="text-red-600 dark:text-red-400" />,
    warning: <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400" />,
    info: <FaInfoCircle className="text-blue-600 dark:text-blue-400" />
  };

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <div className={`border rounded-2xl p-4 flex items-start gap-4 ${bgColors[type]}`}>
      <div className="text-xl mt-0.5">{icons[type]}</div>
      <div className={`flex-1 text-sm font-medium ${textColors[type]}`}>{message}</div>
      <button
        onClick={onClose}
        className={`ml-auto inline-flex p-1 rounded-full transition ${textColors[type]} hover:bg-black/10`}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Alert;
