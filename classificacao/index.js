const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const termoImportante = "importante";

const processadores = {
  ObservacaoCriada: (observacao) => {
    observacao.status = observacao.texto.includes(termoImportante) ? "importante" : "comum";
    
    axios.post('http://barramento-de-eventos-service:10000/eventos', {
      tipo: 'ObservacaoClassificada',
      dados: observacao,
    }).then(() => {
      console.log('Evento ObservacaoClassificada emitido com sucesso');
    }).catch((erro) => {
      console.error('Erro ao emitir evento:', erro.message);
    });
  },
};

app.post('/eventos', (req, res) => {
  const { tipo, dados } = req.body;

  if (processadores[tipo]) {
    try {
      processadores[tipo](dados);
    } catch (erro) {
      console.error('Erro ao processar evento:', erro);
    }
  }

  res.status(200).json({ mensagem: 'Processamento concluído' });
});

const PORTA = 7000;
app.listen(PORTA, () => {
  console.log(`Serviço de classificação escutando na porta ${PORTA}`);
});