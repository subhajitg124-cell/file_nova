export const FILENOVA_UPI_ID = "9064560741@slc";
export const FILENOVA_PAYEE_NAME = "Subhajit Ghosh";

export function createUpiLink(amount: number, note: string) {
  const params = new URLSearchParams({
    pa: FILENOVA_UPI_ID,
    pn: FILENOVA_PAYEE_NAME,
    am: String(amount),
    cu: "INR",
    tn: note,
  });

  return `upi://pay?${params.toString()}`;
}

export function createUpiQrUrl(amount: number) {
  const params = new URLSearchParams({
    name: FILENOVA_PAYEE_NAME,
    vpa: FILENOVA_UPI_ID,
    amount: String(amount),
  });

  return `https://upiqr.in/api/qr?${params.toString()}`;
}
