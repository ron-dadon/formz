import PropTypes from 'prop-types'

const fieldRenderPropTypes = {
  name: PropTypes.string,
  active: PropTypes.bool,
  untouched: PropTypes.bool,
  touched: PropTypes.bool,
  pristine: PropTypes.bool,
  dirty: PropTypes.bool,
  valid: PropTypes.bool,
  invalid: PropTypes.bool,
  pending: PropTypes.bool,
  submitting: PropTypes.bool,
  submitted: PropTypes.bool,
  submitSuccess: PropTypes.bool,
  value: PropTypes.any,
  rawValue: PropTypes.any,
  errors: PropTypes.object,
  fromValues: PropTypes.object,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  reset: PropTypes.func,
  updateFieldValue: PropTypes.func
}

export default fieldRenderPropTypes
