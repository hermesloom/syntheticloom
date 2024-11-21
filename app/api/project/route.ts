import { requestWithAuth } from "../_common/endpoints";

const ADJECTIVES = [
  "Unified",
  "Harmonious",
  "Infinite",
  "Universal",
  "Holistic",
  "Pure",
  "Eternal",
  "Sacred",
  "Balanced",
  "Self-sustaining",
  "Empowering",
  "Serene",
  "Transcendent",
  "Enlightened",
  "Wholesome",
  "Evolving",
  "Timeless",
  "Unbounded",
  "Transcendent",
  "Boundless",
  "Eternal",
  "Visionary",
  "Radiant",
  "Cleansed",
  "Open",
  "Pure",
  "Luminous",
  "Resilient",
  "Sublime",
  "Elevated",
  "Noble",
  "Divine",
];

const NOUNS = [
  "Unity",
  "Wisdom",
  "Harmony",
  "Perfection",
  "Truth",
  "Peace",
  "Light",
  "Mind",
  "Soul",
  "Balance",
  "Force",
  "Essence",
  "Potential",
  "Freedom",
  "Creation",
  "Evolution",
  "Path",
  "Vision",
  "Journey",
  "Insight",
  "Revelation",
  "Force",
  "Awakening",
  "Emanation",
  "Grace",
  "Essence",
  "Fellowship",
  "Wisdom",
  "Purpose",
  "Flow",
  "Growth",
  "Radiance",
  "Rebirth",
];

const INITIAL_CODE = `//& interface: chat
//& title: What should I explain? (in development, not functional yet)

async function main(loom) {
  while (true) {
    const prompt = await loom.chat.prompt();
    const response = await loom.llm.ask("Explain the following: " + prompt);
    await loom.chat.respond(response);
  }
}`;

export const POST = requestWithAuth(async (supabase, user) => {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${
        NOUNS[Math.floor(Math.random() * NOUNS.length)]
      }`,
    })
    .select()
    .single();

  if (projectError) {
    throw new Error("Failed to create project");
  }

  const { error: sourceError } = await supabase.from("source_files").insert({
    project_id: project.id,
    content: INITIAL_CODE,
  });

  if (sourceError) {
    throw new Error("Failed to create initial source file");
  }

  return project;
});
