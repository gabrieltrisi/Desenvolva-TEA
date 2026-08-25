# Follow-ups de produção (pós-demo)

Notas técnicas dos itens conhecidos a endereçar após a fase de demonstração
comercial. Nenhum destes bloqueia o uso atual; são melhorias de precisão,
privacidade e custo/escala.

---

## 1. `ReportEmission` por prefeitura

### Problema atual
O modelo `ReportEmission` registra apenas `organizationId` (sem vínculo com
criança ou município). Por isso, no Painel Municipal a métrica **"Relatórios
emitidos"** não pode ser filtrada com segurança por prefeitura. A decisão de
demonstração foi exibir **0 para perfis PREFEITURA** (zero vazamento), mantendo
o valor real apenas para ADMIN.

### Solução proposta
Adicionar, de forma **aditiva** (sem reset/sem db push), campos opcionais:
- `municipalityId String?` (FK → `Municipality`, `onDelete: SetNull`)
- e/ou `childId String?` (FK → `Child`, `onDelete: SetNull`)

Preencher esses campos no momento da emissão (rotas de PDF individual e
municipal já têm a criança/município em contexto) e, em seguida, escopar a
contagem em `getMunicipioData`/`getMunicipioComparison` por
`municipalityId`/criança acessível.

### Impacto
- Métrica precisa por prefeitura (substitui o `0` interino).
- Migração aditiva + backfill opcional dos registros históricos (ficam sem
  vínculo até serem reemitidos — aceitável).
- Sem mudança de UI.

### Prioridade
**Baixa** — cosmético/relatório; não há vazamento no estado atual.

---

## 2. Playback privado de vídeos

### Problema atual
A rota `GET /api/videos/[id]/playback-url` devolve a `secure_url` **pública** do
Cloudinary (entrega via CDN). Qualquer pessoa com a URL consegue assistir ao
vídeo sem sessão, pois a proteção está apenas na emissão da URL, não no recurso.

### Solução proposta
Trocar a entrega pública por **URL assinada/autenticada** com expiração curta:
- usar `type: "authenticated"` (ou `"private"`) no upload do Cloudinary;
- gerar URL assinada por requisição (já há esqueleto em
  `getCloudinaryPlaybackUrl` em `src/lib/storage/cloudinary.ts`);
- manter o gate de sessão/organização/`published` já existente na rota.

### Impacto LGPD
Conteúdo terapêutico pode conter dados sensíveis de saúde. URLs públicas
permanentes são um risco de exposição/compartilhamento indevido e dificultam o
controle de acesso e a auditoria. URLs assinadas com expiração reduzem a
superfície de exposição e alinham o acesso ao consentimento/escopo do usuário.

### Prioridade
**Alta** antes de uso real com pacientes (atual é aceitável apenas para
demonstração controlada).

---

## 3. Migração futura de storage para Cloudflare R2

### Motivo
O Cloudinary é a solução **temporária** de demonstração. Para volume real de
vídeos terapêuticos, o custo de armazenamento/streaming e os limites do plano
tornam-se relevantes.

### Benefícios
- **Custo**: R2 com egress zero reduz fortemente o custo de banda de vídeo.
- **Controle**: armazenamento S3-compatível, com URLs assinadas nativas
  (presigned) e políticas de acesso próprias.
- **Escala**: previsível para crescimento da biblioteca por especialidade.

### Reaproveitamento (baixo atrito)
A arquitetura já isola o storage atrás de uma camada:
- **UI/Player**: `src/components/video/specialty-video-explorer.tsx` consome a
  rota de playback — independente do provedor.
- **Schema**: `Content.storageKey` (chave do objeto) + `Content.url` já modelam
  qualquer backend de storage; basta repovoar/assinar conforme o provedor.
- **Camada de storage**: `src/lib/storage/*` concentra assinatura/verificação;
  a migração se resume a uma implementação `r2.ts` (presigned PUT/GET via
  `@aws-sdk/*`, já presente no projeto) e troca do provedor nas rotas
  `sign-upload`/`finalize`/`playback-url`.

Resultado: troca de provedor sem mexer em UI nem no schema; apenas a
implementação da camada de storage e o repovoamento das chaves/URLs.

### Prioridade
**Média** — planejar após validação comercial e antes do crescimento do acervo.

---

_Itens 1 e 2 derivam das decisões registradas nas Fases 3–7 da reestruturação
de acesso multi-entidade/multi-prefeitura._
