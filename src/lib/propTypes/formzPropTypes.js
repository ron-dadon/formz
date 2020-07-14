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
  validateOnPropsChange: PropTypes.bool,
  validateOnBlur: PropTypes.bool,
  validateOnInit: PropTypes.bool,
  validateOnSubmit: PropTypes.bool,
  formNative: PropTypes.bool,
  formNoValidate: PropTypes.bool,
  formAction: PropTypes.string,
  formMethod: PropTypes.oneOf(['get', 'post', 'GET', 'POST']),
  formEnctype: PropTypes.oneOf(['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain']),
  formTarget: PropTypes.oneOfType([PropTypes.oneOf(['_self', '_blank', '_parent', '_top']), PropTypes.string])
}

export default formzPropTypes
