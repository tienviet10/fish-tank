const express = require('express');


const PORT = process.env.PORT || 8080;


const app = express();

app.use(express.static('public'));

app.listen(8080, () => {
  console.log(`Listening on port ${PORT}`);
});
