"use client";

import { useForm } from "react-hook-form";
import { Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const { register, handleSubmit } = useForm<FormData>();

 const submit = async (data: FormData) => {
  const toastId = toast.loading("Sending...");

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    toast.dismiss(toastId);

    if (!res.ok) {
      throw new Error(result.message);
    }

    toast.success("Message sent 🚀");

  } catch {
    toast.dismiss(toastId);

    toast.error("Something went wrong");
  }
};

  return (
    <div className="relative">

      {/* Robot */}

      <motion.div
        animate={{
          y:[0,-15,0],
          rotate:[0,4,-4,0]
        }}
        transition={{
          repeat:Infinity,
          duration:4
        }}
        className="absolute -top-16 right-8 z-20"
      >

        <div className="relative">

          <div className="text-7xl">
            🤖
          </div>

          <motion.div
            animate={{
              opacity:[0.6,1,.6]
            }}
            transition={{
              repeat:Infinity,
              duration:2
            }}
            className="
            absolute
            -left-40
            top-4
            px-4
            py-2
            rounded-full
            bg-cyan-500/20
            backdrop-blur-md
            text-sm
            border border-cyan-500/20
            "
          >
            Let's build something 🚀
          </motion.div>

        </div>

      </motion.div>


      <motion.form
        onSubmit={handleSubmit(submit)}
        initial={{
          opacity:0,
          x:50
        }}
        animate={{
          opacity:1,
          x:0
        }}
        transition={{
          duration:1
        }}
        className="
        relative
        overflow-hidden
        rounded-[32px]
        p-8
        border border-white/10
        bg-white/[0.04]
        backdrop-blur-xl
        shadow-[0_0_70px_rgba(0,255,255,.12)]
        "
      >

        {/* animated glow */}

        <motion.div
          animate={{
            x:["-100%","100%"]
          }}
          transition={{
            repeat:Infinity,
            duration:6
          }}
          className="
          absolute
          inset-0
          bg-gradient-to-r
          from-transparent
          via-cyan-500/10
          to-transparent
          skew-x-12
          "
        />

        <div className="relative z-10 space-y-6">

          <div>

            <h2 className="text-4xl font-bold">
              Contact Mission
            </h2>

            <p className="text-zinc-400">
              Drop your idea. Robot will deliver it.
            </p>

          </div>

          <input
            {...register("name")}
            placeholder="Your Name"
            className="
            w-full
            h-14
            px-4
            rounded-xl
            bg-black/40
            border border-white/10
            focus:border-cyan-400
            outline-none
            "
          />

          <input
            {...register("email")}
            placeholder="Email"
            className="
            w-full
            h-14
            px-4
            rounded-xl
            bg-black/40
            border border-white/10
            focus:border-cyan-400
            outline-none
            "
          />

          <textarea
            rows={6}
            {...register("message")}
            placeholder="Tell me your crazy idea..."
            className="
            w-full
            p-4
            rounded-xl
            bg-black/40
            border border-white/10
            focus:border-cyan-400
            outline-none
            "
          />

          <motion.button
            whileHover={{
              scale:1.03
            }}
            whileTap={{
              scale:.96
            }}
            className="
            h-14
            w-full
            rounded-xl
            bg-cyan-500
            font-bold
            flex
            items-center
            justify-center
            gap-2
            "
          >
            Launch Project
            <Sparkles size={18}/>
            <Send size={18}/>
          </motion.button>

        </div>

      </motion.form>

    </div>
  );
}