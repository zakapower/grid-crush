# Grid Crush — очистка репозитория (design)

Дата: 2026-08-07  
Статус: утверждено

## Цель

Убрать мёртвые файлы и сборочные артефакты из репозитория. **Логику и интерфейс игры не менять.**

## Вне скоупа

- Правки `www/index.html`, `www/game.js`, `www/style.css` (и смысловые правки их копий в Android)
- Упрощение меню / режимов / геймплея
- Рефакторинг Kotlin / Gradle

## Что удаляем

| Путь | Причина |
|------|---------|
| `www/icons/` | Не подключены; UI использует inline SVG в HTML |
| `android-app/app/src/main/assets/www/icons/` | То же |
| `tools/` | Пустая директория |
| `assets/` (`app-icon.png`) | Нигде не используется |
| `GridCrush-v3.57-release.apk` (корень) | Сборочный артефакт; уже покрыт `*.apk` в `.gitignore` |
| `rustore/GridCrush-v1.0.0-release.apk` | Бинарник в репо; дублирует сборку из `android-app` |

## Что оставляем в `rustore/`

- `README.md` (обновить ссылки на APK)
- `listing.txt`
- `privacy.html`
- `media/` — иконка 512 и скриншоты для витрины

## Прочие правки

1. **`.gitignore`** — удалить исключение `!rustore/GridCrush-v1.0.0-release.apk`; оставить правило `*.apk`.
2. **`rustore/README.md`** — указать, что релизный APK собирается из `android-app`, а не хранится в `rustore/`.

## Критерии готовности

- Нет каталогов `www/icons`, `android-app/.../www/icons`, `tools`, `assets`
- Нет `*.apk` в рабочей копии (или они только локально и игнорируются git)
- Игровые файлы (`index.html`, `game.js`, `style.css`) без изменений поведения
- Материалы RuStore (тексты, privacy, media) на месте
- README RuStore не ссылается на удалённый APK в `rustore/`
