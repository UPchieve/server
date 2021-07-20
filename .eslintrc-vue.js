module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    "plugin:vue/essential",
    "@vue/prettier",
  ],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn"
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser', // Specifies the ESLint parser
      extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
        'plugin:import/errors',
        'plugin:import/typescript'
      ],
      rules: {
        'prettier/prettier': [
          'error',
          {
            semi: false,
            singleQuote: true
          }
        ],
        semi: 'off',
        '@typescript-eslint/semi': ['error', 'never'],
        quotes: ['error', 'single'],
        'import/order': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-types': 'off',
        'no-use-before-define': 'off'
      },
      parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
      }
    }
  ]
};
