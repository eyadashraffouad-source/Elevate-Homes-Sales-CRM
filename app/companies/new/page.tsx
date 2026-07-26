import { createCompany } from "@/lib/actions/companies";

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
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
        className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
      />
    </label>
  );
}

export default function NewCompanyPage() {
  return (
    <main className="max-w-xl mx-auto py-16 px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
        New case file
      </p>
      <h1 className="font-serif text-3xl text-ink mb-1">Add a company</h1>
      <p className="text-sm text-muted mb-8">
        Enter whatever you have. A name and one URL is enough — the rest gets
        filled in once you research it.
      </p>

      <form action={createCompany}>
        <Field label="Company name *" name="name" placeholder="OfferCharm" />
        <Field label="Website" name="website_url" placeholder="https://" />
        <Field label="Google Maps URL" name="google_maps_url" placeholder="https://" />
        <Field label="LinkedIn URL" name="linkedin_url" placeholder="https://" />
        <Field label="Instagram URL" name="instagram_url" placeholder="https://" />
        <Field label="Facebook URL" name="facebook_url" placeholder="https://" />

        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Other URLs (one per line)
          </span>
          <textarea
            name="other_urls"
            rows={2}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
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
          Open case file
        </button>
      </form>
    </main>
  );
}
