from pydantic.datetime_parse import parse_datetime

data = [
    {
        "source": "youtube",
        "channel": "EthosLab",
        "title": "Etho Plays Minecraft - Episode 572: Sensor Development",
        "id": "Hfc3fqxgr-4"
    }, {
        "source": "kwejk",
        "title": "Ślisko",
        "image": "https://i1.kwejk.pl/k/obrazki/2022/11/X3MowVdEYe8a0J06.jpg"
    },
    {
        "source": "youtube",
        "channel": "Mumbo Jumbo",
        "title": "What if Minecraft Giants could do redstone?",
        "id": "s8hfNI75fFo"
    },
    {
        "source": "mangapill",
        "title": "Munou na Nana Chapter 79",
        "image": "https://cdn.readdetectiveconan.com/file/mangapill/i/2991.jpeg"
    },
    {
        "source": "gogoanime",
        "title": "Boku no Hero Academia 6th Season Episode 9",
        "image": "https://gogocdn.net/cover/boku-no-hero-academia-6th-season-1664387814.png"
    },
]

data = [
    {
        "id": "Hfc3fqxgr-4",
        "timestamp": parse_datetime("2023-01-01T00:00:00.000Z"),
        "source": "youtube",
        "status": 0,
        "content": {
            "channel": "EthosLab",
            "title": "Etho Plays Minecraft - Episode 572: Sensor Development"
        }
    },
    {
        "id": "https://i1.kwejk.pl/k/obrazki/2022/11/X3MowVdEYe8a0J06.jpg",
        "timestamp": parse_datetime("2023-01-01T00:00:00.000Z"),
        "source": "kwejk",
        "status": 0,
        "content": {
            "title": "Ślisko",
            "image": "https://i1.kwejk.pl/k/obrazki/2022/11/X3MowVdEYe8a0J06.jpg"
        }
    },
    {
        "id": "Munou na Nana Chapter 79",
        "timestamp": parse_datetime("2023-01-01T00:00:00.000Z"),
        "source": "mangapill",
        "status": 0,
        "content": {
            "title": "Munou na Nana Chapter 79",
            "image": "https://cdn.readdetectiveconan.com/file/mangapill/i/2991.jpeg"
        }
    },
    {
        "id": "Boku no Hero Academia 6th Season Episode 9",
        "timestamp": parse_datetime("2023-01-01T00:00:00.000Z"),
        "source": "gogoanime",
        "status": 0,
        "content": {
            "title": "Boku no Hero Academia 6th Season Episode 9",
            "image": "https://gogocdn.net/cover/boku-no-hero-academia-6th-season-1664387814.png"
        }
    },
    {
        "id": "s8hfNI75fFo",
        "timestamp": parse_datetime("2023-01-01T00:00:00.000Z"),
        "source": "youtube",
        "status": 0,
        "content": {
            "channel": "Mumbo Jumbo",
            "title": "What if Minecraft Giants could do redstone?"
        }
    }
]
