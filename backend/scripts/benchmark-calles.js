/**
 * Benchmark: medir tiempos de queries espaciales y evaluar índices
 * Cubre SCRUM-51
 *
 * Uso: node backend/scripts/benchmark-calles.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function benchmark() {
    const client = await pool.connect();
    const resultados = [];

    try {
        console.log('=== BENCHMARK DE QUERIES ESPACIALES ===\n');

        // ── 1. Estadísticas generales ──
        const stats = await client.query(`
      SELECT 
        COUNT(*) as total_calles,
        COUNT(DISTINCT tipo_superficie) as tipos_superficie
      FROM calles
    `);
        const porTipo = await client.query(`
      SELECT ts.nombre, COUNT(*) as cantidad
      FROM calles c
      JOIN tipos_superficie ts ON c.tipo_superficie = ts.id_tipo
      GROUP BY ts.nombre
      ORDER BY cantidad DESC
    `);
        console.log(`Total calles: ${stats.rows[0].total_calles}`);
        console.log('\nDistribución por tipo de superficie:');
        console.table(porTipo.rows);

        // ── 2. Nearest street (punto en Tijuana centro) ──
        const puntos = [
            { nombre: 'Tijuana Centro', lng: -117.02, lat: 32.53 },
            { nombre: 'Zona Río', lng: -116.97, lat: 32.52 },
            { nombre: 'Playas de TJ', lng: -117.09, lat: 32.53 },
            { nombre: 'Tecate Centro', lng: -116.63, lat: 32.57 },
        ];

        console.log('\n--- Búsqueda de calle más cercana (nearest street) ---');
        for (const p of puntos) {
            const t0 = Date.now();
            const res = await client.query(
                `SELECT c.id_calle, c.nombre, ts.nombre as superficie,
                ST_Distance(
                  c.geometria::geography,
                  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                ) as distancia_m
         FROM calles c
         JOIN tipos_superficie ts ON c.tipo_superficie = ts.id_tipo
         WHERE c.geometria IS NOT NULL
         ORDER BY c.geometria <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
         LIMIT 1`,
                [p.lng, p.lat]
            );
            const t1 = Date.now();
            const r = res.rows[0];
            const tiempo = t1 - t0;
            console.log(`  ${p.nombre}: "${r.nombre}" (${r.superficie}) a ${Math.round(r.distancia_m)}m — ${tiempo}ms`);
            resultados.push({ query: `Nearest: ${p.nombre}`, tiempo_ms: tiempo });
        }

        // ── 3. Viewport query (bounding box) ──
        console.log('\n--- Búsqueda por viewport (bounding box) ---');
        const viewports = [
            { nombre: 'Tijuana completa', lat_min: 32.35, lat_max: 32.58, lng_min: -117.12, lng_max: -116.85 },
            { nombre: 'Zona centro 1km²', lat_min: 32.525, lat_max: 32.535, lng_min: -117.03, lng_max: -117.02 },
            { nombre: 'Tecate completa', lat_min: 32.52, lat_max: 32.60, lng_min: -116.68, lng_max: -116.58 },
        ];

        for (const v of viewports) {
            const t0 = Date.now();
            const res = await client.query(
                `SELECT COUNT(*) as total FROM calles
         WHERE geometria && ST_MakeEnvelope($1, $2, $3, $4, 4326)`,
                [v.lng_min, v.lat_min, v.lng_max, v.lat_max]
            );
            const t1 = Date.now();
            const tiempo = t1 - t0;
            console.log(`  ${v.nombre}: ${res.rows[0].total} calles — ${tiempo}ms`);
            resultados.push({ query: `Viewport: ${v.nombre}`, tiempo_ms: tiempo });
        }

        // ── 4. Recálculo de índice de calidad ──
        console.log('\n--- Recálculo de índice de calidad ---');
        const muestra = await client.query('SELECT id_calle FROM calles ORDER BY RANDOM() LIMIT 5');
        for (const row of muestra.rows) {
            const t0 = Date.now();
            const anomalias = await client.query(
                `SELECT COUNT(*) as total FROM anomalias
         WHERE id_calle = $1 AND estado != 'resuelto'`,
                [row.id_calle]
            );
            const total = parseInt(anomalias.rows[0].total);
            const indice = Math.max(0, Math.min(100, 100 - (total * 10)));
            await client.query(
                `INSERT INTO estado_calle (id_calle, indice_calidad) VALUES ($1, $2)`,
                [row.id_calle, indice]
            );
            const t1 = Date.now();
            const tiempo = t1 - t0;
            console.log(`  Calle ${row.id_calle}: ${total} anomalías → calidad ${indice} — ${tiempo}ms`);
            resultados.push({ query: `Recalcular: calle ${row.id_calle}`, tiempo_ms: tiempo });
        }

        // ── 5. Estado de calles (ranking peores) ──
        console.log('\n--- Ranking de peores calles ---');
        const t0 = Date.now();
        const ranking = await client.query(
            `SELECT DISTINCT ON (ec.id_calle) ec.id_calle, c.nombre, ec.indice_calidad,
              ts.nombre as superficie
       FROM estado_calle ec
       JOIN calles c ON ec.id_calle = c.id_calle
       JOIN tipos_superficie ts ON c.tipo_superficie = ts.id_tipo
       ORDER BY ec.id_calle, ec.fecha_actualizacion DESC`
        );
        const t1 = Date.now();
        const sorted = ranking.rows.sort((a, b) => a.indice_calidad - b.indice_calidad);
        console.log(`  Query ranking: ${t1 - t0}ms (${ranking.rows.length} calles)`);
        console.log('  Top 5 peores:');
        console.table(sorted.slice(0, 5));
        resultados.push({ query: 'Ranking peores calles', tiempo_ms: t1 - t0 });

        // ── Resumen final ──
        console.log('\n=== RESUMEN DE TIEMPOS ===');
        console.table(resultados);

        const promedio = resultados.reduce((s, r) => s + r.tiempo_ms, 0) / resultados.length;
        console.log(`\nPromedio general: ${Math.round(promedio)}ms`);
        console.log(`Máximo: ${Math.max(...resultados.map(r => r.tiempo_ms))}ms`);
        console.log(`Mínimo: ${Math.min(...resultados.map(r => r.tiempo_ms))}ms`);

    } catch (err) {
        console.error('ERROR:', err.message);
        console.error(err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

benchmark(); lis