import nextCore from 'eslint-config-next/core-web-vitals'

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'coverage/**', 'lib/api-types.ts'],
  },
  ...nextCore,
  {
    files: ['components/effects/antigravity.tsx', 'components/ui/sidebar.tsx'],
    rules: {
      // Visual effects intentionally use randomness for particle init.
      'react-hooks/purity': 'off',
    },
  },
]

export default eslintConfig
