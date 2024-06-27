import roundToNearestInterval from '../../utils/round-up-to-nearest-interval'

test('Should round up to the nearest interval', () => {
  expect(roundToNearestInterval(1, 3)).toEqual(3)
  expect(roundToNearestInterval(15, 3)).toEqual(15)
  expect(roundToNearestInterval(5, 5)).toEqual(5)
  expect(roundToNearestInterval(728, 15)).toEqual(735)
  expect(roundToNearestInterval(150, 100)).toEqual(200)
})
