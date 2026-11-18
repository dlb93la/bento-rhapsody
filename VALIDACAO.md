# Bento Rhapsody — musical edition validation

Updated on 18 November 2026, São Paulo time. No entry submitted.

## Remix playtest

Current working branch: `experiment/remix-playtest`. Solo design iteration adds six differentiated rehearsal starts, reserved tea seats, optional encore tickets and golden stages, Cozy/Rush choice, a persistent Free Jam, tempo control, real five-second featured solos, move reactions and anchored dragging. Full rationale and test results are in `REMIX-PLAYTEST.md`.

Local checks passed for all six orders and all six three-ticket solutions, input-handler campaign simulation, sandbox save/restore, optional score rewards, solo/tempo synthesis and interaction regressions. The 33-second offline audio render remained free of clipping. Browser playtest and replacement screenshots remain pending; earlier screenshots and browser observations below describe earlier builds.

## Paper-theater and jazz revision — current status

This revision takes its visual and layered-music direction from the user's Zoud prototype. New code implements an eight-bar jazz band, audio-clock lookahead scheduling, individual instrumental layers, sung entrances, continuous paper pieces, wood-and-green-lined box, new food illustrations and an original ImageGen station scene. Typography uses locally bundled OFL fonts.

Passed: JavaScript syntax; six musical puzzle solutions; rhythm, rivalry and pitch regressions; simulated input handlers for the new rack/board, drag, selection, rotation, remove, undo, pause, guide and all six deliveries; offline synthesis of 33 seconds with no clipped samples, seven chord identities and no remaining sources; source artwork renders; two byte-identical output builds (15 files, 2,577,864 game bytes).

**Browser validation and screenshots are pending for this revision.** The in-app browser was unavailable, and Windows Computer Use stopped because it could not confidently identify the current URL. No further browser control was attempted. Existing submission images still show the earlier edition. Development renders are deliberately separate and must not be used as purported browser captures. Refresh all four real browser screenshots and complete a browser listening/playtest before sending this revision.

The earlier checks below are historical results, not claims that the new art has already been browser-tested. The transcript privacy limitation remains applicable. Asset provenance is in ART-AND-MUSIC.md.

The official local check for this revision exited 0: 13 passed, six skipped/reserved and five server-side submission checks. Recognized authorship: 704/864 counted lines (81.4%); unwritten text: 153/857 (17.8%), both within the required thresholds. This result does not certify the old screenshots as current or resolve the transcript privacy limitation.

## Earlier musical edition — historical validation

The whole game is now in English. Six procedural food voices form a five-step sequencer: leftmost column sets entry beat, vertical position sets pitch, friends unlock singing and rivals grumble. Orders require distinct singing beats, so packing and friendship alone are insufficient. Passengers join the delivered song; The Midnight Bites perform the six saved arrangements on the singing train.

- Completed all six current orders in the browser using real clicks and keys, including rotations, finale and restart.
- Verified that a friendly Rice/Salmon pair on the same beat cannot be served; moving one to another beat enables serving.
- Verified a deliberate rival placement, unhappy faces and GRR cue; undo restored the valid last order. Pause and guide block delivery. Muted play remains fully solvable.
- Browser AudioContext was running. Analyzer sampling detected nonzero audio, all six food voice types and all five beat steps. This verifies signal generation, not a subjective listening review.
- A 14-second encore audit observed all six recorded arrangements and nonzero audio. No console errors or warnings were captured.
- Syntax and regression checks passed: six solutions, rhythm gate, pitch, mixed rival/friend behavior, stored encore, pause/guide and duplicate delivery.
- Two builds produced eight identical files by SHA-256: three game files, four screenshots and dossier.json. Official vendor library unchanged. Game source: 41,533 bytes, no external resources.
- Four new 1280×820 JPEGs: 120,750; 83,980; 121,311; 112,557 bytes. All meet screenshot limits.
- Official check exited 0: 13 passed, six skipped/reserved, five checked at submission. Three native sessions recognized. Authored: 472/483 counted lines (97.7%); unwritten text: 7/479 (1.4%).

The transcript privacy limitation and remaining submission steps below still apply. This edition uses MIT; artwork, voices and music are original code with no stock image or pre-existing song embedded.

## Earlier validation record

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
