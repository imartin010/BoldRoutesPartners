import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDataStore } from '../store/data';
import Card from '../components/Card';
import CurrencyInput from '../components/CurrencyInput';
import FileDropzone from '../components/FileDropzone';
import Toast from '../components/Toast';
import { validatePhone } from '../utils/phone';
import { CheckCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const schema = z.object({
  developerName: z.string().min(1, 'Developer name is required'),
  projectName: z.string().min(1, 'Project name is required'),
  clientFullName: z.string().min(1, 'Client full name is required'),
  unitCode: z.string().min(1, 'Unit code is required'),
  developerSalesName: z.string().min(1, 'Developer sales name is required'),
  developerPhone: z.string().refine(validatePhone, 'Invalid phone number (10-15 digits)'),
  dealValue: z.string().min(1, 'Deal value is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Deal value must be greater than 0'
  ),
});

type FormData = z.infer<typeof schema>;

interface FileInfo {
  name: string;
  size: number;
  type: string;
  url: string;
}

export default function CloseDeal() {
  const { commissions, addClosedDeal } = useDataStore();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const dealValue = watch('dealValue');

  const onSubmit = (data: FormData) => {
    try {
      const fileNames = files.map(file => file.name);
      
      addClosedDeal({
        ...data,
        dealValue: parseFloat(data.dealValue),
        fileNames,
      });

      setIsSubmitted(true);
      setToast({
        message: 'Deal submitted successfully! Your submission has been recorded.',
        type: 'success'
      });

      // Reset form
      reset();
      setFiles([]);
    } catch (error) {
      setToast({
        message: 'Failed to submit deal. Please try again.',
        type: 'error'
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Deal Submitted Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Your deal has been recorded and will be processed shortly. You'll receive confirmation once it's been reviewed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn-primary"
            >
              Submit Another Deal
            </button>
            <Link to="/submissions" className="btn-secondary">
              View Submissions
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Close a Deal</h1>
        <p className="text-gray-600">
          Submit your closed deal details for commission processing.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Developer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer Name *
              </label>
              <select
                {...register('developerName')}
                className={`select ${errors.developerName ? 'border-red-500' : ''}`}
              >
                <option value="">Select developer...</option>
                {commissions.map((commission) => (
                  <option key={commission.developerId} value={commission.developerName}>
                    {commission.developerName}
                  </option>
                ))}
              </select>
              {errors.developerName && (
                <p className="mt-1 text-sm text-red-600">{errors.developerName.message}</p>
              )}
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                {...register('projectName')}
                className={`input ${errors.projectName ? 'border-red-500' : ''}`}
                placeholder="Enter project name"
              />
              {errors.projectName && (
                <p className="mt-1 text-sm text-red-600">{errors.projectName.message}</p>
              )}
            </div>

            {/* Client Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Full Name *
              </label>
              <input
                type="text"
                {...register('clientFullName')}
                className={`input ${errors.clientFullName ? 'border-red-500' : ''}`}
                placeholder="Enter client's full name"
              />
              {errors.clientFullName && (
                <p className="mt-1 text-sm text-red-600">{errors.clientFullName.message}</p>
              )}
            </div>

            {/* Unit Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Code *
              </label>
              <input
                type="text"
                {...register('unitCode')}
                className={`input ${errors.unitCode ? 'border-red-500' : ''}`}
                placeholder="Enter unit code"
              />
              {errors.unitCode && (
                <p className="mt-1 text-sm text-red-600">{errors.unitCode.message}</p>
              )}
            </div>

            {/* Developer Sales Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer Sales Name *
              </label>
              <input
                type="text"
                {...register('developerSalesName')}
                className={`input ${errors.developerSalesName ? 'border-red-500' : ''}`}
                placeholder="Enter sales representative name"
              />
              {errors.developerSalesName && (
                <p className="mt-1 text-sm text-red-600">{errors.developerSalesName.message}</p>
              )}
            </div>

            {/* Developer Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer Phone *
              </label>
              <input
                type="tel"
                {...register('developerPhone')}
                className={`input ${errors.developerPhone ? 'border-red-500' : ''}`}
                placeholder="Enter phone number"
              />
              <p className="mt-1 text-xs text-gray-500">
                10-15 digits, international format preferred (e.g., +201002275857)
              </p>
              {errors.developerPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.developerPhone.message}</p>
              )}
            </div>
          </div>

          {/* Deal Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deal Value *
            </label>
            <CurrencyInput
              value={dealValue || ''}
              onChange={(value) => setValue('dealValue', value)}
              error={errors.dealValue?.message}
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <FileDropzone
              files={files}
              onFilesChange={setFiles}
              maxFiles={5}
              acceptedTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']}
            />
            <p className="mt-2 text-sm text-gray-500">
              Upload contracts, receipts, or other relevant documents (PDF, JPG, PNG - Max 5 files)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              <FileText className="w-5 h-5 mr-2" />
              Submit Deal
            </button>
          </div>
        </form>
      </Card>

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
