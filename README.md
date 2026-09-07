# osmarpetry.dev — Hugo

Portfolio, blog, slides and resume. One Go binary builds it. The only npm
package in the repo is the end-to-end test runner.

## Why this exists

The site used to be Gatsby ([the previous
repo](https://github.com/osmarpetry/portifolio-ssg2) still holds it under
`old-ssg2/`). Gatsby's last major release was 2022; since then it only got
per-dependency updates, the last one about six months ago. Keeping it alive was
the problem, not building it:

- dependabot turned personal projects into a queue of PRs I had to reason about
  one by one, across a dependency tree I never chose;
- `node_modules` made every check slow and every diff opaque;
- verifying that an upgrade had not broken anything cost real machine time, for
  a static site of 39 markdown files.

So this is the same site, rebuilt on something outside the Node ecosystem. Hugo
is a single binary, has never shipped a breaking major in twelve years, and
brings natively what used to be plugins here: image processing, taxonomies, RSS,
sitemap, syntax highlighting.

The plan was, in order: move the **layout, shell and components exactly as they
were**, then bring the **Obsidian markdown** over so the blog and its filters
are generated from it, and only then look at what could get better.

```bash
brew install hugo        # 0.165.0+extended, pinned in .dx.json
hugo server              # dev, live reload
npm run build            # hugo --gc --minify -> public/
npm run test:e2e         # Playwright against the real build output
npm run check:links      # lychee over public/ (brew install lychee)
npm run build:resume-pdf # regenerates the resume PDF from content/resume.md
```

## 1. How the code is organized

Four layers, outside in:

| Layer | Where | What it owns |
|---|---|---|
| **Document** | `layouts/baseof.html` | `<html>`, `<head>`, background, the one `<script>` |
| **Shell** | `layouts/_partials/shell/` | navbar, footer |
| **Page** | `layouts/home.html`, `projects.html`, `slides.html`, `page.html`, `posts/`, `taxonomy.html`, `term.html`, `404.html` | composes components, holds no markup detail |
| **Components** | `layouts/_partials/components/` | 14 partials, listed in `/styleguide/` |

One rule keeps it DRY: **a component takes a `dict` and nothing else.** No
component reads `site.*` or `hugo.Data.*`; pages do the lookups and pass values
down. That is why the same call works from a page and from the styleguide.

```go-html-template
{{ partial "components/post-card.html" (dict
  "title" .Title "url" .RelPermalink
  "date" (.Date.Format "2006-01-02") "tags" .Params.tags "description" .Description
) }}
```

Data is the other half:

- `content/posts/*.md` — the Obsidian markdown, unchanged except for the dead
  `layout: post.njk` key left over from an even older SSG.
- `data/projects.yaml`, `companies.yaml`, `slides.yaml`, `home.yaml` — converted
  from the old `src/data/*.js`. Asset paths are **derived from the slug** in the
  components, so no path is written twice.
- `hugo.toml` `[[menus.main]]` — the navbar. A link exists in exactly one place.

## 2. Styleguide instead of Storybook

Storybook is gone. `/styleguide/` replaces it: an index of all 14 components,
and one URL per component with a live preview, its arguments as JSON, and the
partial's source.

Adding a component to the docs means dropping a YAML file in `data/styleguide/`:

```yaml
title: Component preview — slide card
partial: components/slide-card.html
previewClass: slides-gallery-grid
args:
  slug: design-tokens
  title: Design Tokens
  topics: [Design Tokens, Frontend]
```

`content/styleguide/_content.gotmpl` (a Hugo content adapter) turns each fixture
into a page — no template, no content file, no story file. The fixture **is** the
component's argument list, so the docs cannot drift from the code.

What is lost versus Storybook: interactive controls, the addon ecosystem, and
Chromatic. What replaces it: 127 lines of Hugo templates, zero dependencies, and
Playwright asserting that every component still renders.

## 3. Obsidian

The posts come from my personal Obsidian vault: Portuguese notes and drafts,
reworked (with help from GPT) into posts with a beginning, a middle and an end.
They are kept here as my own memory, and there are many more still to come.

Obsidian's own linking keeps working, so the vault stays the source:

- `[[slug|Label]]` wikilinks — `components/prose.html` rewrites them to
  `wiki:slug` before rendering, and `_markup/render-link.html` resolves them.
- `[BDD](bdd.md)` relative note links — resolved the same way. The Gatsby build
  shipped these verbatim, so they 404'd; `lychee` caught seven of them.
- A link whose note does not exist renders as
  `<span class="post-inline-link--missing">` with the tooltip, exactly like
  before, instead of a dead link.

Post URLs use `:contentbasename`, so `/blog/agile/` keeps working — Hugo's
default would have derived the URL from the title and broken every link.

**The tag filter is server-rendered now.** It used to be 68 lines of React
juggling `hashchange` and `history.replaceState` behind `/blog/#tag=go`. It is a
Hugo taxonomy: `/tags/go/` is a real page, in the sitemap, indexable, and the
chips are plain links. `/blog/` and every tag page are the same partial with a
different post set — that is the DRY part.

## 4. Resume: one markdown, three outputs

`content/resume.md` is deliberately **front-matter free**, because three
consumers read it:

1. `/resume/` — rendered by `layouts/page.html` with the download button;
2. `/resume.md` — published verbatim by `_partials/resume/publish-raw.html`, for
   [dns-cv](https://github.com/osmarpetry/dns-cv);
3. `static/assets/resume/resume-osmarpetry.pdf` — `npm run build:resume-pdf`
   (Node stdlib plus headless Chrome, no npm dependencies).

## 5. Images, SEO and social cards

- `components/picture.html` emits AVIF + WebP srcsets from one source file.
  Quality is set per format in `[imaging]`, because one number means different
  things to each encoder.
- `_partials/head.html` writes title, description, canonical, Open Graph and
  Twitter tags; `head/jsonld.html` writes Person, WebSite and Article JSON-LD.
  This is the `react-helmet`/`Seo.jsx` job, done at build time.
- `_partials/og/card.html` builds the social card per page with
  `images.Text` + `images.Overlay` — the hero photo, the gradient, the eyebrow,
  the title and the description. It replaces 254 lines of `gatsby-node.js` and
  sharp. The gradient itself is a pre-rendered PNG (`assets/images/og/overlay.png`)
  because Hugo cannot draw gradients.
- Code fences are highlighted by Chroma during the build (`assets/css/chroma.css`,
  the dracula palette), which retired the ~70 `.hljs-*` rules the stylesheet
  carried for highlight.js.

## 6. Tests

`npm run test:e2e` builds the site and runs Playwright against `public/` —
59 tests over the home page, projects, blog and tag filtering, posts, wikilinks,
resume (including `/resume.md`), slides, navigation, 404, feeds, robots,
manifest, GA4 with Do Not Track, the social cards, highlighting, and every
component in the styleguide.

`npm run check:links` runs lychee over the built site: 3000 links, 0 errors.

## 7. CI/CD, Cloudflare Pages and dependabot

Present in this repo:

- **`.github/workflows/ci.yml`** — two jobs that run side by side. `build`
  installs the pinned Hugo, builds, and deploys to Cloudflare Pages; it pulls no
  Node and runs no JavaScript, because Hugo is Go and the deploy needs nothing
  else. `test` is where node_modules lives: Playwright, then lychee. Both must
  pass for a PR to merge, so the suite is still the gate — it just no longer
  sits between a merge and the site being live. Deploy is skipped on pull
  requests.
- **`.github/workflows/dependabot-auto-merge.yml`** — squash-merges a dependabot
  PR once `ci` reports success, then dispatches `ci` on `main`. The dispatch is
  not optional: a push made with `GITHUB_TOKEN` does not start a workflow run,
  so without it the merge would land and never deploy.
- **`.github/dependabot.yml`** — npm (the single devDependency) and
  github-actions, monthly.

Hosting is **Cloudflare Pages, Direct Upload** (project `new-hugo`, served at
`new-hugo-eka.pages.dev` and on the apex). Cloudflare never builds this repo;
GitHub Actions does, and uploads `public/`. Direct Upload is a one-way door —
a project created this way cannot be converted to git integration later. That
was the deliberate trade for making CI the real gate, since git integration
deploys on push without waiting for it.

The catch worth stating: **dependabot cannot bump Hugo.** Hugo is not an npm
package, so its version is pinned by hand in two places that must move
together — `.dx.json` and `.github/workflows/ci.yml`. Automating that means
Renovate or a manual check.

Note that the **old repo's CI still points at the Gatsby build** and will fail
until it is updated or retired there.

## 8. Before and after

| | Gatsby (`old-ssg2`) | Hugo (here) |
|---|---|---|
| Layout, shell, components | React components, plain CSS | Same markup, same 2844-line stylesheet, as Hugo partials |
| Component docs | Storybook 10 (npm, bundler, majors) | `/styleguide/`, 14 components, zero dependencies |
| Blog source | Obsidian markdown | Same files, unchanged |
| Wikilinks between notes | custom remark plugin | link render hook (and relative `.md` links now work too) |
| Tag filter | 68 lines of React, `/blog/#tag=x` | taxonomy pages at `/tags/x/`, no JavaScript |
| Images | `gatsby-plugin-image` + sharp | native pipeline, AVIF + WebP |
| Social preview | `Seo.jsx` + 254 lines of `gatsby-node.js` | `head.html` + `og/card.html` |
| Syntax highlighting | highlight.js in the browser | Chroma at build time |
| RSS | `gatsby-plugin-feed` | built in, kept at `/rss.xml` |
| Sitemap, robots | two plugins | built in |
| Resume | markdown -> page + raw copy + PDF script | same three outputs |
| Slides hosting | 24 PDFs + thumbnails in `static/` | same PDFs, thumbnails now optimized |
| Dependencies | 22 npm packages + lockfile | 1 binary, plus Playwright for tests |
| Build | webpack + GraphQL layer, `.cache/` | `hugo --gc --minify` |
| Version upgrades | dependabot queue | one pinned Hugo version, by hand |

## Who

Osmar Petry — Luxembourgish-Brazilian Senior Software Engineer, based in
Luxembourg, 10+ years building web and mobile products across EU and US
distributed teams. Full resume at [osmarpetry.dev/resume](https://osmarpetry.dev/resume/),
slides at [osmarpetry.dev/slides](https://osmarpetry.dev/slides/).

The Gatsby site this replaces lives at
<https://github.com/osmarpetry/portifolio-ssg2>.
