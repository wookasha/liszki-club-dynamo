export const renderNewsContent = (content: string): string => {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = content.split("\n");
  const html: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let inBlockquote = false;

  const findSingleAsteriskEnd = (text: string, start: number) => {
    for (let i = start; i < text.length; i++) {
      if (text[i] === "*" && text[i - 1] !== "*" && text[i + 1] !== "*") {
        return i;
      }
    }
    return -1;
  };

  const inlineFormat = (line: string): string => {
    let html = "";
    let i = 0;

    while (i < line.length) {
      if (line.startsWith("[", i)) {
        const labelEnd = line.indexOf("]", i + 1);
        const urlStart = labelEnd >= 0 && line[labelEnd + 1] === "(" ? labelEnd + 2 : -1;
        const urlEnd = urlStart >= 0 ? line.indexOf(")", urlStart) : -1;

        if (labelEnd >= 0 && urlStart >= 0 && urlEnd >= 0) {
          const label = line.slice(i + 1, labelEnd);
          const url = line.slice(urlStart, urlEnd);
          html += `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${inlineFormat(label)}</a>`;
          i = urlEnd + 1;
          continue;
        }
      }

      if (line.startsWith("***", i)) {
        const end = line.indexOf("***", i + 3);
        if (end !== -1) {
          html += `<strong><em>${inlineFormat(line.slice(i + 3, end))}</em></strong>`;
          i = end + 3;
          continue;
        }
      }

      if (line.startsWith("**", i)) {
        const end = line.indexOf("**", i + 2);
        if (end !== -1) {
          html += `<strong>${inlineFormat(line.slice(i + 2, end))}</strong>`;
          i = end + 2;
          continue;
        }
      }

      if (line.startsWith("~~", i)) {
        const end = line.indexOf("~~", i + 2);
        if (end !== -1) {
          html += `<del>${inlineFormat(line.slice(i + 2, end))}</del>`;
          i = end + 2;
          continue;
        }
      }

      if (line[i] === "*") {
        const end = findSingleAsteriskEnd(line, i + 1);
        if (end !== -1) {
          html += `<em>${inlineFormat(line.slice(i + 1, end))}</em>`;
          i = end + 1;
          continue;
        }
      }

      html += escape(line[i]);
      i += 1;
    }

    return html;
  };

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
