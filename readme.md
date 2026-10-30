# .Camada — Calculadora de preço para impressão 3D

Aplicação web para estimar o custo de produção, o preço de venda sugerido e o lucro de peças produzidas por impressão 3D. O cálculo considera o consumo de filamento, energia elétrica, depreciação da impressora e, conforme o produto, acabamento, mão de obra, embalagem, taxas de venda e impostos.

A aplicação também permite salvar cálculos no histórico, reutilizar configurações como presets e manter um rascunho dos dados no navegador.

> **Aplicação online:** [Abrir o .Camada](https://devjhonathas.github.io/.Camada/)
## Funcionalidades

- **Cálculo de filamento:** considera o peso da peça, o peso do rolo, o preço do rolo e uma porcentagem estimada de desperdício.
- **Energia elétrica:** estima o custo a partir do tempo de impressão, da potência média da impressora e da tarifa por kWh.
- **Depreciação do equipamento:** distribui o valor da impressora pelas horas de uso estimadas ao longo da vida útil informada.
- **Manutenção:** rateia uma reserva mensal de manutenção pelas horas estimadas de uso da impressora.
- **Acabamento e mão de obra:** modo opcional para Action Figures, com custos de primer, verniz, lixas, tinta acrílica, modelagem e acabamento manual.
- **Despesas comerciais:** permite incluir embalagem, outros custos por peça, taxas da plataforma e impostos percentuais.
- **Margem sobre a venda:** calcula o preço considerando a margem desejada sobre o preço de venda, em vez de simplesmente adicionar uma porcentagem ao custo.
- **Resumo do cálculo:** apresenta preço sugerido, custo total, lucro estimado, margem efetiva e composição dos custos.
- **Rascunho automático:** salva os valores do formulário, o nome da peça e a opção de Action Figure no `localStorage` do navegador.
- **Histórico e presets:** permite salvar cálculos nomeados e carregar seus dados novamente para reutilização ou edição.
- **Validação:** informa quando o peso do rolo é inválido ou quando a soma das taxas, impostos e margem desejada inviabiliza o cálculo.

## Tecnologias

- [Next.js](https://nextjs.org/) `16.1.6`
- [React](https://react.dev/) e React DOM `19.2.3`
- [TypeScript](https://www.typescriptlang.org/) `5`
- [Tailwind CSS](https://tailwindcss.com/) `4`
- ESLint `9`, com `eslint-config-next`

O projeto utiliza componentes React no cliente para interatividade e armazenamento no navegador. De acordo com a implementação atual, os dados de rascunho e histórico são locais: não há persistência em banco de dados nem sincronização automática entre navegadores ou dispositivos.

## Requisitos

- Node.js em uma versão compatível com Next.js 16.
- npm.

Confira as versões instaladas:

```bash
node --version
npm --version
```

## Instalação e execução

Clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/DevJhonathas/.Camada.git
cd <PASTA_DO_PROJETO>
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Next.js. |
| `npm run build` | Gera a build de produção. |
| `npm run start` | Inicia a aplicação usando a build de produção já gerada. |
| `npm run lint` | Executa o ESLint. |

Para testar a build de produção localmente:

```bash
npm run build
npm run start
```

## Como os custos são calculados

Todas as entradas numéricas são tratadas como valores não negativos. Entradas não numéricas ou não finitas são convertidas para zero pela função de leitura numérica. Os cálculos abaixo descrevem a lógica implementada no formulário.

### 1. Tempo de impressão

O tempo é informado em horas e minutos e convertido para horas decimais:

```text
tempoImpressao = horas + (minutos / 60)
```

### 2. Custo do filamento

```text
custoFilamento = (pesoPeca / pesoRolo) * precoRolo * (1 + desperdicioPercentual / 100)
```

Os pesos da peça e do rolo devem usar a mesma unidade — no formulário, gramas. O desperdício é aplicado como um acréscimo proporcional ao custo do material.

### 3. Custo de energia

```text
custoEnergia = tempoImpressao * potenciaKW * tarifaKWh
```

A potência deve ser informada em kW e a tarifa em reais por kWh. Use uma estimativa de potência média durante a impressão, não necessariamente a potência máxima indicada para a máquina.

### 4. Depreciação da impressora

Quando a vida útil e as horas mensais de uso são maiores que zero:

```text
custoDepreciacao = (valorImpressora / (vidaUtilMeses * horasUsoMensal)) * tempoImpressao
```

Esse cálculo distribui o valor informado da impressora pelas horas de uso estimadas durante sua vida útil.

### 5. Manutenção

Quando as horas mensais de uso são maiores que zero e a vida útil também está configurada:

```text
custoManutencao = (manutencaoMensal / horasUsoMensal) * tempoImpressao
```

Se o valor da impressora ou a manutenção mensal forem informados, mas a vida útil ou o uso mensal não forem válidos, esses componentes não são rateados e o formulário exibe um aviso.

### 6. Acabamento e mão de obra

Esses componentes são incluídos somente quando a opção **Estou produzindo uma Action Figure** está ativada.

```text
custoAcabamento = primer + verniz + lixas + tintaAcrilica
custoMaoDeObra = (tempoModelagem + tempoAcabamento) * valorHora
```

Os custos de materiais de acabamento devem representar a parcela efetivamente usada na peça. Os tempos de modelagem e acabamento são contabilizados integralmente para o produto calculado; a implementação atual não divide automaticamente o tempo de modelagem entre várias unidades.

### 7. Custo de produção

```text
custoProducao =
    custoFilamento
  + custoEnergia
  + custoDepreciacao
  + custoManutencao
  + custoAcabamento
  + custoMaoDeObra
  + custoEmbalagem
  + outrosCustos
```

Os campos de acabamento e mão de obra valem zero quando o modo Action Figure está desativado.

### 8. Preço de venda sugerido

A margem desejada, a taxa da plataforma e os impostos são percentuais do **preço de venda**. Primeiro, é calculada a parcela do preço disponível para cobrir o custo de produção:

```text
parcelaDisponivel = 1 - (taxaPlataforma + impostos + margemDesejada) / 100
precoSugerido = custoProducao / parcelaDisponivel
```

A soma de taxa da plataforma, impostos e margem desejada precisa ser **inferior a 100%**. Se for igual ou superior a 100%, não existe um preço finito calculável por essa fórmula e a aplicação informa um erro.

### 9. Taxas, custo total, lucro e margem efetiva

```text
taxaPlataforma = precoSugerido * taxaPlataformaPercentual / 100
custoImpostos  = precoSugerido * impostosPercentual / 100
custoTotal     = custoProducao + taxaPlataforma + custoImpostos
lucro          = precoSugerido - custoTotal
margemEfetiva  = (lucro / precoSugerido) * 100
```

Os valores monetários são apresentados em reais (BRL), com formatação para o padrão brasileiro. O resultado é uma estimativa baseada nos dados informados; custos não preenchidos ou estimados incorretamente afetam o preço calculado.

## Valores iniciais

Na primeira abertura, o formulário começa com estes valores padrão:

| Campo | Valor inicial |
| --- | ---: |
| Tempo de impressão | 6 h e 12 min |
| Peso da peça | 246 g |
| Preço do rolo de filamento | R$ 100,00 |
| Peso do rolo | 1.000 g |
| Desperdício de filamento | 0% |
| Potência média | 0,15 kW |
| Tarifa de energia | R$ 0,25/kWh |
| Valor da impressora | R$ 3.999,00 |
| Vida útil estimada | 24 meses |
| Uso mensal da impressora | 160 h |
| Manutenção mensal | R$ 0,00 |
| Margem desejada | 30% |

Os demais custos e percentuais opcionais começam em zero. A opção Action Figure começa desativada.

## Histórico, presets e armazenamento local

O estado atual do formulário é salvo automaticamente no `localStorage`. Ao reabrir a aplicação no mesmo navegador e na mesma origem, os valores anteriores podem ser restaurados.

Ao usar **Calcular e salvar preço**, a aplicação valida o resultado e salva uma entrada no histórico com o nome do produto, data e hora, valores do formulário, estado da opção Action Figure e os principais resultados do cálculo. O histórico é limitado às **30 entradas mais recentes** pela implementação atual. A seleção de um preset envia os valores ao formulário, que passa a usar essa configuração.

### Limitações do armazenamento

- Os dados ficam no navegador e na origem em que a aplicação foi aberta.
- Os dados não são sincronizados entre dispositivos ou navegadores.
- Limpar os dados do site/navegador pode apagar o rascunho e o histórico.
- O armazenamento pode falhar se o navegador bloquear o `localStorage` ou se não houver espaço disponível; a interface apresenta um estado de erro nesses casos.

Não trate o histórico local como backup permanente. Antes de trocar de navegador, dispositivo ou origem de publicação, considere exportar os dados caso a aplicação ganhe essa funcionalidade.

## Validações e avisos

- **Peso do rolo igual ou inferior a zero:** impede o cálculo do preço e solicita um peso de rolo maior que zero.
- **Taxas + impostos + margem iguais ou superiores a 100%:** impede o cálculo do preço sugerido.
- **Vida útil ou uso mensal inválidos:** exibe um aviso quando há valor de impressora ou manutenção a ratear, mas os parâmetros necessários não foram preenchidos corretamente.
- **Falha ao salvar:** informa quando não consegue persistir rascunho ou histórico no navegador.

## Publicação

A aplicação pode ser publicada em uma plataforma que ofereça suporte ao Next.js. Para uma publicação convencional, confira as configurações e variáveis do ambiente na plataforma escolhida.

### GitHub Pages

O GitHub Pages hospeda arquivos estáticos. Para publicar esta aplicação nele, o projeto precisa estar configurado para exportação estática do Next.js (por exemplo, com `output: 'export'` em `next.config.ts`) e o workflow do GitHub Actions deve publicar o diretório gerado (`out`). Se o repositório for publicado em um subcaminho, como `usuario.github.io/nome-do-repositorio`, a configuração de `basePath` também precisa corresponder ao nome do repositório.

Esses ajustes dependem do conteúdo de `next.config.ts` e do workflow de deploy, que não são definidos pelo `package.json` nem pelo componente do formulário. Portanto, confirme esses arquivos antes de considerar a publicação no GitHub Pages concluída.

## Desenvolvimento

A lógica principal de cálculo está centralizada na função `calculatePrice`, que recebe os valores do formulário e o estado da opção Action Figure, e retorna os custos parciais, custo de produção, preço sugerido, lucro, margem efetiva, avisos e erros.

A persistência e os tipos relacionados ao rascunho, histórico e carregamento de presets são importados de `./calcPriceStorage`. As constantes de armazenamento e os eventos de integração devem continuar consistentes entre o formulário e a interface de histórico/presets.

Ao modificar a calculadora, mantenha as fórmulas e as unidades claramente documentadas e confira casos limite, especialmente peso do rolo zero, percentuais cuja soma chega a 100%, e dados incompletos para depreciação/manutenção.

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

Você é livre para utilizar, copiar, modificar, distribuir e comercializar este software, desde que mantenha os avisos de direitos autorais e o texto da licença original.
