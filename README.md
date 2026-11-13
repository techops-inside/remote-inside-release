# remote-inside-releases

Repositório **público** só de releases do Remote Inside (o app principal vive num repo
privado). Existe separado porque o updater (`tauri-plugin-updater`) precisa de um
endpoint sem autenticação para `latest.json` + instalador, e GitHub Releases num repo
privado exigiria embutir um token no app distribuído.

## Setup (uma vez)

1. Crie este repositório no GitHub como **público**, com o nome usado em
   `src-tauri/tauri.conf.json` do repo principal (`plugins.updater.endpoints`) — por
   padrão `MichelDev2005/remote-inside-releases`. Usou outro nome? Edite essa única URL
   no repo principal.
2. Copie os arquivos desta pasta (`.github/workflows/release.yml`,
   `scripts/build-latest-json.mjs`, este `README.md`) para a raiz do novo repositório.
3. Configure os secrets em Settings → Secrets and variables → Actions:
   - `TAURI_SIGNING_PRIVATE_KEY`: conteúdo de `src-tauri/updater.key` do repo principal
     (veja `docs/UPDATER.md` lá).
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: só se a chave tiver senha (não é o caso por
     padrão).
   - `PRIVATE_REPO_CHECKOUT_TOKEN`: um Personal Access Token (classic, scope `repo`) ou
     fine-grained com acesso de leitura ao repo privado `MichelDev2005/remote-inside`,
     usado pelo workflow pra fazer checkout do código-fonte real (que não vive aqui).
4. Esse workflow dispara quando uma tag `v*` é enviada **a este repositório de
   releases** (não ao repo principal) — nunca envie a tag de dentro de um clone do
   repo principal com um remote apontando pra aqui: isso empurraria o histórico
   privado inteiro junto. Em vez disso, dispare pelo próprio repositório de releases
   (ex.: clone deste repo isolado e `git tag v0.2.0 && git push origin v0.2.0`, ou
   `gh api -X POST repos/<dono>/remote-inside-releases/git/refs -f ref=refs/tags/v0.2.0
   -f sha=<sha do HEAD aqui>`), ou rode `gh workflow run release.yml -R
   <dono>/remote-inside-releases -f version=0.2.0` (equivalente ao `workflow_dispatch`).
   Em qualquer caso, `version` precisa bater com `tauri.conf.json` do repo principal —
   o workflow falha de propósito se não bater (ver passo "Confere se a versão...").

## O que o workflow faz

Ver `.github/workflows/release.yml`: faz checkout do repo principal (privado) usando o
PAT acima, builda o frontend, o instalador Windows completo (NSIS, assinado com a
chave do updater) e o instalador fino (`ri-installer-ui`), gera `latest.json`
(`scripts/build-latest-json.mjs`) e publica quatro assets numa GitHub Release
nomeada com a mesma tag:

- `RemoteInsideFullSetup.exe` + `.exe.sig` — o payload NSIS completo de verdade. É o
  que `latest.json` aponta e o que tanto o updater do app quanto o instalador fino
  baixam e verificam a assinatura antes de instalar. Nome muda a cada versão por
  conveniência de auditoria, mas não importa — só o `latest.json` é referenciado por URL.
- `RemoteInsideSetup.exe` — o instalador fino em si (não embute o NSIS, só sabe baixar
  e verificar o de cima). Esse nome fica igual em toda release de propósito: é o link
  estável (`.../releases/latest/download/RemoteInsideSetup.exe`) que vai no
  README/site do projeto pra quem instala pela primeira vez.
- `latest.json` — é isso que faz `.../releases/latest/download/latest.json` resolver
  para o updater do app.

- shortcut: checkout do repo privado via PAT de longa duração guardado como secret;
  trocar por um GitHub App instalado nos dois repos (token de vida curta) quando
  releases ficarem frequentes o bastante pra justificar a manutenção extra.
