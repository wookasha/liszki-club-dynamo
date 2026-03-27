export const renderNewsContent = (content: string): string => {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = content.split("\n");
  const html: string[] = [];
  let inList: "ul" | "ol" | null = null;

  const inlineFormat = (line: string) =>
    escape(line)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  const closeList = () => {
    if (inList) {
      html.push(inList === "ul" ? "</ul>" : "</ol>");
      inList = null;
    }
  };

  for (const raw of lines) {
    const line = raw;

    const h3Match = line.match(/^###\s+(.+)/);
    if (h3Match) { closeList(); html.push(`<h3>${inlineFormat(h3Match[1])}</h3>`); continue; }

    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) { closeList(); html.push(`<h2>${inlineFormat(h2Match[1])}</h2>`); continue; }

    const ulMatch = line.match(/^[-*]\s+(.+)/);
    if (ulMatch) {
      if (inList !== "ul") { closeList(); html.push("<ul>"); inList = "ul"; }
      html.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (inList !== "ol") { closeList(); html.push("<ol>"); inList = "ol"; }
      html.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    closeList();

    if (line.trim() === "") { html.push(""); continue; }

    html.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeList();
  return html.join("\n");
};
