import { useFormzField } from '@formz/core'

export const Input = ({
  name,
  placeholder,
  defaultValue,
  validate,
  validateOnChange,
  validateOnBlue,
  validateOnInit,
  parse,
  format,
  type = 'text',
  ...props
}) => {
  const {
    inputProps,
    field: { invalid, error },
    form: { submitting },
  } = useFormzField({
    name,
    defaultValue,
    validate,
    validateOnChange,
    validateOnBlue,
    validateOnInit,
    parse,
    format,
  })

  return (
    <div className="form-group">
      <input
        {...inputProps}
        {...props}
        type={type}
        placeholder={placeholder}
        disabled={submitting}
        className="form-control"
      />
      {invalid && <div className="form-text">{error}</div>}
    </div>
  )
}

export const Select = ({
  name,
  placeholder,
  defaultValue,
  validate,
  validateOnChange,
  validateOnBlue,
  validateOnInit,
  parse,
  format,
  options = {},
  ...props
}) => {
  const {
    inputProps,
    field: { invalid, error },
    form: { submitting },
  } = useFormzField({
    name,
    defaultValue,
    validate,
    validateOnChange,
    validateOnBlue,
    validateOnInit,
    parse,
    format,
  })

  return (
    <div className="form-group">
      <select
        {...inputProps}
        {...props}
        placeholder={placeholder}
        disabled={submitting}
        className="form-control"
      >
        {Object.entries(options).map(([option, label]) => (
          <option key={option} value={option}>
            {label}
          </option>
        ))}
      </select>
      {invalid && <div className="form-text">{error}</div>}
    </div>
  )
}
