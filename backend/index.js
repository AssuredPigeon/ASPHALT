const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.listen(3000, '0.0.0.0', () => {
  console.log('API corriendo en puerto 3000');
});
