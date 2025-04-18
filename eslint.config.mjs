import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tseslint.configs.strict,
  { ignores: ['**/*.{js, mjs, cjs, json}', "dist/**", "node_modules/**"] },
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      'import/order': [
        'error',
        {
          groups: [
            ['unknown', 'external', 'builtin'],
            ['internal'],
            ['parent', 'sibling', 'index'], 
          ],
          pathGroups: [
            {
              pattern: '@mp/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: [],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 1,
          maxBOF: 0,
        },
      ],
    },
  },
];