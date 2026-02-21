
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const vehiculosRoutes = require('./routes/vehiculos.routes');
const viajesRoutes = require('./routes/viajes.routes');
const anomaliasRoutes = require('./routes/anomalias.routes');
const usersRoutes = require('./routes/users.routes');
const gamificacionRoutes = require('./routes/gamificacion.routes');
const callesRoutes = require('./routes/calles.routes');
const alertasRoutes = require('./routes/alertas.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/anomalias', anomaliasRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/gamificacion', gamificacionRoutes);
app.use('/api/calles', callesRoutes);
app.use('/api/alertas', alertasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en puerto ${PORT}`);
});
