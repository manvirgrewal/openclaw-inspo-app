import type { Idea } from "@/modules/ideas/ideas.types";
import type { Stack } from "@/modules/stacks/stacks.types";
import { SEED_IDEAS } from "./seed-ideas";

// Detailed stack items with context notes and linked ideas
interface StackDetail {
  stack: Omit<Stack, "items"> & { items: { idea: Idea; context_note: string | null }[] };
}

export const SEED_STACK_DETAILS: Record<string, StackDetail> = {
  "morning-autopilot": {
    stack: {
      id: "s1",
      author_id: "u1",
      slug: "morning-autopilot",
      title: "The Morning Autopilot",
      description: "Automate your entire morning routine — from weather briefing to email triage to task prioritization. Chain these prompts together for a fully automated morning.",
      cover_image_url: null,
      category: "productivity",
      is_featured: true,
      status: "published",
      save_count: 89,
      view_count: 340,
      created_at: "2026-02-01T08:00:00Z",
      updated_at: "2026-02-01T08:00:00Z",
      author: { id: "u1", username: "sarah_dev", display_name: "Sarah Chen", avatar_url: "https://api.dicebear.com/9.x/notionists/svg?seed=sarah_dev&backgroundColor=c0aede" },
      items: [
        { idea: SEED_IDEAS[0], context_note: "Start your morning with a full briefing — calendar, weather, and emails in one shot." },
        { idea: SEED_IDEAS[3], context_note: "Now prep for your first meeting with relevant context pulled automatically." },
        { idea: SEED_IDEAS[4], context_note: "End the morning by queuing up something to learn this week." },
      ],
    },
  },
  "freelancer-finance-stack": {
    stack: {
      id: "s2",
      author_id: "u2",
      slug: "freelancer-finance-stack",
      title: "Freelancer Finance Stack",
      description: "Track expenses, invoice clients, forecast cash flow — all automated through your agent. Stop dreading tax season.",
      cover_image_url: null,
      category: "finance",
      is_featured: false,
      status: "published",
      save_count: 64,
      view_count: 210,
      created_at: "2026-02-03T12:00:00Z",
      updated_at: "2026-02-03T12:00:00Z",
      author: { id: "u2", username: "alex_finance", display_name: "Alex", avatar_url: "https://api.dicebear.com/9.x/notionists/svg?seed=alex_finance&backgroundColor=ffeab6" },
      items: [
        { idea: SEED_IDEAS[1], context_note: "Start by auto-tracking every expense as it happens." },
        { idea: SEED_IDEAS[0], context_note: "Pair with a daily briefing to stay on top of spending patterns." },
      ],
    },
  },
  "content-creation-pipeline": {
    stack: {
      id: "s3",
      author_id: "u3",
      slug: "content-creation-pipeline",
      title: "Content Creation Pipeline",
      description: "From research to outline to draft to social posts. A complete content workflow that turns one idea into multi-platform content.",
      cover_image_url: null,
      category: "creative",
      is_featured: true,
      status: "published",
      save_count: 112,
      view_count: 520,
      created_at: "2026-02-05T14:00:00Z",
      updated_at: "2026-02-05T14:00:00Z",
      author: { id: "u3", username: "maya_creates", display_name: "Maya", avatar_url: "https://api.dicebear.com/9.x/notionists/svg?seed=maya_creates&backgroundColor=d1f4d9" },
      items: [
        { idea: SEED_IDEAS[4], context_note: "Research phase — gather interesting material to write about." },
        { idea: SEED_IDEAS[2], context_note: "Summarize what you've done so far to keep track." },
      ],
    },
  },
  "dev-productivity-boost": {
    stack: {
      id: "s4",
      author_id: "u1",
      slug: "dev-productivity-boost",
      title: "Dev Productivity Boost",
      description: "Code review, PR summaries, dependency updates, and changelog generation — automate the boring parts of development.",
      cover_image_url: null,
      category: "development",
      is_featured: false,
      status: "published",
      save_count: 78,
      view_count: 290,
      created_at: "2026-02-07T10:00:00Z",
      updated_at: "2026-02-07T10:00:00Z",
      author: { id: "u1", username: "sarah_dev", display_name: "Sarah Chen", avatar_url: "https://api.dicebear.com/9.x/notionists/svg?seed=sarah_dev&backgroundColor=c0aede" },
      items: [
        { idea: SEED_IDEAS[2], context_note: "Start with automated commit summaries for your daily standup." },
        { idea: SEED_IDEAS[3], context_note: "Before code review meetings, pull context automatically." },
      ],
    },
  },
};

// Flat list for the stacks listing page
export const SEED_STACKS_LIST: Stack[] = Object.values(SEED_STACK_DETAILS).map((d) => ({
  ...d.stack,
  items: d.stack.items.map((item, i) => ({
    stack_id: d.stack.id,
    idea_id: item.idea.id,
    position: i,
    context_note: item.context_note,
  })),
}));
