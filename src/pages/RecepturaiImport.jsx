import { useState } from 'react'
import { supabase } from '../lib/supabase'

const RECIPES = [{"title":"GREITAI MARINUOTI AGURKAI SU KADAGIAIS (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Greitai marinuoti agurkai su kadagiais","unit":"g","qty":120.0}]},{"title":"AGURKŲ IR POMIDORŲ SALOTOS SU BUFALO MOCARELA (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Agurkai (švieži)","unit":"g","qty":100.0},{"name":"Pomidorai marinuoti","unit":"g","qty":80.0},{"name":"Bufalo mocarela","unit":"g","qty":80.0},{"name":"Šviežios baziliko lapeliai","unit":"g","qty":2.0},{"name":"Žolelių–sojų aliejaus padažas","unit":"ml","qty":30.0}]},{"title":"ANT LAUŽO KEPTOS AZIETIŠKAME PADAŽE MARINUOTOS DARŽOVĖS (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Azietiškame padaže marinuotos daržovės","unit":"g","qty":100.0},{"name":"Aliejus kepimui","unit":"ml","qty":10.0}]},{"title":"BATATAI SU KIETUOJU SŪRIU (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Paruošti batatai","unit":"g","qty":100.0},{"name":"Aliejus kepimui","unit":"ml","qty":10.0},{"name":"Tarkuotas kietasis sūris","unit":"g","qty":10.0}]},{"title":"BROKOLIAI KEPTI SU IMBIERAIS IR CITRINA (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Blanširuoti brokoliai","unit":"g","qty":90.0},{"name":"Citrinos žievelė","unit":"g","qty":1.0},{"name":"Tarkuotas imbieras","unit":"g","qty":3.0},{"name":"Aliejus kepimui","unit":"ml","qty":10.0},{"name":"Druska (jodota)","unit":"g","qty":1.0}]},{"title":"BULVIŲ ŠIAUDELIAI SU ČIOBRELIŲ DRUSKA (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Paruošti bulvių šiaudeliai","unit":"g","qty":100.0},{"name":"Aliejus kepimui","unit":"ml","qty":10.0},{"name":"Čiobrelių druska","unit":"g","qty":2.0}]},{"title":"BRANDINTOS JAUTIENOS BURGERIS SU ROZMARINŲ BBQ PADAŽU (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Jautienos maltinukas (brandinta mėsa)","unit":"g","qty":170.0},{"name":"Burgerio bandelė","unit":"vnt.","qty":1.0},{"name":"Karamelizuoti svogūnai","unit":"g","qty":30.0},{"name":"Marinuoti pomidoriukai","unit":"g","qty":30.0},{"name":"Greitai marinuoti agurkai su kadagiais","unit":"g","qty":20.0},{"name":"Šoninė kepta (cezario salotoms)","unit":"g","qty":20.0},{"name":"Cheddar sūris","unit":"g","qty":20.0},{"name":"Rozmarinų BBQ padažas","unit":"ml","qty":40.0}]},{"title":"CEZARIO SALOTOS (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Romaine salotos","unit":"g","qty":80.0},{"name":"Krutonai su česnaku ir čiobreliais","unit":"g","qty":20.0},{"name":"Kietasis sūris (tarkuotas)","unit":"g","qty":15.0},{"name":"Kepta šoninė","unit":"g","qty":15.0},{"name":"Ančiuvių–parmezano padažas","unit":"ml","qty":40.0}]},{"title":"CRÈME BRULE SU MATCHA IR APELSINAIS (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Crème Brule su matcha ir apelsinų žievele (pusgaminis)","unit":"vnt.","qty":1.0},{"name":"Rudasis cukrus (karamelizavimui)","unit":"g","qty":5.0}]},{"title":"KEPTAS ŠOKOLADINIS PYRAGĖLIS SU SVIESTINIU PANKO IR VANILINIAIS LEDAIS (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Šokoladinis fondantas (pusgaminis)","unit":"vnt.","qty":1.0},{"name":"Vaniliniai ledai","unit":"g","qty":60.0},{"name":"Panko džiūvėsiai","unit":"g","qty":10.0}]},{"title":"KEPTA DUONA SU SŪRIO–ŽOLELIŲ PADAŽU (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Balta duona","unit":"g","qty":100.0},{"name":"Aliejus kepimui","unit":"ml","qty":10.0},{"name":"Sūrio–žolelių padažas","unit":"g","qty":40.0},{"name":"Lapeliai puošimui (mikrožalumynai)","unit":"g","qty":2.0}]},{"title":"PONZU PADAŽE MARINUOTOS TIGRINĖS KREVETĖS (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Marinuotos tigrinės krevetės","unit":"g","qty":100.0},{"name":"Ponzu padažas","unit":"ml","qty":15.0},{"name":"Citrinos","unit":"g","qty":20.0},{"name":"Lapeliai puošimui (mikrožalumynai)","unit":"g","qty":2.0},{"name":"Aliejus kepimui","unit":"ml","qty":10.0}]},{"title":"KREVEČIŲ SALOTOS SU MANGAIS, AVOKADAIS, POMIDORIUKAIS, SEZAMŲ–LAIMŲ PADAŽU (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Marinuotos tigrinės krevetės","unit":"g","qty":70.0},{"name":"Mangas","unit":"g","qty":50.0},{"name":"Avokadas","unit":"g","qty":50.0},{"name":"Marinuoti pomidoriukai","unit":"g","qty":60.0},{"name":"Salotų mišinys","unit":"g","qty":40.0},{"name":"Sezamų–laimų padažas","unit":"ml","qty":30.0}]},{"title":"LAŠIŠOS KEPSNYS SU BEURRE BLANC PADAŽU (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Marinuotas lašišos kepsnys","unit":"g","qty":170.0},{"name":"Beurre blanc padažas","unit":"ml","qty":50.0},{"name":"Lapeliai puošimui (mikrožalumynai)","unit":"g","qty":2.0}]},{"title":"MĖSOS KUKULIUKAI SU CHILLI BALZAMO PADAŽU (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Mėsos kukuliai (paruošti kepimui)","unit":"g","qty":100.0},{"name":"Aliejus kepimui","unit":"ml","qty":10.0},{"name":"Chilli balzamiko padažas","unit":"g","qty":30.0},{"name":"Lapeliai puošimui (mikrožalumynai)","unit":"g","qty":2.0}]},{"title":"PAELLA SU KREVETĖMIS, MIDIJOMIS IR LAŠIŠA (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Ryžių pusgaminis su daržovėmis (azijietiška nata)","unit":"g","qty":250.0},{"name":"Marinuotos krevetės","unit":"g","qty":60.0},{"name":"Midijos virtos kriauklėse","unit":"g","qty":60.0},{"name":"Marinuota lašiša","unit":"g","qty":60.0},{"name":"Žuvienės sultinys","unit":"ml","qty":50.0},{"name":"Lapeliai puošimui (mikrožalumynai)","unit":"g","qty":2.0}]},{"title":"POMIDORAI SU PONZU PADAŽU (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Marinuoti pomidoriukai","unit":"g","qty":80.0},{"name":"Ponzu padažas","unit":"ml","qty":15.0}]},{"title":"RYŽIAI / LAUKINIAI RYŽIAI (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Virtas ryžių ir laukinių ryžių mišinys","unit":"g","qty":100.0},{"name":"Druska (jodota)","unit":"g","qty":1.0}]},{"title":"ŠVIEŽIOS SALOTOS SU ŽOLELIŲ–SOJŲ ALIEJUMI (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Salotų mišinys","unit":"g","qty":60.0},{"name":"Žolelių–sojų aliejaus padažas","unit":"ml","qty":30.0}]},{"title":"KIAULIENOS SPRANDINĖS KEPSNYS SU ELNIENOS SULTINIO PADAŽU (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Marinuota kiaulienos sprandinė","unit":"g","qty":170.0},{"name":"Elnienos sultinio padažas","unit":"ml","qty":50.0},{"name":"Lapeliai puošimui (mikrožalumynai)","unit":"g","qty":2.0}]},{"title":"RANKŲ DARBO SŪRIO SPURGYTĖS (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Sūrio spurgytės (žalias pusgaminis)","unit":"g","qty":100.0},{"name":"Aliejus kepimui","unit":"ml","qty":15.0},{"name":"Jalapenų-laimų padažas","unit":"g","qty":30.0},{"name":"Lapeliai puošimui (mikrožalumynai)","unit":"g","qty":2.0}]},{"title":"TUNO TARTAR (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Šviežias tunas (kapotas)","unit":"g","qty":80.0},{"name":"Jalapenų-laimų padažas","unit":"ml","qty":30.0},{"name":"Žolelių-sojų aliejaus padažas","unit":"ml","qty":10.0},{"name":"Jūros kopūstai","unit":"g","qty":15.0},{"name":"Avokadas","unit":"g","qty":30.0},{"name":"Mangas","unit":"g","qty":30.0},{"name":"Marinuoti pomidoriukai","unit":"g","qty":15.0},{"name":"Lapeliai puošimui (mikrožalumynai)","unit":"g","qty":2.0}]},{"title":"ANT LAUŽO KEPTA VIŠTIENOS KRŪTINĖLĖ SU MARINARA PADAŽU (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Marinuota vištienos krūtinėlė su čiobreliais ir miso","unit":"g","qty":170.0},{"name":"Marinara padažas","unit":"ml","qty":50.0},{"name":"Lapeliai puošimui (mikrožalumynai)","unit":"g","qty":2.0}]},{"title":"VIŠTIENOS SPARNELIAI SU ROZMARINŲ BBQ GLAZŪRA (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Marinuoti vištienos sparneliai","unit":"g","qty":160.0},{"name":"Aliejus kepimui","unit":"ml","qty":20.0},{"name":"Rozmarinų BBQ padažas","unit":"ml","qty":40.0},{"name":"Lapeliai puošimui (mikrožalumynai)","unit":"g","qty":2.0}]},{"title":"ŠALTEKAI (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Šaltekų bazė","unit":"g","qty":300.0},{"name":"Virtas kiaušinis","unit":"vnt.","qty":1.0},{"name":"Bulvės šiaudeliais (atidavimas)","unit":"g","qty":90.0}]},{"title":"AZIETIŠKAS KIAULIENOS ŠAŠLYKAS SU MARINARA PADAŽU (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Marinuota kiauliena šašlykui","unit":"g","qty":180.0},{"name":"Marinara padažas","unit":"g","qty":40.0}]},{"title":"ŽUVIENĖ SU TIGRINĖMIS KREVETĖMIS (ATIDAVIMAS)","category":"Atidavimas","folder":"ATIDAVIMO KORTELĖS","ingredients":[{"name":"Žuvienės sultinys (pusgaminis)","unit":"ml","qty":300.0},{"name":"Marinuotos tigrinės krevetės","unit":"g","qty":30.0},{"name":"Marinuota lašiša","unit":"g","qty":40.0},{"name":"Svogūnai","unit":"g","qty":20.0},{"name":"Salierai","unit":"g","qty":20.0},{"name":"Morkos","unit":"g","qty":20.0},{"name":"Augalinis aliejus","unit":"ml","qty":10.0},{"name":"Šviežios žolelės (krapai petražolės)","unit":"g","qty":2.0}]},{"title":"AZIETIŠKAME PADAŽE MARINUOTOS DARŽOVĖS (GRILINIMUI)","category":"Daržovės","folder":"DARŽOVĖS","ingredients":[{"name":"Paprika","unit":"g","qty":540.0},{"name":"Cukinija","unit":"g","qty":580.0},{"name":"Morkos","unit":"g","qty":350.0},{"name":"Sezamų-laimų PSGM","unit":"ml","qty":100.0},{"name":"Česnakas","unit":"g","qty":19.0},{"name":"Sezamų sėklos","unit":"g","qty":10.0},{"name":"Aliejus augalinis","unit":"ml","qty":50.0}]},{"title":"BATATAI (PARUOŠTI KEPIMUI GRUZDINTUVĖJE)","category":"Daržovės","folder":"DARŽOVĖS","ingredients":[{"name":"Batatai (saldžios bulvės)","unit":"g","qty":950.0}]},{"title":"BROKOLIŲ BLANŠIRAVIMAS","category":"Daržovės","folder":"DARŽOVĖS","ingredients":[{"name":"Brokoliai","unit":"g","qty":750.0},{"name":"Druska (jodota)","unit":"g","qty":10.0}]},{"title":"GREITO MARINAVIMO AGURKAI SU KADAGIAIS","category":"Daržovės","folder":"DARŽOVĖS","ingredients":[{"name":"Agurkai","unit":"g","qty":850.0},{"name":"Actas (9 %)","unit":"ml","qty":50.0},{"name":"Cukrus","unit":"g","qty":40.0},{"name":"Druska (joduota)","unit":"g","qty":20.0},{"name":"Kadagio uogos (trintos)","unit":"g","qty":10.0},{"name":"Česnakas","unit":"g","qty":14.0},{"name":"Krapai švieži","unit":"g","qty":10.0}]},{"title":"KARAMELIZUOTI SVOGŪNAI","category":"Daržovės","folder":"DARŽOVĖS","ingredients":[{"name":"Svogūnai geltoni","unit":"g","qty":850.0},{"name":"Alyvuogių aliejus","unit":"ml","qty":50.0},{"name":"Cukrus","unit":"g","qty":50.0},{"name":"Druska (jodota)","unit":"g","qty":10.0},{"name":"Balzaminis actas","unit":"ml","qty":20.0}]},{"title":"MARINUOTI POMIDORAI SU PONZU PADAŽU","category":"Daržovės","folder":"DARŽOVĖS","ingredients":[{"name":"Vyšninių pomidorų miksas","unit":"g","qty":900.0},{"name":"Ponzu padažo pusgaminis","unit":"ml","qty":100.0},{"name":"Česnakas","unit":"g","qty":13.0},{"name":"Šviežios mėtos arba bazilikai","unit":"g","qty":10.0}]},{"title":"CRÈME BRULÉE SU MATCHA IR APELSINŲ ŽIEVELE PSGM","category":"Desertai","folder":"DESERTAI","ingredients":[{"name":"Grietinėlė 35 %","unit":"ml","qty":1000.0},{"name":"Kiaušinių tryniai","unit":"vnt","qty":12.0},{"name":"Cukrus","unit":"g","qty":150.0},{"name":"Apelsinų žievelė (tarkuota)","unit":"g","qty":10.0},{"name":"Matcha arbatos milteliai","unit":"g","qty":5.0},{"name":"Vanilinis cukrus","unit":"g","qty":5.0}]},{"title":"ŠOKOLADINIS FONDANTAS PSGM","category":"Desertai","folder":"DESERTAI","ingredients":[{"name":"Juodasis šokoladas (70 %)","unit":"g","qty":300.0},{"name":"Sviestas","unit":"g","qty":200.0},{"name":"Cukrus","unit":"g","qty":150.0},{"name":"Kiaušiniai","unit":"vnt","qty":6.0},{"name":"Kvietiniai miltai","unit":"g","qty":70.0},{"name":"Druska (jodota)","unit":"g","qty":2.0},{"name":"Cinamonas","unit":"g","qty":4.0}]},{"title":"KRUTONAI","category":"Kita","folder":"KITA","ingredients":[{"name":"Balta forminė duona","unit":"g","qty":900.0},{"name":"Aliejus alyvuogių","unit":"ml","qty":50.0},{"name":"Česnakas","unit":"g","qty":18.0},{"name":"Švieži čiobreliai","unit":"g","qty":80.0},{"name":"Druska (joduota)","unit":"g","qty":10.0}]},{"title":"PAELLA RYŽIŲ IR DARŽOVIŲ PUSGAMINIS","category":"Kita","folder":"KITA","ingredients":[{"name":"Apvalieji ryžiai","unit":"g","qty":1000.0},{"name":"Paprika raudona","unit":"g","qty":280.0},{"name":"Svogūnai","unit":"g","qty":180.0},{"name":"Česnakas","unit":"g","qty":18.0},{"name":"Žuvienės sultinio pusgaminis","unit":"ml","qty":2500.0},{"name":"Pomidorų pasta","unit":"g","qty":40.0},{"name":"Alyvuogių aliejus","unit":"ml","qty":50.0},{"name":"Citrinžolė","unit":"g","qty":10.0},{"name":"Rūkytos paprikos milteliai","unit":"g","qty":5.0},{"name":"Druska (joduota)","unit":"g","qty":10.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":3.0}]},{"title":"RANKŲ DARBO SŪRIO SPURGYTĖS","category":"Kita","folder":"KITA","ingredients":[{"name":"Varškė (9 %)","unit":"g","qty":500.0},{"name":"Kietasis sūris","unit":"g","qty":100.0},{"name":"Kieta mocarela","unit":"g","qty":100.0},{"name":"Kiaušiniai","unit":"vnt","qty":2.0},{"name":"Kvietiniai miltai","unit":"g","qty":200.0},{"name":"Kepimo milteliai","unit":"g","qty":10.0},{"name":"Druska (jodota)","unit":"g","qty":5.0},{"name":"Cukrus","unit":"g","qty":30.0}]},{"title":"RYŽIŲ IR LAUKINIŲ RYŽIŲ MIX","category":"Kita","folder":"KITA","ingredients":[{"name":"Ryžiai (ilgagrūdžiai)","unit":"g","qty":700.0},{"name":"Laukiniai ryžiai","unit":"g","qty":300.0},{"name":"Vanduo","unit":"ml","qty":3000.0},{"name":"Druska (jodota)","unit":"g","qty":20.0},{"name":"Aliejus augalinis","unit":"ml","qty":20.0}]},{"title":"ČIOBRELIŲ DRUSKA","category":"Kita","folder":"KITA","ingredients":[{"name":"Druska (joduota, stambi)","unit":"g","qty":100.0},{"name":"Čiobreliai (švieži, tik lapeliai)","unit":"g","qty":10.0}]},{"title":"ŠAŠLO MARINAVIMAS","category":"Mėsa ir žuvis","folder":"MĖSA ŽUVIS","ingredients":[{"name":"Kiaulienos sprandinė (be kaulo)","unit":"g","qty":4800.0},{"name":"Sojų padažas „Kikoman\"","unit":"ml","qty":200.0},{"name":"Mėlyni svogūnai","unit":"g","qty":380.0},{"name":"Laimas (žievelė ir sultys)","unit":"vnt.","qty":2.0},{"name":"Kalendra (šviežia)","unit":"g","qty":20.0},{"name":"Chilli pipirai (švieži)","unit":"g","qty":15.0},{"name":"Česnakas","unit":"g","qty":18.0},{"name":"Rudas cukrus","unit":"g","qty":40.0},{"name":"Sezamų aliejus","unit":"ml","qty":30.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":5.0}]},{"title":"JAUTIENOS PAPLOTĖLIS BURGERIUI","category":"Mėsa ir žuvis","folder":"MĖSA ŽUVIS","ingredients":[{"name":"Malta brandinta jautiena","unit":"g","qty":2000.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":5.0},{"name":"Vorčesterio padažas","unit":"ml","qty":80.0}]},{"title":"KREVETĖS MARINAVIMAS","category":"Mėsa ir žuvis","folder":"MĖSA ŽUVIS","ingredients":[{"name":"Tigrinės krevetės (valytos)","unit":"g","qty":800.0},{"name":"Ponzu padažas","unit":"ml","qty":80.0},{"name":"Česnakas","unit":"g","qty":8.0},{"name":"Laimas (žievelė ir sultys)","unit":"vnt.","qty":1.0},{"name":"Kalendra (šviežia)","unit":"g","qty":8.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":1.0}]},{"title":"LAŠIŠOS MARINAVIMAS SU SOJA IR SEZAMAIS","category":"Mėsa ir žuvis","folder":"MĖSA ŽUVIS","ingredients":[{"name":"Lašišos filė be odos","unit":"g","qty":1800.0},{"name":"Sojų padažas „Kikoman\"","unit":"ml","qty":100.0},{"name":"Sezamų aliejus","unit":"ml","qty":30.0},{"name":"Laimas (žievelė, sultys)","unit":"vnt.","qty":2.0},{"name":"Česnakas","unit":"g","qty":9.0},{"name":"Šviežias imbieras","unit":"g","qty":10.0},{"name":"Druska (joduota)","unit":"g","qty":2.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":1.0}]},{"title":"AZIJOS STILIAUS MARINUOTI VIŠTIENOS SPARNELIAI","category":"Mėsa ir žuvis","folder":"MĖSA ŽUVIS","ingredients":[{"name":"Vištienos sparneliai","unit":"g","qty":2850.0},{"name":"Sojų padažas „Kikoman\"","unit":"ml","qty":300.0},{"name":"Medus","unit":"g","qty":80.0},{"name":"Česnakai","unit":"g","qty":18.0},{"name":"Šviežias imbieras","unit":"g","qty":18.0},{"name":"Sezamų aliejus","unit":"ml","qty":50.0},{"name":"Laimai","unit":"vnt.","qty":2.0},{"name":"Chilli pipirai (švieži)","unit":"g","qty":10.0},{"name":"Kalendra (šviežia)","unit":"g","qty":15.0},{"name":"Druska (jodota)","unit":"g","qty":3.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":1.0}]},{"title":"MĖSOS KUKULIŲ MASĖ","category":"Mėsa ir žuvis","folder":"MĖSA ŽUVIS","ingredients":[{"name":"Malta jautiena","unit":"g","qty":1000.0},{"name":"Malta kiauliena","unit":"g","qty":1000.0},{"name":"Džiūvėsėliai","unit":"g","qty":150.0},{"name":"Kiaušiniai","unit":"vnt.","qty":2.0},{"name":"Česnakas","unit":"g","qty":13.0},{"name":"Svogūnai mėlynieji","unit":"g","qty":140.0},{"name":"Druska (jodota)","unit":"g","qty":15.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":5.0},{"name":"Kalendros (šviežios)","unit":"g","qty":10.0}]},{"title":"SPRANDINĖS MARINAVIMAS (KEPSNIUI)","category":"Mėsa ir žuvis","folder":"MĖSA ŽUVIS","ingredients":[{"name":"Kiaulienos sprandinė","unit":"g","qty":2600.0},{"name":"Svogūnai","unit":"g","qty":450.0},{"name":"Mineralinis vanduo (gaz.)","unit":"ml","qty":300.0},{"name":"Obuolių actas","unit":"ml","qty":50.0},{"name":"Druska (jodota)","unit":"g","qty":30.0},{"name":"Pipirai (juodieji, grūsti)","unit":"g","qty":10.0},{"name":"Lauro lapai","unit":"g","qty":2.0},{"name":"Rūkyta paprika","unit":"g","qty":10.0}]},{"title":"VIŠTIENOS KRŪTINĖLĖS MARINAVIMAS SU MISO IR ČIOBRELIAIS","category":"Mėsa ir žuvis","folder":"MĖSA ŽUVIS","ingredients":[{"name":"Vištienos krūtinėlės be odos","unit":"g","qty":1800.0},{"name":"Miso pasta (šviesi)","unit":"g","qty":80.0},{"name":"Čiobreliai (švieži)","unit":"g","qty":10.0},{"name":"Alyvuogių aliejus","unit":"ml","qty":50.0},{"name":"Citrinos sultys","unit":"ml","qty":30.0},{"name":"Druska (joduota)","unit":"g","qty":5.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":2.0}]},{"title":"ŠONINĖS GABALIUKAI CEZARIO SALOTOMS","category":"Mėsa ir žuvis","folder":"MĖSA ŽUVIS","ingredients":[{"name":"Šoninė (rūkytos juostelės)","unit":"g","qty":600.0}]},{"title":"BEURRE BLANC","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"Baltas vynas","unit":"ml","qty":200.0},{"name":"Baltas vyno actas","unit":"ml","qty":50.0},{"name":"Šalotiniai svogūnai","unit":"g","qty":70.0},{"name":"Sviestas","unit":"g","qty":500.0},{"name":"Grietinėlė 35 %","unit":"ml","qty":100.0},{"name":"Druska (jodota)","unit":"g","qty":3.0},{"name":"Pipirai (balti, malti)","unit":"g","qty":1.0}]},{"title":"CEZARIO PADAŽAS","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"Majonezas","unit":"g","qty":600.0},{"name":"Ančiuvių filė","unit":"g","qty":40.0},{"name":"Česnakai","unit":"g","qty":12.0},{"name":"Džiugas(tarkuotas)","unit":"g","qty":60.0},{"name":"Dižono garstyčios","unit":"g","qty":30.0},{"name":"Citrinos sultys","unit":"ml","qty":60.0},{"name":"Vorčesterio padažas","unit":"ml","qty":20.0},{"name":"Druska (jodota)","unit":"g","qty":3.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":2.0}]},{"title":"Chilli Balzaminis padažas","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"Balzaminis actas","unit":"ml","qty":300.0},{"name":"Rudas cukrus","unit":"g","qty":100.0},{"name":"Česnakas","unit":"g","qty":14.0},{"name":"Chilli pipirai (švieži)","unit":"g","qty":20.0},{"name":"Vanduo","unit":"ml","qty":500.0},{"name":"Druska (jodota)","unit":"g","qty":4.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":2.0}]},{"title":"ELNIENOS SULTINIO PADAŽAS","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"OSCAR elnienos esencija","unit":"ml","qty":50.0},{"name":"Vanduo","unit":"ml","qty":830.0},{"name":"Sviestas","unit":"g","qty":40.0},{"name":"Kvietiniai miltai","unit":"g","qty":25.0},{"name":"Rozmarinas (šviežias)","unit":"g","qty":7.0},{"name":"Lauro lapai","unit":"g","qty":2.0},{"name":"Druska (jodota)","unit":"g","qty":4.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":2.0}]},{"title":"JELAPENŲ LAIMŲ","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"Majonezas","unit":"g","qty":600.0},{"name":"Jelapenai (švieži)","unit":"g","qty":120.0},{"name":"Laimas","unit":"vnt.","qty":3.0},{"name":"Cukrus","unit":"g","qty":20.0},{"name":"Druska (jodota)","unit":"g","qty":3.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":2.0},{"name":"Česnakas","unit":"g","qty":10.0},{"name":"Kalendra (šviežia)","unit":"g","qty":15.0}]},{"title":"MARINARA","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"Konservuoti pomidorai","unit":"g","qty":800.0},{"name":"Svogūnai","unit":"g","qty":90.0},{"name":"Česnakai","unit":"g","qty":18.0},{"name":"Alyvuogių aliejus","unit":"ml","qty":60.0},{"name":"Džiovintas raudonėlis","unit":"g","qty":3.0},{"name":"Džiovintas bazilikas","unit":"g","qty":2.0},{"name":"Druska (jodota)","unit":"g","qty":10.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":1.0},{"name":"Baltas vynas","unit":"ml","qty":100.0}]},{"title":"PONZU","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"Sojų padažas „Kikoman\"","unit":"ml","qty":600.0},{"name":"Ryžių actas","unit":"ml","qty":150.0},{"name":"Apelsinas (šviežias)","unit":"vnt.","qty":2.0},{"name":"Citrina (šviežia)","unit":"vnt.","qty":1.0},{"name":"Laimas (šviežias)","unit":"vnt.","qty":1.0},{"name":"Kombu (jūros dumbliai)","unit":"g","qty":10.0},{"name":"Vanduo","unit":"ml","qty":150.0}]},{"title":"ROZMARINO BBQ","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"Pomidorų pasta","unit":"g","qty":300.0},{"name":"Vanduo","unit":"ml","qty":250.0},{"name":"Obuolių actas","unit":"ml","qty":100.0},{"name":"Rudas cukrus","unit":"g","qty":120.0},{"name":"Garstyčios (dižono)","unit":"g","qty":50.0},{"name":"Sojų padažas","unit":"ml","qty":60.0},{"name":"Česnakas","unit":"g","qty":18.0},{"name":"Rozmarinas (šviežias)","unit":"g","qty":8.0},{"name":"Druska (jodota)","unit":"g","qty":3.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":2.0}]},{"title":"SEZAMŲ LAIMŲ","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"Augalinis aliejus","unit":"ml","qty":150.0},{"name":"Sezamų aliejus","unit":"ml","qty":30.0},{"name":"Laimas","unit":"vnt.","qty":3.0},{"name":"Sojų padažas","unit":"ml","qty":100.0},{"name":"Medus","unit":"g","qty":50.0},{"name":"Česnakai","unit":"g","qty":18.0},{"name":"Druska (jodota)","unit":"g","qty":2.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":1.0},{"name":"Apelsinų sultys","unit":"ml","qty":500.0}]},{"title":"SŪRIO ŽOLELIŲ","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"Sviestas","unit":"g","qty":100.0},{"name":"Miltai","unit":"g","qty":60.0},{"name":"Pienas","unit":"ml","qty":700.0},{"name":"Kieta mocarela (tarkuota)","unit":"g","qty":180.0},{"name":"Provanso žolelės","unit":"g","qty":5.0},{"name":"Druska (jodota)","unit":"g","qty":5.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":2.0}]},{"title":"ČESNAKINIS KAPARĖLIŲ SVIESTAS","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"Sviestas (82 % riebumo)","unit":"g","qty":500.0},{"name":"Kaparėliai (marinuoti)","unit":"g","qty":70.0},{"name":"Česnakas","unit":"g","qty":10.0},{"name":"Petražolės (šviežios)","unit":"g","qty":7.0},{"name":"Druska (jodota)","unit":"g","qty":3.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":2.0}]},{"title":"ŽOLELIŲ SOJŲ ALIEJUS","category":"Padažai","folder":"PADAŽAI","ingredients":[{"name":"Augalinis aliejus","unit":"ml","qty":500.0},{"name":"Sojų padažas „Kikoman\"","unit":"ml","qty":100.0},{"name":"Petražolės (šviežios)","unit":"g","qty":20.0},{"name":"Krapai (švieži)","unit":"g","qty":18.0},{"name":"Bazilikas (šviežias)","unit":"g","qty":14.0},{"name":"Česnakas","unit":"g","qty":9.0},{"name":"Citrinos sultys","unit":"ml","qty":80.0},{"name":"Druska (jodota)","unit":"g","qty":3.0},{"name":"Pipirai (juodieji, malti)","unit":"g","qty":1.0}]},{"title":"ŠALTEKŲ BAZĖ SU MARINUOTOMIS GRAŽGARSTĖMIS","category":"Sriubos","folder":"SRIUBOS","ingredients":[{"name":"Gražgarstės (šviežios)","unit":"g","qty":280.0},{"name":"Agurkai (švieži, be sėklų)","unit":"g","qty":380.0},{"name":"Česnakas","unit":"g","qty":18.0},{"name":"Cukrus","unit":"g","qty":20.0},{"name":"Druska (jodota)","unit":"g","qty":10.0},{"name":"Actas (9 %)","unit":"ml","qty":50.0},{"name":"Marinuoti burokėliai","unit":"g","qty":1000.0},{"name":"Kefyras","unit":"ml","qty":2000.0},{"name":"Krapai (švieži)","unit":"g","qty":30.0}]},{"title":"ŽUVIENĖS SULTINIO PUSGAMINIS","category":"Sriubos","folder":"SRIUBOS","ingredients":[{"name":"Krevečių kiautai","unit":"g","qty":300.0},{"name":"OSCAR omarų sultinio koncentratas","unit":"ml","qty":100.0},{"name":"Morka","unit":"g","qty":280.0},{"name":"Salieras stiebas","unit":"g","qty":190.0},{"name":"Svogūnai","unit":"g","qty":280.0},{"name":"Pomidorų pasta","unit":"g","qty":50.0},{"name":"Vanduo","unit":"ml","qty":5000.0},{"name":"Česnakas","unit":"g","qty":18.0},{"name":"Lauro lapai","unit":"g","qty":2.0},{"name":"Pipirai (juodieji, grūsti)","unit":"g","qty":5.0},{"name":"Baltas vynas","unit":"ml","qty":400.0}]}]

export default function RecepturaiImport() {
  const [status, setStatus] = useState('idle') // idle | running | done | error
  const [log, setLog] = useState([])
  const [counts, setCounts] = useState({ inv: 0, menu: 0, recipe: 0 })

  function addLog(msg, type = 'info') {
    setLog(prev => [...prev, { msg, type, t: Date.now() }])
  }

  async function runImport() {
    setStatus('running')
    setLog([])
    const c = { inv: 0, menu: 0, recipe: 0 }

    try {
      // Check recipe_items table exists
      const { error: tableCheck } = await supabase.from('recipe_items').select('id').limit(1)
      if (tableCheck && tableCheck.message?.includes('does not exist')) {
        addLog('❌ Lentelė recipe_items nerasta!', 'error')
        addLog('Prieš importą reikia paleisti supabase_migration_recepturai.sql Supabase SQL Editor!', 'warn')
        setStatus('error')
        return
      }

      // 1. Fetch existing inventory names to avoid duplicates
      addLog('1/3 Tikrinama esamų ingredientų...')
      const { data: existingInv } = await supabase.from('inventory').select('name')
      const existingInvSet = new Set((existingInv || []).map(i => i.name.toLowerCase()))

      const ingNames = [...new Set(RECIPES.flatMap(r => r.ingredients.map(i => i.name)))]
      const newIngs = ingNames.filter(n => !existingInvSet.has(n.toLowerCase()))
      addLog(`   ${ingNames.length} unikalių, ${newIngs.length} naujų ingredientų`)

      for (let i = 0; i < newIngs.length; i += 50) {
        const batch = newIngs.slice(i, i + 50).map(name => ({
          name, category: 'Receptūra', quantity: 0, unit: 'g', min_quantity: 0,
        }))
        const { error } = await supabase.from('inventory').insert(batch)
        if (error) addLog(`   ⚠️ ${error.message}`, 'warn')
        else c.inv += batch.length
      }
      addLog(`   ✅ Pridėta ${c.inv} naujų ingredientų į sandėlį`, 'ok')

      // 2. Fetch existing menu item names
      addLog('2/3 Tikrinami esami meniu įrašai...')
      const { data: existingMenu } = await supabase.from('menu_items').select('name')
      const existingMenuSet = new Set((existingMenu || []).map(m => m.name.toLowerCase()))

      const menuRows = RECIPES
        .filter(r => !existingMenuSet.has(r.title.toLowerCase()))
        .map(r => ({ name: r.title, category: r.category, price: 0 }))
      addLog(`   ${RECIPES.length} receptūrų, ${menuRows.length} naujų`)

      for (let i = 0; i < menuRows.length; i += 50) {
        const batch = menuRows.slice(i, i + 50)
        const { error } = await supabase.from('menu_items').insert(batch)
        if (error) addLog(`   ⚠️ ${error.message}`, 'warn')
        else c.menu += batch.length
      }
      addLog(`   ✅ Pridėta ${c.menu} naujų receptūrų į meniu`, 'ok')

      // 3. Fetch all IDs for linking
      addLog('3/3 Kuriamos receptūrų sąsajos...')
      const { data: invItems } = await supabase.from('inventory').select('id, name')
      const { data: menuItems } = await supabase.from('menu_items').select('id, name')
      const { data: existingLinks } = await supabase.from('recipe_items').select('menu_item_id, inventory_id')

      const invMap = {}
      invItems?.forEach(i => { invMap[i.name.toLowerCase()] = i.id })
      const menuMap = {}
      menuItems?.forEach(m => { menuMap[m.name.toLowerCase()] = m.id })
      const linkSet = new Set((existingLinks || []).map(l => `${l.menu_item_id}|${l.inventory_id}`))

      const recipeRows = []
      let skipped = 0
      for (const recipe of RECIPES) {
        const menuId = menuMap[recipe.title.toLowerCase()]
        if (!menuId) { skipped++; continue }
        for (const ing of recipe.ingredients) {
          const invId = invMap[ing.name.toLowerCase()]
          if (!invId) { skipped++; continue }
          const key = `${menuId}|${invId}`
          if (linkSet.has(key)) continue // already exists
          recipeRows.push({ menu_item_id: menuId, inventory_id: invId, quantity: ing.qty || 1 })
        }
      }
      addLog(`   ${recipeRows.length} naujų sąsajų (${skipped} praleista)`)

      for (let i = 0; i < recipeRows.length; i += 100) {
        const batch = recipeRows.slice(i, i + 100)
        const { error } = await supabase.from('recipe_items').insert(batch)
        if (error) addLog(`   ⚠️ ${error.message}`, 'warn')
        else c.recipe += batch.length
      }
      addLog(`   ✅ Pridėta ${c.recipe} receptūrų eilučių`, 'ok')

      setCounts(c)
      setStatus('done')
      addLog('🎉 IMPORTAS BAIGTAS!', 'ok')

    } catch (err) {
      addLog(`❌ Klaida: ${err.message}`, 'error')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800">🧾 Receptūrų importas</h1>
        {status === 'done' && <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">✅ Baigta</span>}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-600 font-medium">Receptūrų</p>
            <p className="text-2xl font-black text-blue-700">{RECIPES.length}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-xs text-purple-600 font-medium">Ingredientų</p>
            <p className="text-2xl font-black text-purple-700">
              {[...new Set(RECIPES.flatMap(r => r.ingredients.map(i => i.name)))].length}
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-xs text-orange-600 font-medium">Eilučių</p>
            <p className="text-2xl font-black text-orange-700">
              {RECIPES.reduce((s, r) => s + r.ingredients.length, 0)}
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <p className="font-bold mb-1">⚡ Pirma kartą: reikia paleisti migraciją</p>
          <p>Supabase SQL Editor → nukopijuok failo <code className="bg-amber-100 px-1 rounded">supabase_migration_recepturai.sql</code> turinį → Run</p>
          <p className="mt-1 text-xs text-amber-600">Po to spausk „Pradėti importą" — viskas bus automatiškai.</p>
        </div>
        <p className="text-sm text-gray-500">
          Importuos <strong>visas receptūras</strong> iš KORTELĖS folderių: padažus, daržoves, mėsą, deserus, atidavimo korteles.
          Duplikatai bus praleisti automatiškai.
        </p>

        {status === 'idle' && (
          <button
            onClick={runImport}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition text-lg"
          >
            🚀 Pradėti importą
          </button>
        )}

        {status === 'running' && (
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
            <div className="animate-spin text-2xl">⏳</div>
            <span className="font-semibold text-blue-700">Importuojama...</span>
          </div>
        )}

        {status === 'done' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-black text-green-700 text-lg">Importas sėkmingas!</p>
            <p className="text-sm text-green-600 mt-1">
              Sandėlis: +{counts.inv} · Meniu: +{counts.menu} · Receptūros: +{counts.recipe}
            </p>
            <p className="text-xs text-green-500 mt-2">Dabar eik į Meniu → Receptūros ir matysi viską</p>
          </div>
        )}
      </div>

      {log.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
          {log.map((l, i) => (
            <div key={i} className={
              l.type === 'ok' ? 'text-green-400' :
              l.type === 'warn' ? 'text-yellow-400' :
              l.type === 'error' ? 'text-red-400' :
              'text-gray-300'
            }>{l.msg}</div>
          ))}
        </div>
      )}
    </div>
  )
}
