import { useState } from 'react';
import { Check, ChevronRight, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/cards';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useHaptics } from '@/hooks/useHaptics';
import { StepServiceSelection } from './steps/StepServiceSelection';
import { StepProviderSelection } from './steps/StepProviderSelection';
import { StepDateSelection } from './steps/StepDateSelection';
import { StepBeneficiarySelection } from './steps/StepBeneficiarySelection';
import { StepReviewConfirm } from './steps/StepReviewConfirm';
import { StepPayment } from './steps/StepPayment';
import type { Service } from '@/hooks/useServices';
import type { Beneficiary } from '@/hooks/useBeneficiaries';

export interface BookingData {
  serviceType: 'umrah' | 'hajj' | 'ziyarat' | null;
  service: Service | null;
  beneficiary: Beneficiary | null;
  specialRequests: string;
  scheduledDate: Date | null;
}

interface BookingWizardProps {
  onComplete: (data: BookingData) => Promise<void>;
}

const steps = [
  { id: 'service', labelEn: 'Service', labelAr: 'الخدمة', icon: '🕋' },
  { id: 'provider', labelEn: 'Provider', labelAr: 'المقدم', icon: '✓' },
  { id: 'date', labelEn: 'Date', labelAr: 'التاريخ', icon: '📅' },
  { id: 'beneficiary', labelEn: 'Beneficiary', labelAr: 'المستفيد', icon: '👤' },
  { id: 'review', labelEn: 'Review', labelAr: 'المراجعة', icon: '📋' },
  { id: 'payment', labelEn: 'Payment', labelAr: 'الدفع', icon: '💳' },
];

export function BookingWizard({ onComplete }: BookingWizardProps) {
  const { isRTL } = useLanguage();
  const { trigger } = useHaptics();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceType: null,
    service: null,
    beneficiary: null,
    specialRequests: '',
    scheduledDate: null,
  });

  const ArrowNext = isRTL ? ChevronLeft : ChevronRight;
  const ArrowPrev = isRTL ? ChevronRight : ChevronLeft;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!bookingData.serviceType;
      case 1:
        return !!bookingData.service;
      case 2:
        return !!bookingData.scheduledDate;
      case 3:
        return !!bookingData.beneficiary;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      trigger('light');
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      trigger('light');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index < currentStep) {
      trigger('light');
      setCurrentStep(index);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    trigger('success');
    try {
      await onComplete(bookingData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepServiceSelection
            selected={bookingData.serviceType}
            onSelect={(type) => {
              trigger('selection');
              updateBookingData({ serviceType: type, service: null, scheduledDate: null });
            }}
          />
        );
      case 1:
        return (
          <StepProviderSelection
            serviceType={bookingData.serviceType!}
            selected={bookingData.service}
            onSelect={(service) => {
              trigger('selection');
              updateBookingData({ service, scheduledDate: null });
            }}
          />
        );
      case 2:
        return (
          <StepDateSelection
            service={bookingData.service!}
            selectedDate={bookingData.scheduledDate}
            onSelectDate={(date) => {
              trigger('selection');
              updateBookingData({ scheduledDate: date });
            }}
          />
        );
      case 3:
        return (
          <StepBeneficiarySelection
            selected={bookingData.beneficiary}
            onSelect={(beneficiary) => {
              trigger('selection');
              updateBookingData({ beneficiary });
            }}
          />
        );
      case 4:
        return (
          <StepReviewConfirm
            data={bookingData}
            onUpdate={updateBookingData}
          />
        );
      case 5:
        return (
          <StepPayment
            data={bookingData}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Quote */}
      <div className="text-center animate-fade-in">
        <div className={cn(
          'inline-flex items-center gap-2 px-5 py-2.5 rounded-full',
          'bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10',
          'border border-primary/20 backdrop-blur-sm',
          'text-primary text-sm shadow-lg shadow-primary/10'
        )}>
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className={cn(isRTL && 'font-arabic')}>
            {isRTL 
              ? 'وَمَن تَطَوَّعَ خَيْرًا فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ'
              : 'Whoever volunteers good, Allah is appreciative and knowing'}
          </span>
        </div>
      </div>

      {/* Progress Steps - Horizontal Scroll on Mobile */}
      <nav aria-label="Progress" className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        <ol className="flex items-center justify-start md:justify-center min-w-max gap-1 md:gap-2">
          {steps.map((step, index) => (
            <li key={step.id} className="relative flex items-center">
              {/* Step Circle */}
              <button
                onClick={() => handleStepClick(index)}
                disabled={index > currentStep}
                className={cn(
                  'relative flex flex-col items-center group',
                  index <= currentStep && 'cursor-pointer',
                  index > currentStep && 'cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-2xl',
                    'transition-all duration-300 font-medium',
                    index < currentStep
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30'
                      : index === currentStep
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20 scale-110'
                      : 'bg-muted/80 text-muted-foreground'
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-base">{step.icon}</span>
                  )}
                </div>
                <span className={cn(
                  'mt-2 text-[10px] md:text-xs font-medium text-center max-w-[50px] md:max-w-[70px] leading-tight',
                  'transition-colors duration-200',
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {isRTL ? step.labelAr : step.labelEn}
                </span>
              </button>
              
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    'w-6 md:w-10 h-0.5 mx-1 rounded-full transition-all duration-500',
                    index < currentStep 
                      ? 'bg-gradient-to-r from-primary to-primary/80' 
                      : 'bg-muted/60'
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content Card */}
      <GlassCard className="min-h-[450px] p-6 md:p-8 animate-fade-in">
        {renderStepContent()}
      </GlassCard>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={cn(
            'h-12 px-6 rounded-xl border-2 gap-2',
            'transition-all duration-200',
            'hover:bg-muted/50 disabled:opacity-50'
          )}
        >
          <ArrowPrev className="h-4 w-4" />
          <span className="hidden sm:inline">{isRTL ? 'السابق' : 'Previous'}</span>
        </Button>

        {/* Step Counter - Mobile */}
        <div className="sm:hidden text-sm text-muted-foreground">
          {currentStep + 1} / {steps.length}
        </div>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(
              'h-12 px-8 rounded-xl gap-2',
              'bg-gradient-to-r from-primary to-primary/90',
              'shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40',
              'transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            )}
          >
            <span>{isRTL ? 'التالي' : 'Next'}</span>
            <ArrowNext className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={isSubmitting}
            className={cn(
              'h-12 px-8 rounded-xl gap-2',
              'bg-gradient-to-r from-green-500 to-emerald-500',
              'shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40',
              'transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
            )}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRTL ? 'تأكيد الحجز' : 'Confirm Booking'}
          </Button>
        )}
      </div>
    </div>
  );
}
