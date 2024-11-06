const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const bancoDeDados = {};

const manipuladoresDeEventos = {
  LembreteCriado: (lembrete) => {
    bancoDeDados[lembrete.id] = lembrete;
  },
  ObservacaoCriada: (observacao) => {
    const observacoes = bancoDeDados[observacao.lembreteId]?.observacoes || [];
    observacoes.push(observacao);
    bancoDeDados[observacao.lembreteId].observacoes = observacoes;
  },
  ObservacaoAtualizada: (observacao) => {
    const observacoes = bancoDeDados[observacao.lembreteId].observacoes;
    const indice = observacoes.findIndex((o) => o.id === observacao.id);
    observacoes[indice] = observacao;
  }
};

app.post('/eventos', (req, res) => {
  const { tipo, dados } = req.body;
  const handler = manipuladoresDeEventos[tipo];

  if (handler) {
    try {
      handler(dados);
    } catch (erro) {
      console.error(`Erro ao processar o evento ${tipo}:`, erro);
    }
  } else {
    console.warn(`Evento não reconhecido: ${tipo}`);
  }

  res.status(200).json({ mensagem: 'Evento processado com sucesso' });
});

app.get('/lembretes', (req, res) => {
  res.json(bancoDeDados);
});

const PORTA = 6000;
app.listen(PORTA, async () => {
  console.log(`Serviço de consultas operando na porta ${PORTA}`);
  try {
    const resposta = await axios.get('http://barramento-de-eventos-service:10000/eventos');
    resposta.data.forEach((evento) => {
      const handler = manipuladoresDeEventos[evento.tipo];
      if (handler) {
        try {
          handler(evento.dados);
        } catch (erro) {
          console.error(`Erro ao processar evento ${evento.tipo}:`, erro);
        }
      }
    });
  } catch (erro) {
    console.error('Erro ao buscar eventos:', erro);
  }
});