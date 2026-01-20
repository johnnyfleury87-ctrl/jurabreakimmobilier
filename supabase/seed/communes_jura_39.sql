-- =====================================================================
-- SEED: COMMUNES DU JURA (Département 39)
-- =====================================================================
-- Principales communes avec codes postaux

-- Récupérer les IDs des zones pour les associations
DO $$
DECLARE
  zone_a_id UUID;
  zone_b_id UUID;
  zone_c_id UUID;
  zone_d_id UUID;
BEGIN
  -- Récupérer les IDs des zones
  SELECT id INTO zone_a_id FROM estimation_zones WHERE nom = 'Zone A - Dole et périphérie';
  SELECT id INTO zone_b_id FROM estimation_zones WHERE nom = 'Zone B - Lons-le-Saunier';
  SELECT id INTO zone_c_id FROM estimation_zones WHERE nom = 'Zone C - Villages attractifs';
  SELECT id INTO zone_d_id FROM estimation_zones WHERE nom = 'Zone D - Secteurs ruraux';

  -- Villes principales (Zone A - Dole)
  INSERT INTO estimation_communes (nom, code_postal, zone_id, prix_m2_reference) VALUES
    ('Dole', '39100', zone_a_id, 2400.00),
    ('Tavaux', '39500', zone_a_id, 2200.00),
    ('Damparis', '39500', zone_a_id, 2100.00),
    ('Choisey', '39100', zone_a_id, 2300.00),
    ('Parcey', '39100', zone_a_id, 2000.00)
  ON CONFLICT (nom) DO NOTHING;

  -- Préfecture (Zone B - Lons-le-Saunier)
  INSERT INTO estimation_communes (nom, code_postal, zone_id, prix_m2_reference) VALUES
    ('Lons-le-Saunier', '39000', zone_b_id, 2200.00),
    ('Montmorot', '39570', zone_b_id, 2000.00),
    ('Courlans', '39570', zone_b_id, 1950.00),
    ('Perrigny', '39000', zone_b_id, 2100.00),
    ('Macornay', '39570', zone_b_id, 1900.00)
  ON CONFLICT (nom) DO NOTHING;

  -- Sous-préfectures et villes moyennes (Zone C)
  INSERT INTO estimation_communes (nom, code_postal, zone_id, prix_m2_reference) VALUES
    ('Saint-Claude', '39200', zone_c_id, 1800.00),
    ('Champagnole', '39300', zone_c_id, 1900.00),
    ('Poligny', '39800', zone_c_id, 2000.00),
    ('Arbois', '39600', zone_c_id, 2100.00),
    ('Morez', '39400', zone_c_id, 1700.00),
    ('Salins-les-Bains', '39110', zone_c_id, 1850.00),
    ('Les Rousses', '39220', zone_c_id, 2500.00)
  ON CONFLICT (nom) DO NOTHING;

  -- Communes attractives (Zone C)
  INSERT INTO estimation_communes (nom, code_postal, zone_id, prix_m2_reference) VALUES
    ('Mouchard', '39330', zone_c_id, 1950.00),
    ('Mont-sous-Vaudrey', '39380', zone_c_id, 1900.00),
    ('Arinthod', '39240', zone_c_id, 1650.00),
    ('Bletterans', '39140', zone_c_id, 1700.00),
    ('Clairvaux-les-Lacs', '39130', zone_c_id, 2000.00),
    ('Orgelet', '39270', zone_c_id, 1650.00),
    ('Saint-Amour', '39160', zone_c_id, 1700.00),
    ('Moirans-en-Montagne', '39260', zone_c_id, 1650.00)
  ON CONFLICT (nom) DO NOTHING;

  -- Villages et secteurs ruraux (Zone D)
  INSERT INTO estimation_communes (nom, code_postal, zone_id, prix_m2_reference) VALUES
    ('Chaussin', '39120', zone_d_id, 1600.00),
    ('Crotenay', '39300', zone_d_id, 1500.00),
    ('Château-Chalon', '39210', zone_d_id, 1650.00),
    ('Nozeroy', '39250', zone_d_id, 1400.00),
    ('Syam', '39300', zone_d_id, 1500.00),
    ('Voiteur', '39210', zone_d_id, 1600.00),
    ('Beaufort', '39190', zone_d_id, 1550.00),
    ('Chaumergy', '39230', zone_d_id, 1450.00),
    ('Colonne', '39800', zone_d_id, 1500.00),
    ('Conliège', '39570', zone_d_id, 1650.00),
    ('Baume-les-Messieurs', '39210', zone_d_id, 1700.00),
    ('Lemuy', '39110', zone_d_id, 1450.00),
    ('Mièges', '39800', zone_d_id, 1500.00),
    ('Plasne', '39210', zone_d_id, 1550.00),
    ('Publy', '39570', zone_d_id, 1600.00),
    ('Saint-Lothain', '39230', zone_d_id, 1450.00),
    ('Aumont', '39800', zone_d_id, 1500.00),
    ('Pont-de-Poitte', '39130', zone_d_id, 1550.00),
    ('Cernans', '39380', zone_d_id, 1500.00),
    ('Ounans', '39380', zone_d_id, 1550.00)
  ON CONFLICT (nom) DO NOTHING;

  -- Communes périurbaines Dole (Zone A)
  INSERT INTO estimation_communes (nom, code_postal, zone_id, prix_m2_reference) VALUES
    ('Authume', '39100', zone_a_id, 2000.00),
    ('Azans', '39320', zone_a_id, 1950.00),
    ('Brevans', '39100', zone_a_id, 2050.00),
    ('Champvans', '39100', zone_a_id, 2100.00),
    ('Foucherans', '39100', zone_a_id, 2000.00),
    ('Gevry', '39100', zone_a_id, 1950.00),
    ('Menotey', '39290', zone_a_id, 1900.00),
    ('Rochefort-sur-Nenon', '39700', zone_a_id, 2000.00),
    ('Sampans', '39100', zone_a_id, 2150.00)
  ON CONFLICT (nom) DO NOTHING;

  -- Communes périurbaines Lons (Zone B)
  INSERT INTO estimation_communes (nom, code_postal, zone_id, prix_m2_reference) VALUES
    ('Chille', '39570', zone_b_id, 1950.00),
    ('Courbouzon', '39570', zone_b_id, 2000.00),
    ('Messia-sur-Sorne', '39570', zone_b_id, 1900.00),
    ('Montaigu', '39570', zone_b_id, 1950.00),
    ('Vernantois', '39570', zone_b_id, 1900.00)
  ON CONFLICT (nom) DO NOTHING;

  -- Haut-Jura touristique (Zone C - prix plus élevés)
  INSERT INTO estimation_communes (nom, code_postal, zone_id, prix_m2_reference) VALUES
    ('Prémanon', '39220', zone_c_id, 2400.00),
    ('Lamoura', '39310', zone_c_id, 2300.00),
    ('Bois-d''Amont', '39220', zone_c_id, 2200.00),
    ('La Pesse', '39370', zone_c_id, 2000.00),
    ('Lajoux', '39310', zone_c_id, 1950.00),
    ('Septmoncel', '39310', zone_c_id, 1850.00)
  ON CONFLICT (nom) DO NOTHING;

  -- Région des lacs (Zone C)
  INSERT INTO estimation_communes (nom, code_postal, zone_id, prix_m2_reference) VALUES
    ('Bonlieu', '39130', zone_c_id, 1900.00),
    ('Châtelneuf', '39130', zone_c_id, 1850.00),
    ('Doucier', '39130', zone_c_id, 1950.00),
    ('Grande-Rivière', '39150', zone_c_id, 1800.00),
    ('Marigny', '39130', zone_c_id, 1850.00),
    ('Ménétrux-en-Joux', '39130', zone_c_id, 1800.00),
    ('Le Frasnois', '39130', zone_c_id, 1900.00)
  ON CONFLICT (nom) DO NOTHING;

  -- Vignoble jurassien (Zone C - attractif)
  INSERT INTO estimation_communes (nom, code_postal, zone_id, prix_m2_reference) VALUES
    ('Ménétru-le-Vignoble', '39210', zone_c_id, 1750.00),
    ('Pupillin', '39600', zone_c_id, 2000.00),
    ('Montigny-lès-Arsures', '39600', zone_c_id, 1950.00),
    ('Le Vernois', '39210', zone_c_id, 1700.00),
    ('Lavigny', '39210', zone_c_id, 1650.00)
  ON CONFLICT (nom) DO NOTHING;

  RAISE NOTICE 'Seed communes Jura 39 terminé avec succès';
END $$;
