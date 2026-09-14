# Sticker Bot para WhatsApp

Bot em Node.js que transforma imagens, vídeos e GIFs enviados no WhatsApp em figurinhas estáticas ou animadas.

## Recursos

- Imagem com `!s` ou `!sticker` → figurinha WebP
- Vídeo/GIF curto com `!s` → figurinha animada
- Aceita mídia enviada com legenda ou respondida
- QR Code no terminal
- Limite configurável de duração e tamanho
- Sessão salva localmente em `auth/`
- Dockerfile incluído

> Este projeto usa Baileys, uma biblioteca não oficial para o WhatsApp Web. Use uma conta separada para testes e respeite os termos do WhatsApp.

## Requisitos

- Node.js 20 ou superior
- FFmpeg instalado e disponível no PATH

## Instalação

```bash
git clone https://github.com/Gavloski/figurinhas.git
cd figurinhas
npm install
cp .env.example .env
npm start
```

No Windows, instale o FFmpeg e adicione-o ao PATH. Depois, leia o QR Code exibido no terminal em **WhatsApp > Aparelhos conectados > Conectar um aparelho**.

## Como usar

1. Envie uma imagem com a legenda `!s`.
2. Envie um vídeo ou GIF de até 10 segundos com a legenda `!s`.
3. Ou responda a uma imagem/vídeo/GIF com `!s`.
4. Use `!ajuda` para ver os comandos.

## Configuração

Edite o arquivo `.env`:

```env
PREFIX=!
STICKER_PACK=Gavloski
STICKER_AUTHOR=Sticker Bot
MAX_VIDEO_SECONDS=10
MAX_FILE_MB=20
```

## Docker

```bash
docker compose up --build
```

A pasta `auth` fica persistida para evitar a leitura do QR Code a cada reinício.

## Observações

- Figurinhas animadas ficam sem áudio, como exigido pelo formato.
- Vídeos longos devem ser cortados antes do envio.
- Não publique a pasta `auth/`: ela contém as credenciais da sessão.
