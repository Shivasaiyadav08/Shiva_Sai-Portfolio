"use client";

import { useId, useState, type FormEvent } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { config } from "@/data/config";
import { submitContact } from "@/lib/contact";
import { Button } from "./ui/button";
import { Input, Textarea } from "./ui/form-field";
import { Label } from "./ui/label";
import EmailLink from "./email-link";

const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

export default function ContactForm() {
  const id = useId();
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    setStatus("sending");
    setError("");

    try {
      await submitContact(formId, new FormData(form));
      form.reset();
      setStatus("success");
    } catch (error) {
      setError(
        error instanceof Error && error.name === "Error"
          ? error.message
          : "Your message could not be sent. Please try again or email me directly.",
      );
      setStatus("error");
    }
  }

  return (
    <form
      className="mx-auto space-y-4 sm:mt-4"
      onSubmit={handleSubmit}
      aria-busy={status === "sending"}
    >
      <fieldset disabled={status === "sending"} className="space-y-4">
        <legend className="sr-only">Send a message to {config.author}</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Full name</Label>
            <Input
              id={`${id}-name`}
              name="name"
              placeholder="Your name"
              minLength={2}
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-email`}>Email address</Label>
            <Input
              id={`${id}-email`}
              name="email"
              placeholder="you@example.com"
              type="email"
              maxLength={254}
              autoComplete="email"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-message`}>Your message</Label>
          <Textarea
            id={`${id}-message`}
            name="message"
            placeholder="Tell me about your project or opportunity"
            minLength={10}
            maxLength={5000}
            required
          />
          <p className="text-sm text-muted-foreground">
            Your details are used to respond to your enquiry.
          </p>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={!formId || status === "sending"}
        >
          {status === "sending" ? (
            <>
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />{" "}
              Sending…
            </>
          ) : (
            <>
              Send Message{" "}
              <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </fieldset>
      <div aria-live="polite" aria-atomic="true">
        {status === "success" && (
          <p className="text-sm">
            Thank you! Your message has been sent. I&apos;ll get back to you
            soon.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {(!formId || status === "error") && (
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <EmailLink />
            <span>Prefer email? Get in touch directly.</span>
          </div>
        )}
      </div>
    </form>
  );
}
