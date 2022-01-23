import { useFormzDebugger } from '@formz/utils'

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const FormzDebug = () => {
  useFormzDebugger()
  return null
}
