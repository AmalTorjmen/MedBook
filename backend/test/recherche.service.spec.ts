import 'reflect-metadata';
import { DisponibiliteRepository } from '../src/disponibilites/disponibilite.repository';
import { MedecinRepository } from '../src/recherche/medecin.repository';
import { RechercheService } from '../src/recherche/recherche.service';

jest.mock('../src/disponibilites/disponibilite.repository', () => ({
  DisponibiliteRepository: class DisponibiliteRepository {},
}));

jest.mock('../src/recherche/medecin.repository', () => ({
  MedecinRepository: class MedecinRepository {},
}));

describe('RechercheService – UC1', () => {
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

  let medecins: jest.Mocked<Pick<MedecinRepository, 'rechercher' | 'trouverParId' | 'toutesSpecialites' | 'tousCabinets'>>;
  let disponibilites: jest.Mocked<Pick<DisponibiliteRepository, 'rechercherLibresPourMedecin'>>;
  let service: RechercheService;

  beforeEach(() => {
    medecins = {
      rechercher: jest.fn(),
      trouverParId: jest.fn(),
      toutesSpecialites: jest.fn(),
      tousCabinets: jest.fn(),
    };
    disponibilites = { rechercherLibresPourMedecin: jest.fn() };
    service = new RechercheService(
      medecins as MedecinRepository,
      disponibilites as DisponibiliteRepository,
    );
  });

  it('A1 – accepte une recherche sans critères et retourne les médecins trouvés', async () => {
    medecins.rechercher.mockResolvedValue([medecin] as never);

    await expect(service.rechercherMedecins({})).resolves.toEqual([
      {
        idMedecin: 7,
        nomComplet: 'Dr Ada Lovelace',
        courriel: 'ada@example.test',
        photoUrl: null,
        specialite: { idSpecialite: 3, nom: 'Cardiologie' },
      },
    ]);
    expect(medecins.rechercher).toHaveBeenCalledWith({});
  });

  it('A2 – retourne une liste vide lorsqu’aucun médecin ne correspond', async () => {
    medecins.rechercher.mockResolvedValue([]);

    await expect(service.rechercherMedecins({ nom: 'Inconnu' })).resolves.toEqual([]);
  });

  it('A3 – retourne la fiche du médecin avec une liste vide si aucun créneau n’est disponible', async () => {
    medecins.trouverParId.mockResolvedValue(medecin as never);
    disponibilites.rechercherLibresPourMedecin.mockResolvedValue([]);

    await expect(service.disponibilitesDuMedecin(7)).resolves.toEqual({
      medecin: {
        idMedecin: 7,
        nomComplet: 'Dr Ada Lovelace',
        courriel: 'ada@example.test',
        photoUrl: null,
        specialite: { idSpecialite: 3, nom: 'Cardiologie' },
      },
      creneaux: [],
    });
  });

  it('A4 – laisse remonter une erreur technique de recherche', async () => {
    const erreur = new Error('Base de données indisponible');
    medecins.rechercher.mockRejectedValue(erreur);

    await expect(service.rechercherMedecins({})).rejects.toBe(erreur);
  });

  it('A3 – signale un médecin inexistant au lieu de renvoyer une fiche vide', async () => {
    medecins.trouverParId.mockResolvedValue(null);

    await expect(service.disponibilitesDuMedecin(999)).rejects.toThrow('Médecin introuvable.');
    expect(disponibilites.rechercherLibresPourMedecin).not.toHaveBeenCalled();
  });
});

describe('Scénarios en attente – contrats non présents dans le backend', () => {
  it.todo('UC1 A4 – renvoyer au patient un message lui proposant de réessayer après une erreur technique');

  // UC2 : ces tests resteront commentés/todo tant que RendezVousService et son
  // contrôleur ne sont pas présents dans backend/src.
  it.todo('UC2 A1 – refuser un créneau réservé entre-temps (409) et inviter à en choisir un autre');
  it.todo('UC2 A2 – signaler qu’un créneau supprimé ou indisponible n’est plus proposé');
  it.todo('UC2 A3 – rejeter les données invalides (400) avec des erreurs de validation');
  it.todo('UC2 A4 – ne pas confirmer la réservation si son enregistrement échoue');
  it.todo('UC2 A5 – conserver la réservation après échec de notification et retenter l’envoi');
});
