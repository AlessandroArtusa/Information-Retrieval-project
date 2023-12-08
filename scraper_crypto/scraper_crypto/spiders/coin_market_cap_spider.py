import scrapy


class CoinSpider(scrapy.Spider):
    name = "cmp_spider"

    start_urls = ["https://coinmarketcap.com/"]

    def parse(self, response):
        for i in range(1, 100):
            name = response.xpath(
                f'//*[@id="__next"]/div[2]/div[1]/div[2]/div/div[1]/div[4]/table/tbody/tr[{i}]/td[3]/div/a/div/div/div/p/text()'
            ).get()
            price = response.xpath(
                f'//*[@id="__next"]/div[2]/div[1]/div[2]/div/div[1]/div[4]/table/tbody/tr[{i}]/td[4]/div/a/span/text()'
            ).get()
            yield {
                "name": name,
                "price": price,
            }
