const COIN_RANKING_API_URL_CMC = "http://localhost:8888/coins/coinmarketcap"
const coinList = document.getElementById("data")

let coinsData = []
let filteredCoins = []

const loadCoins = async () => {
  try {
    const res = await fetch(COIN_RANKING_API_URL_CMC);
    const dataResponse = await res.json();
    coinsData = dataResponse.data;
    displayCoins(dataResponse.data);
  } catch (error) {
    console.log(error);
  }
}

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