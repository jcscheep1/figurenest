from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
import time

URL='https://figurenest.com/calculators/finance/debt-consolidation'
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
    fs=inputs(); assert len(fs)>=6, len(fs)
    assert '$402.91/month' in out(), out()
    assert 'New loan balance including fees' in body() and '$15,300.00' in body(), body()[-1400:]
    print('PASS Debt Consolidation default $402.91/month and fee-inclusive balance')

    Select(mode()).select_by_value('payment'); time.sleep(.35)
    assert '$402.91/month' in out(), out()
    assert 'Payment comparison' in body(), body()[-1200:]
    print('PASS Debt Consolidation payment-comparison mode')

    Select(mode()).select_by_value('payoff'); time.sleep(.25)
    setv(fs[-1],'200')
    assert 'must exceed first-month current-debt interest' in body().lower(), body()[-1200:]
    print('PASS Debt Consolidation insufficient current payment rejected')

    setv(fs[-1],'500'); setv(fs[0],'')
    assert 'check' in body().lower() or 'valid' in body().lower() or 'required' in body().lower(), body()[-1200:]
    print('PASS Debt Consolidation blank debt rejected')

    setv(fs[0],'15000'); setv(fs[1],'100.01')
    assert 'check' in body().lower() or 'valid' in body().lower() or 'error' in body().lower(), body()[-1200:]
    print('PASS Debt Consolidation APR maximum enforced')
finally:
    d.quit()
