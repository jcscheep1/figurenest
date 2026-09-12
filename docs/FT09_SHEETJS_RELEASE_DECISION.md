# FT-09 SheetJS CE release-source decision

Status: **APPROVED FOR FT-09 IMPLEMENTATION; PUBLICATION STILL GATED**

Decision date: 2026-09-12

## Exact dependency

- Package: SheetJS Community Edition (`xlsx`)
- Version: `0.20.3`
- Authoritative versioned package URL: `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`
- Observed tarball SHA-256 from the FT-09 fixture spike: `8dc73fc3b00203e72d176e85b50938627c7b086e607c682e8d3c22c02bb99fe8`
- License: Apache-2.0
- Runtime loading policy: bundled/local import only; runtime CDN loading is forbidden

## Release-source disposition

FT-09 may proceed with the exact versioned SheetJS CE 0.20.3 tarball already pinned in `artifacts/calcstride/package.json` and `pnpm-lock.yaml`, provided the supply-chain regression remains green. FigureNest does not permit `xlsx@latest`, the stale npm-registry `xlsx@0.18.5`, an unversioned URL, or a silently substituted fork.

The repository regression gate must continue to prove all of the following before publication:

1. the package specifier resolves only to the exact authoritative `xlsx-0.20.3.tgz` URL;
2. the installed package reports version `0.20.3` and Apache-2.0 licensing;
3. the reviewed tarball SHA-256 remains `8dc73fc3b00203e72d176e85b50938627c7b086e607c682e8d3c22c02bb99fe8` when the fixture/supply-chain verification fetches or inspects the package source;
4. production browser code reaches SheetJS only through the FT-09 lazy import boundary and never through a runtime CDN request;
5. document/workbook bytes, filenames, parsed values, metadata and generated output remain browser-local and are never persisted in browser storage.

If any of those assertions can no longer be demonstrated reproducibly, the release gate closes. The fallback is to vendor the already-reviewed tarball as a repository-controlled artifact after separately reviewing repository-size and update-process implications; silently relaxing source verification is not allowed.

## License / attribution record

SheetJS CE 0.20.3 is Apache-2.0 licensed. FigureNest must retain the dependency's distributed license material in the installed/bundled dependency supply chain and preserve this dependency record as the project-level attribution decision. If a later packaging step strips third-party license material from the distributable artifact, publication must add an explicit third-party license disclosure before release rather than treating this document as a replacement for the Apache-2.0 license text.

## Security and behavior evidence already established

The unpublished FT-09 spike has established:

- dependency-independent XLSX ZIP central-directory preflight before workbook parsing;
- fail-closed limits for ZIP64, encrypted entries, unsupported compression, excessive entry counts, individual/aggregate uncompressed size and hostile compression ratio;
- deterministic CSV → XLSX → reopen behavior;
- leading-zero, Unicode and quoted-newline value preservation fixtures;
- formula-looking values remain strings rather than executable formula cells;
- CSV formula-injection neutralization while genuine negative numeric values remain numeric-looking values;
- route-lazy SheetJS loading;
- desktop and 390×844 browser research coverage with network/storage interception and hostile-resource rejection.

The pre-decision exact head `c64c9ba65ff4d11cd9d70134185d01777c0f5e63` passed Validate FigureNest #696, FT-07 Browser Publication Gate #72, FT-08 Publication Browser QA #11 and FT-09 Browser Research QA #3. Both authoritative Vercel preview contexts were green on that exact SHA. Those results are historical evidence only: this decision commit creates a new head and must receive fresh exact-head QA before it can be used for further implementation or publication decisions.

## Remaining publication gate

This decision closes the unresolved FT-09 dependency-source choice; it does **not** publish FT-09. Before merge/publication the lane must still:

- reconcile current production `main` without overwriting newer work;
- implement the actual browser-local CSV → XLSX and XLSX → CSV user surfaces using the reviewed shared engine;
- implement the promised delimiter/header/sheet-selection and preview behavior with bounded workbook-shape limits;
- retain all privacy, storage, formula, ZIP/resource and mobile protections in production-route browser QA;
- integrate catalog, API parity, category copy, route registry, schema, sitemap, canonicals and tool counts atomically;
- pass fresh exact-head FigureNest validation, dedicated FT-09 publication browser QA and both authoritative Vercel contexts;
- merge only with expected-head protection, then verify production robots, sitemap, canonicals, schema/catalog/tool-count parity and representative existing calculators/file tools.
