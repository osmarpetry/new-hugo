/**
 * Renders content/resume.md as the CV PDF, in the layout the previous PDF used.
 *
 * The palette is the one lifted out of that PDF's content stream, so the new
 * file matches the old: #17365d for the name and section headings, #8eaadb for
 * the rules under them.
 *
 * The `<!-- dns: -->` comments the DNS CV reads are dropped here, exactly as
 * every other renderer drops them.
 *
 *   node scripts/build-resume-pdf.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOURCE = path.join(ROOT, "content", "resume.md");
const OUTPUT = path.join(ROOT, "static", "assets", "resume", "resume-osmarpetry.pdf");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const escapeHtml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The only inline markup the CV uses. */
const inline = (value) =>
  escapeHtml(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

/** `Luxembourg · Oct 2025 - Present` reads as `Luxembourg | Oct 2025 - Present`. */
const meta = (value) => inline(value.replace(/·/g, "|"));

const splitOnHeadings = (markdown) => {
  const blocks = new Map();
  for (const part of markdown.split(/^## /m).slice(1)) {
    const breakAt = part.indexOf("\n");
    const heading = (breakAt === -1 ? part : part.slice(0, breakAt)).trim();
    blocks.set(heading, breakAt === -1 ? "" : part.slice(breakAt + 1));
  }
  return blocks;
};

const paragraph = (body) =>
  body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("<"))
    .join(" ");

const bullets = (body) =>
  body
    .split("\n")
    .filter((line) => line.trim().startsWith("- "))
    .map((line) => `<li>${inline(line.trim().slice(2))}</li>`)
    .join("");

/**
 * The headline stays clickable in the PDF: Chrome turns each anchor into a link
 * annotation, so tel:, mailto: and the profiles all work from a reader. They
 * keep the plain look of the printed CV rather than turning blue.
 */
const contactLine = (body) =>
  [...body.matchAll(/<li><a href="([^"]*)"[^>]*>([^<]*)<\/a><\/li>/g)]
    .map(([, href, text]) => {
      const target = /^(mailto|tel):/.test(href) ? "" : ' target="_blank" rel="noreferrer"';
      return `<a href="${escapeHtml(href)}"${target}>${escapeHtml(text.trim())}</a>`;
    })
    .join(' <span class="sep">|</span> ');

const roles = (body) =>
  body
    .split(/^### /m)
    .slice(1)
    .map((block) => {
      const lines = block.split("\n");
      const company = lines[0].trim();
      const titleAt = lines.findIndex((line) => line.startsWith("#### "));
      const metaLine = lines.slice(titleAt + 1).find((line) => line.trim() !== "") ?? "";

      return `<div class="role">
      <h3>${inline(company)} <span class="sep">|</span> ${inline(lines[titleAt].slice(5).trim())}</h3>
      <p class="meta">${meta(metaLine)}</p>
      <ul>${bullets(block)}</ul>
    </div>`;
    })
    .join("");

const section = (title, body) =>
  `<h2>${title}</h2>\n<div class="rule"></div>\n${body}`;

const render = (markdown) => {
  // The DNS CV's short prose is not part of the printed CV.
  const source = markdown.replace(/<!--[\s\S]*?-->/g, "");
  const blocks = splitOnHeadings(source);
  const name = /^# (.+)$/m.exec(source)[1].trim();
  const [title] = [...blocks.keys()];

  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>${escapeHtml(name)} - CV</title>
<style>
  @page { size: letter; margin: 14mm 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Calibri, Carlito, "Helvetica Neue", Arial, sans-serif;
    font-size: 9.5pt;
    line-height: 1.3;
    color: #000;
  }
  h1 {
    margin: 0;
    text-align: center;
    font-size: 22pt;
    color: #17365d;
  }
  .subtitle { margin: 2pt 0 6pt; text-align: center; font-size: 12pt; font-weight: bold; }
  .contact { margin: 0 0 4pt; text-align: center; font-size: 8.5pt; }
  .contact .sep, .role .sep { color: #8eaadb; }
  .contact a { color: inherit; text-decoration: none; }
  h2 {
    margin: 10pt 0 1pt;
    font-size: 10.5pt;
    font-weight: bold;
    color: #17365d;
    text-transform: uppercase;
    letter-spacing: 0.4pt;
  }
  .rule { height: 1.2pt; background: #8eaadb; margin-bottom: 4pt; }
  p { margin: 0 0 4pt; }
  .role { margin-top: 6pt; }
  .role h3 { margin: 0; font-size: 10.5pt; font-weight: bold; }
  .role .meta { margin: 0 0 2pt; font-size: 9pt; font-style: italic; color: #444; }
  ul { margin: 0; padding-left: 14pt; }
  li { margin-bottom: 1.5pt; }
</style>
<h1>${escapeHtml(name)}</h1>
<p class="subtitle">${escapeHtml(title)}</p>
<p class="contact">${contactLine(blocks.get(title))}</p>
<div class="rule"></div>
${section("Summary", `<p>${inline(paragraph(blocks.get("Summary")))}</p>`)}
${section("Core Skills", `<p>${inline(paragraph(blocks.get("Core Skills")))}</p>`)}
${section("Experience", roles(blocks.get("Experience")))}
${section("Education", `<ul>${bullets(blocks.get("Education"))}</ul>`)}
</html>`;
};

const html = render(fs.readFileSync(SOURCE, "utf8"));
const staging = fs.mkdtempSync(path.join(os.tmpdir(), "resume-pdf-"));
const page = path.join(staging, "resume.html");
fs.writeFileSync(page, html);

execFileSync(CHROME, [
  "--headless",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${OUTPUT}`,
  `file://${page}`,
]);

fs.rmSync(staging, { recursive: true, force: true });
console.log(`Wrote ${path.relative(ROOT, OUTPUT)}`);
