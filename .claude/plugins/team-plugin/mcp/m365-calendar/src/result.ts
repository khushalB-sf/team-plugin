/** Result pattern for expected failures — no throwing for domain errors. */
export type Result<T> = { data: T; error: null } | { data: null; error: Error }

export function ok<T>(data: T): Result<T> {
  return { data, error: null }
}

export function err<T = never>(error: Error): Result<T> {
  return { data: null, error }
}
