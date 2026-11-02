// Formspree handles validation and email delivery; no custom mail server is needed.
export async function submitContact(
  formId: string | undefined,
  fields: FormData,
) {
  if (!formId || !/^[a-z0-9]+$/i.test(formId)) {
    throw new Error(
      "The contact form is unavailable. Please email me directly.",
    );
  }

  const response = await fetch(`https://formspree.io/f/${formId}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: fields,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      "Your message could not be sent. Please try again or email me directly.",
    );
  }
}
