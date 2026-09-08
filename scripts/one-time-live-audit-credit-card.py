from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.ui import Select
import time

URL='https://figurenest.com/calculators/finance/credit-card'
opts=webdriver.ChromeOptions(); opts.add_argument('--headless=new'); opts.add_argument('--no-sandbox'); opts.add_argument('--disable-dev-shm-usage'); opts.add_argument('--window-size=1440,1800')
d=webdriver.Chrome(options=opts); wait=WebDriverWait(d,20)

def dismiss():
    for t in ['Reject analytics','Reject all','Decline']:
        try:
            b=d.find_element(By.XPATH,f"//button[contains(normalize-space(.), '{t}')]")
            if b.is_displayed(): b.click(); time.sleep(.25); return
        except Exception: pass

def inputs(): return d.find_elements(By.CSS_SELECTOR,'label.advanced-field input')
def select_mode(): return d.find_element(By.CSS_SELECTOR,'label.advanced-field select')
def setv(e,v):
    e.click(); e.send_keys(Keys.CONTROL,'a'); e.send_keys(Keys.BACKSPACE)
    if v!='': e.send_keys(str(v))
    e.send_keys(Keys.TAB); time.sleep(.35)
def out(): return d.find_element(By.CSS_SELECTOR,'.advanced-result-output').text.strip()
def body(): return d.find_element(By.TAG_NAME,'body').text

try:
    d.get(URL); wait.until(lambda x:x.execute_script('return document.readyState')=='complete'); time.sleep(.8); dismiss()
    fs=inputs(); assert len(fs)>=3, len(fs)
    assert '36 months' in out(), out()
    print('PASS Credit Card default payoff 36 months')

    Select(select_mode()).select_by_value('interest'); time.sleep(.4)
    assert '$83.33' in out(), out()
    print('PASS Credit Card first-month interest $83.33')

    Select(select_mode()).select_by_value('payoff'); time.sleep(.3)
    setv(fs[2],'80')
    assert 'must exceed first-month interest' in body().lower(), body()[-1000:]
    print('PASS Credit Card underpayment rejected')

    setv(fs[2],'200'); setv(fs[0],'')
    assert 'check' in body().lower() or 'valid' in body().lower() or 'required' in body().lower(), body()[-1000:]
    print('PASS Credit Card blank balance rejected')

    setv(fs[0],'5000'); setv(fs[1],'100.01')
    assert 'check' in body().lower() or 'valid' in body().lower() or 'error' in body().lower(), body()[-1000:]
    print('PASS Credit Card APR maximum enforced')
finally:
    d.quit()
