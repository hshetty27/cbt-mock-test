import json,time,shutil
from playwright.sync_api import sync_playwright
import os
D=os.path.dirname(os.path.abspath(__file__))+'/'
R=[]
def ok(n,c,x=''):R.append((n,bool(c)));print(('PASS ' if c else 'FAIL ')+n,x)
shutil.copy(D+'questions/sample2.json','short.json')
s=json.load(open('short.json'));s['durationMinutes']=0.1;json.dump(s,open('short.json','w'))
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':1200,'height':800});ctx.set_offline(True)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto('file://'+D+'index.html')
    pg.set_input_files('#file',D+'questions/sample1.json')
    pg.wait_for_selector('#test',state='visible')
    ok('offline: test starts',pg.is_visible('#test') and '15' in pg.inner_text('#qhead'))
    # answers per hand calc: idx0=1,1=2,2=1,3=0(wrong),6=1,7=0(wrong),11=1 -> 5*4-2=18
    ans={0:1,1:2,2:1,3:0,6:1,7:0,11:1}
    for i in range(15):
        if i in ans: pg.click(f'.opt[data-k="{ans[i]}"]')
        if i==4: pg.click('#mark')
        pg.click('#next')
    pg.click('.p[data-i="4"]')
    ok('mark persists in palette',pg.query_selector('.p[data-i="4"]').get_attribute('class').split().count('mk')==1)
    t1=pg.inner_text('#timer');time.sleep(2.2)
    pg.reload()
    t2=pg.inner_text('#timer')
    f=lambda t:int(t[:2])*60+int(t[3:])
    ok('refresh keeps test + timer continues',pg.is_visible('#test') and f(t2)<=f(t1)-2 and f(t2)>f(t1)-8,f'{t1}->{t2}')
    pg.click('.p[data-i="0"]')
    ok('answers survive refresh',pg.query_selector('.opt.sel') and pg.inner_text('.opt.sel b')=='B')
    pg.once('dialog',lambda d:d.accept());pg.click('#submit')
    ok('result visible',pg.is_visible('#result'))
    sc=pg.inner_text('#rscore');ok('score matches hand calc 18 / 60',sc.strip()=='18 / 60',sc)
    sm=pg.inner_text('#rsum');ok('summary 5/2/8, 71.4%','5 correct' in sm and '2 wrong' in sm and '8 skipped' in sm and '71.4' in sm,sm)
    pg.reload();ok('result survives refresh',pg.is_visible('#result') and pg.inner_text('#rscore').strip()=='18 / 60')
    pg.click('#again');pg.set_input_files('#file',D+'questions/sample2.json')
    pg.wait_for_selector('#test',state='visible')
    ok('second file works, no code change',pg.is_visible('#test') and 'General Knowledge' in pg.inner_text('#qhead'))
    # sample2 scoring: Q1 right(+2), Q2 wrong(-0.5), Q4 wrong(0 neg, English), rest skipped => 1.5 / 8
    pg.click('.opt[data-k="1"]');pg.click('#next');pg.click('.opt[data-k="0"]');pg.click('#next');pg.click('#next')
    pg.click('.opt[data-k="0"]');pg.click('#next')
    pg.once('dialog',lambda d:d.accept());pg.click('#submit')
    ok('sample2 section overrides score 1.5 / 8',pg.inner_text('#rscore').strip()=='1.5 / 8',pg.inner_text('#rscore'))
    pg.click('#again')
    pg.set_input_files('#file',D+'questions/sample1.json');pg.click('#opts .opt >> nth=0');pg.click('#again') if False else None
    # bad file
    open('bad.json','w').write('{"sections":[]}')
    pg.evaluate("localStorage.clear()");pg.reload()
    pg.set_input_files('#file','bad.json')
    ok('bad file shows error',pg.is_visible('#start') and 'sections' in pg.inner_text('#err'),pg.inner_text('#err'))
    # auto-submit
    pg.set_input_files('#file','short.json');pg.click('.opt[data-k="1"]')
    pg.wait_for_selector('#result',state='visible',timeout=10000)
    ok('auto-submit at 0:00',pg.is_visible('#result') and 'auto-submitted' in pg.inner_text('#rsum'),pg.inner_text('#rscore'))
    # mobile layout
    pg.click('#again');pg.set_input_files('#file',D+'questions/sample1.json')
    pg.set_viewport_size({'width':375,'height':740})
    ok('mobile: no horizontal scroll',pg.evaluate('document.documentElement.scrollWidth<=window.innerWidth'))
    pg.screenshot(path='mobile.png');pg.set_viewport_size({'width':1200,'height':800});pg.screenshot(path='desktop.png')
    ok('no console/page errors',not errs,errs)
    b.close()
print('TOTAL',sum(c for _,c in R),'/',len(R))
