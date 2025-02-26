import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tseslint.configs.strict,
   { ignores: ['**/*.{js, mjs, cjs}', "dist/**", "node_modules/**"] },
   {
      rules: {
         '@typescript-eslint/no-non-null-assertion': 'off',
         '@typescript-eslint/no-extraneous-class': 'off',
      },
   },
];