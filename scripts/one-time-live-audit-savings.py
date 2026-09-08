from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
import time

BASE='https://figurenest.com/calculators/finance/savings'
opts=webdriver.ChromeOptions()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--disable-dev-shm-usage')
opts.add_argument('--window-size=1440,2200')
driver=webdriver.Chrome(options=opts)
wait=WebDriverWait(driver,20)

def dismiss_consent():
    for text in ['Reject analytics','Reject all','Decline']:
        try:
            b=driver.find_element(By.XPATH,f"//button[contains(normalize-space(.), '{text}')]")
            if b.is_displayed(): b.click(); time.sleep(.3); return
        except Exception: pass

def el(testid): return driver.find_element(By.CSS_SELECTOR,f'[data-testid="{testid}"]')
def setv(e,v):
    e.click(); e.send_keys(Keys.CONTROL,'a'); e.send_keys(Keys.BACKSPACE)
    if v!='': e.send_keys(str(v))
    e.send_keys(Keys.TAB); time.sleep(.4)
def result(): return el('finance-calculator-result').text.strip()
def body(): return driver.find_element(By.TAG_NAME,'body').text

try:
    driver.get(BASE); wait.until(lambda d:d.execute_script('return document.readyState')=='complete'); time.sleep(.8); dismiss_consent()
    assert result()=='$12,912.92', result()
    print('PASS Savings normal $12,912.92')

    rate=el('input-finance-rate'); setv(rate,'0')
    assert result()=='$12,000.00', result()
    print('PASS Savings zero-rate $12,000.00')

    start=el('input-finance-start'); setv(start,'')
    assert 'enter all required values' in body().lower() or 'check' in body().lower(), body()[-1000:]
    print('PASS Savings blank required field rejected')

    setv(start,'1200'); setv(rate,'100.01')
    assert '100% or less' in body(), body()[-1000:]
    print('PASS Savings rate bound rejected')

    setv(rate,'4.5'); years=el('input-finance-years'); setv(years,'100.01')
    assert '100 years or less' in body(), body()[-1000:]
    print('PASS Savings horizon bound rejected')

    setv(years,'3')
    adv=driver.find_element(By.XPATH,"//button[normalize-space(.)='Advanced']")
    adv.click(); time.sleep(.4)
    assert 'Advanced calculation' in body() and 'Savings target' in body(), body()[-1800:]
    assert 'Projected savings' in body(), body()[-1800:]
    print('PASS Savings Advanced mode renders target scenario')
finally:
    driver.quit()
