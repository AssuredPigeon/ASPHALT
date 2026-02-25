/**
 * Import calles de Tijuana y Tecate desde OpenStreetMap (Overpass API)
 *
 * - Descarga calles con nombre (highway=* + name=*)
 * - Mapea tag "surface" de OSM → tipos_superficie
 * - Inserta en tabla "calles" con geometría LINESTRING PostGIS
 * - Crea registro inicial en "estado_calle" (indice_calidad = 50)
 * - Crea índice GiST si no existe
 *
 * Uso: node backend/scripts/import-calles.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');
const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// ── Configuración de ciudades ──────────────────────────────────────────────
const CIUDADES = [
    {
        nombre: 'Tijuana',
        bbox: { south: 32.35, west: -117.12, north: 32.58, east: -116.85 },
    },
    {
        nombre: 'Tecate',
        bbox: { south: 32.52, west: -116.68, north: 32.60, east: -116.58 },
    },
];

// ── Mapeo OSM surface tag → tipos_superficie.nombre ────────────────────────
const SURFACE_MAP = {
    asphalt: 'Asfalto',
    paved: 'Asfalto',
    concrete: 'Concreto',
    'concrete:plates': 'Concreto',
    'concrete:lanes': 'Concreto',
    paving_stones: 'Adoquín',
    cobblestone: 'Adoquín',
    sett: 'Adoquín',
    unpaved: 'Terracería',
    dirt: 'Terracería',
    earth: 'Terracería',
    mud: 'Terracería',
    ground: 'Terracería',
    sand: 'Terracería',
    gravel: 'Grava',
    fine_gravel: 'Grava',
    compacted: 'Grava',
    unhewn_cobblestone: 'Empedrado',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function overpassQuery(bbox) {
    const { south, west, north, east } = bbox;
    return `
[out:json][timeout:120];
(
  way["highway"]["name"](${south},${west},${north},${east});
);
out body;
>;
out skel qt;
  `.trim();
}

function fetchOverpass(query) {
    return new Promise((resolve, reject) => {
        const body = `data=${encodeURIComponent(query)}`;
        const options = {
            hostname: 'overpass-api.de',
            path: '/api/interpreter',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = https.request(options, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                try {
                    const data = JSON.parse(Buffer.concat(chunks).toString());
                    resolve(data);
                } catch (e) {
                    reject(new Error('Error parsing Overpass response: ' + e.message));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(180000, () => {
            req.destroy();
            reject(new Error('Overpass request timed out'));
        });
        req.write(body);
        req.end();
    });
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
    const client = await pool.connect();

    try {
        // 1. Cargar mapa de tipos_superficie desde BD
        const tiposResult = await client.query('SELECT id_tipo, nombre FROM tipos_superficie');
        const tiposMap = {};
        for (const row of tiposResult.rows) {
            tiposMap[row.nombre.toLowerCase()] = row.id_tipo;
        }
        // El id del tipo "Desconocido"
        const ID_DESCONOCIDO = tiposMap['desconocido'];
        if (!ID_DESCONOCIDO) {
            console.error('ERROR: No existe tipo "Desconocido" en tipos_superficie. Ejecuta seed-tipos-superficie.js primero.');
            return;
        }
        console.log('Tipos de superficie cargados:', Object.keys(tiposMap).length);

        // 2. Crear índice GiST si no existe
        console.log('Creando índice GiST en calles.geometria (si no existe)...');
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_calles_geometria
      ON calles USING GIST (geometria)
    `);

        // 3. Procesar cada ciudad
        let totalCalles = 0;

        for (const ciudad of CIUDADES) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Procesando: ${ciudad.nombre}`);
            console.log(`Bbox: ${JSON.stringify(ciudad.bbox)}`);
            console.log('Consulta a Overpass API...');

            const data = await fetchOverpass(overpassQuery(ciudad.bbox));

            // Separar nodos y ways
            const nodes = {};
            const ways = [];

            for (const el of data.elements) {
                if (el.type === 'node') {
                    nodes[el.id] = { lat: el.lat, lon: el.lon };
                } else if (el.type === 'way') {
                    ways.push(el);
                }
            }

            console.log(`  Nodos: ${Object.keys(nodes).length}`);
            console.log(`  Ways (calles): ${ways.length}`);

            // Filtrar ways que tengan nombre y al menos 2 nodos válidos
            let insertados = 0;
            let omitidos = 0;
            let errores = 0;

            // Batch insert con transacción
            await client.query('BEGIN');

            for (let i = 0; i < ways.length; i++) {
                const way = ways[i];
                const nombre = way.tags?.name;
                if (!nombre) {
                    omitidos++;
                    continue;
                }

                const coords = [];
                for (const nodeId of way.nodes) {
                    const node = nodes[nodeId];
                    if (node) {
                        coords.push(node);
                    }
                }

                if (coords.length < 2) {
                    omitidos++;
                    continue;
                }

                const surfaceTag = way.tags?.surface?.toLowerCase();
                let surfaceName = surfaceTag ? SURFACE_MAP[surfaceTag] : null;
                let tipoSuperficie;

                if (surfaceName) {
                    tipoSuperficie = tiposMap[surfaceName.toLowerCase()] || ID_DESCONOCIDO;
                } else {
                    tipoSuperficie = ID_DESCONOCIDO;
                }

                const linestring = coords.map((c) => `${c.lon} ${c.lat}`).join(',');
                const wkt = `SRID=4326;LINESTRING(${linestring})`;

                try {
                    const res = await client.query(
                        `INSERT INTO calles (nombre, tipo_superficie, geometria)
             VALUES ($1, $2, ST_GeomFromEWKT($3))
             RETURNING id_calle`,
                        [nombre, tipoSuperficie, wkt]
                    );

                    await client.query(
                        `INSERT INTO estado_calle (id_calle, indice_calidad)
             VALUES ($1, 50)`,
                        [res.rows[0].id_calle]
                    );

                    insertados++;
                } catch (err) {
                    errores++;
                    if (errores <= 5) {
                        console.error(`  Error en "${nombre}": ${err.message}`);
                    }
                }

                // Progreso cada 1000 calles
                if ((i + 1) % 1000 === 0) {
                    console.log(`  Progreso: ${i + 1}/${ways.length} (insertadas: ${insertados})`);
                }
            }

            await client.query('COMMIT');
            console.log(`\n  Resultados ${ciudad.nombre}:`);
            console.log(`    Insertadas: ${insertados}`);
            console.log(`    Omitidas (sin nombre / duplicada): ${omitidos}`);
            console.log(`    Errores: ${errores}`);
            totalCalles += insertados;

            // Pausa entre ciudades para no saturar Overpass
            if (CIUDADES.indexOf(ciudad) < CIUDADES.length - 1) {
                console.log('\n  Esperando 10s antes de la siguiente ciudad...');
                await sleep(10000);
            }
        }

        // 4. Resumen final
        console.log(`\n${'='.repeat(60)}`);
        console.log('RESUMEN FINAL');
        console.log(`${'='.repeat(60)}`);
        const countCalles = await client.query('SELECT COUNT(*) as total FROM calles');
        const countEstado = await client.query('SELECT COUNT(*) as total FROM estado_calle');
        console.log(`Total calles en BD:        ${countCalles.rows[0].total}`);
        console.log(`Total estado_calle en BD:  ${countEstado.rows[0].total}`);
        console.log(`Calles insertadas hoy:     ${totalCalles}`);

        // Muestra top 10 calles por nombre
        const sample = await client.query(
            `SELECT c.id_calle, c.nombre, ts.nombre as superficie,
              ST_AsText(ST_Centroid(c.geometria)) as centro
       FROM calles c
       JOIN tipos_superficie ts ON c.tipo_superficie = ts.id_tipo
       ORDER BY c.id_calle DESC
       LIMIT 10`
        );
        console.log('\nÚltimas 10 calles importadas:');
        console.table(sample.rows);

    } catch (err) {
        await client.query('ROLLBACK').catch(() => { });
        console.error('ERROR GENERAL:', err.message);
        console.error(err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
