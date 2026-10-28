-- Données de démonstration pour tester l'UC2 (à exécuter après schema.sql)
USE medbook;

INSERT INTO specialite (nom, description) VALUES
  ('Cardiologie', 'Maladies du coeur et des vaisseaux'),
  ('Dermatologie', 'Maladies de la peau'),
  ('Pédiatrie', 'Santé des enfants');

INSERT INTO medecin (nom_complet, courriel, id_specialite) VALUES
  ('Dr Sami Ben Ali',  'sami.benali@medbook.tn', 1),
  ('Dr Leila Trabelsi', 'leila.trabelsi@medbook.tn', 2),
  ('Dr Youssef Gharbi', 'youssef.gharbi@medbook.tn', 3);

INSERT INTO cabinet (nom, emplacement) VALUES
  ('Cabinet A', 'Bloc 1 - 1er étage'),
  ('Cabinet B', 'Bloc 2 - Rez-de-chaussée');

INSERT INTO patient (nom_complet, courriel, telephone) VALUES
  ('Amal Torjmane',  'amal.torjmane@example.com', '20123456'),
  ('Nour Smadhi',    'nour.smadhi@example.com',   '22123456');

-- Créneaux futurs (relatifs à la date du jour)
INSERT INTO disponibilite (date, heure_debut, heure_fin, id_medecin, id_cabinet) VALUES
  (DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '09:30:00', 1, 1),
  (DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00', '10:00:00', 1, 1),
  (DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', '14:30:00', 2, 2),
  (DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:30:00', '15:00:00', 3, 2);

-- Un créneau déjà passé (pour tester la règle « pas dans le passé »)
INSERT INTO disponibilite (date, heure_debut, heure_fin, id_medecin, id_cabinet) VALUES
  (DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '09:30:00', 1, 1);
