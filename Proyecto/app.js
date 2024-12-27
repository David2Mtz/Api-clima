const express = require('express'),
app = express(),
bodyParser  = require("body-parser");
const cors= require('cors');

const httpPort = "8089";

const index  = require('./index');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    //Acceso a todo el dominio
    res.header('Access-Control-Allow-Origin','*');
    //*permitir ajax
    res.header('Access-Control-Allow-Headers', 'Authorization, x-tkn, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    //Se habilitan los métodos get, post, options, put y delete
    res.header('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');
    next();
});

const api = express.Router();

api.get('/', function(req, res) {
    res.send(":::::Server Api Rest:::::");
});

app.use('/api/clima',index);

app.use(api);

app.listen(httpPort, function(err) {
    if (err) return console.log(err);
    console.log(`Servidor iniciado en puerto ${httpPort}`);
});