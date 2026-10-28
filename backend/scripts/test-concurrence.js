/**
 * Test de charge UC2 : lance N réservations SIMULTANÉES du même créneau.
 * Résultat attendu : exactement 1 réponse 201, toutes les autres 409.
 *
 * Usage (API démarrée, base initialisée avec schema.sql + seed.sql) :
 *   node scripts/test-concurrence.js [idDisponibilite=1] [nombre=10]
 */
const BASE = process.env.API_URL || 'http://localhost:3000/api';
const idDisponibilite = Number(process.argv[2] || 1);
const n = Number(process.argv[3] || 10);

async function reserver(idPatient) {
  const res = await fetch(`${BASE}/rendez-vous`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-patient-id': String(idPatient) },
    body: JSON.stringify({ idDisponibilite, motif: `Test concurrence patient ${idPatient}` }),
  });
  return res.status;
}

(async () => {
  // Les patients 1 et 2 existent dans seed.sql ; on alterne entre eux.
  const statuts = await Promise.all(
    Array.from({ length: n }, (_, i) => reserver((i % 2) + 1)),
  );
  const compte = statuts.reduce((acc, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }), {});
  console.log('Codes HTTP obtenus :', compte);
  const ok = compte[201] === 1 && compte[409] === n - 1;
  console.log(ok ? 'OK : un seul rendez-vous confirmé.' : 'ÉCHEC : comportement inattendu.');
  process.exit(ok ? 0 : 1);
})();
