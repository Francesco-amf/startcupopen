#!/usr/bin/env node

/**
 * Gerador de Vídeo - Versão Local (URL Vercel)
 * Use isso se não conseguir rodar local
 */

const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const os = require('os');

ffmpeg.setFfmpegPath(ffmpegStatic);

// Configurações
const CONFIG = {
  url: 'https://startcupopen.vercel.app', // URL do Vercel
  output: 'apresentacao-startcup.mp4',
  width: 1080,
  height: 1920,
  fps: 30,
  bitrate: '8000k',
  screenshotInterval: 100,
};

const SLIDE_DURATIONS = [10000, 6000, 5000, 8000, 5000, 7000, 6000, 10000];
const TOTAL_DURATION = SLIDE_DURATIONS.reduce((a, b) => a + b, 0);
const FRAMES_NEEDED = Math.ceil((TOTAL_DURATION / 1000) * CONFIG.fps);

console.log('🎬 Conversor de Apresentação para Vídeo (Vercel)');
console.log('─'.repeat(50));
console.log(`📏 Resolução: ${CONFIG.width}x${CONFIG.height}`);
console.log(`⏱️  Duração total: ${(TOTAL_DURATION / 1000).toFixed(1)}s`);
console.log(`📹 FPS: ${CONFIG.fps}`);
console.log(`🖼️  Frames esperados: ${FRAMES_NEEDED}`);
console.log(`💾 Saída: ${CONFIG.output}`);
console.log(`🌐 URL: ${CONFIG.url}`);
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

  await page.setViewport({
    width: CONFIG.width,
    height: CONFIG.height,
    deviceScaleFactor: 1,
  });

  try {
    console.log('\n🌐 Carregando apresentação do Vercel...');
    await page.goto(CONFIG.url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log('✅ Apresentação carregada');
    console.log('\n📸 Capturando frames...');

    const screenshotDir = path.join(os.tmpdir(), 'startcup-frames');

    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    } else {
      fs.readdirSync(screenshotDir).forEach(file => {
        fs.unlinkSync(path.join(screenshotDir, file));
      });
    }

    let frameCount = 0;
    let currentTime = 0;
    let currentSlide = 0;

    while (currentTime < TOTAL_DURATION && frameCount < FRAMES_NEEDED) {
      // Determinar slide atual
      let slideTime = 0;
      for (let i = 0; i < SLIDE_DURATIONS.length; i++) {
        if (currentTime < slideTime + SLIDE_DURATIONS[i]) {
          if (i !== currentSlide) {
            currentSlide = i;
            console.log(`  📍 Slide ${i + 1}/8 (${(currentTime / 1000).toFixed(1)}s)`);

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

            await page.waitForTimeout(600);
          }
          break;
        }
        slideTime += SLIDE_DURATIONS[i];
      }

      const filename = String(frameCount).padStart(6, '0');
      const filepath = path.join(screenshotDir, `frame-${filename}.png`);

      await page.screenshot({
        path: filepath,
        type: 'png',
      });

      frameCount++;
      currentTime += CONFIG.screenshotInterval;

      if (frameCount % 30 === 0) {
        process.stdout.write(`  ✓ ${frameCount}/${FRAMES_NEEDED} frames\r`);
      }
    }

    console.log(`\n✅ Capturados ${frameCount} frames`);
    console.log(`\n🎞️  Convertendo para vídeo MP4...`);

    await createVideo(screenshotDir, frameCount);

    console.log('\n✨ Vídeo criado com sucesso!');
    console.log(`📁 Arquivo: ${CONFIG.output}`);
    console.log(`📊 Tamanho: ${(fs.statSync(CONFIG.output).size / 1024 / 1024).toFixed(2)} MB`);
    console.log('\n🎥 Pronto para postar no Instagram!');

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

captureFrames().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
