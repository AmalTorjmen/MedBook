import { ConflictException, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RendezVousController } from '../src/rendez-vous/rendez-vous.controller';
import { RendezVousService } from '../src/rendez-vous/rendez-vous.service';

/** Test HTTP du contrôleur (validation, garde, codes de retour) sans base de données. */
describe('POST /api/rendez-vous (UC2)', () => {
  let app: INestApplication;
  const service = { reserver: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RendezVousController],
      providers: [{ provide: RendezVousService, useValue: service }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => service.reserver.mockReset());

  it('401 sans patient authentifié', async () => {
    await request(app.getHttpServer()).post('/api/rendez-vous').send({ idDisponibilite: 1 }).expect(401);
    expect(service.reserver).not.toHaveBeenCalled();
  });

  it('400 si idDisponibilite est invalide', async () => {
    await request(app.getHttpServer())
      .post('/api/rendez-vous')
      .set('x-patient-id', '5')
      .send({ idDisponibilite: 'abc' })
      .expect(400);
  });

  it('400 si le corps contient des champs inconnus', async () => {
    await request(app.getHttpServer())
      .post('/api/rendez-vous')
      .set('x-patient-id', '5')
      .send({ idDisponibilite: 1, idPatient: 99 })
      .expect(400);
    expect(service.reserver).not.toHaveBeenCalled();
  });

  it('201 et délègue au service avec le patient de la session', async () => {
    service.reserver.mockResolvedValue({ idRendezVous: 100, statut: 'CONFIRME' });
    const res = await request(app.getHttpServer())
      .post('/api/rendez-vous')
      .set('x-patient-id', '5')
      .send({ idDisponibilite: 10, motif: 'Contrôle' })
      .expect(201);
    expect(res.body.idRendezVous).toBe(100);
    expect(service.reserver).toHaveBeenCalledWith(5, { idDisponibilite: 10, motif: 'Contrôle' });
  });

  it('409 quand le créneau est déjà pris', async () => {
    service.reserver.mockRejectedValue(new ConflictException('Créneau déjà réservé'));
    await request(app.getHttpServer())
      .post('/api/rendez-vous')
      .set('x-patient-id', '5')
      .send({ idDisponibilite: 10 })
      .expect(409);
  });
});
