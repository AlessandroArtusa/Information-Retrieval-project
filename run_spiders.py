import subprocess
import os

def delete_file(file_path):
    try:
        os.remove(file_path)
        print(f"File {file_path} deleted successfully.")
    except OSError as e:
        print(f"Error deleting the file: {e}")

# Run scrapy spider
def run_scrapy_crawl(spider_name, project_path):
    try:
        # Use subprocess to run the Scrapy crawl command with the specified project path
        subprocess.run(['scrapy', 'crawl', spider_name], cwd=project_path)
    except Exception as e:
        print(f"Error running Scrapy crawl: {e}")

delete_file('./scraper_output.jsonl')
run_scrapy_crawl('geckoSpider', './scraper')
run_scrapy_crawl('coinRankingSpider', './scraper')
