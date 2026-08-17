"use client";

import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";

import type {
  CaseStudy,
  CaseStudyBlock,
  CaseStudyDecision,
  CaseStudyMetric,
} from "@/data/projects";
import { cn } from "@/lib/cn";
import { AddButton, Field, RepeaterItem, StringListEditor } from "./FormKit";
import ImageUpload from "./ImageUpload";

/**
 * Editor for the long-form `/projects/[slug]` write-up.
 *
 * Every section of the public page is optional and hidden when empty, so this
 * form never forces a field to be filled — a case study can be built up over
 * several sittings and still renders cleanly at each step.
 */

const blankCaseStudy = (): CaseStudy => ({
  tagline: "",
  role: "",
  team: "",
  timeline: "",
  problem: "",
  constraints: [],
  architecture: { heading: "How it is put together", body: "", bullets: [] },
  decisions: [],
  metrics: [],
  challenges: [],
  sections: [],
  learnings: [],
});

const blankDecision = (): CaseStudyDecision => ({
  title: "",
  choice: "",
  why: "",
  tradeoff: "",
});

const blankMetric = (): CaseStudyMetric => ({ label: "", value: "", hint: "" });

/** Swap two entries — used by the custom-section reorder buttons. */
function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

const blankBlock = (): CaseStudyBlock => ({
  heading: "",
  body: "",
  bullets: [],
});

/**
 * Heading + prose + bullets + image. Shared by architecture, challenges and
 * custom sections so every block on the page gets the same capabilities.
 */
function BlockFields({
  block,
  onChange,
  folder,
  headingLabel = "Heading",
  headingHint,
  bodyLabel = "Text",
  bodyHint = "Leave a blank line between paragraphs.",
  showHeading = true,
}: {
  block: CaseStudyBlock;
  onChange: (patch: Partial<CaseStudyBlock>) => void;
  folder: string;
  headingLabel?: string;
  headingHint?: string;
  bodyLabel?: string;
  bodyHint?: string;
  showHeading?: boolean;
}) {
  return (
    <>
      {showHeading && (
        <Field label={headingLabel} hint={headingHint}>
          <input
            className="input"
            value={block.heading}
            onChange={(e) => onChange({ heading: e.target.value })}
          />
        </Field>
      )}

      <div className={cn(showHeading && "mt-4")}>
        <Field label={bodyLabel} hint={bodyHint}>
          <textarea
            rows={6}
            className="textarea"
            value={block.body}
            onChange={(e) => onChange({ body: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Bullets" hint="Optional supporting points.">
          <div className="mt-2">
            <StringListEditor
              values={block.bullets ?? []}
              onChange={(bullets) => onChange({ bullets })}
              addLabel="Add bullet"
            />
          </div>
        </Field>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ImageUpload
          label="Image (optional)"
          folder={folder}
          value={block.image}
          onChange={(url, publicId) =>
            onChange({
              image: url || undefined,
              imagePublicId: publicId || undefined,
            })
          }
        />
        <Field label="Image caption" hint="Shown under the image.">
          <input
            className="input"
            value={block.imageCaption ?? ""}
            onChange={(e) => onChange({ imageCaption: e.target.value })}
          />
        </Field>
      </div>
    </>
  );
}

export default function CaseStudyEditor({
  value,
  onChange,
}: {
  value?: CaseStudy | null;
  onChange: (next: CaseStudy | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const cs = value ?? null;

  const patch = (p: Partial<CaseStudy>) =>
    onChange({ ...blankCaseStudy(), ...(cs ?? {}), ...p });

  const patchArchitecture = (p: Partial<CaseStudyBlock>) =>
    patch({
      architecture: {
        heading: "How it is put together",
        body: "",
        ...(cs?.architecture ?? {}),
        ...p,
      },
    });

  /** Replace one item in a repeatable list. */
  const patchAt = <T,>(list: T[], i: number, p: Partial<T>): T[] =>
    list.map((item, idx) => (idx === i ? { ...item, ...p } : item));

  if (!cs) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <BookOpen size={15} className="text-cyan-300" /> Case study
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              No write-up yet — this project shows as a card only, with no
              &ldquo;Read case study&rdquo; link.
            </p>
          </div>
          <AddButton
            label="Add case study"
            onClick={() => {
              onChange(blankCaseStudy());
              setOpen(true);
            }}
          />
        </div>
      </div>
    );
  }

  const decisions = cs.decisions ?? [];
  const metrics = cs.metrics ?? [];
  const challenges = cs.challenges ?? [];
  const sections = cs.sections ?? [];

  return (
    <div className="mt-4 rounded-2xl border border-cyan-500/15 bg-cyan-400/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-2 text-sm text-cyan-300"
        >
          <ChevronDown
            size={16}
            className={cn("transition-transform", open && "rotate-180")}
          />
          <BookOpen size={15} /> Case study
          {!cs.problem && (
            <span className="rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">
              needs a problem statement to publish
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirm("Remove this case study? The page will 404 after save."))
              onChange(null);
          }}
          className="btn-3d inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
        >
          Remove case study
        </button>
      </div>

      {open && (
        <div className="mt-5 space-y-5">
          <Field
            label="Tagline"
            hint="One line under the title. Falls back to the project description."
          >
            <textarea
              rows={2}
              className="textarea"
              value={cs.tagline ?? ""}
              onChange={(e) => patch({ tagline: e.target.value })}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Role">
              <input
                className="input"
                placeholder="Full-stack engineer"
                value={cs.role ?? ""}
                onChange={(e) => patch({ role: e.target.value })}
              />
            </Field>
            <Field label="Team">
              <input
                className="input"
                placeholder="4 engineers, 1 designer"
                value={cs.team ?? ""}
                onChange={(e) => patch({ team: e.target.value })}
              />
            </Field>
            <Field label="Timeline">
              <input
                className="input"
                placeholder="6 months"
                value={cs.timeline ?? ""}
                onChange={(e) => patch({ timeline: e.target.value })}
              />
            </Field>
          </div>

          <Field
            label="The problem"
            hint="What was broken, slow or missing before the work. Required — without it the case study stays unpublished."
          >
            <textarea
              rows={5}
              className="textarea"
              value={cs.problem}
              onChange={(e) => patch({ problem: e.target.value })}
            />
          </Field>

          <Field label="Constraints" hint="Hard limits the design had to respect.">
            <div className="mt-2">
              <StringListEditor
                values={cs.constraints ?? []}
                onChange={(constraints) => patch({ constraints })}
                placeholder="e.g. Provider APIs with different failure behaviour"
                addLabel="Add constraint"
              />
            </div>
          </Field>

          {/* ARCHITECTURE */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Architecture
            </div>
            <BlockFields
              block={{
                heading: "",
                body: "",
                ...(cs.architecture ?? {}),
              }}
              onChange={patchArchitecture}
              folder="case-studies"
              bodyLabel="How the system is put together"
              headingHint="Shown as the section title on the page."
            />
          </div>

          {/* DECISIONS */}
          <ListSection
            title={`Decisions & trade-offs (${decisions.length})`}
            hint="The calls you would defend in an interview. This is the section a senior reviewer reads first."
            addLabel="Add decision"
            onAdd={() => patch({ decisions: [...decisions, blankDecision()] })}
          >
            {decisions.map((d, i) => (
              <RepeaterItem
                key={i}
                index={i}
                onRemove={() =>
                  patch({ decisions: decisions.filter((_, idx) => idx !== i) })
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Label" hint="Short kicker, e.g. “Content layer”">
                    <input
                      className="input"
                      value={d.title}
                      onChange={(e) =>
                        patch({ decisions: patchAt(decisions, i, { title: e.target.value }) })
                      }
                    />
                  </Field>
                  <Field label="The choice">
                    <input
                      className="input"
                      value={d.choice}
                      onChange={(e) =>
                        patch({ decisions: patchAt(decisions, i, { choice: e.target.value }) })
                      }
                    />
                  </Field>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Why">
                    <textarea
                      rows={4}
                      className="textarea"
                      value={d.why}
                      onChange={(e) =>
                        patch({ decisions: patchAt(decisions, i, { why: e.target.value }) })
                      }
                    />
                  </Field>
                  <Field label="Trade-off" hint="What this cost you. Do not leave it blank.">
                    <textarea
                      rows={4}
                      className="textarea"
                      value={d.tradeoff}
                      onChange={(e) =>
                        patch({ decisions: patchAt(decisions, i, { tradeoff: e.target.value }) })
                      }
                    />
                  </Field>
                </div>
              </RepeaterItem>
            ))}
          </ListSection>

          {/* METRICS */}
          <ListSection
            title={`Metrics (${metrics.length})`}
            hint="Only real measured numbers. An empty list hides the band entirely — better than an invented figure."
            addLabel="Add metric"
            onAdd={() => patch({ metrics: [...metrics, blankMetric()] })}
          >
            {metrics.map((m, i) => (
              <RepeaterItem
                key={i}
                index={i}
                onRemove={() =>
                  patch({ metrics: metrics.filter((_, idx) => idx !== i) })
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Value" hint="e.g. 1.4s, 40%, 12k">
                    <input
                      className="input"
                      value={m.value}
                      onChange={(e) =>
                        patch({ metrics: patchAt(metrics, i, { value: e.target.value }) })
                      }
                    />
                  </Field>
                  <Field label="Label" hint="e.g. Mobile LCP">
                    <input
                      className="input"
                      value={m.label}
                      onChange={(e) =>
                        patch({ metrics: patchAt(metrics, i, { label: e.target.value }) })
                      }
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Note" hint="Optional — how it was measured.">
                    <input
                      className="input"
                      value={m.hint ?? ""}
                      onChange={(e) =>
                        patch({ metrics: patchAt(metrics, i, { hint: e.target.value }) })
                      }
                    />
                  </Field>
                </div>
              </RepeaterItem>
            ))}
          </ListSection>

          {/* CHALLENGES */}
          <ListSection
            title={`What went wrong (${challenges.length})`}
            hint="Problems hit during the build, and the fix."
            addLabel="Add challenge"
            onAdd={() => patch({ challenges: [...challenges, blankBlock()] })}
          >
            {challenges.map((c, i) => (
              <RepeaterItem
                key={i}
                index={i}
                onRemove={() =>
                  patch({ challenges: challenges.filter((_, idx) => idx !== i) })
                }
              >
                <BlockFields
                  block={c}
                  onChange={(p) => patch({ challenges: patchAt(challenges, i, p) })}
                  folder="case-studies"
                  bodyLabel="What happened, and the fix"
                />
              </RepeaterItem>
            ))}
          </ListSection>

          {/* CUSTOM SECTIONS */}
          <ListSection
            title={`Custom sections (${sections.length})`}
            hint="Any extra heading, text, bullets and image you want. These render after the built-in sections, in this order."
            addLabel="Add section"
            onAdd={() => patch({ sections: [...sections, blankBlock()] })}
          >
            {sections.map((s, i) => (
              <RepeaterItem
                key={i}
                index={i}
                onRemove={() =>
                  patch({ sections: sections.filter((_, idx) => idx !== i) })
                }
              >
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => patch({ sections: move(sections, i, i - 1) })}
                    className="btn-3d rounded-lg border border-white/10 px-2.5 py-1 text-zinc-300 hover:bg-white/5 disabled:opacity-30"
                  >
                    ↑ Move up
                  </button>
                  <button
                    type="button"
                    disabled={i === sections.length - 1}
                    onClick={() => patch({ sections: move(sections, i, i + 1) })}
                    className="btn-3d rounded-lg border border-white/10 px-2.5 py-1 text-zinc-300 hover:bg-white/5 disabled:opacity-30"
                  >
                    ↓ Move down
                  </button>
                </div>
                <BlockFields
                  block={s}
                  onChange={(p) => patch({ sections: patchAt(sections, i, p) })}
                  folder="case-studies"
                  headingHint="Becomes the section title on the page."
                />
              </RepeaterItem>
            ))}
          </ListSection>

          <Field
            label="What I'd do differently"
            hint="Optional. Reads as maturity, not weakness."
          >
            <div className="mt-2">
              <StringListEditor
                values={cs.learnings ?? []}
                onChange={(learnings) => patch({ learnings })}
                addLabel="Add learning"
              />
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

function ListSection({
  title,
  hint,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  hint?: string;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {title}
          </div>
          {hint && <p className="mt-1.5 max-w-lg text-xs text-zinc-500">{hint}</p>}
        </div>
        <AddButton label={addLabel} onClick={onAdd} />
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
