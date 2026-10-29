/* ═══════════════════════════════════════════════════════════════════════
   REVIEW OPENING — one rule for joining a hook to its hinge (29 Oct 2026)

   A review's first line is HOOK + HINGE + "…". + AIM, e.g.
     "Choosing a … can be a real challenge. [Name], released in …, … ."
   How the hinge joins depends on the hook:
     · the hook NAMES the thing ([Name], or two "…" slots, the second being
       the name) → it ends its own sentence and the hinge gets "it":
       "Are you on the lookout for a …? If so, [Name] could be exactly what
        you need. Released in …, it … ."
     · the hook ends on a slot ("By far one of the best … is …")  → ", hinge"
     · otherwise the hinge needs its subject → "[Name], hinge"
   Since 29 Oct the cards use the sheet itself: background = column A
   (Catch the reader), hinge = column B (Introduce it) — whole sentences,
   so no gap follows. Used by the Model cards, the Model Generator and the slide galleries, so
   they can never disagree again.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const SLOT=/\.\.\.|…/g;
  const named=bg=>/\[Name\]/.test(bg)||((bg.match(SLOT)||[]).length>=2);
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  /* → {lead, mid}: lead is the hook as it should be printed, mid the text
     that follows it, up to the "…" the student completes. */
  const whole=h=>/^[A-Z\[]/.test(h)&&/[.?!]$/.test(h);   /* column B of the sheet: a full sentence */
  function parts(bg,hinge){
    bg=String(bg||'').trim(); hinge=String(hinge||'').trim();
    if(whole(hinge)){ let lead=bg; if(/(\.\.\.|…)$/.test(lead)||!/[.?!]$/.test(lead)) lead+='.';
      return {lead, mid:hinge, named:true, gap:false}; }
    if(named(bg)){
      let lead=bg.replace(/\s*,\s*$/,'');
      if(/(\.\.\.|…)$/.test(lead)||!/[.?!]$/.test(lead)) lead+='.';   /* "… is …" still needs its full stop */
      return {lead, mid:cap(hinge.replace(/\s*,\s*$/,''))+', it', named:true, gap:true};
    }
    if(/(\.\.\.|…)\s*$/.test(bg)) return {lead:bg+',', mid:hinge, named:false, gap:true};
    return {lead:bg, mid:'[Name], '+hinge, named:false, gap:true};
  }
  window.ReviewOpen={parts, named};
})();
