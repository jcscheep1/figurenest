from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
import time

URL='https://figurenest.com/calculators/finance/social-security'
opts=webdriver.ChromeOptions(); opts.add_argument('--headless=new'); opts.add_argument('--no-sandbox'); opts.add_argument('--disable-dev-shm-usage'); opts.add_argument('--window-size=390,1600')
d=webdriver.Chrome(options=opts); wait=WebDriverWait(d,20)

def dismiss():
    for t in ['Reject analytics','Reject all','Decline']:
        try:
            b=d.find_element(By.XPATH,f"//button[contains(normalize-space(.), '{t}')]")
            if b.is_displayed(): b.click(); time.sleep(.25); return
        except Exception: pass

def setv(css,v):
    e=d.find_element(By.CSS_SELECTOR,css); e.click(); e.send_keys(Keys.CONTROL,'a'); e.send_keys(Keys.BACKSPACE)
    if v!='': e.send_keys(str(v))
    e.send_keys(Keys.TAB); time.sleep(.35)

def out(): return d.find_element(By.CSS_SELECTOR,'.advanced-result-output').text.strip()
def status_text(): return d.find_element(By.CSS_SELECTOR,'.advanced-result').text.strip().lower()

def assert_contained():
    box=d.find_element(By.CSS_SELECTOR,'.advanced-result').rect
    child=d.find_element(By.CSS_SELECTOR,'.advanced-result-output').rect
    assert child['x'] >= box['x'] - 1
    assert child['x'] + child['width'] <= box['x'] + box['width'] + 1

try:
    d.get(URL); wait.until(lambda x:x.execute_script('return document.readyState')=='complete'); time.sleep(.8); dismiss()
    assert '$2,000.00/month' in out(), out()
    assert '100.0% of pia' in d.find_element(By.CSS_SELECTOR,'.advanced-breakdown').text.lower()
    assert '67' in d.find_element(By.CSS_SELECTOR,'.advanced-breakdown').text
    print('PASS default 1960 / age 67 -> $2,000.00/month at FRA')

    setv('#social-security-claim-age','62')
    assert '$1,400.00/month' in out(), out()
    assert '70.0% of pia' in d.find_element(By.CSS_SELECTOR,'.advanced-breakdown').text.lower()
    print('PASS FRA-67 age-62 reference -> 70% of PIA')

    setv('#social-security-pia','')
    assert 'enter valid values' in out().lower(), out()
    print('PASS blank required PIA rejected')

    setv('#social-security-pia','0')
    assert '$0.00/month' in out(), out()
    print('PASS explicit zero PIA remains valid')

    setv('#social-security-pia','2000'); setv('#social-security-birth-year','1956'); setv('#social-security-claim-age','70')
    assert '$2,586.67/month' in out(), out()
    b=d.find_element(By.CSS_SELECTOR,'.advanced-breakdown').text.lower()
    assert '129.3% of pia' in b and '66 years 4 months' in b
    print('PASS 1956 cohort age-70 delayed-credit reference')

    setv('#social-security-claim-age','67.5')
    assert 'enter valid values' in out().lower(), out()
    print('PASS fractional claiming age rejected')

    setv('#social-security-claim-age','67'); setv('#social-security-birth-year','1942')
    assert 'enter valid values' in out().lower(), out()
    print('PASS unsupported pre-1943 birth year rejected')

    d.find_element(By.XPATH,"//button[contains(normalize-space(.),'Reset values')]").click(); time.sleep(.35)
    assert d.find_element(By.CSS_SELECTOR,'#social-security-pia').get_attribute('value') == '2000'
    assert d.find_element(By.CSS_SELECTOR,'#social-security-birth-year').get_attribute('value') == '1960'
    assert d.find_element(By.CSS_SELECTOR,'#social-security-claim-age').get_attribute('value') == '67'
    assert '$2,000.00/month' in out(), out()
    print('PASS reset restores default values/result')

    assert_contained()
    print('PASS mobile result-card containment at 390px')
finally:
    d.quit()
