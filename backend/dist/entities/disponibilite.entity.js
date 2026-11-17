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
exports.Disponibilite = void 0;
const typeorm_1 = require("typeorm");
const cabinet_entity_1 = require("./cabinet.entity");
const medecin_entity_1 = require("./medecin.entity");
const rendez_vous_entity_1 = require("./rendez-vous.entity");
let Disponibilite = class Disponibilite {
    idDisponibilite;
    date;
    heureDebut;
    heureFin;
    idMedecin;
    idCabinet;
    medecin;
    cabinet;
    rendezVous;
};
exports.Disponibilite = Disponibilite;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_disponibilite' }),
    __metadata("design:type", Number)
], Disponibilite.prototype, "idDisponibilite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Disponibilite.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heure_debut', type: 'time' }),
    __metadata("design:type", String)
], Disponibilite.prototype, "heureDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heure_fin', type: 'time' }),
    __metadata("design:type", String)
], Disponibilite.prototype, "heureFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_medecin', type: 'int' }),
    __metadata("design:type", Number)
], Disponibilite.prototype, "idMedecin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_cabinet', type: 'int' }),
    __metadata("design:type", Number)
], Disponibilite.prototype, "idCabinet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => medecin_entity_1.Medecin, (medecin) => medecin.disponibilites, {
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'id_medecin' }),
    __metadata("design:type", medecin_entity_1.Medecin)
], Disponibilite.prototype, "medecin", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cabinet_entity_1.Cabinet, (cabinet) => cabinet.disponibilites, {
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'id_cabinet' }),
    __metadata("design:type", cabinet_entity_1.Cabinet)
], Disponibilite.prototype, "cabinet", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rendez_vous_entity_1.RendezVous, (rdv) => rdv.disponibilite),
    __metadata("design:type", Array)
], Disponibilite.prototype, "rendezVous", void 0);
exports.Disponibilite = Disponibilite = __decorate([
    (0, typeorm_1.Entity)('disponibilite')
], Disponibilite);
//# sourceMappingURL=disponibilite.entity.js.map