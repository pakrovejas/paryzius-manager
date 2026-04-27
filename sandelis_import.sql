-- Paryžius — pradinis sandėlio sąrašas
-- Paleisti Supabase SQL Editor

INSERT INTO inventory (name, quantity, unit, min_quantity, category) VALUES

-- MĖSA
('Jautiena (steikui)', 0, 'kg', 2, 'Mėsa'),
('Jautiena (burgeriui)', 0, 'kg', 2, 'Mėsa'),
('Vištienos sparneliai', 0, 'kg', 3, 'Mėsa'),
('Vištienos krūtinėlė', 0, 'kg', 3, 'Mėsa'),
('Kiaulienos sprandinė', 0, 'kg', 2, 'Mėsa'),
('Kiaulienos šonkauliukai', 0, 'kg', 2, 'Mėsa'),
('Šoninė', 0, 'kg', 1, 'Mėsa'),

-- ŽUVIS
('Lašiša', 0, 'kg', 2, 'Žuvis'),
('Tunas', 0, 'kg', 1, 'Žuvis'),
('Tigrinės krevetės', 0, 'kg', 1, 'Žuvis'),

-- DARŽOVĖS
('Bulvės', 0, 'kg', 5, 'Daržovės'),
('Batatos', 0, 'kg', 3, 'Daržovės'),
('Pomidorai', 0, 'kg', 2, 'Daržovės'),
('Pomidoriukai (marinuoti)', 0, 'vnt', 5, 'Daržovės'),
('Agurkai', 0, 'kg', 1, 'Daržovės'),
('Svogūnai', 0, 'kg', 3, 'Daržovės'),
('Šparagai', 0, 'kg', 1, 'Daržovės'),
('Šparaginės pupelės', 0, 'kg', 1, 'Daržovės'),
('Avokadas', 0, 'vnt', 5, 'Daržovės'),
('Morkos', 0, 'kg', 2, 'Daržovės'),
('Paprika', 0, 'kg', 1, 'Daržovės'),
('Jalapeno', 0, 'vnt', 10, 'Daržovės'),
('Edamame pupelės', 0, 'kg', 1, 'Daržovės'),
('Jūros kopūstai', 0, 'g', 200, 'Daržovės'),
('Wakame salota', 0, 'g', 200, 'Daržovės'),

-- PIENO PRODUKTAI
('Sūris (Cheddar)', 0, 'kg', 1, 'Pieno produktai'),
('Sūris (parmezanas)', 0, 'kg', 0.5, 'Pieno produktai'),
('Sūris (varškė)', 0, 'kg', 1, 'Pieno produktai'),
('Grietinėlė', 0, 'L', 2, 'Pieno produktai'),
('Pienas', 0, 'L', 5, 'Pieno produktai'),
('Sviestas', 0, 'kg', 1, 'Pieno produktai'),
('Ledai', 0, 'L', 5, 'Pieno produktai'),

-- DUONA / MILTAI
('Duona (batonėlis)', 0, 'vnt', 5, 'Kita'),
('Burgerio bandelė', 0, 'vnt', 10, 'Kita'),
('Vaflio mišinys', 0, 'kg', 2, 'Kita'),
('Miltai', 0, 'kg', 5, 'Kita'),

-- PRIESKONIAI / PADAŽAI
('Druska', 0, 'kg', 1, 'Prieskoniai'),
('Pipirai', 0, 'g', 200, 'Prieskoniai'),
('Česnakai', 0, 'vnt', 5, 'Prieskoniai'),
('Čiobreliai', 0, 'g', 100, 'Prieskoniai'),
('Žolelės (mišinys)', 0, 'g', 100, 'Prieskoniai'),
('Alyvuogių aliejus', 0, 'L', 1, 'Prieskoniai'),
('BBQ padažas', 0, 'L', 1, 'Prieskoniai'),
('Tabasco', 0, 'vnt', 2, 'Prieskoniai'),
('Buffalo padažas', 0, 'L', 1, 'Prieskoniai'),
('Pomidorų padažas', 0, 'L', 2, 'Prieskoniai'),
('Laimas', 0, 'vnt', 10, 'Prieskoniai'),
('Braškių padažas', 0, 'L', 1, 'Prieskoniai'),
('Šokoladinis padažas', 0, 'L', 1, 'Prieskoniai'),
('Karamelinis padažas', 0, 'L', 1, 'Prieskoniai'),
('Miso pasta', 0, 'g', 200, 'Prieskoniai'),

-- GĖRIMAI (sandėlis)
('Kava (pupelės)', 0, 'kg', 2, 'Gėrimai'),
('Arbata (mišrainė)', 0, 'pak', 5, 'Gėrimai'),
('Matcha milteliai', 0, 'g', 200, 'Gėrimai'),
('Sirupas (įvairūs)', 0, 'vnt', 5, 'Gėrimai'),
('Stalo vanduo 1L', 0, 'vnt', 20, 'Gėrimai'),
('Mineralinis vanduo 0.5L', 0, 'vnt', 20, 'Gėrimai'),
('Mineralinis vanduo 0.75L', 0, 'vnt', 10, 'Gėrimai'),
('Sultys 200ml', 0, 'vnt', 15, 'Gėrimai'),
('Coca Cola/Sprite/Fanta 330ml', 0, 'vnt', 24, 'Gėrimai'),
('Gira 0.5L', 0, 'vnt', 10, 'Gėrimai'),

-- ALKOHOLIS
('Švyturio ekstra', 0, 'vnt', 24, 'Gėrimai'),
('Paryžiaus nefiltruotas', 0, 'L', 20, 'Gėrimai'),
('Grimbergen ambree', 0, 'vnt', 12, 'Gėrimai'),
('Vilkmergės sidras', 0, 'vnt', 12, 'Gėrimai'),
('Montalto vynas (baltas)', 0, 'vnt', 6, 'Gėrimai'),
('Montalto vynas (raudonas)', 0, 'vnt', 6, 'Gėrimai'),
('Prosecco', 0, 'vnt', 6, 'Gėrimai'),
('Degtinė', 0, 'L', 1, 'Gėrimai'),
('Brendis', 0, 'L', 1, 'Gėrimai'),
('Viskis', 0, 'L', 1, 'Gėrimai'),
('Mojito mišinys (mėta, cukrus)', 0, 'pak', 3, 'Gėrimai'),
('Pasiflorų koncentratas', 0, 'vnt', 3, 'Gėrimai');
