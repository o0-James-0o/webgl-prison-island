<div align="center">

# Passeio Virtual 3D em **WebGL Vanilla**

<p>
  <img src="assets/banner_alcatraz_brasileira.png" alt="Banner do projeto Alcatraz Brasileira" width="100%">
</p>

<p>
  <img src="https://img.shields.io/badge/WebGL-990000?style=for-the-badge&amp;logo=webgl&amp;logoColor=white" alt="WebGL">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&amp;logo=javascript&amp;logoColor=111" alt="JavaScript">
  <img src="https://img.shields.io/badge/GLSL-5586A4?style=for-the-badge&amp;logo=opengl&amp;logoColor=white" alt="GLSL">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&amp;logo=html5&amp;logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css&logoColor=white" alt="CSS3">
</p>

</div>

---

## 📌 Sobre o projeto

**Alcatraz Brasileira** é um passeio virtual 3D em primeira pessoa desenvolvido como projeto prático da disciplina de **Computação Gráfica**.

O objetivo do projeto é conduzir o usuário por uma ilha-prisão fictícia, passando pelo píer, posto de fiscalização, estrada principal, portões automáticos, refeitório, áreas internas, sala das celas e finalização do passeio. A partir dessa proposta, o projeto aplica, de forma visual e interativa, conceitos como **WebGL**, **shaders GLSL**, **projeção perspectiva**, **câmera FPS**, **iluminação Phong**, **fontes de luz móveis**, **transformações geométricas**, **animações 3D**, **texturização**, **céu HDRI**, **oceano procedural** e **leitor próprio de OBJ**.

---

## ▶️ Vídeo do projeto

Confira abaixo uma apresentação em vídeo que destaca os principais aspectos do projeto, incluindo a exploração do ambiente em 3D, a navegação em primeira pessoa, os efeitos visuais e as interações disponíveis durante a experiência.

<div align="center">
  <table width="100%">
    <tr>
      <th width="15%" align="center">Ícone</th>
      <th width="20%" align="center">Plataforma</th>
      <th width="65%" align="center">Link do vídeo</th>
    </tr>
    <tr>
      <td align="center">
        <img src="https://api.iconify.design/simple-icons:youtube.svg?color=%23FF0000" width="36" height="36" alt="YouTube">
      </td>
      <td align="center"><strong>YouTube</strong></td>
      <td align="center"><a href="#">https://youtu.be/xPsB85V7Qd0</a></td>
    </tr>
  </table>
</div>

---

## 🖼️ Preview do jogo

<table width="794" cellspacing="0" cellpadding="0">
  <tr>
    <td width="367" valign="top">
      <h2>🕹️ Como jogar</h2>
      <h3>🎯 Objetivo</h3>
      <table width="360" cellspacing="0" cellpadding="5">
        <tr align="center">
          <th width="85">Meta</th>
          <th width="222">Descrição</th>
          <th width="60">Visual</th>
        </tr>
        <tr align="center">
          <td><strong>Chegar à ilha</strong></td>
          <td>Inicie o passeio no píer e caminhe até o posto de fiscalização.</td>
          <td>
            <img src="assets/ilha.png" alt="Imagem chegada à ilha" width="32" height="32">
          </td>
        </tr>
        <tr align="center">
          <td><strong>Explorar setores</strong></td>
          <td>Passe pelos portões automáticos, refeitório, áreas internas e celas.</td>
          <td>
            <img src="assets/exp_celas.png" alt="Imagem exploração das celas" width="32" height="32">
          </td>
        </tr>
        <tr align="center">
          <td><strong>Finalizar passeio</strong></td>
          <td>Conclua a experiência atravessando a porta de saída no setor final.</td>
          <td>
            <img src="assets/end_passeio.png" alt="Imagem finalização do passeio" width="32" height="32">
          </td>
        </tr>
      </table>
      <br>
      <h3>⌨️🖱️ Controles</h3>
      <table width="367" cellspacing="0" cellpadding="5">
        <tr align="center">
          <th width="90">Entrada</th>
          <th width="217">Descrição</th>
          <th width="60">Visual</th>
        </tr>
        <tr align="center">
          <td><strong>W A S D</strong></td>
          <td>Move o jogador pelo ambiente 3D.</td>
          <td>
            <img src="assets/wasd.png" alt="Imagem das teclas WASD" width="32" height="32">
          </td>
        </tr>
        <tr align="center">
          <td><strong>MOUSE</strong></td>
          <td>Controla a direção da câmera em primeira pessoa.</td>
          <td>
            <img src="assets/mouse.png" alt="Imagem do mouse" width="32" height="32">
          </td>
        </tr>
        <tr align="center">
          <td><strong>SHIFT</strong></td>
          <td>Aumenta a velocidade de deslocamento.</td>
          <td>
            <img src="assets/shift.png" alt="Imagem da tecla Shift" width="32" height="32">
          </td>
        </tr>
        <tr align="center">
          <td><strong>ESC</strong></td>
          <td>Abre ou fecha o menu de pausa.</td>
          <td>
            <img src="assets/esc1.png" alt="Imagem da tecla ESC" width="32" height="32">
          </td>
        </tr>
      </table>
    </td>
    <td width="400" valign="middle" align="center">
      <img src="assets/gif_alc.gif" alt="GIF principal do passeio virtual 3D" width="400">
    </td>
  </tr>
</table>

---

## 🧱 Pipeline gráfico do projeto

<div align="center">
  <table width="100%">
    <tr align="center">
      <th>1. Entrada</th>
      <th>2. Câmera</th>
      <th>3. Cena</th>
      <th>4. Shaders</th>
      <th>5. Render</th>
    </tr>
    <tr align="center">
      <td>
        <img src="assets/teclado.png" width="52" height="52" alt="Teclado">
      </td>
      <td>
        <img src="https://api.iconify.design/mdi:camera-control.svg?color=%2322C55E" width="52" height="52" alt="Câmera">
      </td>
      <td>
        <img src="https://api.iconify.design/noto:desert-island.svg" width="52" height="52" alt="Cena">
      </td>
      <td>
        <img src="https://api.iconify.design/vscode-icons:file-type-glsl.svg" width="52" height="52" alt="Shaders">
      </td>
      <td>
        <img src="https://api.iconify.design/mdi:monitor-screenshot.svg?color=%23F59E0B" width="52" height="52" alt="Render">
      </td>
    </tr>
    <tr align="center">
      <td>Teclado e mouse</td>
      <td>View + Projection</td>
      <td>Objetos, materiais e animações</td>
      <td>GLSL + uniforms</td>
      <td>Draw calls WebGL</td>
    </tr>
  </table>
</div>

---

## 🧩 Mecânicas e elementos principais

<table width="100%">
  <tr align="center">
    <th width="25%">Elemento</th>
    <th width="55%">Descrição técnica</th>
    <th width="20%">GIF</th>
  </tr>
  <tr>
    <td align="center"><strong>Introdução cinematográfica</strong></td>
    <td>A câmera inicia no mar, acompanha a chegada pelo Lifeboat e libera os controles após o desembarque.</td>
    <td align="center">
      <img src="assets/gif_alc.gif" width="150" height="100" alt="GIF da introdução cinematográfica">
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Portão automático</strong></td>
    <td>Portão externo com abertura automática por proximidade, criando a sensação de entrada controlada na prisão.</td>
    <td align="center">
      <img src="assets/portao.gif" width="150" alt="GIF do portão automático">
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Posto de fiscalização</strong></td>
    <td>Estrutura 3D com janela fumê, porta lateral automática com pivô realista, mesa, cadeira e monitores.</td>
    <td align="center">
      <img src="assets/post_fisc.gif" width="150" alt="GIF do posto de fiscalização">
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Faróis</strong></td>
    <td>Torres com feixe visual e rotação contínua, reforçando a ambientação noturna e a leitura espacial da ilha.</td>
    <td align="center">
      <img src="assets/farol.gif" width="150" alt="GIF dos faróis">
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Ambientes internos</strong></td>
    <td>Refeitório, controle, enfermagem e celas organizados em sequência para estruturar o percurso do jogador.</td>
    <td align="center">
      <img src="assets/amb_int.gif" width="150" alt="GIF dos ambientes internos">
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Sala das celas</strong></td>
    <td>Ambiente mais escuro com lanterna automática e luz vermelha fraca para alterar a atmosfera final do passeio.</td>
    <td align="center">
      <img src="assets/celas.gif" width="150" alt="GIF da sala das celas">
    </td>
  </tr>
</table>

---

## 🧠 Conceitos de Computação Gráfica aplicados

<table width="100%">
  <tr align="center">
    <th width="25%">Conceito</th>
    <th width="50%">Como foi implementado</th>
    <th width="25%">Resultado visual</th>
  </tr>
  <tr>
    <td align="center"><strong>Projeção perspectiva</strong></td>
    <td>Matriz perspective própria com FOV, aspect ratio, near e far para gerar profundidade na cena.</td>
    <td align="center"><img src="https://api.iconify.design/mdi:perspective-less.svg?color=%23374151" width="48" alt="Perspectiva"></td>
  </tr>
  <tr>
    <td align="center"><strong>Câmera FPS</strong></td>
    <td>Posição e orientação controladas por teclado e mouse, usando yaw, pitch, forward e right.</td>
    <td align="center"><img src="https://api.iconify.design/mdi:video-3d.svg?color=%2322C55E" width="48" alt="Câmera FPS"></td>
  </tr>
  <tr>
    <td align="center"><strong>Iluminação Phong</strong></td>
    <td>Shader GLSL com componentes ambiente, difusa e especular, além de normais e posição da luz.</td>
    <td align="center"><img src="https://api.iconify.design/mdi:lightbulb-on.svg?color=%23FACC15" width="48" alt="Phong"></td>
  </tr>
  <tr>
    <td align="center"><strong>Transformações 3D</strong></td>
    <td>Objetos posicionados com matrizes de translação, rotação e escala, compondo o pipeline Model-View-Projection.</td>
    <td align="center"><img src="https://api.iconify.design/mdi:axis-arrow.svg?color=%23EF4444" width="48" alt="Transformações"></td>
  </tr>
  <tr>
    <td align="center"><strong>Animações</strong></td>
    <td>Atualização temporal com deltaTime para farol, portões, barco, oceano, luzes e elementos da cena.</td>
    <td align="center"><img src="https://api.iconify.design/mdi:animation-play.svg?color=%23F97316" width="48" alt="Animações"></td>
  </tr>
  <tr>
    <td align="center"><strong>Texturização</strong></td>
    <td>Mapeamento UV, texturas procedurais e imagens para concreto, metal, madeira, placas, céu e faces.</td>
    <td align="center"><img src="https://api.iconify.design/mdi:texture-box.svg?color=%23A16207" width="48" alt="Texturas"></td>
  </tr>
  <tr>
    <td align="center"><strong>Leitor OBJ</strong></td>
    <td>Parser próprio para importar o modelo Lifeboat, interpretando vértices, faces e grupos do arquivo OBJ.</td>
    <td align="center"><img src="https://api.iconify.design/mdi:cube-scan.svg?color=%237C3AED" width="48" alt="OBJ"></td>
  </tr>
  <tr>
    <td align="center"><strong>Céu HDR</strong></td>
    <td>HDR panorâmico convertido para textura tone-mapped e aplicado como skydome 360° em torno da câmera.</td>
    <td align="center"><img src="https://api.iconify.design/mdi:panorama-variant.svg?color=%230EA5E9" width="48" alt="HDR"></td>
  </tr>
</table>

---

## 🧩 Técnicas Utilizadas

### 1. Projeção perspectiva e câmera FPS

A projeção perspectiva foi implementada por meio de uma matriz própria com FOV, aspect ratio, near e far, permitindo representar profundidade na cena 3D. A câmera FPS utiliza posição, yaw, pitch, vetores forward e right para simular a navegação em primeira pessoa pelo ambiente da ilha-prisão.

---

<p align="center">
  <img src="assets/projecao_camera_fps_readme.png" alt="Projeção perspectiva e câmera FPS" width="100%">
</p>

---

### 2. Iluminação com modelo de Phong

A iluminação foi construída em GLSL utilizando o modelo de Phong, combinando componentes ambiente, difusa e especular. Esse modelo permite destacar volumes, superfícies metálicas, concreto, áreas internas e fontes móveis de luz, como postes, faróis e lanterna automática.

---

<p align="center">
  <img src="assets/iluminacao_phong_readme.png" alt="Iluminação com modelo de Phong" width="100%">
</p>

---

### 3. Transformações geométricas e animações 3D

As transformações geométricas organizam os objetos da cena por meio de translação, rotação e escala, compondo a matriz de modelo. As animações utilizam atualização temporal com deltaTime para controlar movimentos contínuos, como abertura de portões, rotação do farol, deslocamento do barco e ondas do oceano.

---

<p align="center">
  <img src="assets/transformacoes_animacoes_3d_readme.png" alt="Transformações geométricas e animações 3D" width="100%">
</p>

---

### 4. Texturização 3D

A texturização foi aplicada por meio de coordenadas UV, amostragem de texturas e uso de materiais no fragment shader. Foram utilizadas texturas para concreto, metal, madeira, placas, piso, água, céu e personagens, tornando os setores da Alcatraz Brasileira mais realistas e visualmente distintos.

---

<p align="center">
  <img src="assets/texturizacao_3d_readme.png" alt="Texturização 3D" width="100%">
</p>

---

### 5. Leitor próprio de OBJ

O projeto possui um leitor próprio de arquivos OBJ para importar o modelo do Lifeboat. O parser interpreta a estrutura textual do arquivo, processa vértices, faces, grupos e materiais, triangula a malha e converte os dados para buffers WebGL utilizados na renderização do objeto 3D.

---

<p align="center">
  <img src="assets/leitor_obj_readme.png" alt="Leitor próprio de OBJ" width="100%">
</p>

---

## 🧠 Organização técnica dos arquivos

<table width="100%">
  <tr align="center">
    <th width="24%">Arquivo</th>
    <th width="56%">Responsabilidade</th>
    <th width="20%">Área</th>
  </tr>
  <tr>
    <td align="center"><code>math.js</code></td>
    <td>Operações vetoriais e matriciais: identidade, translação, rotação, escala, lookAt, perspective e matriz normal.</td>
    <td align="center">Matemática 3D</td>
  </tr>
  <tr>
    <td align="center"><code>geometry.js</code></td>
    <td>Geração de malhas básicas e parser OBJ para modelos externos.</td>
    <td align="center">Geometria</td>
  </tr>
  <tr>
    <td align="center"><code>textures.js</code></td>
    <td>Criação de texturas procedurais, texturas de imagem, faces ovais, placas e céu HDR.</td>
    <td align="center">Texturas</td>
  </tr>
  <tr>
    <td align="center"><code>mesh.js</code></td>
    <td>Criação dos buffers WebGL e desenho das malhas.</td>
    <td align="center">Renderização</td>
  </tr>
  <tr>
    <td align="center"><code>camera.js</code></td>
    <td>Controle da câmera em primeira pessoa e atualização da direção de visão.</td>
    <td align="center">Câmera</td>
  </tr>
  <tr>
    <td align="center"><code>input.js</code></td>
    <td>Eventos de teclado, mouse e pointer lock para navegação.</td>
    <td align="center">Entrada</td>
  </tr>
  <tr>
    <td align="center"><code>shaders.js</code></td>
    <td>Shaders GLSL para objetos, água e céu.</td>
    <td align="center">GLSL</td>
  </tr>
  <tr>
    <td align="center"><code>scene.js</code></td>
    <td>Construção da ilha, objetos, portas, faróis, ambientes internos, animações e colisões.</td>
    <td align="center">Cena</td>
  </tr>
  <tr>
    <td align="center"><code>main.js</code></td>
    <td>Inicialização do WebGL, loop principal, HUD, estados de jogo, pause e introdução cinematográfica.</td>
    <td align="center">Aplicação</td>
  </tr>
</table>

---

## 📁 Estrutura do projeto

```text
alcatraz-brasileira-webgl/
│
├── index.html                  # Estrutura HTML, telas e canvas WebGL
├── style.css                   # Interface, HUD, menu inicial, pausa e tela final
├── README.md                   # Documentação do projeto
│
├── assets/
│   ├── models/
│   │   └── Lifeboat.obj        # Modelo OBJ usado na chegada de barco
│   ├── readme/                 # Imagens e GIFs usados nesta documentação
│   ├── ui/                     # Telas inicial e final
│   ├── *_portrait.jpg          # Retratos/texturas usadas nas celas
│   └── qwantani_*.hdr/png/jpg  # HDRI e versões tonemapped do céu
│
└── src/
    ├── math.js                 # Vetores, matrizes e álgebra linear
    ├── camera.js               # Câmera em primeira pessoa
    ├── input.js                # Teclado, mouse e pointer lock
    ├── shaders.js              # Shaders GLSL padrão, água e céu
    ├── textures.js             # Texturas procedurais e carregamento de imagens
    ├── geometry.js             # Geometrias manuais e leitor OBJ
    ├── mesh.js                 # Meshes, materiais e objetos de cena
    ├── scene.js                # Construção manual do cenário 3D
    ├── objModels.js            # OBJ embutido para carregamento no navegador
    └── main.js                 # Loop principal, estados, HUD e renderização
```

---

## 🚀 Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/o0-James-0o/webgl-prison-island.git
cd webgl-prison-island
```

### 2. Inicie com Live Server

No VS Code, clique com o botão direito no arquivo `index.html` e selecione:

```text
Open with Live Server
```

### 3. Abra no navegador

O projeto será aberto automaticamente. Caso necessário, acesse:

```text
http://127.0.0.1:5500
```

> Recomenda-se usar o **Live Server** para carregar corretamente texturas, imagens e demais assets do projeto.

---

## 👨‍💻 Autoria

<div align="left">
  <img src="assets/James.png" alt="Avatar James Taylor" width="72" height="72" align="middle">
  &nbsp;&nbsp;
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=18&pause=1000&color=A78BFA&vCenter=true&multiline=false&width=620&height=72&lines=James+Taylor+%7C+%F0%9F%A7%AD+Vis%C3%A3o+geral+e+proje%C3%A7%C3%A3o+de+c%C3%A2mera." alt="James Taylor | Visão geral e projeção de câmera" align="middle">
</div>

<hr>

<div align="left">
  <img src="assets/Lucas_circular.png" alt="Avatar Lucas Almeida" width="72" height="72" align="middle">
  &nbsp;&nbsp;
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=18&pause=1000&color=A78BFA&vCenter=true&multiline=false&width=650&height=72&lines=Lucas+Almeida+%7C+%F0%9F%8E%A8+Texturiza%C3%A7%C3%A3o+3D,+leitor+OBJ+e+Skydome." alt="Lucas Almeida | Texturização 3D, leitor OBJ e Skydome" align="middle">
</div>

<hr>

<div align="left">
  <img src="assets/Victor.png" alt="Avatar Victor Reinaldo" width="72" height="72" align="middle">
  &nbsp;&nbsp;
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=18&pause=1000&color=A78BFA&vCenter=true&multiline=false&width=690&height=72&lines=Victor+Reinaldo+%7C+%F0%9F%92%A1+Ilumina%C3%A7%C3%A3o,+transforma%C3%A7%C3%B5es+3D+e+anima%C3%A7%C3%B5es." alt="Victor Reinaldo | Iluminação, transformações 3D e animações" align="middle">
</div>
