import { useFormzContext } from '@formz/core'

export const SubmitButton = () => {
  const {
    submit,
    form: { submitting },
  } = useFormzContext()

  return (
    <button className="btn btn-primary" onClick={submit} disabled={submitting}>
      Submit
    </button>
  )
}

export const ResetButton = () => {
  const {
    reset,
    form: { submitting },
  } = useFormzContext()

  return (
    <button className="btn btn-link" onClick={reset} disabled={submitting}>
      Reset
    </button>
  )
}

export const FormButtons = () => (
  <div className="d-flex justify-content-end">
    <ResetButton />
    <div className="ml-1">
      <SubmitButton />
    </div>
  </div>
)
