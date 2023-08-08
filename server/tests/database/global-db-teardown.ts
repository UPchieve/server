const THIRTY_SECONDS_IN_MS = 30 * 1000

export default async function teardown() {
  // @ts-ignore
  await global.__TEST_DB_CONTAINER__.stop({
    timeout: THIRTY_SECONDS_IN_MS,
  })
}
