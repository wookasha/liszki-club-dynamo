export const renderNewsContent = (content: string): string => {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = content.split("\n");
  const html: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let inBlockquote = false;

  const inlineFormat = (line: string) =>
    escape(line)
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');

  const closeList = () => {
    if (inList) {
      html.push(inList === "ul" ? "</ul>" : "</ol>");
      inList = null;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      html.push("</blockquote>");
      inBlockquote = false;
    }
  };

  for (const line of lines) {
    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      closeList();
      closeBlockquote();
      html.push("<hr />");
      continue;
    }

    // Headings
    const h3Match = line.match(/^###\s+(.+)/);
    if (h3Match) { closeList(); closeBlockquote(); html.push(`<h3>${inlineFormat(h3Match[1])}</h3>`); continue; }

    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) { closeList(); closeBlockquote(); html.push(`<h2>${inlineFormat(h2Match[1])}</h2>`); continue; }

    // Blockquote
    const bqMatch = line.match(/^>\s?(.*)/);
    if (bqMatch) {
      closeList();
      if (!inBlockquote) { html.push("<blockquote>"); inBlockquote = true; }
      html.push(`<p>${inlineFormat(bqMatch[1])}</p>`);
      continue;
    } else {
      closeBlockquote();
    }

    // Unordered list
    const ulMatch = line.match(/^[-*]\s+(.+)/);
    if (ulMatch) {
      if (inList !== "ul") { closeList(); html.push("<ul>"); inList = "ul"; }
      html.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (inList !== "ol") { closeList(); html.push("<ol>"); inList = "ol"; }
      html.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    closeList();

    if (line.trim() === "") { html.push('<div class="h-4"></div>'); continue; }

    html.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeList();
  closeBlockquote();
  return html.join("\n");
};
