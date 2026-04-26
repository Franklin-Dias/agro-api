let cache = null;
let lastUpdate = 0;
let requests = {};

export default async function handler(req, res) {
  // 🔐 CORS (permite só seu domínio)
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://fernandopinheiro1776605072508.2512222.meusitehostgator.com.br/",
  );
  // 🚦 RATE LIMIT (por IP)
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  requests[ip] = (requests[ip] || 0) + 1;

  if (requests[ip] > 100) {
    return res.status(429).json({ erro: "Muitas requisições" });
  }

  setTimeout(() => {
    requests[ip] = 0;
  }, 60000);

  const now = Date.now();

  // ⚡ CACHE (30 min)
  if (cache && now - lastUpdate < 1800000) {
    return res.status(200).json(cache);
  }

  try {
    ```
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
```;
  } catch (e) {
    ```
if (cache) return res.status(200).json(cache);

res.status(500).json({ erro: "Erro ao buscar dados" });
```;
  }
}

// 🔍 SCRAPING
async function pegarDado(nome, url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    ```
const precoMatch = html.match(/R\\$\\s?[\\d.,]+/);
const dataMatch = html.match(/\\d{2}\\/\\d{2}\\/\\d{4}/);

return [
  nome,
  {
    preco: precoMatch ? precoMatch[0] : "N/D",
    data: dataMatch ? dataMatch[0] : "Atualizado hoje"
  }
];
```;
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
