export const normalizePhoneNumber = (phone) => {
  const digits = (phone || '').replace(/[^0-9]/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
};

export const buildWhatsAppUrl = (phone, message) => {
  const normalized = normalizePhoneNumber(phone);
  return `https://api.whatsapp.com/send?phone=${normalized}&text=${encodeURIComponent(message)}`;
};

export const buildJoinMessage = (member) => {
  const totalPaid = Number(member.cash_payment || 0) + Number(member.online_payment || 0);
  const expiryDate = member.end_date ? new Date(member.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'soon';
  const packageName = member.package_name || 'membership';

  return `Hi ${member.full_name}!\n\nThanks for joining our gym. Your ${packageName} plan is active until ${expiryDate}.\n\nPayment received: ₹${totalPaid.toFixed(2)}.\n\nWe’re excited to welcome you to the gym family. See you soon! 💪`;
};

export const buildExpiryMessage = (member) => {
  const expiryDate = member.end_date ? new Date(member.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'soon';
  return `Hi ${member.full_name}!\n\nYour gym membership expires on ${expiryDate}. Please renew soon to continue your workouts without interruption.\n\nLet us know if you want help renewing. 💪`;
};

export const buildPaymentReceiptMessage = (member, amount, type, endDate) => {
  const formattedDate = endDate ? new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'soon';
  const paymentType = type === 'online' ? 'online' : 'cash';

  return `Hi ${member.full_name}!\n\nWe received your ${paymentType} payment of ₹${Number(amount).toFixed(2)}. Your membership is valid until ${formattedDate}.\n\nThank you for choosing our gym! 💪`;
};
