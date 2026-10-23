/* ═══ THE QUESTION · the writing games ══════════════════════════════════
   Ten tiles on a question mark, one game each. They follow the Challenge's
   agreement (see data/challenge/games/choose.js):

     ChallengeGames.<name> = { title, kind, skill, render(host, round, ctx), solution(round) }

   ctx.answer(ok, given) reports an attempt and returns true when the player
   may try again; the page runs the rules (lives, points, the Ring). Three of
   the ten reuse the Challenge's own games unchanged — Match, Sort it and Put
   it in order — under the names the students know: Matcher, Sorter, Puzzle.
   The rest are new and live here.

   WHAT EVERY GAME RESPECTS
   · Every item says which TASK and which PART it comes from, because the
     point is knowing where a phrase belongs, not only how it ends.
   · Typed answers forgive a slip of the finger, never a slip of grammar:
     one wrong letter in fourteen is accepted, so "hear" for "hearing" or
     "was" for "were" is still wrong.
   · A wrong answer always ends with the reason (round.note).
   ═════════════════════════════════════════════════════════════════════ */
(function(){
  const G = window.ChallengeGames = window.ChallengeGames || {};
  const PART = {intro:'Introduction', body:'Body', conclusion:'Conclusion'};
  const TASK = {essay:'Essay', review:'Review', report:'Report', email:'Email', article:'Article'};
  const tag = (task, part, reg) => `<span class="qg-tag">${PART[part]||part} · ${TASK[task]||task}${task==='email'&&reg?' · '+reg:''}</span>`;
  const norm = s => String(s||'').toLowerCase().replace(/[’‘`´]/g,"'").replace(/[“”]/g,'"')
    .replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim();
  function lev(a,b){ const m=a.length,n=b.length; if(!m) return n; if(!n) return m;
    let p=Array.from({length:n+1},(_,j)=>j);
    for(let i=1;i<=m;i++){ const c=[i]; for(let j=1;j<=n;j++) c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)); p=c; }
    return p[n]; }
  /* one slip per fourteen letters */
  const close = (typed, target) => { const a=norm(typed), b=norm(target); if(!a) return false; return lev(a,b) <= Math.floor(b.length/14); };
  const css = `
.qg-tag{display:inline-block;font-family:var(--f-mono,monospace);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-ink,#8A6440);margin:0 0 .3rem}
.qg-step{font-family:var(--f-mono,monospace);font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin:.2rem 0 .2rem}
.qg-paper{background:#fff;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.1);padding:.85rem 1rem;margin:.7rem 0;
  font-family:'Newsreader',Georgia,serif;font-size:1.04rem;line-height:1.6;color:var(--ink)}
.qg-paper p{margin:0 0 .55rem} .qg-paper p:last-child{margin:0}
.qg-paper b{font-family:var(--f-display);font-size:.94em;font-weight:700}
.qg-rows{display:flex;flex-direction:column;gap:.45rem;margin:.6rem 0}
.qg-row{display:flex;align-items:flex-start;gap:.7rem;width:100%;text-align:left;font:inherit;font-size:.95rem;line-height:1.45;color:var(--ink);
  padding:.65rem .75rem;border:1px solid var(--rule);border-radius:var(--r-box,12px);background:var(--sheet,#FEFCF9);cursor:pointer}
.qg-row .qg-n{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-family:var(--f-mono,monospace);font-size:.7rem;
  background:rgba(20,17,14,.07);color:var(--faint)}
.qg-row.qg-on{border-color:var(--ink)} .qg-row.qg-on .qg-n{background:var(--ink);color:var(--sheet,#fff)}
.qg-row.cg-ok{background:var(--right-soft);border-color:transparent} .qg-row.cg-no{background:var(--wrong-soft);border-color:transparent}
.qg-row:disabled{cursor:default}
.qg-line{background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.08);padding:.65rem .8rem;margin:0 0 .5rem;
  font-family:'Newsreader',Georgia,serif;font-size:1rem;line-height:1.55;color:var(--ink)}
.qg-line.qg-pick{outline:2px solid var(--ink)} button.qg-line{display:block;width:100%;text-align:left;border:none;cursor:pointer;font:inherit;font-family:'Newsreader',Georgia,serif}
.qg-line.cg-ok{background:var(--right-soft)} .qg-line.cg-no{background:var(--wrong-soft)}
.qg-in{width:100%;box-sizing:border-box;font:inherit;font-family:var(--f-display);font-size:1rem;padding:.6rem .8rem;border:1px solid var(--rule);
  border-radius:var(--r-box,12px);background:var(--sheet,#FEFCF9);color:var(--ink);margin-top:.35rem}
.qg-in:focus{outline:2px solid var(--accent,#8A6440);outline-offset:1px}
.qg-in.cg-ok{background:var(--right-soft);border-color:transparent} .qg-in.cg-no{background:var(--wrong-soft);border-color:transparent}
.qg-hint{font-family:var(--f-mono,monospace);font-size:.92rem;letter-spacing:.05em;color:var(--dim);word-spacing:.2em}
.qg-gap{display:inline-block;min-width:4.5em;border-bottom:2px solid var(--ink);color:var(--accent-ink);font-family:var(--f-display);font-size:.9em;font-weight:600;text-align:center}
.qg-ring{flex:none;width:3.4rem;height:3.4rem;position:relative}
.qg-ring svg{display:block;width:100%;height:100%;transform:rotate(-90deg)}
.qg-ring .c{fill:var(--ring-core,#201E1C)} .qg-ring .t{fill:none;stroke:rgba(20,17,14,.12);stroke-width:5}
.qg-ring .b{fill:none;stroke:var(--ring-sage,#8AA79C);stroke-width:5;stroke-linecap:round;transition:stroke .3s}
.qg-ring.hot .b{stroke:var(--wrong,#B4653A)}
.qg-ring span{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--f-display);font-weight:800;font-size:.95rem;color:var(--ring-ink,#E5D1B8);font-variant-numeric:tabular-nums}
.qg-top{display:flex;align-items:center;gap:.9rem;margin:.6rem 0 .2rem} .qg-top>div:not(.qg-ring){flex:1;min-width:0}
.qg-ta{width:100%;box-sizing:border-box;min-height:9.5rem;font-family:'Newsreader',Georgia,serif;font-size:1.04rem;line-height:1.6;padding:.7rem .85rem;
  border:1px solid var(--rule);border-radius:var(--r-box,12px);background:#fff;color:var(--ink);resize:vertical}
.qg-ta:focus{outline:2px solid var(--accent,#8A6440);outline-offset:1px}
.qg-checks{list-style:none;margin:.6rem 0 0;padding:0;display:flex;flex-direction:column;gap:.25rem;font-size:.9rem;color:var(--dim)}
.qg-checks li{display:flex;gap:.5rem;align-items:baseline} .qg-checks li i{font-style:normal;width:1.1rem;flex:none;color:var(--faint)}
.qg-checks li.on{color:var(--right)} .qg-checks li.on i{color:var(--right)}
.qg-chips{display:flex;flex-wrap:wrap;gap:.35rem;margin:.5rem 0 0} .qg-chips span{font-size:.82rem;padding:.3rem .6rem;border-radius:999px;background:rgba(138,167,156,.18);color:#3F5C50}
.cg-bins.qg-3{grid-template-columns:1fr}
.cg-bins.qg-3 .cg-bin{min-height:3.4rem}
.cg-bins.qg-3 .cg-bin h4{font-weight:700;color:var(--ink)}
.qg-n2{font-weight:400;color:var(--faint);margin-left:.35rem}
@media(prefers-reduced-motion:reduce){ .qg-ring .b{transition:none} }`;
  function style(){ if(document.getElementById('qg-css')) return; const s=document.createElement('style'); s.id='qg-css'; s.textContent=css; document.head.appendChild(s); }
  const RR=26, CC=2*Math.PI*RR;
  const ringHTML = id => `<div class="qg-ring" id="${id}" aria-hidden="true"><svg viewBox="0 0 64 64"><circle class="c" cx="32" cy="32" r="22"/><circle class="t" cx="32" cy="32" r="${RR}"/><circle class="b" cx="32" cy="32" r="${RR}" stroke-dasharray="${CC}" stroke-dashoffset="0"/></svg><span></span></div>`;
  function setRing(el, left, total){ if(!el) return; const f=Math.max(0,Math.min(1,left/total));
    el.querySelector('.b').setAttribute('stroke-dashoffset', String(CC*(1-f)));
    el.querySelector('span').textContent = left>=60 ? Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0') : String(Math.ceil(left));
    el.classList.toggle('hot', left<=10); }
  const lockAll = host => { host.dataset.locked='1'; host.querySelectorAll('button,input,textarea').forEach(x=>{ if(!x.classList.contains('x')) x.disabled=true; }); };

  /* the three shared games, under the board's names */
  if(G.match) G.qMatch = Object.assign({}, G.match, {title:'Matcher', skill:'receptive'});
  if(G.sort)  G.qSort  = Object.assign({}, G.sort,  {title:'Sorter', skill:'receptive',
    /* each box says how many of the six belong there: "Body (3 sentences)" —
       a hint while sorting, and the shape of the text to remember */
    render(host,r,ctx){ style(); G.sort.render(host,r,ctx); const b=host.querySelector('.cg-bins'); if(!b) return; b.classList.add('qg-3');
      b.querySelectorAll('.cg-bin').forEach(bin=>{ const k=+bin.dataset.bin, n=r.items.filter(x=>x[1]===k).length, h=bin.querySelector('h4');
        if(h) h.insertAdjacentHTML('beforeend',' <span class="qg-n2">('+n+' sentence'+(n===1?'':'s')+')</span>'); }); }});
  if(G.order) G.qPuzzle = Object.assign({}, G.order, {title:'Puzzle', skill:'productive'});

  /* ═══ PHRASE SELECTOR — three gaps, one per part, four phrases each ═══
     Every wrong option is a real phrase from another task or part, so the
     choice is about where language belongs, not about spotting nonsense. */
  G.qSelect = {
    title:'Phrase Selector', kind:'game', skill:'receptive',
    solution:r=>r.items.map(x=>x.answer).join(' · '),
    render(host,r,ctx){ style();
      let k=0;
      const draw=()=>{
        const it=r.items[k], L='ABCD';
        host.innerHTML=`<p class="qg-step">${k+1} of ${r.items.length}</p>
          <div class="qg-paper">${tag(it.task,it.part)}<br>${ctx.esc(it.prompt).replace('___','<span class="qg-gap" id="qgGap">&nbsp;</span>')}</div>
          <div class="cg-opts">${ctx.shuffle(it.options).map((o,j)=>`<button class="cg-opt" type="button" data-o="${ctx.esc(o)}"><span class="cg-l">${L[j]}</span><span>${ctx.esc(o)}</span></button>`).join('')}</div>
          <p class="cg-prompt" id="qgWhy" style="margin:.7rem 0 0"></p>`;
        host.querySelectorAll('.cg-opt').forEach(b=>b.onclick=()=>{
          if(host.dataset.locked||host.dataset.wait) return;
          const ok=b.dataset.o===it.answer;
          if(!ok){ b.classList.add('cg-no'); b.disabled=true; if(it.id) r._bad=(r._bad||[]).concat(it.id); const again=ctx.answer(false,b.dataset.o);
            if(!again){ lockAll(host); return; } return; }
          b.classList.add('cg-ok'); host.querySelector('#qgGap').textContent=it.answer;
          host.querySelector('#qgWhy').innerHTML='<b>'+ctx.esc(it.answer.replace(/[,.!?]+$/,''))+'.</b> '+ctx.esc(it.note);
          host.querySelectorAll('.cg-opt').forEach(x=>x.disabled=true);
          if(k<r.items.length-1){ host.dataset.wait='1'; const nx=document.createElement('div'); nx.className='cg-row';
            nx.innerHTML='<button class="cg-btn" type="button" id="qgNext">Next gap</button>'; host.appendChild(nx);
            host.querySelector('#qgNext').onclick=()=>{ delete host.dataset.wait; k++; draw(); }; }
          else ctx.answer(true, r.items.map(x=>x.answer).join(' · '));
        });
      };
      draw();
    }
  };

  /* ═══ SEQUENCE — the text's paragraphs, by their opening sentences ═══
     Introduction first, conclusion last; the body paragraphs in either
     order unless a linker fixes it ("On the other hand", "However",
     "To top it all off" can't come first). */
  G.qSequence = {
    title:'Sequence', kind:'game', skill:'receptive',
    solution:r=>r.lines.map((l,i)=>(i+1)+'. '+l.text).join(' '),
    render(host,r,ctx){ style();
      const order=[], idx=ctx.shuffle(r.lines.map((_,i)=>i));
      host.innerHTML=`<p class="cg-prompt">${ctx.esc(r.title)} · ${ctx.esc(r.taskLabel)}. These are the first sentences of its ${r.lines.length} paragraphs. Tap them in order, from the introduction to the conclusion.</p>
        <div class="qg-rows">${idx.map(i=>`<button class="qg-row" type="button" data-i="${i}"><span class="qg-n"></span><span>${ctx.esc(r.lines[i].text)}</span></button>`).join('')}</div>
        <div class="cg-row"><button class="cg-btn cg-ghost" type="button" id="qgClear">Clear</button><button class="cg-btn" type="button" id="qgCheck" disabled>Check</button></div>`;
      const paint=()=>{ host.querySelectorAll('.qg-row').forEach(b=>{ const p=order.indexOf(+b.dataset.i); b.classList.toggle('qg-on',p>=0); b.querySelector('.qg-n').textContent=p>=0?p+1:''; });
        host.querySelector('#qgCheck').disabled=order.length<r.lines.length; };
      host.querySelectorAll('.qg-row').forEach(b=>b.onclick=()=>{ if(host.dataset.locked||host.dataset.wait) return; const i=+b.dataset.i, p=order.indexOf(i);
        if(p>=0) order.splice(p,1); else order.push(i); paint(); });
      host.querySelector('#qgClear').onclick=()=>{ if(host.dataset.locked||host.dataset.wait) return; order.length=0; paint(); };
      host.querySelector('#qgCheck').onclick=()=>{
        if(host.dataset.locked||host.dataset.wait||order.length<r.lines.length) return;
        /* right place: the same part as the line that belongs there; a fixed body keeps its exact order */
        const good=order.map((i,pos)=>r.fixed?i===pos:r.lines[i].part===r.lines[pos].part);
        host.querySelectorAll('.qg-row').forEach(b=>{ const p=order.indexOf(+b.dataset.i); b.classList.toggle('cg-ok',good[p]); b.classList.toggle('cg-no',!good[p]); });
        const ok=good.every(Boolean), again=ctx.answer(ok, order.map(i=>r.lines[i].text.slice(0,24)+'…').join(' / '));
        if(ok||!again){ lockAll(host); return; }
        host.dataset.wait='1';
        setTimeout(()=>{ for(let p=order.length-1;p>=0;p--) if(!good[p]) order.splice(p,1);
          host.querySelectorAll('.qg-row').forEach(b=>b.classList.remove('cg-ok','cg-no')); delete host.dataset.wait; paint(); },1000);
      };
      paint();
    }
  };

  /* ═══ STORYBOARD — read it, it vanishes, bring it back ═══
     The whole model for thirty seconds; then one sentence from each part
     comes back with its key expression missing. The first word is given
     and the number of words, so it is memory for the chunk, not a guess.
     THREE READS (the teacher, 23 Oct): the text can be brought back twice
     more, thirty seconds each time, and what was typed is kept. */
  const READ=30, READS=3;
  G.qStory = {
    title:'Storyboard', kind:'game', skill:'productive',
    solution:r=>r.gaps.map(g=>g.key).join(' · '),
    render(host,r,ctx){ style();
      if(!r._reads){ r._reads=1; r._left=READ; }
      if(r._phase==='write') write(); else read();
      function bold(t,keys){ let o=ctx.esc(t); keys.forEach(k=>{ const i=norm2(o).indexOf(norm2(ctx.esc(k))); if(i>=0) o=o.slice(0,i)+'<b>'+o.slice(i,i+k.length)+'</b>'+o.slice(i+k.length); }); return o; }
      function norm2(s){ return s.toLowerCase().replace(/[’‘]/g,"'"); }
      function read(){
        r._phase='read';
        host.innerHTML=`<div class="qg-top">${ringHTML('qgRing')}<div><p class="qg-step" style="margin:0 0 .2rem">Read ${r._reads} of ${READS}</p><p class="cg-prompt" style="margin:0">${ctx.esc(r.title)} · ${ctx.esc(r.taskLabel)}. Read it closely: in ${READ} seconds it disappears, and you bring back the bold phrases.</p></div></div>
          <div class="qg-paper">${r.paras.map(p=>'<p>'+bold(p.text,p.keys)+'</p>').join('')}</div>
          <div class="cg-row"><button class="cg-btn" type="button" id="qgReady">I’m ready</button></div>`;
        let last=performance.now();
        const tick=setInterval(()=>{ if(!host.isConnected){ clearInterval(tick); return; }
          const now=performance.now(); r._left-=(now-last)/1000; last=now; setRing(host.querySelector('#qgRing'),r._left,READ);
          if(r._left<=0){ clearInterval(tick); write(); } },200);
        setRing(host.querySelector('#qgRing'),r._left,READ);
        host.querySelector('#qgReady').onclick=()=>{ clearInterval(tick); write(); };
      }
      function write(){
        r._phase='write';
        const left=READS-r._reads, good0=r._good||[];
        host.innerHTML=`<p class="cg-prompt">Bring back the missing phrases. The first word and the number of words are given.</p>
          ${r.gaps.map((g,j)=>{ const w=g.key.split(/\s+/); return `<div class="qg-line">${tag(r.task,g.part,r.reg)}<br>${ctx.esc(g.before)}<span class="qg-gap">${ctx.esc(w[0])} … (${w.length} words)</span>${ctx.esc(g.after)}
            <input class="qg-in" data-j="${j}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Missing phrase ${j+1}" placeholder="${ctx.esc(w[0])} …"></div>`; }).join('')}
          <div class="cg-row"><button class="cg-btn" type="button" id="qgCheck">Check</button>${left>0?`<button class="cg-btn cg-ghost" type="button" id="qgAgain">Read again · ${left} left</button>`:''}</div>`;
        const ins=[...host.querySelectorAll('.qg-in')];
        (r._typed||[]).forEach((v,j)=>{ if(ins[j]) ins[j].value=v; });
        good0.forEach((g,j)=>{ if(g&&ins[j]){ ins[j].classList.add('cg-ok'); ins[j].disabled=true; } });
        ins.forEach(i=>i.addEventListener('input',()=>{ r._typed=ins.map(x=>x.value); }));
        const again=host.querySelector('#qgAgain');
        if(again) again.onclick=()=>{ if(host.dataset.locked) return; r._typed=ins.map(x=>x.value); r._reads++; r._left=READ; read(); };
        host.querySelector('#qgCheck').onclick=()=>{
          if(host.dataset.locked||ins.some(i=>!i.value.trim())) return;
          const good=ins.map((i,j)=>i.disabled||close(i.value,r.gaps[j].key)); r._good=good; r._typed=ins.map(x=>x.value);
          ins.forEach((i,j)=>{ i.classList.toggle('cg-ok',good[j]); i.classList.toggle('cg-no',!good[j]); if(good[j]) i.disabled=true; });
          const ok=good.every(Boolean), retry=ctx.answer(ok, ins.map(i=>i.value.trim()).join(' · '));
          if(ok||!retry){ ins.forEach((i,j)=>{ if(!good[j]) i.value=r.gaps[j].key; }); lockAll(host); }
        };
        setTimeout(()=>{ const f=ins.find(i=>!i.disabled); if(f) f.focus(); },300);
      }
    }
  };

  /* ═══ BUILDER — a body paragraph from its moves ═══
     The topic sentence is given; the student adds the REASON, then an
     EXAMPLE, then the RESULT, each time choosing from the lines left — one
     of which belongs in another text altogether. */
  const MOVES=[['reason','the reason'],['example','an example'],['result','the result']];
  G.qBuilder = {
    title:'Builder', kind:'game', skill:'receptive',
    solution:r=>[r.b.topic,r.b.reason,r.b.example,r.b.result].join(' '),
    render(host,r,ctx){ style();
      let k=0; const pool=ctx.shuffle(['reason','example','result','decoy']);
      const draw=()=>{
        const want=MOVES[k];
        host.innerHTML=`<p class="cg-prompt">${ctx.esc(r.title)} · ${ctx.esc(r.taskLabel)}. Build the body paragraph: the topic sentence is there — add <b>${want[1]}</b>.</p>
          <div class="qg-paper">${tag(r.task,'body',r.reg)}<br>${ctx.esc(r.b.topic)} ${MOVES.slice(0,k).map(m=>'<b style="font-family:inherit;font-weight:400;background:rgba(138,167,156,.22)">'+ctx.esc(r.b[m[0]])+'</b>').join(' ')} <span class="qg-gap">${want[0]}</span></div>
          <p class="qg-step">Step ${k+1} of 3 · ${want[0]}</p>
          <div class="qg-rows">${pool.filter(p=>!MOVES.slice(0,k).some(m=>m[0]===p)).map(p=>`<button class="qg-row" type="button" data-p="${p}"><span>${ctx.esc(r.b[p])}</span></button>`).join('')}</div>`;
        host.querySelectorAll('.qg-row').forEach(b=>b.onclick=()=>{
          if(host.dataset.locked) return;
          if(b.dataset.p!==want[0]){ b.classList.add('cg-no'); b.disabled=true; if(!ctx.answer(false,r.b[b.dataset.p])) lockAll(host); return; }
          b.classList.add('cg-ok'); k++;
          if(k<MOVES.length) setTimeout(draw,450);
          else { host.querySelector('.qg-gap').outerHTML='<b style="font-family:inherit;font-weight:400;background:rgba(138,167,156,.22)">'+ctx.esc(r.b.result)+'</b>'; ctx.answer(true,'built'); lockAll(host); }
        });
      };
      draw();
    }
  };

  /* ═══ FIX IT — one broken word in every part ═══
     Three lines — introduction, body, conclusion — and each hides one
     mistake (the teacher, 23 Oct: "every paragraph gets a word to fix").
     The student finds it and types the corrected words under the line.
     Lines already fixed stay fixed after a wrong Check. */
  G.qFix = {
    title:'Fix It', kind:'game', skill:'productive',
    solution:r=>r.errs.map(e=>e.sentence.replace(e.bad,e.fix)).join(' · '),
    render(host,r,ctx){ style();
      host.innerHTML=`<p class="cg-prompt">Each line has one mistake. Type the corrected words under it.</p>
        ${r.errs.map((e,j)=>`<div class="qg-line">${tag(e.task,e.part)}<br><span class="qg-s" data-j="${j}">${ctx.esc(e.sentence)}</span>
          <input class="qg-in" data-j="${j}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="The corrected words" aria-label="Correction for line ${j+1}"></div>`).join('')}
        <div class="cg-row"><button class="cg-btn" type="button" id="qgCheck">Check</button></div>`;
      const ins=[...host.querySelectorAll('.qg-in')];
      const fixedOK=(e,v)=>{ const t=norm(v); return !!t && t.indexOf(norm(e.need||e.fix))>=0 && norm(e.sentence.replace(e.bad,e.fix)).indexOf(t)>=0; };
      const show=j=>{ const e=r.errs[j], sp=host.querySelector('.qg-s[data-j="'+j+'"]');
        sp.innerHTML=ctx.esc(e.sentence).replace(ctx.esc(e.bad),'<s style="color:var(--wrong)">'+ctx.esc(e.bad)+'</s> <b style="color:var(--right)">'+ctx.esc(e.fix)+'</b>'); };
      const go=()=>{
        if(host.dataset.locked||ins.some(i=>!i.disabled&&!i.value.trim())) return;
        const good=ins.map((i,j)=>i.disabled||fixedOK(r.errs[j],i.value));
        ins.forEach((i,j)=>{ i.classList.toggle('cg-ok',good[j]); i.classList.toggle('cg-no',!good[j]); if(good[j]&&!i.disabled){ i.disabled=true; show(j); } });
        const ok=good.every(Boolean);
        if(!ok&&r.ids) r._bad=(r._bad||[]).concat(r.ids.filter((id,j)=>!good[j]));
        const again=ctx.answer(ok, ins.map(i=>i.value.trim()).join(' · '));
        if(ok||!again){ r.errs.forEach((e,j)=>show(j)); lockAll(host); return; }
        const f=ins.find(i=>!i.disabled); if(f) f.select();
      };
      host.querySelector('#qgCheck').onclick=go;
      ins.forEach((i,j)=>i.addEventListener('keydown',e=>{ if(e.key!=='Enter') return; const n=ins.slice(j+1).find(x=>!x.disabled); n?n.focus():go(); }));
      setTimeout(()=>{ if(ins[0]) ins[0].focus(); },300);
    }
  };

  /* ═══ RECALL — three phrases from memory, one per part ═══
     Only the first letter of each word is left. Phrases missed anywhere on
     the board come back here first, next time.
     THREE PEEKS (the teacher, 23 Oct): "Peek" shows the full phrases for
     five seconds, three times at most. Typing is paused while they show,
     so a peek is for remembering, not copying. */
  const letters = s => s.split(/\s+/).map(w=>{ const m=w.match(/^([^A-Za-z]*)([A-Za-z])([A-Za-z'’]*)([^A-Za-z]*)$/); return m?m[1]+m[2]+'_'.repeat(m[3].length)+m[4]:w; }).join(' ');
  G.qRecall = {
    title:'Recall', kind:'game', skill:'productive',
    solution:r=>r.items.map(x=>x.rc).join(' · '),
    render(host,r,ctx){ style();
      host.innerHTML=`<p class="cg-prompt">Only the first letters are left. Type each phrase in full.</p>
        ${r.items.map((x,j)=>`<div class="qg-line">${tag(x.task,x.part,x.reg)}<div class="qg-hint">${ctx.esc(letters(x.rc))}</div>
          <input class="qg-in" data-j="${j}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Phrase ${j+1}"></div>`).join('')}
        <div class="cg-row"><button class="cg-btn" type="button" id="qgCheck">Check</button><button class="cg-btn cg-ghost" type="button" id="qgPeek"></button></div>`;
      const ins=[...host.querySelectorAll('.qg-in')], hints=[...host.querySelectorAll('.qg-hint')], peekB=host.querySelector('#qgPeek');
      const PEEKS=3, PEEK=5; if(r._peeks==null) r._peeks=PEEKS;
      let peeking=false;
      const label=()=>{ peekB.textContent='Peek · '+r._peeks+' left'; peekB.disabled=r._peeks<=0; if(r._peeks<=0) peekB.hidden=true; };
      label();
      peekB.onclick=()=>{
        if(host.dataset.locked||peeking||r._peeks<=0) return;
        r._peeks--; peeking=true; const was=ins.map(i=>i.disabled);
        hints.forEach((h,j)=>{ if(!was[j]){ h.textContent=r.items[j].rc; h.style.color='var(--ink)'; } }); ins.forEach(i=>i.disabled=true);
        host.querySelector('#qgCheck').disabled=true;
        let left=PEEK; peekB.disabled=true; peekB.textContent='Look · '+left;
        const t=setInterval(()=>{ left--; if(left>0&&host.isConnected){ peekB.textContent='Look · '+left; return; }
          clearInterval(t); peeking=false; if(!host.isConnected) return;
          hints.forEach((h,j)=>{ h.textContent=letters(r.items[j].rc); h.style.color=''; });
          if(!host.dataset.locked){ ins.forEach((i,j)=>i.disabled=was[j]); host.querySelector('#qgCheck').disabled=false; const f=ins.find(i=>!i.disabled); if(f) f.focus(); }
          label(); },1000);
      };
      host.querySelector('#qgCheck').onclick=()=>{
        if(host.dataset.locked||peeking||ins.some(i=>!i.value.trim()&&!i.disabled)) return;
        const good=ins.map((i,j)=>i.disabled||close(i.value,r.items[j].rc));
        ins.forEach((i,j)=>{ i.classList.toggle('cg-ok',good[j]); i.classList.toggle('cg-no',!good[j]); if(good[j]) i.disabled=true; });
        const ok=good.every(Boolean);
        if(!ok&&r.ids) r._bad=(r._bad||[]).concat(r.ids.filter((id,j)=>!good[j]));   /* only the phrases actually missed go to the Ring */
        const again=ctx.answer(ok, ins.map(i=>i.value.trim()).join(' · '));
        if(ok||!again){ ins.forEach((i,j)=>{ if(!good[j]) i.value=r.items[j].rc; }); lockAll(host); peekB.hidden=true; }
      };
      setTimeout(()=>{ if(ins[0]) ins[0].focus(); },300);
    }
  };

  /* ═══ CLOCK & DEFUSE — the finale ═══
     Forty seconds to study one body paragraph of a model. Then the fuse:
     three minutes to write YOUR OWN paragraph on your own subject, with the
     same key expressions. It is defused when every expression is there, it
     has 35 words or more, and at least ten of them are your own (not in the
     model). If the fuse burns out it costs a life and relights for ninety
     seconds, with the text kept. Closing the card pauses the clock. */
  const STUDY=40, FUSE=180, RELIGHT=90;
  G.qFinale = {
    title:'Clock & Defuse', kind:'game', skill:'productive',
    solution:r=>'Your own paragraph with: '+r.keys.join(' · '),
    render(host,r,ctx){ style();
      if(!r._phase){ r._phase='study'; r._left=STUDY; r._total=STUDY; }
      if(r._phase==='study') study(); else write();
      function bold(t){ let o=ctx.esc(t); r.keys.forEach(k=>{ const lo=o.toLowerCase().replace(/[’‘]/g,"'"), i=lo.indexOf(ctx.esc(k).toLowerCase().replace(/[’‘]/g,"'")); if(i>=0) o=o.slice(0,i)+'<b>'+o.slice(i,i+k.length)+'</b>'+o.slice(i+k.length); }); return o; }
      function loop(onEnd){ let last=performance.now();
        const t=setInterval(()=>{ if(!host.isConnected||host.dataset.locked){ clearInterval(t); return; }
          const now=performance.now(); r._left-=(now-last)/1000; last=now; setRing(host.querySelector('#qgRing'),r._left,r._total);
          if(r._left<=0){ clearInterval(t); onEnd(); } },200);
        setRing(host.querySelector('#qgRing'),r._left,r._total); return t; }
      function study(){
        host.innerHTML=`<div class="qg-top">${ringHTML('qgRing')}<div><p class="cg-prompt" style="margin:0"><b>Study.</b> ${ctx.esc(r.title)} · ${ctx.esc(r.taskLabel)}. Learn the bold expressions — in ${STUDY} seconds the fuse is lit.</p></div></div>
          <div class="qg-paper">${tag(r.task,'body',r.reg)}<br>${bold(r.para)}</div>
          <div class="cg-row"><button class="cg-btn" type="button" id="qgGo">Light the fuse</button></div>`;
        const t=loop(()=>light(FUSE));
        host.querySelector('#qgGo').onclick=()=>{ clearInterval(t); light(FUSE); };
      }
      function light(sec){ r._phase='write'; r._left=sec; r._total=sec; write(); }
      function write(){
        /* the shortest start that tells each expression apart: "I would be …" and "I would also …", never "I would …" twice */
        const W2=r.keys.map(k=>k.split(/\s+/));
        const starters=W2.map((w,j)=>{ let n=Math.min(2,w.length-1)||1; while(n<w.length-1&&W2.some((o,q)=>q!==j&&o.slice(0,n).join(' ').toLowerCase()===w.slice(0,n).join(' ').toLowerCase())) n++; return w.slice(0,n).join(' ')+' …'; });
        host.innerHTML=`<div class="qg-top">${ringHTML('qgRing')}<div><p class="cg-prompt" style="margin:0"><b>Defuse it.</b> ${ctx.esc(r.own)}</p></div></div>
          <div class="qg-chips" aria-label="Starters">${starters.map(s=>'<span>'+ctx.esc(s)+'</span>').join('')}</div>
          <textarea class="qg-ta" id="qgTa" aria-label="Your paragraph" placeholder="Write your paragraph here…"></textarea>
          <ul class="qg-checks" id="qgChecks"></ul>
          <div class="cg-row"><button class="cg-btn" type="button" id="qgDefuse" disabled>Defuse</button></div>`;
        const ta=host.querySelector('#qgTa'); ta.value=r._text||'';
        const model=new Set(norm(r.para).split(' '));
        const state=()=>{ const v=norm(ta.value), words=v?v.split(' '):[];
          const has=r.keys.map(k=>v.indexOf(norm(k))>=0), own=words.filter(w=>!model.has(w)).length;
          const list=r.keys.map((k,j)=>[has[j],'“'+k+'”']).concat([[words.length>=35,'35 words or more · '+words.length],[own>=10,'Ten words of your own · '+Math.min(own,10)+' of 10']]);
          host.querySelector('#qgChecks').innerHTML=list.map(([on,t])=>`<li class="${on?'on':''}"><i>${on?'✓':'○'}</i>${ctx.esc(t)}</li>`).join('');
          const ready=list.every(x=>x[0]); host.querySelector('#qgDefuse').disabled=!ready; return ready; };
        ta.addEventListener('input',()=>{ r._text=ta.value; state(); });
        state(); setTimeout(()=>ta.focus(),300);
        const t=loop(()=>{ const again=ctx.answer(false,'(the fuse burnt out)'); if(again){ light(RELIGHT); } else lockAll(host); });
        host.querySelector('#qgDefuse').onclick=()=>{ if(host.dataset.locked||!state()) return; clearInterval(t); ctx.answer(true,ta.value.trim()); lockAll(host);
          const rg=host.querySelector('#qgRing'); if(rg) rg.querySelector('span').textContent='✓'; };
      }
    }
  };
  G.__qnorm = norm; G.__qclose = close;     /* for the page's automated checks */
})();
