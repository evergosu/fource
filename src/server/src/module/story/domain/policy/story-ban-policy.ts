/**
 * ---
 * Domain policy defining when a story must be banned.
 * ---
 * This class contains only business rules and does not depend on
 * infrastructure or application services.
 */
export class StoryBanPolicy {
  /**
   * ---
   * Constructs new `StoryBanPolicy` instance.
   * ---
   * @param threshold - Amount of votes required to ban a story.
   */
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly threshold: number) { }

  /**
   * ---
   * Determines whether a story should be banned.
   * ---
   * @param votes - Current amount of ban votes.
   */
  shouldBan(votes: number): boolean {
    return votes >= this.threshold;
  }
}
