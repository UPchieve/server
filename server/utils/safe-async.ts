// TODO: use generics to type AsyncResult
export interface AsyncResult {
  result?: any
  error?: Error
}

export const safeAsync = async function(p: Promise<any>): Promise<AsyncResult> {
  try {
    const result = await p
    return { result } as AsyncResult
  } catch (error) {
    return { error } as AsyncResult
  }
}
