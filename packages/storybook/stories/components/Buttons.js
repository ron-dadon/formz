import { useFormzContext } from '@formz/core'
import { classnames } from '../utils'

export const SubmitButton = () => {
  const {
    form: { submitting },
  } = useFormzContext()

  return (
    <button className="btn btn-primary" type="submit" disabled={submitting}>
      Submit
    </button>
  )
}

export const ResetButton = () => {
  const {
    form: { submitting },
  } = useFormzContext()

  return (
    <button className="btn btn-link" type="reset" disabled={submitting}>
      Reset
    </button>
  )
}

export const SubmitResult = () => {
  const {
    form: { submitting, submitted, submitSuccess, submitError },
  } = useFormzContext()

  return (
    <div
      className={classnames('alert', {
        'alert-info': submitting,
        'alert-danger': !submitting && submitted && submitError,
        'alert-success': !submitting && submitted && submitSuccess,
      })}
    >
      {submitting && 'Submitting...'}
      {submitted && submitSuccess && 'Submitted successfully'}
      {submitted && submitError && `Submit error ${submitError.message}`}
    </div>
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
