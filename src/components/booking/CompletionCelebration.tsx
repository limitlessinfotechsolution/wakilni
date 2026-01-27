import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { Star, Download, MessageCircle } from 'lucide-react';

interface CompletionCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  beneficiaryName: string;
  onReview?: () => void;
  onDownloadCertificate?: () => void;
  onDownloadInvoice?: () => void;
}

export function CompletionCelebration({
  isOpen,
  onClose,
  serviceName,
  beneficiaryName,
  onReview,
  onDownloadCertificate,
  onDownloadInvoice,
}: CompletionCelebrationProps) {
  const { isRTL } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#166534', '#d4a853', '#22c55e', '#eab308', '#ffffff']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
        />
      )}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="py-6 space-y-6">
            {/* Celebration Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center animate-bounce">
              <span className="text-4xl">🎉</span>
            </div>

            {/* Title */}
            <div>
              <h2 className={`text-2xl font-bold text-primary mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'مبروك!' : 'Congratulations!'}
              </h2>
              <p className="text-muted-foreground">
                {isRTL 
                  ? `تم إكمال خدمة "${serviceName}" بنجاح لـ ${beneficiaryName}`
                  : `"${serviceName}" has been successfully completed for ${beneficiaryName}`}
              </p>
            </div>

            {/* Islamic Blessing */}
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-sm text-primary font-arabic" dir="rtl">
                تقبل الله طاعتكم
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                May Allah accept your worship
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {onReview && (
                <Button onClick={onReview} className="w-full" size="lg">
                  <Star className="h-5 w-5 me-2" />
                  {isRTL ? 'قيّم الخدمة' : 'Rate the Service'}
                </Button>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                {onDownloadCertificate && (
                  <Button variant="outline" onClick={onDownloadCertificate}>
                    <Download className="h-4 w-4 me-2" />
                    {isRTL ? 'الشهادة' : 'Certificate'}
                  </Button>
                )}
                {onDownloadInvoice && (
                  <Button variant="outline" onClick={onDownloadInvoice}>
                    <Download className="h-4 w-4 me-2" />
                    {isRTL ? 'الفاتورة' : 'Invoice'}
                  </Button>
                )}
              </div>

              <Button variant="ghost" onClick={onClose} className="w-full">
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
