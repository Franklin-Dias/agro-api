let cache = null;
let lastUpdate = 0;

const API_KEY = process.env.API_KEY;
const TWELVE_API = process.env.TWELVE_API;

export default async function handler(req, res) {

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Headers", "x-api-key");

if (req.headers["x-api-key"] !== API_KEY) {
return res.status(401).json({ erro: "Não autorizado" });
}

const now = Date.now();

if (cache && now - lastUpdate < 300000) {
return res.status(200).json(cache);
}

try {


const ativos = {
  soja: "ZS:CBOT",
  milho: "ZC:CBOT",
  cafe: "KC:ICE",
  acucar: "SB:ICE",
};

const resultados = {};

for (const [nome, symbol] of Object.entries(ativos)) {

  const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_API}`;

  const response = await fetch(url);
  const data = await response.json();

  resultados[nome] = {
    preco: data.close ? `$${parseFloat(data.close).toFixed(2)}` : "N/D",
    variacao: data.percent_change || "0.00",
    fonte: "Mercado Internacional"
  };
}

// fallback fixo (dados que não tem API confiável)
resultados.boi = { preco: "R$ 230,00", fonte: "Referência" };
resultados.leite = { preco: "R$ 2,80", fonte: "Referência" };
resultados.etanol = { preco: "R$ 2,10", fonte: "Referência" };

cache = resultados;
lastUpdate = now;

res.status(200).json(resultados);


} catch (e) {
res.status(500).json({ erro: "Erro ao buscar dados" });
}
}
