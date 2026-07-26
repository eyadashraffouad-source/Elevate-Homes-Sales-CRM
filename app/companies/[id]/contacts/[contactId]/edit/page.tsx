import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Contact, JobTitle } from "@/types/db";
import { updateContact } from "@/lib/actions/contacts";

const JOB_TITLES: JobTitle[] = [
  "Sales Manager",
  "Owner",
  "CEO",
  "Founder",
  "Acquisitions Manager",
  "Investor",
  "Partner",
  "Broker",
  "Other",
];

export default async function EditContactPage({
  params,
}: {
  params: { id: string; contactId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", params.contactId)
    .eq("company_id", params.id)
    .eq("user_id", user.id)
    .single<Contact>();

  if (!contact) notFound();

  const updateWithIds = updateContact.bind(null, params.id, contact.id);

  return (
    <main className="max-w-xl mx-auto py-16 px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
        Edit contact
      </p>
      <h1 className="font-serif text-3xl text-ink mb-8">{contact.full_name}</h1>

      <form action={updateWithIds}>
        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Full name *
          </span>
          <input
            name="full_name"
            defaultValue={contact.full_name}
            required
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>

        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Role
          </span>
          <select
            name="job_title"
            defaultValue={contact.job_title ?? ""}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm"
          >
            <option value="">Not set</option>
            {JOB_TITLES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Email
          </span>
          <input
            name="email"
            defaultValue={contact.email ?? ""}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>

        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Phone
          </span>
          <input
            name="phone"
            defaultValue={contact.phone ?? ""}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>

        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            LinkedIn URL
          </span>
          <input
            name="linkedin_url"
            defaultValue={contact.linkedin_url ?? ""}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>

        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Contact status
          </span>
          <select
            name="contact_status"
            defaultValue={contact.contact_status}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="follow_up">Follow up</option>
            <option value="unresponsive">Unresponsive</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <label className="block mb-8">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Notes
          </span>
          <textarea
            name="notes"
            defaultValue={contact.notes ?? ""}
            rows={3}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>

        <button
          type="submit"
          className="bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-5 py-2.5 rounded-sm hover:bg-ink/90"
        >
          Save changes
        </button>
      </form>
    </main>
  );
}
