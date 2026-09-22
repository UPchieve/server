import { filterAsync } from '../../utils/filter-async'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('filterAsync', () => {
  it('returns elements whose filter function resolves to true', async () => {
    const collection = [1, 2, 3, 4]

    const result = await filterAsync(collection, async (n) => n % 2 === 0)

    expect(result).toEqual({ filtered: [2, 4], rejected: [] })
  })

  it('returns an empty array when no elements match', async () => {
    const collection = [1, 2, 3]

    const result = await filterAsync(collection, async () => false)

    expect(result).toEqual({ filtered: [], rejected: [] })
  })

  it('returns all elements when every element matches', async () => {
    const collection = [1, 2, 3]

    const result = await filterAsync(collection, async () => true)

    expect(result).toEqual({
      filtered: collection,
      rejected: [],
    })
  })

  it('handles an empty collection', async () => {
    const filterFunction = jest.fn(async () => true)

    const result = await filterAsync([], filterFunction)

    expect(result).toEqual({
      filtered: [],
      rejected: [],
    })
    expect(filterFunction).not.toHaveBeenCalled()
  })

  it('passes each element to the filter function', async () => {
    const collection = ['a', 'b', 'c']
    const filterFunction = jest.fn(async () => true)

    await filterAsync(collection, filterFunction)

    expect(filterFunction).toHaveBeenCalledTimes(3)
    expect(filterFunction).toHaveBeenNthCalledWith(1, 'a')
    expect(filterFunction).toHaveBeenNthCalledWith(2, 'b')
    expect(filterFunction).toHaveBeenNthCalledWith(3, 'c')
  })

  it('waits for asynchronous filter results', async () => {
    const collection = [1, 2, 3]

    const filterFunction = async (n: number) => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      return n > 1
    }

    await expect(filterAsync(collection, filterFunction)).resolves.toEqual({
      filtered: [2, 3],
      rejected: [],
    })
  })

  it('Returns the rejected promises', async () => {
    const collection = ['a', 'b', 'c']
    const testError = new Error('This is a test')
    const filterFunction = jest.fn()
    filterFunction.mockResolvedValueOnce(true)
    filterFunction.mockResolvedValueOnce(true)
    filterFunction.mockRejectedValueOnce(testError)

    const result = await filterAsync(collection, filterFunction)
    expect(result).toEqual({
      filtered: ['a', 'b'],
      rejected: [['c', testError]],
    })
  })
})
