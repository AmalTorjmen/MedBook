import { Injectable, Logger } from '@nestjs/common';

export interface ConfirmationReservation {
  idRendezVous: number;
  courrielPatient: string;
  nomPatient: string;
  nomMedecin: string;
  nomCabinet: string;
  date: string;
  heureDebut: string;
  heureFin: string;
}

/**
 * Acteur secondaire « Système de notification ».
 *
 * Règle UC2 (scénario A5) : un échec de notification ne doit JAMAIS annuler
 * la réservation. L'envoi est donc asynchrone (non bloquant) avec
 * nouvelles tentatives. En production, remplacer `envoyer()` par un vrai
 * fournisseur (SMTP, SMS…) et les tentatives par une file (BullMQ, outbox).
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  /** Délais avant chaque nouvelle tentative (ms). Surchargeable pour les tests. */
  protected delaisReessai = [5_000, 30_000, 120_000];

  /** Lance l'envoi sans attendre le résultat et sans jamais lever d'erreur. */
  envoyerConfirmationReservation(payload: ConfirmationReservation): void {
    void this.tenterEnvoi(payload, 0);
  }

  private async tenterEnvoi(
    payload: ConfirmationReservation,
    tentative: number,
  ): Promise<void> {
    try {
      await this.envoyer(payload);
    } catch (erreur) {
      const message = erreur instanceof Error ? erreur.message : String(erreur);
      if (tentative < this.delaisReessai.length) {
        const delai = this.delaisReessai[tentative];
        this.logger.warn(
          `Notification RDV #${payload.idRendezVous} échouée (${message}). Nouvelle tentative dans ${delai} ms.`,
        );
        const timer = setTimeout(
          () => void this.tenterEnvoi(payload, tentative + 1),
          delai,
        );
        timer.unref();
      } else {
        this.logger.error(
          `Notification RDV #${payload.idRendezVous} abandonnée après ${tentative + 1} tentatives.`,
        );
      }
    }
  }

  /** Point d'extension : simulation d'envoi (journalisation). */
  protected async envoyer(payload: ConfirmationReservation): Promise<void> {
    this.logger.log(
      `[SIMULATION] Confirmation envoyée à ${payload.courrielPatient} : RDV #${payload.idRendezVous} ` +
        `avec ${payload.nomMedecin} le ${payload.date} de ${payload.heureDebut} à ${payload.heureFin} (${payload.nomCabinet}).`,
    );
  }
}
