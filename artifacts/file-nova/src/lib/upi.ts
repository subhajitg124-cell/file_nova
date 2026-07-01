export const FILENOVA_UPI_ID = "9064560741@upi";
export const FILENOVA_UPI_DIRECT_PAY = "9064560741@upi/9064560741@slc";
export const FILENOVA_PAYEE_NAME = "Subhajit Ghosh";

export function createUpiLink(amount: number, note: string) {
  // Use the direct UPI payment address so mobile apps open the payment flow immediately.
  return `upi://pay?pa=${FILENOVA_UPI_DIRECT_PAY}&pn=${encodeURIComponent(FILENOVA_PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
}

export function createUpiQrUrl(amount: number, note = "Support FileNova") {
  const upiLink = createUpiLink(amount, note);
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiLink)}`;
}
