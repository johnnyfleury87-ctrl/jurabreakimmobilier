-- Migration 0003: Triggers
-- Trigger pour limiter à 8 photos maximum par annonce
CREATE OR REPLACE FUNCTION enforce_max_8_photos()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  photo_count INTEGER;
BEGIN
  -- Compter le nombre de photos pour cette annonce
  SELECT COUNT(*) INTO photo_count
  FROM annonce_photos
  WHERE annonce_id = NEW.annonce_id;
  
  -- Si on dépasse 8, rejeter l'insertion
  IF photo_count >= 8 THEN
    RAISE EXCEPTION 'Maximum 8 photos par annonce';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_max_photos_before_insert
  BEFORE INSERT ON annonce_photos
  FOR EACH ROW
  EXECUTE FUNCTION enforce_max_8_photos();

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Appliquer le trigger updated_at sur toutes les tables pertinentes
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_agence_settings_updated_at
  BEFORE UPDATE ON agence_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_annonces_updated_at
  BEFORE UPDATE ON annonces
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_estimations_updated_at
  BEFORE UPDATE ON estimations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
