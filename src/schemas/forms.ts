import { z } from "zod";
export const phoneSchema = z.string().min(10).max(15).regex(/^\+?\d+$/, "Digits only");

export const applicationSchema = z.object({
  full_name: z.string().min(3),
  phone: phoneSchema,
  company_name: z.string().min(2),
  agents_count: z.coerce.number().int().min(1),
  has_papers: z.boolean(),
});

export const dealSchema = z.object({
  developer_name: z.string().min(2),
  project_name: z.string().min(1),
  client_name: z.string().min(3),
  unit_code: z.string().min(1),
  dev_sales_name: z.string().min(3),
  dev_phone: phoneSchema,
  deal_value: z.coerce.number().positive(),
  files: z.instanceof(FileList).optional(),
});
