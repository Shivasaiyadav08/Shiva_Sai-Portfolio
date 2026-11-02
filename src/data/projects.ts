import type { StaticImageData } from "next/image";
import crebryCover from "@/assets/projects/crebry.webp";
import edithCover from "@/assets/projects/edith.webp";
import stablecoinCover from "@/assets/projects/stablecoin.webp";
import bhagyashreeCover from "@/assets/projects/bhagyashree-ventures.webp";
import greencostCover from "@/assets/projects/greencost.webp";

export type Project = {
  id: string;
  kind: "personal" | "freelancing";
  category: string;
  accent: string;
  title: string;
  subtitle: string;
  src: StaticImageData;
  imageAlt: string;
  summary: string;
  stack: string[];
  highlights: string[];
  github?: string;
  live: string;
  contractGithub?: string;
};
const projects: Project[] = [
  {
    id: "crebry",
    kind: "personal",
    accent: "#a78bfa",
    category: "Agentic AI / Research",
    title: "Crebry",
    subtitle: "Agentic AI Research Platform",
    summary:
      "An AI research platform that retrieves evidence, evaluates its relevance, and produces research answers with source citations.",
    stack: [
      "Next.js",
      "Python",
      "FastAPI",
      "LangGraph",
      "RAG",
      "Gemini",
      "Tavily",
      "Supabase",
      "PostgreSQL / pgvector",
    ],
    highlights: [
      "Engineered a LangGraph-orchestrated Corrective RAG research workflow that retrieves and grades document evidence, conditionally searches the web, and validates generated answers with source citations.",
      "Implemented document ingestion, authenticated workspaces, streamed research responses, persistent jobs, and Gemini model fallback for resilient AI-assisted research.",
    ],
    live: "https://crebry-research-agent.vercel.app/",
    github: "https://github.com/Shivasaiyadav08/Crebry-ResearchAgent",
    src: crebryCover,
    imageAlt: "Crebry homepage showing its evidence-backed research workspace",
  },
  {
    id: "edith",
    kind: "personal",
    accent: "#5eead4",
    category: "Full-stack SaaS / AI",
    title: "Edith",
    subtitle: "AI-Powered Project & Expense Management",
    summary:
      "A full-stack workspace connecting projects, tasks, budgets, and expenses with AI assistance grounded in authorized workspace data.",
    stack: [
      "React",
      "TypeScript",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Clerk",
      "Gemini",
      "Tailwind CSS",
    ],
    highlights: [
      "Developed a full-stack workspace for projects, tasks, budgets, expenses, financial reports, and CSV exports, supported by authenticated REST APIs.",
      "Integrated Gemini AI for task drafting, receipt/document-based expense extraction, and natural-language questions grounded in authorized workspace data.",
    ],
    live: "https://edith-ai-powered-manager.vercel.app/",
    github: "https://github.com/Shivasaiyadav08/Edith",
    src: edithCover,
    imageAlt:
      "Edith homepage showing projects, tasks and its Ultron AI assistant",
  },
  {
    id: "stablecoin",
    kind: "personal",
    accent: "#fbbf24",
    category: "Blockchain / Ethereum DeFi",
    title: "Decentralized Stablecoin",
    subtitle: "Ethereum DeFi dApp \u00b7 Sepolia",
    summary:
      "A wallet-connected DeFi application for a collateralized stablecoin deployed to the Ethereum Sepolia testnet.",
    stack: [
      "Solidity",
      "Foundry",
      "Ethereum",
      "EVM",
      "Sepolia",
      "Next.js",
      "TypeScript",
      "Chainlink",
      "RainbowKit",
      "wagmi",
      "viem",
    ],
    highlights: [
      "Adapted an educational collateralized-stablecoin implementation, deployed an instance to Ethereum Sepolia, and built a wallet-connected Next.js dApp.",
      "Integrated collateral deposits/redemptions, mint/burn and liquidation flows, oracle-based health monitoring, contract simulation, approvals, and transaction tracking.",
    ],
    live: "https://decentralizedstablecoin.vercel.app/",
    github: "https://github.com/Shivasaiyadav08/Stable-Coin-frontend",
    contractGithub: "https://github.com/Shivasaiyadav08/Stable-Coin",
    src: stablecoinCover,
    imageAlt:
      "DSC Protocol homepage showing the stablecoin collateral mechanism",
  },
  {
    id: "bhagyashree-ventures",
    kind: "freelancing",
    accent: "#e4bb4b",
    category: "Business website / Product catalog",
    title: "Bhagyashree Ventures",
    subtitle: "Barcode, Labeling, RFID & POS Solutions",
    summary:
      "A business website showcasing barcode, labeling, RFID and POS products, with product discovery and pricing enquiry paths.",
    stack: ["Tailwind CSS", "Next.js", "TypeScript"],
    highlights: [
      "Product catalog covering printers, scanners, labels, ribbons, RFID consumables and POS hardware.",
      "Partner and industry pages that organize business offerings around customer workflows.",
      "Contact and pricing enquiry paths connecting visitors with the business.",
    ],
    live: "https://bvhardwares.in/",
    src: bhagyashreeCover,
    imageAlt:
      "Bhagyashree Ventures homepage showing labeling products and barcode hardware",
  },
  {
    id: "greencost",
    kind: "freelancing",
    accent: "#65bfa0",
    category: "Sustainability / Cost comparison",
    title: "GreenCost",
    subtitle: "Sydney Building Life-Cycle Cost Comparison",
    summary:
      "A building cost comparison tool exploring conventional and sustainable construction over 30, 40 and 50 years, with editable assumptions.",
    stack: [
      "FastAPI",
      "Next.js",
      "Three.js",
      "Tailwind CSS",
      "LangGraph Orchestration",
      "Tavily",
      "RAG",
      "Python",
    ],
    highlights: [
      "Comparison of conventional and sustainable construction across 30-, 40- and 50-year study periods, including operating costs, maintenance and replacements.",
      "Editable assumptions and an interactive 3D building preview to explore different building configurations.",
      "Method and evidence pages explaining Sydney reference rates, the comparison approach and model limitations.",
    ],
    live: "https://green-cost-sydney.vercel.app/",
    src: greencostCover,
    imageAlt:
      "GreenCost homepage showing building cost comparison and an interactive house model",
  },
];
export default projects;
