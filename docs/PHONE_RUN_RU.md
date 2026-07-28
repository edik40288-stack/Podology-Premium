# Запуск на телефоне без Android Studio

Команда из корня:

```powershell
.\START_MARKETPLACE_PHONE.ps1
```

Если Windows блокирует скрипт:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\START_MARKETPLACE_PHONE.ps1
```

Если телефон `unauthorized`:

1. Разблокировать телефон.
2. Переподключить USB.
3. Нажать OK на «Разрешить USB-отладку?».
4. Запустить команду снова.

Скрипт использует `adb reverse`, поэтому приложение на телефоне видит backend ноутбука по адресу:

```text
http://127.0.0.1:3000
```
