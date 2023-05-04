const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const app = require('./app');

app.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
})
