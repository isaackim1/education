// Phase 12D-B — pure helper that turns parsed import sources into reviewable
// segments. No I/O, no React. Kept deliberately small.
//
// Caps mirror app/api/sort-material (30 segments, ~1000 chars each) so the
// segments we display are the same ones the sorting API will see.

export const MAX_SEGMENTS = 30;
export const MAX_SEGMENT_CHARS = 1000;
const MIN_SEGMENT_CHARS = 40;

export interface ImportSource {
  /** Human-readable origin, e.g. a file name or "Pasted text". */
  label: string;
  text: string;
}

export interface MaterialSegment {
  id: string;
  index: number;
  text: string;
  source: string;
}

// Split one source's text into paragraph-ish chunks, merging very short
// fragments into the previous chunk so we don't produce noise segments.
function splitSourceIntoChunks(text: string): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  const chunks: string[] = [];
  for (const paragraph of paragraphs) {
    const previous = chunks[chunks.length - 1];
    if (previous !== undefined && previous.length < MIN_SEGMENT_CHARS) {
      chunks[chunks.length - 1] = `${previous}\n\n${paragraph}`;
    } else {
      chunks.push(paragraph);
    }
  }
  return chunks;
}

/**
 * Convert import sources into at most `maxSegments` segments.
 * - Preserves file/source boundaries (chunks never span two sources).
 * - Prefers paragraph splits; merges tiny fragments.
 * - Truncates each segment to `maxSegmentChars`.
 * - When over the cap, overflow is merged into the final kept segment so no
 *   material is silently dropped.
 */
export function segmentSources(
  sources: ImportSource[],
  maxSegments = MAX_SEGMENTS,
  maxSegmentChars = MAX_SEGMENT_CHARS
): MaterialSegment[] {
  const raw: { text: string; source: string }[] = [];

  for (const source of sources) {
    if (typeof source.text !== "string") continue;
    const label = source.label.trim() || "Material";
    for (const chunk of splitSourceIntoChunks(source.text)) {
      raw.push({ text: chunk, source: label });
    }
  }

  let capped = raw;
  if (raw.length > maxSegments) {
    const head = raw.slice(0, maxSegments - 1);
    const overflow = raw.slice(maxSegments - 1);
    const mergedTail = {
      text: overflow.map((item) => item.text).join("\n\n"),
      source: overflow[0].source,
    };
    capped = [...head, mergedTail];
  }

  return capped.map((item, index) => ({
    id: `seg-${index}`,
    index,
    text: item.text.slice(0, maxSegmentChars),
    source: item.source,
  }));
}
