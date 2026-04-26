let cache = null;
let lastUpdate = 0;
let requests = {};

const API_KEY = process.env.API_KEY;


export default async function handler(req, res) {
  // CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://fernandopinheiro1776605072508.2512222.meusitehostgator.com.br",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  // Segurança extra
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  // Preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // API KEY
  if (req.headers["x-api-key"] !== API_KEY) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  // RATE LIMIT
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!requests[ip]) {
    requests[ip] = { count: 1, time: Date.now() };
  } else {
    requests[ip].count++;
  }

  if (requests[ip].count > 100 && Date.now() - requests[ip].time < 60000) {
    return res.status(429).json({ erro: "Muitas requisições" });
  }

  if (Date.now() - requests[ip].time > 60000) {
    requests[ip] = { count: 1, time: Date.now() };
  }

  const now = Date.now();

  // CACHE
  if (cache && now - lastUpdate < 1800000) {
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

const resultados = await Promise.all(
  fontes.map(([nome, url]) => pegarDado(nome, url))
);

const dados = Object.fromEntries(resultados);

cache = dados;
lastUpdate = now;

res.status(200).json(dados);

  } catch (e) {
    
if (cache) return res.status(200).json(cache);

res.status(500).json({ erro: "Erro ao buscar dados" });

  }
}

// SCRAPING
async function pegarDado(nome, url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    
const precoMatch = html.match(/R\$\s?[\d.,]+/);
const dataMatch = html.match(/\d{2}\/\d{2}\/\d{4}/);

return [
  nome,
  {
    preco: precoMatch ? precoMatch[0] : "N/D",
    data: dataMatch ? dataMatch[0] : "Atualizado hoje"
  }
];

  } catch (e) {
    return [
      nome,
      {
        preco: "N/D",
        data: "Erro",
      },
    ];
  }
}
