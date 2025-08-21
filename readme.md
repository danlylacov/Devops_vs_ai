# ToDo-приложение

Простое ToDo-приложение для управления задачами с современным интерфейсом.

## Технологии

- **Бэкенд**:
  - **FastAPI**: REST API для CRUD-операций.
  - **PostgreSQL**: Хранение данных задач.
  - **Redis**: Кэширование списка задач.
  - **SQLAlchemy**: ORM для работы с PostgreSQL.
  - **Pydantic**: Валидация данных.
- **Фронтенд**:
  - **React**: Интерфейс пользователя.
  - **Vite**: Сборщик и сервер разработки.
  - **Tailwind CSS**: Стилизация с анимациями.
  - **Axios**: HTTP-запросы к API.
- **Инфраструктура**:
  - Python 3.11+, Node.js 18+.
  - Опционально: Docker и Docker Compose.

## Механика работы

1. **Бэкенд (FastAPI)**:
   - Предоставляет API для создания, чтения, обновления и удаления задач (`/todos/`).
   - Хранит задачи в PostgreSQL.
   - Кэширует список задач в Redis (на 1 час) для оптимизации.
   - Поддерживает CORS для взаимодействия с фронтендом на `http://localhost:5173`.

2. **Фронтенд (React)**:
   - Форма для добавления задач (заголовок и описание).
   - Список задач с возможностью отмечать как выполненные и удалять.
   - Анимации появления задач, градиентный фон, адаптивный дизайн.
   - Запросы к API через Axios, прокси для `/todos` на `http://localhost:8000`.

3. **Интеграция**:
   - Фронтенд отправляет запросы к бэкенду через прокси Vite.
   - Бэкенд обрабатывает запросы, взаимодействует с PostgreSQL и Redis, возвращает JSON.

## Локальная установка

### Требования
- Python 3.11+
- Node.js 18+ и npm
- PostgreSQL 14+
- Redis 6+

### Установка

1. **Клонируйте проект** (если в репозитории):
   ```bash
   git clone <репозиторий>
   cd todo-app
   ```

2. **Настройка PostgreSQL**:
   - Установите PostgreSQL:
     ```bash
     sudo apt update
     sudo apt install postgresql postgresql-contrib  # Ubuntu
     brew install postgresql  # macOS
     ```
   - Запустите:
     ```bash
     sudo service postgresql start  # Ubuntu
     brew services start postgresql  # macOS
     ```
   - Создайте базу данных и пользователя:
     ```bash
     psql -U postgres
     ```
     ```sql
     CREATE DATABASE tododb;
     CREATE USER user WITH PASSWORD 'password';
     ALTER ROLE user SET client_encoding TO 'utf8';
     ALTER ROLE user SET default_transaction_isolation TO 'read committed';
     ALTER ROLE user SET timezone TO 'UTC';
     GRANT ALL PRIVILEGES ON DATABASE tododb TO user;
     \q
     ```

3. **Настройка Redis**:
   - Установите Redis:
     ```bash
     sudo apt install redis-server  # Ubuntu
     brew install redis  # macOS
     ```
   - Запустите:
     ```bash
     sudo service redis start  # Ubuntu
     brew services start redis  # macOS
     ```
   - Проверьте:
     ```bash
     redis-cli ping  # Должен вернуть PONG
     ```

4. **Настройка бэкенда**:
   - Перейдите в `backend/`:
     ```bash
     cd backend
     ```
   - Создайте виртуальное окружение и установите зависимости:
     ```bash
     python -m venv venv
     source venv/bin/activate  # На Windows: venv\Scripts\activate
     pip install -r requirements.txt
     ```
   - Убедитесь, что в `database.py` указано:
     ```python
     SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost:5432/tododb"
     ```
   - В `main.py`:
     ```python
     redis = Redis(host='localhost', port=6379, db=0)
     ```

5. **Настройка фронтенда**:
   - Перейдите в `frontend/`:
     ```bash
     cd frontend
     ```
   - Установите зависимости:
     ```bash
     npm install
     ```

### Запуск

1. **Запустите бэкенд**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```

2. **Запустите фронтенд**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Откройте приложение**:
   - Перейдите в браузере на `http://localhost:5173`.
   - Проверьте API: `curl http://localhost:8000/todos/`.

### Устранение неполадок
- **Бэкенд**: Проверьте PostgreSQL и Redis. Убедитесь, что зависимости установлены (`pip install -r requirements.txt`).
- **Фронтенд**: Если `npm run dev` не работает, удалите `node_modules` и `package-lock.json`, затем выполните `npm install`.
- **CORS**: Проверьте в `main.py`, что `allow_origins=["http://localhost:5173"]`.
