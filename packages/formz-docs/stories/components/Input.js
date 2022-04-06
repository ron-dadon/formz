import { useFormzField } from 'formz'
import { classnames } from '../utils'

export const Input = ({
  name,
  placeholder,
  helperText,
  defaultValue,
  validate,
  validateOnChange,
  validateOnBlue,
  validateAll,
  parse,
  format,
  type = 'text',
  ...props
}) => {
  const {
    inputProps,
    field: { invalid, valid, error },
    form: { submitting },
  } = useFormzField({
    name,
    defaultValue,
    validate,
    validateOnChange,
    validateOnBlue,
    validateAll,
    parse,
    format,
  })

  return (
    <div className="form-group">
      <input
        {...inputProps}
        {...props}
        onChange={(e) => {
          console.log('onChange', e)
          inputProps.onChange(e)
          // document.querySelector('input').focus()
        }}
        onBlur={(e) => {
          console.log('onBlur', e)
          inputProps.onBlur(e)
        }}
        type={type}
        placeholder={placeholder}
        disabled={submitting}
        className={classnames('form-control', { 'is-invalid': invalid })}
      />
      {helperText && valid && <div className="form-helper">{helperText}</div>}
      {invalid && <div className="invalid-feedback">{error}</div>}
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
        className={classnames('form-control', { 'is-invalid': invalid })}
      >
        {Object.entries(options).map(([option, label]) => (
          <option key={option} value={option}>
            {label}
          </option>
        ))}
      </select>
      {invalid && <div className="invalid-feedback">{error}</div>}
    </div>
  )
}
