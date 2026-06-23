from __future__ import annotations

import json
import os
import urllib.request
from typing import Optional

def call_openai(prompt: str, system: Optional[str] = None, model: Optional[str] = None) -> str:
    """
    Minimal OpenAI Responses API client using urllib only.

    Environment:
      OPENAI_API_KEY required
      OPENAI_MODEL optional, default gpt-4.1-mini or whatever you set

    This function is optional. The generator works deterministically without LLM.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set.")

    model = model or os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
    payload = {
        "model": model,
        "input": [
            {"role": "system", "content": system or "You are a precise requirements/specification generator."},
            {"role": "user", "content": prompt}
        ]
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    if "output_text" in data:
        return data["output_text"]

    chunks = []
    for item in data.get("output", []):
        for content in item.get("content", []):
            if content.get("type") in ("output_text", "text"):
                chunks.append(content.get("text", ""))
    return "\n".join(chunks).strip()
