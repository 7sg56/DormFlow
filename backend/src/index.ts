// Entry point for the backend
import express from 'express';

const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Backend initialized');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
