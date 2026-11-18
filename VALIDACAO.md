# O Último Bentô — validação da primeira versão

Conferido em 17/11/2026, horário de Brasília. Projeto local, ainda sem inscrição enviada.

## Jogo

- Seis pedidos completos, três vidas, cronômetro, pontuação, combo e recorde local.
- Seis ingredientes originais, com piscar de olhos, movimento e expressões de felicidade/desgosto por vizinhança.
- Arrastar ou clicar para encaixar, girar, retirar, desfazer, pausar e reiniciar. Som sintetizado com controle de áudio.
- Afinidades: arroz/salmão, tamago/brócolis, tofu/umeboshi. Conflitos: arroz/tofu, salmão/tamago, brócolis/umeboshi.
- Arte desenhada em Canvas. A imagem de referência não integra o jogo. Sem dependências ou recursos de rede durante a partida.

## Verificação realizada

- Campanha inteira concluída pelo navegador, usando cliques e teclas reais.
- Rotação, amizade, conflito, desfazer e reinício verificados na interface.
- Revisão final confirmou que a pausa bloqueia a entrega e que a tela de resultado não permite pontuar a mesma entrega duas vezes.
- Console da revisão final sem erros ou avisos capturados.
- Verificação de sintaxe JavaScript e busca de solução para cada um dos seis pedidos aprovadas.
- Duas execuções de `main.ts`: sete arquivos de saída com SHA-256 idêntico, incluindo `dossier.json`.
- Biblioteca `vendor/makefun-game.ts` idêntica à do kit oficial.
- Quatro capturas reais: 1280×820, 1270×820, 1280×820 e 1280×820; cada uma abaixo de 256 KiB.
- Licença MIT com identificador SPDX.

## Checagem oficial local

O comando `check` do kit best-game-01 retornou código 0: 13 verificações aprovadas, seis não aplicáveis ou reservadas e cinco dependentes da inscrição no servidor. Os três logs nativos foram reconhecidos. A autoria reconhecida foi de 96% das linhas contadas, acima dos 30% exigidos, com 2,3% de texto sem escrita reconhecida, abaixo do limite de 40%.

O formato automático foi revertido à escrita original registrada nos próprios logs, preservando as correções de jogabilidade. O comparador oficial trabalha por linhas; não foi recriado ou inventado histórico de autoria.

Os relatórios, o pacote de transcrições e os diagnósticos ficam em `private/`, ignorado pelo Git. Os arquivos nativos originais permanecem intactos. Nas cópias locais foram explicitamente omitidos instruções privadas, raciocínio interno e metadados internos do cliente; pedidos, código, chamadas de ferramentas, resultados, datas e uso do modelo foram preservados.

**Limite material:** as regras alertam que alterações das transcrições, especialmente omissão de raciocínio, podem levar à desclassificação. O validador local aprovou as cópias com essas omissões declaradas, mas isso não garante a aceitação pela organização. O conteúdo interno privado não deve ser publicado para tentar contornar essa questão.

## Antes de enviar

1. Revisar a partida e a questão das transcrições acima.
2. Usar um novo repositório GitHub público criado após a abertura, na conta vinculada à make.fun, e publicar o commit escolhido. Não usar a modalidade de source bundle neste histórico: ela exige um primeiro commit de ancoragem criado antes de escrever o jogo, o que não ocorreu aqui.
3. Vincular a conta/carteira do usuário e conferir a propriedade do repositório. Não há credenciais nem carteira criadas neste projeto.
4. Atualizar o pacote com os logs nativos até o último ajuste e rodar `check` novamente no commit exato a enviar.
5. Enviar antes do prazo do kit: 18/11/2026 às 15h de Brasília. A avaliação visual e o ranking são feitos no servidor; não houve nota ou previsão de aprovação de 100%.

Estrutura de entrega: `main.ts`, `vendor/`, `game/`, `screenshots/`, `LICENSE` e documentação. `out/`, `out-check/`, `tools/` e `private/` são apenas materiais locais e não devem integrar o repositório publicado.
