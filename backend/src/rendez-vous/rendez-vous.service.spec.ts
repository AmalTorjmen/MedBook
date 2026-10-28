import {
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { StatutRendezVous } from '../entities/statut-rendez-vous.enum';
import { RendezVousService } from './rendez-vous.service';

const CRENEAU_FUTUR = {
  idDisponibilite: 10,
  date: '2099-01-01',
  heureDebut: '09:00:00',
  heureFin: '09:30:00',
  medecin: { idMedecin: 1, nomComplet: 'Dr Sami Ben Ali' },
  cabinet: { idCabinet: 1, nom: 'Cabinet A', emplacement: 'Bloc 1' },
};
const PATIENT = { idPatient: 5, nomComplet: 'Amal Torjmane', courriel: 'amal@example.com' };

function creerService() {
  const manager = {};
  const dataSource = {
    transaction: jest.fn((cb: (m: unknown) => Promise<unknown>) => cb(manager)),
  };
  const rdvRepo = {
    existeReservationConfirmee: jest.fn().mockResolvedValue(false),
    enregistrer: jest.fn().mockResolvedValue({ idRendezVous: 100 }),
    trouverParIdDetaille: jest.fn().mockResolvedValue({
      idRendezVous: 100,
      statut: StatutRendezVous.CONFIRME,
      motif: 'Contrôle',
      dateCreation: new Date(),
      patient: PATIENT,
      disponibilite: CRENEAU_FUTUR,
    }),
  };
  const dispoRepo = {
    trouverParIdAvecVerrou: jest.fn().mockResolvedValue({ ...CRENEAU_FUTUR }),
  };
  const patientRepo = { trouverParId: jest.fn().mockResolvedValue(PATIENT) };
  const notifications = { envoyerConfirmationReservation: jest.fn() };

  const service = new RendezVousService(
    dataSource as never,
    rdvRepo as never,
    dispoRepo as never,
    patientRepo as never,
    notifications as never,
  );
  return { service, manager, dataSource, rdvRepo, dispoRepo, patientRepo, notifications };
}

describe('RendezVousService.reserver (UC2)', () => {
  it('réserve un créneau libre dans une transaction avec verrou et notifie', async () => {
    const { service, manager, dataSource, rdvRepo, dispoRepo, notifications } = creerService();

    const res = await service.reserver(5, { idDisponibilite: 10, motif: ' Contrôle ' });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(dispoRepo.trouverParIdAvecVerrou).toHaveBeenCalledWith(10, manager);
    expect(rdvRepo.enregistrer).toHaveBeenCalledWith(
      { idPatient: 5, idDisponibilite: 10, motif: 'Contrôle' },
      manager,
    );
    expect(res.statut).toBe(StatutRendezVous.CONFIRME);
    expect(res.medecin.nomComplet).toBe('Dr Sami Ben Ali');
    expect(res.creneau.date).toBe('2099-01-01');
    expect(notifications.envoyerConfirmationReservation).toHaveBeenCalledWith(
      expect.objectContaining({ idRendezVous: 100, courrielPatient: 'amal@example.com' }),
    );
  });

  it('enregistre un motif absent comme null', async () => {
    const { service, rdvRepo } = creerService();
    await service.reserver(5, { idDisponibilite: 10 });
    expect(rdvRepo.enregistrer).toHaveBeenCalledWith(
      expect.objectContaining({ motif: null }),
      expect.anything(),
    );
  });

  it('refuse si le patient est inconnu (404)', async () => {
    const { service, patientRepo, rdvRepo } = creerService();
    patientRepo.trouverParId.mockResolvedValue(null);
    await expect(service.reserver(5, { idDisponibilite: 10 })).rejects.toBeInstanceOf(NotFoundException);
    expect(rdvRepo.enregistrer).not.toHaveBeenCalled();
  });

  it('refuse si le créneau n’existe pas / a été supprimé (404, A2)', async () => {
    const { service, dispoRepo, rdvRepo } = creerService();
    dispoRepo.trouverParIdAvecVerrou.mockResolvedValue(null);
    await expect(service.reserver(5, { idDisponibilite: 10 })).rejects.toBeInstanceOf(NotFoundException);
    expect(rdvRepo.enregistrer).not.toHaveBeenCalled();
  });

  it('refuse un créneau dans le passé (422)', async () => {
    const { service, dispoRepo, rdvRepo } = creerService();
    dispoRepo.trouverParIdAvecVerrou.mockResolvedValue({ ...CRENEAU_FUTUR, date: '2000-01-01' });
    await expect(service.reserver(5, { idDisponibilite: 10 })).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(rdvRepo.enregistrer).not.toHaveBeenCalled();
  });

  it('refuse un créneau déjà réservé (409, A1) sans notifier', async () => {
    const { service, rdvRepo, notifications } = creerService();
    rdvRepo.existeReservationConfirmee.mockResolvedValue(true);
    await expect(service.reserver(5, { idDisponibilite: 10 })).rejects.toBeInstanceOf(ConflictException);
    expect(rdvRepo.enregistrer).not.toHaveBeenCalled();
    expect(notifications.envoyerConfirmationReservation).not.toHaveBeenCalled();
  });

  it('convertit la violation d’unicité MySQL (course concurrente) en 409', async () => {
    const { service, rdvRepo, notifications } = creerService();
    rdvRepo.enregistrer.mockRejectedValue({ driverError: { errno: 1062 } });
    await expect(service.reserver(5, { idDisponibilite: 10 })).rejects.toBeInstanceOf(ConflictException);
    expect(notifications.envoyerConfirmationReservation).not.toHaveBeenCalled();
  });

  it('convertit un deadlock MySQL en 503', async () => {
    const { service, rdvRepo } = creerService();
    rdvRepo.enregistrer.mockRejectedValue({ errno: 1213 });
    await expect(service.reserver(5, { idDisponibilite: 10 })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('ne touche pas à la réservation si la notification échoue (A5)', async () => {
    const { service, notifications } = creerService();
    // le service de notification ne lève jamais : l’envoi est asynchrone et protégé
    notifications.envoyerConfirmationReservation.mockImplementation(() => undefined);
    await expect(service.reserver(5, { idDisponibilite: 10 })).resolves.toMatchObject({
      idRendezVous: 100,
    });
  });
});
