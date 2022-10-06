import re
import time

import requests


CACHE_DURATION = 5 * 60


class Downloader:
    def __init__(self):
        self._latest_id = None
        self._pages = {}

    def _is_latest_id_fresh(self):
        if self._latest_id is None:
            return False

        now = time.time()

        return self._latest_id['cache_until'] > now

    def _update_page(self, url):
        print(f'Querying {url}')
        res = requests.get(url)
        res.raise_for_status()
        
        page = {}

        match = re.search(R'<link href="https://kwejk.pl/strona/(\d+)" rel="next">', res.text)

        page['id'] = int(match.group(1)) + 1
        posts = page['posts'] = []

        for post in re.findall(R'@load="imageLoaded" src="(https://[^"]+)" alt="([^"]+)"/>', res.text):
            posts.append(list(post))

        self._pages[page['id']] = page

        return page

    def _update_latest_id(self):
        now = time.time()
        page = self._update_page('https://kwejk.pl')

        self._latest_id = dict(
            id=page['id'],
            cache_until=now + CACHE_DURATION,
        )

    def get_latest_id(self):
        if not self._is_latest_id_fresh():
            self._update_latest_id()

        return self._latest_id['id']

    def get_page(self, page_id):
        ret = self._pages.get(page_id)

        if ret is not None:
            return ret

        return self._update_page(f'https://kwejk.pl/strona/{page_id}')
