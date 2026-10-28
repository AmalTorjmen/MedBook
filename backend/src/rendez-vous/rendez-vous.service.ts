import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DisponibiliteRepository } from '../disponibilites/disponibilite.repository';
import { Disponibilite } from '../entities/disponibilite.entity';
import { RendezVous } from '../entities/rendez-vous.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PatientRepository } from '../patients/patient.repository';
import { ReserverRendezVousDto } from './dto/reserver-rendez-vous.dto';
import { RendezVousResponseDto } from './dto/rendez-vous-response.dto';
import { RendezVousRepository } from './rendez-vous.repository';

const MYSQL_DOUBLON = 1062; // ER_DUP_ENTRY
const MYSQL_DEADLOCK = 1213; // ER_LOCK_DEADLOCK
const MYSQL_ATTENTE_VERROU = 1205; // ER_LOCK_WAIT_TIMEOUT

/**
 * UC2 – Réserver un rendez-vous médical.
 *
 * Protection contre les doubles réservations (document de conception §4.1) :
 *  1. vérification applicative avec message d'erreur clair ;
 *  2. transaction + verrou pessimiste sur la ligne du créneau (SELECT ... FOR UPDATE) ;
 *  3. contrainte UNIQUE en base (colonne générée `creneau_confirme_id`),
 *     dont la violation est convertie en erreur métier (409).
 */
@Injectable()
export class RendezVousService {
  private readonly logger = new Logger(RendezVousService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly rendezVousRepository: RendezVousRepository,
    private readonly disponibiliteRepository: DisponibiliteRepository,
    private readonly patientRepository: PatientRepository,
    private readonly notifications: NotificationsService,
  ) {}

  async reserver(
    idPatient: number,
    dto: ReserverRendezVousDto,
  ): Promise<RendezVousResponseDto> {
    let rendezVous: RendezVous;

    try {
      rendezVous = await this.dataSource.transaction((manager) =>
        this.executerReservation(manager, idPatient, dto),
      );
    } catch (erreur) {
      throw this.traduireErreurBase(erreur);
    }

    const reponse = this.versReponse(rendezVous);

    // Hors transaction : un échec de notification n'affecte pas la réservation (A5).
    this.notifications.envoyerConfirmationReservation({
      idRendezVous: reponse.idRendezVous,
      courrielPatient: rendezVous.patient.courriel,
      nomPatient: rendezVous.patient.nomComplet,
      nomMedecin: reponse.medecin.nomComplet,
      nomCabinet: reponse.cabinet.nom,
      date: reponse.creneau.date,
      heureDebut: reponse.creneau.heureDebut,
      heureFin: reponse.creneau.heureFin,
    });

    return reponse;
  }

  private async executerReservation(
    manager: EntityManager,
    idPatient: number,
    dto: ReserverRendezVousDto,
  ): Promise<RendezVous> {
    // Règle 1 : patient existant
    const patient = await this.patientRepository.trouverParId(idPatient, manager);
    if (!patient) {
      throw new NotFoundException('Patient introuvable.');
    }

    // Règle 1 : disponibilité existante (A2 : créneau supprimé) + verrou du créneau
    const dispo = await this.disponibiliteRepository.trouverParIdAvecVerrou(
      dto.idDisponibilite,
      manager,
    );
    if (!dispo) {
      throw new NotFoundException(
        "Ce créneau n'existe plus ou n'est plus proposé.",
      );
    }

    // Règle 3 : le créneau ne doit pas être dans le passé
    if (this.debutCreneau(dispo).getTime() <= Date.now()) {
      throw new UnprocessableEntityException(
        'Ce créneau est déjà passé et ne peut pas être réservé.',
      );
    }

    // Règles 3 et 4 : le créneau doit être libre (A1 : déjà réservé)
    if (
      await this.rendezVousRepository.existeReservationConfirmee(
        dispo.idDisponibilite,
        manager,
      )
    ) {
      throw new ConflictException(
        'Ce créneau vient d’être réservé. Veuillez choisir un autre créneau.',
      );
    }

    const cree = await this.rendezVousRepository.enregistrer(
      {
        idPatient,
        idDisponibilite: dispo.idDisponibilite,
        motif: dto.motif?.trim() || null,
      },
      manager,
    );

    const detaille = await this.rendezVousRepository.trouverParIdDetaille(
      cree.idRendezVous,
      manager,
    );
    if (!detaille) {
      throw new Error('Rendez-vous introuvable après enregistrement.');
    }
    return detaille;
  }

  /** Convertit les erreurs MySQL en erreurs métier (document §4.1, dernière ligne). */
  private traduireErreurBase(erreur: unknown): unknown {
    const e = erreur as {
      errno?: number;
      driverError?: { errno?: number };
    };
    const errno = e?.driverError?.errno ?? e?.errno;

    if (errno === MYSQL_DOUBLON) {
      return new ConflictException(
        'Ce créneau vient d’être réservé. Veuillez choisir un autre créneau.',
      );
    }
    if (errno === MYSQL_DEADLOCK || errno === MYSQL_ATTENTE_VERROU) {
      this.logger.warn(`Verrou de base de données non obtenu (errno ${errno}).`);
      return new ServiceUnavailableException(
        'Le système est momentanément occupé. Veuillez réessayer.',
      );
    }
    if (!(erreur instanceof Error) || !('getStatus' in erreur)) {
      this.logger.error('Échec de l’enregistrement du rendez-vous', erreur as Error);
    }
    return erreur;
  }

  /** Début du créneau en heure locale du serveur. */
  private debutCreneau(dispo: Disponibilite): Date {
    const date =
      (dispo.date as unknown) instanceof Date
        ? this.formaterDateLocale(dispo.date as unknown as Date)
        : String(dispo.date);
    const heure =
      dispo.heureDebut.length === 5 ? `${dispo.heureDebut}:00` : dispo.heureDebut;
    return new Date(`${date}T${heure}`);
  }

  private formaterDateLocale(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const jj = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${jj}`;
  }

  private versReponse(rdv: RendezVous): RendezVousResponseDto {
    const { disponibilite: dispo, patient } = rdv;
    return {
      idRendezVous: rdv.idRendezVous,
      statut: rdv.statut,
      motif: rdv.motif,
      dateCreation: rdv.dateCreation,
      patient: { idPatient: patient.idPatient, nomComplet: patient.nomComplet },
      medecin: {
        idMedecin: dispo.medecin.idMedecin,
        nomComplet: dispo.medecin.nomComplet,
      },
      cabinet: {
        idCabinet: dispo.cabinet.idCabinet,
        nom: dispo.cabinet.nom,
        emplacement: dispo.cabinet.emplacement,
      },
      creneau: {
        idDisponibilite: dispo.idDisponibilite,
        date: dispo.date,
        heureDebut: dispo.heureDebut,
        heureFin: dispo.heureFin,
      },
    };
  }
}
