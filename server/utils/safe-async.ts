export interface AsyncResult<T> {
  result?: T
  error?: Error
}

export const safeAsync = async function<T>(
  p: Promise<T>
): Promise<AsyncResult<T>> {
  try {
    const result = await p
    return { result } as AsyncResult<T>
  } catch (error) {
    return { error } as AsyncResult<T>
  }
}
