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
exports.Medecin = void 0;
const typeorm_1 = require("typeorm");
const disponibilite_entity_1 = require("./disponibilite.entity");
const specialite_entity_1 = require("./specialite.entity");
let Medecin = class Medecin {
    idMedecin;
    nomComplet;
    courriel;
    idSpecialite;
    specialite;
    disponibilites;
};
exports.Medecin = Medecin;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_medecin' }),
    __metadata("design:type", Number)
], Medecin.prototype, "idMedecin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nom_complet', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Medecin.prototype, "nomComplet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, unique: true }),
    __metadata("design:type", String)
], Medecin.prototype, "courriel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_specialite', type: 'int' }),
    __metadata("design:type", Number)
], Medecin.prototype, "idSpecialite", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => specialite_entity_1.Specialite, (specialite) => specialite.medecins, {
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'id_specialite' }),
    __metadata("design:type", specialite_entity_1.Specialite)
], Medecin.prototype, "specialite", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => disponibilite_entity_1.Disponibilite, (dispo) => dispo.medecin),
    __metadata("design:type", Array)
], Medecin.prototype, "disponibilites", void 0);
exports.Medecin = Medecin = __decorate([
    (0, typeorm_1.Entity)('medecin')
], Medecin);
//# sourceMappingURL=medecin.entity.js.map