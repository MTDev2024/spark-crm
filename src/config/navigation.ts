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

export type LibrarySection = {
  slug: string;
  label: string;
  description: string;
};

export const librarySections: LibrarySection[] = [
  {
    slug: "methodes",
    label: "Méthodes",
    description:
      "Méthodes commerciales (SPIN, SONCAS, AIDA…) et playbooks, chacune rattachée à une source.",
  },
  {
    slug: "offres",
    label: "Offres",
    description: "Prestations, prix, périmètre, livrables, limites et délais.",
  },
  {
    slug: "realisations",
    label: "Réalisations",
    description:
      "Projets réalisés utilisables comme preuve, avec leur contexte de pertinence.",
  },
  {
    slug: "arguments",
    label: "Arguments",
    description: "Arguments reliés à un problème, un bénéfice et un contexte.",
  },
  {
    slug: "objections",
    label: "Objections",
    description: "Objections rencontrées, réponses et questions associées.",
  },
  {
    slug: "sources",
    label: "Sources",
    description:
      "Documents et contenus de référence, avec leur statut de validation.",
  },
];
