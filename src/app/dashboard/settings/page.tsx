"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type FormData = {
  currentPassword: string;
  newEmail: string;
  newPassword: string;
};

export default function SettingsDashboard() {
  const [email, setEmail] = useState<string>("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    fetch("/api/admin/account", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.email && setEmail(j.email))
      .catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    const toastId = toast.loading("Updating…");
    try {
      const res = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newEmail: data.newEmail || undefined,
          newPassword: data.newPassword || undefined,
        }),
      });
      const json = await res.json();
      toast.dismiss(toastId);
      if (!res.ok) throw new Error(json.message || "Update failed");
      toast.success("Account updated");
      if (json.email) setEmail(json.email);
      reset({ currentPassword: "", newEmail: "", newPassword: "" });
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-300">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your admin credentials.{" "}
          {email && (
            <>
              Signed in as <span className="text-zinc-200">{email}</span>.
            </>
          )}
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-3xl border border-cyan-500/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 text-cyan-300">
          <ShieldCheck size={18} />
          <h2 className="text-lg">Change credentials</h2>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm text-zinc-300">
            Current password <span className="text-red-400">*</span>
          </span>
          <input
            type="password"
            className="input"
            placeholder="Required to confirm changes"
            {...register("currentPassword", { required: "Current password is required" })}
          />
          {errors.currentPassword && (
            <span className="mt-1 block text-xs text-red-400">
              {errors.currentPassword.message}
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-zinc-300">New email (optional)</span>
          <input type="email" className="input" placeholder="new@email.com" {...register("newEmail")} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-zinc-300">New password (optional)</span>
          <input
            type="password"
            className="input"
            placeholder="At least 6 characters"
            {...register("newPassword", {
              minLength: { value: 6, message: "At least 6 characters" },
            })}
          />
          {errors.newPassword && (
            <span className="mt-1 block text-xs text-red-400">
              {errors.newPassword.message}
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-8 py-3.5 font-bold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          Update account
        </button>
      </form>
    </div>
  );
}
