import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDataStore } from '../store/data';
import Card from '../components/Card';
import Toast from '../components/Toast';
import { validatePhone, getWhatsAppLink } from '../utils/phone';
import { CheckCircle, MessageCircle, Users } from 'lucide-react';

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().refine(validatePhone, 'Invalid phone number (10-15 digits)'),
  companyName: z.string().min(1, 'Company name is required'),
  salesAgentsCount: z.coerce.number().min(1, 'Must have at least 1 sales agent'),
  hasRegisteredPapers: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function Apply() {
  const { addPartnerApplication } = useDataStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      hasRegisteredPapers: false,
    },
  });

  const onSubmit = (data: FormData) => {
    try {
      addPartnerApplication(data);
      setSubmittedData(data);
      setIsSubmitted(true);
      setToast({
        message: 'Application submitted successfully!',
        type: 'success'
      });
      reset();
    } catch (error) {
      setToast({
        message: 'Failed to submit application. Please try again.',
        type: 'error'
      });
    }
  };

  if (isSubmitted && submittedData) {
    const whatsappLink = getWhatsAppLink(
      submittedData.phoneNumber,
      `Hi Bold Routes! I just submitted my partner application for ${submittedData.companyName}. My name is ${submittedData.fullName} and I'd like to discuss the next steps.`
    );

    return (
      <div className="container-mobile section">
        <div className="card-elevated text-center p-6 sm:p-8">
          <CheckCircle className="w-16 h-16 text-brand-fg mx-auto mb-6" aria-hidden="true" />
          <h1 className="h1 mb-4">Application Submitted!</h1>
          <p className="lead mb-8 text-balance">
            Thank you for your interest in becoming a Bold Routes partner. We've received your application and will review it shortly.
          </p>
          
          <div className="bg-brand-muted rounded-lg p-6 mb-8 text-left">
            <h3 className="h3 mb-4 text-center">Next Steps:</h3>
            <ul className="text-brand-fg opacity-80 space-y-2 list-disc list-inside">
              <li>Our team will review your application within 2-3 business days</li>
              <li>We'll contact you to discuss partnership terms</li>
              <li>Complete the onboarding process and start earning</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" aria-hidden="true" />
              Contact Us on WhatsApp
            </a>
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn-secondary"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 section">
      <header className="mb-8 text-center lg:text-left">
        <h1 className="h1 mb-4 text-balance">Partner Application</h1>
        <p className="lead text-balance">
          Join our network of successful real estate partners and start earning better commissions.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Benefits Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="card p-6">
            <h3 className="h3 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-brand-fg" aria-hidden="true" />
              Partner Benefits
            </h3>
            <div className="space-y-4">
              <div className="border-l-4 border-brand-fg pl-4">
                <h4 className="font-medium text-brand-fg">Higher Commission Rates</h4>
                <p className="text-sm text-brand-fg opacity-60">Earn up to 5% on all closed deals</p>
              </div>
              <div className="border-l-4 border-brand-fg pl-4">
                <h4 className="font-medium text-brand-fg">Marketing Support</h4>
                <p className="text-sm text-brand-fg opacity-60">Professional materials and campaigns</p>
              </div>
              <div className="border-l-4 border-brand-fg pl-4">
                <h4 className="font-medium text-brand-fg">Dedicated Support</h4>
                <p className="text-sm text-brand-fg opacity-60">Personal account manager</p>
              </div>
              <div className="border-l-4 border-brand-fg pl-4">
                <h4 className="font-medium text-brand-fg">Exclusive Launches</h4>
                <p className="text-sm text-brand-fg opacity-60">Early access to new projects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="card p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Full Name */}
              <div className="form-field">
                <label htmlFor="fullName" className="form-label">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  {...register('fullName')}
                  className={`form-input ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your full name"
                  aria-invalid={errors.fullName ? 'true' : 'false'}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="form-error" role="alert">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="form-field">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number *
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  {...register('phoneNumber')}
                  className={`form-input ${errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="+201002275857"
                  aria-invalid={errors.phoneNumber ? 'true' : 'false'}
                  aria-describedby="phoneNumber-help phoneNumber-error"
                />
                <p id="phoneNumber-help" className="muted mt-1">
                  10-15 digits, international format preferred (e.g., +201002275857)
                </p>
                {errors.phoneNumber && (
                  <p id="phoneNumber-error" className="form-error" role="alert">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Company Name */}
              <div className="form-field">
                <label htmlFor="companyName" className="form-label">
                  Company Name *
                </label>
                <input
                  id="companyName"
                  type="text"
                  {...register('companyName')}
                  className={`form-input ${errors.companyName ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your company name"
                  aria-invalid={errors.companyName ? 'true' : 'false'}
                  aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                />
                {errors.companyName && (
                  <p id="companyName-error" className="form-error" role="alert">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              {/* Sales Agents Count */}
              <div className="form-field">
                <label htmlFor="salesAgentsCount" className="form-label">
                  Number of Sales Agents *
                </label>
                <input
                  id="salesAgentsCount"
                  type="number"
                  min="1"
                  {...register('salesAgentsCount')}
                  className={`form-input ${errors.salesAgentsCount ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="1"
                  aria-invalid={errors.salesAgentsCount ? 'true' : 'false'}
                  aria-describedby={errors.salesAgentsCount ? 'salesAgentsCount-error' : undefined}
                />
                {errors.salesAgentsCount && (
                  <p id="salesAgentsCount-error" className="form-error" role="alert">
                    {errors.salesAgentsCount.message}
                  </p>
                )}
              </div>

              {/* Company Registration */}
              <fieldset className="form-field">
                <legend className="form-label">Company Registration</legend>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <label className="flex items-center min-h-[44px]">
                    <input
                      type="radio"
                      {...register('hasRegisteredPapers')}
                      value="true"
                      className="w-4 h-4 text-brand-fg border-brand-border focus:ring-2 focus:ring-brand-fg"
                    />
                    <span className="ml-3 text-sm text-brand-fg">Yes, registered</span>
                  </label>
                  <label className="flex items-center min-h-[44px]">
                    <input
                      type="radio"
                      {...register('hasRegisteredPapers')}
                      value="false"
                      className="w-4 h-4 text-brand-fg border-brand-border focus:ring-2 focus:ring-brand-fg"
                    />
                    <span className="ml-3 text-sm text-brand-fg">No, not registered</span>
                  </label>
                </div>
                <p className="muted mt-2">
                  Registration is not required to start, but may affect commission rates
                </p>
              </fieldset>

              {/* Submit Button */}
              <div className="flex justify-center sm:justify-end pt-4">
                <button type="submit" className="btn-primary w-full sm:w-auto">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
