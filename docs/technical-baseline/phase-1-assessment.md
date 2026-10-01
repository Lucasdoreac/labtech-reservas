# Reservas: avaliação técnica da primeira etapa

## Escopo acordado

Esta etapa prepara uma base técnica saudável para os quatro repositórios do Reservas: executar a pilha local, identificar dependências e ajustes técnicos, verificar API, autenticação, catálogo, frontend e banco em conjunto, validar backup antes de qualquer escrita de dados e abrir PR com os achados. Não inclui funcionalidades novas nem merge direto em `main`. Mudanças no banco exigem backup validado previamente.

## Base de código avaliada

A validação local usa os heads ativos dos PRs nos forks, pois são os candidatos exercitados pelo Staging. Não se presume que uma branch local independente ou a `main` upstream contenha esses mesmos commits. Mudanças locais devem ser comparadas com o PR pertinente antes de portar; cada repositório mantém sua branch e PR próprios.

| Repositório | Candidato avaliado | Situação das dependências |
|---|---|---|
| `python-services` (API) | PR #68, `0f6e6b4` (Stage `f503e34`) | 43 pacotes atuais; lock-only charset-normalizer refresh e Docker API validada (56 testes). |
| `shared-resources` (Auth) | PR #31, `4dcb326` (Stage `92b93ff`) | 35 pacotes atuais; lock-only charset-normalizer refresh e Docker Auth validada (18 testes + 4 subtestes). |
| `shared-resources` (Catálogo) | PR #30, `05e0da8` | 43 de 44 atuais; `graphql-core` está limitado pelos requisitos dos pais Graphene/graphql-relay/graphql-server. Não forçar override incompatível. |
| `interfaces-usuario` (Web) | PR #41, `656f372` (Stage `454966c`) | 111 de 137 atuais; 26 transitivas aguardam migração de pais: `@react-router/dev@8.4.0` mantém Babel 7.x e `babel-dead-code-elimination@1.x` (2.0.0 já existe); `react-router@8.4.0` mantém `route-pattern` 0.22.x. Sass e compatibilidade de navegador atualizados; build SPA e 26 testes passaram. Staging usa head anterior. |
| `supreme-test-framework` (E2E) | PR #3, `5eb45ec` | 39 pacotes atuais; Selenium alinhado entre Poetry lock e requirements, com 7 testes unitários e 2 cenários E2E passados. |

Os números são do inventário local de manifests/locks na data da avaliação. “Atual” significa versão estável registrada no levantamento; não é garantia geral de ausência de vulnerabilidades. Rechecagem de metadados em 01/10: Poetry lista só `graphql-core` (3.2.13→3.3.0) como desatualizado no Catálogo; API/Auth/E2E não listam updates. Pais GraphQL e React Router continuam nas versões estáveis mais recentes; nenhum permite atualizar os transitivos bloqueados sem override incompatível.

## Ambiente e dados

A pilha Docker `labtech-dev` foi exercitada com os quatro serviços e os volumes existentes preservados. As suítes disponíveis previamente registradas passaram: API 56 testes, Auth 18 + 4 subtestes, Catálogo 8, frontend 26 e E2E integrado 2 cenários/11 passos. Build SPA passou. O smoke de leitura encontrou 42 cursos, 190 salas, 1.584 ofertas 2026/2 e 1.858 ofertas 2024/2. O seed automático foi ignorado por haver catálogo existente.

O backup Mongo foi validado com `mongorestore --dryRun` antes da criação de índice local. O arquivo não foi restaurado. A auditoria não encontrou necessidade de alterar dados para fazer a integração básica funcionar. As 1.584 ofertas 2026/2 não têm dias/horários; esses valores dependem de fonte oficial e não serão inventados ou carregados nesta etapa. Não houve escrita em ofertas/índices nem acesso de escrita a Stage/Production. O E2E local criou apenas a conta sintética isolada após backup validado; a limpeza foi verificada com 0 documentos de autenticação e 0 chaves Redis.

## Próximas correções e limites

1. Manter as dependências limitadas por pais como pendências de migração, sem forçar major incompatível.
2. Conservar os heads dos PRs como referência local; validar alterações técnicas em cada serviço no Docker antes de atualizar seu PR.
3. Seguir com mudanças de dados somente quando necessárias e após backup validado; não carregar calendário sem fonte oficial.

Não houve merge nem deploy Production nesta etapa. O relatório de dependências pacote a pacote e evidências detalhadas permanecem nos relatórios locais de trabalho.
