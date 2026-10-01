# Reservas: avaliação técnica da primeira etapa

## Escopo acordado

A primeira entrega é uma base técnica saudável: rodar a pilha local em Docker, analisar dependências e ajustes técnicos nos quatro repositórios, verificar API, Auth, Catálogo, Web e banco em conjunto, validar backup antes de qualquer escrita e registrar achados em PR. Não inclui novas funcionalidades nem merge direto em `main`. Não avançar sem execução local.

## Repositórios e dependências

A avaliação preserva os PRs existentes e seus heads, que seguem abertos contra `main`/`master`. O PR de análise #1 também segue aberto no fork pessoal. As versões referem-se aos manifests e locks dos candidatos abaixo.

| Repositório | Candidato | Situação |
|---|---|---|
| `python-services` (API) | PR #68, `0f6e6b4` | 43/43 pacotes atuais; Docker: 56 testes passaram no head atual. |
| `shared-resources` (Auth) | PR #31, `4dcb326` | 35/35 pacotes atuais; validação Docker registrada: 18 testes + 4 subtestes. |
| `shared-resources` (Catálogo) | PR #30, `05e0da8` | 43/44 atuais; `graphql-core` 3.3.0 é bloqueado por Graphene 3.4.3 e `graphql-relay` 3.2.0, ambos limitando a versão a `<3.3`; `graphql-server` 3.0.0 permite `<3.4`. Não forçar override incompatível. |
| `interfaces-usuario` (Web) | PR #41, `a90b5c2` | 112/137 atuais; atualizados Rolldown `1.2.11→1.2.12`, Oxc types `0.152.0` e `source-map-js` `1.2.2`. Restam 25 transitivas limitadas pelos pais. Build SPA, 26 testes e lock congelado passaram. |
| `supreme-test-framework` (E2E) | PR #3, `5eb45ec` | 39/39 pacotes atuais; Selenium alinhado entre Poetry e `requirements.txt`; 7 testes unitários e 2 cenários E2E passaram na validação registrada. |

O CSV local contém o inventário pacote a pacote. “Atual” significa a última versão estável compatível consultada; não é uma garantia geral de ausência de vulnerabilidades. API/Auth/E2E não têm upgrades de pacote pendentes. Os pais atuais de Graphene e os 25 transitivos do Web ainda não liberam os upgrades sem migração incompatível.

## Runtime e Actions

API, Auth, Catálogo e E2E fixam Python 3.14.7 em Docker/Actions. Python.org lançou 3.14.8, mas o registry oficial ainda não publica `python:3.14.8-slim` nem as variantes por plataforma; `python:3.14-slim` ainda resolve para 3.14.7. Os pins permanecem alinhados até a imagem 3.14.8 estar disponível. [Release Python 3.14.8](https://www.python.org/downloads/release/python-3148/) · [imagens oficiais Python](https://hub.docker.com/_/python).

O Web usa Node 26 (`v26.10.0` atual) e Vite 8.3.1; `react-router` e `@react-router/dev` estão em 8.4.0. Os workflows dos quatro repositórios usam `actions/checkout@v7`, `actions/setup-python@v7` e `actions/setup-node@v7`, versões major atuais. [Node.js](https://nodejs.org/en/download/current) · [checkout](https://github.com/actions/checkout/releases) · [setup-python](https://github.com/actions/setup-python/releases) · [setup-node](https://github.com/actions/setup-node/releases).

## Ambiente e dados

A pilha Docker `labtech-dev` está usando os heads ativos. Smoke local somente leitura: Web, API, Auth, Catálogo e MinIO responderam HTTP 200; o catálogo retornou 42 cursos, 190 salas, 1.584 ofertas 2026/2 e 1.858 ofertas 2024/2. O head atual do API #68 passou novamente com 56 testes. Auth, Catálogo, build SPA, testes Web e integração E2E permanecem cobertos pelas validações registradas nos mesmos heads e locks.

O backup Mongo local anterior ao índice foi validado com `mongorestore --dryRun`; não foi restaurado. Não houve escrita de dados, alterações em Staging/Production, merge ou deploy nesta rechecagem. As ofertas 2026/2 continuam sem dias/horários; esses valores dependem de fonte oficial e não serão inventados.

Uma branch local antiga de dependências da API (`chore/dependency-refresh`, `7416667`, baseada em `main`) instalou seu lock em Docker, mas a suíte antiga passou 13 testes e falhou em 6 verificações de logs já divergentes do código dessa base; seu lock também está atrás do PR #68. Ela não substitui o head atual do PR #68.

## Próxima etapa e limites

1. Preservar os PRs existentes; manter pais sem releases compatíveis como pendências, sem forçar majors.
2. Reavaliar Python 3.14.8 assim que o registry oficial publicar a imagem Docker correspondente e validar o mesmo pin no ambiente local.
3. Fazer qualquer escrita no banco somente depois de backup validado; não carregar calendário sem fonte oficial.

Não houve merge nem deploy Production. O relatório detalhado de versões e evidências permanece nos relatórios locais do projeto.
