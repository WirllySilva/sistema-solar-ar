# Sistema Solar Interativo em Realidade Aumentada

Projeto educativo da disciplina de Realidade Virtual e Aumentada da Uninter. Explore o Sol, os oito planetas e a Lua em 3D. Os tamanhos, as distâncias e as velocidades são ilustrativos.

[Experimentar o projeto](https://wirllysilva.github.io/sistema-solar-ar/) · [Assistir à demonstração](https://www.youtube.com/watch?v=QtpFpkg1iNo)

## Como usar

1. Imprima o [marcador Hiro](./assets/hiro.png) ou abra a imagem em outra tela.
2. No celular, abra o projeto, toque em **Usar câmera** e permita o acesso. Enquadre o marcador inteiro.
3. Toque em um astro para pausar a animação, ampliar o modelo e ler uma curiosidade. Mantenha o Hiro no quadro e mova o celular para ver outros ângulos. Toque em **Voltar ao Sistema Solar** para retomar a animação.

A opção **Ver sem câmera** abre a mesma simulação em uma prévia 3D. No modo com câmera, o Hiro serve de referência para posicionar os astros no ambiente.

## Tecnologias e créditos

Feito com HTML, CSS, JavaScript, A-Frame, Three.js e AR.js. Os mapas dos astros são do [Solar System Scope](https://www.solarsystemscope.com/textures/) sob a licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Os mapas de Terra e Marte mantêm a resolução de 2K, e os demais foram reduzidos para celular. A [NASA](https://science.nasa.gov/solar-system/planets/) foi uma das fontes dos textos educativos.

Para testar localmente, rode `py -m http.server 8000` na pasta do projeto e abra `http://localhost:8000`. O site está publicado com HTTPS no [GitHub Pages](https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), a partir da raiz da branch `main`.
