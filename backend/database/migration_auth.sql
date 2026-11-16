-- MedBook - Authentification (à exécuter après schema.sql et seed.sql)
USE medbook;
ALTER TABLE patient ADD COLUMN mot_de_passe_hash VARCHAR(255) NULL;
-- Mot de passe de démonstration des patients du seed : medbook123
UPDATE patient SET mot_de_passe_hash = '6794945d2aab2afeb633fdf16a547950:9ead04a6d13cfcc9df5909cb3996d254c36b87bbe22ab920a4fac52648a7466a078e2d312dcbda51a8d1e2c4e5af6fbf0de098ae6623bd982d69c13816c96880' WHERE mot_de_passe_hash IS NULL;
