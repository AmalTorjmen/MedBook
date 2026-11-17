import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { genererJeton } from '../../src/auth/token.util';
import { DisponibiliteRepository } from '../../src/disponibilites/disponibilite.repository';
import { PatientContextGuard } from '../../src/common/guards/patient-context.guard';
import { MedecinRepository } from '../../src/recherche/medecin.repository';
import { RechercheController } from '../../src/recherche/recherche.controller';
import { RechercheService } from '../../src/recherche/recherche.service';

jest.mock('../../src/disponibilites/disponibilite.repository', () => ({
  DisponibiliteRepository: class DisponibiliteRepository {},
}));

jest.mock('../../src/recherche/medecin.repository', () => ({
  MedecinRepository: class MedecinRepository {},
}));

describe('RechercheController + RechercheService (intégration HTTP UC1)', () => {
  const medecin = {
    idMedecin: 7,
    nomComplet: 'Dr Ada Lovelace',
    courriel: 'ada@example.test',
    photoUrl: null,
    specialite: { idSpecialite: 3, nom: 'Cardiologie' },
  };
  const creneau = {
    idDisponibilite: 12,
    date: '2099-06-15',
    heureDebut: '09:00',
    heureFin: '09:30',
    cabinet: { idCabinet: 4, nom: 'Centre', emplacement: 'Tunis' },
  };

  let app: INestApplication;
  let rechercher: jest.Mock;
  let trouverParId: jest.Mock;
  let rechercherLibresPourMedecin: jest.Mock;

  beforeEach(async () => {
    rechercher = jest.fn();
    trouverParId = jest.fn();
    rechercherLibresPourMedecin = jest.fn();

    const moduleRef = await Test.createTestingModule({
      controllers: [RechercheController],
      providers: [
        RechercheService,
        {
          provide: MedecinRepository,
          useValue: {
            rechercher,
            trouverParId,
            toutesSpecialites: jest.fn(),
            tousCabinets: jest.fn(),
          },
        },
        {
          provide: DisponibiliteRepository,
          useValue: { rechercherLibresPourMedecin },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useLogger(false);
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const patient = (path: string) =>
    request(app.getHttpServer()).get(path).set(
      'Authorization',
      `Bearer ${genererJeton(1, 'patient@example.test')}`,
    );

  it('UC1 A1 – répond à une recherche sans critères avec la liste des médecins', async () => {
    rechercher.mockResolvedValue([medecin]);

    await patient('/api/medecins').expect(200).expect([
      {
        idMedecin: 7,
        nomComplet: 'Dr Ada Lovelace',
        courriel: 'ada@example.test',
        photoUrl: null,
        specialite: { idSpecialite: 3, nom: 'Cardiologie' },
      },
    ]);
    expect(rechercher).toHaveBeenCalledWith({});
  });

  it('UC1 A2 – répond avec une liste vide si aucun médecin ne correspond', async () => {
    rechercher.mockResolvedValue([]);

    await patient('/api/medecins?nom=Inconnu').expect(200).expect([]);
    expect(rechercher).toHaveBeenCalledWith({ nom: 'Inconnu' });
  });

  it('UC1 A3 – renvoie la fiche médecin et aucun créneau si la liste est vide', async () => {
    trouverParId.mockResolvedValue(medecin);
    rechercherLibresPourMedecin.mockResolvedValue([]);

    await patient('/api/medecins/7/disponibilites')
      .expect(200)
      .expect({
        medecin: {
          idMedecin: 7,
          nomComplet: 'Dr Ada Lovelace',
          courriel: 'ada@example.test',
          photoUrl: null,
          specialite: { idSpecialite: 3, nom: 'Cardiologie' },
        },
        creneaux: [],
      });
    expect(rechercherLibresPourMedecin).toHaveBeenCalledWith(7);
  });

  it('renvoie les créneaux disponibles dans la réponse HTTP', async () => {
    trouverParId.mockResolvedValue(medecin);
    rechercherLibresPourMedecin.mockResolvedValue([creneau]);

    await patient('/api/medecins/7/disponibilites')
      .expect(200)
      .expect({
        medecin: {
          idMedecin: 7,
          nomComplet: 'Dr Ada Lovelace',
          courriel: 'ada@example.test',
          photoUrl: null,
          specialite: { idSpecialite: 3, nom: 'Cardiologie' },
        },
        creneaux: [creneau],
      });
  });

  it('exige une authentification pour accéder aux routes de recherche', async () => {
    await request(app.getHttpServer()).get('/api/medecins').expect(401);
  });

  it('UC1 A4 – renvoie une erreur HTTP si la recherche échoue techniquement', async () => {
    rechercher.mockRejectedValue(new Error('Base de données indisponible'));

    await patient('/api/medecins')
      .expect(500)
      .expect({ statusCode: 500, message: 'Internal server error' });
  });
});
