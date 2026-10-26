/**
 * Format Indian Rupees with comma separation (e.g. ₹1,450.00)
 */
export const formatINR = (amount) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
