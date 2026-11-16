-- ============================================================
-- MedBook - Schéma de base de données (MySQL / MariaDB XAMPP)
-- Import : phpMyAdmin > Importer, ou
--   C:\xampp\mysql\bin\mysql.exe -u root < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS medbook
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET NAMES utf8mb4;
USE medbook;

CREATE TABLE IF NOT EXISTS specialite (
  id_specialite INT AUTO_INCREMENT PRIMARY KEY,
  nom           VARCHAR(100) NOT NULL UNIQUE,
  description   VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medecin (
  id_medecin    INT AUTO_INCREMENT PRIMARY KEY,
  nom_complet   VARCHAR(150) NOT NULL,
  courriel      VARCHAR(150) NOT NULL UNIQUE,
  id_specialite INT NOT NULL,
  CONSTRAINT fk_medecin_specialite
    FOREIGN KEY (id_specialite) REFERENCES specialite (id_specialite)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cabinet (
  id_cabinet  INT AUTO_INCREMENT PRIMARY KEY,
  nom         VARCHAR(100) NOT NULL,
  emplacement VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS patient (
  id_patient  INT AUTO_INCREMENT PRIMARY KEY,
  nom_complet VARCHAR(150) NOT NULL,
  courriel    VARCHAR(150) NOT NULL UNIQUE,
  telephone   VARCHAR(30)  NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS disponibilite (
  id_disponibilite INT AUTO_INCREMENT PRIMARY KEY,
  date             DATE NOT NULL,
  heure_debut      TIME NOT NULL,
  heure_fin        TIME NOT NULL,
  id_medecin       INT  NOT NULL,
  id_cabinet       INT  NOT NULL,
  CONSTRAINT fk_dispo_medecin FOREIGN KEY (id_medecin) REFERENCES medecin (id_medecin),
  CONSTRAINT fk_dispo_cabinet FOREIGN KEY (id_cabinet) REFERENCES cabinet (id_cabinet),
  -- Règle métier 2 : l'heure de fin est postérieure à l'heure de début
  CONSTRAINT chk_dispo_heures CHECK (heure_fin > heure_debut),
  -- Évite deux créneaux identiques pour un même médecin (le chevauchement partiel relève de l'UC4)
  CONSTRAINT uq_dispo_medecin_debut UNIQUE (id_medecin, date, heure_debut),
  INDEX idx_dispo_medecin_date (id_medecin, date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rendez_vous (
  id_rendez_vous   INT AUTO_INCREMENT PRIMARY KEY,
  date_creation    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  statut           ENUM('CONFIRME','ANNULE') NOT NULL DEFAULT 'CONFIRME',
  motif            VARCHAR(255) NULL,
  id_patient       INT NOT NULL,
  id_disponibilite INT NOT NULL,

  -- Colonne générée : vaut id_disponibilite tant que le RDV est CONFIRME, sinon NULL.
  creneau_confirme_id INT
    GENERATED ALWAYS AS (IF(statut = 'CONFIRME', id_disponibilite, NULL)) STORED,

  CONSTRAINT fk_rdv_patient FOREIGN KEY (id_patient)       REFERENCES patient (id_patient),
  CONSTRAINT fk_rdv_dispo   FOREIGN KEY (id_disponibilite) REFERENCES disponibilite (id_disponibilite),

  -- Règles métier 4 et 6 : au plus UN rendez-vous CONFIRME par créneau.
  -- MySQL ne gère pas les index uniques partiels ; un UNIQUE sur une colonne
  -- générée (les NULL sont autorisés en multiples) produit le même effet
  -- et conserve l'historique des rendez-vous ANNULE.
  CONSTRAINT uq_rdv_un_confirme_par_creneau UNIQUE (creneau_confirme_id),

  INDEX idx_rdv_patient (id_patient),
  INDEX idx_rdv_dispo (id_disponibilite)
) ENGINE=InnoDB;
