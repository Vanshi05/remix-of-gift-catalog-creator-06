export interface InvoiceLineItem {
  id: string;
  gift_hamper_name: string;
  mrp: number;
  pre_tax_price: number;
  qty_sold: number;
  gst: number;
  gh_config: string; // Product description/contents
  amount: number; // Pre-calculated amount
}

export interface InvoiceHeader {
  invoiceNumber: string;
  invoiceDate: string;
  billingAddress: string;
  gst: string;
  contactPerson: string;
  contactMobile?: string;
  contactEmail?: string;
  recordId?: string;
}

export interface InvoiceTotals {
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export interface SellerInfo {
  name: string;
  address: string;
  gst: string;
  phone?: string;
  email?: string;
}

export interface BankDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  location?: string;
}

export interface PaymentTerms {
  terms: string[];
}

export interface InvoiceData {
  invoice: InvoiceHeader;
  items: InvoiceLineItem[];
  totals: InvoiceTotals;
  seller: SellerInfo;
  bankDetails: BankDetails;
  terms: string[];
  paymentTerms?: string[];
}

export interface RecentInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  billingAddress: string;
}
