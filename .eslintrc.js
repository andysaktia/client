const base = require('@polkadot/dev-react/config/eslint');

module.exports = {
  ...base,
  rules: {
    ...base.rules,
    // add override for any (a metric ton of them, initial conversion)
    '@typescript-eslint/no-explicit-any': 'off'
  }
};