import os

import resend
from dotenv import load_dotenv


load_dotenv()


RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv(
    "EMAIL_FROM",
    "MãoNaObra <onboarding@resend.dev>"
)
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)


if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def send_new_message_email(
    recipient_email: str,
    recipient_name: str,
    sender_name: str,
    conversation_id: int,
    user_role: str,
    message_count: int
):
    if not RESEND_API_KEY:
        raise ValueError(
            "RESEND_API_KEY não encontrada no arquivo .env"
        )

    if user_role == "CLIENT":
        chat_url = (
            f"{FRONTEND_URL}/client/chat"
            f"?conversation_id={conversation_id}"
        )
    else:
        chat_url = (
            f"{FRONTEND_URL}/provider/chat"
            f"?conversation_id={conversation_id}"
        )

    if message_count == 1:
        subject = f"Nova mensagem de {sender_name}"
        message_text = (
            f"{sender_name} enviou uma nova mensagem "
            "para você na MãoNaObra."
        )
    else:
        subject = (
            f"{message_count} novas mensagens de "
            f"{sender_name}"
        )
        message_text = (
            f"Você recebeu {message_count} novas mensagens "
            f"de {sender_name} na MãoNaObra."
        )

    html = f"""
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <title>{subject}</title>
    </head>

    <body style="
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        font-family: Arial, sans-serif;
    ">

        <div style="
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            padding: 35px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        ">

            <h1 style="
                margin-top: 0;
                color: #222;
            ">
                MãoNaObra
            </h1>

            <h2>
                Nova mensagem
            </h2>

            <p>
                Olá, {recipient_name}!
            </p>

            <p>
                {message_text}
            </p>

            <div style="
                text-align: center;
                margin: 35px 0;
            ">

                <a href="{chat_url}" style="
                    display: inline-block;
                    background-color: #111827;
                    color: white;
                    text-decoration: none;
                    padding: 14px 28px;
                    border-radius: 8px;
                    font-weight: bold;
                ">
                    Ver mensagem
                </a>

            </div>

            <p style="
                color: #777;
                font-size: 13px;
            ">
                Você está recebendo este e-mail porque recebeu
                uma nova mensagem na MãoNaObra.
            </p>

        </div>

    </body>
    </html>
    """

    return resend.Emails.send({
        "from": EMAIL_FROM,
        "to": [recipient_email],
        "subject": subject,
        "html": html
    })