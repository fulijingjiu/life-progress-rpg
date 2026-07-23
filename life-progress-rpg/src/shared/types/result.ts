export type DomainResult<T, E extends string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function isResultOk<T, E extends string>(result: DomainResult<T, E>): result is { ok: true; value: T } {
  return result.ok;
}
