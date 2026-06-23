export const FILENOVA_UPI_ID = "9064560741@upi";
export const FILENOVA_PAYEE_NAME = "Subhajit Ghosh";

export function createUpiLink(amount: number, note: string) {
  // Avoid URL-encoding the '@' symbol in the UPI ID as it breaks some UPI apps
  return `upi://pay?pa=${FILENOVA_UPI_ID}&pn=${encodeURIComponent(FILENOVA_PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
}

export function createUpiQrUrl(amount: number) {
  const params = new URLSearchParams({
    name: FILENOVA_PAYEE_NAME,
    vpa: FILENOVA_UPI_ID,
    amount: String(amount),
  });

  return `https://upiqr.in/api/qr?${params.toString()}`;
}
