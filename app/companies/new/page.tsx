import Link from "next/link";
import { createCompany } from "@/lib/actions/companies";

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block mb-4">
      <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
      />
    </label>
  );
}

export default function NewCompanyPage() {
  return (
    <main className="max-w-xl mx-auto py-16 px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
        New company
      </p>
      <h1 className="font-serif text-3xl text-ink mb-1">Add a company</h1>
      <p className="text-sm text-muted mb-6">
        Already have this company?{" "}
        <Link href="/companies" className="text-accent underline underline-offset-2">
          Search the companies list
        </Link>{" "}
        first and add a contact to the existing record instead of creating a
        duplicate.
      </p>

      <form action={createCompany}>
        <Field label="Company name *" name="company_name" placeholder="OfferCharm" required />
        <Field label="Website" name="website" placeholder="https://" />
        <Field label="Industry" name="industry" placeholder="Real estate" />

        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Company status
          </span>
          <select
            name="company_status"
            defaultValue="active"
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          >
            <option value="active">Active</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Customer</option>
            <option value="inactive">Inactive</option>
            <option value="lost">Lost</option>
          </select>
        </label>

        <label className="block mb-8">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Notes
          </span>
          <textarea
            name="notes"
            rows={3}
            placeholder="How you found them, any context worth remembering"
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
        </label>

        <button
          type="submit"
          className="bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-5 py-2.5 rounded-sm hover:bg-ink/90 transition-colors"
        >
          Create company
        </button>
      </form>
    </main>
  );
}
