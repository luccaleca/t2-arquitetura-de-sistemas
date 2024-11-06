const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const observacoesPorLembreteId = {};


const manipuladoresDeEventos = {
  ObservacaoClassificada: (observacao) => {
    const observacoes = observacoesPorLembreteId[observacao.lembreteId] || [];
    const observacaoParaAtualizar = observacoes.find(o => o.id === observacao.id);
    if (observacaoParaAtualizar) {
      observacaoParaAtualizar.status = observacao.status;

      
      axios.post('http://barramento-de-eventos-service:10000/eventos', {
        tipo: "ObservacaoAtualizada",
        dados: {
          id: observacao.id,
          texto: observacao.texto,
          lembreteId: observacao.lembreteId,
          status: observacao.status,
        }
      }).catch(err => console.error("Erro ao enviar o evento ObservacaoAtualizada:", err));
    }
  }
};


app.post('/lembretes/:idLembrete/observacoes', async (req, res) => {
  const idObservacao = uuidv4();
  const { texto } = req.body;

  const observacoesDoLembrete = observacoesPorLembreteId[req.params.idLembrete] || [];
  const novaObservacao = { id: idObservacao, texto, status: 'aguardando' };
  observacoesDoLembrete.push(novaObservacao);

  observacoesPorLembreteId[req.params.idLembrete] = observacoesDoLembrete;

  
  try {
    await axios.post('http://barramento-de-eventos-service:10000/eventos', {
      tipo: 'ObservacaoCriada',
      dados: {
        id: idObservacao,
        texto,
        lembreteId: req.params.idLembrete,
        status: 'aguardando'
      }
    });
  } catch (err) {
    console.error("Erro ao enviar o evento ObservacaoCriada:", err);
  }

  res.status(201).json(observacoesDoLembrete);
});


app.post('/eventos', (req, res) => {
  const evento = req.body;
  console.log("Evento recebido:", evento.tipo);

  const funcao = manipuladoresDeEventos[evento.tipo];
  if (funcao) {
    try {
      funcao(evento.dados);
    } catch (err) {
      console.error(`Erro ao processar o evento ${evento.tipo}:`, err);
    }
  }

  res.json({ mensagem: 'Evento processado com sucesso' });
});


app.listen(5000, () => {
  console.log('Servidor de Observações rodando na porta 5000');
});