import os
import time
import traceback
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

URL = os.environ.get('FIGURENEST_URL', 'https://figurenest.com/calculators/finance/student-loan')
REPORT = 'student-loan-audit.txt'
log_lines = []

def log(message: str) -> None:
    print(message, flush=True)
    log_lines.append(message)

def check(name: str, condition: bool, detail='') -> None:
    if not condition:
        raise AssertionError(f'{name}: {detail}')
    log(f'PASS {name}: {detail}')

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
    time.sleep(0.2)

def result() -> str:
    return wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="result-student-loan"]'))).text.strip()

def status_text() -> str:
    return driver.find_element(By.CSS_SELECTOR, '[data-testid="status-student-loan"]').text

try:
    driver.get(URL)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="page-student-loan"]')))
    log(f'Loaded {driver.current_url}')

    actual = result()
    check('default monthly payment', actual == '$489.15', repr(actual))
    body = driver.find_element(By.TAG_NAME, 'body').text
    check('default total payments', 'Total payments' in body and '$29,349.22' in body, 'expected $29,349.22')
    check('default total interest', 'Total interest' in body and '$4,349.22' in body, 'expected $4,349.22')

    fill('input-student-loan-rate', 0)
    actual = result()
    check('zero-interest payment', actual == '$416.67', repr(actual))

    fill('input-student-loan-principal', 0)
    actual = result()
    check('explicit zero principal', actual == '$0.00', repr(actual))
    fill('input-student-loan-principal', '')
    actual_status = status_text()
    check('blank principal validation', 'Complete every field' in actual_status, repr(actual_status))

    fill('input-student-loan-principal', -1)
    actual_status = status_text()
    check('negative principal validation', 'non-negative' in actual_status, repr(actual_status))

    fill('input-student-loan-principal', 25000)
    fill('input-student-loan-rate', 6.5)
    fill('input-student-loan-years', '5.01')
    actual_status = status_text()
    check('fractional-month rejection', 'whole number of monthly payments' in actual_status, repr(actual_status))
    fill('input-student-loan-years', '5.5')
    actual = result()
    check('whole-month acceptance', actual.startswith('$'), repr(actual))
    years = driver.find_element(By.CSS_SELECTOR, '[data-testid="input-student-loan-years"]')
    check('term minimum', years.get_attribute('min') == '0.08333333333333333', repr(years.get_attribute('min')))
    check('term step', years.get_attribute('step') == '0.08333333333333333', repr(years.get_attribute('step')))

    Select(driver.find_element(By.ID, 'student-loan-currency')).select_by_value('EUR')
    time.sleep(0.25)
    actual = result()
    check('EUR result localization', '€' in actual and '$' not in actual, repr(actual))
    breakdown = driver.find_element(By.CSS_SELECTOR, '.advanced-breakdown').text
    check('EUR breakdown localization', '€' in breakdown and '$' not in breakdown, repr(breakdown))

    fill('input-student-loan-principal', 1234)
    fill('input-student-loan-rate', 0)
    fill('input-student-loan-years', 1)
    driver.find_element(By.CSS_SELECTOR, '[data-testid="button-reset-student-loan"]').click()
    time.sleep(0.25)
    p = driver.find_element(By.CSS_SELECTOR, '[data-testid="input-student-loan-principal"]').get_attribute('value')
    r = driver.find_element(By.CSS_SELECTOR, '[data-testid="input-student-loan-rate"]').get_attribute('value')
    y = driver.find_element(By.CSS_SELECTOR, '[data-testid="input-student-loan-years"]').get_attribute('value')
    check('reset principal', p == '25000', repr(p))
    check('reset rate', r == '6.5', repr(r))
    check('reset term', y == '5', repr(y))
    actual = result()
    check('reset preserves selected currency', '€' in actual, repr(actual))

    body = driver.find_element(By.TAG_NAME, 'body').text
    check('fixed-payment limitation text', 'fixed principal-and-interest illustration' in body, 'phrase present')
    check('federal-plan limitation text', 'Federal repayment plans' in body, 'phrase present')

    driver.set_window_size(390, 900)
    time.sleep(0.25)
    geometry = driver.execute_script("""
      const el = document.querySelector('[data-testid="status-student-loan"]');
      const r = el.getBoundingClientRect();
      return {left:r.left, right:r.right, inner:window.innerWidth, scroll:document.documentElement.scrollWidth};
    """)
    check('mobile left containment', geometry['left'] >= -1, geometry)
    check('mobile right containment', geometry['right'] <= geometry['inner'] + 1, geometry)
    check('mobile document containment', geometry['scroll'] <= geometry['inner'] + 1, geometry)

    copy_enabled = driver.find_element(By.CSS_SELECTOR, '[data-testid="button-copy-student-loan"]').is_enabled()
    share_enabled = driver.find_element(By.CSS_SELECTOR, '[data-testid="button-share-student-loan"]').is_enabled()
    exports = driver.find_elements(By.CSS_SELECTOR, '[data-testid*="export"]')
    check('copy enabled', copy_enabled, copy_enabled)
    check('share enabled', share_enabled, share_enabled)
    check('no unsupported export control', not exports, len(exports))

    log('PASS: Student Loan production audit')
except Exception as exc:
    log(f'FAIL: {type(exc).__name__}: {exc}')
    log(traceback.format_exc())
    raise
finally:
    with open(REPORT, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(log_lines) + '\n')
    driver.quit()
