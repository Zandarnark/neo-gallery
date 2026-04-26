import os
import json
import base64
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Any, Optional


# =========================
# CONFIG
# =========================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

OUTPUT_DIRS = {
    "covers": PROJECT_ROOT / "public" / "covers",
    "artworks": PROJECT_ROOT / "public" / "artworks",
}

# Переменные окружения:
# IMAGE_API_URL=https://api.example.com/v1/images/generations
# IMAGE_API_KEY=your_api_key
# IMAGE_MODEL=gpt-image-1 или твоя модель
IMAGE_API_URL = "https://api.flick-api.abrdns.com/v1"
IMAGE_API_KEY = "sk-6f83f6bbe97b4335ba11ab652dcsnttt"
IMAGE_MODEL = "gpt-image-2"

# Размеры можно поменять, если твой API поддерживает другие
DEFAULT_SIZE = os.getenv("IMAGE_SIZE", "1024x1024").strip()

# Пауза между запросами, чтобы не упереться в rate limit
REQUEST_DELAY_SECONDS = float(os.getenv("IMAGE_REQUEST_DELAY", "1.5"))


# =========================
# PROMPTS
# =========================

ASSETS = [
    # -------------------------
    # COVERS
    # -------------------------
    {
        "category": "covers",
        "filename": "svet-i-ten.jpg",
        "title": "Обложка выставки Свет и Тень",
        "prompt": """
Create a premium cinematic cover image for a virtual digital art exhibition titled "Light and Shadow".
Style: elegant contemporary digital art, immersive gallery atmosphere, abstract light beams, volumetric shadows, glass, dark violet and warm gold palette.
No text, no logos, no watermark.
Composition: wide cinematic hero image, suitable for a modern web landing page.
High detail, polished, artistic, museum-quality.
""",
    },
    {
        "category": "covers",
        "filename": "genezis-form.jpg",
        "title": "Обложка выставки Генезис Форм",
        "prompt": """
Create a premium cinematic cover image for a virtual digital art exhibition about generative forms and digital evolution.
Style: abstract organic 3D shapes, flowing geometry, elegant museum lighting, futuristic but refined.
Palette: deep blue, pearl white, cyan, soft violet.
No text, no logos, no watermark.
Composition: wide hero image for a modern web platform.
High detail, polished, artistic, immersive.
""",
    },
    {
        "category": "covers",
        "filename": "nezavershennoe.jpg",
        "title": "Обложка выставки Незавершённое",
        "prompt": """
Create a mysterious premium cover image for an unfinished virtual digital art exhibition.
Style: incomplete gallery space, floating wireframes, unfinished sculptures, soft fog, glowing construction lines.
Palette: graphite black, muted purple, silver, pale orange highlights.
No text, no logos, no watermark.
Composition: cinematic wide cover, modern web gallery aesthetic.
High detail, elegant, atmospheric.
""",
    },

    # -------------------------
    # ARTWORKS
    # -------------------------
    {
        "category": "artworks",
        "filename": "ray.jpg",
        "title": "Луч сквозь тьму",
        "prompt": """
Create a digital artwork titled "Ray Through Darkness".
Style: abstract cinematic digital art, a powerful beam of warm light cutting through dark volumetric space, particles, subtle glass reflections.
Mood: meditative, mysterious, premium museum piece.
Palette: deep black, violet shadows, warm gold light.
No text, no logos, no watermark.
Square or slightly horizontal composition, suitable as an artwork displayed in a virtual gallery.
""",
    },
    {
        "category": "artworks",
        "filename": "refraction.jpg",
        "title": "Преломление",
        "prompt": """
Create a digital artwork titled "Refraction".
Style: abstract glass sculpture, transparent crystalline forms, light bending through geometry, caustic reflections, futuristic museum aesthetic.
Palette: cyan, violet, silver, dark background.
No text, no logos, no watermark.
High detail, polished 3D-render look, suitable for a virtual gallery artwork.
""",
    },
    {
        "category": "artworks",
        "filename": "pulse.jpg",
        "title": "Пульсация",
        "prompt": """
Create a digital video-art poster titled "Pulse".
Style: energetic abstract waves, rhythmic glowing rings, motion trails, neon particles, dynamic composition.
Palette: magenta, electric blue, orange, black.
No text, no logos, no watermark.
Make it feel like a still frame from a premium experimental video installation.
""",
    },
    {
        "category": "artworks",
        "filename": "growth.jpg",
        "title": "Алгоритм роста",
        "prompt": """
Create a digital artwork titled "Growth Algorithm".
Style: generative organic structure, branching forms, procedural botanical geometry, elegant abstract 3D sculpture.
Palette: emerald, pearl white, cyan, dark blue background.
No text, no logos, no watermark.
High detail, museum-quality, suitable for a 3D/generative art exhibition.
""",
    },
    {
        "category": "artworks",
        "filename": "erosion.jpg",
        "title": "Эрозия",
        "prompt": """
Create a digital artwork titled "Erosion".
Style: abstract surface being digitally eroded, particles breaking away, layered material, elegant decay, premium contemporary art.
Palette: sand, graphite, bronze, soft blue highlights.
No text, no logos, no watermark.
High detail, atmospheric, suitable for a virtual gallery.
""",
    },
    {
        "category": "artworks",
        "filename": "fractal.jpg",
        "title": "Фрактальный дождь",
        "prompt": """
Create an audio-art cover titled "Fractal Rain".
Style: abstract sound visualization, fractal rain patterns, glowing frequency waves, droplets forming mathematical geometry.
Palette: turquoise, dark navy, lime highlights, silver.
No text, no logos, no watermark.
Make it feel like a premium cover for an audio-reactive digital installation.
""",
    },
]


# =========================
# HELPERS
# =========================

def ensure_dirs() -> None:
    for path in OUTPUT_DIRS.values():
        path.mkdir(parents=True, exist_ok=True)


def make_request_payload(prompt: str) -> Dict[str, Any]:
    """
    Стандартный payload для OpenAI-compatible image endpoint.
    Если твой API требует другие поля — поменяй здесь.
    """
    return {
        "model": IMAGE_MODEL,
        "prompt": prompt.strip(),
        "size": DEFAULT_SIZE,
        "n": 1,
        # Некоторые API поддерживают response_format, некоторые нет.
        # Если твой API ругается на это поле — удали строку ниже.
        "response_format": "b64_json",
    }


def http_post_json(url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    headers = {
        "Content-Type": "application/json",
    }

    if IMAGE_API_KEY:
        headers["Authorization"] = f"Bearer {IMAGE_API_KEY}"

    data = json.dumps(payload).encode("utf-8")

    request = urllib.request.Request(
        url=url,
        data=data,
        headers=headers,
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"HTTP error {e.code} while calling image API:\n{error_body}"
        ) from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"URL error while calling image API: {e}") from e


def download_file(url: str, output_path: Path) -> None:
    request = urllib.request.Request(
        url=url,
        headers={
            "User-Agent": "NeoGalleryAssetGenerator/1.0",
        },
    )

    with urllib.request.urlopen(request, timeout=180) as response:
        output_path.write_bytes(response.read())


def save_image_from_response(response: Dict[str, Any], output_path: Path) -> None:
    """
    Поддерживает несколько популярных форматов ответа:

    1. OpenAI-like:
       {
         "data": [
           { "b64_json": "..." }
         ]
       }

    2. URL response:
       {
         "data": [
           { "url": "https://..." }
         ]
       }

    3. Некоторые совместимые API:
       {
         "images": [
           { "b64": "..." }
         ]
       }
    """

    # Format 1: data[0].b64_json
    data = response.get("data")
    if isinstance(data, list) and data:
        item = data[0]

        if isinstance(item, dict):
            if "b64_json" in item:
                image_bytes = base64.b64decode(item["b64_json"])
                output_path.write_bytes(image_bytes)
                return

            if "url" in item:
                download_file(item["url"], output_path)
                return

    # Format 2: images[0].b64 / images[0].base64
    images = response.get("images")
    if isinstance(images, list) and images:
        item = images[0]

        if isinstance(item, dict):
            b64 = item.get("b64") or item.get("base64") or item.get("b64_json")
            if b64:
                image_bytes = base64.b64decode(b64)
                output_path.write_bytes(image_bytes)
                return

            if "url" in item:
                download_file(item["url"], output_path)
                return

    # Format 3: direct b64_json
    if "b64_json" in response:
        image_bytes = base64.b64decode(response["b64_json"])
        output_path.write_bytes(image_bytes)
        return

    # Format 4: direct url
    if "url" in response:
        download_file(response["url"], output_path)
        return

    raise RuntimeError(
        "Unknown image API response format:\n"
        + json.dumps(response, indent=2, ensure_ascii=False)[:2000]
    )


def generate_asset(asset: Dict[str, str], overwrite: bool = False) -> None:
    category = asset["category"]
    filename = asset["filename"]
    prompt = asset["prompt"]
    title = asset["title"]

    output_dir = OUTPUT_DIRS[category]
    output_path = output_dir / filename

    if output_path.exists() and not overwrite:
        print(f"[SKIP] {output_path.relative_to(PROJECT_ROOT)} already exists")
        return

    print(f"[GENERATE] {title}")
    print(f"           -> {output_path.relative_to(PROJECT_ROOT)}")

    payload = make_request_payload(prompt)
    response = http_post_json(IMAGE_API_URL, payload)
    save_image_from_response(response, output_path)

    print(f"[OK] Saved: {output_path.relative_to(PROJECT_ROOT)}")


def main() -> None:
    if not IMAGE_API_URL:
        raise SystemExit(
            "ERROR: IMAGE_API_URL is not set.\n"
            "Example:\n"
            "  set IMAGE_API_URL=https://api.example.com/v1/images/generations\n"
            "  set IMAGE_API_KEY=your_key\n"
            "  python scripts/generate_assets.py\n"
        )

    ensure_dirs()

    overwrite = os.getenv("OVERWRITE", "false").lower() in ("1", "true", "yes")

    print("NeoGallery asset generation")
    print("===========================")
    print(f"Project root: {PROJECT_ROOT}")
    print(f"API URL:      {IMAGE_API_URL}")
    print(f"Model:        {IMAGE_MODEL}")
    print(f"Size:         {DEFAULT_SIZE}")
    print(f"Overwrite:    {overwrite}")
    print()

    for index, asset in enumerate(ASSETS, start=1):
        try:
            print(f"[{index}/{len(ASSETS)}]")
            generate_asset(asset, overwrite=overwrite)
        except Exception as e:
            print(f"[ERROR] Failed to generate {asset['filename']}")
            print(e)

        if index < len(ASSETS):
            time.sleep(REQUEST_DELAY_SECONDS)

    print()
    print("Done.")


if __name__ == "__main__":
    main()