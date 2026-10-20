const { readdirSync } = require('node:fs');
const { join } = require('node:path');

/** Layers from the highest to the lowest: a layer may only import from layers below it. */
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

/** Layers split into slices (one folder per slice). `app` and `shared` have no slices. */
const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities'];

/** @param {string} layer */
const listSlices = (layer) => {
  try {
    return readdirSync(join(__dirname, 'src', layer), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
};

/**
 * `no-restricted-imports` options are replaced (not merged) between config blocks,
 * so every block gets the full list of restrictions for its layer/slice.
 *
 * @param {string} layer
 * @param {string} [slice]
 * @returns {import('eslint').Linter.RuleEntry}
 */
function restrictedImports(layer, slice) {
  const higherLayers = LAYERS.slice(0, LAYERS.indexOf(layer));

  const patterns = [
    // 1. Layer rule: imports go only downwards.
    ...higherLayers.map((higher) => ({
      group: [`@/${higher}`, `@/${higher}/**`],
      message: `FSD: layer "${layer}" must not import from the higher layer "${higher}".`,
    })),
    // 2. Public API rule: reach into a slice only through its index.ts.
    {
      group: SLICED_LAYERS.map((sliced) => `@/${sliced}/*/**`),
      message: 'FSD: import a slice only through its public API (index.ts), not its internals.',
    },
    // 3. No climbing out of a slice with relative paths: use the "@/" alias across slices.
    {
      regex: '^(\\.\\./){3,}',
      message: 'FSD: use the "@/" alias instead of long relative paths.',
    },
  ];

  // 4. Slice isolation: slices of one layer must not know about each other.
  if (slice) {
    patterns.push({
      group: [`@/${layer}/*`, `!@/${layer}/${slice}`],
      message: `FSD: slices of the "${layer}" layer must not import each other.`,
    });
  }

  return ['error', { patterns }];
}

/** @type {import('eslint').Linter.Config[]} */
const fsdBoundaries = [
  { files: ['src/app/**/*.ts'], rules: { 'no-restricted-imports': restrictedImports('app') } },
  {
    files: ['src/shared/**/*.ts'],
    rules: { 'no-restricted-imports': restrictedImports('shared') },
  },
  ...SLICED_LAYERS.flatMap((layer) =>
    listSlices(layer).map((slice) => ({
      files: [`src/${layer}/${slice}/**/*.ts`],
      rules: { 'no-restricted-imports': restrictedImports(layer, slice) },
    })),
  ),
];

module.exports = { fsdBoundaries };
