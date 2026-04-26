let cache = null;
let lastUpdate = 0;

export default async function handler(req, res) {
  const now = Date.now();

  // cache de 30 min
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
  ['etanol','https://www.cepea.esalq.usp.br/br/indicador/etanol.aspx'],
  ['arroz','https://www.cepea.esalq.usp.br/br/indicador/arroz.aspx'],
  ['trigo','https://www.cepea.esalq.usp.br/br/indicador/trigo.aspx'],
  ['algodao','https://www.cepea.esalq.usp.br/br/indicador/algodao.aspx']
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

// SCRAPING ROBUSTO
async function pegarDado(nome, url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    ```
// pega preço
const precoMatch = html.match(/R\\$\\s?[\\d.,]+/);

// pega data
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
