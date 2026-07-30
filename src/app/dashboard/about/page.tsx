"use client";

import { useForm } from "react-hook-form";

export default function AboutPage() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto">

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-cyan-300">
          About Information
        </h1>

        <p className="text-zinc-400 mt-2">
          Manage your portfolio profile
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >

        {/* Basic Info */}

        <section className="bg-white/5 border border-cyan-500/10 backdrop-blur-xl rounded-3xl p-8">
          <h2 className="text-xl text-cyan-300 mb-6">
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <input
              {...register("name")}
              placeholder="Full Name"
              className="input"
            />

            <input
              {...register("designation")}
              placeholder="Designation"
              className="input"
            />

            <input
              {...register("location")}
              placeholder="Location"
              className="input"
            />

            <input
              {...register("email")}
              placeholder="Email"
              className="input"
            />

          </div>
        </section>

        {/* Hero Section */}

        <section className="bg-white/5 border border-cyan-500/10 backdrop-blur-xl rounded-3xl p-8">

          <h2 className="text-xl text-cyan-300 mb-6">
            Hero Section
          </h2>

          <div className="space-y-4">

            <input
              {...register("heroHeading")}
              placeholder="Hero Heading"
              className="input"
            />

            <input
              {...register("heroSubHeading")}
              placeholder="Hero Sub Heading"
              className="input"
            />

            <textarea
              {...register("heroDescription")}
              placeholder="Hero Description"
              rows={4}
              className="textarea"
            />

          </div>
        </section>

        {/* About */}

        <section className="bg-white/5 border border-cyan-500/10 backdrop-blur-xl rounded-3xl p-8">

          <h2 className="text-xl text-cyan-300 mb-6">
            About Me
          </h2>

          <textarea
            {...register("shortBio")}
            rows={3}
            placeholder="Short Bio"
            className="textarea"
          />

          <textarea
            {...register("longBio")}
            rows={8}
            placeholder="Long Bio"
            className="textarea mt-4"
          />

        </section>

        {/* Stats */}

        <section className="bg-white/5 border border-cyan-500/10 backdrop-blur-xl rounded-3xl p-8">

          <h2 className="text-xl text-cyan-300 mb-6">
            Statistics
          </h2>

          <div className="grid md:grid-cols-4 gap-5">

            <input
              type="number"
              {...register("projects")}
              placeholder="Projects"
              className="input"
            />

            <input
              type="number"
              {...register("experience")}
              placeholder="Experience Years"
              className="input"
            />

            <input
              type="number"
              {...register("clients")}
              placeholder="Clients"
              className="input"
            />

            <input
              type="number"
              {...register("technologies")}
              placeholder="Technologies"
              className="input"
            />

          </div>

        </section>

        {/* Social */}

        <section className="bg-white/5 border border-cyan-500/10 backdrop-blur-xl rounded-3xl p-8">

          <h2 className="text-xl text-cyan-300 mb-6">
            Social Links
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <input
              {...register("github")}
              placeholder="Github URL"
              className="input"
            />

            <input
              {...register("linkedin")}
              placeholder="LinkedIn URL"
              className="input"
            />

            <input
              {...register("instagram")}
              placeholder="Instagram URL"
              className="input"
            />

            <input
              {...register("leetcode")}
              placeholder="Leetcode URL"
              className="input"
            />

          </div>

        </section>

        <button
          type="submit"
          className="
            px-10
            py-4
            rounded-xl
            bg-cyan-400
            text-black
            font-bold
            hover:bg-cyan-300
          "
        >
          Save Changes
        </button>

      </form>
    </div>
  );
}