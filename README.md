# 🏛️ LabTech UDF — Sistema de Reservas de Salas (Monorepo)

Bem-vindo ao monorepo oficial do **Sistema de Reservas de Espaços e Salas da UDF**.

Este repositório unifica toda a arquitetura da solução em um único lugar, permitindo que qualquer colaborador consiga clonar, subir a pilha completa localmente em menos de 2 minutos e começar a programar com os mesmos dados e configurações usados pelo time.

---

## 📐 Arquitetura da Solução

A aplicação é composta por 4 serviços desacoplados:

```
labtech-reservas/
├── apps/
│   ├── api/          # Backend principal (Python 3.12 / Flask / Gunicorn)
│   ├── auth/         # Microserviço de Autenticação & Magic Link (Python / Flask)
│   ├── catalog/      # Microserviço de Catálogo UDF (REST + GraphQL)
│   └── web/          # Frontend Web SPA (React 18 / Vite)
├── dev-local/        # Ferramentas locais, scripts de teste, seed e smoke test
├── compose.yaml      # Docker Compose unificado da pilha completa
└── render.yaml       # Infraestrutura como Código (IaC) para Deploy no Render
```

### URLs Locais Padrão:
- **Frontend Web**: [http://localhost:3000](http://localhost:3000)
- **API Principal**: [http://localhost:5000](http://localhost:5000) (Swagger em `/apidocs`)
- **Autenticação**: [http://localhost:5050](http://localhost:5050)
- **Catálogo UDF**: [http://localhost:5081](http://localhost:5081)
- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (`user` / `password`)
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`

---

## 🚀 Como Rodar Localmente (Ambiente Dev em 2 minutos)

### Pré-requisitos
- **Docker** e **Docker Compose** instalados (Docker Desktop ou Colima).

### 1. Clonar o repositório
```bash
git clone https://github.com/Lucasdoreac/labtech-reservas.git
cd labtech-reservas
```

### 2. Subir todos os serviços com 1 comando
```bash
docker compose up -d --build
```
> O Docker irá baixar as imagens base, compilar os contêineres e automaticamente restaurar o **Catálogo Real da UDF** (2.967 documentos com 151 salas, 248 professores e 42 cursos).

### 3. Validar se tudo está funcionando (Smoke Test)
Execute o teste de fumaça que simula uma reserva real de ponta a ponta:
```bash
./dev-local/smoke.sh
```
Se você vir `smoke ok: reserva confirmada e aprovada`, seu ambiente local está 100% íntegro!

---

## 🧪 Rodando os Testes

O repositório conta com suítes de testes automatizados completas para todos os serviços:

```bash
# Rodar todos os testes de backend
./dev-local/run-tests.sh

# Rodar testes de um serviço específico:
./dev-local/run-tests.sh api
./dev-local/run-tests.sh auth
./dev-local/run-tests.sh internal

# Rodar testes do Frontend
./dev-local/run-tests.sh frontend
```

---

## 🔑 Autenticação e Magic Link em Modo Dev

No ambiente local ou de demonstração, **nenhum e-mail de verdade precisa sair pela internet**:
1. Ao acessar `http://localhost:3000/organizer`, informe qualquer e-mail com final `@udf.edu.br` (ex: `coordenacao@udf.edu.br` ou `professor@udf.edu.br`).
2. A tela exibirá um **botão com o Magic Link de desenvolvimento**.
3. Basta clicar para entrar instantaneamente na sessão autenticada.

---

## ☁️ Deploy em Nuvem (Render + MongoDB Atlas)

O monorepo está preparado para deploy contínuo gratuito no **Render**:
- O arquivo `render.yaml` declara os 4 serviços com build automático e roteamento interno.
- Banco de dados em nuvem: **MongoDB Atlas M0** com o catálogo UDF já semeado.
- Envio de e-mails em produção: suporta **Brevo (Sendinblue)** com 300 envios/dia grátis.

---

## 🤝 Fluxo de Contribuição dos Colaboradores

1. Faça um **Fork** deste repositório no seu perfil do GitHub.
2. Crie uma branch para sua funcionalidade ou correção:
   ```bash
   git checkout -b feat/minha-melhoria
   ```
3. Faça commits claros seguindo o padrão Conventional Commits (`feat: ...`, `fix: ...`, `chore: ...`).
4. Garanta que `./dev-local/smoke.sh` e `./dev-local/run-tests.sh` passem com sucesso.
5. Abra um **Pull Request** para a branch `main`.
