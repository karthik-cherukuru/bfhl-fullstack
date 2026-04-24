const express = require('express');
const cors = require('cors');
const bfhlRouter = require('./routes/bfhl');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/bfhl', bfhlRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
