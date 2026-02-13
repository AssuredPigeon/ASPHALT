const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.zcjaxotvenizoloshlpn:luX3EANvKFY3jMkI@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;