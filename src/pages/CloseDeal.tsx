import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dealSchema } from "@/schemas/forms";
import { uploadDealFile, submitClosedDeal } from "@/api/public";
import { z } from "zod";
type FormData = z.infer<typeof dealSchema>;

export default function CloseDeal() {
  const { register, handleSubmit, formState:{ errors, isSubmitting }, reset, watch } = useForm<FormData>({
    resolver: zodResolver(dealSchema)
  });
  const files = watch("files");

  const onSubmit = async (d: FormData) => {
    const paths: string[] = [];
    if (d.files && d.files.length) {
      for (const f of Array.from(d.files)) {
        paths.push(await uploadDealFile(f));
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
    alert("Deal submitted.");
    reset();
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
        <label className="block">Attachments
          <input type="file" multiple {...register("files")} className="input" />
        </label>
        {files?.length ? <p className="text-sm">Files: {files.length}</p> : null}
        <button disabled={isSubmitting} className="btn w-full">{isSubmitting? "Submitting..." : "Submit"}</button>
      </form>
    </div>
  );
}