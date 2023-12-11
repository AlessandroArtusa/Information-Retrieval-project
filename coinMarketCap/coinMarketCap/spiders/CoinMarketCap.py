from scrapy import Spider, Request
from selenium import webdriver
from selenium.webdriver.common.by import By
from scrapy.selector import Selector
import time
from urllib.parse import urljoin
import scrapy


options = webdriver.ChromeOptions()
options.add_argument("--headless")


class CoinMarketCapSpider(Spider):
    name = "coinmarketcap"
    allowed_domains = ["coinmarketcap.com"]
    start_urls = ["https://coinmarketcap.com/"]
    # pages_to_scrape = 2

    def get_percent_change(self, element):
        percent_change_value = element.xpath("text()").get()
        if element.xpath("span/@class").get() == "icon-Caret-down":
            percent_change_value = "-" + percent_change_value
        return percent_change_value

    def __init__(self):
        self.driver = webdriver.Chrome(options=options)

    def __del__(self):
        self.driver.quit()

    def scroll_smoothly(self, distance):
        for i in range(distance):
            self.driver.execute_script("window.scrollBy(0, 600);")
            time.sleep(0.01)

    def parse(self, response):
        # Scroll down the page to load all content
        self.driver.get(response.url)
        self.scroll_smoothly(12)

        # Extract data using Scrapy selector
        sel = Selector(text=self.driver.page_source)
        coins = sel.xpath("//tbody/tr")

        for coin in coins:
            yield {
                "name": coin.xpath(".//td[3]/div/a/div/div/div/p/text()").get(),
                "symbol": coin.xpath(".//td[3]/div/a/div/div/div/div/p/text()").get(),
                "price": coin.xpath(".//td[4]/div/a/span/text()").get(),
                "percent_change_1h": self.get_percent_change(coin.xpath(".//td[5]/span")),
                "percent_change_24h": self.get_percent_change(coin.xpath(".//td[6]/span")),
                "percent_change_7d": self.get_percent_change(coin.xpath(".//td[7]/span")),
                "volume_change_24h": coin.xpath(".//td[9]/div/a/p/text()").get(),
                "market_cap": coin.xpath(".//td[8]/p/span[2]/text()").get(),
                "logo_url": coin.xpath(".//td[3]/div/a/div/img/@src").get(),
                "source": "coinmarketcap",
                # Extract other data points as needed
            }

        # Follow next page link
        # if self.pages_to_scrape > 1:
        #     next_page = next_page = response.xpath('//a[@class="chevron"]/@href').get()
        #     if next_page:
        #         absolute_url = urljoin(response.url, next_page)
        #         self.pages_to_scrape -= 1
        #         yield scrapy.Request(url=absolute_url, callback=self.parse)
