"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = databaseConfig;
const cabinet_entity_1 = require("../entities/cabinet.entity");
const disponibilite_entity_1 = require("../entities/disponibilite.entity");
const medecin_entity_1 = require("../entities/medecin.entity");
const patient_entity_1 = require("../entities/patient.entity");
const rendez_vous_entity_1 = require("../entities/rendez-vous.entity");
const specialite_entity_1 = require("../entities/specialite.entity");
function databaseConfig(config) {
    return {
        type: 'mysql',
        host: config.get('DB_HOST', '127.0.0.1'),
        port: Number(config.get('DB_PORT', '3306')),
        username: config.get('DB_USER', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_NAME', 'medbook'),
        entities: [specialite_entity_1.Specialite, medecin_entity_1.Medecin, cabinet_entity_1.Cabinet, patient_entity_1.Patient, disponibilite_entity_1.Disponibilite, rendez_vous_entity_1.RendezVous],
        synchronize: false,
        timezone: 'local',
    };
}
//# sourceMappingURL=database.config.js.map