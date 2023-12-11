import scrapy
from urllib.parse import urljoin


class CoinrankingspiderSpider(scrapy.Spider):
    name = "coinRankingSpider"
    allowed_domains = ["coinranking.com"]
    start_urls = ["https://coinranking.com/"]
    pages_to_scrape = 4

    def parse(self, response):
        rows = response.xpath('//*[@id="__layout"]/div/div[3]/div[6]/table/tbody/tr')[1:]
        for row in rows:
            name = row.xpath("td[1]/div/span[4]/a/text()").get()
            symbol = row.xpath("td[1]/div/span[4]/span/span[1]/text()").get()
            price = row.xpath("td[2]/div/text()").get().strip()[1:]
            market_cap = row.xpath("td[3]/div/text()").get().strip()[1:]
            percent_change_24h = row.xpath("td[4]/div/text()").get()
            logo_url = row.xpath("td[1]/div/span[3]/img/@src").get()
            yield {
                "name": name.strip(),
                "symbol": symbol.strip(),
                "price": price.strip(),
                "market_cap": market_cap.strip(),
                "percent_change_24h": percent_change_24h.strip(),
                "logo_url": logo_url,
            }

        if self.pages_to_scrape > 1:
            next_page = response.xpath(
                '//*[@id="__layout"]/div/div[3]/div[6]/section[1]/div[3]/a/@href'
            ).get()
            if next_page:
                absolute_url = urljoin(response.url, next_page)
                self.pages_to_scrape -= 1
                yield scrapy.Request(url=absolute_url, callback=self.parse)
