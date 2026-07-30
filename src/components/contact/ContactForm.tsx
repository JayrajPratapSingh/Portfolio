"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

type FormData = {
  name: string;
  email: string;
  message: string;
};

const field =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3.5 text-foreground outline-none transition-colors placeholder:text-foreground/40 focus:border-indigo-400 focus:ring-2 focus:ring-[var(--ring)] dark:bg-black/40 dark:focus:border-cyan-400";

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [sent, setSent] = useState(false);

  const submit = async (data: FormData) => {
    const toastId = toast.loading("Sending…");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      toast.dismiss(toastId);
      if (!res.ok) throw new Error(result.message);
      toast.success("Message sent 🚀");
      setSent(true);
      reset();
      setTimeout(() => setSent(false), 4000);
    } catch {
      toast.dismiss(toastId);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)]/70 p-8 shadow-[var(--shadow-soft)] backdrop-blur-xl dark:bg-white/[0.04]"
      >
        <div className="relative z-10 space-y-5">
          <div>
            <h2 className="text-3xl font-black md:text-4xl">Start a conversation</h2>
            <p className="mt-2 text-foreground/60">
              Tell me about your idea — I usually reply within a day.
            </p>
          </div>

          {/* name */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm text-foreground/70">
              Name
            </label>
            <input
              id="name"
              className={field}
              placeholder="Your name"
              aria-invalid={!!errors.name}
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-foreground/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={field}
              placeholder="you@email.com"
              aria-invalid={!!errors.email}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
              })}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* message */}
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm text-foreground/70">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              className={field}
              placeholder="Tell me about your project…"
              aria-invalid={!!errors.message}
              {...register("message", {
                required: "Message is required",
                minLength: { value: 10, message: "A little more detail, please" },
              })}
            />
            {errors.message && (
              <p className="mt-1.5 text-xs text-red-500">{errors.message.message}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting || sent}
            whileHover={isSubmitting || sent ? undefined : { scale: 1.02 }}
            whileTap={isSubmitting || sent ? undefined : { scale: 0.97 }}
            className={cn(
              "flex h-14 w-full items-center justify-center gap-2 rounded-xl font-bold text-white transition-colors disabled:opacity-70",
              "bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-cyan-400 dark:to-cyan-300 dark:text-black",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isSubmitting ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 size={18} className="animate-spin" /> Sending…
                </motion.span>
              ) : sent ? (
                <motion.span
                  key="sent"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 size={18} /> Sent!
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  Send message <Send size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </form>
    </div>
  );
}
