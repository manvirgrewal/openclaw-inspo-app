export interface Category {
  id: string;
  label: string;
  color: string; // Tailwind color class
  icon: string;  // Lucide icon name
}

export const CATEGORIES: Category[] = [
  { id: "productivity", label: "Productivity", color: "bg-sky-500/10 text-sky-400 border-sky-500/20", icon: "Zap" },
  { id: "development", label: "Development", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: "Code" },
  { id: "communication", label: "Communication", color: "bg-violet-500/10 text-violet-400 border-violet-500/20", icon: "MessageSquare" },
  { id: "finance", label: "Finance & Business", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: "DollarSign" },
  { id: "health", label: "Health & Wellness", color: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: "Heart" },
  { id: "learning", label: "Learning & Research", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", icon: "BookOpen" },
  { id: "home", label: "Home & Life", color: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: "Home" },
  { id: "creative", label: "Creative", color: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20", icon: "Palette" },
  { id: "fun", label: "Fun & Experimental", color: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: "Sparkles" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export type CategoryId = (typeof CATEGORIES)[number]["id"];
