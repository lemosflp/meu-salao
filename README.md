# 🎉 Meu Salão - Sistema SaaS para Gestão de Casas de Festas

Sistema completo para gerenciamento de casas de festas, desenvolvido com React. js, TypeScript e Supabase. 

## 📋 Sobre o Projeto

O **Meu Salão** é uma aplicação SaaS (Software as a Service) voltada para o gerenciamento de casas de festas, automatizando processos como agendamento de eventos, cadastro de clientes, controle de reservas e gestão financeira.

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios

```
src/
├── components/          # Componentes de UI reutilizáveis
│   └── ui/             # Componentes base (shadcn/ui)
├── contexts/           # Gerenciamento de estado global (Context API)
├── hooks/              # Custom Hooks reutilizáveis
├── lib/                # Configurações e utilitários
├── pages/              # Páginas/Telas da aplicação
├── services/           # Camada de serviços (API/Backend)
├── types/              # Definições de tipos TypeScript
└── data/               # Dados estáticos e constantes
```

### Diagrama de Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Dashboard  │  │   Eventos   │  │  Calendário │  ...        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA DE ESTADO                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ AuthContext │  │ AppContext  │  │PacotesContext│  ...       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE SERVIÇOS                          │
│              ┌────────────────────────────┐                     │
│              │      supabaseApi.ts        │                     │
│              │    (Repository Pattern)    │                     │
│              └─────────────┬──────────────┘                     │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CAMADA DE INFRAESTRUTURA                       │
│              ┌────────────────────────────┐                     │
│              │    supabaseClient. ts       │                     │
│              └─────────────┬──────────────┘                     │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (BaaS)                              │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐          │
│  │  PostgreSQL  │  │    Auth     │  │      RLS      │          │
│  │   (Dados)    │  │    (JWT)    │  │ (Multi-tenant)│          │
│  └──────────────┘  └─────────────┘  └───────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Camadas da Aplicação

#### 1. Camada de Apresentação
Páginas e componentes de interface:
- **Dashboard**: KPIs e métricas gerais
- **Eventos**: Gestão completa de eventos
- **Clientes**: Cadastro e gerenciamento
- **Calendário**: Visualização temporal
- **Pacotes**: Propostas, adicionais e equipes
- **Relatórios**: Análises e exportações

#### 2. Camada de Estado (Context API)
| Contexto | Responsabilidade |
|----------|------------------|
| `AuthContext` | Autenticação e sessão |
| `AppContext` | Clientes, eventos e pagamentos |
| `PacotesContext` | Propostas comerciais |
| `AdicionaisContext` | Serviços extras |
| `EquipesContext` | Equipes de profissionais |
| `ConfiguracoesContext` | Configurações do salão |

#### 3. Camada de Serviços
Implementa o **Repository Pattern** em `services/supabaseApi.ts`:
- Autenticação transparente
- Mapeamento snake_case ↔ camelCase
- Tratamento centralizado de erros
- Isolamento multi-tenant automático

#### 4. Camada de Infraestrutura
Configuração do cliente Supabase em `lib/supabaseClient.ts`. 

## 🛠️ Tecnologias Utilizadas

- **React.js 18+** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Supabase** - Backend-as-a-Service (BaaS)
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de interface
- **React Router** - Roteamento
- **TanStack Query** - Gerenciamento de dados assíncronos

## 🔒 Segurança

- Autenticação JWT via Supabase Auth
- Row Level Security (RLS) para isolamento multi-tenant
- Comunicação HTTPS obrigatória
- Validação de dados em frontend e backend

---

Desenvolvido por **Felipe Lemos Oliveira**