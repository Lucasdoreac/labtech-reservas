# Homologação e emails de teste

`render.staging.yaml` é um blueprint separado da produção. Ele cria serviços
`reservas-staging-*`, usa o banco `rooms-reservation-staging` e deixa o envio
de emails ligado somente com redirecionamento para `danrleywillian@gmail.com`.
Os assuntos recebem `[STAGING]` e os templates mostram a faixa “AMBIENTE DE
TESTE — STAGING”.

## Configuração obrigatória no Render

Importe `render.staging.yaml` como um Blueprint novo. No primeiro sync, informe
um `MONGO_URI` de staging para catálogo, autenticação e API. Aponte os três para
o cluster de homologação autorizado; não reutilize a URI de produção. Informe
também `BREVO_API_KEY` e `BREVO_SENDER_EMAIL` de um remetente já verificado na
conta Brevo. O sync falha fechado se os dados essenciais do envio não
estiverem configurados.

O blueprint fixa `EMAIL_REDIRECT_ALL_TO=danrleywillian@gmail.com`. A API
substitui a lista de destinatários recebida por essa caixa em todas as mensagens
de staging, inclusive magic links e avisos dirigidos ao organizador. Não
adicione destinatários reais da Coordenação ou Reitoria nesse blueprint.

## Localizar os emails

Depois que o Render concluir o deploy e o envio de teste for disparado, Danrley
pode colar este filtro na busca do Gmail:

```text
in:anywhere to:danrleywillian@gmail.com subject:[STAGING]
```

`in:anywhere` inclui Spam e Lixeira; o remetente aparecerá como **LabTech
Reservas UDF [STAGING]**. Se a busca não retornar mensagens, conferir primeiro
Spam e depois o status de envio no Brevo e os logs da API. O logo DW Corp é
servido pela API pública de staging em `/static/email/dw-corp.png`; os emails de
aprovação, status, reserva, pedido de mudanças e login usam essa marca. Ações e
PDF usam botões/texto HTML, sem depender de imagens privadas do MinIO.

Use apenas eventos sintéticos. O redirecionamento protege destinatários, mas o
conteúdo do email ainda pode conter os dados do evento criado.
