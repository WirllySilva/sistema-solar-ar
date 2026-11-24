# Sistema Solar Interativo em Realidade Aumentada

Aplicação educacional para explorar o Sol, os oito planetas e a Lua, que orbita a Terra. Usa HTML, CSS, JavaScript, A-Frame 1.6.0 e AR.js 3.4.7. A experiência de RA foi projetada para o Chrome no Android.

## Desenvolvimento no Windows

1. Abra a pasta do projeto no VS Code.
2. Na pasta que contém `index.html`, inicie um servidor estático. Com Python 3 instalado, rode:

   ```powershell
   py -m http.server 8000 --bind 127.0.0.1
   ```

   Você também pode usar o Live Server do VS Code para abrir `index.html`.
3. Abra [a prévia local](http://localhost:8000/) no Chrome. As bibliotecas são carregadas pela internet. O projeto dispensa compilação, backend e instalação de dependências do aplicativo.

| Caminho | Experiência |
| --- | --- |
| `./?etapa=mvp` | Sol 3D em prévia |
| `./?modo=ra&etapa=mvp` | MVP com câmera, Hiro e Sol 3D |
| `./` | Sistema Solar completo, sem câmera |
| `./?modo=ra` | Sistema Solar completo com câmera e Hiro |

O Chrome permite câmera em `localhost` quando a página roda no próprio dispositivo. Para acessar pelo celular, use a URL HTTPS publicada. Um endereço HTTP com o IP do computador na rede local não oferece o contexto seguro exigido pela câmera.

## Publicação HTTPS no GitHub Pages

1. Crie um repositório no GitHub e envie **o conteúdo** desta pasta para a raiz da branch `main`. Preserve `index.html` e `src/` no mesmo nível.
2. No repositório, abra **Settings → Pages**. Em **Build and deployment**, escolha **Deploy from a branch**, selecione **main** e **/(root)** e clique em **Save**.
3. Confira o resultado da implantação na aba **Actions**. Em **Settings → Pages**, habilite **Enforce HTTPS** se a opção estiver disponível e copie a URL publicada.
4. Abra essa URL no Chrome do Android. Para o primeiro teste, adicione `?modo=ra&etapa=mvp` ao final da URL.

[Configurar a publicação no GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [Configurar HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

## Teste com o marcador Hiro no Android

1. Imprima o [marcador Hiro oficial](./assets/hiro.png) ou mostre a imagem em outra tela. Preserve toda a borda preta e a margem branca. Coloque o marcador sobre uma superfície plana e bem iluminada.
2. Abra o endereço HTTPS com `?modo=ra&etapa=mvp` e permita o uso da câmera. Enquadre o marcador inteiro e ajuste a distância até o Sol 3D aparecer sobre ele. Tire o marcador do quadro e volte a enquadrá-lo para verificar a perda e a recuperação do rastreamento.
3. Abra a página com `?modo=ra`. Afaste um pouco o celular para enquadrar os astros e observe o movimento dos planetas ao redor do Sol e da Lua ao redor da Terra.
4. Toque diretamente em Saturno na cena. O sistema deve pausar e mostrar Saturno ampliado com seu cartão. Volte à visão geral e confirme que a trajetória continua da posição anterior.
5. Repita tocando em outro astro na cena. Se a câmera falhar, confira a permissão do site no Chrome e reabra a página. Se o marcador falhar, evite reflexos, enquadre a borda inteira e teste com a versão impressa.

O modo sem câmera permite testar a renderização, a seleção e a animação no computador. A câmera traseira, a solicitação de permissão, a estabilidade do rastreamento e o toque no Chrome do Android precisam de validação no aparelho físico.

## Verificações realizadas

No Chrome para Windows, em uma janela com tamanho de tela de celular, foram verificados o Sol do MVP, o movimento orbital, a rotação, a pausa automática, a seleção por toque simulado, a ampliação, o cartão educativo e o retorno à visão geral. Uma câmera virtual exibindo o marcador Hiro também foi usada para verificar a detecção e a renderização nos dois modos de RA. O teste físico no Android permanece pendente.

## Modelo educacional e estrutura

Os raios dos corpos, distâncias, períodos, inclinações e posições são ilustrativos. As órbitas são circulares e coplanares. Os modelos usam mapas de superfície ou de atmosfera, com cores ajustadas para visualização. Os planetas estão ordenados por distância ao Sol.

- `assets/hiro.png` é o marcador distribuído pelo [projeto AR.js](https://github.com/AR-js-org/AR.js/blob/3.4.7/data/images/hiro.png).
- `index.html` contém a interface e o ponto de entrada.
- `src/app.js` configura os modos de câmera e prévia e conecta a seleção 3D ao cartão educativo.
- `src/solar-system.js` constrói a cena, calcula as órbitas e resolve a seleção em 3D.
- `src/planets.js` reúne os dados de visualização e os textos educacionais.
- `src/styles.css` cuida da interface e de sua adaptação a telas menores.

[A-Frame](https://aframe.io/) · [Rastreamento por marcador no AR.js](https://ar-js-org.github.io/AR.js-Docs/marker-based/) · [Planetas na NASA](https://science.nasa.gov/solar-system/planets/)


## Vistas dos astros e créditos

Ao selecionar um astro, a animação congela e o modelo mostra uma vista fixa voltada para a câmera. A vista da Terra é centrada na América do Sul e inclui a América Central e o México. Ao voltar, a posição orbital, o giro e a inclinação são restaurados. Toque na Lua, que orbita a Terra, para ver sua face voltada para nós e ler sobre sua rotação síncrona.

Os mapas do Sol, dos oito planetas e da Lua foram produzidos por [Solar System Scope](https://www.solarsystemscope.com/textures/) e são distribuídos sob a licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Os mapas de Terra e Marte mantêm a resolução de 2K. Os demais foram reduzidos para 1024 × 512 para o uso em celular. Vênus usa a vista de sua atmosfera. Os anéis de Saturno usam uma representação ilustrativa. As informações sobre o Sol foram consultadas na NASA. [Sol](https://science.nasa.gov/sun/facts/) · [Lua](https://science.nasa.gov/moon/facts/).