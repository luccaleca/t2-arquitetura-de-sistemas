const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); 

const app = express();
app.use(bodyParser.json());

let idAtual = 0;
const listaDeLembretes = {};


app.put("/lembretes", async (req, res) => {
    idAtual++;
    const { texto } = req.body;
    
    
    listaDeLembretes[idAtual] = {
        id: idAtual,
        texto,
    };

    
    try {
        await axios.post("http://barramento-de-eventos-service:10000/eventos", {
            tipo: "LembreteCriado",
            dados: {
                id: idAtual,
                texto,
            },
        });
        res.status(201).json(listaDeLembretes[idAtual]);
    } catch (err) {
        console.error("Erro ao enviar evento LembreteCriado:", err);
        res.status(500).send({ erro: "Erro ao processar solicitação" });
    }
});


app.post("/eventos", (req, res) => {
    const eventoRecebido = req.body;
    console.log("Evento recebido:", eventoRecebido);
    res.status(200).json({ mensagem: "Evento processado com sucesso" });
});


app.listen(4000, () => {
    console.log('Servidor de Lembretes operando na porta 4000');
});