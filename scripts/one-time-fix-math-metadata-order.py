from pathlib import Path

path = Path('artifacts/calcstride/src/lib/expansion-metadata.ts')
text = path.read_text()
probability_marker = '  {\n    "slug": "probability"'
big_marker = '  {\n    "slug": "big-number"'
array_end_marker = '] as const satisfies readonly CatalogEntry[];\n\nexport const phaseThreeCCatalog'

probability_start = text.find(probability_marker)
big_start = text.find(big_marker)
array_end = text.find(array_end_marker, big_start)
if min(probability_start, big_start, array_end) < 0:
    raise RuntimeError('Expected Phase 3B metadata markers were not found')
if big_start < probability_start:
    print('Math metadata already follows canonical definition order')
    raise SystemExit(0)

new_entries = text[big_start:array_end]
without_appended = text[:big_start] + text[array_end:]
probability_start = without_appended.find(probability_marker)
text = without_appended[:probability_start] + new_entries.rstrip() + ',\n' + without_appended[probability_start:]
path.write_text(text)
print('Moved Big Number and Distance metadata before Probability to match canonical Phase 3B definition order')
