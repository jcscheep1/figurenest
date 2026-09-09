from pathlib import Path

path = Path('artifacts/calcstride/src/lib/priority-one-expansion.ts')
text = path.read_text()
old = " if(['boat-loan','business-loan','home-equity-loan','personal-loan','student-loan','uk-mortgage','canadian-mortgage'].includes(slug)){let r=n[1];if(slug==='canadian-mortgage')r=(Math.pow(1+r/200,2/12)-1)*1200;const m=payment(n[0],r,n[2]);return {primary:money(m),summary:'Estimated monthly principal and interest.',details:[{label:'Total payments',value:money(m*n[2]*12)},{label:'Total interest',value:money(m*n[2]*12-n[0])}]};}"
new = " if(['boat-loan','business-loan','home-equity-loan','personal-loan','student-loan','uk-mortgage','canadian-mortgage'].includes(slug)){if(slug==='home-equity-loan'){if(n[2]<=0)return bad('Loan term must be greater than zero.');const rawMonths=n[2]*12,months=Math.round(rawMonths);if(Math.abs(rawMonths-months)>1e-9)return bad('Loan term must resolve to a whole number of months.');}let r=n[1];if(slug==='canadian-mortgage')r=(Math.pow(1+r/200,2/12)-1)*1200;const m=payment(n[0],r,n[2]);if(!Number.isFinite(m))return bad('These loan terms do not produce a finite payment.');return {primary:money(m),summary:'Estimated monthly principal and interest.',details:[{label:'Total payments',value:money(m*n[2]*12)},{label:'Total interest',value:money(m*n[2]*12-n[0])}]};}"
if old not in text:
    raise SystemExit('Guarded replacement target not found; source changed')
path.write_text(text.replace(old, new, 1))
