import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── ROUTES ───
import webhookRoutes from './routes/webhooks';
import contactsRoutes from './routes/contacts';
import inventoryRoutes from './routes/inventory';
import pipelineRoutes from './routes/pipeline';
import financesRoutes from './routes/finances';
import appointmentsRoutes from './routes/appointments';
import contractsRoutes from './routes/contracts';
import chatsRoutes from './routes/chats';
import templatesRoutes from './routes/templates';
import campaignsRoutes from './routes/campaigns';
import settingsRoutes from './routes/settings';

app.use('/api/webhooks', webhookRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/finances', financesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/settings', settingsRoutes);

// ─── HEALTH CHECK ───
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Propify CRM API is running' });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Propify CRM API is up and running!');
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`🚀 Propify CRM API running on http://0.0.0.0:${port}`);
});
