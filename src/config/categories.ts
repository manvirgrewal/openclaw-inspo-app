export interface Category {
  id: string;
  label: string;
  color: string; // Tailwind color class
  icon: string;  // Lucide icon name
}

export const CATEGORIES: Category[] = [
  { id: "productivity", label: "Productivity", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: "Zap" },
  { id: "development", label: "Development", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: "Code" },
  { id: "communication", label: "Communication", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: "MessageSquare" },
  { id: "finance", label: "Finance & Business", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: "DollarSign" },
  { id: "health", label: "Health & Wellness", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: "Heart" },
  { id: "learning", label: "Learning & Research", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", icon: "BookOpen" },
  { id: "home", label: "Home & Life", color: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: "Home" },
  { id: "creative", label: "Creative", color: "bg-pink-500/10 text-pink-400 border-pink-500/20", icon: "Palette" },
  { id: "fun", label: "Fun & Experimental", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: "Sparkles" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export type CategoryId = (typeof CATEGORIES)[number]["id"];
