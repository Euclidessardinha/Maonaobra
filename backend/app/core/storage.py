
import os
from urllib.parse import quote, unquote, urlparse

import requests
from dotenv import load_dotenv


load_dotenv()

BUCKET_NAME = "service-images"

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


def _get_headers(content_type: str | None = None):
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "Configuração do Supabase Storage não encontrada."
        )

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }

    if content_type:
        headers["Content-Type"] = content_type

    return headers


def upload_service_image(
    service_id: int,
    file_bytes: bytes,
    content_type: str,
    extension: str
) -> str:
    import uuid

    filename = f"{uuid.uuid4().hex}.{extension}"
    file_path = f"services/{service_id}/{filename}"

    encoded_path = quote(file_path, safe="/")

    url = (
        f"{SUPABASE_URL}/storage/v1/object/"
        f"{BUCKET_NAME}/{encoded_path}"
    )

    headers = _get_headers(content_type)

    try:
        response = requests.post(
            url,
            headers=headers,
            data=file_bytes,
            timeout=30
        )

        response.raise_for_status()

    except requests.RequestException as exc:
        raise RuntimeError(
            "Não foi possível enviar a imagem para o armazenamento."
        ) from exc

    return (
        f"{SUPABASE_URL}/storage/v1/object/public/"
        f"{BUCKET_NAME}/{encoded_path}"
    )


def delete_service_image(image_url: str | None) -> None:
    if not image_url:
        return

    if not SUPABASE_URL:
        return

    public_prefix = (
        f"{SUPABASE_URL}/storage/v1/object/public/"
        f"{BUCKET_NAME}/"
    )

    if not image_url.startswith(public_prefix):
        return

    file_path = unquote(image_url[len(public_prefix):])

    if not file_path or ".." in file_path.split("/"):
        return

    encoded_path = quote(file_path, safe="/")

    url = (
        f"{SUPABASE_URL}/storage/v1/object/"
        f"{BUCKET_NAME}/{encoded_path}"
    )

    try:
        response = requests.delete(
            url,
            headers=_get_headers(),
            timeout=30
        )

        response.raise_for_status()

    except requests.RequestException:
        # A falha ao eliminar a imagem antiga não deve
        # invalidar a nova imagem já guardada.
        pass
