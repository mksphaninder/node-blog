import mongodb from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
mongodb.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    module.exports = client;
    const app = require('./app')
    app.listen(process.env.PORT);
});