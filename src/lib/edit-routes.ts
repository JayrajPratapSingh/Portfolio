/**
 * Maps a public route to the dashboard form that edits its content. Powers the
 * navbar "Edit this page" action and the floating edit button, so an admin can
 * jump straight from any page to the form that drives it.
 */
export interface EditTarget {
  href: string;
  label: string;
}

export function editTargetForPath(pathname: string): EditTarget {
  if (pathname === "/" || pathname.startsWith("/#")) {
    return { href: "/dashboard/hero", label: "Edit hero" };
  }
  if (pathname.startsWith("/about")) {
    return { href: "/dashboard/about", label: "Edit about page" };
  }
  if (pathname.startsWith("/projects")) {
    return { href: "/dashboard/projects", label: "Edit projects" };
  }
  if (pathname.startsWith("/resume")) {
    return { href: "/dashboard/resume", label: "Edit resume" };
  }
  if (pathname.startsWith("/hire-me")) {
    return { href: "/dashboard/messages", label: "View messages" };
  }
  return { href: "/dashboard", label: "Open dashboard" };
}

/** Routes where the floating edit button should never appear. */
export function isAdminArea(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
}
