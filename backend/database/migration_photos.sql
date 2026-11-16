-- MedBook - Photos des médecins et des patients (à exécuter après migration_auth.sql)
USE medbook;
ALTER TABLE medecin ADD COLUMN photo_url VARCHAR(255) NULL;
ALTER TABLE patient ADD COLUMN photo_url VARCHAR(255) NULL;

-- Facultatif : déposez vos images dans frontend/public/images/ puis, par exemple :
-- UPDATE medecin SET photo_url = '/images/medecins/1.jpg' WHERE id_medecin = 1;
-- UPDATE patient SET photo_url = '/images/patients/1.jpg' WHERE id_patient = 1;
-- Sans photo (ou si le fichier est introuvable), un avatar illustré est affiché.
