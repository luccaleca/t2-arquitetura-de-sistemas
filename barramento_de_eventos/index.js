const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');


const eventos = [];


const app = express();
app.use(bodyParser.json());

app.post('/eventos', async (req, res) => {
  const evento = req.body;
  eventos.push(evento);


  const servicos = [
    'http://lembretes-service:4000/eventos',
    'http://observacoes-service:5000/eventos',
    'http://consulta-service:6000/eventos',
    'http://classificacao-service:7000/eventos',
    'http://logs-service:8000/eventos'
  ];

  const promessas = servicos.map((url) => axios.post(url, evento));

  try {
    
    await Promise.all(promessas);
    res.status(200).json({ mensagem: 'Evento propagado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao propagar o evento:', erro.message);
    res.status(500).json({ mensagem: 'Erro ao propagar o evento.' });
  }
});

app.get('/eventos', (req, res) => {
  res.json(eventos);
});


app.listen(10000, () => {
  console.log('Barramento de eventos operando na porta 10000');
});