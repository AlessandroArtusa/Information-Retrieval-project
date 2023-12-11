const COIN_RANKING_API_URL_CMC = "http://localhost:8888/coins/coinmarketcap"
const coinList = document.getElementById("data");

let coinsData = [];
let filteredArray = []
let limit_obj = {};

const search_button = document.getElementById("queryForm");
search_button.addEventListener("submit", (e) => {
  e.preventDefault();
  addRelevanceButton();
});

const market_cap_filter = document.getElementById("saveMarketCapValue");
market_cap_filter.addEventListener("click", filter);

const price_filter = document.getElementById("savePriceValue");
price_filter.addEventListener("click", filter);

const oneH_filter = document.getElementById("save1hValue");
oneH_filter.addEventListener("click", filter);

const oneD_filter = document.getElementById("save24hValue");
oneD_filter.addEventListener("click", filter);

const oneW_filter = document.getElementById("save7dValue");
oneW_filter.addEventListener("click", filter);

const recommend_buttons = document.querySelectorAll("#recommend-button");
recommend_buttons.forEach( (e) => {
  e.addEventListener("click", () => {
    let button_value = e.value.split("-");
    let min;
    let max;
    if (button_value[0].charAt(0) === 'n') {
      min = "-" + button_value[0].substring(1);
    } else {
      min = button_value[0]
    }
    if (button_value[1].charAt(0) === 'n') {
      max = "-" + button_value[1].substring(1);
    } else {
      max = button_value[1];
    }
    let attribute = button_value[2];
    switch(attribute) {
      case "marketcap":
        document.getElementById("inputMarketCapMin").value = min;
        document.getElementById("inputMarketCapMax").value = max;
        break;
      case "price":
        document.getElementById("inputPriceMin").value = min;
        document.getElementById("inputPriceMax").value = max;
        break;
      case "1h":
        document.getElementById("input1hMin").value = min;
        document.getElementById("input1hMax").value = max;
        break;
      case "24h":
        document.getElementById("input24hMin").value = min;
        document.getElementById("input24hMax").value = max;
        break;
      case "7d":
        document.getElementById("input7dMin").value = min;
        document.getElementById("input7dMax").value = max;
        break;
    }
  });
});

function addRelevanceButton() {
  let relevanceButtons = `  <button id="positveOutcomeButton" class="btn btn-success me-1" type="button">
                             <i class="fa fa-thumbs-up"></i>
                            </button>
                            <button id="negativeOutcomeButton" class="btn btn-danger me-1" type="button">
                              <i class="fa fa-thumbs-down"></i>
                            </button>`;
  console.log(relevanceButtons);
  let table_buttons = document.getElementById("table-buttons");
  if (table_buttons.querySelectorAll("button").length == 1) {
    table_buttons.insertAdjacentHTML("beforeEnd", relevanceButtons);
  }
  document.getElementById("queryPrinter").remove();
  let query = document.querySelector("#filter").value;
  let query_result = `<h6 id="queryPrinter" class="d-flex flex-column justify-content-center me-3 mb-0">
                        <small class="text-muted">Results got from query: "${query}"</small>
                      </h6>`
  table_buttons.insertAdjacentHTML("beforeEnd", query_result);
}

function filter() {
  // Get all marketcap of coins
  const market_caps = getMarketCapLists();

  // Set max and min from input
  limit_obj.market_cap.min = document.getElementById("inputMarketCapMin").value;
  limit_obj.market_cap.max = document.getElementById("inputMarketCapMax").value;
  limit_obj.price.min = document.getElementById("inputPriceMin").value;
  limit_obj.price.max = document.getElementById("inputPriceMax").value;
  limit_obj.oneH.min = document.getElementById("input1hMin").value;
  limit_obj.oneH.max = document.getElementById("input1hMax").value;
  limit_obj.oneD.min = document.getElementById("input24hMin").value;
  limit_obj.oneD.max = document.getElementById("input24hMax").value;
  limit_obj.oneW.min = document.getElementById("input7dMin").value;
  limit_obj.oneW.max = document.getElementById("input7dMax").value;

  // Check if input is empty
  if (limit_obj.market_cap.min == "") { limit_obj.market_cap.min = Math.min(...getMarketCapLists()); }
  if (limit_obj.market_cap.max == "") { limit_obj.market_cap.max = Math.max(...getMarketCapLists()); }
  if (limit_obj.price.min == "") { limit_obj.price.min = Math.min(...getPriceLists()); }
  if (limit_obj.price.max == "") { limit_obj.price.max = Math.max(...getPriceLists()); }
  if (limit_obj.oneH.min == "") { limit_obj.oneH.min = Math.min(...get1hLists()); }
  if (limit_obj.oneH.max == "") { limit_obj.oneH.max = Math.max(...get1hLists()); }
  if (limit_obj.oneD.min == "") { limit_obj.oneD.min = Math.min(...get24hLists()); }
  if (limit_obj.oneD.max == "") { limit_obj.oneD.max = Math.max(...get24hLists()); }
  if (limit_obj.oneW.min == "") { limit_obj.oneW.min = Math.min(...get7dLists()); }
  if (limit_obj.oneW.max == "") { limit_obj.oneW.max = Math.max(...get7dLists()); }

  // Filter array
  filteredArray = filterCoins(coinsData, limit_obj);

  // display array filtered 
  displayCoins(filteredArray);
}

// get list of all market caps
function getMarketCapLists() {
  return coinsData.map(coin => {
    return coin.quote.USD.market_cap;
  });
}

// get list of all prices
function getPriceLists() {
  return coinsData.map(coin => {
    return coin.quote.USD.price;
  });
}

function get1hLists() {
  return coinsData.map(coin => {
    return coin.quote.USD.percent_change_1h;
  });
}

function get24hLists() {
  return coinsData.map(coin => {
    return coin.quote.USD.percent_change_24h;
  });
}

function get7dLists() {
  return coinsData.map(coin => {
    return coin.quote.USD.percent_change_7d;
  });
}

// filter coins by limit object value
function filterCoins(coins, limit_obj) {
  return coins.filter((coin) => {
    return (coin.quote.USD.price <= limit_obj.price.max && coin.quote.USD.price >= limit_obj.price.min)
      && (coin.quote.USD.market_cap <= limit_obj.market_cap.max && coin.quote.USD.market_cap >= limit_obj.market_cap.min)
      && (coin.quote.USD.percent_change_1h <= limit_obj.oneH.max && coin.quote.USD.percent_change_1h >= limit_obj.oneH.min)
      && (coin.quote.USD.percent_change_24h <= limit_obj.oneD.max && coin.quote.USD.percent_change_24h >= limit_obj.oneD.min)
      && (coin.quote.USD.percent_change_7d <= limit_obj.oneW.max && coin.quote.USD.percent_change_7d >= limit_obj.oneW.min)
  });
}

// load coin from API
const loadCoins = async () => {
  try {
    const res = await fetch(COIN_RANKING_API_URL_CMC);
    const dataResponse = await res.json();
    coinsData = dataResponse.data;
    limit_obj = {
      market_cap: {
        min: Math.min(...getMarketCapLists()),
        max: Math.max(...getMarketCapLists())
      },
      price: {
        min: Math.min(...getPriceLists()),
        max: Math.max(...getPriceLists())
      },
      oneH: {
        min: Math.min(...get1hLists()),
        max: Math.max(...get1hLists())
      },
      oneD: {
        min: Math.min(...get24hLists()),
        max: Math.max(...get24hLists())
      },
      oneW: {
        min: Math.min(...get7dLists()),
        max: Math.max(...get7dLists())
      }
    }
    displayCoins(dataResponse.data);
  } catch (error) {
    console.log(error);
  }
}

function color_percent(num) {
  if (num > 0) {
    return `<td style="color: green">${num}%</td>`;
  } else {
    return `<td style="color: red">${num}%</td>`;
  }
}

// display coin in a table format
const displayCoins = (coins) => {
  const htmlString = coins.map((coin) => {
    return `
    <tr>
      <td>CoinMarketCap</td>
      <td>${coin.name}</td>
      <td>Logo</td>
      <td>${coin.symbol}</td>
      <td>${coin.cmc_rank}</td>` +
      color_percent(coin.quote.USD.percent_change_1h.toFixed(2)) +
      color_percent(coin.quote.USD.percent_change_24h.toFixed(2)) +
      color_percent(coin.quote.USD.percent_change_7d.toFixed(2)) +
      ` <td>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(coin.quote.USD.price)}</td>
      <td>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(coin.quote.USD.market_cap)}</td>
    </tr>
    `
  })
    .join('');
  coinList.innerHTML = htmlString
}
loadCoins()