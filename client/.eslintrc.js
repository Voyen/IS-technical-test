module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: ['plugin:@next/next/recommended', 'prettier'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint', 'prettier', 'import'],
    rules: {
        'prettier/prettier': ['error'],
        'react/prefer-stateless-function': 0,
        'react/jsx-filename-extension': 0,
        'react/jsx-props-no-spreading': 0,
        'no-use-before-define': 0,
    },
};
