/**
 * Seed: tipos_superficie
 * Inserta los tipos de superficie vial usados por ASPHALT.
 * Mapeo basado en tags OSM "surface".
 *
 * Uso: node backend/scripts/seed-tipos-superficie.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const TIPOS = [
    { nombre: 'Asfalto' },
    { nombre: 'Concreto' },
    { nombre: 'Adoquín' },
    { nombre: 'Terracería' },
    { nombre: 'Grava' },
    { nombre: 'Empedrado' },
    { nombre: 'Desconocido' },
];

async function seed() {
    const client = await pool.connect();
    try {
        console.log('Insertando tipos de superficie...\n');

        for (const tipo of TIPOS) {
            const exists = await client.query(
                'SELECT id_tipo FROM tipos_superficie WHERE nombre = $1',
                [tipo.nombre]
            );

            if (exists.rows.length > 0) {
                console.log(`  ✓ "${tipo.nombre}" ya existe (id=${exists.rows[0].id_tipo})`);
            } else {
                const res = await client.query(
                    'INSERT INTO tipos_superficie (nombre) VALUES ($1) RETURNING id_tipo',
                    [tipo.nombre]
                );
                console.log(`  + "${tipo.nombre}" insertado (id=${res.rows[0].id_tipo})`);
            }
        }

        // Mostrar tabla final
        const all = await client.query('SELECT * FROM tipos_superficie ORDER BY id_tipo');
        console.log('\n--- tipos_superficie ---');
        console.table(all.rows);
        console.log(`\nTotal: ${all.rows.length} tipos`);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
