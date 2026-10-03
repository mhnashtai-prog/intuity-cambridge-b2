/* Exam traps: batch 2. Drafted from exam-style sources and general knowledge, not a verified frequency list. Load after hotlist.js. */
(function(){
const h=window.HOT_DATA=window.HOT_DATA||{affixes:{},mark:[],nodes:[]};
Object.assign(h.affixes,{
 "-ency":{"meaning":"the state of","tip":"Often follows -ent adjectives: transparent, transparency."},
 "-ry":{"meaning":"the state or behaviour of","tip":"Keep the whole base: rival, rivalry."}
});
h.nodes.push(
{"base":"operate","pos":"verb","level":"B2","topic":"tech","forms":[
 {"w":"operation","cls":"noun","type":"suffix","affix":"-ion","strength":"strong","rule":"drop-e","gloss":"a medical procedure, or the way something works","ex":"She had an operation on her knee.","teen":"The operation of the machine is simple.","alts":["-ment","-ance","-ity"]},
 {"w":"operator","cls":"noun","type":"suffix","affix":"-or","strength":"medium","rule":"drop-e","gloss":"a person who works a machine or system","ex":"The operator connected the call.","teen":"The ride operator checked every seat belt.","alts":["-er","-ist","-ant"]}],
 "avoid":[{"w":"opperation","for":"operation","why":"Spelling. One p, as in operate."},{"w":"operater","for":"operator","why":"Wrong. This noun ends in -or."}]},
{"base":"recognise","pos":"verb","level":"C1","topic":"society","forms":[
 {"w":"recognition","cls":"noun","type":"suffix","affix":"-ition","strength":"strong","rule":"stem-change","gloss":"praise for what someone has done","ex":"The firefighter received public recognition.","teen":"Her work finally got some recognition.","alts":["-ation","-ion","-ment"]},
 {"w":"unrecognisable","cls":"adjective","type":"prefix","affix":"un-","strength":"strong","gloss":"so changed that nobody knows it","ex":"After the storm the beach was unrecognisable.","teen":"With the costume on, my dad was unrecognisable.","alts":["in-","dis-","ir-"]}],
 "avoid":[{"w":"recognision","for":"recognition","why":"Wrong. The noun ends in -ition."},{"w":"irrecognisable","for":"unrecognisable","why":"Wrong. recognisable takes un-."}]},
{"base":"occupy","pos":"verb","level":"C1","topic":"society","forms":[
 {"w":"occupation","cls":"noun","type":"suffix","affix":"-ation","strength":"strong","gloss":"a job, or the act of living in a place","ex":"Please state your occupation on the form.","teen":"My aunt's occupation is nursing.","alts":["-ion","-ment","-ance"]}],
 "avoid":[{"w":"ocupation","for":"occupation","why":"Spelling. Keep both c: occupy + ation."},{"w":"occupasion","for":"occupation","why":"Wrong. The noun ends in -ation."}]},
{"base":"law","pos":"noun","level":"B2","topic":"society","forms":[
 {"w":"unlawful","cls":"adjective","type":"prefix","affix":"un-","strength":"strong","gloss":"against the law","ex":"It is unlawful to park here.","teen":"Copying a film and selling it is unlawful.","alts":["in-","il-","dis-"]}],
 "avoid":[{"w":"inlawful","for":"unlawful","why":"Wrong. law + ful takes un-."},{"w":"unlawfull","for":"unlawful","why":"Spelling. -ful has one l."}]},
{"base":"similar","pos":"adjective","level":"B2","topic":"general","forms":[
 {"w":"dissimilar","cls":"adjective","type":"prefix","affix":"dis-","strength":"strong","rule":"keep-both","gloss":"not alike","ex":"The two sisters are surprisingly dissimilar.","teen":"Our tastes in music are completely dissimilar.","alts":["un-","in-","im-"]}],
 "avoid":[{"w":"unsimilar","for":"dissimilar","why":"Wrong. similar takes dis-."},{"w":"disimilar","for":"dissimilar","why":"Spelling. Keep both s: dis + similar."}]},
{"base":"transparent","pos":"adjective","level":"C1","topic":"society","forms":[
 {"w":"transparency","cls":"noun","type":"suffix","affix":"-ency","strength":"strong","rule":"stem-change","gloss":"being open and honest, or easy to see through","ex":"The council promised more transparency.","teen":"The transparency of the glass lets in lots of light.","alts":["-ence","-ity","-ment"]}],
 "avoid":[{"w":"transparancy","for":"transparency","why":"Wrong. This noun ends in -ency."},{"w":"transparentcy","for":"transparency","why":"Wrong. The t is dropped: transparent becomes transparency."}]},
{"base":"discreet","pos":"adjective","level":"C1","topic":"society","forms":[
 {"w":"discretion","cls":"noun","type":"suffix","affix":"-ion","strength":"strong","rule":"stem-change","gloss":"being careful not to share private matters","ex":"The manager handled the matter with great discretion.","teen":"Thanks for your discretion; I did not want everyone to know.","alts":["-ity","-ment","-ance"]}],
 "avoid":[{"w":"discreetion","for":"discretion","why":"Spelling. discreet becomes discretion, with one e."},{"w":"discreetness","for":"discretion","why":"Not natural. The noun is discretion."}]},
{"base":"rival","pos":"noun","level":"C1","topic":"sport","forms":[
 {"w":"rivalry","cls":"noun","type":"suffix","affix":"-ry","strength":"strong","gloss":"competition between people or teams","ex":"There is fierce rivalry between the two clubs.","teen":"The rivalry between our schools is friendly.","alts":["-ity","-ness","-ment"]}],
 "avoid":[{"w":"rivalery","for":"rivalry","why":"Spelling. rival + ry, with no e."},{"w":"rivaly","for":"rivalry","why":"Spelling. The noun ends in -ry."}]},
{"base":"avoid","pos":"verb","level":"C1","topic":"general","forms":[
 {"w":"avoidance","cls":"noun","type":"suffix","affix":"-ance","strength":"strong","gloss":"keeping away from something","ex":"His avoidance of difficult questions annoyed us.","teen":"My avoidance of spiders is well known.","alts":["-ence","-ity","-ment"]}],
 "avoid":[{"w":"avoidence","for":"avoidance","why":"Wrong. This noun ends in -ance."},{"w":"avoidment","for":"avoidance","why":"Wrong. The noun is avoidance."}]},
{"base":"adapt","pos":"verb","level":"C1","topic":"general","forms":[
 {"w":"adaptable","cls":"adjective","type":"suffix","affix":"-able","strength":"strong","gloss":"able to change to suit new situations","ex":"She is adaptable and learns new roles quickly.","teen":"Cats are adaptable animals.","alts":["-ible","-ful","-ous"]},
 {"w":"adaptation","cls":"noun","type":"suffix","affix":"-ation","strength":"medium","gloss":"a change made to suit something, or a version of a book or play","ex":"The film is an adaptation of a novel.","teen":"My brother's adaptation to school took a month.","alts":["-ion","-ment","-ance"]}],
 "avoid":[{"w":"adaptible","for":"adaptable","why":"Spelling. This one ends in -able."},{"w":"adaption","for":"adaptation","why":"Rare. Use adaptation for the noun."}]},
{"base":"notice","pos":"verb","level":"B2","topic":"general","forms":[
 {"w":"noticeable","cls":"adjective","type":"suffix","affix":"-able","strength":"strong","rule":"keep-e","gloss":"easy to see or notice","ex":"There was a noticeable change in her mood.","teen":"The scratch on my phone is very noticeable.","alts":["-ible","-ful","-ous"]}],
 "avoid":[{"w":"noticable","for":"noticeable","why":"Spelling. Keep the e after c: noticeable."},{"w":"noticeible","for":"noticeable","why":"Spelling. This one ends in -able."}]},
{"base":"outrage","pos":"noun","level":"C1","topic":"society","forms":[
 {"w":"outrageous","cls":"adjective","type":"suffix","affix":"-eous","strength":"strong","rule":"keep-e","gloss":"shocking or very unreasonable","ex":"His behaviour was outrageous.","teen":"The price of that sandwich is outrageous.","alts":["-ous","-ious","-ful"]}],
 "avoid":[{"w":"outragous","for":"outrageous","why":"Spelling. Keep the e after g: outrageous."},{"w":"outragious","for":"outrageous","why":"Wrong. The ending is -eous."}]},
{"base":"inspire","pos":"verb","level":"B2","topic":"feelings","forms":[
 {"w":"inspiration","cls":"noun","type":"suffix","affix":"-ation","strength":"strong","rule":"drop-e","gloss":"something that gives you ideas or energy","ex":"The mountains were her inspiration.","teen":"My teacher is my biggest inspiration.","alts":["-ion","-ment","-ance"]}],
 "avoid":[{"w":"inspireation","for":"inspiration","why":"Wrong. Drop the e of inspire."},{"w":"inspirasion","for":"inspiration","why":"Wrong. The noun ends in -ation."}]},
{"base":"desire","pos":"noun","level":"C1","topic":"feelings","forms":[
 {"w":"desirable","cls":"adjective","type":"suffix","affix":"-able","strength":"strong","rule":"drop-e","gloss":"worth having","ex":"A garden is a desirable feature in a house.","teen":"A bigger screen is desirable for gaming.","alts":["-ible","-ful","-ous"]}],
 "avoid":[{"w":"desireable","for":"desirable","why":"Spelling. Drop the e of desire: desirable."},{"w":"desirible","for":"desirable","why":"Spelling. This one ends in -able."}]},
{"base":"believe","pos":"verb","level":"B2","topic":"feelings","forms":[
 {"w":"unbelievable","cls":"adjective","type":"prefix","affix":"un-","strength":"strong","gloss":"very hard to believe, or amazing","ex":"The view from the top was unbelievable.","teen":"The score in that match was unbelievable.","alts":["in-","dis-","im-"]}],
 "avoid":[{"w":"inbelievable","for":"unbelievable","why":"Wrong. believable takes un-."},{"w":"unbeleivable","for":"unbelievable","why":"Spelling. i before e after l: believe."}]}
);
})();
