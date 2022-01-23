import { useFormzContext } from '@formz/core'

export const useFormzDebugger = () => {
  const { values, form, fields } = useFormzContext()

  console.log('%c Formz Debugger', 'color: yellow; font-weight: 700; font-size: large;')
  console.log('%c Values', 'color: orange; font-weight: 700; font-size: medium;')
  console.table(values)
  console.log('%c Form State', 'color: orange; font-weight: 700; font-size: medium;')
  console.table(form)
  console.log('%c Fields State', 'color: orange; font-weight: 700; font-size: medium;')
  Object.entries(fields).forEach(([fieldName, field]) => {
    console.log(
      `%c ${fieldName}`,
      'background: orange; color: black; font-weight: 500; font-size: small; padding: 8px;'
    )
    console.table(field)
  })
}
