import { useFormzDebugger } from '@formz/utils'

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const FormzDebug = () => {
  useFormzDebugger()
  return null
}

export const classnames = (...args) =>
  args
    .reduce((classes, item) => {
      if (!item) return classes
      if (typeof item === 'string') return [...classes, item]
      if (typeof item === 'function') return [...classes, item()]
      if (typeof item === 'object')
        return [
          ...classes,
          ...Object.entries(item)
            .map(([key, use]) => (use ? key : ''))
            .filter(Boolean),
        ]
      return classes
    }, [])
    .join(' ')
