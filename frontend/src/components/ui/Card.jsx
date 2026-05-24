const Card = ({ title, value, icon, variant = 'default', children }) => {
  return (
    <div className={`rounded-3xl border p-6 shadow-soft ${variant === 'accent' ? 'bg-gradient-to-br from-sky-500 to-sky-400 text-slate-950 border-transparent dark:from-orange-500 dark:to-orange-400 dark:text-slate-950' : 'bg-white border-slate-200 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100'}`}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{title}</p>
          <h2 className="mt-2 text-3xl font-semibold">{value}</h2>
        </div>
        {icon && <div className="text-3xl text-sky-500 dark:text-orange-400">{icon}</div>}
      </div>
      {children}
    </div>
  );
};

export default Card;
