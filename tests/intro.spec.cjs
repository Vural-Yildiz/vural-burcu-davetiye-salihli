const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fixture = require('node:path').join(require('node:os').tmpdir(), 'invitation-test-intro.mp4');
execFileSync('ffmpeg',['-v','error','-f','lavfi','-i','color=c=black:s=360x640:r=24:d=1','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',fixture,'-y']);
const base = process.env.TEST_URL || 'http://127.0.0.1:8765';
(async()=>{
 const browser = await chromium.launch({headless:true});
 const errors=[];
 async function page(options={}){const p=await browser.newPage({viewport:{width:390,height:844},...options});p.on('pageerror',e=>errors.push(e.message));return p;}
 async function configured(p){await p.route('**/intro-config.js*',r=>r.fulfill({contentType:'application/javascript',body:"window.INVITATION_INTRO={src:'assets/intro.mp4',loadTimeoutMs:1000}"}));}
 const fallback=await page();await fallback.clock.install();await fallback.goto(base);await fallback.waitForFunction(()=>[...document.querySelectorAll('.scene')].every(x=>x.complete));await fallback.clock.runFor(21000);
 assert(await fallback.locator('#openInvitation').isVisible());assert.equal(await fallback.locator('#invitation').getAttribute('aria-hidden'),'true');
 await fallback.screenshot({path:'/tmp/intro-final-mobile.png'});await fallback.locator('#openInvitation').click();assert.equal(await fallback.locator('#invitation').getAttribute('aria-hidden'),'false');
 await fallback.locator('#replayBtn').click();assert(await fallback.locator('#skipIntro').isVisible());assert.equal(await fallback.locator('#invitation').getAttribute('aria-hidden'),'true');await fallback.locator('#skipIntro').click();assert.equal(await fallback.locator('#invitation').getAttribute('aria-hidden'),'false');console.log('PASS automatic fallback, end-button, invitation, replay, skip');
 const reduce=await page({reducedMotion:'reduce'});await configured(reduce);let mediaLoads=0;reduce.on('request',r=>{if(r.url().endsWith('intro.mp4'))mediaLoads++});await reduce.goto(base);assert(await reduce.locator('#openInvitation').isVisible());assert.equal(mediaLoads,0);console.log('PASS reduced motion avoids video download');
 const video=await page();await configured(video);await video.route('**/assets/intro.mp4',r=>r.fulfill({path:fixture,contentType:'video/mp4'}));await video.goto(base);await video.waitForFunction(()=>document.querySelector('#opening').classList.contains('intro-ended'));assert.equal(await video.locator('#invitation').getAttribute('aria-hidden'),'true');await video.locator('#openInvitation').click();assert.equal(await video.locator('#invitation').getAttribute('aria-hidden'),'false');console.log('PASS real MP4 playback ends before invitation opens');
 const failure=await page();await configured(failure);await failure.route('**/assets/intro.mp4',r=>r.fulfill({status:404,body:''}));await failure.goto(base);await failure.waitForFunction(()=>document.querySelector('#opening').className==='cinema playing');await failure.locator('#skipIntro').click();assert.equal(await failure.locator('#invitation').getAttribute('aria-hidden'),'false');console.log('PASS missing video switches to image fallback');
 const blocked=await page();await configured(blocked);await blocked.addInitScript(()=>{HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Blocked','NotAllowedError'));});await blocked.goto(base);await blocked.waitForFunction(()=>!document.querySelector('#resumeIntro').hidden);assert(await blocked.locator('#resumeIntro').isVisible());await blocked.locator('#skipIntro').click();assert.equal(await blocked.locator('#invitation').getAttribute('aria-hidden'),'false');console.log('PASS autoplay denial offers resume and skip');
 const desktop=await page({viewport:{width:1440,height:900},reducedMotion:'reduce'});await desktop.goto(base);const bounds=await desktop.locator('#openInvitation').boundingBox();assert(bounds.x>=0 && bounds.y>=0 && bounds.x+bounds.width<=1440 && bounds.y+bounds.height<=900);await desktop.screenshot({path:'/tmp/intro-final-desktop.png'});console.log('PASS desktop button within portrait artwork');
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
