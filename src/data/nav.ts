export interface NavItem {
  name: string;
  path: string;
}

/** Primary navigation — shared by the Navbar and Footer. */
export const navItems: NavItem[] = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
];
