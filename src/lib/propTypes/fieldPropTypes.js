import PropTypes from 'prop-types'

const renderForwardRefShape = PropTypes.shape({
  '$$typeof': PropTypes.any,
  displayName: PropTypes.string,
  propTypes: PropTypes.any,
  render: PropTypes.func
})

const fieldPropTypes = {
  render: PropTypes.oneOfType([PropTypes.element, PropTypes.func, renderForwardRefShape]).isRequired,
  name: PropTypes.string.isRequired,
  defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string, PropTypes.number, PropTypes.bool]),
  validators: PropTypes.object,
  parsers: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  formatters: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  validateOnChange: PropTypes.bool,
  validateOnBlur: PropTypes.bool,
  validateOnInit: PropTypes.bool,
  reInitialize: PropTypes.bool,
  reValidateOnFormChanges: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  keepDirty: PropTypes.bool,
  required: PropTypes.bool,
  synthetic: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  onValueChange: PropTypes.func,
  debounce: PropTypes.oneOfType([PropTypes.bool, PropTypes.number])
}

export default fieldPropTypes
