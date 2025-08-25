import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enhancedDealSchema, ClientRateLimiter } from "@/utils/inputValidation";
import { validateFiles, generateSecureFilename, formatFileSize } from "@/utils/fileValidation";
import { uploadDealFile, submitClosedDeal } from "@/api/public";
import { z } from "zod";

type FormData = z.infer<typeof enhancedDealSchema>;

// Client-side rate limiting (3 deal submissions per 5 minutes)
const rateLimiter = new ClientRateLimiter(3, 5 * 60 * 1000);

export default function CloseDeal() {
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(enhancedDealSchema)
  });
  const files = watch("files");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    setFileError(null);
    
    if (selectedFiles && selectedFiles.length > 0) {
      const validation = validateFiles(selectedFiles);
      if (!validation.isValid) {
        setFileError(validation.error || "Invalid files selected");
        // Clear the file input
        setValue("files", undefined);
        event.target.value = "";
        return;
      }
    }
  };

  const onSubmit = async (d: FormData) => {
    try {
      setSubmitError(null);
      setFileError(null);
      
      // Client-side rate limiting check
      const clientKey = `deal-${window.location.hostname}`;
      if (!rateLimiter.isAllowed(clientKey)) {
        setSubmitError("Too many deal submissions. Please wait 5 minutes before trying again.");
        return;
      }

      const paths: string[] = [];
      
      // Upload files with progress tracking
      if (d.files && d.files.length) {
        const fileArray = Array.from(d.files);
        
        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];
          const secureFilename = generateSecureFilename(file.name);
          
          try {
            // Update progress
            setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
            
            // Note: Real progress tracking would require chunked upload or server-sent events
            // For now, we'll simulate progress
            const progressInterval = setInterval(() => {
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: Math.min((prev[file.name] || 0) + 20, 90)
              }));
            }, 200);
            
            const path = await uploadDealFile(file);
            paths.push(path);
            
            clearInterval(progressInterval);
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          } catch (error) {
            setSubmitError(`Failed to upload file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
            return;
          }
        }
      }

      await submitClosedDeal({
        developer_name: d.developer_name,
        project_name: d.project_name,
        client_name: d.client_name,
        unit_code: d.unit_code,
        dev_sales_name: d.dev_sales_name,
        dev_phone: d.dev_phone,
        deal_value: Number(d.deal_value),
        attachmentPaths: paths
      });
      
      setSubmitSuccess(true);
      setUploadProgress({});
      reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Deal submission failed:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : "Failed to submit deal. Please try again."
      );
      setUploadProgress({});
    }
  };

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-semibold mb-4">Close a Deal</h1>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        {["developer_name","project_name","client_name","unit_code","dev_sales_name","dev_phone","deal_value"].map((k) => (
          <div key={k}>
            <label className="block capitalize">{k.replace(/_/g, " ")}
              <input className="input" type={k==="deal_value" ? "number":"text"} {...register(k as any)} />
            </label>
            {/* @ts-ignore */}
            {errors[k] && <p className="error">{errors[k]?.message as any}</p>}
          </div>
        ))}
        <label className="block">
          Attachments (PDF, Word docs, or images - max 10MB each, 5 files total)
          <input 
            type="file" 
            multiple 
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
            {...register("files")} 
            onChange={handleFileChange}
            className="input" 
          />
        </label>
        
        {/* File validation error */}
        {fileError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
            {fileError}
          </div>
        )}
        
        {/* File list with progress */}
        {files?.length ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected files ({files.length}/5):</p>
            {Array.from(files).map((file, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span className="truncate">{file.name}</span>
                  <span className="text-gray-500 ml-2">{formatFileSize(file.size)}</span>
                </div>
                {uploadProgress[file.name] !== undefined && (
                  <div className="mt-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{uploadProgress[file.name]}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
        
        <button disabled={isSubmitting} className="btn w-full">
          {isSubmitting ? "Submitting Deal..." : "Submit Deal"}
        </button>
        
        {/* Success Message */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            Deal submitted successfully! Our team will review it and get back to you soon.
          </div>
        )}
        
        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {submitError}
          </div>
        )}
      </form>
    </div>
  );
}