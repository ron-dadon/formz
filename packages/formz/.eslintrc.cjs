module.exports = {
  extends: [
    'eslint:recommended',
    'react-app',
    'react-app/jest',
    'prettier',
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
}
