import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;


// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(cors());

// Path to services.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const servicesPath = path.join(__dirname, 'services.json');

// Endpoint to get all services
app.get('/api/services', (req, res) => {
  fs.readFile(servicesPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading services.json:', err);
      return res.status(500).json({ error: 'Failed to read services.json' });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to add a new service
app.post('/api/services', (req, res) => {
  const newService = req.body;

  fs.readFile(servicesPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading services.json:', err);
      return res.status(500).json({ error: 'Failed to read services.json' });
    }

    let services = JSON.parse(data);
    services.push(newService);

    fs.writeFile(servicesPath, JSON.stringify(services, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing to services.json:', err);
        return res.status(500).json({ error: 'Failed to update services.json' });
      }
      res.status(201).json({ message: 'Service added successfully' });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
