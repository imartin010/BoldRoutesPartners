import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema } from "@/schemas/forms";
import { submitApplication } from "@/api/public";
import { z } from "zod";
type FormData = z.infer<typeof applicationSchema>;

export default function Apply() {
  const { register, handleSubmit, formState:{ errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(applicationSchema)
  });

  const onSubmit = async (d: FormData) => {
    await submitApplication(d);
    alert("Application submitted successfully.");
    reset();
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

        <button disabled={isSubmitting} className="btn w-full">{isSubmitting? "Submitting..." : "Submit"}</button>
      </form>
    </div>
  );
}