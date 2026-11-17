"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RendezVous = void 0;
const typeorm_1 = require("typeorm");
const disponibilite_entity_1 = require("./disponibilite.entity");
const patient_entity_1 = require("./patient.entity");
const statut_rendez_vous_enum_1 = require("./statut-rendez-vous.enum");
let RendezVous = class RendezVous {
    idRendezVous;
    dateCreation;
    statut;
    motif;
    idPatient;
    idDisponibilite;
    creneauConfirmeId;
    patient;
    disponibilite;
};
exports.RendezVous = RendezVous;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_rendez_vous' }),
    __metadata("design:type", Number)
], RendezVous.prototype, "idRendezVous", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'date_creation', type: 'datetime' }),
    __metadata("design:type", Date)
], RendezVous.prototype, "dateCreation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: statut_rendez_vous_enum_1.StatutRendezVous,
        default: statut_rendez_vous_enum_1.StatutRendezVous.CONFIRME,
    }),
    __metadata("design:type", String)
], RendezVous.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], RendezVous.prototype, "motif", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_patient', type: 'int' }),
    __metadata("design:type", Number)
], RendezVous.prototype, "idPatient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_disponibilite', type: 'int' }),
    __metadata("design:type", Number)
], RendezVous.prototype, "idDisponibilite", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'creneau_confirme_id',
        type: 'int',
        nullable: true,
        insert: false,
        update: false,
    }),
    __metadata("design:type", Object)
], RendezVous.prototype, "creneauConfirmeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.rendezVous, {
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'id_patient' }),
    __metadata("design:type", patient_entity_1.Patient)
], RendezVous.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => disponibilite_entity_1.Disponibilite, (dispo) => dispo.rendezVous, {
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'id_disponibilite' }),
    __metadata("design:type", disponibilite_entity_1.Disponibilite)
], RendezVous.prototype, "disponibilite", void 0);
exports.RendezVous = RendezVous = __decorate([
    (0, typeorm_1.Entity)('rendez_vous')
], RendezVous);
//# sourceMappingURL=rendez-vous.entity.js.map