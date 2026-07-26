import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/JayrajPratapSingh",
    icon: FaGithub,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jayraj-pratap-singh-457712193",
    icon: FaLinkedin,
  },
  { label: "Email", href: "mailto:hello@jayraj.dev", icon: Mail },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-sun" />
      <div className="footer-content">
        <p className="footer-eyebrow">OPEN TO SELECTED COLLABORATIONS</p>
        <Link href="/hire-me" className="footer-heading">
          Let&apos;s build
          <br />
          <em>the next signal.</em>
          <ArrowUpRight />
        </Link>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} JAYRAJ PRATAP SINGH</span>
          <div>
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                <Icon size={15} /> {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
