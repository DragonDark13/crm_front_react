module.exports = {
    root: true,
    env: {
        browser: true,
        es2020: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['react', 'react-refresh', '@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            {allowConstantExport: true},
        ],
        'react-hooks/exhaustive-deps': 'warn',

        'no-console': ['warn', {allow: ['warn', 'error']}],

        'no-unused-vars': 'off',


        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',

        '@typescript-eslint/consistent-type-imports': 'warn',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            },
        ],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
