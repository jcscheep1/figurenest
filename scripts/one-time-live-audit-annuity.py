from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
import time

URL='https://figurenest.com/calculators/finance/annuity'
opts=webdriver.ChromeOptions(); opts.add_argument('--headless=new'); opts.add_argument('--no-sandbox'); opts.add_argument('--disable-dev-shm-usage'); opts.add_argument('--window-size=1440,1900')
d=webdriver.Chrome(options=opts); wait=WebDriverWait(d,20)

def dismiss():
    for t in ['Reject analytics','Reject all','Decline']:
        try:
            b=d.find_element(By.XPATH,f"//button[contains(normalize-space(.), '{t}')]")
            if b.is_displayed(): b.click(); time.sleep(.25); return
        except Exception: pass

def inputs(): return d.find_elements(By.CSS_SELECTOR,'label.advanced-field input')
def mode(): return d.find_element(By.CSS_SELECTOR,'label.advanced-field select')
def setv(e,v):
    e.click(); e.send_keys(Keys.CONTROL,'a'); e.send_keys(Keys.BACKSPACE)
    if v!='': e.send_keys(str(v))
    e.send_keys(Keys.TAB); time.sleep(.35)
def out(): return d.find_element(By.CSS_SELECTOR,'.advanced-result-output').text.strip()
def body(): return d.find_element(By.TAG_NAME,'body').text

try:
    d.get(URL); wait.until(lambda x:x.execute_script('return document.readyState')=='complete'); time.sleep(.8); dismiss()
    fs=inputs(); assert len(fs)>=3, len(fs)
    assert '$659.96 per monthly' in out() or '$659.96' in out(), out()
    print('PASS Annuity default monthly payout $659.96')

    setv(fs[1],'0')
    assert '$416.67' in out(), out()
    print('PASS Annuity zero-rate monthly payout $416.67')

    setv(fs[1],'5'); setv(fs[2],'20.01')
    assert 'whole monthly' in body().lower() or 'whole number of monthly' in body().lower(), body()[-1200:]
    print('PASS Annuity fractional monthly payout period rejected')

    setv(fs[2],'20.5')
    assert '$' in out() and 'CHECK' not in out().upper(), out()
    print('PASS Annuity 20.5 years accepted in monthly mode (246 periods)')

    Select(mode()).select_by_value('annual'); time.sleep(.35)
    assert 'whole annual' in body().lower() or 'whole number' in body().lower(), body()[-1200:]
    print('PASS Annuity fractional year rejected in annual mode')

    setv(fs[2],'20')
    assert '$8,024.26' in out(), out()
    print('PASS Annuity annual payout $8,024.26')
finally:
    d.quit()
