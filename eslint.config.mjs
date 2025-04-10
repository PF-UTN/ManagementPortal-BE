import importPlugin from "eslint-plugin-import"; // Import the plugin
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tseslint.configs.strict,
  { ignores: ['**/*.{js, mjs, cjs, json}', "dist/**", "node_modules/**"] },
  {
    plugins: {
      import: importPlugin, // Use the plugin as an object
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      'import/order': [
        'error',
        {
          groups: [
            ['internal'], // Internal imports (e.g., @/...)
            ['external'], // External imports from node_modules
            ['parent', 'sibling', 'index'], // Relative imports (e.g., ./ or ../)
          ],
          pathGroups: [
            {
              pattern: '@**', // Match internal imports starting with @/
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always', // Enforce newlines between groups
          alphabetize: {
            order: 'asc', // Alphabetize imports
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];