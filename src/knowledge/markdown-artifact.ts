import { getClock } from "@dyogas/kernel";

export interface KnowledgeMeta {
  readonly title: string;
  readonly source: string;
  readonly createdAt: string;
  readonly tags: readonly string[];
  readonly links: readonly string[];
}

/** Zettlr-inspired concepts: markdown-first body + YAML frontmatter metadata. */
export function buildMarkdownArtifact(input: {
  title: string;
  bodyMarkdown: string;
  source: string;
  tags: readonly string[];
  links?: readonly string[];
  createdAt?: string;
}): { markdown: string; meta: KnowledgeMeta } {
  const createdAt = input.createdAt ?? getClock().nowIso();
  const links = input.links ?? [];
  const tags = input.tags;
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(input.title)}`,
    `source: ${JSON.stringify(input.source)}`,
    `created_at: ${JSON.stringify(createdAt)}`,
    `tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]`,
    `links: [${links.map((l) => JSON.stringify(l)).join(", ")}]`,
    "---",
    "",
  ].join("\n");

  const body = input.bodyMarkdown.trim().startsWith("#")
    ? input.bodyMarkdown.trim()
    : `# ${input.title}\n\n${input.bodyMarkdown.trim()}`;

  const markdown = `${frontmatter}${body}\n`;
  return {
    markdown,
    meta: {
      title: input.title,
      source: input.source,
      createdAt,
      tags,
      links,
    },
  };
}

export function parseFrontmatter(markdown: string): Partial<KnowledgeMeta> & { body: string } {
  if (!markdown.startsWith("---")) {
    return { body: markdown };
  }
  const end = markdown.indexOf("\n---", 3);
  if (end < 0) return { body: markdown };
  const fm = markdown.slice(4, end);
  const body = markdown.slice(end + 4).replace(/^\n/, "");
  const get = (key: string): string | undefined => {
    const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
    if (!m?.[1]) return undefined;
    try {
      return JSON.parse(m[1]) as string;
    } catch {
      return m[1].replace(/^"|"$/g, "");
    }
  };
  const getArr = (key: string): string[] => {
    const m = fm.match(new RegExp(`^${key}:\\s*(\\[.*\\])$`, "m"));
    if (!m?.[1]) return [];
    try {
      return JSON.parse(m[1]) as string[];
    } catch {
      return [];
    }
  };
  return {
    title: get("title"),
    source: get("source"),
    createdAt: get("created_at"),
    tags: getArr("tags"),
    links: getArr("links"),
    body,
  };
}
