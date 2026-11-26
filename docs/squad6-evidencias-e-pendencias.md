# Squad 6 — evidências e pendências para 28/11

Documento de apoio para o grupo conferir. Não é o PDF final nem prova de que o MVP está pronto.

## Orientação recebida

No WhatsApp da Squad 6, em 24/11, foi compartilhado um modelo para PDF e informada a possibilidade de apresentar o documento com execução do MVP em tempo real. Apresentação: 28/11/2026, 9h–9h30. O modelo indica entrega em 28/11, sem horário ou canal confirmados nas mensagens consultadas. O exemplo de preenchimento não é evidência de fatos do projeto.

## Fontes técnicas

- [Monorepo Reservas, README na revisão 6e8258b](https://github.com/Lucasdoreac/labtech-reservas/blob/6e8258bf459d0f564ad626e5bc65ce6246d7010a/README.md): visão e instruções locais. A execução não foi validada para a apresentação.
- [API, README na revisão 8ded63b](https://github.com/Lucasdoreac/python-services/blob/8ded63ba3e240fcccd9e417ca7044f0c7b0bc2db/README.md).
- [Frontend, README na revisão bc9c63d](https://github.com/Lucasdoreac/interfaces-usuario/blob/bc9c63d4eef92125a417a8713ab57daac2aa488a/README.md).
- [Auth e catálogo, README na revisão 1707c8e](https://github.com/Lucasdoreac/shared-resources/blob/1707c8ea6d9f76e27378f693bbb2e5e37585ac47/README.md).
- [Apresentação anterior em PDF](https://github.com/Lucasdoreac/labtech-reservas/blob/6e8258bf459d0f564ad626e5bc65ce6246d7010a/docs/apresentacao-reservas-udf-2026-09-26.pdf): conteúdo ainda não conferido para esta entrega.

## Verificações para o PDF

- [ ] Capa, integrantes, papéis e contribuições: confirmar com o grupo.
- [ ] Histórico: reunir ao menos quatro encontros, duração, avanços, presença e uma evidência de cada, conforme o modelo; não inventar justificativas de ausência.
- [ ] Visão geral: confirmar problema, objetivo, público, funcionalidades entregues e fora de escopo.
- [ ] Requisitos funcionais e não funcionais: cotejar com a versão efetivamente demonstrada.
- [ ] UML: casos de uso e especificações, classes, dicionário de dados e atividades; verificar os artefatos já existentes.
- [ ] Backlog: prioridade, responsável e situação real de cada item.
- [ ] Tutorial das interfaces: obter capturas da versão demonstrada com dados sintéticos e instruções conferidas.
- [ ] Pré-requisitos, instruções de execução, repositórios e eventual deploy: verificar links e execução antes de declarar disponibilidade.
- [ ] Uso de IA: declarar ferramentas, finalidade e revisão humana efetivamente realizada; não afirmar testes ou validações que não ocorreram.
- [ ] Considerações finais, assinaturas e apêndices com evidências de encontros e adicionais.

## Estado técnico e demonstração

- [PR web #3](https://github.com/Lucasdoreac/interfaces-usuario/pull/3): draft de horário de Brasília, dependente de alteração da API. Os testes descritos são sintéticos, não demonstram integração ponta a ponta.
- [PR API #2](https://github.com/Lucasdoreac/python-services/pull/2): draft de consolidação; a proposta de fuso ainda precisa ser aplicada e validada. A API atual e a consulta nova de disponibilidade não têm o mesmo contrato.
- CI do frontend: há check falho; a causa da falha no ambiente do GitHub ainda não está confirmada. Não afirmar que está aprovado.
- Antes da demonstração: escolher versão e ambiente com o grupo; testar login, consulta, seleção e criação com dados sintéticos; guardar uma alternativa previamente validada se o ambiente falhar. Não usar produção, enviar e-mails reais ou alterar dados históricos sem autorização.
- Manter em revisão os horários em PDF/e-mail e registros antigos; não presumir conversão ou migração correta.

## Perguntas para a equipe

1. Qual versão e qual ambiente serão demonstrados, e quem os validará?
2. Onde estão os registros de encontros, integrantes, diagramas, backlog e capturas?
3. Qual o horário e canal de entrega do PDF, e quem consolida e assina?

Informações organizadas com auxílio de IA; o grupo deve conferir fontes, decisões e resultados antes de usar.