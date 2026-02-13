# SEO Audit & Roadmap

**Date:** 2026-02-13  
**Status:** Pre-implementation  
**Priority:** Critical — build alongside Supabase migration  

---

## Current State: Not SEO-Ready

The app is currently invisible to search engines. Every page is a client component (`"use client"`), meaning Google's crawler sees empty HTML shells with no content, no unique titles, and no meta descriptions.

This matters because **each idea page is a potential long-tail search landing page** ("AI prompt for morning email triage", "automate expense tracking with AI agent"). With 100+ ideas at launch, that's 100+ entry points — but only if Google can see them.

---

## 🔴 Critical Gaps

### 1. Client-Side Rendering on Key Pages
**Problem:** `/idea/[slug]`, `/stacks/[slug]`, `/user/[username]` are all `"use client"` — zero SSR content for crawlers.

**Fix:** Convert to server components with `generateMetadata`. Extract interactive parts (save, copy, comments) into client sub-components.

**Impact:** This alone is 80% of the SEO fix.

**Target pages (priority order):**
| Page | SEO Value | Why |
|---|---|---|
| `/idea/[slug]` | 🔴 Highest | Each idea = unique long-tail keyword target |
| `/stacks/[slug]` | 🟡 High | Collection pages rank for broader queries |
| `/user/[username]` | 🟡 Medium | Author pages build topical authority |
| `/explore` | 🟡 Medium | Category landing pages |
| `/` (home) | 🟢 Already OK | Static enough, but needs better meta |

### 2. No Per-Page Metadata
**Problem:** Every page shows the same generic title "OpenClaw Inspo" and the same description. Google needs unique title + description per page to index them individually.

**Fix:** Add `generateMetadata` to every public page:

```typescript
// /idea/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const idea = getIdeaBySlug(params.slug);
  return {
    title: `${idea.title} — AI Automation Prompt`,
    description: idea.description,
    openGraph: {
      title: idea.title,
      description: idea.description,
      type: "article",
      publishedTime: idea.published_at,
      authors: [idea.author?.display_name],
      tags: [...idea.tags, idea.category],
    },
  };
}
```

**Title patterns:**
- Ideas: `"[Title] — AI Automation Prompt | [AppName]"`
- Stacks: `"[Title] — AI Prompt Bundle | [AppName]"`
- Users: `"[Display Name] (@[username]) | [AppName]"`
- Categories: `"AI Automation Prompts for [Category] | [AppName]"`

### 3. No sitemap.xml
**Problem:** Google doesn't know what pages exist.

**Fix:** `src/app/sitemap.ts` (Next.js built-in):

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ideas = getAllIdeas(); // from DB/seed
  const stacks = getAllStacks();
  
  return [
    { url: `${BASE_URL}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/explore`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/stacks`, changeFrequency: 'weekly', priority: 0.7 },
    ...ideas.map(idea => ({
      url: `${BASE_URL}/idea/${idea.slug}`,
      lastModified: idea.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...stacks.map(stack => ({
      url: `${BASE_URL}/stacks/${stack.slug}`,
      lastModified: stack.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
```

### 4. No robots.txt
**Problem:** No crawl directives.

**Fix:** `src/app/robots.ts`:

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/admin/', '/profile', '/submit'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

### 5. No Structured Data (JSON-LD)
**Problem:** No rich snippets in search results.

**Fix:** Add JSON-LD to idea pages:

```typescript
// HowTo schema for idea pages (prompts are instructions)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: idea.title,
  description: idea.description,
  step: [{
    "@type": "HowToStep",
    text: `Copy this prompt: ${idea.prompt.slice(0, 200)}...`,
  }],
  author: {
    "@type": "Person",
    name: idea.author?.display_name,
  },
  datePublished: idea.published_at,
  interactionStatistic: [
    { "@type": "InteractionCounter", interactionType: "https://schema.org/BookmarkAction", userInteractionCount: idea.save_count },
    { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: idea.comment_count },
  ],
};
```

Also `CollectionPage` schema for stacks, `ProfilePage` for users.

### 6. No Canonical URLs
**Problem:** Duplicate content risk.

**Fix:** Set `alternates.canonical` in `generateMetadata`:
```typescript
alternates: { canonical: `${BASE_URL}/idea/${idea.slug}` }
```

---

## 🟡 Important (Post-Launch)

### 7. Dynamic OG Images (Vercel OG)
Generate unique social sharing cards per idea. When shared on Twitter/Discord/Slack:
- Branded card with idea title, category badge, spark count
- Drives clicks → backlinks → SEO

Use `@vercel/og` or Next.js `ImageResponse` at `/api/og/[slug]`.

### 8. RSS Feed
`/feed.xml` — allows content syndication, podcast apps, and RSS readers to discover content. Also signals to Google that content is regularly updated.

### 9. Category Landing Pages
Optimize `/explore` sub-pages as landing pages for:
- "AI automation prompts for productivity"
- "AI prompts for finance and expense tracking"
- "Fun AI agent experiments"

Each category should have unique copy, not just a filtered feed.

### 10. Blog / Guides Section (v2-v3)
Long-form content targeting broader queries:
- "10 AI automation prompts that save 5 hours a week"
- "How to build a morning briefing agent"
- "AI automation ideas for small businesses"

This is the content marketing layer. Each blog post links to relevant ideas → internal linking → SEO juice flows to idea pages.

---

## Implementation Plan

### During Supabase Migration (do together)
Since we're restructuring data fetching anyway:
1. Convert idea detail page to server component + `generateMetadata`
2. Convert stack detail page to server component + `generateMetadata`
3. Convert user profile page to server component + `generateMetadata`
4. Add `sitemap.ts`
5. Add `robots.ts`
6. Add canonical URLs

### Post-Migration Sprint
7. JSON-LD structured data on idea/stack/user pages
8. Dynamic OG images via Vercel OG
9. Category landing page optimization
10. RSS feed

### Future
11. Blog/guides section
12. Internal linking strategy
13. Performance optimization (Core Web Vitals — already good with Next.js SSR)

---

## SEO Keyword Targets

**Primary (idea pages):**
- "AI prompt for [specific task]"
- "AI automation prompt [category]"
- "[task] AI agent prompt"
- "how to automate [task] with AI"

**Secondary (category/stack pages):**
- "AI automation ideas for [category]"
- "best AI prompts for [use case]"
- "AI agent workflow [category]"

**Brand (once established):**
- "[AppName] prompts"
- "[AppName] AI automation"

---

*This audit should be referenced during the Supabase migration. The SSR conversion is the #1 priority — everything else builds on it.*
