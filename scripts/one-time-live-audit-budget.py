from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
import time

URL='https://figurenest.com/calculators/finance/budget'
opts=webdriver.ChromeOptions(); opts.add_argument('--headless=new'); opts.add_argument('--no-sandbox'); opts.add_argument('--disable-dev-shm-usage'); opts.add_argument('--window-size=1440,1800')
d=webdriver.Chrome(options=opts); wait=WebDriverWait(d,20)

def dismiss():
    for t in ['Reject analytics','Reject all','Decline']:
        try:
            b=d.find_element(By.XPATH,f"//button[contains(normalize-space(.), '{t}')]")
            if b.is_displayed(): b.click(); time.sleep(.25); return
        except Exception: pass

def fields(): return d.find_elements(By.CSS_SELECTOR,'label.advanced-field input')
def setv(e,v):
    e.click(); e.send_keys(Keys.CONTROL,'a'); e.send_keys(Keys.BACKSPACE)
    if v!='': e.send_keys(str(v))
    e.send_keys(Keys.TAB); time.sleep(.35)
def out(): return d.find_element(By.CSS_SELECTOR,'.advanced-result-output').text.strip()
def body(): return d.find_element(By.TAG_NAME,'body').text

try:
    d.get(URL); wait.until(lambda x:x.execute_script('return document.readyState')=='complete'); time.sleep(.8); dismiss()
    fs=fields(); assert len(fs)>=2, len(fs)
    assert '$1,200.00' in out() and 'surplus' in body().lower(), (out(), body()[-900:])
    print('PASS Budget default surplus $1,200.00')

    setv(fs[0],'3000'); setv(fs[1],'3800')
    assert '-$800.00' in out() or '$-800.00' in out() or '$800.00' in out(), out()
    assert 'shortfall' in body().lower(), body()[-900:]
    print('PASS Budget shortfall state')

    setv(fs[0],'3800')
    assert '$0.00' in out(), out()
    print('PASS Budget exact-zero balance')

    setv(fs[0],'')
    assert 'check' in body().lower() or 'valid' in body().lower() or 'required' in body().lower(), body()[-900:]
    print('PASS Budget blank income rejected')

    setv(fs[0],'10000001')
    assert 'check' in body().lower() or 'valid' in body().lower() or 'error' in body().lower(), body()[-900:]
    print('PASS Budget field maximum enforced')
finally:
    d.quit()
