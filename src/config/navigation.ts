import {
  BookOpen,
  CheckSquare,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prospects", label: "Prospects", icon: Users },
  { href: "/actions", label: "Actions", icon: CheckSquare },
  { href: "/bibliotheque", label: "Bibliothèque", icon: BookOpen },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

// Les sections de la bibliothèque (méthodes, offres, sources…) sont décrites
// dans src/config/library.ts.
