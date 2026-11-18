# make.fun — conceitos e plano de produção

Preparado em 17/11/2026, horário de Brasília. O usuário escolheu O Último Bentô; a primeira versão jogável está implementada. Resultados de verificação em VALIDACAO.md.

Nossa prioridade é um jogo 2D completo, com uma interação central forte, decisões reais, progressão curta, conclusão e apresentação clara em quatro capturas. As estimativas abaixo são de planejamento e incluem um MVP completo com acabamento inicial. Reservar mais duas horas para testes finais, pacote e transcrições.

| Conceito | Ação central | Produção estimada | Avaliação de potencial |
| --- | --- | --- | --- |
| O Último Bentô | Encaixar e girar ingredientes para cumprir receitas | 4–6h | Melhor equilíbrio entre clareza, identidade e custo |
| Último Elevador | Planejar paradas e cargas durante uma evacuação | 4–6h | Objetivo e perigo imediatamente visíveis |
| Pulso de Emergência | Atravessar válvulas e entregar cargas no ritmo do pulso | 5–7h | Interação distinta, com maior desafio de comunicação visual |
| Cascas de Titã | Alternar carapaças para explorar uma estufa gigante | 6–8h | Personagem e habilidades fortes, com risco maior de produção |

## O Último Bentô

Uma pequena cozinha tenta concluir seis encomendas antes do encerramento do último turno. Ingredientes são peças coloridas de duas a quatro células. O jogador arrasta e gira essas peças dentro de uma marmita, atendendo condições de receita.

As decisões são escolher entre três ingredientes oferecidos, preservar espaço para a receita e gastar descartes limitados. Adjacências produzem combinações reais, como molho encostando em um ingrediente compatível. O jogador enxerga o resultado dessas decisões imediatamente.

Três etapas com dois pedidos cada compõem a partida. O último pedido combina condições já ensinadas. Erros consomem a tolerância do cliente. Pedidos bem atendidos acumulam combo, dinheiro e classificação. Há vitória, derrota, resumo e reinício.

A arte combina balcão de madeira, cerâmica azul, comida em pixel art e pequenos clientes expressivos. Vapor, sons curtos e animações de encaixe dão acabamento. Cada alimento precisa continuar legível dentro da grade.

As quatro capturas seriam a cozinha com o primeiro pedido, uma montagem com combinação ativa, o pedido final mais exigente e o resultado com classificação/reinício. O ciclo completo atende ao primeiro critério da rubrica. A relação entre receitas e espaço sustenta a profundidade. A comida e os materiais sustentam a identidade visual.

O risco principal é gerar combinações insolúveis. A versão inicial usaria seis pedidos desenhados manualmente e ofertas de peças verificadas, com aleatoriedade limitada. Minha recomendação principal é este conceito.

## Último Elevador

Um prédio está sendo inundado e o jogador opera o último elevador funcional. Precisa levar moradores até a cobertura enquanto a água ocupa os andares inferiores.

O jogador escolhe a próxima parada, combina passageiros dentro da capacidade e administra energia. Grupos têm tamanhos e urgências diferentes. Rotas longas podem ser eficientes, mas deixam andares próximos da água esperando. As filas e a subida da água tornam os dilemas visíveis no cenário.

Três trechos do prédio introduzem combinações mais difíceis. Uma última evacuação conclui a partida. A meta mínima determina vitória e a eficiência define a classificação. O cenário mantém o mesmo conjunto de controles durante toda a progressão.

A apresentação é um corte lateral de um prédio antigo, com cabine amarela, apartamentos iluminados e água azul subindo. Pequenas animações de embarque, portas e ondas dão movimento a uma estrutura econômica.

As capturas mostrariam prédio e objetivo inicial, uma decisão de carga, a evacuação final com água alta e o relatório de resgate. A rubrica se beneficia de objetivo, risco e progresso presentes no próprio cenário.

O principal risco é haver espera entre decisões. Deslocamentos devem ser rápidos e cada chegada deve oferecer uma escolha. É minha segunda opção.

## Pulso de Emergência

Um mensageiro microscópico transporta remédios por um coração mecânico. Válvulas abrem conforme as batidas e o jogador usa um impulso no momento certo para atravessá-las.

O jogador escolhe entre rota segura e atalho, decide quando gastar o impulso e administra a integridade da carga. A janela de acerto é visível. Travessias bem sincronizadas formam combos. Som sintetizado reforça o pulso.

Três câmaras usam padrões planejados. A última alterna dois ritmos e termina com a entrega final. Uma falha de carga encerra a tentativa. A conclusão mostra o coração estabilizado e o resultado.

A arte mistura tecido vermelho estilizado, cobre, engrenagens e válvulas. O mensageiro precisa ter silhueta forte e contraste suficiente contra os obstáculos.

As capturas mostrariam rota e pulso, uma travessia com combo, a arritmia final e o coração estabilizado. Oferece habilidade e uma ação própria para a rubrica.

O risco está no ajuste do timing e em comunicar movimento por uma imagem estática. O medidor e os efeitos precisam evidenciar o que aconteceu. Por isso fica atrás das duas primeiras opções para esta janela.

## Cascas de Titã

Um pequeno besouro invade uma estufa dominada por uma planta gigante. Leva duas carapaças e alterna entre habilidades. A pesada quebra obstáculos, a aderente sobe paredes e a flutuante atravessa água.

O jogador escolhe a combinação antes de sair, alterna durante a travessia e decide entre coletar seiva ou preservar a rota segura. Cada carapaça altera movimento e acesso de maneira verificável.

Três áreas curtas ensinam e combinam os usos. A planta final cria obstáculos resolvidos pelas habilidades já aprendidas. Derrotar a planta e escapar encerra a partida.

O jardim aparece à escala de insetos, com sementes enormes, ferramentas abandonadas e um besouro expressivo. A mudança de carapaça precisa ser visível no personagem.

As capturas mostrariam seleção e entrada, travessia usando habilidades, confronto final e fuga concluída. A rubrica ganha personagem, progressão e uso consistente da mecânica central.

O maior risco é o tempo gasto com movimento, colisões, mapas e animações. É a alternativa de maior compromisso técnico.

## Plano de produção proposto

1. Escolher o conceito e fixar o escopo.
2. Preparar kit, repositório novo e validação inicial do material de sessão.
3. Construir a interação central e uma etapa jogável completa.
4. Acrescentar a progressão, vitória, derrota e reinício.
5. Refinar arte, áudio, legibilidade e resposta das ações.
6. Jogar o ciclo inteiro, corrigir falhas e capturar quatro estados reais.
7. Conferir pacote determinístico, transcrições e requisitos antes da submissão.

Meta interna proposta de pacote revisável até 18/11 às 12h, deixando três horas até o prazo oficial.

## Conferência técnica

Prazo oficial reconfirmado em 18/11/2026 às 15h de Brasília. Primeiro prêmio de 400 USDC, aproximadamente US$ 400; fundo total de 1.000 USDC, aproximadamente US$ 1.000. Entrada gratuita. Jogo desktop em arquivos estáticos offline, main.ts, biblioteca oficial intacta, dossiê e capturas reais. [Bounty](https://make.fun/bounty/best-game-01)

Node 22.23.2 e Codex CLI 0.146.1 estão disponíveis. Os logs deste fork e de seu parent existem e começam depois da abertura. Os metadados indicam Codex Desktop 0.169.0-alpha.11.1 para a sessão atual. O pacote real e a sanitização de instruções privadas ainda precisam de validação local. Os logs originais devem ser preservados. [Kit](https://make.fun/c/best-game-01/kit) · [Guia de transcrições](https://make.fun/skill.md)

O percentual do ranking mede força comparativa. Nosso alvo de engenharia é passar nos checks e sustentar a qualidade na revisão do jogo. A pontuação efetiva depende do avaliador e dos confrontos. A rubrica prioriza jogo completo, diversão/profundidade, acabamento, visual/originalidade e estrutura do código. [Regras oficiais](https://make.fun/api/competitions/best-game-01)
