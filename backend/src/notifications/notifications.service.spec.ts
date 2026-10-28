import { Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

const PAYLOAD = {
  idRendezVous: 1,
  courrielPatient: 'a@b.tn',
  nomPatient: 'A',
  nomMedecin: 'Dr X',
  nomCabinet: 'Cabinet A',
  date: '2099-01-01',
  heureDebut: '09:00:00',
  heureFin: '09:30:00',
};

class ServiceEchouant extends NotificationsService {
  appels = 0;
  constructor(private readonly echecs: number) {
    super();
    this.delaisReessai = [10, 10, 10];
  }
  protected async envoyer(): Promise<void> {
    this.appels++;
    if (this.appels <= this.echecs) throw new Error('SMTP indisponible');
  }
}

describe('NotificationsService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });
  afterEach(() => jest.restoreAllMocks());

  it('ne lève jamais d’erreur même si l’envoi échoue', () => {
    const service = new ServiceEchouant(99);
    expect(() => service.envoyerConfirmationReservation(PAYLOAD)).not.toThrow();
  });

  it('réessaie après un échec puis réussit', async () => {
    const service = new ServiceEchouant(2);
    service.envoyerConfirmationReservation(PAYLOAD);
    await new Promise((r) => setTimeout(r, 120));
    expect(service.appels).toBe(3);
  });

  it('abandonne après le nombre maximal de tentatives', async () => {
    const service = new ServiceEchouant(99);
    service.envoyerConfirmationReservation(PAYLOAD);
    await new Promise((r) => setTimeout(r, 150));
    expect(service.appels).toBe(4); // 1 essai + 3 réessais
  });
});
