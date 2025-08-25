module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['jsx-a11y'],
  rules: {
    // Allow aria-expanded to be string or boolean for React compatibility
    'jsx-a11y/aria-proptypes': [
      'error',
      {
        ignoreNonDOM: true,
      },
    ],
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/aria-role': 'warn',
    'jsx-a11y/aria-allowed-attr': 'warn',
    // You can further customize or relax rules here
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
