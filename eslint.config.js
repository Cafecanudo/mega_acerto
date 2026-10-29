import { readdirSync } from 'node:fs';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import importX from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

const webFeatures = (() => {
  try {
    return readdirSync(new URL('./apps/web/src/features', import.meta.url), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
})();

const crossFeatureZones = webFeatures.map((feature) => ({
  target: `./apps/web/src/features/${feature}`,
  from: './apps/web/src/features',
  except: [`./${feature}`],
}));

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', 'pnpm-lock.yaml'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'import-x': importX },
    rules: {
      'no-warning-comments': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'import-x/no-duplicates': 'error',
    },
  },
  {
    files: ['apps/api/**/*.ts', 'packages/**/*.ts', 'apps/web/vite.config.ts', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({ project: './apps/web/tsconfig.json' }),
      ],
    },
    languageOptions: { globals: globals.browser },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            ...crossFeatureZones,
            {
              target: ['./apps/web/src/features'],
              from: './apps/web/src/app',
            },
            {
              target: [
                './apps/web/src/components',
                './apps/web/src/hooks',
                './apps/web/src/lib',
                './apps/web/src/types',
                './apps/web/src/utils',
                './apps/web/src/config',
              ],
              from: ['./apps/web/src/features', './apps/web/src/app'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
);
