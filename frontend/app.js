const COIN_RANKING_API_URL_CMC = "http://localhost:8888/coins/coinmarketcap"
const coinList = document.getElementById("data");

let coinsData = [];
let filteredArray = []
let limit_obj = {};

const market_cap_filter = document.getElementById("saveMarketCapValue");
market_cap_filter.addEventListener("click", filter);

const price_filter = document.getElementById("savePriceValue");
price_filter.addEventListener("click", filter);

const recommend_buttons = document.querySelectorAll("#recommend-button");
recommend_buttons.forEach( (e) => {
  e.addEventListener("click", () => {
    let button_value = e.value.split("-");
    let min = button_value[0];
    let max = button_value[1];
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
    }
  });
});

function filter() {
  // Get all marketcap of coins
  const market_caps = getMarketCapLists();

  // Set max and min from input
  limit_obj.market_cap.min = document.getElementById("inputMarketCapMin").value;
  limit_obj.market_cap.max = document.getElementById("inputMarketCapMax").value;
  limit_obj.price.min = document.getElementById("inputPriceMin").value;
  limit_obj.price.max = document.getElementById("inputPriceMax").value;

  // Check if input is empty
  if (limit_obj.market_cap.min == "") { limit_obj.market_cap.min = Math.min(...getMarketCapLists()); }
  if (limit_obj.market_cap.max == "") { limit_obj.market_cap.max = Math.max(...getMarketCapLists()); }
  if (limit_obj.price.min == "") { limit_obj.price.min = Math.min(...getPriceLists()); }
  if (limit_obj.price.max == "") { limit_obj.price.max = Math.max(...getPriceLists()); }

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

// filter coins by limit object value
function filterCoins(coins, limit_obj) {
  return coins.filter((coin) => {
    return (coin.quote.USD.price <= limit_obj.price.max && coin.quote.USD.price >= limit_obj.price.min)
      && (coin.quote.USD.market_cap <= limit_obj.market_cap.max && coin.quote.USD.market_cap >= limit_obj.market_cap.min);
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
      }
    }
    displayCoins(dataResponse.data);
  } catch (error) {
    console.log(error);
  }
}

// display coin in a table format
const displayCoins = (coins) => {
  const htmlString = coins.map((coin) => {
    return `
    <tr>
      <td>${coin.name}</td>
      <td>${coin.cmc_rank}</td>
      <td>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(coin.quote.USD.price)}</td>
      <td>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(coin.quote.USD.market_cap)}</td>
      <td>${coin.symbol}</td>
      <td>
      <a href="https://coinmarketcap.com/currencies/${coin.slug}/" target="_blank">
      <i class="fas fa-chart-line"></i>
      </a>
      </td>
    </tr>
    `
  })
    .join('');
  coinList.innerHTML = htmlString
}
loadCoins()