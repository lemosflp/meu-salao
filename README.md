# 🎉 Meu Salão - Sistema SaaS para Gestão de Casas de Festas

Sistema completo para gerenciamento de casas de festas, desenvolvido com React.js, TypeScript e Supabase. 

## 📋 Sobre o Projeto

O **Meu Salão** é uma aplicação SaaS (Software as a Service) voltada para o gerenciamento de casas de festas, automatizando processos como agendamento de eventos, cadastro de clientes, controle de reservas e gestão financeira.

## 🚀 Funcionalidades

- ✅ Gestão completa de clientes com validação de CPF
- ✅ Cadastro de eventos com múltiplos aniversariantes
- ✅ Propostas comerciais com três modelos de precificação
- ✅ Sistema de pagamentos parcelados
- ✅ Calendário interativo semanal
- ✅ Relatórios gerenciais com exportação CSV/Excel
- ✅ Integração com Google Calendar
- ✅ Interface responsiva (mobile/tablet/desktop)

---

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
│  │  Dashboard  │  │   Eventos   │  │  Calendário │  ...         │
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
│              │      supabaseApi. ts        │                     │
│              │    (Repository Pattern)    │                     │
│              └─────────────┬──────────────┘                     │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CAMADA DE INFRAESTRUTURA                       │
│              ┌────────────────────────────┐                     │
│              │     supabaseClient.ts      │                     │
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

#### 1.  Camada de Apresentação
Páginas e componentes de interface:
- **Dashboard**: KPIs e métricas gerais
- **Eventos**: Gestão completa de eventos
- **Clientes**: Cadastro e gerenciamento
- **Calendário**: Visualização temporal
- **Pacotes**: Propostas, adicionais e equipes
- **Relatórios**: Análises e exportações

#### 2. Camada de Estado (Context API)

Hierarquia de Providers:
```typescript
<AuthProvider>
  <ConfiguracoesProvider>
    <AppProvider>
      <PacotesProvider>
        <AdicionaisProvider>
          <EquipesProvider>
            {/* Rotas */}
          </EquipesProvider>
        </AdicionaisProvider>
      </PacotesProvider>
    </AppProvider>
  </ConfiguracoesProvider>
</AuthProvider>
```

| Contexto | Responsabilidade |
|----------|------------------|
| `AuthContext` | Autenticação e sessão |
| `AppContext` | Clientes, eventos e pagamentos |
| `PacotesContext` | Propostas comerciais |
| `AdicionaisContext` | Serviços extras |
| `EquipesContext` | Equipes de profissionais |
| `ConfiguracoesContext` | Configurações do salão |

#### 3.  Camada de Serviços (Repository Pattern)

Implementação em `services/supabaseApi.ts`:

```typescript
export async function getClientesApi(): Promise<Cliente[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("clientes")
    . select("*")
    .eq("user_id", userId)  // Isolamento multi-tenant
    . order("created_at", { ascending: false });

  // Mapeamento snake_case -> camelCase
  return data?. map((c) => ({
    id: c.id,
    nome: c.nome,
    // ... 
  })) || [];
}
```

**Responsabilidades:**
- Autenticação transparente (obtém userId automaticamente)
- Mapeamento de dados (snake_case ↔ camelCase)
- Tratamento centralizado de erros
- Isolamento multi-tenant via user_id

---

## 📊 Padrões de Projeto Aplicados

### Context API Pattern
Gerenciamento de estado global evitando prop drilling:
```typescript
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext deve ser usado dentro de AppProvider");
  return ctx;
};
```

### Provider Pattern
Encapsula lógica complexa em providers especializados, promovendo separação de responsabilidades. 

### Custom Hooks Pattern
Hooks personalizados para lógica reutilizável:
- `useAppContext()` - Clientes e eventos
- `usePacotesContext()` - Propostas
- `useAdicionaisContext()` - Serviços extras
- `useEquipesContext()` - Equipes
- `useAuth()` - Autenticação

### Repository Pattern
Abstração da camada de acesso a dados via `supabaseApi.ts`. 

### Compound Components Pattern
Utilizado pela biblioteca shadcn/ui para composição flexível de componentes.

---

## 🗄️ Modelagem de Dados

### Entidades Principais

```
auth. users (Supabase Auth)
    │
    ├── clientes (1:N)
    │       └── eventos (N:1)
    │
    ├── pacotes
    │       └── eventos (N:1)
    │
    ├── adicionais
    │       └── evento_adicionais (N:N)
    │
    ├── equipes
    │       ├── equipe_profissionais (1:N)
    │       └── eventos (N:1)
    │
    └── configuracoes
```

### Tabelas do Sistema

| Tabela | Descrição |
|--------|-----------|
| `clientes` | Dados cadastrais dos clientes |
| `eventos` | Eventos agendados |
| `pacotes` | Propostas comerciais |
| `adicionais` | Serviços extras |
| `equipes` | Grupos de profissionais |
| `evento_pagamentos` | Histórico de pagamentos |
| `evento_aniversariantes` | Homenageados do evento |
| `evento_adicionais` | Relação N:N evento-adicional |
| `evento_equipe_profissionais` | Profissionais alocados |
| `configuracoes` | Dados do salão |

---

## 💰 Regras de Negócio

### Cálculo de Valor do Evento

```typescript
// Valor base do pacote
let valorTotal = pacote.valorBase;

// Adicional por pessoa extra
if (convidados > pacote.convidadosBase) {
  valorTotal += (convidados - pacote.convidadosBase) * pacote.valorPorPessoa;
}

// Soma dos adicionais
adicionais.forEach(adicional => {
  switch (adicional.modelo) {
    case "valor_pessoa":
      valorTotal += adicional.valor * convidados;
      break;
    case "valor_unidade":
      valorTotal += adicional. valor * quantidade;
      break;
    case "valor_festa":
      valorTotal += adicional.valor;
      break;
  }
});
```

### Validações

- **CPF**: Algoritmo completo de validação de dígitos verificadores
- **Convidados**: Mínimo conforme proposta selecionada
- **Data/Hora**: Suporte a eventos que atravessam meia-noite

---

## 🔒 Segurança

### Camadas de Proteção

| Camada | Implementação |
|--------|---------------|
| Autenticação | JWT via Supabase Auth |
| Autorização | Row Level Security (RLS) |
| Criptografia | bcrypt (senhas), HTTPS (comunicação) |
| Validação | Frontend + Backend |

### Prevenção OWASP Top 10

- **A01 - Broken Access Control**: RLS + validação de user_id
- **A02 - Cryptographic Failures**: bcrypt + HTTPS
- **A03 - Injection**: Prepared statements (Supabase)
- **A05 - Security Misconfiguration**: Variáveis de ambiente
- **A07 - XSS**: Escape automático do React

### Conformidade LGPD

- Finalidade definida (gestão de eventos)
- Coleta apenas de dados necessários
- Múltiplas camadas de segurança
- Controle do usuário sobre seus dados

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
|------------|------------|
| React.js 18+ | Biblioteca de UI |
| TypeScript | Tipagem estática |
| Vite | Build tool |
| Supabase | Backend-as-a-Service |
| Tailwind CSS | Estilização |
| shadcn/ui | Componentes de interface |
| React Router | Roteamento |
| TanStack Query | Dados assíncronos |
| date-fns | Manipulação de datas |
| Recharts | Gráficos |
| SheetJS (xlsx) | Exportação Excel |

---

Desenvolvido por **Felipe Lemos Oliveira**