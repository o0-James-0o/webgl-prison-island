# 🌊 Alcatraz Brasileira — Passeio Virtual 3D em WebGL Puro

<p align="center">
  <img src="assets/readme/gameplay_preview.png" alt="Preview do passeio virtual 3D Alcatraz Brasileira" width="100%">
</p>

<p align="center">
  <img alt="WebGL" src="https://img.shields.io/badge/WebGL-Puro-0B1F5B?style=for-the-badge&logo=webgl&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111">
  <img alt="GLSL" src="https://img.shields.io/badge/GLSL-Shaders-0B1F5B?style=for-the-badge">
  <img alt="Computação Gráfica" src="https://img.shields.io/badge/Disciplina-Computa%C3%A7%C3%A3o%20Gr%C3%A1fica-0B1F5B?style=for-the-badge">
  <img alt="Status" src="https://img.shields.io/badge/Status-Finalizado-10B981?style=for-the-badge">
</p>

> Projeto acadêmico da disciplina de **Computação Gráfica**: um passeio virtual 3D em primeira pessoa por uma ilha-prisão fictícia inspirada em uma “Alcatraz Brasileira”, desenvolvido diretamente com **HTML5 Canvas, JavaScript, WebGL e shaders GLSL próprios**.

---

## 📌 Descrição do projeto

O projeto apresenta uma experiência 3D interativa em primeira pessoa, na qual o usuário chega de barco até uma ilha prisional e percorre diferentes setores do ambiente: píer, posto de fiscalização, entrada principal, refeitório, setor de controle/triagem/enfermaria, sala das celas e saída final.

A proposta foi construída para demonstrar, de forma visual e prática, conceitos centrais de Computação Gráfica, incluindo **projeção perspectiva**, **câmera FPS**, **iluminação Phong**, **transformações geométricas**, **animações 3D**, **texturização**, **céu HDRI**, **shader de oceano procedural** e **leitor próprio de OBJ**.

> **Observação de escopo:** o cenário e seus personagens são estilizados e satíricos. O uso de nomes, placas ou retratos no ambiente virtual é apenas recurso narrativo/visual do trabalho e não representa afirmação factual sobre pessoas reais.

---

## 🎮 Preview da experiência

<table width="100%">
  <tr>
    <th width="50%" align="center">Menu inicial</th>
    <th width="50%" align="center">Tela final</th>
  </tr>
  <tr>
    <td align="center"><img src="assets/readme/menu_screen.png" alt="Menu inicial do passeio virtual" width="100%"></td>
    <td align="center"><img src="assets/readme/final_screen.png" alt="Tela final do passeio virtual" width="100%"></td>
  </tr>
</table>

<p align="center">
  <img src="assets/readme/technical_cards.png" alt="Cards dos recursos técnicos avaliados" width="100%">
</p>

---

## 🕹️ Como jogar

<table width="100%">
  <tr>
    <th width="18%" align="center">Entrada</th>
    <th width="42%" align="center">Ação</th>
    <th width="40%" align="center">Uso no passeio</th>
  </tr>
  <tr>
    <td align="center"><strong>W / A / S / D</strong></td>
    <td>Movimentação em primeira pessoa.</td>
    <td>Permite explorar o píer, a estrada, os corredores e as celas.</td>
  </tr>
  <tr>
    <td align="center"><strong>Mouse</strong></td>
    <td>Controle da direção da câmera.</td>
    <td>Atualiza yaw/pitch para olhar ao redor do ambiente 3D.</td>
  </tr>
  <tr>
    <td align="center"><strong>Shift</strong></td>
    <td>Correr.</td>
    <td>Aumenta a velocidade de deslocamento durante a navegação.</td>
  </tr>
  <tr>
    <td align="center"><strong>ESC</strong></td>
    <td>Pausar / retomar menu rápido.</td>
    <td>Abre o menu de pausa sobre o jogo com fundo desfocado.</td>
  </tr>
  <tr>
    <td align="center"><strong>Clique</strong></td>
    <td>Capturar o mouse no canvas.</td>
    <td>Ativa o controle livre da câmera no navegador.</td>
  </tr>
</table>

---

## ✅ Requisitos técnicos atendidos

<table width="100%">
  <tr>
    <th width="28%" align="center">Requisito</th>
    <th width="42%" align="center">Implementação no projeto</th>
    <th width="30%" align="center">Arquivos principais</th>
  </tr>
  <tr>
    <td><strong>Movimentação de câmera com projeção perspectiva</strong></td>
    <td>Câmera FPS com posição, yaw, pitch, matriz de visão e matriz de projeção perspectiva.</td>
    <td><code>src/camera.js</code><br><code>src/math.js</code><br><code>src/main.js</code></td>
  </tr>
  <tr>
    <td><strong>Iluminação com modelo de Phong</strong></td>
    <td>Shader com componentes ambiente, difusa e especular, usando normais, posição da câmera, brilho e atenuação.</td>
    <td><code>src/shaders.js</code><br><code>src/mesh.js</code></td>
  </tr>
  <tr>
    <td><strong>Fonte de luz móvel</strong></td>
    <td>Farol rotativo, feixe visual animado e iluminação atualizada ao longo do tempo.</td>
    <td><code>src/scene.js</code><br><code>src/shaders.js</code></td>
  </tr>
  <tr>
    <td><strong>Objeto animado por transformações geométricas</strong></td>
    <td>Portões automáticos, barco da introdução, faróis, oceano e transições controladas por tempo.</td>
    <td><code>src/scene.js</code><br><code>src/main.js</code></td>
  </tr>
  <tr>
    <td><strong>Objeto com textura</strong></td>
    <td>Texturas em concreto, piso, madeira, grama/solo, oceano, placas, céu HDRI e retratos.</td>
    <td><code>src/textures.js</code><br><code>assets/</code></td>
  </tr>
  <tr>
    <td><strong>Objeto com cor sólida</strong></td>
    <td>Grades, postes, blocos estruturais, placas simples e volumes arquitetônicos de apoio.</td>
    <td><code>src/scene.js</code></td>
  </tr>
  <tr>
    <td><strong>WebGL puro</strong></td>
    <td>Renderização feita diretamente com WebGL, buffers, uniforms, matrizes e shaders próprios.</td>
    <td><code>index.html</code><br><code>src/shaders.js</code><br><code>src/mesh.js</code></td>
  </tr>
  <tr>
    <td><strong>Leitor próprio de OBJ</strong></td>
    <td>Parser simples para o Lifeboat: lê vértices, grupos/materiais e faces; triangula e calcula normais.</td>
    <td><code>src/geometry.js</code><br><code>src/objModels.js</code></td>
  </tr>
</table>

---

## 🧠 Principais conceitos de Computação Gráfica

### 1. Câmera FPS e projeção perspectiva

A câmera representa a posição e a orientação do jogador dentro do mundo 3D. O sistema usa vetores de direção para deslocamento e matrizes para transformar a cena até a tela.

<table width="100%">
  <tr>
    <th width="25%" align="center">Etapa</th>
    <th width="75%" align="center">Descrição técnica</th>
  </tr>
  <tr>
    <td><strong>Entrada</strong></td>
    <td>Teclado e mouse atualizam deslocamento, yaw e pitch.</td>
  </tr>
  <tr>
    <td><strong>View Matrix</strong></td>
    <td>A matriz de visão é calculada a partir da posição da câmera e da direção observada.</td>
  </tr>
  <tr>
    <td><strong>Projection Matrix</strong></td>
    <td>A matriz perspectiva usa FOV, aspecto da tela e planos <em>near/far</em>.</td>
  </tr>
  <tr>
    <td><strong>Renderização</strong></td>
    <td>Os objetos são desenhados com a composição <code>Projection × View × Model</code>.</td>
  </tr>
</table>

### 2. Iluminação Phong

O shader padrão calcula a cor final combinando iluminação ambiente, difusa e especular. O projeto também inclui fontes auxiliares, faróis, lanterna automática nas celas e influência do céu noturno.

```text
Phong = ambiente + difusa + especular
```

### 3. Transformações geométricas e animações

Cada objeto possui sua própria matriz de modelo. As transformações de **translação**, **rotação** e **escala** são usadas para posicionar, orientar e animar elementos da cena.

<table width="100%">
  <tr align="center">
    <th width="20%">Elemento</th>
    <th width="45%">Animação / transformação</th>
    <th width="35%">Função visual</th>
  </tr>
  <tr>
    <td><strong>Barco</strong></td>
    <td>Movimento de introdução cinematográfica no mar.</td>
    <td>Simula a chegada do usuário à ilha.</td>
  </tr>
  <tr>
    <td><strong>Farol</strong></td>
    <td>Rotação contínua do feixe de luz.</td>
    <td>Atende ao requisito de fonte móvel e reforça o ambiente noturno.</td>
  </tr>
  <tr>
    <td><strong>Portões</strong></td>
    <td>Abertura automática por proximidade.</td>
    <td>Conduz o fluxo do passeio.</td>
  </tr>
  <tr>
    <td><strong>Oceano</strong></td>
    <td>Vértices deslocados no shader por funções de onda.</td>
    <td>Cria sensação de água procedural em movimento.</td>
  </tr>
</table>

---

## 🌌 Céu noturno com HDRI 4K

O céu foi construído com uma textura panorâmica HDRI noturna, convertida para uma versão tonemapped compatível com WebGL. Essa imagem é aplicada em uma malha esférica ao redor da câmera, criando um **skydome** com maior profundidade visual.

<table width="100%">
  <tr>
    <th width="20%" align="center">Etapa</th>
    <th width="80%" align="center">Processo utilizado</th>
  </tr>
  <tr>
    <td><strong>1. Seleção</strong></td>
    <td>Uso de arquivo HDRI noturno em alta resolução para representar estrelas, horizonte e atmosfera.</td>
  </tr>
  <tr>
    <td><strong>2. Tonemap</strong></td>
    <td>Conversão para imagem compatível com WebGL, preservando nitidez e contraste do ambiente noturno.</td>
  </tr>
  <tr>
    <td><strong>3. Skydome</strong></td>
    <td>Aplicação da textura panorâmica em uma esfera centralizada na posição da câmera.</td>
  </tr>
  <tr>
    <td><strong>4. Integração</strong></td>
    <td>O céu é renderizado separadamente com shader próprio para não interferir na profundidade dos objetos.</td>
  </tr>
</table>

---

## 📦 Leitor próprio de OBJ

O projeto utiliza um leitor OBJ simples implementado no próprio código para carregar o modelo low-poly do barco de chegada.

<table width="100%">
  <tr>
    <th width="30%" align="center">Recurso do parser</th>
    <th width="70%" align="center">Comportamento no projeto</th>
  </tr>
  <tr>
    <td><strong>Vértices</strong></td>
    <td>Lê linhas <code>v</code> do arquivo OBJ e armazena as posições originais da malha.</td>
  </tr>
  <tr>
    <td><strong>Grupos e materiais</strong></td>
    <td>Interpreta <code>g</code>, <code>o</code> e <code>usemtl</code> para separar partes do modelo.</td>
  </tr>
  <tr>
    <td><strong>Faces</strong></td>
    <td>Lê faces <code>f</code> e triangula polígonos usando fan triangulation.</td>
  </tr>
  <tr>
    <td><strong>Normais</strong></td>
    <td>Calcula normais planas manualmente para permitir iluminação no modelo.</td>
  </tr>
  <tr>
    <td><strong>Buffers WebGL</strong></td>
    <td>Converte a geometria final em arrays de posições, normais, coordenadas UV simples e índices.</td>
  </tr>
</table>

> O cenário principal foi construído manualmente no código. O OBJ é usado especificamente para o **Lifeboat**, permitido porque o projeto implementa seu próprio leitor do formato.

---

## 🧩 Estrutura do projeto

```text
alcatraz-brasileira-webgl/
├── index.html                  # Estrutura HTML, telas e canvas
├── style.css                   # Interface, HUD, menu, pausa e tela final
├── README.md                   # Documentação do projeto
│
├── assets/
│   ├── models/
│   │   └── Lifeboat.obj        # Modelo OBJ usado na chegada
│   ├── readme/                 # Imagens usadas nesta documentação
│   ├── ui/                     # Imagens das telas inicial e final
│   ├── *_portrait.jpg          # Texturas de retratos usadas nas celas
│   └── qwantani_*.hdr/png/jpg  # HDRI e versões tonemapped do céu
│
└── src/
    ├── math.js                 # Vetores, matrizes e álgebra linear própria
    ├── camera.js               # Câmera em primeira pessoa
    ├── input.js                # Teclado, mouse e pointer lock
    ├── shaders.js              # Shaders GLSL: padrão, água e céu
    ├── textures.js             # Texturas procedurais e carregamento de imagens
    ├── geometry.js             # Geometrias manuais e leitor OBJ
    ├── mesh.js                 # Meshes, materiais e objetos de cena
    ├── scene.js                # Construção manual do cenário 3D
    ├── objModels.js            # OBJ embutido para carregamento no navegador
    └── main.js                 # Loop principal, HUD, estados e renderização
```

---

## 🚀 Como executar

### 1. Clonar ou baixar o projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd alcatraz-brasileira-webgl
```

### 2. Iniciar um servidor local

```bash
python -m http.server 8000
```

### 3. Abrir no navegador

```text
http://localhost:8000
```

> O servidor local é recomendado para garantir o carregamento correto das texturas, imagens de interface e arquivos de apoio.

---

## 🧪 Organização técnica da renderização

<table width="100%">
  <tr>
    <th width="24%" align="center">Camada</th>
    <th width="76%" align="center">Responsabilidade</th>
  </tr>
  <tr>
    <td><strong>Inicialização</strong></td>
    <td>Criação do contexto WebGL, compilação dos shaders, carregamento das texturas e construção da cena.</td>
  </tr>
  <tr>
    <td><strong>Loop principal</strong></td>
    <td>Atualiza tempo, entrada, câmera, animações, HUD e chama o desenho da cena a cada frame.</td>
  </tr>
  <tr>
    <td><strong>Shaders</strong></td>
    <td>Separação entre shader padrão dos objetos, shader procedural da água e shader do céu HDRI.</td>
  </tr>
  <tr>
    <td><strong>Cena</strong></td>
    <td>Organiza objetos opacos, transparentes, skybox/skydome, água, arquitetura, portas e personagens.</td>
  </tr>
  <tr>
    <td><strong>Interface</strong></td>
    <td>Menu inicial, HUD de setor/orientação, FPS dinâmico, crosshair, pausa e tela final.</td>
  </tr>
</table>

---

## 👨‍💻 Equipe

<table width="100%">
  <tr>
    <th width="33%" align="center">James Taylor</th>
    <th width="33%" align="center">Victor Reinaldo</th>
    <th width="33%" align="center">Lucas Almeida</th>
  </tr>
  <tr align="center">
    <td>Projeto, documentação, UI/UX e integração visual.</td>
    <td>Técnicas gráficas, transformações, iluminação e ajustes de cena.</td>
    <td>Texturização, HDRI, OBJ, organização e testes finais.</td>
  </tr>
</table>

---

## ✅ Conclusão

O projeto demonstra uma cena 3D completa construída em **WebGL puro**, unindo requisitos técnicos obrigatórios e uma proposta visual imersiva. A experiência combina câmera em primeira pessoa, renderização com shaders GLSL, iluminação Phong, animações por transformações geométricas, texturas, céu HDRI, oceano procedural e um leitor OBJ próprio para o barco de chegada.

