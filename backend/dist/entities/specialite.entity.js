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
exports.Specialite = void 0;
const typeorm_1 = require("typeorm");
const medecin_entity_1 = require("./medecin.entity");
let Specialite = class Specialite {
    idSpecialite;
    nom;
    description;
    medecins;
};
exports.Specialite = Specialite;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_specialite' }),
    __metadata("design:type", Number)
], Specialite.prototype, "idSpecialite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], Specialite.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Specialite.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => medecin_entity_1.Medecin, (medecin) => medecin.specialite),
    __metadata("design:type", Array)
], Specialite.prototype, "medecins", void 0);
exports.Specialite = Specialite = __decorate([
    (0, typeorm_1.Entity)('specialite')
], Specialite);
//# sourceMappingURL=specialite.entity.js.map