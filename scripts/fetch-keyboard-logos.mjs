// Vendored brand artwork: no third-party logo requests at runtime.
import { mkdir, writeFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import * as si from "react-icons/si";

const directory = new URL("../public/assets/stack/", import.meta.url);
await mkdir(directory, { recursive: true });
const sources = {};
const requested = new Set(process.argv.slice(2));
const devicons = {
  python: "python",
  java: "java",
  javascript: "javascript",
  typescript: "typescript",
  php: "php",
  solidity: "solidity",
  react: "react",
  nextjs: "nextjs",
  nodejs: "nodejs",
  express: "express",
  fastapi: "fastapi",
  codeigniter: "codeigniter/plain",
  html: "html5",
  css: "css3",
  tailwind: "tailwindcss",
  ollama: "ollama",
  postgresql: "postgresql",
  supabase: "supabase",
  mongodb: "mongodb",
  mysql: "mysql",
  redis: "redis",
  zustand: "zustand",
  threejs: "threejs",
  prisma: "prisma",
  git: "git",
  github: "github",
  githubactions: "githubactions",
  docker: "docker",
  vercel: "vercel",
  postman: "postman",
};
for (const [file, value] of Object.entries(devicons)) {
  const [name, variant = "original"] = value.split("/");
  sources[file + ".svg"] =
    `https://raw.githubusercontent.com/devicons/devicon/master/icons/${name}/${name}-${variant}.svg`;
}
for (const name of ["langchain", "gemini", "tavily", "openai"]) {
  sources[name + ".svg"] =
    `https://raw.githubusercontent.com/lobehub/lobe-icons/master/packages/static-svg/icons/${name}${name === "openai" ? "" : "-color"}.svg`;
}
const raw = "https://raw.githubusercontent.com/";
Object.assign(sources, {
  "foundry.png": raw + "foundry-rs/book/HEAD/public/foundry-logo.png",
  "wagmi.svg": raw + "wevm/wagmi/HEAD/site/public/logo-light.svg",
  "viem.svg": raw + "wevm/viem/HEAD/site/public/logo-light-hug.svg",
  "metamask.svg": raw + "rainbow-me/rainbowkit/HEAD/site/public/metaMask.svg",
  "rainbowkit.png":
    raw + "rainbow-me/rainbowkit/HEAD/site/public/rainbow-logo.png",
  "chroma.svg":
    raw + "chroma-core/chroma/HEAD/docs/mintlify/images/favicon.svg",
  "mongoose.png":
    "https://mongoosejs.com/docs/images/favicon/apple-icon-180x180.png",
  "langgraph.svg":
    "https://cdn.prod.website-files.com/65b8cd72835ceeacd4449a53/6a994264a64b3afcdd880f6b_LangGraph_OSS%20Lockup_light%201.svg",
});
const results = await Promise.allSettled(
  Object.entries(sources)
    .filter(([file]) => !requested.size || requested.has(file))
    .map(async ([file, url]) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${file}: ${response.status}`);
      let bytes = Buffer.from(await response.arrayBuffer());
      if (file.endsWith(".svg")) {
        let svg = bytes.toString();
        if (!svg.includes("<svg") || /<script|<foreignObject/i.test(svg))
          throw new Error(`Invalid SVG: ${file}`);
        svg = svg.replaceAll("currentColor", "#111111");
        bytes = Buffer.from(svg);
      }
      await writeFile(new URL(file, directory), bytes);
      console.log(`Saved ${file}`);
    }),
);
for (const [file, name] of Object.entries({
  ethereum: "SiEthereum",
  chainlink: "SiChainlink",
  render: "SiRender",
  clerk: "SiClerk",
  alchemy: "SiAlchemy",
})) {
  sources[file + ".svg"] =
    `https://simpleicons.org/?q=${file} (react-icons/si)`;
  if (requested.size && !requested.has(file + ".svg")) continue;
  const svg = renderToStaticMarkup(
    createElement(si[name], {
      xmlns: "http://www.w3.org/2000/svg",
      color: "#ffffff",
    }),
  ).replaceAll("currentColor", "#ffffff");
  await writeFile(new URL(file + ".svg", directory), svg);
  sources[file + ".svg"] =
    `https://simpleicons.org/?q=${file} (react-icons/si)`;
}
await writeFile(
  new URL("sources.json", directory),
  JSON.stringify(sources, null, 2) + "\n",
);
const failures = results.filter((result) => result.status === "rejected");
for (const result of failures) console.error(result.reason);
if (failures.length) process.exitCode = 1;
