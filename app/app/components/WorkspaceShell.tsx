"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Αρχική", icon: "🏠" },
  { href: "/students", label: "Μαθητές", icon: "👨‍🎓" },
  { href: "/teachers", label: "Καθηγητές", icon: "👨‍🏫" },
  { href: "/courses", label: "Μαθήματα", icon: "📚" },
  { href: "/attendance", label: "Παρουσίες", icon: "✅" },
  { href: "/payments", label: "Πληρωμές", icon: "💳" },
  { href: "/parents", label: "Γονείς", icon: "👪" },
  { href: "/schedule", label: "Πρόγραμμα", icon: "📅" },
];
