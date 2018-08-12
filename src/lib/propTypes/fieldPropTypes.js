import PropTypes from 'prop-types'

const fieldPropTypes = {
  render: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
  name: PropTypes.string.isRequired,
  defaultValue: PropTypes.any,
  validators: PropTypes.object,
  asyncValidators: PropTypes.object,
  parsers: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  formatters: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  validateOnChange: PropTypes.bool,
  validateOnBlur: PropTypes.bool,
  validateOnInit: PropTypes.bool,
  reInitialize: PropTypes.bool,
  keepDirty: PropTypes.bool
}

export default fieldPropTypes
