# Prompt para o Antigravity — Evolução do site para multiempresas

Copie e cole o texto abaixo no Antigravity, no contexto do projeto já existente (o site da Agência C&K construído anteriormente).

---

O site da **Agência C&K** que construímos precisa mudar de escopo. Ele deixou de ser uma landing page focada só na Viação Novo Horizonte e passa a ser a **landing page institucional da própria Agência C&K**, que vende passagens de **4 empresas parceiras** (por enquanto 3 definidas, uma quarta a confirmar depois). O objetivo agora é transmitir **confiança e credibilidade da agência**, não de uma única viação. Mantenha o design system já implementado (cores deep-navy/vibrant-gold/cream-canvas, tipografia Plus Jakarta Sans + Hanken Grotesk + JetBrains Mono, os motivos de bilhete/bordas serrilhadas, os componentes e animações já existentes) — a mudança é de **estrutura e conteúdo**, não de identidade visual.

## Conteúdo das empresas parceiras (use exatamente estas informações)

- **Viação Novo Horizonte**: vende passagens de São Paulo para mais de 200 cidades na Bahia. Destinos mais procurados: Lapão, Canarana, Morro do Chapéu (já usados no site), com destaque especial para **Seabra, Iraquara e Irecê**. Parcelamento em até 6x sem juros.
- **EMTRAM**: segue basicamente o mesmo modelo de negócio da Novo Horizonte (rede ampla de destinos ligando São Paulo à Bahia). Trate-a com o mesmo nível de destaque/robustez que a Novo Horizonte, sem inventar números específicos que não foram confirmados.
- **Anjos Turismo**: rota específica **São Paulo x Irecê**, com saídas 2 vezes por semana. Posicione-a como **a opção mais rápida** entre as parceiras.
- **4ª empresa**: ainda não definida. Construa a seção de forma que adicionar essa quarta parceira depois seja simples (componente reutilizável, grid com espaço para mais um card, sem hardcode que dificulte a extensão).

## Mudanças de estrutura

1. **Header**: adicione um link de navegação para a nova seção de empresas parceiras (ex: "Nossas Viações" ou "Empresas Parceiras"), mantendo os links já existentes que ainda fizerem sentido.

2. **Hero**: reescreva a copy para falar da **Agência C&K como marca principal**, não de uma viação específica. Em vez de "Viaje com quem conhece o caminho" (que remetia só à Novo Horizonte), a mensagem deve comunicar a agência como parceira de confiança que conecta o passageiro às melhores viações para o interior da Bahia — mantendo o mesmo tom editorial/boutique já definido. Ideias de direção (ajuste livremente mantendo o estilo): algo em torno de "conexão de confiança com o interior da Bahia" ou "várias viações, uma só agência de confiança". A imagem de fundo pode continuar sendo de ônibus na estrada, mas evite que remeta a uma marca específica de uma única viação.

3. **Nova seção: "Empresas Parceiras"** (logo após o hero, antes ou substituindo a atual seção de destinos): grid de cards, um por empresa, no mesmo estilo visual dos cards de destino já existentes (imagem/cor de fundo + overlay + texto). Cada card deve trazer: nome da empresa, uma frase de destaque (o diferencial dela — "200+ destinos na Bahia", "opção mais rápida para Irecê", etc.) e um CTA para comprar/consultar (WhatsApp). Como ainda não temos logos oficiais das parceiras, use badges tipográficos com o nome de cada empresa (na tipografia do design system) em vez de tentar recriar a identidade visual de cada uma — os logos podem ser trocados depois como assets.

4. **Seção de destinos**: mantenha os destinos já existentes (Lapão, Canarana, Morro do Chapéu, Seabra, Iraquara, Irecê e outros), mas deixe claro no texto que eles são atendidos através das empresas parceiras (ex: um selo pequeno indicando "via Novo Horizonte" / "via EMTRAM" / "via Anjos Turismo" em cada destino, quando fizer sentido — Irecê, por exemplo, pode citar tanto EMTRAM quanto Anjos Turismo).

5. **Bloco de promoção**: hoje é um único "bilhete" fixo (São Paulo x Lapão). Transforme em uma seção com **um bilhete por empresa parceira**, reaproveitando o mesmo componente visual (formato de bilhete, bordas serrilhadas, linha pontilhada) em grid ou carrossel horizontal — ex: bilhete da Novo Horizonte (destaque para 6x sem juros), bilhete da EMTRAM, bilhete da Anjos Turismo (destaque para a rota rápida SP x Irecê 2x/semana).

6. **Seção "Nossa História" / Sobre**: reescreva o texto para posicionar a Agência C&K como curadora de confiança de várias viações — não mais "parceira oficial da Viação Novo Horizonte", e sim algo como parceira oficial de múltiplas viações renomadas, com atendimento humanizado e presencial (endereço físico na Praça da Árvore) como diferencial frente a plataformas só de app. Mantenha a lista de "Diferenciais" (Atendimento Humanizado, Frota Moderna e Segura, Facilidade no Pagamento) e, se fizer sentido, adicione um diferencial sobre a curadoria/variedade de parceiras.

7. **Nova seção de credibilidade** (pode ficar entre a seção de empresas parceiras e a seção "Sobre", ou integrada a ela): um bloco curto com selos/ícones reforçando confiança — ex: "Parceira oficial de X viações", "Atendimento direto, sem intermediários", "Endereço físico na Praça da Árvore", "Parcelamento facilitado". Use o mesmo estilo de ícones (Material Symbols) já usado na seção "Diferenciais".

8. **Faixa de contato e Rodapé**: mantenha como estão, apenas revisando os textos que ainda mencionem só a Viação Novo Horizonte para refletirem a Agência C&K como marca principal.

## O que NÃO mudar

- Paleta de cores, tipografia, espaçamentos e demais tokens do DESIGN.md.
- Os componentes visuais já construídos (cards com overlay, botões com hard-shadow, bilhete com bordas serrilhadas, animações de scroll/parallax/reveal).
- Os CTAs de WhatsApp e os ajustes de responsividade/acessibilidade/performance já implementados na etapa anterior.

## Entregável

O site já existente, com a nova arquitetura de informação (empresas parceiras, credibilidade institucional) implementada, mantendo a identidade visual, a responsividade e as animações já construídas.
