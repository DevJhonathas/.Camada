Instalei no frontend:
npx create-next-app@latest

Instalei no backend:
npm i -g @nestjs/cli
nest new backend

Atulizei o node
yarn install
yarn i --save-dev @types/jest
i --save @nestjs/axios axios
docker run --name redis -p 6379:6379 -d -t redis:alpine
yarn add --save @nestjs/bull bull ioredis
yarn add -D @types/bull

## Arquiteturas
### Redis Cache Layer Architecture
API Third Party -> Job (a cada 10 min)-> MongoDB (salva último valor) ->Redis (cache rápido) -> Sua API -> Frontend

### Data Aggregation + Cache Strategy 
API Third Party
      ->
Mega request (várias ações)
      ->
Salvar em Redis / MongoDB
      ->
Usuário abre /ITUB4
      ->
Seu backend filtra ITUB4 do cache
      ->
Retorna para o frontend