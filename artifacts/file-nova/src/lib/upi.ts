export const FILENOVA_UPI_ID = "9064560741@upi";
export const FILENOVA_PAYEE_NAME = "Subhajit Ghosh";

export function createUpiLink(amount: number, note: string) {
  // pa must be a single, valid UPI VPA — no slashes or compound addresses.
  return `upi://pay?pa=${FILENOVA_UPI_ID}&pn=${encodeURIComponent(FILENOVA_PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
}

export function createUpiQrUrl(amount: number, note = "Support FileNova") {
  const upiLink = createUpiLink(amount, note);
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiLink)}`;
}
