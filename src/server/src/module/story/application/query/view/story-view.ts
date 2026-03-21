/**
 * ---
 * Read model representing a story projection.
 * ---
 * Read models are optimized for query performance
 * and may differ from domain aggregates.
 */
export interface StoryView {
  bodyPreview: string;
  authorId: string;
  title: string;
  body: string;
  id: string;
}
