# StartCup AMF - Apresentação

Apresentação interativa do evento StartCup AMF - O Desafio de 12 Horas.

## Deploy

Este projeto está configurado para deploy no Vercel.

## Visualização Local

Abra o arquivo `Superstart.html` diretamente no navegador.

## Como adicionar o QR Code

Para adicionar ou alterar o QR Code exibido na apresentação:

1. Gere seu QR Code (usando ferramentas online como [QR Code Generator](https://www.qr-code-generator.com/) ou similar)
2. Salve a imagem do QR Code como `qrcode.png`, `qrcode.jpg`, ou `qrcode.svg`
3. Coloque o arquivo na pasta `assets/images/`
4. Se usar um formato diferente de `.svg`, atualize a referência no arquivo `Superstart.html` (linha 412):
   ```html
   <img src="assets/images/qrcode.png" alt="QR Code para inscrição">
   ```

**Nota:** Atualmente existe um QR Code placeholder em `assets/images/qrcode.svg`. Substitua este arquivo pelo seu QR Code real.
