import { forwardRef } from 'react';
import { useLanguage } from '@/lib/i18n';

interface InvoiceLineItem {
  description: string;
  descriptionAr?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  bookingId: string;
  issueDate: string;
  dueDate?: string;
  
  // Biller (Wakilni)
  billerName: string;
  billerAddress: string;
  billerVat?: string;
  
  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  
  // Provider
  providerName: string;
  
  // Line items
  items: InvoiceLineItem[];
  
  // Totals
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  currency: string;
  
  // Payment
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  paidAt?: string;
}

interface BookingInvoiceProps {
  data: InvoiceData;
}

export const BookingInvoice = forwardRef<HTMLDivElement, BookingInvoiceProps>(
  ({ data }, ref) => {
    const { isRTL } = useLanguage();

    const formatCurrency = (amount: number) => {
      return `${amount.toLocaleString()} ${data.currency}`;
    };

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const getPaymentStatusLabel = (status: string) => {
      const labels = {
        pending: { en: 'Pending', ar: 'قيد الانتظار' },
        paid: { en: 'Paid', ar: 'مدفوع' },
        refunded: { en: 'Refunded', ar: 'مسترد' },
      };
      return isRTL ? labels[status as keyof typeof labels]?.ar : labels[status as keyof typeof labels]?.en;
    };

    const getPaymentStatusColor = (status: string) => {
      switch (status) {
        case 'paid': return 'bg-green-100 text-green-800';
        case 'refunded': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-orange-100 text-orange-800';
      }
    };

    return (
      <div
        ref={ref}
        className="w-[800px] bg-white p-8"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-[#166534]">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-[#166534] flex items-center justify-center">
                <span className="text-2xl text-white font-arabic">و</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#166534]">وكّلني</h1>
                <p className="text-sm text-gray-500">Wakilni Platform</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{data.billerAddress}</p>
            {data.billerVat && (
              <p className="text-sm text-gray-600">
                {isRTL ? 'الرقم الضريبي' : 'VAT No'}: {data.billerVat}
              </p>
            )}
          </div>
          
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isRTL ? 'فاتورة' : 'INVOICE'}
            </h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-500">{isRTL ? 'رقم الفاتورة' : 'Invoice #'}:</span>{' '}
                <span className="font-mono font-semibold">{data.invoiceNumber}</span>
              </p>
              <p>
                <span className="text-gray-500">{isRTL ? 'تاريخ الإصدار' : 'Issue Date'}:</span>{' '}
                {formatDate(data.issueDate)}
              </p>
              {data.dueDate && (
                <p>
                  <span className="text-gray-500">{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}:</span>{' '}
                  {formatDate(data.dueDate)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bill To / Provider */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">
              {isRTL ? 'العميل' : 'Bill To'}
            </h3>
            <p className="font-semibold text-gray-800">{data.customerName}</p>
            <p className="text-sm text-gray-600">{data.customerEmail}</p>
            {data.customerPhone && (
              <p className="text-sm text-gray-600">{data.customerPhone}</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">
              {isRTL ? 'مقدم الخدمة' : 'Service Provider'}
            </h3>
            <p className="font-semibold text-gray-800">{data.providerName}</p>
            <p className="text-sm text-gray-600">
              {isRTL ? 'رقم الحجز' : 'Booking ID'}: {data.bookingId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-start py-3 px-4 text-sm font-semibold text-gray-600">
                {isRTL ? 'الوصف' : 'Description'}
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 w-20">
                {isRTL ? 'الكمية' : 'Qty'}
              </th>
              <th className="text-end py-3 px-4 text-sm font-semibold text-gray-600 w-32">
                {isRTL ? 'سعر الوحدة' : 'Unit Price'}
              </th>
              <th className="text-end py-3 px-4 text-sm font-semibold text-gray-600 w-32">
                {isRTL ? 'المجموع' : 'Total'}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4 px-4">
                  <p className="font-medium text-gray-800">
                    {isRTL && item.descriptionAr ? item.descriptionAr : item.description}
                  </p>
                </td>
                <td className="text-center py-4 px-4 text-gray-600">{item.quantity}</td>
                <td className="text-end py-4 px-4 text-gray-600">{formatCurrency(item.unitPrice)}</td>
                <td className="text-end py-4 px-4 font-semibold text-gray-800">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{isRTL ? `ضريبة القيمة المضافة (${data.vatRate}%)` : `VAT (${data.vatRate}%)`}</span>
              <span>{formatCurrency(data.vatAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t-2 border-gray-200">
              <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
              <span className="text-[#166534]">{formatCurrency(data.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">{isRTL ? 'حالة الدفع' : 'Payment Status'}</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(data.paymentStatus)}`}>
              {getPaymentStatusLabel(data.paymentStatus)}
            </span>
          </div>
          {data.paymentMethod && (
            <div className="text-end">
              <p className="text-sm text-gray-500 mb-1">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</p>
              <p className="font-medium text-gray-800">{data.paymentMethod}</p>
            </div>
          )}
          {data.paidAt && (
            <div className="text-end">
              <p className="text-sm text-gray-500 mb-1">{isRTL ? 'تاريخ الدفع' : 'Paid On'}</p>
              <p className="font-medium text-gray-800">{formatDate(data.paidAt)}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>{isRTL ? 'شكراً لاستخدامكم منصة وكّلني' : 'Thank you for using Wakilni Platform'}</p>
          <p>support@wakilni.com | www.wakilni.com</p>
        </div>
      </div>
    );
  }
);

BookingInvoice.displayName = 'BookingInvoice';
