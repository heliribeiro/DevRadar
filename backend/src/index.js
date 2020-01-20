const express = require('express')
const mongoose = require('mongoose')
const routes = require('./routes')
const cors = require('cors');
const htttp = require('http');
const {setupWebsocket} = require('./websocket');

const app = express();
const server = htttp.Server(app);

setupWebsocket(server);

mongoose.connect('mongodb+srv://heli:heliribeiro@cluster0-xxwir.mongodb.net/week10?retryWrites=true&w=majority',{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

app.use(cors());
app.use(express.json());
app.use(routes);
// Métodos HTTP: GET, POST, PUT, DELETE

// Tipos de parâmetros:
// Query params: request.query (Filtros ordenação, paginação, ...)
// Route params: request.params (Identificar um recurso na alteração ou remoção)
// Body: request.body (Dados para a criação ou alteração de um registro)

server.listen(3333);