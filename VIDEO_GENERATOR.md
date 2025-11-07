# 🎬 Gerador de Vídeo - Apresentação StartCup

Converte sua apresentação HTML em vídeo MP4 pronto para Instagram!

## 📋 Requisitos

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **FFmpeg** (será instalado automaticamente)

## ⚙️ Instalação

### 1. Instalar dependências

```bash
npm install
```

Isso vai instalar:
- `puppeteer` - Para capturar screenshots
- `fluent-ffmpeg` - Para converter para vídeo
- `ffmpeg-static` - FFmpeg incluído

### 2. Escolher versão do script

Escolha uma das opções abaixo:

## 🚀 Opção A: Usar URL do Vercel (RECOMENDADO - Mais Fácil)

```bash
npm run generate-video-local
```

**Vantagens:**
✅ Funciona de qualquer lugar
✅ Sem precisa rodar servidor local
✅ Usa a URL ao vivo: https://startcupopen.vercel.app

**Tempo esperado:** ~2-3 minutos

## 🖥️ Opção B: Usar Localhost (Mais Rápido)

Primeiro, inicie um servidor HTTP na pasta:

```bash
# Se tem Python 3
python -m http.server 3000

# Ou com Node (npm install -g http-server)
http-server -p 3000

# Ou com Python 2
python -m SimpleHTTPServer 3000
```

Depois em outro terminal:

```bash
npm run generate-video
```

**Vantagens:**
✅ Mais rápido (~1-2 minutos)
✅ Não depende da internet
✅ Mais controle

## 📊 Especificações do Vídeo

| Propriedade | Valor |
|-------------|-------|
| **Resolução** | 1080x1920px (9:16) |
| **FPS** | 30 frames/segundo |
| **Duração** | ~57 segundos |
| **Codec** | H.264 (MP4) |
| **Bitrate** | 8000 kbps |
| **Formato** | MP4 |

## 🎯 O que o script faz

1. **Abre a apresentação** no navegador (sem interface gráfica)
2. **Captura 1700+ screenshots** - um para cada frame
3. **Gerencia transições** de slides automaticamente
4. **Converte para vídeo MP4** usando FFmpeg
5. **Salva como** `apresentacao-startcup.mp4`

## 📁 Arquivos gerados

```
apresentacao-startcup.mp4 (8-12 MB)
└─ Pronto para Instagram!
```

## 📱 Postar no Instagram

### Instagram Reels
1. Abrir Instagram > Criar > Reels
2. Selecionar `apresentacao-startcup.mp4`
3. Adicionar música, filtros, etc.
4. Compartilhar!

### Feed (Vertical)
1. Instagram > Criar > Post
2. Upload do vídeo MP4
3. A proporção 9:16 já é perfeita!

### Stories
Pode dividir em múltiplos stories de 15 segundos cada

## 🔧 Customizar

Abra `capture-video.js` ou `capture-video-local.js` e edite:

```javascript
const CONFIG = {
  url: 'https://startcupopen.vercel.app',  // URL
  output: 'apresentacao-startcup.mp4',      // Nome do arquivo
  width: 1080,                               // Largura
  height: 1920,                              // Altura (9:16)
  fps: 30,                                   // Frames por segundo
  bitrate: '8000k',                          // Qualidade
};
```

## 🐛 Troubleshooting

### "FFmpeg not found"
```bash
npm install ffmpeg-static --save
```

### "Chromium failed to download"
```bash
npm install puppeteer --save
# Ou se estiver no WSL:
apt-get install -y chromium-browser
```

### Vídeo muito pesado?
Reduzir bitrate em CONFIG:
```javascript
bitrate: '4000k',  // Reduz tamanho, pior qualidade
```

### Vídeo muito leve/pixelado?
Aumentar qualidade em CONFIG:
```javascript
bitrate: '12000k',  // Melhor qualidade, arquivo maior
```

### Script muito lento?
Aumentar intervalo entre screenshots:
```javascript
screenshotInterval: 150,  // Era 100
```

## 📊 Duração dos slides

| Slide | Conteúdo | Duração |
|-------|----------|---------|
| 0 | Cursos | 10s |
| 1 | Logo + Título | 6s |
| 2 | Gamificação | 5s |
| 3 | Fases | 8s |
| 4 | Recompensas | 5s |
| 5 | Mentores | 7s |
| 6 | Pódio | 6s |
| 7 | QR Code | 10s |
| **Total** | | **57s** |

## ✨ Próximas melhorias

- [ ] Adicionar música de fundo
- [ ] Adicionar watermark
- [ ] Suportar diferentes resoluções
- [ ] Renderizar em paralelo
- [ ] Exportar GIF também

## 📝 Licença

MIT - Use como desejar!

---

**Dúvidas?** Verifique as opções em `capture-video.js` ou `capture-video-local.js`

**Tempo total:** ~2-3 minutos para gerar o vídeo completo! 🎉
