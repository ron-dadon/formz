import PropTypes from 'prop-types'
import React from 'react'

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
  formValues: PropTypes.object,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  reset: PropTypes.func,
  updateFieldValue: PropTypes.func,
  formValid: PropTypes.bool,
  formInvalid: PropTypes.bool,
  formPristine: PropTypes.bool,
  formDirty: PropTypes.bool,
  formTouched: PropTypes.bool,
  formUntouched: PropTypes.bool,
  formPending: PropTypes.bool,
  formErrors: PropTypes.object
}

export default fieldRenderPropTypes
