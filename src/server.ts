import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Bakery Billing API Server running on port ${PORT}`);
});
