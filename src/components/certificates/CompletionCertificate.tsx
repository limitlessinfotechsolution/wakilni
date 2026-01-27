import { forwardRef } from 'react';
import { useLanguage } from '@/lib/i18n';

interface CertificateData {
  bookingId: string;
  beneficiaryName: string;
  serviceType: 'umrah' | 'hajj' | 'ziyarat';
  serviceTitle: string;
  providerName: string;
  completedDate: string;
  travelerName: string;
}

interface CompletionCertificateProps {
  data: CertificateData;
}

export const CompletionCertificate = forwardRef<HTMLDivElement, CompletionCertificateProps>(
  ({ data }, ref) => {
    const { isRTL } = useLanguage();
    
    const serviceTypeLabels = {
      umrah: { en: 'Umrah', ar: 'العمرة' },
      hajj: { en: 'Hajj', ar: 'الحج' },
      ziyarat: { en: 'Ziyarat', ar: 'الزيارة' },
    };

    const completedDate = new Date(data.completedDate);
    const hijriDate = completedDate.toLocaleDateString('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const gregorianDate = completedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div
        ref={ref}
        className="w-[800px] h-[600px] bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8] p-8 relative overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='0.05'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0zm0 10L50 30L30 50L10 30L30 10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Decorative Border */}
        <div className="absolute inset-4 border-4 border-[#166534]/20 rounded-lg pointer-events-none" />
        <div className="absolute inset-6 border border-[#d4a853]/30 rounded-lg pointer-events-none" />

        {/* Corner Decorations */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-[#166534] rounded-tl-lg" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-[#166534] rounded-tr-lg" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-[#166534] rounded-bl-lg" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-[#166534] rounded-br-lg" />

        <div className="relative h-full flex flex-col items-center justify-between py-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#166534] flex items-center justify-center">
                <span className="text-3xl text-white font-arabic">و</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[#166534] mb-1 font-arabic">شهادة إتمام</h1>
            <h2 className="text-2xl font-semibold text-[#166534]">Certificate of Completion</h2>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-6 max-w-xl">
            <p className="text-lg text-gray-600">This is to certify that</p>
            
            <div className="py-4 border-y-2 border-[#d4a853]/30">
              <p className="text-3xl font-bold text-[#166534] font-arabic">{data.beneficiaryName}</p>
            </div>

            <p className="text-lg text-gray-600">
              has successfully completed the {serviceTypeLabels[data.serviceType].en} service
            </p>

            <div className="bg-[#166534]/5 rounded-lg p-4">
              <p className="text-xl font-semibold text-[#166534]">{data.serviceTitle}</p>
              <p className="text-sm text-gray-500 mt-1">
                {isRTL ? 'تمت بواسطة' : 'Performed by'}: {data.providerName}
              </p>
            </div>

            <p className="text-lg text-gray-600">
              On behalf of: <strong>{data.travelerName}</strong>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-500">{isRTL ? 'التاريخ الميلادي' : 'Gregorian Date'}</p>
                <p className="font-semibold text-[#166534]">{gregorianDate}</p>
              </div>
              <div className="w-px h-10 bg-[#d4a853]/50" />
              <div className="text-center">
                <p className="text-sm text-gray-500">{isRTL ? 'التاريخ الهجري' : 'Hijri Date'}</p>
                <p className="font-semibold text-[#166534] font-arabic">{hijriDate}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>Certificate ID: {data.bookingId.slice(0, 8).toUpperCase()}</span>
              <span>•</span>
              <span>وكّلني | Wakilni Platform</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CompletionCertificate.displayName = 'CompletionCertificate';
