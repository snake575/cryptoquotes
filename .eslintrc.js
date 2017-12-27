module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
  },
  extends: ['airbnb-base', 'plugin:vue/recommended'],
  rules: {
    // don't require extension when importing
    'import/extensions': 0,
    // allow unresolved imports paths
    'import/no-unresolved': 0,
    // allow import dependencies not listed in packages.json
    'import/no-extraneous-dependencies': 0,
    // don't require line ending style
    'linebreak-style': 0,
    // don't require semicolons
    semi: ['error', 'never'],
  },
}
