# Reservas: avaliação técnica da primeira etapa

## Escopo

Executar a pilha local em Docker Linux, auditar dependências/runtime nos quatro repositórios, verificar API/Auth/Catálogo/Web/Mongo integrados e validar backup antes de qualquer escrita persistente. Sem novas funcionalidades, migração de schema, deploy ou merge.

## PRs e dependências

Os cinco PRs existentes foram atualizados, sem criar duplicatas. Shared Resources contribui com dois produtos (Auth e Catálogo).

| Produto | PR / head atual | Inventário atual e pendências |
|---|---|---|
| API | [#68](https://github.com/LabTechUDF/python-services/pull/68) `e1f9c0f` | 45/46 atuais; Python 3.14.8 aguarda imagem oficial Docker. `python-dotenv` 1.2.4. |
| Auth | [#31](https://github.com/LabTechUDF/shared-resources/pull/31) `0c92326` | 37/38 atuais; Python 3.14.8 aguarda imagem oficial Docker. `python-dotenv` 1.2.4. |
| Catálogo | [#30](https://github.com/LabTechUDF/shared-resources/pull/30) `742ea5a` | 45/47 atuais; `graphql-core` 3.3.0 limitado por Graphene 3.4.3 e `graphql-relay` 3.2.0 (`<3.3`). Manter 3.2.13, já acima das versões corrigidas 3.2.12; sem override. Python 3.14.8 também aguarda imagem oficial. |
| Web | [#41](https://github.com/LabTechUDF/interfaces-usuario/pull/41) `96031bd` | 115/140 atuais; 25 transitivos seguem limitados pelas faixas dos pais. Vite 8.3.2, Rolldown 1.2.12 e Oxc types 0.152.0. |
| Framework E2E | [#3](https://github.com/LabTechUDF/supreme-test-framework/pull/3) `3432e01` | 41/42 atuais; Python 3.14.8 aguarda imagem oficial. Poetry lock é a única fonte de dependências; `requirements.txt` e o job duplicado que o consumia foram removidos. |

Inventário por pacote, faixas e gatilhos de rechecagem estão em `reports/DEPENDENCIAS.csv` local. Contagens refletem a última checagem datada em 01/10/2026; a janela de 24 horas continua válida. Python.org já publicou 3.14.8, mas o Docker Hub não oferecia a imagem oficial `python:3.14.8-slim` na verificação de 12:49Z. Permanecem alinhados em Python 3.14.7 e a rechecagem é acionada quando a imagem oficial aparecer. As faixas de Graphene/Relay e dos pais Web são os demais bloqueios; não forçar majors/transitivos.

## Segurança e execução local

- Dockerfiles de API, Auth e Catálogo construíram em `linux/amd64`; `dpkg-query` confirmou `libpcre2-8-0` 10.46-1~deb13u3 e OpenSSL 3.5.7-1~deb13u3 nos três. Trivy pós-patch falhou internamente; os pacotes verificados não significam que uma varredura completa esteja limpa.
- Suítes no Docker: API 56 testes, Auth 18 + 4 subtestes e Catálogo 8; Web, instalação congelada/build SPA e 26 testes; E2E, 7 testes unitários, compile/import e Behave dry-run.
- Compose resolve os oito serviços para `linux/amd64`; `uname -m` confirmou `x86_64` nos sete containers ativos. Smoke integrado de leitura recebeu HTTP 200; catálogo local: 42 cursos, 190 salas, 1.584 ofertas 2026/2 e 1.858 ofertas 2024/2.
- E2E browser em Docker passou 2 cenários/11 etapas. Backup Mongo foi validado com `mongorestore --dryRun` antes da conta sintética; conta, chaves Redis e containers temporários foram removidos, com zero contas E2E e zero reservas após o teste. Quatro volumes do projeto preservados. Limpeza Docker padrão concluída.
- GitHub Actions nos heads acima passaram: [API](https://github.com/Lucasdoreac/python-services/actions/runs/36885550221), [Auth](https://github.com/Lucasdoreac/shared-resources/actions/runs/36885569929), [Catálogo](https://github.com/Lucasdoreac/shared-resources/actions/runs/36885566886), [Web](https://github.com/Lucasdoreac/interfaces-usuario/actions/runs/36885573006), [E2E framework](https://github.com/Lucasdoreac/supreme-test-framework/actions/runs/36885921963) e [E2E dependency refresh](https://github.com/Lucasdoreac/supreme-test-framework/actions/runs/36885922017). Um primeiro run de dependency refresh falhou por um job legado que ainda exigia `requirements.txt`; o commit `3432e01` removeu esse job duplicado e os dois workflows passaram no novo head.

## Dados e limites

O calendário oficial 2026/2 ainda não fornece dias/horários, então o catálogo local não foi alterado nem completado por inferência. Nenhuma escrita foi feita em Staging/Production; não houve deploy ou merge. A arquitetura do processo live no Render permanece sem confirmação direta; somente a pilha local foi verificada como amd64. As evidências locais completas permanecem em `reports/` e não são publicadas por este PR.
