module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: ['google', 'plugin:typescript-sort-keys/recommended', 'prettier'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'simple-import-sort',
        'import',
        'sort-keys-fix',
        'typescript-sort-keys',
    ],
    rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'no-throw-literal': 0,
        'no-unused-vars': 'off',
        'require-jsdoc': 0,
        'simple-import-sort/exports': 'error',
        'simple-import-sort/imports': 'error',
        'sort-keys-fix/sort-keys-fix': ['error', 'asc', { caseSensitive: true, natural: false }],
        'valid-jsdoc': 0,
    },
};
