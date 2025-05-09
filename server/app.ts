import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { queryOpenAIChat } from './controllers/openaiController';

console.log('✅ app.ts is actually running');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend! this is a test' });
});

app.post('/api/recommendations', queryOpenAIChat, (req, res) => {
  res.status(200).json({ message: res.locals.openaiResult });
});
console.log(process.env.PORT);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
