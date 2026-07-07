import { Response } from 'express'

export function resSuccess<T extends Record<string, unknown>>(
  res: Response,
  data: T,
  status?: number
) {
  if (res.writableEnded) {
    return
  }

  res.status(status ?? 200).json(data)
}
