// ==========================
// Constantes e Configurações
// ==========================
const REGRA_CONDICOES = {
  ensolarado: "sol",
  "céu limpo": "sol",
  limpo: "sol",
  sunny: "sol",
  clear: "sol",
  nublado: "nublado",
  "parcialmente nublado": "nublado",
  encoberto: "nublado",
  neblina: "nublado",
  névoa: "nublado",
  nevoeiro: "nublado",
  cloudy: "nublado",
  overcast: "nublado",
  "partly cloudy": "nublado",
  mist: "nublado",
  fog: "nublado",
  chuva: "chuva",
  "chuva leve": "chuva",
  "chuva moderada": "chuva",
  "chuva forte": "chuva",
  chuvisco: "chuva",
  garoa: "chuva",
  tempestade: "chuva",
  trovoada: "chuva",
  "possibilidade de chuva": "chuva",
  rain: "chuva",
  "light rain": "chuva",
  "heavy rain": "chuva",
  "moderate rain": "chuva",
  drizzle: "chuva",
  thunderstorm: "chuva",
};

// ==========================
// Elementos do DOM
// ==========================
const body = document.querySelector("body");
const cityName = document.querySelector(".city-name");
const temperature = document.querySelector(".temperature");
const weatherIconMain = document.querySelector(".weather-icon-main");
const weatherCondition = document.querySelector(".weather-condition");
const diasCards = document.querySelectorAll(".days");
const inputSearch = document.querySelector("header form input");
const autocompleteBox = document.querySelector(".autocomplete");
const btnDarkOrLigth = document.getElementById("dark-mode-btn");

// Variável global para armazenar dados do clima
let dadosAtuais = null;

// ==========================
// Funções de Atualização de Clima
// ==========================
function aplicarRegra(condicaoAPI) {
  const cond = condicaoAPI.toLowerCase();
  const categoria = REGRA_CONDICOES[cond] || "nublado";
  const isDark = body.classList.contains("dark");

  let nomeArquivo;
  if (categoria === "sol") nomeArquivo = isDark ? "solLigth.png" : "sol.png";
  else if (categoria === "chuva")
    nomeArquivo = isDark ? "chuvaLigth.png" : "chuva.png";
  else if (categoria === "nublado")
    nomeArquivo = isDark ? "nubladoLigth.png" : "nublado.png";

  return { categoria, icone: `./icons/${nomeArquivo}` };
}

function atualizarTodosIcones() {
  if (!dadosAtuais) return;

  const regraAtual = aplicarRegra(dadosAtuais.current.condition.text);
  weatherIconMain.innerHTML = `<img src="${regraAtual.icone}" alt="${regraAtual.categoria}" />`;

  const dias = dadosAtuais.forecast.forecastday;
  diasCards.forEach((card, index) => {
    const info = dias[index + 1];
    if (!info) return;
    const regra = aplicarRegra(info.day.condition.text);
    card.querySelector(
      ".weather-icon"
    ).innerHTML = `<img src="${regra.icone}" alt="${regra.categoria}" />`;
  });
}

function atualizarCardPrincipal(dados) {
  cityName.textContent = dados.location.name;
  temperature.textContent = Math.round(dados.current.temp_c) + "°";

  const regra = aplicarRegra(dados.current.condition.text);
  weatherIconMain.innerHTML = `<img src="${regra.icone}" alt="${regra.categoria}" />`;
  weatherCondition.textContent = regra.categoria;
}

function atualizarCardsDias(dados) {
  const dias = dados.forecast.forecastday;

  diasCards.forEach((card, index) => {
    const info = dias[index + 1];
    if (!info) return;

    const diaSemana = new Date(info.date).toLocaleDateString("pt-BR", {
      weekday: "short",
    });
    const regra = aplicarRegra(info.day.condition.text);

    card.querySelector(".day-name").textContent = diaSemana.toUpperCase();
    card.querySelector(
      ".weather-icon"
    ).innerHTML = `<img src="${regra.icone}" alt="${regra.categoria}" />`;
    card.querySelector(".day-condition").textContent = regra.categoria;
  });
}

// ==========================
// Função para buscar clima via API
// ==========================
async function buscarClima(cidade) {
  try {
    const resposta = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=87dfebeb43ad42be96424823250612&q=${cidade}&days=7&lang=pt`
    );
    const dados = await resposta.json();

    if (dados.error) {
      alert("Cidade não encontrada!");
      return;
    }

    dadosAtuais = dados;

    atualizarCardPrincipal(dados);
    atualizarCardsDias(dados);
  } catch (err) {
    console.log(err);
  }
}

// ==========================
// Dark/Light Mode
// ==========================
btnDarkOrLigth.addEventListener("click", () => {
  body.classList.toggle("dark");

  const img = btnDarkOrLigth.querySelector("img");
  if (body.classList.contains("dark")) {
    img.style.backgroundColor = "#ffffffab";
    img.style.borderRadius = "10px";
    img.src = "img/lightMode.png";
  } else {
    img.style.backgroundColor = "";
    img.src = "img/darkMode.png";
  }

  atualizarTodosIcones();
});

// ==========================
// Autocomplete
// ==========================
inputSearch.addEventListener("input", async (evento) => {
  const texto = evento.target.value.trim();
  if (texto.length < 3) {
    autocompleteBox.innerHTML = "";
    return;
  }

  const resposta = await fetch(
    `https://api.weatherapi.com/v1/search.json?key=87dfebeb43ad42be96424823250612&q=${texto}`
  );
  const dados = await resposta.json();

  if (!dados || dados.length === 0) {
    autocompleteBox.innerHTML =
      "<div class='item'>Nenhuma cidade encontrada</div>";
    return;
  }

  autocompleteBox.innerHTML = dados
    .map(
      (city) =>
        `<div class="item" data-nome="${city.name}">${city.name} - ${city.region}</div>`
    )
    .join("");
});

autocompleteBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("item")) {
    const cidadeSelecionada = e.target.dataset.nome;
    inputSearch.value = cidadeSelecionada;
    autocompleteBox.innerHTML = "";
    buscarClima(cidadeSelecionada);
  }
});

// ==========================
// Busca inicial
// ==========================
buscarClima("Belo Horizonte");
