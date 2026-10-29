# Portfolio links and contact form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Обновить ссылки, проекты, контактную форму и удалить CV в существующем статическом портфолио, затем проверить и опубликовать проект в открытом GitHub-репозитории.

**Architecture:** Сохранить текущую структуру статического HTML/CSS/JS. Все функциональные изменения выполнить в `index.html`; PDF CV удалить из `assets/cv`; внешние сервисы и зависимости не добавлять.

**Tech Stack:** HTML, CSS, vanilla JavaScript, FormSubmit, Git/GitHub.

**Spec:** `docs/superpowers/specs/2026-10-29-portfolio-links-contact-design.md`

## Global Constraints

- Не менять дизайн, CSS, изображения, анимации и тексты вне запрошенного.
- Telegram должен вести на `https://t.me/jeiseidev`.
- GitHub должен вести на `https://github.com/jeisei`.
- FormSubmit должен отправлять на `maximus17power@gmail.com`.
- Удалить CV-ссылки и `assets/cv/max-shemchuk-cv.pdf`.
- Три карточки должны вести на `https://avtoservise8889.netlify.app`, `https://gym-tracker87.netlify.app/`, `https://t.me/NihtykBot`; четвёртую карточку оставить без придуманного URL.

## Review Focus

- Старые Telegram/GitHub/CV ссылки не должны остаться в HTML.
- Форма должна иметь корректный внешний action, method и имена полей.
- Удаление CV не должно оставить битых ссылок на файл.
- Все четыре карточки должны сохранить существующие изображения, классы и визуальные теги.
- HTML должен оставаться валидным и не содержать незакрытых тегов.

### Task 1: Apply requested static-site updates and verify

**Files:**
- Modify: `index.html`
- Delete: `assets/cv/max-shemchuk-cv.pdf`
- Create: `docs/superpowers/specs/2026-10-29-portfolio-links-contact-design.md`
- Create: `docs/superpowers/plans/2026-10-29-portfolio-links-contact.md`

**Interfaces:**
- Consumes: existing HTML classes and form fields.
- Produces: static site with exact requested external links and FormSubmit action.

- [ ] **Step 1: Apply minimal HTML changes.**
  - Set GitHub href to `https://github.com/jeisei`.
  - Set every Telegram href to `https://t.me/jeiseidev`.
  - Set first three portfolio hrefs to the exact project URLs.
  - Keep the fourth portfolio card href as `#`.
  - Remove both CV link blocks from hero and About sections.
  - Set the form action to `https://formsubmit.co/maximus17power@gmail.com`, keep `method="POST"`, and add hidden `_subject`, `_captcha`, and `_template` fields without changing visible form styles.

- [ ] **Step 2: Remove the CV file.**
  Delete only `assets/cv/max-shemchuk-cv.pdf` after verifying the path is the intended project CV.

- [ ] **Step 3: Run static verification.**
  Run PowerShell assertions that the exact requested links exist, old CV/Telegram/GitHub references do not, the PDF is absent, all four portfolio cards remain, and form fields/action are present. Expected: exit code 0 and no failed assertions.

- [ ] **Step 4: Run browser verification.**
  Serve the folder locally, open the page in a browser, inspect the rendered page, click or inspect the GitHub, Telegram, and three project links, verify the CV controls are absent, and confirm the contact form renders with no console errors. Expected: page renders with unchanged layout and requested destinations.

- [ ] **Step 5: Initialize and publish GitHub repository.**
  Initialize Git if needed, commit the verified project, create or select a public repository under `jeisei`, and push the project. Verify the remote and public repository URL.

