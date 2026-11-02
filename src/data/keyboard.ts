import { SKILL_GROUPS } from "./profile";
import { STACK_ARTWORK } from "./stack-artwork";

const GROUP_COLORS = [
  "#fbbf24",
  "#38bdf8",
  "#a78bfa",
  "#fb7185",
  "#4ade80",
  "#fb923c",
];

const KEY_DESCRIPTIONS: Record<string, string> = {
  Redux:
    "Predictable React state management with Redux Toolkit stores and slices.",
  Python: "AI research workflows and FastAPI services.",
  Java: "Programming in Java, including NPTEL certification.",
  JavaScript: "Interactive interfaces and enterprise workflows.",
  TypeScript: "Typed interfaces for SaaS workspaces and dApps.",
  PHP: "Enterprise ERP modules with CodeIgniter.",
  Solidity: "Ethereum smart contracts with Foundry.",
  "React.js": "Component-based project and expense workspaces.",
  "Next.js": "Full-stack websites, research applications, and dApps.",
  "Node.js": "Backend services for full-stack applications.",
  "Express.js": "Authenticated REST APIs for workspace data.",
  FastAPI: "Python services and streamed research responses.",
  CodeIgniter: "Procurement and asset-management ERP workflows.",
  HTML: "Semantic structure for web interfaces.",
  CSS: "Responsive layouts and interface styling.",
  "Tailwind CSS": "Utility-based styling for responsive applications.",
  Zustand: "Lightweight state management for React applications.",
  "Three.js": "Interactive 3D graphics and WebGL experiences.",
  Redis: "In-memory data storage and caching.",
  Prisma:
    "Type-safe database access and schema migrations for full-stack applications.",
  "REST APIs": "Client-server communication and authenticated endpoints.",
  LangGraph: "Fixed agent orchestration and Corrective RAG research workflows.",
  LangChain: "Tools for building applications with language models.",
  "Prompt Engineering": "Instructions and context for language-model tasks.",
  RAG: "Research generation grounded in retrieved document evidence.",
  Gemini: "Research synthesis, task drafting, and expense extraction.",
  "AI Agent Orchestration":
    "Coordinating retrieval, grading, web search, and answer validation.",
  Evaluation: "Grading evidence and validating generated research answers.",
  Ollama: "Tools for working with local language models.",
  "OpenAI SDK": "Language-model integration through the OpenAI SDK.",
  Tavily: "Conditional web search in research workflows.",
  "Vector Search": "Finding relevant document evidence by semantic similarity.",
  Ethereum: "Smart contracts and wallet-connected decentralized applications.",
  Sepolia: "Ethereum testnet deployment for the stablecoin project.",
  Foundry: "Solidity development and smart-contract testing tools.",
  Chainlink: "Oracle-based collateral prices and health monitoring.",
  wagmi: "React integration for wallet-connected Ethereum applications.",
  viem: "Typed Ethereum interactions and contract simulation.",
  MetaMask: "Wallet connection and transaction approval.",
  RainbowKit: "Wallet connection interfaces for the stablecoin dApp.",
  EVM: "The execution environment for Ethereum smart contracts.",
  PostgreSQL: "Relational application data and research persistence.",
  pgvector: "Vector retrieval within PostgreSQL.",
  Supabase: "Authenticated research workspaces and persistent data.",
  MongoDB: "Project, task, budget, and expense data.",
  MySQL: "Enterprise procurement, inventory, and asset data.",
  Mongoose: "Application data modeling for MongoDB.",
  Chroma: "Vector storage for retrieval-based applications.",
  Git: "Version control and collaborative development.",
  GitHub: "Source repositories and software collaboration.",
  "GitHub Actions": "Automated repository workflows.",
  "CI/CD Pipelines": "Continuous integration and delivery workflows.",
  Docker: "Containerized development environments.",
  Vercel: "Deployment for Next.js and frontend applications.",
  Render: "Hosting application services.",
  Postman: "REST API exploration and testing.",
  Clerk: "Authentication for SaaS workspaces.",
  Alchemy: "Blockchain infrastructure and Ethereum connectivity.",
};

// Row-major reading order: languages → databases → full stack → AI → Web3.
// General development tools accompany full stack; Alchemy belongs with Web3.
const STACK_GROUPS = [
  { title: "Programming languages", skills: SKILL_GROUPS[0].skills },
  { title: "Databases", skills: SKILL_GROUPS[4].skills },
  {
    title: "SaaS / full stack",
    skills: [
      ...SKILL_GROUPS[1].skills,
      ...SKILL_GROUPS[5].skills.filter((name) => name !== "Alchemy"),
    ],
  },
  { title: "AI tools", skills: SKILL_GROUPS[2].skills },
  { title: "Blockchain tools", skills: [...SKILL_GROUPS[3].skills, "Alchemy"] },
];
export const KEYBOARD_STACK = STACK_GROUPS.flatMap((group) =>
  group.skills
    .filter((name) => name in STACK_ARTWORK)
    .map((name) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      group: group.title,
      color: STACK_ARTWORK[name].color,
      logo: STACK_ARTWORK[name].file
        ? `/assets/stack/${STACK_ARTWORK[name].file}`
        : null,
      description:
        KEY_DESCRIPTIONS[name] ||
        `${name} is part of my ${group.title.toLowerCase()} stack.`,
    })),
);

// Choose a divisor so there are no empty positions or duplicate filler keys.
export const KEYBOARD_COLUMNS = [8, 10, 9, 7, 6, 4, 3, 2, 1].find(
  (columns) => KEYBOARD_STACK.length % columns === 0,
)!;
export const KEYBOARD_MOBILE_COLUMNS = [6, 5, 4, 7, 3, 2, 1].find(
  (columns) => KEYBOARD_STACK.length % columns === 0,
)!;
export const KEYBOARD_GROUPS = STACK_GROUPS.map((group, index) => ({
  ...group,
  skills: group.skills.filter((name) => name in STACK_ARTWORK),
  color: GROUP_COLORS[index % GROUP_COLORS.length],
}));
