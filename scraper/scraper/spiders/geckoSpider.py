import scrapy
from urllib.parse import urljoin


class GeckospiderSpider(scrapy.Spider):
    name = "geckoSpider"
    allowed_domains = ["www.coingecko.com"]
    start_urls = ["https://www.coingecko.com/"]
    # pages_to_scrape = 2

    def get_percent_change(self, element):
        percent_change_value = element.xpath("text()").get()
        if element.xpath("i/@class").get() == "fas fa-fw fa-caret-down":
            percent_change_value = "-" + percent_change_value
        return percent_change_value

    def parse(self, response):
        rows = response.xpath("/html/body/div[2]/main/div/div[5]/table/tbody/tr")
        for row in rows:
            # Extract data from each row
            name = row.xpath("td[3]/a/div/div/text()").get()
            symbol = row.xpath("td[3]/a/div/div/div/text()").get()
            price = row.xpath("td[5]/span/text()").get()

            percent_change_1h_element = row.xpath("td[6]/span")
            percent_change_1h = self.get_percent_change(percent_change_1h_element)

            percent_change_24h_element = row.xpath("td[7]/span")
            percent_change_24h = self.get_percent_change(percent_change_24h_element)

            percent_change_7d_element = row.xpath("td[8]/span")
            percent_change_7d = self.get_percent_change(percent_change_7d_element)

            volume_change_24h = row.xpath("td[10]/span/text()").get()
            market_cap = row.xpath("td[11]/span/text()").get()
            logo_url = row.xpath("td[3]/a/img/@src").get()
            yield {
                "name": name.strip(),
                "symbol": symbol.strip(),
                "price": price,
                "percent_change_1h": percent_change_1h,
                "percent_change_24h": percent_change_24h,
                "percent_change_7d": percent_change_7d,
                "volume_change_24h": volume_change_24h,
                "market_cap": market_cap,
                "logo_url": logo_url,
                "source": "coingecko",
            }

        # Follow next page link
        # if self.pages_to_scrape > 1:
        #     next_page = response.xpath('//a[@rel="next"]/@href').get()
        #     if next_page:
        #         absolute_url = urljoin(response.url, next_page)
        #         self.pages_to_scrape -= 1
        #         yield scrapy.Request(url=absolute_url, callback=self.parse)
