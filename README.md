# Dashboard de Redes Sociais — MDA

Painel de Performance Digital desenvolvido pela **Listening** (Holding In.Pacto) para o **Ministério do Desenvolvimento Agrário e Agricultura Familiar (MDA)**.

Permite acompanhar em tempo real as métricas de alcance, visualizações, interações e crescimento de seguidores nas redes sociais do Ministério.

---

## Funcionalidades

- **Autenticação** via Supabase Auth com controle de acesso por usuário
- **Visão Geral consolidada** com KPIs por plataforma (Instagram, Facebook, YouTube)
- **Análise por plataforma** com modos flexível e fixo para Instagram e Facebook
- **Dashboard YouTube** com métricas específicas de vídeo
- **Filtro de período** com atalhos rápidos (Ontem, 7D, 30D) e seleção de datas personalizadas
- **Gráfico de evolução** diária ou mensal com abas separadas para Alcance/Visualizações e Interações
- **Tabela comparativa** entre plataformas com taxa de engajamento
- **Barras de interação por rede** para comparação visual rápida
- **Troca de senha** integrada ao painel
- **Responsivo** — sidebar colapsável em dispositivos móveis

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript |
| Estilização | Tailwind CSS 3 |
| Gráficos | Recharts |
| Backend / Banco | Supabase (PostgreSQL + Auth) |
| Datas | date-fns |
| Ícones | Lucide React |
| HTTP | Axios |

---

## Instalação

```bash
# Instalar dependências
npm install
```

Crie um arquivo `.env` na raiz com as variáveis do Supabase:

```env
REACT_APP_SUPABASE_URL=sua_url_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima
```

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm start` | Inicia em modo desenvolvimento em `http://localhost:3000` |
| `npm run build` | Gera build de produção na pasta `build/` |
| `npm test` | Executa os testes |

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── auth/
│   │   └── Login.tsx              # Tela de autenticação
│   ├── charts/
│   │   └── HorizontalBarChart.tsx # Componente de gráfico de barras
│   └── dashboard/
│       ├── MainDashboard.tsx      # Dashboard principal (visão geral + navegação)
│       ├── SocialDashboard.tsx    # Dashboard Instagram / Facebook
│       ├── YoutubeDashboard.tsx   # Dashboard YouTube
│       └── DataTable.tsx          # Tabela de dados reutilizável
├── contexts/
│   └── AuthContext.tsx            # Contexto de autenticação
├── hooks/
│   └── useSupabaseData.ts         # Hook de busca de dados no Supabase
├── lib/
│   └── supabaseClient.ts          # Instância do cliente Supabase
├── utils/
│   ├── dateUtils.ts               # Utilitários de formatação de data
│   └── chartColors.ts             # Paleta de cores dos gráficos
└── scripts/
    └── seedSupabase.ts            # Script de população inicial do banco
```

---

## Desenvolvimento

Desenvolvido por **Listening** — Holding In.Pacto.
Cliente: Ministério do Desenvolvimento Agrário e Agricultura Familiar.
