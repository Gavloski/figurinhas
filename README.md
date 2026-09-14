# Sticker Maker para WhatsApp

Aplicação web e bot em Node.js para transformar imagens, GIFs e vídeos em figurinhas WebP.

## Criador online

### Executar localmente

Requisitos: Node.js 20+ e FFmpeg no PATH.

```bash
git clone https://github.com/Gavloski/figurinhas.git
cd figurinhas
npm install
cp .env.example .env
npm start
```

Abra `http://localhost:3000`. Se estiver no Windows, use `copy .env.example .env`.

### Funcionalidades

- Upload por clique ou arrastar e soltar
- Imagens PNG, JPG e WebP
- GIFs e vídeos MP4, WebM e MOV
- Nome do pacote e autor personalizáveis
- Download automático em `.webp`
- Interface adaptada para celular e computador
- Limite padrão de 20 MB

## Bot do WhatsApp

O bot por QR Code continua disponível:

```bash
npm run bot
```

Comandos: `!s`, `!sticker`, `!figurinha` e `!ajuda`.

> O bot usa Baileys, uma integração não oficial com o WhatsApp Web. Teste com uma conta secundária e respeite os termos do WhatsApp.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

Depois, abra `http://localhost:3000`.

## Hospedagem

A hospedagem precisa aceitar Node.js, armazenamento temporário em memória e FFmpeg. Serviços somente estáticos, como GitHub Pages, não executam a conversão de vídeos/GIFs.

Configure:

- Comando de build: `npm install`
- Comando de início: `npm start`
- Porta: variável `PORT`
- FFmpeg: disponível no ambiente ou usando o Dockerfile

## Configuração

```env
PORT=3000
PREFIX=!
STICKER_PACK=Gavloski
STICKER_AUTHOR=Sticker Bot
MAX_VIDEO_SECONDS=10
MAX_FILE_MB=20
```
