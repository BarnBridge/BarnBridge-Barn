module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.eslint.json',
    },
    env: {
        node: true,
    },
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'always-multiline'],
        'quotes': ['error', 'single', { 'avoidEscape': true }],
        // Strict mode
        'strict': ['error', 'global'],

        // Code style
        'array-bracket-spacing': ['off'],
        'camelcase': ['error', { 'properties': 'always' }],
        'comma-spacing': ['error', {
            'before': false,
            'after': true,
        }],
        'dot-notation': ['error', {
            'allowKeywords': true,
            'allowPattern': '',
        }],
        'eol-last': ['error', 'always'],
        'eqeqeq': ['error', 'smart'],
        'generator-star-spacing': ['error', 'before'],
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'max-len': ['error', 120, 2],
        'no-debugger': 'off',
        'no-dupe-args': 'error',
        'no-dupe-keys': 'error',
        'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
        'no-redeclare': ['error', { 'builtinGlobals': true }],
        'no-trailing-spaces': ['error', { 'skipBlankLines': false }],
        'no-use-before-define': 'off',
        'no-var': 'error',
        'object-curly-spacing': ['error', 'always'],
        'prefer-const': 'error',
        'space-before-function-paren': ['error', 'always'],
        'promise/always-return': 'off',
        'promise/avoid-new': 'off',
    },
}
