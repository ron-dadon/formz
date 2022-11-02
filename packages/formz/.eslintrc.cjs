module.exports = {
  extends: [
    'eslint:recommended',
    'react-app',
    'react-app/jest',
    'prettier',
    'plugin:import/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
}
