# LetraFun

Plataforma de jogos educativos para auxiliar crianças em fase de alfabetização.

Criei este projeto para ajudar meus filhos, que estavam com dificuldade de manter o foco na escola. A ideia é usar tecnologia e diversão para reforçar o aprendizado de letras, palavras e associação visual — tudo no ritmo deles.

## Jogos

### Pesca Letras
A criança precisa pescar o peixe que carrega a letra indicada. Os peixes nadam em raias pela tela e cada um exibe uma letra em um balão acima dele. Acertou? Próxima rodada. Errou? Ouve a letra de novo para reforçar.

### Olho Vivo
Um jogo de "encontre o objeto": a tela mostra vários itens espalhados e a criança precisa achar o que foi pedido (por texto e áudio em português). Trabalha vocabulário, atenção e associação imagem–palavra.

## Funcionalidades

- **Sistema de XP e níveis** — cada jogo dá pontos de experiência que sobem o nível da criança
- **Álbum de figurinhas** — ao completar jogos a criança pode desbloquear figurinhas colecionáveis com diferentes raridades
- **Painel do responsável** — área para o adulto personalizar os jogos, gerando cenários e assets com IA (Gemini Imagen) ou buscando no GIPHY
- **Áudio em português** — os jogos falam as letras e palavras para reforçar a associação fonética
- **Ranking** — placar entre as crianças cadastradas para motivar de forma saudável

## Stack

- **Next.js 16** (App Router, React 19)
- **Tailwind CSS 4** + **Framer Motion**
- **Prisma** + MySQL (TiDB Cloud)
- **NextAuth** (autenticação dos responsáveis)
- **Google Gemini** (geração de imagens por IA)
- **GIPHY API** (figurinhas animadas)

## Rodando localmente

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Preencher DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_API_KEY, GIPHY_API_KEY

# Gerar cliente Prisma e aplicar migrações
npx prisma generate
npx prisma db push

# Iniciar servidor de desenvolvimento
npm run dev
```

## Estrutura

```
src/
├── app/
│   ├── (auth)/          # Login / cadastro
│   ├── (parent)/        # Painel do responsável (admin)
│   ├── (child)/         # Área da criança (jogos, mural, ranking)
│   └── api/             # Rotas de API
├── components/
│   ├── games/           # Componentes dos jogos
│   ├── layout/          # Layout compartilhado (GameLayout, ChildNav)
│   ├── mural/           # Álbum de figurinhas
│   └── dashboard/       # Personalizer e painel admin
└── lib/                 # Utilitários, Prisma client, API helpers
```

## Licença

MIT
