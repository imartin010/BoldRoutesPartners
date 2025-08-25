import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enhancedApplicationSchema } from "@/utils/inputValidation";
import { submitApplication } from "@/api/public";
import { ClientRateLimiter } from "@/utils/inputValidation";
import { z } from "zod";

type FormData = z.infer<typeof enhancedApplicationSchema>;

// Client-side rate limiting (5 submissions per minute)
const rateLimiter = new ClientRateLimiter(5, 60 * 1000);

export default function Apply() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(enhancedApplicationSchema)
  });

  const onSubmit = async (d: FormData) => {
    try {
      setSubmitError(null);
      
      // Client-side rate limiting check
      const clientKey = `apply-${window.location.hostname}`;
      if (!rateLimiter.isAllowed(clientKey)) {
        setSubmitError("Too many submissions. Please wait a minute before trying again.");
        return;
      }

      await submitApplication(d);
      setSubmitSuccess(true);
      reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Application submission failed:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : "Failed to submit application. Please try again."
      );
    }
  };

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-semibold mb-4">Partner Application</h1>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">Full Name<input className="input" {...register("full_name")} /></label>
        {errors.full_name && <p className="error">{errors.full_name.message}</p>}

        <label className="block">Phone<input className="input" {...register("phone")} placeholder="+201234567890" /></label>
        {errors.phone && <p className="error">{errors.phone.message}</p>}

        <label className="block">Company Name<input className="input" {...register("company_name")} /></label>
        {errors.company_name && <p className="error">{errors.company_name.message}</p>}

        <label className="block">Sales Agents Count<input className="input" type="number" {...register("agents_count", { valueAsNumber: true })} /></label>
        {errors.agents_count && <p className="error">{errors.agents_count.message}</p>}

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("has_papers")} /> Company has registered papers
        </label>
        {errors.has_papers && <p className="error">{errors.has_papers.message}</p>}

        <button disabled={isSubmitting} className="btn w-full">
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
        
        {/* Success Message */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            Application submitted successfully! We'll review it and get back to you soon.
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