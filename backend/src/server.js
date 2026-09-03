import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import ordersRouter from './routes/orders.js';
import servicesRouter from './routes/services.js';
import agentRouter from './routes/agent.js';
import { generalLimiter, strictLimiter } from './middleware/rateLimiter.js';

const app = express();

app.use(cors());               // izinkan frontend (beda origin) akses API ini
app.use(express.json());       // otomatis parse body JSON masuk jadi req.body
app.use(generalLimiter);       // rate limit global untuk semua endpoint

// Endpoint kesehatan — dipakai UptimeRobot untuk cek server hidup atau tidak
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/orders', ordersRouter);
app.use('/services', servicesRouter);
app.use('/agent', strictLimiter, agentRouter); // limit lebih ketat karena panggil API AI (ada biaya)

// Error handler paling bawah — menangkap error yang tidak sengaja lolos
// dari semua route di atas, supaya server tidak crash total.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan di server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
