import { runInTransaction, TransactionClient } from '../../db'

export default async (): Promise<void> => {
  await runInTransaction(async (tc: TransactionClient) => {})
}
