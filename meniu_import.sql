-- Paryžius meniu importas
-- Paleisti Supabase SQL Editor

INSERT INTO menu_items (name, description, price, category, is_available) VALUES

-- UŽKANDŽIAI
('Kepta duona', 'Kepta duona su sūrio ir žolelių padažu', 5.50, 'Užkandžiai', true),
('Keptos batatų lazdelės', 'Su sūriu ir padažu', 6.00, 'Užkandžiai', true),
('Sūrio spurgytės', 'Vietoje gaminamos rankų darbo spurgytės su naminiu padažu', 7.00, 'Užkandžiai', true),
('Sparneliai', 'Vištienos sparneliai glazūruoti pasirinktame padaže su morkų lazdelėmis. BBQ Tabasco | Parmezano česnakų | Buffalo', 7.50, 'Užkandžiai', true),
('Lašišos Tartaras', 'Su jelapenų-laimo padažu, jūros kopūstų ir marinuotais pomidoriukais', 11.00, 'Užkandžiai', true),
('Tuno Tartaras', 'Su jelapenų-laimo padažu, jūros kopūstų ir marinuotais pomidoriukais', 12.50, 'Užkandžiai', true),

-- SRIUBOS
('Šaltibarščiai', 'Su bulvių skiltelėmis', 6.00, 'Sriubos', true),
('Žuvienė', 'Su tigrinėmis krevetėmis ir lašiša', 11.50, 'Sriubos', true),
('Dienos sriuba', 'Klausti padavėjo', 4.50, 'Sriubos', true),

-- SALOTOS
('Cezario salotos', 'Mažoji 9€ | Didžioji 12€', 9.00, 'Kita', true),
('Lašišos dubenėlis', 'Avokadas, morka, agurkas, edamame pupelės, wakame salota, paprika. Lašiša tempuroje | Žalia lašiša', 9.50, 'Kita', true),
('Krevečių dubenėlis', 'Avokadas, morka, agurkas, edamame pupelės, wakame salota, paprika', 10.50, 'Kita', true),

-- VAIKAMS
('Fri bulvytės (vaikams)', 'Su pomidorų padažu', 3.50, 'Kita', true),
('Varškėtukai', 'Su braškių užpilu ir šviežiomis uogomis', 6.00, 'Kita', true),
('Vištienos juostelės (vaikams)', 'Su fri bulvytėmis ir šviežiomis daržovėmis', 6.50, 'Kita', true),

-- PAGRINDINIAI
('Jautienos burgeris', 'Su karamelizuotais svogūnais, pomidorais, agurkais, šonine, Cheddar sūriu ir bulvių skiltelėmis', 14.00, 'Pagrindiniai', true),
('Jautienos steikas', 'Brandintos jautienos steikas su žaliųjų pipirų padažu, bulvių skiltelėmis ir šparagais', 28.00, 'Pagrindiniai', true),
('Tacos su vištiena', 'Su vištiena', 10.00, 'Pagrindiniai', true),
('Tacos su krevetėmis', 'Su krevetėmis', 12.00, 'Pagrindiniai', true),
('Šašlykai', 'Grill kiaulienos arba vištienos šašlykas Paryžiaus marinate su Paryžiaus daržovėmis. Bulvių skiltelės | Ryžiai', 12.50, 'Pagrindiniai', true),
('Sprandinės kepsnys', 'Kiaulienos sprandinės kepsnys su elnienos sultinio padažu, bulvių skiltelėmis ir Paryžiaus daržovėmis', 12.00, 'Pagrindiniai', true),
('Vištienos krūtinėlės kepsnys', 'Marinuota su čiobreliais, pateikiama su bulvių skiltelėmis, padažu ir Paryžiaus daržovėmis', 12.00, 'Pagrindiniai', true),
('Lašišos kepsnys', 'Ant griliaus kepta lašiša su Beurre Blanc padažu, ryžiais, šparaginėmis pupelėmis ir Paryžiaus daržovėmis', 16.00, 'Pagrindiniai', true),
('Šonkauliukai', 'Kiaulienos šonkauliukai su bulvių skiltelėmis ir Paryžiaus daržovėmis', 14.00, 'Pagrindiniai', true),

-- DESERTAI
('Ledai', 'Įvairių rūšių', 3.50, 'Desertai', true),
('Burbulinis vaflis', 'Su dviem pasirinktais ledais, šviežiomis uogomis ir šokoladiniu | karameliniu | braškiniu užpilu', 8.50, 'Desertai', true),
('Lava cake', 'Šokoladinis pyragėlis su ledais', 6.00, 'Desertai', true),
('Sūrio pyragas', 'Su šviežiomis uogomis ir braškių užpilu', 6.00, 'Desertai', true),

-- KAVA / ARBATA
('Espresso', NULL, 1.90, 'Gėrimai', true),
('Juoda kava', NULL, 2.00, 'Gėrimai', true),
('Kava su pienu', NULL, 2.50, 'Gėrimai', true),
('Cappuccino', NULL, 3.00, 'Gėrimai', true),
('Latte', NULL, 3.00, 'Gėrimai', true),
('Ice latte', NULL, 3.50, 'Gėrimai', true),
('Frappe su pasirinktu sirupu', NULL, 3.80, 'Gėrimai', true),
('Matcha', NULL, 4.00, 'Gėrimai', true),
('Arbata', NULL, 2.00, 'Gėrimai', true),
('Naminė arbata su sirupu', NULL, 2.80, 'Gėrimai', true),

-- GAIVIEJI GĖRIMAI
('Stalo vanduo 1L', NULL, 1.50, 'Gėrimai', true),
('Mineralinis vanduo 0.5L', 'Gazuotas / negazuotas', 2.00, 'Gėrimai', true),
('Mineralinis vanduo 0.75L', 'Gazuotas / negazuotas', 2.50, 'Gėrimai', true),
('Sultys 200ml', NULL, 2.50, 'Gėrimai', true),
('Coca Cola / Sprite / Fanta 330ml', NULL, 2.50, 'Gėrimai', true),
('Naminis limonadas', NULL, 3.00, 'Gėrimai', true),
('Pieno ledų kokteilis', NULL, 3.50, 'Gėrimai', true),
('Gira 300ml', NULL, 3.00, 'Gėrimai', true),
('Gira 500ml', NULL, 4.00, 'Gėrimai', true),

-- ALUS / SIDRAS
('Švyturio ekstra 0.3L', NULL, 4.00, 'Alkoholis', true),
('Švyturio ekstra 0.5L', NULL, 5.00, 'Alkoholis', true),
('Švyturio ekstra nealkoholinis 0.5L', NULL, 4.00, 'Alkoholis', true),
('Grimbergen ambree 0.25L', NULL, 3.00, 'Alkoholis', true),
('Paryžiaus nefiltruotas 0.3L', NULL, 4.00, 'Alkoholis', true),
('Paryžiaus nefiltruotas 0.5L', NULL, 5.00, 'Alkoholis', true),
('Vilkmergės sidras 0.5L', 'Kriaušių / obuolių', 5.00, 'Alkoholis', true),

-- VYNAS
('Montalto vynas', 'Baltas / raudonas', 5.00, 'Alkoholis', true),
('Prosecco', 'Putojantis vynas', 5.00, 'Alkoholis', true),

-- KOKTEILIAI
('Mojito', NULL, 8.00, 'Alkoholis', true),
('Margarita', NULL, 8.00, 'Alkoholis', true),
('Aperol Spritz', NULL, 9.00, 'Alkoholis', true),
('Cuba Libre', NULL, 8.50, 'Alkoholis', true),
('Pasiflorų Gin tonic', NULL, 8.50, 'Alkoholis', true),

-- NEALKOHOLINIAI KOKTEILIAI
('Pasiflorų Gin tonic (nealkoholinis)', NULL, 7.00, 'Gėrimai', true),
('Mojito (nealkoholinis)', NULL, 7.00, 'Gėrimai', true),
('Aperol Spritz (nealkoholinis)', NULL, 7.00, 'Gėrimai', true),
('Rhuby Fresh', NULL, 7.00, 'Gėrimai', true),

-- STIPRIEJI GĖRIMAI
('Brendis 40ml', NULL, 3.50, 'Alkoholis', true),
('Degtinė 40ml', NULL, 3.20, 'Alkoholis', true),
('Viskis 40ml', NULL, 4.00, 'Alkoholis', true);
