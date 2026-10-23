"""Optional real-app browser smoke AFTER npm ci and npm run dev.

Requires: pip install playwright, Chrome/Chromium, and running Vite/Express app.
Does not write real application progress: answers remain within temporary browser context.
Run: python scripts/smokeSolidMensurationBrowserV10530.py
"""
import os
import sys
from playwright.sync_api import sync_playwright

BASE=os.getenv('BSECE_SMOKE_URL','http://127.0.0.1:3000')
CHROME=os.getenv('CHROMIUM_PATH')

with sync_playwright() as pw:
    options={'headless':True}
    if CHROME: options['executable_path']=CHROME
    browser=pw.chromium.launch(**options)
    try:
        page=browser.new_page(viewport={'width':1366,'height':900})
        page.goto(BASE,wait_until='domcontentloaded',timeout=25000)
        page.locator('#nav-btn-mathematics').click(timeout=15000)
        page.locator('#math-subject-geometry').click(timeout=15000)
        page.locator('#btn-geometry-solid-mensuration').click(timeout=15000)
        page.locator('#solid-mensuration-app-screen').wait_for(timeout=15000)
        page.get_by_role('button',name='Practice Questions').click(timeout=15000)
        page.locator('#solid-mensuration-practice-panel').wait_for(timeout=15000)
        assert '172 original questions' in page.locator('#solid-mensuration-practice-panel').inner_text()
        page.get_by_label('Filter practice by difficulty').select_option('Challenge')
        assert '86 questions match' in page.locator('#solid-mensuration-practice-panel').inner_text()
        page.get_by_label('Practice sequence mode').select_option('adaptive')
        page.get_by_role('button',name='Show formula hint').click()
        page.get_by_role('button',name='Hide formula hint').wait_for()
        # Query rendered options; choose one, and verify the worked solution is displayed.
        opts=page.locator('[role="group"][aria-label="Answer choices"] button')
        assert opts.count()==4
        opts.nth(0).click()
        page.get_by_text('Verified answer:',exact=False).wait_for()
        page.get_by_role('button',name='Reset answers').click()
        assert '0 attempted' in page.locator('#solid-mensuration-practice-panel').inner_text()
        print('PASS v10.53 Solid Mensuration: navigation, 172 questions, Challenge filter, adaptive mode, hints, answers and reset.')
    finally:
        browser.close()
