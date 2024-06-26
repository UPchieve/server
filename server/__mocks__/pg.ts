/**
 * Mock the pg to avoid needing to call jest.mock(pg) in every test
 */

const client = {
  async query(): Promise<any> {},
  release(): void {},
}

export class Pool {
  readonly options: any
  constructor(options: unknown) {
    this.options = options
  }
  on(): void {}
  async connect(): Promise<typeof client> {
    return client
  }
  async end(): Promise<void> {}
}
