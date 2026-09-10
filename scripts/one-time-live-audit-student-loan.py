import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

URL = os.environ.get('FIGURENEST_URL', 'https://figurenest.com/calculators/finance/student-loan')
opts = webdriver.ChromeOptions()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--disable-dev-shm-usage')
opts.add_argument('--window-size=1280,1200')
driver = webdriver.Chrome(options=opts)
wait = WebDriverWait(driver, 20)

def fill(testid: str, value) -> None:
    element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, f'[data-testid="{testid}"]')))
    element.clear()
    if value != '':
        element.send_keys(str(value))
    time.sleep(0.15)

def result() -> str:
    return wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="result-student-loan"]'))).text.strip()

def status_text() -> str:
    return driver.find_element(By.CSS_SELECTOR, '[data-testid="status-student-loan"]').text

try:
    driver.get(URL)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="page-student-loan"]')))

    assert result() == '$489.15', result()
    body = driver.find_element(By.TAG_NAME, 'body').text
    assert 'Total payments' in body and '$29,349.22' in body, body
    assert 'Total interest' in body and '$4,349.22' in body, body

    fill('input-student-loan-rate', 0)
    assert result() == '$416.67', result()

    fill('input-student-loan-principal', 0)
    assert result() == '$0.00', result()
    fill('input-student-loan-principal', '')
    assert 'Complete every field' in status_text(), status_text()

    fill('input-student-loan-principal', -1)
    assert 'non-negative' in status_text(), status_text()

    fill('input-student-loan-principal', 25000)
    fill('input-student-loan-rate', 6.5)
    fill('input-student-loan-years', '5.01')
    assert 'whole number of monthly payments' in status_text(), status_text()
    fill('input-student-loan-years', '5.5')
    assert result().startswith('$'), result()
    years = driver.find_element(By.CSS_SELECTOR, '[data-testid="input-student-loan-years"]')
    assert years.get_attribute('min') == '0.08333333333333333'
    assert years.get_attribute('step') == '0.08333333333333333'

    Select(driver.find_element(By.ID, 'student-loan-currency')).select_by_value('EUR')
    time.sleep(0.2)
    assert '€' in result() and '$' not in result(), result()
    breakdown = driver.find_element(By.CSS_SELECTOR, '.advanced-breakdown').text
    assert '€' in breakdown and '$' not in breakdown, breakdown

    fill('input-student-loan-principal', 1234)
    fill('input-student-loan-rate', 0)
    fill('input-student-loan-years', 1)
    driver.find_element(By.CSS_SELECTOR, '[data-testid="button-reset-student-loan"]').click()
    time.sleep(0.2)
    assert driver.find_element(By.CSS_SELECTOR, '[data-testid="input-student-loan-principal"]').get_attribute('value') == '25000'
    assert driver.find_element(By.CSS_SELECTOR, '[data-testid="input-student-loan-rate"]').get_attribute('value') == '6.5'
    assert driver.find_element(By.CSS_SELECTOR, '[data-testid="input-student-loan-years"]').get_attribute('value') == '5'
    assert '€' in result(), result()

    body = driver.find_element(By.TAG_NAME, 'body').text
    assert 'fixed principal-and-interest illustration' in body
    assert 'Federal repayment plans' in body

    driver.set_window_size(390, 900)
    time.sleep(0.2)
    geometry = driver.execute_script("""
      const el = document.querySelector('[data-testid=\"status-student-loan\"]');
      const r = el.getBoundingClientRect();
      return {left:r.left, right:r.right, inner:window.innerWidth, scroll:document.documentElement.scrollWidth};
    """)
    assert geometry['left'] >= -1, geometry
    assert geometry['right'] <= geometry['inner'] + 1, geometry
    assert geometry['scroll'] <= geometry['inner'] + 1, geometry

    assert driver.find_element(By.CSS_SELECTOR, '[data-testid="button-copy-student-loan"]').is_enabled()
    assert driver.find_element(By.CSS_SELECTOR, '[data-testid="button-share-student-loan"]').is_enabled()
    assert not driver.find_elements(By.CSS_SELECTOR, '[data-testid*="export"]')

    print('PASS: Student Loan production audit')
finally:
    driver.quit()
