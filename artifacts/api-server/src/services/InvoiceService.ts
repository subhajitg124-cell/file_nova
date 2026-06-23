import { db, subscriptionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerEmail: string;
  planName: string;
  paymentMethod: string;
  transactionId: string;
  currency: string;
  originalAmount: number; // in paise
  discountAmount: number; // in paise
  netAmount: number; // in paise
  gstRate: number; // e.g. 18 for 18%
  cgstAmount: number; // in paise
  sgstAmount: number; // in paise
  baseAmount: number; // in paise (amount before GST)
  supportEmail: string;
}

export class InvoiceService {
  public static async generateInvoiceForSubscription(
    subscriptionId: string
  ): Promise<InvoiceDetails | null> {
    try {
      const [sub] = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.id, subscriptionId))
        .limit(1);

      if (!sub) {
        logger.error({ subscriptionId }, "Subscription not found to generate invoice");
        return null;
      }

      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, sub.userId))
        .limit(1);

      const customerName = user?.name || "Valued Customer";
      const customerEmail = user?.email || "billing@filenova.in";
      const invoiceNumber = `INV-${sub.id.substring(0, 8).toUpperCase()}-${new Date(sub.createdAt).getFullYear()}`;

      // GST math (18% GST typical for Indian SaaS: 9% CGST + 9% SGST)
      const netAmount = sub.amount; // amount paid by user in paise
      
      // Let's assume the base amount and taxes add up to netAmount
      // baseAmount * 1.18 = netAmount
      const baseAmount = Math.round(netAmount / 1.18);
      const totalGst = netAmount - baseAmount;
      const cgstAmount = Math.round(totalGst / 2);
      const sgstAmount = totalGst - cgstAmount;

      const transactionId = sub.razorpayPaymentId || `upi_${sub.razorpayOrderId || sub.id}`;
      const paymentMethod = sub.razorpayPaymentId?.startsWith("upi_") ? "UPI QR Transfer" : "Razorpay Checkout";

      return {
        invoiceNumber,
        invoiceDate: sub.createdAt,
        customerName,
        customerEmail,
        planName: sub.plan.toUpperCase(),
        paymentMethod,
        transactionId,
        currency: sub.currency,
        originalAmount: sub.amount, // base price already discounted
        discountAmount: 0, // already applied on order creation
        netAmount,
        gstRate: 18,
        baseAmount,
        cgstAmount,
        sgstAmount,
        supportEmail: process.env.SUPPORT_EMAIL || "support@filenova.in",
      };
    } catch (err) {
      logger.error({ err, subscriptionId }, "Error generating invoice for subscription");
      return null;
    }
  }
}
