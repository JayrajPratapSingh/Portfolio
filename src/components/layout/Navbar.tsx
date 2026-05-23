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
      icon: <FaHome size={13} />,
    },
    {
      name: "About",
      path: "/about",
      icon: <FaUser size={13} />,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: <FaFolderOpen size={13} />,
    },
  ];

  return (
    <nav className="fixed top-4 left-1/2 z-[999] w-[95%] md:w-[90%] -translate-x-1/2">

      <div className="relative">

        {/* NAVBAR */}

        <div
          className="
          relative
          rounded-full
          border border-cyan-500/20
          bg-black/30
          px-5 py-3
          backdrop-blur-2xl
          shadow-[0_0_40px_rgba(0,255,255,.12)]
          overflow-visible
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
                width={40}
                height={40}
                className="
                rounded-full
                transition
                hover:rotate-180
                duration-700
                "
              />

              <span
                className="
                text-sm
                md:text-base
                font-bold
                tracking-[2px]
                md:tracking-[4px]
                text-white
                "
              >
                PORTFOLIO
              </span>

            </Link>



            {/* Desktop */}

            <div className="hidden md:flex items-center gap-3">

              {navItems.map((item) => (

                <Link
                  key={item.name}
                  href={item.path}
                  className={`
                  flex
                  items-center
                  gap-2
                  rounded-full
                  px-4 py-2
                  transition-all

                  ${
                    pathname === item.path
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-white/70 hover:text-cyan-300 hover:bg-white/5"
                  }
                  `}
                >

                  {item.icon}

                  {item.name}

                </Link>

              ))}


              <Link
                href="https://github.com/JayrajPratapSingh"
                target="_blank"
                className="
                p-3
                rounded-full
                border border-white/10
                text-white/70
                hover:border-cyan-400
                hover:text-cyan-300
                "
              >
                <FaGithub/>
              </Link>


              <Link
                href="/resume.pdf"
                target="_blank"
                className="
                flex
                items-center
                gap-2
                px-4 py-2
                rounded-full
                border border-white/10
                text-white/70
                hover:border-cyan-400
                hover:text-cyan-300
                "
              >

                <Download size={16}/>

                Resume

              </Link>


              <Link
                href="/admin/login"
                className="
                p-3
                rounded-full
                border border-white/10
                text-white/40
                hover:text-cyan-300
                "
              >

                <FaLock/>

              </Link>


              <Link
                href="/hire-me"
                className="
                px-5 py-2
                rounded-full
                bg-cyan-400
                text-black
                font-semibold
                hover:scale-105
                transition
                "
              >
                Hire Me
              </Link>

            </div>



            {/* Mobile button */}

            <button
              onClick={() => setOpen(!open)}
              className="
              text-white
              text-xl
              md:hidden
              "
            >
              {open ? <FaTimes/> : <FaBars/>}
            </button>

          </div>

        </div>



        {/* MOBILE DRAWER */}

        {open && (

          <div
            className="
            absolute
            top-[85px]
            left-0
            w-full
            rounded-[30px]
            border border-cyan-500/20
            bg-black/95
            backdrop-blur-3xl
            p-5
            space-y-3
            shadow-[0_0_40px_rgba(0,255,255,.2)]
            md:hidden
            "
          >

            {navItems.map((item)=>(

              <Link
                key={item.name}
                href={item.path}
                onClick={()=>setOpen(false)}
                className={`
                flex
                items-center
                gap-3
                rounded-2xl
                px-4
                py-4

                ${
                  pathname===item.path
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-white/70"
                }
                `}
              >

                {item.icon}

                {item.name}

              </Link>

            ))}


            <div className="flex gap-3">

              <Link
                href="https://github.com/JayrajPratapSingh"
                target="_blank"
                className="
                flex-1
                rounded-xl
                border border-white/10
                p-4
                flex justify-center
                text-white
                "
              >

                <FaGithub/>

              </Link>


              <Link
                href="/admin/login"
                className="
                flex-1
                rounded-xl
                border border-white/10
                p-4
                flex justify-center
                text-white
                "
              >

                <FaLock/>

              </Link>

            </div>


            <Link
              href="/hire-me"
              className="
              block
              w-full
              rounded-2xl
              bg-cyan-400
              py-4
              text-center
              text-black
              font-bold
              "
            >

              Hire Me

            </Link>

          </div>

        )}

      </div>

    </nav>
  );
}