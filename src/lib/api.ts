export type ApiError = {
  message: string
  code?: string
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError }

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data }
}

export function err(message: string, code?: string): ApiResult<never> {
  return { ok: false, error: { message, code } }
}

export function isOk<T>(res: ApiResult<T>): res is { ok: true; data: T } {
  return res.ok === true
}

export function isErr<T>(res: ApiResult<T>): res is { ok: false; error: ApiError } {
  return res.ok === false
}

