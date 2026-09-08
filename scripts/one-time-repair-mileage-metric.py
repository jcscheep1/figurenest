from pathlib import Path

phase = Path('artifacts/calcstride/src/lib/phase-four.ts')
text = phase.read_text()
old_definition = "  mileage:make('mileage','Mileage Calculator','Automotive & EV','automotive','/calculators/automotive/mileage',[n('distance','Trip distance (miles)','120',0.1,100000),n('fuel','Fuel used (gallons)','4',0.01,10000)],'MPG = user-entered trip distance ÷ fuel used','Calculate fuel economy from a trip distance you enter yourself and fuel consumed; this page does not route, map, or geocode travel.','Calculate trip MPG from miles traveled and gallons of fuel used, with a clear result based only on your entries.','Use fuel purchased for the same trip as the distance you enter.',[{label:'U.S. Department of Energy — Fuel economy',href:'https://www.fueleconomy.gov/'}],['/calculators/automotive/fuel-cost','/calculators/automotive/fuel-economy','/converters/length']),"
new_definition = "  mileage:make('mileage','Mileage Calculator','Automotive & EV','automotive','/calculators/automotive/mileage',[s('system','Measurement system','imperial',[['imperial','US customary (miles + US gallons)'],['metric','Metric (km + litres)']]),n('distance','Trip distance (miles or km)','120',0.1,100000),n('fuel','Fuel used (US gallons or litres)','4',0.01,10000)],'US customary: MPG = miles ÷ US gallons; metric: L/100 km = litres ÷ kilometres × 100','Calculate fuel economy from trip distance and fuel consumed in either miles + US gallons or kilometres + litres; this page does not route, map, or geocode travel.','Calculate trip fuel economy from miles and US gallons or kilometres and litres, with MPG, L/100 km, and km/L outputs matched to the selected measurement system.','Choose the measurement system that matches both source values, then use fuel consumed for the same trip as the distance you enter.',[{label:'U.S. Department of Energy — Fuel economy',href:'https://www.fueleconomy.gov/'}],['/calculators/automotive/fuel-cost','/calculators/automotive/fuel-economy','/converters/length']),"
old_calc = " if(slug==='mileage') return one(`${(x[0]/x[1]).toFixed(2)} MPG`,'Based only on your entered trip distance and fuel used.');"
new_calc = " if(slug==='mileage'){const distance=x[1],fuel=x[2];if(v[0]==='metric'){const kmPerL=distance/fuel,lPer100=100/kmPerL;return one(`${lPer100.toFixed(2)} L/100 km`,'Metric fuel consumption from your entered kilometres and litres.',[{label:'Kilometres per litre',value:`${kmPerL.toFixed(2)} km/L`}]);}const mpg=distance/fuel;return one(`${mpg.toFixed(2)} MPG`,'US-customary fuel economy from your entered miles and US gallons.',[{label:'Miles per US gallon',value:`${mpg.toFixed(2)} MPG`}]);}"
if old_definition not in text:
    raise SystemExit('Mileage definition target not found')
if old_calc not in text:
    raise SystemExit('Mileage calculation target not found')
phase.write_text(text.replace(old_definition, new_definition, 1).replace(old_calc, new_calc, 1))

routes = Path('artifacts/calcstride/src/lib/phase-four-routes.ts')
route_text = routes.read_text()
old_route = "description: 'Calculate fuel economy from a trip distance you enter yourself and fuel consumed; this page does not route, map, or geocode travel.'"
new_route = "description: 'Calculate fuel economy from trip distance and fuel consumed in either miles + US gallons or kilometres + litres; this page does not route, map, or geocode travel.'"
if old_route not in route_text:
    raise SystemExit('Mileage route description target not found')
routes.write_text(route_text.replace(old_route, new_route, 1))

tests = Path('artifacts/calcstride/src/lib/phase-four.test.ts')
test_text = tests.read_text()
old_known = "assert.equal(calculatePhaseFour('mileage', ['120', '4']).primary, '30.00 MPG');"
new_known = "assert.equal(calculatePhaseFour('mileage', ['imperial', '120', '4']).primary, '30.00 MPG');"
old_invalid = "assert.ok(calculatePhaseFour('mileage', ['0', '4']).error);"
new_invalid = "assert.ok(calculatePhaseFour('mileage', ['imperial', '0', '4']).error);"
if old_known not in test_text or old_invalid not in test_text:
    raise SystemExit('Mileage legacy test target not found')
tests.write_text(test_text.replace(old_known, new_known, 1).replace(old_invalid, new_invalid, 1))
