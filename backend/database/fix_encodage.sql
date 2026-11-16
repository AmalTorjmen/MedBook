-- Corrige les accents mal importés (ex. « P├®diatrie » au lieu de « Pédiatrie »).
-- Cause : seed.sql importé sans préciser l'encodage UTF-8.
SET NAMES utf8mb4;
USE medbook;
UPDATE specialite SET nom = 'Pédiatrie'   WHERE id_specialite = 3;
UPDATE specialite SET description = 'Maladies du coeur et des vaisseaux' WHERE id_specialite = 1;
UPDATE cabinet    SET emplacement = 'Bloc 1 - 1er étage'           WHERE id_cabinet = 1;
UPDATE cabinet    SET emplacement = 'Bloc 2 - Rez-de-chaussée'     WHERE id_cabinet = 2;
