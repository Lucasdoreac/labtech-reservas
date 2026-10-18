import pytest
from pydantic import ValidationError

from settings import EmailSettings

SENDING_ENV = {
    "EMAIL_DRY_RUN": "false",
    "EMAIL_RECIPIENTS_COORDENACAO": "coord1@udf.edu.br, coord2@udf.edu.br",
    "EMAIL_RECIPIENTS_REITORIA": "reitoria@udf.edu.br",
    "CLOUD_FUNCTION_URL": "https://fn.example",
    "CLOUD_FUNCTION_API_KEY": "chave",
    "BREVO_API_KEY": "fake-api-key",
}


@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    for name in list(SENDING_ENV) + ["FLASK_ENV", "APP_ENV", "EMAIL_REDIRECT_ALL_TO"]:
        monkeypatch.delenv(name, raising=False)


def test_dry_run_is_on_by_default():
    # Seguro por padrão: sem EMAIL_DRY_RUN definido nada é enviado.
    assert EmailSettings().email_dry_run is True


def test_flask_env_does_not_turn_sending_on(monkeypatch):
    # FLASK_ENV só escolhe a config do Flask; não liga nem desliga e-mail.
    monkeypatch.setenv("FLASK_ENV", "production")
    assert EmailSettings().email_dry_run is True


def test_recipients_are_read_from_comma_separated_env(monkeypatch):
    for name, value in SENDING_ENV.items():
        monkeypatch.setenv(name, value)

    settings = EmailSettings()

    assert settings.email_dry_run is False
    assert settings.email_recipients_coordenacao == ["coord1@udf.edu.br", "coord2@udf.edu.br"]
    assert settings.email_recipients_reitoria == ["reitoria@udf.edu.br"]


def test_sending_without_recipients_fails_fast(monkeypatch):
    # Antes: lista de produção da Coordenação era [] e o envio saía com
    # 'to' vazio, sem ninguém perceber.
    monkeypatch.setenv("EMAIL_DRY_RUN", "false")

    with pytest.raises(ValidationError) as error:
        EmailSettings()

    message = str(error.value)
    for name in SENDING_ENV.keys() - {"EMAIL_DRY_RUN"}:
        assert name in message


def test_empty_cloud_function_url_counts_as_undefined(monkeypatch):
    # `CLOUD_FUNCTION_URL=` vazio virava a URL "None/send-email".
    for name, value in SENDING_ENV.items():
        monkeypatch.setenv(name, value)
    monkeypatch.setenv("CLOUD_FUNCTION_URL", "")

    with pytest.raises(ValidationError) as error:
        EmailSettings()

    assert "CLOUD_FUNCTION_URL" in str(error.value)


def test_staging_real_sends_require_a_redirect_recipient(monkeypatch):
    for name, value in SENDING_ENV.items():
        monkeypatch.setenv(name, value)
    monkeypatch.setenv("APP_ENV", "staging")

    with pytest.raises(ValidationError, match="EMAIL_REDIRECT_ALL_TO"):
        EmailSettings()


def test_redirect_recipient_is_only_allowed_in_staging(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("EMAIL_REDIRECT_ALL_TO", "danrleywillian@gmail.com")

    with pytest.raises(ValidationError, match="APP_ENV=staging"):
        EmailSettings()


def test_staging_email_redirect_is_parsed_from_csv(monkeypatch):
    for name, value in SENDING_ENV.items():
        monkeypatch.setenv(name, value)
    monkeypatch.setenv("APP_ENV", "staging")
    monkeypatch.setenv("EMAIL_REDIRECT_ALL_TO", " danrleywillian@gmail.com ")

    assert EmailSettings().email_redirect_all_to == ["danrleywillian@gmail.com"]


@pytest.mark.parametrize("value", ["", "   "])
def test_empty_offer_period_hours_falls_back_to_default(monkeypatch, value):
    # `OFFER_PERIOD_HOURS=` vazio (comum em compose/.env) virava {} e nenhuma
    # aula bloqueava sala, em silêncio. Vazio agora vale o padrão.
    from datetime import time
    from settings import OfferSettings
    monkeypatch.setenv("OFFER_PERIOD_HOURS", value)

    assert OfferSettings().hours_for("NOITE") == (time(19, 0), time(23, 0))
