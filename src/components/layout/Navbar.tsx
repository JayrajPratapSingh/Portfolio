"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import {
  FaBars,
  FaTimes,
  FaGithub,
  FaHome,
  FaUser,
  FaFolderOpen,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

import { Download } from "lucide-react";
import NavBackground from "./NavBackground";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <FaHome size={12} />,
    },
    {
      name: "About",
      path: "/about",
      icon: <FaUser size={12} />,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: <FaFolderOpen size={12} />,
    },
  ];

  return (
    <nav className="fixed top-4 left-1/2 z-[999] w-[95%] -translate-x-1/2 md:w-[90%]">

      <div
        className="
        relative overflow-hidden
        rounded-full
        border border-cyan-500/20
        bg-black/30
        px-6 py-3
        backdrop-blur-2xl
        shadow-[0_0_40px_rgba(0,255,255,.12)]
      "
      >

        <NavBackground />

        <div className="relative z-20 flex items-center justify-between">

          {/* Logo */}

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/images/logo.png"
              alt="logo"
              width={42}
              height={42}
              className="
              rounded-full
              hover:rotate-180
              duration-700
              "
            />

            <span className="
             md:block
            font-bold
            tracking-[4px]
            text-white
            ">
              PORTFOLIO
            </span>

          </Link>



          {/* Desktop */}

          <div className="hidden items-center gap-3 md:flex">

            {navItems.map((item) => (

              <Link
                key={item.name}
                href={item.path}
                className={`
                group
                flex
                items-center
                gap-2
                px-4
                py-2
                rounded-full
                transition-all
                duration-300

                ${
                  pathname === item.path
                    ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(0,255,255,.25)]"
                    : "text-white/70 hover:text-cyan-300 hover:bg-white/5"
                }
                `}
              >

                <span className="
                opacity-70
                group-hover:scale-110
                transition
                ">
                  {item.icon}
                </span>

                {item.name}

              </Link>

            ))}


            {/* Github */}

            <Link
              href="https://github.com/JayrajPratapSingh"
              target="_blank"
              className="
              rounded-full
              border border-white/10
              p-3
              text-white/70
              hover:text-cyan-300
              hover:border-cyan-400
              transition
              "
            >
              <FaGithub />
            </Link>


            {/* Resume */}

            <Link
              href="/resume.pdf"
              target="_blank"
              className="
              flex items-center gap-2
              rounded-full
              border border-white/10
              px-4 py-2
              text-white/70
              hover:text-cyan-300
              hover:border-cyan-400
              transition
              "
            >

              <Download size={16}/>
              Resume

            </Link>


            {/* Admin */}

            <Link
              href="/portal-x-admin/login"
              className="
              rounded-full
              border border-white/10
              p-3
              text-white/40
              hover:text-cyan-300
              hover:border-cyan-400
              transition
              "
            >

              <FaLock size={12}/>

            </Link>


            {/* Hire Me */}

            <Link
              href="/contact"
              className="
              rounded-full
              bg-cyan-400
              px-5 py-2
              text-black
              font-semibold
              hover:scale-105
              hover:shadow-[0_0_30px_cyan]
              transition
              "
            >
              Hire Me
            </Link>

          </div>


          {/* Mobile */}

          <button
            onClick={() =>
              setOpen(!open)
            }
            className="
            text-white
            md:hidden
            text-xl
            "
          >
            {open ?
            <FaTimes/>
            :
            <FaBars/>
            }

          </button>

        </div>


        {open && (

          <div
            className="
            mt-5
            rounded-3xl
            border border-white/10
            bg-black/90
            p-5
            space-y-3
            md:hidden
            "
          >

            {navItems.map((item)=>(

              <Link
                key={item.name}
                href={item.path}
                onClick={()=>
                setOpen(false)
                }
                className="
                flex
                items-center
                gap-3
                rounded-xl
                px-4 py-3
                text-white/70
                hover:text-cyan-300
                hover:bg-cyan-500/10
                "
              >

                {item.icon}

                {item.name}

              </Link>

            ))}

            <Link
              href="/portal-x-admin/login"
              className="
              flex items-center
              gap-3
              rounded-xl
              px-4 py-3
              text-white/70
              "
            >
              <FaLock/>

              Admin

            </Link>

          </div>

        )}

      </div>
    </nav>
  );
}