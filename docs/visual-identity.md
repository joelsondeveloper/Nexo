# Identidade Visual — NEXO

## Visão Geral
O NEXO é um sistema de gestão para microempreendedores leigos, que precisam de clareza, controle e rapidez.
A identidade visual deve reduzir ansiedade, facilitar decisões e transmitir confiança.

Design não é enfeite. É ferramenta.

O objetivo visual do NEXO é fazer o usuário sentir:
> “Eu entendo meu negócio e tenho controle.”

---

## Princípios Visuais

- Simplicidade extrema
- Informação antes de estética
- Interface limpa e previsível
- Mobile-first
- Poucas cores, bem definidas
- Consistência acima de criatividade

Regra base:  
Se o usuário precisar pensar para entender a tela, falhamos.

---

## Modos de Interface

O NEXO trabalha com **Light Mode** e **Dark Mode**, ambos coerentes entre si.

Os dois modos:
- compartilham a mesma identidade
- mudam apenas contraste e conforto visual
- não alteram hierarquia nem significado das cores

A troca de modo não pode confundir o usuário.

---

## 🎨 Paleta de Cores — Light Mode

### Fundo
- **Background primário:** `#FFFFFF`
- **Background secundário:** `#F8FAFC`

Usado para:
- área principal
- cards
- seções de leitura

---

### Azul (cor principal do produto)
Representa confiança, controle e ação.

- **Primary:** `#2563EB`  
  Ações principais (botões, links importantes)
- **Primary Hover:** `#1D4ED8`  
  Estados de interação
- **Primary Soft:** `#DBEAFE`  
  Realces leves, fundos ativos, destaques sutis

---

### Texto
- **Texto principal:** `#0F172A`
- **Texto secundário:** `#475569`
- **Texto desativado:** `#94A3B8`

Hierarquia clara é obrigatória.  
Texto nunca deve competir com ação.

---

### Estados
- **Sucesso:** `#16A34A`
- **Alerta:** `#F59E0B`
- **Erro:** `#DC2626`

Cores de estado são funcionais, não decorativas.

---

## 🌙 Paleta de Cores — Dark Mode

O Dark Mode prioriza conforto visual e foco.

### Fundo
- **Background primário:** `#020617`
- **Background secundário:** `#020617`

---

### Azul (mantém identidade)
- **Primary:** `#3B82F6`
- **Primary Hover:** `#2563EB`
- **Primary Soft:** `#1E293B`

O azul continua sendo o guia visual do produto.

---

### Texto
- **Texto principal:** `#F8FAFC`
- **Texto secundário:** `#CBD5E1`
- **Texto desativado:** `#64748B`

Contraste é prioridade absoluta.

---

### Estados
- **Sucesso:** `#22C55E`
- **Alerta:** `#FACC15`
- **Erro:** `#F87171`

---

## Tipografia

- Fonte sem serifa
- Moderna, neutra e altamente legível
- Boa leitura em telas pequenas

Prioridades:
- Números financeiros bem visíveis
- Títulos claros e diretos
- Texto simples, sem termos técnicos desnecessários

A tipografia deve ajudar o usuário a **decidir**, não apenas a ler.

---

## Componentes

### Cards
- Fundo neutro
- Borda sutil
- Sombra leve
- Conteúdo direto

Cards servem para organizar informação, não para chamar atenção.

---

### Botões
- Ação clara
- Texto objetivo
- Azul reservado para ações realmente importantes

Nada de botão competindo com botão.

---

## Dashboard

O dashboard deve responder rapidamente às perguntas essenciais:

- Quanto eu ganhei?
- Quanto eu gastei?
- Estou no positivo ou no negativo?

Resumo primeiro.  
Detalhe depois.  
Configuração só quando necessário.

---

## Design Tokens (Conceito)

Toda a identidade visual do NEXO é baseada em **Design Tokens**.

Tokens são valores centralizados que representam decisões visuais, como:
- cores
- espaçamentos
- tipografia
- bordas
- sombras

### Por que usar tokens?
- Consistência visual
- Facilidade de manutenção
- Suporte nativo a Light/Dark Mode
- Escalabilidade do produto
- Menos refatoração no futuro

Nenhuma cor, tamanho ou estilo deve ser usado diretamente nos componentes sem passar pelos tokens.

---

## Estrutura Mental dos Tokens

- Tokens são definidos de forma **semântica**, não visual
- Exemplo:
  - `text.primary` em vez de `gray-900`
  - `background.primary` em vez de `white`

Isso permite:
- trocar paleta inteira sem quebrar UI
- adaptar o produto para white-label no futuro
- evoluir o design sem refazer componentes

---

## Tom Visual do Produto

- Profissional
- Amigável
- Não técnico
- Não intimidador

Sensação desejada:
> “Finalmente algo que foi feito pra mim.”

---

## Observação Importante

O design do NEXO não é estático.
Ele deve evoluir conforme o uso real dos microempreendedores.

Identidade visual serve ao usuário, não ao ego do produto.
