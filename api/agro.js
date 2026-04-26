let cache = null;
let lastUpdate = 0;

const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {

// CORS
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Headers", "x-api-key");

if (req.headers["x-api-key"] !== API_KEY) {
return res.status(401).json({ erro: "Não autorizado" });
}

const now = Date.now();

// CACHE (30 min)
if (cache && now - lastUpdate < 3600000) {
  return res.status(200).json(cache);
}

try {

const fontes = [
  ['soja','https://www.cepea.esalq.usp.br/br/indicador/soja.aspx'],
  ['milho','https://www.cepea.esalq.usp.br/br/indicador/milho.aspx'],
  ['cafe','https://www.cepea.esalq.usp.br/br/indicador/cafe.aspx'],
  ['boi','https://www.cepea.esalq.usp.br/br/indicador/boi-gordo.aspx'],
  ['leite','https://www.cepea.esalq.usp.br/br/indicador/leite.aspx'],
  ['acucar','https://www.cepea.esalq.usp.br/br/indicador/acucar.aspx'],
  ['etanol','https://www.cepea.esalq.usp.br/br/indicador/etanol.aspx']
];

const resultados = {};

for (const [nome, url] of fontes) {
  resultados[nome] = await pegarDado(url);
}

cache = resultados;
lastUpdate = now;

res.status(200).json(resultados);


} catch (e) {


// 🔥 FALLBACK → se tudo falhar
if (cache) {
  return res.status(200).json(cache);
}

res.status(200).json({
  soja: { preco: "R$ 145,00", fonte: "Fallback" },
  milho: { preco: "R$ 60,00", fonte: "Fallback" },
  cafe: { preco: "R$ 900,00", fonte: "Fallback" },
  boi: { preco: "R$ 230,00", fonte: "Fallback" },
  leite: { preco: "R$ 2,80", fonte: "Fallback" },
  acucar: { preco: "R$ 120,00", fonte: "Fallback" },
  etanol: { preco: "R$ 2,10", fonte: "Fallback" }
});


}
}

// 🔍 SCRAPING INTELIGENTE
async function pegarDado(url) {
try {
const response = await fetch(url, {
headers: {
"User-Agent": "Mozilla/5.0"
}
});


const html = await response.text();

// tenta pegar valor mais específico
const precoMatch = html.match(/R\$\s?\d{1,3}(\.\d{3})*,\d{2}/);
const dataMatch = html.match(/\d{2}\/\d{2}\/\d{4}/);

if (precoMatch) {
  return {
    preco: precoMatch[0],
    data: dataMatch ? dataMatch[0] : "Hoje",
    fonte: "CEPEA"
  };
}

// fallback parcial (se não achou R$)
const numeroMatch = html.match(/\d{1,3}(\.\d{3})*,\d{2}/);

if (numeroMatch) {
  return {
    preco: `R$ ${numeroMatch[0]}`,
    data: dataMatch ? dataMatch[0] : "Hoje",
    fonte: "CEPEA"
  };
}

// fallback final
return {
  preco: "Indisponível",
  data: "Hoje",
  fonte: "CEPEA"
};


} catch (e) {
return {
preco: "Erro",
data: "-",
fonte: "Sistema"
};
}
}

