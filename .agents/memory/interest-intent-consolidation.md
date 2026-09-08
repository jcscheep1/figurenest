# Interest calculator intent consolidation

## Canonical route

Use `/calculators/finance/simple-interest` as the single published FigureNest destination for principal × annual rate × time simple-interest calculations.

## Legacy route

`/calculators/finance/interest` and its trailing-slash form are legacy aliases. They permanently redirect to the canonical Simple Interest calculator so bookmarks and inbound links continue to resolve while the duplicate tool is excluded from the public catalogue, directory counts, internal search/navigation, SEO route generation, sitemap, and public catalog API.

## Registry contract

The consolidation removes one public tool identity from both the web and API registries. Any catalogue-count regression tests must therefore track the consolidated total rather than preserving the duplicate solely to satisfy an old count.

## Why

The legacy Interest Calculator and the core Simple Interest Calculator used the same inputs, formula, outputs, and search intent. Publishing both created avoidable navigation duplication and potential organic-search cannibalization without adding a materially different calculation method or audience.
