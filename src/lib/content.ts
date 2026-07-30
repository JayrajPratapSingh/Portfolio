import dbConnect from "./db";
import Content from "@/models/Content";

/**
 * Read a content section from the DB, falling back to a typed default
 * (`db data || direct data`). Resilient: never throws to the page — if the DB
 * is unreachable it returns the fallback so the site always renders.
 *
 * - Array sections (e.g. projects) are returned as stored.
 * - Object sections are shallow-merged over the fallback so partial edits work.
 */
export async function getContent<T>(section: string, fallback: T): Promise<T> {
  try {
    await dbConnect();
    const doc = await Content.findOne({ section: section.toLowerCase() }).lean<{
      data: unknown;
    } | null>();

    if (!doc || doc.data == null) return fallback;

    if (Array.isArray(fallback) || Array.isArray(doc.data)) {
      return doc.data as T;
    }
    if (typeof doc.data === "object" && typeof fallback === "object") {
      return { ...(fallback as object), ...(doc.data as object) } as T;
    }
    return doc.data as T;
  } catch (err) {
    console.error(`[content] getContent("${section}") failed:`, err);
    return fallback;
  }
}

/** Create/replace a content section (upsert). Used by the admin API + seed. */
export async function setContent<T>(section: string, data: T) {
  await dbConnect();
  const doc = await Content.findOneAndUpdate(
    { section: section.toLowerCase() },
    { data },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean<{ data: T } | null>();
  return doc?.data ?? data;
}
