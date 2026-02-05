import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import cookhoundPlugin from 'eslint-plugin-cookhound';
import globals from 'globals';

export default [
    {
        ignores: [
            'node_modules/**/*',
            'scripts/**/*',
            'docs/**/*',
            'tailwind.config.cjs',
            'tailwind.config.js',
            '.next/**/*',
            '.env',
            '.env.local',
            '.env.development.local',
            '.env.test.local',
            '.env.production.local',
            'vitest.config.mjs',
            'vitest.config.js',
            'prettier.config.cjs',
            'postcss.config.cjs',
            'postcss.config.js',
            'prisma/seed.ts',
            '**/src/stories/**/*',
            '**/e2e/**/*',
            'eslint.config.mjs'
        ]
    },

    js.configs.recommended,

    {
        files: ['**/*.{ts,tsx,js,jsx,mjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: tsParser,
            parserOptions: {
                project: ['./tsconfig.json'],
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                ...globals.browser,
                ...globals.es2022,
                ...globals.node,
                React: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            '@next/next': nextPlugin,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            cookhound: cookhoundPlugin
        },
        settings: {
            react: {
                version: 'detect'
            }
        },
        rules: {
            // Include Next.js recommended rules
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,

            // Include React recommended rules
            ...reactPlugin.configs.recommended.rules,

            // Include TypeScript recommended rules
            ...tsPlugin.configs.recommended.rules,

            // TypeScript specific rules
            '@typescript-eslint/semi': ['error', 'always'],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_|^error$'
                }
            ],
            '@typescript-eslint/member-delimiter-style': [
                'error',
                {
                    multiline: {
                        delimiter: 'semi',
                        requireLast: true
                    },
                    singleline: {
                        delimiter: 'semi',
                        requireLast: false
                    }
                }
            ],
            '@typescript-eslint/consistent-type-assertions': [
                'error',
                {
                    assertionStyle: 'as'
                }
            ],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports'
                }
            ],

            // Next.js specific rules
            '@next/next/no-img-element': 'off',

            // React Hooks rules
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // React specific rules
            'react/display-name': 'off',
            'react/jsx-indent-props': 'off',
            'react/jsx-no-bind': ['error'],
            'react/sort-prop-types': ['error'],
            'react/sort-default-props': ['error'],
            'react/jsx-no-constructed-context-values': ['warn'],
            'react/prefer-read-only-props': ['error'],
            'react/no-unused-prop-types': ['error'],
            'react/self-closing-comp': ['error'],
            'react/no-danger': ['error'],
            'react/jsx-first-prop-new-line': [2, 'multiline'],
            'react/jsx-max-props-per-line': [
                2,
                {
                    maximum: 1,
                    when: 'multiline'
                }
            ],
            'react/jsx-closing-bracket-location': [2, 'tag-aligned'],
            'react/prop-types': 'off',

            // Custom rules
            'cookhound/require-make-handler': 'error',
            'cookhound/no-raw-request-json': 'error',

            // General rules
            'prefer-const': 'error',
            'no-redeclare': 'off', // TypeScript handles this
            'no-undef': 'off', // TypeScript handles this
            'no-restricted-imports': [
                'error',
                {
                    patterns: ['../']
                }
            ]
        }
    },

    // Must be last to override other formatting rules
    prettierConfig
];
