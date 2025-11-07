#!/usr/bin/env node

/**
 * Gerador de Vídeo para Apresentação StartCup
 * Converte a apresentação HTML em vídeo MP4 (1080x1920) para Instagram
 */

const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configurar ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

// Configurações
const CONFIG = {
  url: 'http://localhost:3000', // Mude para sua URL online se necessário
  output: 'apresentacao-startcup.mp4',
  width: 1080,
  height: 1920,
  fps: 30,
  bitrate: '8000k',
  screenshotInterval: 100, // ms entre screenshots
};

// Duração dos slides em ms
const SLIDE_DURATIONS = [
  10000, // Slide 0: Cursos
  6000,  // Slide 1: Logo + Título
  5000,  // Slide 2: Gamificação
  8000,  // Slide 3: Fases
  5000,  // Slide 4: Recompensas
  7000,  // Slide 5: Mentores
  6000,  // Slide 6: Pódio
  10000, // Slide 7: QR Code
];

const TOTAL_DURATION = SLIDE_DURATIONS.reduce((a, b) => a + b, 0);
const FRAMES_NEEDED = Math.ceil((TOTAL_DURATION / 1000) * CONFIG.fps);

console.log('🎬 Conversor de Apresentação para Vídeo');
console.log('─'.repeat(50));
console.log(`📏 Resolução: ${CONFIG.width}x${CONFIG.height}`);
console.log(`⏱️  Duração total: ${(TOTAL_DURATION / 1000).toFixed(1)}s`);
console.log(`📹 FPS: ${CONFIG.fps}`);
console.log(`🖼️  Frames esperados: ${FRAMES_NEEDED}`);
console.log(`💾 Saída: ${CONFIG.output}`);
console.log('─'.repeat(50));

async function captureFrames() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();

  // Configurar viewport para Instagram (vertical)
  await page.setViewport({
    width: CONFIG.width,
    height: CONFIG.height,
    deviceScaleFactor: 1,
  });

  try {
    console.log('\n🌐 Carregando apresentação...');
    await page.goto(CONFIG.url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log('✅ Apresentação carregada');
    console.log('\n📸 Capturando frames...');

    const screenshotDir = path.join(os.tmpdir(), 'startcup-frames');

    // Criar diretório se não existir
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    } else {
      // Limpar frames antigos
      fs.readdirSync(screenshotDir).forEach(file => {
        fs.unlinkSync(path.join(screenshotDir, file));
      });
    }

    let frameCount = 0;
    let currentTime = 0;
    let currentSlide = 0;

    while (currentTime < TOTAL_DURATION && frameCount < FRAMES_NEEDED) {
      // Determinar qual slide deve estar ativo
      let slideTime = 0;
      for (let i = 0; i < SLIDE_DURATIONS.length; i++) {
        if (currentTime < slideTime + SLIDE_DURATIONS[i]) {
          if (i !== currentSlide) {
            currentSlide = i;
            console.log(`  📍 Slide ${i + 1}/8 (${(currentTime / 1000).toFixed(1)}s)`);

            // Atualizar slide via JavaScript
            await page.evaluate((slideIndex) => {
              const slides = document.querySelectorAll('.slide');
              slides.forEach((slide, idx) => {
                if (idx === slideIndex) {
                  slide.classList.add('active');
                } else {
                  slide.classList.remove('active');
                }
              });
            }, currentSlide);

            // Aguardar animações
            await page.waitForTimeout(600);
          }
          break;
        }
        slideTime += SLIDE_DURATIONS[i];
      }

      // Capturar screenshot
      const filename = String(frameCount).padStart(6, '0');
      const filepath = path.join(screenshotDir, `frame-${filename}.png`);

      await page.screenshot({
        path: filepath,
        type: 'png',
      });

      frameCount++;
      currentTime += CONFIG.screenshotInterval;

      // Mostrar progresso
      if (frameCount % 30 === 0) {
        process.stdout.write(`  ✓ ${frameCount}/${FRAMES_NEEDED} frames\r`);
      }
    }

    console.log(`\n✅ Capturados ${frameCount} frames`);
    console.log(`\n🎞️  Convertendo para vídeo MP4...`);

    // Criar vídeo com FFmpeg
    await createVideo(screenshotDir, frameCount);

    console.log('\n✨ Vídeo criado com sucesso!');
    console.log(`📁 Arquivo: ${CONFIG.output}`);
    console.log(`📊 Tamanho: ${(fs.statSync(CONFIG.output).size / 1024 / 1024).toFixed(2)} MB`);
    console.log('\n🎥 Pronto para postar no Instagram!');

    // Limpar arquivos temporários
    fs.rmSync(screenshotDir, { recursive: true });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

function createVideo(framesDir, frameCount) {
  return new Promise((resolve, reject) => {
    const inputPattern = path.join(framesDir, 'frame-%06d.png');

    ffmpeg()
      .input(inputPattern)
      .inputFPS(CONFIG.fps)
      .outputFormat('mp4')
      .videoCodec('libx264')
      .outputOptions([
        `-preset fast`,
        `-crf 23`,
        `-b:v ${CONFIG.bitrate}`,
        `-pix_fmt yuv420p`,
      ])
      .on('start', (cmd) => {
        console.log('  FFmpeg cmd:', cmd);
      })
      .on('progress', (progress) => {
        if (progress.frames) {
          const percent = Math.round((progress.frames / frameCount) * 100);
          process.stdout.write(`  ⏳ Progresso: ${percent}%\r`);
        }
      })
      .on('end', () => {
        console.log('\n  ✓ Vídeo finalizado');
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      })
      .save(CONFIG.output);
  });
}

// Iniciar captura
captureFrames().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
