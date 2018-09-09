import PropTypes from 'prop-types'

const formzPropTypes = {
  render: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func,
  onSubmitError: PropTypes.func,
  onValidation: PropTypes.func,
  onReset: PropTypes.func,
  onValuesChange: PropTypes.func,
  autoReset: PropTypes.bool,
  validateOnChange: PropTypes.bool,
  validateOnBlur: PropTypes.bool,
  validateOnInit: PropTypes.bool,
  validateOnSubmit: PropTypes.bool,
  html5Validation: PropTypes.bool
}

export default formzPropTypes
