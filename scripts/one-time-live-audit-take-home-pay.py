from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
import json
import time

URL='https://figurenest.com/calculators/salary-work/take-home-pay'
opts=webdriver.ChromeOptions(); opts.add_argument('--headless=new'); opts.add_argument('--no-sandbox'); opts.add_argument('--disable-dev-shm-usage'); opts.add_argument('--window-size=1440,1900')
d=webdriver.Chrome(options=opts); wait=WebDriverWait(d,20)

def dismiss():
    for t in ['Reject analytics','Reject all','Decline']:
        try:
            b=d.find_element(By.XPATH,f"//button[contains(normalize-space(.), '{t}')]")
            if b.is_displayed(): b.click(); time.sleep(.25); return
        except Exception: pass

def inputs(): return d.find_elements(By.CSS_SELECTOR,'label.advanced-field input')
def setv(e,v):
    e.click(); e.send_keys(Keys.CONTROL,'a'); e.send_keys(Keys.BACKSPACE)
    if v!='': e.send_keys(str(v))
    e.send_keys(Keys.TAB); time.sleep(.3)
def out(): return d.find_element(By.CSS_SELECTOR,'.advanced-result-output').text.strip()
def page_text(): return d.find_element(By.CSS_SELECTOR,'main').text if d.find_elements(By.CSS_SELECTOR,'main') else d.find_element(By.TAG_NAME,'body').text
def rejected():
    text=(out()+' '+page_text()).lower()
    return 'check the values' in text or 'valid range' in text or 'cannot exceed gross pay' in text

try:
    d.get(URL); wait.until(lambda x:x.execute_script('return document.readyState')=='complete'); time.sleep(.8); dismiss()
    assert 'Take-Home Pay Calculator' in d.find_element(By.TAG_NAME,'h1').text
    fs=inputs(); assert len(fs)==3, len(fs)
    labels=[e.get_attribute('aria-label') or '' for e in fs]
    assert all(e.get_attribute('id') for e in fs)
    assert not d.find_elements(By.CSS_SELECTOR,'.calculator-mode'), 'Take-Home Pay should not expose an unsupported Advanced mode'

    assert '$1,850.00' in out(), out()
    print('PASS default 2500 gross / 22% tax / 100 deductions -> $1,850.00')

    setv(fs[0],'0'); setv(fs[1],'0'); setv(fs[2],'0')
    assert '$0.00' in out() and not rejected(), out()
    print('PASS true zero boundary remains valid')

    setv(fs[0],'2500'); setv(fs[1],'100'); setv(fs[2],'0')
    assert '$0.00' in out() and not rejected(), out()
    print('PASS 100% entered tax rate boundary -> $0.00')

    setv(fs[0],'100'); setv(fs[1],'50'); setv(fs[2],'51')
    assert rejected(), page_text()
    print('PASS deductions exceeding after-tax gross are rejected')

    setv(fs[0],'')
    assert rejected(), page_text()
    assert fs[0].get_attribute('aria-invalid') == 'true'
    print('PASS blank required gross pay is rejected and exposed as aria-invalid')

    d.get(URL); wait.until(lambda x:x.execute_script('return document.readyState')=='complete'); time.sleep(.6); dismiss()
    body=page_text()
    for required in ['Formula and variables', 'LIMITATIONS', 'FAQ', 'RELATED TOOLS']:
        assert required.lower() in body.lower(), required
    assert len(body.split()) >= 500, len(body.split())
    assert len(d.find_elements(By.CSS_SELECTOR,'.related-tools a')) >= 3
    canonical=d.find_element(By.CSS_SELECTOR,"link[rel='canonical']").get_attribute('href')
    assert '/calculators/salary-work/take-home-pay' in canonical, canonical
    schemas=[]
    for el in d.find_elements(By.CSS_SELECTOR,"script[type='application/ld+json']"):
        try: schemas.append(json.loads(el.get_attribute('textContent') or '{}'))
        except Exception: pass
    assert schemas, 'missing JSON-LD schema'
    print(f'PASS SEO/content: canonical, JSON-LD, related links and {len(body.split())} visible words')

    d.set_window_size(390,844); time.sleep(.4)
    overflow=d.execute_script('return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1')
    assert not overflow, 'mobile horizontal overflow detected'
    result=d.find_element(By.CSS_SELECTOR,'.advanced-result-output')
    assert result.is_displayed()
    print('PASS 390px mobile viewport has no horizontal overflow and result remains visible')
finally:
    d.quit()
