# Инструкции по удалению секретов из Git истории

## ⚠️ КРИТИЧНО: API ключ в Git истории

API ключ `compass-Xsenos-dEjjbRUngiomtM4CV7vybcgf` был обнаружен в коммитах:
- 39b83f5
- 2450eb4

## Шаги по исправлению

### 1. Отозвать скомпрометированный ключ
**Немедленно** отзовите ключ `compass-Xsenos-dEjjbRUngiomtM4CV7vybcgf` в панели управления AI API сервиса.

### 2. Создать новый ключ
Создайте новый API ключ в сервисе AI API.

### 3. Обновить локальный .env
Обновите файл `.env` с новым ключом (НЕ коммитьте этот файл!):
```bash
AI_API_KEY=your-new-api-key-here
```

### 4. Удалить .env из Git истории

**ВНИМАНИЕ**: Эта операция перезаписывает историю Git. Координируйте с командой перед выполнением!

```bash
# Метод 1: Использовать git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Метод 2: Использовать git-filter-repo (рекомендуется, быстрее)
# Установить: pip install git-filter-repo
git filter-repo --path .env --invert-paths
```

### 5. Force push изменений

**ВНИМАНИЕ**: Это перезапишет удаленную историю!

```bash
git push origin --force --all
git push origin --force --tags
```

### 6. Обновить локальные копии у всех членов команды

Все члены команды должны выполнить:
```bash
# Сохранить локальные изменения
git stash

# Получить обновленную историю
git fetch origin
git reset --hard origin/main

# Восстановить локальные изменения
git stash pop
```

## Проверка

После выполнения проверьте, что .env больше нет в истории:
```bash
git log --all --full-history -- .env
# Должно быть пусто
```

## Предотвращение в будущем

1. ✅ Файл `.env` уже в `.gitignore` (строка 14)
2. ✅ Создан `.env.example` с placeholder значениями
3. ✅ Добавлена валидация env переменных в `lib/env.ts`
4. 🔄 Рекомендуется настроить pre-commit hooks для проверки секретов

## Дополнительные ресурсы

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [git-filter-repo documentation](https://github.com/newren/git-filter-repo)
