"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ContactForm from "../contact/contact-form";
import EmailLink from "../contact/email-link";
import { SectionHeader } from "./section-header";
import SectionWrapper from "../ui/section-wrapper";

const ContactSection = () => {
  return (
    <SectionWrapper id="contact" className="min-h-dvh max-w-7xl mx-auto ">
      <SectionHeader
        id="contact"
        className="relative mb-14"
        title={
          <>
            LET&apos;S WORK <br />
            TOGETHER
          </>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 z-[9999] mx-4">
        <Card className="min-w-7xl bg-white/70 dark:bg-black/70 backdrop-blur-sm rounded-xl mt-10 md:mt-20">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-3xl">Get in touch</CardTitle>
              <CardDescription className="mt-2">
                Have a project or opportunity in mind? Send a message below.
              </CardDescription>
            </div>
            <EmailLink />
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
        <div
          data-keyboard-slot="contact"
          className="h-[500px] md:h-[650px] w-full"
          aria-hidden="true"
        />
      </div>
    </SectionWrapper>
  );
};
export default ContactSection;
