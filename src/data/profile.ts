export const SKILL_GROUPS = [
  {
    title: "Languages",
    skills: ["Python", "Java", "JavaScript", "TypeScript", "PHP", "Solidity"],
  },
  {
    title: "Full stack & SaaS",
    skills: [
      "HTML",
      "CSS",
      "React.js",
      "Next.js",
      "Node.js",
      "Express.js",
      "FastAPI",
      "CodeIgniter",
      "Tailwind CSS",
      "Zustand",
      "Redux",
      "Three.js",
      "Supabase",
      "Mongoose",
      "Prisma",
      "REST APIs",
    ],
  },
  {
    title: "AI & agents",
    skills: [
      "LangGraph",
      "LangChain",
      "Prompt Engineering",
      "RAG",
      "Gemini",
      "AI Agent Orchestration",
      "Evaluation",
      "Ollama",
      "OpenAI SDK",
      "Tavily",
      "Vector Search",
      "pgvector",
      "Chroma",
    ],
  },
  {
    title: "Blockchain & Web3",
    skills: [
      "Ethereum",
      "Sepolia",
      "Foundry",
      "Chainlink",
      "wagmi",
      "viem",
      "MetaMask",
      "RainbowKit",
      "EVM",
    ],
  },
  {
    title: "Databases",
    skills: ["MongoDB", "PostgreSQL", "MySQL", "Redis"],
  },
  {
    title: "Tools & cloud",
    skills: [
      "Git",
      "GitHub",
      "GitHub Actions",
      "CI/CD Pipelines",
      "Docker",
      "Vercel",
      "Render",
      "Postman",
      "Clerk",
      "Alchemy",
    ],
  },
];

export type Experience = {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  company: string;
  description: string[];
  skills: string[];
};
export const EXPERIENCE: Experience[] = [
  {
    id: 1,
    startDate: "May 2026",
    endDate: "Sep 2026",
    title: "Junior Software Developer Intern",
    company: "Karat Infinity · Hyderabad, India",
    description: [
      "Developed ERP modules for procurement and asset management, including purchase approvals, vendor workflows, asset tracking, and inventory visibility.",
      "Contributed to frontend, backend, and database functionality to support reliable enterprise workflows and improve application usability.",
    ],
    skills: ["PHP", "MySQL", "React.js", "JavaScript", "Git"],
  },
  {
    id: 2,
    startDate: "",
    endDate: "",
    title: "Software Developer and Community Member",
    company: "Independent developer community",
    description: [
      "Developed an AI-powered research application for a client in Sydney, using LangGraph orchestration, RAG, Tavily web search, and AI-based research synthesis.",
      "Built a responsive business website using Next.js and Tailwind CSS.",
      "Coordinated the community development team, organizing contributions across software projects.",
    ],
    skills: ["LangGraph", "Python", "Next.js", "Tailwind CSS"],
  },
];
export const EDUCATION = {
  institution: "J.B. Institute of Engineering & Technology",
  dates: "2023 – 2026",
  degree: "Bachelor of Technology, Computer Science and Engineering",
  specialization: "AI & ML specialization",
  university: "Jawaharlal Nehru Technological University",
  location: "Hyderabad, India",
  grade: "8.62 / 10 CGPA",
};
export const CERTIFICATIONS = [
  "NPTEL · Programming in Java",
  "NPTEL · Blockchain",
  "Cyfrin Updraft · Blockchain Basics",
  "Cyfrin Updraft · Foundry",
];
