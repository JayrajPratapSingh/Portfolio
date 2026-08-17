import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center px-6 text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_30%_10%,#ffffff,#f5f6fb_55%,#eef1fb)] dark:bg-[radial-gradient(120%_120%_at_30%_10%,#0a1220,#030712_60%,#000)]" />
      </div>

      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-cyan-300">
          404
        </p>
        <h1 className="mt-5 text-3xl font-black md:text-4xl">
          That project doesn&apos;t exist
        </h1>
        <p className="mt-4 leading-8 text-foreground/60">
          The case study you&apos;re looking for may have been renamed or removed.
        </p>
        <Link
          href="/projects"
          className="btn-3d mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white dark:from-cyan-400 dark:to-cyan-300 dark:text-black"
        >
          <ArrowLeft size={16} /> Back to all projects
        </Link>
      </div>
    </main>
  );
}
