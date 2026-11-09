/* ═══ CHALLENGE EXAM · PUT IT IN ORDER ══════════════════════════════════
   Words in a jumble, tapped into the right order.
   Round: { prompt, words: ["The","bridge","was","built","in","1998."], note }
          unit:'sentences' → a paragraph rebuilt from its sentences
          hide:true        → the linking words are hidden until it is solved
   Agreement: see choose.js.

   9 Nov 2026 — from watching the class play it on their phones:
   · SENTENCES are cards, left-aligned, dark and full width, placed into
     numbered slots, so a long sentence reads as a sentence and the student
     sees how many are still to place. Centred grey pills were hard to read.
   · TAP A PLACED ONE to send it back, not only Undo the last.
   · A SECOND GO KEEPS WHAT WAS RIGHT: the run of sentences (or words) that
     were already in place stays; only the rest go back. "The first 2 are in
     place" says how close it was.
   · HIDE: with the linkers on show, This is because → For example → As a
     result can be solved without reading. A hide round strips the linker
     from every sentence but the first, so the order has to come from the
     meaning — and the linkers come back, caramel, the moment it is solved.
   · SOLVED, the paragraph is shown whole, in order, linkers lit: that is
     the thing to remember, not the tapping.
   ═══════════════════════════════════════════════════════════════════════ */
(window.ChallengeGames=window.ChallengeGames||{}).order={
  title:'Put it in order', kind:'exam', skill:'productive',
  solution:r=>r.words.join(' '),
  render(host,r,ctx){
    const S=r.unit==='sentences', N=r.words.length, seq=[];
    const LK=/^(This is because|This happens because|The reason (?:for this )?is that|For example,|For instance,|To illustrate,|In particular,|As a result,|Consequently,|Therefore,|Thus,|Hence,|As a consequence,|On the other hand,|However,|Nevertheless,|In addition,|Moreover,|Furthermore,|What is more,|Besides,|Similarly,|Likewise,|In other words,|To sum up,|In conclusion,|Overall,)\s*/;
    const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
    const hide=S&&r.hide;
    const shown=k=>{ const w=r.words[k]; if(!hide||k===0) return w; const m=w.match(LK); return m?cap(w.slice(m[0].length)):w; };
    const lit=w=>{ const m=w.match(LK); return m?'<b class="cg-lk">'+ctx.esc(m[1])+'</b> '+ctx.esc(w.slice(m[0].length)):ctx.esc(w); };
    const tell=hide?' The linking words are hidden: read for the meaning.':'';
    host.innerHTML=`<p class="cg-prompt" id="cgAsk">${ctx.esc(r.prompt||'Build the sentence.')} Tap the ${S?'sentences':'words'} in order.${tell}</p>
      <div class="${S?'cg-slots':'cg-built'}" id="cgBuilt"></div><p class="cg-near" id="cgNear" aria-live="polite"></p>
      <div class="${S?'cg-cards':'cg-chips'}" id="cgPool">${ctx.shuffle(r.words.map((w,k)=>({k}))).map(o=>`<button class="${S?'cg-card':'cg-chip'}" type="button" data-k="${o.k}">${ctx.esc(shown(o.k))}</button>`).join('')}</div>
      <div class="cg-row" id="cgRow"><button class="cg-btn cg-ghost" type="button" id="cgUndo">Undo</button><button class="cg-btn" type="button" id="cgCheck" disabled>Check</button></div>`;
    const built=host.querySelector('#cgBuilt'), pool=host.querySelector('#cgPool'), near=host.querySelector('#cgNear'), chk=host.querySelector('#cgCheck');
    const back=k=>{ const c=pool.querySelector(`[data-k="${k}"]`); if(c) c.classList.remove('cg-used'); };
    function draw(){
      if(S){
        let h=''; for(let i=0;i<N;i++){ const k=seq[i];
          h+=k==null?`<div class="cg-slot cg-empty"><span class="cg-n">${i+1}</span></div>`
            :`<button type="button" class="cg-slot" data-at="${i}" aria-label="Sentence ${i+1}: tap to send it back"><span class="cg-n">${i+1}</span><span>${ctx.esc(shown(k))}</span></button>`; }
        built.innerHTML=h;
      } else built.innerHTML=seq.map((k,i)=>`<button type="button" class="cg-chip" data-at="${i}">${ctx.esc(r.words[k])}</button>`).join('');
      built.querySelectorAll('[data-at]').forEach(b=>b.onclick=()=>{ if(host.dataset.locked) return; const k=seq.splice(+b.dataset.at,1)[0]; back(k); near.textContent=''; draw(); });
      chk.disabled=seq.length<N;
    }
    pool.querySelectorAll('[data-k]').forEach(c=>c.onclick=()=>{ if(host.dataset.locked||c.classList.contains('cg-used')) return; seq.push(+c.dataset.k); c.classList.add('cg-used'); near.textContent=''; draw();
      if(S&&seq.length<N) { const nx=built.querySelector('.cg-empty'); if(nx&&nx.scrollIntoView) try{ nx.scrollIntoView({block:'nearest',behavior:'smooth'}); }catch(e){} } });
    host.querySelector('#cgUndo').onclick=()=>{ if(host.dataset.locked||!seq.length) return; back(seq.pop()); near.textContent=''; draw(); };
    /* the right paragraph, whole, linkers lit — after a solve or after the last try */
    function reveal(){
      host.querySelector('#cgRow').remove(); pool.remove(); near.textContent='';
      if(S) host.querySelector('#cgAsk').textContent=hide?'The paragraph, with its linking words back:':'The paragraph in order:';
      if(S){ built.className='cg-slots cg-solved'; built.innerHTML=r.words.map((w,i)=>`<div class="cg-slot"><span class="cg-n">${i+1}</span><span>${lit(w)}</span></div>`).join(''); }
    }
    chk.onclick=()=>{
      if(host.dataset.locked||seq.length<N) return;
      const given=seq.map(k=>r.words[k]).join(' '), ok=given===r.words.join(' ');
      const again=ctx.answer(ok,given);
      if(!again){ host.dataset.locked='1'; reveal(); return; }
      built.classList.add('cg-shake'); setTimeout(()=>built.classList.remove('cg-shake'),450);
      /* keep the run that is already in place; send the rest back */
      let p=0; while(p<N&&r.words[seq[p]]===r.words[p]) p++;
      seq.splice(p).forEach(back); draw();
      near.textContent=p?(S?(p===1?'The first sentence is in place.':'The first '+p+' are in place.'):'The first '+p+' word'+(p===1?' is':'s are')+' right.'):(S?'Start again from the first sentence.':'');
    };
    draw();
  }
};
