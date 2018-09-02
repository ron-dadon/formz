import PropTypes from 'prop-types'

const formzRenderPropTypes = {
  Field: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
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
  errors: PropTypes.object,
  values: PropTypes.object,
  submit: PropTypes.func,
  reset: PropTypes.func
}

export default formzRenderPropTypes
