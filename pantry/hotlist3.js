/* Exam traps: batch 3. Drafted from exam-style sources and general knowledge, not a verified frequency list. Load after hotlist.js. */
(function(){
const h=window.HOT_DATA=window.HOT_DATA||{affixes:{},mark:[],nodes:[]};
Object.assign(h.affixes,{
 "-etic":{"meaning":"full of, to do with","tip":"energy becomes energetic. The y changes shape."},
 "-ular":{"meaning":"having the quality of","tip":"spectacle becomes spectacular. Only one l."}
});
h.nodes.push(
{"base":"energy","pos":"noun","level":"B2","topic":"sport","forms":[
 {"w":"energetic","cls":"adjective","type":"suffix","affix":"-etic","strength":"strong","rule":"stem-change","gloss":"full of energy","ex":"She gave an energetic performance.","teen":"My little cousin is incredibly energetic.","alts":["-ic","-ive","-ous"]}],
 "avoid":[{"w":"energic","for":"energetic","why":"Wrong. energy becomes energetic."},{"w":"energtic","for":"energetic","why":"Spelling. Keep the e before the t: energetic."}]},
{"base":"spectacle","pos":"noun","level":"B2","topic":"general","forms":[
 {"w":"spectacular","cls":"adjective","type":"suffix","affix":"-ular","strength":"strong","rule":"stem-change","gloss":"very impressive to look at","ex":"The fireworks were a spectacular sight.","teen":"The view from the cliff was spectacular.","alts":["-ous","-ive","-ful"]}],
 "avoid":[{"w":"spectaclar","for":"spectacular","why":"Wrong. The adjective ends in -ular."},{"w":"spectacullar","for":"spectacular","why":"Spelling. Only one l in -ular."}]},
{"base":"vary","pos":"verb","level":"B2","topic":"general","forms":[
 {"w":"variety","cls":"noun","type":"suffix","affix":"-ety","strength":"strong","rule":"stem-change","gloss":"a range of different things","ex":"The shop sells a wide variety of cheese.","teen":"There is a great variety of clubs at school.","alts":["-ity","-ance","-ment"]},
 {"w":"various","cls":"adjective","type":"suffix","affix":"-ous","strength":"strong","rule":"stem-change","gloss":"several different","ex":"She tried various methods.","teen":"I saw various friends at the match."}],
 "avoid":[{"w":"variaty","for":"variety","why":"Spelling. The noun ends in -iety."},{"w":"varius","for":"various","why":"Spelling. The ending is -ous."}]},
{"base":"profession","pos":"noun","level":"B2","topic":"society","forms":[
 {"w":"professional","cls":"adjective","type":"suffix","affix":"-al","strength":"strong","rule":"keep-both","gloss":"done by a trained person, or of a high standard","ex":"She is a professional singer.","teen":"My coach is very professional.","alts":["-ial","-ical","-ive"]},
 {"w":"unprofessional","cls":"adjective","type":"prefix","affix":"un-","strength":"medium","gloss":"not showing the standards expected at work","ex":"It was unprofessional to arrive late.","teen":"Shouting at the referee was unprofessional.","alts":["in-","dis-","im-"]}],
 "avoid":[{"w":"profesional","for":"professional","why":"Spelling. Keep both s: profession + al."},{"w":"inprofessional","for":"unprofessional","why":"Wrong. professional takes un-."}]},
{"base":"solve","pos":"verb","level":"B2","topic":"school","forms":[
 {"w":"solution","cls":"noun","type":"suffix","affix":"-ion","strength":"strong","rule":"stem-change","gloss":"the answer to a problem","ex":"We found a simple solution.","teen":"Switching it off and on again was the solution.","alts":["-ment","-ance","-ity"]},
 {"w":"unsolved","cls":"adjective","type":"prefix","affix":"un-","strength":"medium","gloss":"not yet answered","ex":"The mystery remains unsolved.","teen":"That puzzle is still unsolved.","alts":["in-","dis-","im-"]}],
 "avoid":[{"w":"solvtion","for":"solution","why":"Wrong. solve becomes solution."},{"w":"insolved","for":"unsolved","why":"Wrong. solved takes un-."}]},
{"base":"maintain","pos":"verb","level":"C1","topic":"general","forms":[
 {"w":"maintenance","cls":"noun","type":"suffix","affix":"-ance","strength":"strong","rule":"stem-change","gloss":"the work of keeping something in good condition","ex":"Regular maintenance keeps the bike safe.","teen":"The maintenance of the school grounds costs a lot.","alts":["-ence","-ity","-ment"]}],
 "avoid":[{"w":"maintainance","for":"maintenance","why":"Wrong. maintain becomes maintenance."},{"w":"maintenence","for":"maintenance","why":"Wrong. This noun ends in -ance."}]},
{"base":"pronounce","pos":"verb","level":"C1","topic":"school","forms":[
 {"w":"pronunciation","cls":"noun","type":"suffix","affix":"-ation","strength":"strong","rule":"stem-change","gloss":"the way a word is said","ex":"Good pronunciation helps people understand you.","teen":"Her pronunciation of French is excellent.","alts":["-ion","-ment","-ance"]}],
 "avoid":[{"w":"pronounciation","for":"pronunciation","why":"Spelling. pronounce becomes pronunciation, with no o after the n."},{"w":"pronounsation","for":"pronunciation","why":"Wrong. The noun ends in -ciation."}]},
{"base":"extend","pos":"verb","level":"C1","topic":"general","forms":[
 {"w":"extensive","cls":"adjective","type":"suffix","affix":"-ive","strength":"strong","rule":"stem-change","gloss":"large in area or amount","ex":"The museum has an extensive collection.","teen":"I did extensive research for my project.","alts":["-ous","-ent","-ful"]}],
 "avoid":[{"w":"extendive","for":"extensive","why":"Wrong. extend becomes extens- before -ive."},{"w":"extensiv","for":"extensive","why":"Spelling. Keep the final e."}]},
{"base":"adequate","pos":"adjective","level":"C1","topic":"general","forms":[
 {"w":"inadequate","cls":"adjective","type":"prefix","affix":"in-","strength":"strong","gloss":"not enough, or not good enough","ex":"The food supply was inadequate.","teen":"The Wi-Fi in my room is inadequate.","alts":["un-","im-","dis-"]}],
 "avoid":[{"w":"unadequate","for":"inadequate","why":"Wrong. adequate takes in-."},{"w":"inadaquate","for":"inadequate","why":"Spelling. The letters are d, e, q: adequate."}]},
{"base":"intelligible","pos":"adjective","level":"C1","topic":"school","forms":[
 {"w":"unintelligible","cls":"adjective","type":"prefix","affix":"un-","strength":"strong","gloss":"impossible to understand","ex":"His speech was unintelligible.","teen":"The message was unintelligible because of the noise.","alts":["in-","dis-","im-"]}],
 "avoid":[{"w":"unintelligable","for":"unintelligible","why":"Spelling. This one ends in -ible."},{"w":"inintelligible","for":"unintelligible","why":"Wrong. intelligible takes un-."}]},
{"base":"refer","pos":"verb","level":"C1","topic":"school","forms":[
 {"w":"reference","cls":"noun","type":"suffix","affix":"-ence","strength":"strong","rule":"stem-change","gloss":"a mention of something, or a note about someone's character","ex":"She made a reference to her last holiday.","teen":"My teacher wrote me a reference for my part-time job.","alts":["-ance","-ity","-ment"]}],
 "avoid":[{"w":"referance","for":"reference","why":"Wrong. This noun ends in -ence."},{"w":"referrence","for":"reference","why":"Spelling. One r in the middle: reference."}]},
{"base":"conceive","pos":"verb","level":"C1","topic":"school","forms":[
 {"w":"misconception","cls":"noun","type":"prefix","affix":"mis-","strength":"strong","rule":"stem-change","gloss":"a wrong idea that many people believe","ex":"It is a misconception that bats are blind.","teen":"There is a misconception that gamers never go outside.","alts":["dis-","un-","in-"]}],
 "avoid":[{"w":"disconception","for":"misconception","why":"Wrong. The prefix is mis-."},{"w":"missconception","for":"misconception","why":"Spelling. One s after mi: mis + conception."}]},
{"base":"transmit","pos":"verb","level":"C1","topic":"tech","forms":[
 {"w":"transmission","cls":"noun","type":"suffix","affix":"-ion","strength":"strong","rule":"stem-change","gloss":"sending a signal or message, or passing on a disease","ex":"The transmission of the signal was delayed.","teen":"The transmission of the match was cut off.","alts":["-ment","-ance","-ity"]}],
 "avoid":[{"w":"transmition","for":"transmission","why":"Spelling. transmit becomes transmission, with -ssion."},{"w":"transmision","for":"transmission","why":"Spelling. Keep both s: transmission."}]}
);
})();
