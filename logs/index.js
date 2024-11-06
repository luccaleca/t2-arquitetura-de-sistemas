const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

const registrosDeLog = [];


app.post('/eventos', (req, res) => {
    const evento = req.body;

    const logRecente = {
        id: uuidv4(),
        tipoDeEvento: evento.tipo,
        timestamp: new Date().toISOString(), 
        detalhes: evento.dados || {}, 
    };

    registrosDeLog.push(logRecente);
    console.log(`Novo evento de log registrado: ${JSON.stringify(logRecente)}`);

    res.status(201).json({ mensagem: 'Evento de log registrado com sucesso!' });
});


app.get('/logs', (req, res) => {
    res.status(200).json(registrosDeLog);
});


app.listen(8000, () => {
    console.log('Servidor de Logs operando na porta 8000');
});