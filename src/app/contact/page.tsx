import ContactForm from "@/components/contact-form";
import { config } from "@/data/config";
export const metadata = { title: "Contact | Shiva Sai Thota" };
export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-20 min-h-screen font-sans">
      <h1 className="text-4xl font-bold mb-5">Let’s build something useful.</h1>
      <p className="text-muted-foreground mb-8">
        For software engineering opportunities and project collaborations, email{" "}
        <a className="underline break-all" href={`mailto:${config.email}`}>
          {config.email}
        </a>{" "}
        or call{" "}
        <a className="underline" href={config.phoneHref}>
          {config.phone}
        </a>
        .
      </p>
      <ContactForm />
    </main>
  );
}
