from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
import time

BASE='https://figurenest.com'

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
            btn=driver.find_element(By.XPATH,f"//button[contains(normalize-space(.), '{text}')]")
            if btn.is_displayed():
                btn.click(); time.sleep(.3); return
        except Exception:
            pass

def open_page(path):
    driver.get(BASE+path)
    wait.until(lambda d: d.execute_script('return document.readyState')=='complete')
    time.sleep(.8)
    dismiss_consent()

def field(label_text):
    labels=driver.find_elements(By.CSS_SELECTOR,'label.advanced-field')
    for lab in labels:
        spans=lab.find_elements(By.TAG_NAME,'span')
        if spans and label_text.lower() in spans[0].text.lower():
            return lab.find_element(By.CSS_SELECTOR,'input,select')
    raise AssertionError(f'Field not found: {label_text}')

def set_value(el,value):
    el.click(); el.send_keys(Keys.CONTROL,'a'); el.send_keys(Keys.BACKSPACE)
    if value!='': el.send_keys(str(value))
    el.send_keys(Keys.TAB); time.sleep(.4)

def output_text():
    for selector in ['[data-testid="finance-calculator-result"]','.advanced-result-output']:
        els=driver.find_elements(By.CSS_SELECTOR,selector)
        if els:
            return els[0].text.strip()
    raise AssertionError('Result element not found')

def body_text(): return driver.find_element(By.TAG_NAME,'body').text

try:
    open_page('/calculators/finance/compound-interest')
    assert '$50,066.82' in output_text(), ('compound normal', output_text())
    years=field('Years')
    assert years.get_attribute('step')=='0.08333333333333333', years.get_attribute('step')
    set_value(years,'0')
    assert 'greater than zero' in body_text().lower(), body_text()[-1200:]
    set_value(years,'10.01')
    assert 'whole number of months' in body_text().lower(), body_text()[-1200:]
    set_value(years,'10.5')
    assert '$' in output_text() and 'CHECK' not in output_text().upper(), output_text()
    print('PASS Compound Interest live production')

    open_page('/calculators/finance/401k')
    assert '$558,391.07' in output_text(), ('401k normal', output_text())
    years=field('Years')
    assert years.get_attribute('step')=='1', years.get_attribute('step')
    set_value(years,'20.5')
    assert years.get_attribute('value')=='' or 'whole number' in body_text().lower(), (years.get_attribute('value'), body_text()[-1000:])
    set_value(years,'20')
    rate=field('Annual return after fees')
    set_value(rate,'0')
    assert '$285,000.00' in output_text(), ('401k zero rate', output_text())
    print('PASS 401(k) live production')

    open_page('/calculators/finance/bond')
    assert '$1,081.11' in output_text(), ('bond normal', output_text())
    years=field('Years')
    assert years.get_attribute('step')=='1', years.get_attribute('step')
    assert years.get_attribute('min')=='1', years.get_attribute('min')
    set_value(years,'10.5')
    assert years.get_attribute('value')=='' or 'CHECK THE VALUES' in body_text(), (years.get_attribute('value'), body_text()[-1000:])
    set_value(years,'10')
    assert '$1,081.11' in output_text(), ('bond restored', output_text())
    print('PASS Bond live production')
finally:
    driver.quit()
