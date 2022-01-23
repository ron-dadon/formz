import { renderHook } from '@testing-library/react-hooks'
import { useFormz } from '../src/useFormz.js'

test('should create Form component and return it', () => {
  const { result } = renderHook(() => useFormz())

  expect(typeof result.current.Form === 'function').toBeTruthy()
})
