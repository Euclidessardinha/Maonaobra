from app.services.email_service import send_new_message_email


send_new_message_email(
    recipient_email="euclidessardinha84@gmail.com",
    recipient_name="Euclides",
    sender_name="Teste MãoNaObra",
    conversation_id=1,
    user_role="CLIENT",
    message_count=1
)

print("E-mail de teste enviado!")