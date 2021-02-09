const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DBNAME,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log('mongodb connected');
}).catch((error) => console.log(error));

mongoose.connection.on('connected', () => {
    console.log('mongoose connected to db');
});

mongoose.connection.on('error', (err) => {
    console.log(err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('mongoose connection is disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});