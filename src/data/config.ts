// Reject old deployment URLs and malformed environment values as canonical origins.
const primarySite = "https://shivasai.is-a.dev";
const configuredSite = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
  /\/+$/,
  "",
);
const config = {
  title: "Shiva Sai Thota | Software Engineer & Full-Stack Developer",
  role: "Software Engineer",
  focus: "Full-stack SaaS · Agentic AI · Web3",
  location: "Hyderabad, Telangana, India",
  description: {
    long: "Software Engineer experienced in full-stack SaaS development, Generative AI, Agentic AI, and Blockchain/Web3 applications. Building enterprise ERP modules, AI-powered research platforms, SaaS management tools, and decentralized applications.",
  },
  keywords: [
    "Shiva Sai Thota",
    "Software Engineer",
    "React",
    "Next.js",
    "Python",
    "FastAPI",
    "LangGraph",
    "RAG",
    "Solidity",
    "Foundry",
    "SaaS",
    "Hyderabad",
  ],
  author: "Shiva Sai Thota",
  email: "shivasaiyadav0803@gmail.com",
  phone: "+91 6302872442",
  phoneHref: "tel:+916302872442",
  resume: "/Shiva_Sai_Software_Engineer.pdf",
  site: configuredSite === primarySite ? configuredSite : primarySite,
  social: {
    linkedin: "https://www.linkedin.com/in/shivasai-yadav",
    github: "https://github.com/Shivasaiyadav08",
  },
};
export { config };
