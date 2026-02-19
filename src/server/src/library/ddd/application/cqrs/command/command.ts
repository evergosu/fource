/**
 * ---
 * Marker interface for a Command.
 * ---
 * A Command represents an intention to mutate system state.
 * It contains only data and no execution logic.
 * ---
 * @template _Output - Successful output type
 * @template _Failure - Failure type
 */
export type Command<_Output, _Failure> = object;
