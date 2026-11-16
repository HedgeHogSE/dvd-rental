# Полное руководство по Laravel Backend DVD Rental System

**Для Java/Spring разработчиков**

---

## 📚 Введение

Это руководство объясняет архитектуру и внутреннее устройство Laravel backend системы видеопроката DVD-дисков. Если вы пришли из мира Java и Spring Framework, многие концепции будут знакомы — просто под другим названием.

### Что такое Laravel?

Laravel — это PHP фреймворк для разработки веб-приложений. Похож на Spring Boot, но с другими соглашениями и синтаксисом.

| Концепция | Spring Framework | Laravel |
|-----------|------------------|---------|
| **Фреймворк** | Spring Boot | Laravel |
| **Язык** | Java | PHP |
| **Контроллер** | `@Controller` / `@RestController` | `Controller` класс |
| **Сервис** | `@Service` | Слой сервисов (отдельные классы) |
| **Репозиторий** | `Repository` interface | Eloquent Model |
| **Модель** | `@Entity` | Eloquent Model |
| **Валидация** | `@Valid` + `@Constraint` | `$request->validate()` |
| **Транзакции** | `@Transactional` | `DB::transaction()` |
| **Безопасность** | Spring Security | Laravel Sanctum |
| **Миграции БД** | Flyway / Liquibase | artisan migrations |

### Что делает система?

DVD Rental — это система для управления видеопрокатом:
- **Клиенты** могут искать фильмы, бронировать DVD
- **Сотрудники** управляют контентом, выдают/принимают DVD
- **Администраторы** управляют пользователями и блокировками

---

## 🏗️ Архитектура Laravel

### Структура проекта

```
dvd-rental/
├── app/
│   ├── Models/           # Eloquent модели (аналог @Entity)
│   ├── Http/
│   │   ├── Controllers/  # Контроллеры (аналог @RestController)
│   │   ├── Middleware/   # Middleware (аналог Filter/Interceptor)
│   │   └── Request/      # Form Request Validation (аналог @Valid)
│   └── Policies/         # Авторизация (аналог @PreAuthorize)
├── database/
│   ├── migrations/       # Миграции БД (аналог Flyway)
│   └── seeders/          # Данные для тестирования
├── routes/
│   └── api.php           # Маршруты API (аналог @RequestMapping)
└── config/
    └── database.php      # Конфигурация БД
```

### Как работает HTTP запрос?

1. **Request приходит** → проходит через Middleware (аутентификация)
2. **Маршрутизация** → `routes/api.php` определяет, какой контроллер вызвать
3. **Контроллер** → обрабатывает запрос, вызывает модель, возвращает JSON
4. **Модель** → взаимодействует с БД через Eloquent ORM

---

## 🗄️ Database Schema (PostgreSQL)

Все таблицы создаются через **миграции** — файлы, которые описывают структуру БД программно.

### Что такое миграция?

**Миграция** — это класс PHP, который описывает, как создать или изменить таблицу в БД.

**Аналог в Spring**: Flyway migration script (например, `V1__create_users_table.sql`), только написан на PHP.

### Структура таблиц

#### 1. `users` — пользователи системы

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();                    // BIGINT PRIMARY KEY AUTO_INCREMENT
    $table->string('name');          // VARCHAR(255)
    $table->string('email')->unique(); // VARCHAR(255) UNIQUE
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');      // VARCHAR(255) — хэш пароля
    $table->string('phone')->nullable(); // VARCHAR(255), nullable
    $table->rememberToken();         // VARCHAR(100) для "Запомнить меня"
    $table->timestamps();            // created_at, updated_at (TIMESTAMP)
});
```

**Аналог в Java**:
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String email;
    private String password;
    private String phone;
    private LocalDateTime emailVerifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

#### 2. `roles` и `role_user` — система ролей (Many-to-Many)

```php
// roles — таблица с ролями
Schema::create('roles', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique(); // admin, employee, client
    $table->timestamps();
});

// role_user — таблица связи Many-to-Many
Schema::create('role_user', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('role_id')->constrained()->onDelete('cascade');
    $table->timestamps();
    $table->unique(['user_id', 'role_id']); // нельзя добавить одну роль дважды
});
```

**Что делает `constrained()`?**
- Создает **внешний ключ (FK)** на таблицу `users` и `roles`
- При удалении пользователя/роли — автоматически удаляются связи (`onDelete('cascade')`)

**Аналог в Java**:
```java
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    
    @ManyToMany(mappedBy = "roles")
    private List<User> users;
}

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToMany
    @JoinTable(
        name = "role_user",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id"),
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "role_id"})
    )
    private List<Role> roles;
}
```

---

#### 3. `personal_access_tokens` — Laravel Sanctum (аутентификация)

```php
Schema::create('personal_access_tokens', function (Blueprint $table) {
    $table->id();
    $table->morphs('tokenable'); // polymorphic relation (user_id, tokenable_type)
    $table->text('name'); // имя токена (например, "auth_token")
    $table->string('token', 64)->unique(); // Bearer token
    $table->text('abilities')->nullable(); // scope токена
    $table->timestamp('last_used_at')->nullable();
    $table->timestamp('expires_at')->nullable();
    $table->timestamps();
});
```

**Что такое polymorphic relation?**
- Полиморфная связь позволяет однй таблице хранить токены для разных сущностей (не только `users`, но и любой другой модели)

**Аналог в Spring**: В Spring Security с JWT токены обычно хранятся отдельно или не хранятся вообще (stateless). Sanctum — это stateful аутентификация с сохранением токенов в БД.

---

#### 4. `genres` — жанры фильмов

```php
Schema::create('genres', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->timestamps();
});
```

---

#### 5. `movies` — фильмы

```php
Schema::create('movies', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('description')->nullable();
    $table->unsignedSmallInteger('release_year'); // 1888 - текущий + 1
    $table->unsignedInteger('duration'); // минуты
    $table->foreignId('genre_id')->constrained()->onDelete('cascade');
    $table->timestamps();
});
```

**`onDelete('cascade')`** — если удалить жанр, все фильмы этого жанра тоже удалятся.

---

#### 6. `dvds` — DVD диски

```php
Schema::create('dvds', function (Blueprint $table) {
    $table->id();
    $table->foreignId('movie_id')->constrained()->onDelete('cascade');
    $table->string('inventory_number')->unique(); // уникальный номер
    $table->string('status')->default('available'); // available, rented, reserved, unavailable
    $table->decimal('price_per_day', 8, 2); // цена в день (8 цифр, 2 после запятой)
    $table->timestamps();
});
```

---

#### 7. `bookings` — бронирования

```php
Schema::create('bookings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('dvd_id')->constrained()->onDelete('cascade');
    $table->date('start_date'); // дата начала
    $table->date('end_date'); // дата окончания
    $table->string('status')->default('active'); // active, cancelled, completed
    $table->timestamps();
});
```

---

#### 8. `rentals` — аренды (фактическая выдача DVD)

```php
Schema::create('rentals', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('dvd_id')->constrained()->onDelete('cascade');
    $table->foreignId('booking_id')->nullable()->constrained()->onDelete('set null');
    $table->timestamp('issued_at'); // когда выдан
    $table->timestamp('returned_at')->nullable(); // когда возвращен
    $table->string('status')->default('active'); // active, returned, overdue
    $table->decimal('price', 8, 2); // стоимость
    $table->timestamps();
});
```

**`onDelete('set null')`** — если удалить бронирование, аренда останется, но `booking_id` будет NULL.

---

#### 9. `blocks` — блокировки пользователей

```php
Schema::create('blocks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('reason'); // причина
    $table->timestamp('expires_at')->nullable(); // если NULL — навсегда
    $table->timestamps();
});
```

---

## 📦 Модели (Models)

### Что такое Eloquent Model?

**Model** — это PHP класс, который представляет таблицу БД и предоставляет удобный API для работы с данными.

**Аналог в Spring**: `@Entity` класс с JPA Repository, но методы `save()`, `delete()`, `where()` встроены в модель.

### Создание модели

```bash
php artisan make:model Movie
```

Создаст файл `app/Models/Movie.php`.

### Синтаксис атрибутов (PHP 8+)

```php
#[Fillable(['title', 'description', 'release_year', 'duration', 'genre_id'])]
class Movie extends Model
{
    //
}
```

**`#[Fillable]`** — какие поля можно массово заполнять через `create()` или `fill()`.
**Аналог в Spring**: `@Data` + `@Setter` — все поля доступны для установки.

**Почему это важно?**
- Защита от mass assignment атак
- Нельзя через `Movie::create($request->all())` изменить поля, не указанные в `fillable`

---

### Модель User

```php
#[Fillable(['name', 'email', 'password', 'phone'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed', // автоматически хэшируется при сохранении
        ];
    }

    // Связь Many-to-Many с ролями
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    // Связь One-to-Many с бронированиями
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    // Связь One-to-Many с арендами
    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    // Связь One-to-Many с блокировками
    public function blocks(): HasMany
    {
        return $this->hasMany(Block::class);
    }

    // Связь Many-to-Many с DVD через бронирования
    public function bookedDvds(): BelongsToMany
    {
        return $this->belongsToMany(Dvd::class, 'bookings')
            ->withPivot(['start_date', 'end_date', 'status'])
            ->withTimestamps();
    }
}
```

**Что делает `withPivot()`?**
- Добавляет поля из таблицы связи (`bookings`) в результат
- Аналог `@JoinTable` в JPA

---

### Модель Booking

```php
#[Fillable(['user_id', 'dvd_id', 'start_date', 'end_date', 'status'])]
class Booking extends Model
{
    // Связь: Бронирование принадлежит пользователю
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Связь: Бронирование принадлежит DVD
    public function dvd(): BelongsTo
    {
        return $this->belongsTo(Dvd::class);
    }

    // Связь: У бронирования может быть одна аренда
    public function rental(): HasOne
    {
        return $this->hasOne(Rental::class);
    }
}
```

**Сравнение с Spring**:

```java
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "dvd_id")
    private Dvd dvd;
    
    @OneToOne(mappedBy = "booking")
    private Rental rental;
}
```

---

## 🎛️ Контроллеры (Controllers)

### Что такое Controller?

**Controller** — это класс, который обрабатывает HTTP запросы и возвращает ответы.

**Аналог в Spring**: `@RestController` класс.

### Базовый контроллер

```php
abstract class Controller
{
    //
}
```

Все остальные контроллеры наследуются от этого класса.

### Создание контроллера

```bash
php artisan make:controller MovieController
```

Создаст файл `app/Http/Controllers/MovieController.php`.

---

### AuthController — аутентификация

```php
class AuthController extends Controller
{
    // 1. Регистрация
    public function register(Request $request)
    {
        // Валидация данных (аналог @Valid)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
        ]);

        // Создание пользователя
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']), // хэширование
            'phone' => $validated['phone'] ?? null,
        ]);

        // Создание Sanctum токена (аналог JWT)
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Пользователь успешно зарегистрирован',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    // 2. Вход
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Проверка учетных данных (аналог AuthenticationManager)
        if (!Auth::attempt(['email' => $validated['email'], 'password' => $validated['password']])) {
            throw ValidationException::withMessages([
                'email' => ['Предоставленные учетные данные неверны.'],
            ]);
        }

        $user = User::where('email', $validated['email'])->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Авторизация прошла успешно',
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    // 3. Выход (отзыв токена)
    public function logout(Request $request)
    {
        // Удаляем текущий токен
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Вы успешно вышли из системы',
        ], 200);
    }

    // 4. Получение текущего пользователя
    public function me(Request $request)
    {
        // Возвращаем пользователя с ролями
        return response()->json($request->user()->load('roles'));
    }
}
```

**Ключевые моменты**:

1. **`$request->validate()`** — валидация входных данных. Если валидация не прошла — автоматически возвращается 422 с ошибками.
2. **`User::create()`** — создание и сохранение модели. Аналог `repository.save()`.
3. **`Hash::make()`** — хэширование пароля (не храним в открытом виде).
4. **`$user->createToken()`** — создание API токена через Laravel Sanctum.
5. **`response()->json()`** — возврат JSON ответа.

---

### UserController — управление пользователями

```php
class UserController extends Controller
{
    // Получить всех пользователей с ролями
    public function index()
    {
        // Eager loading ролей (аналог @EntityGraph или JOIN FETCH)
        return response()->json(User::with('roles')->get(), 200);
    }

    // Создать пользователя
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id', // каждый ID должен существовать
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
        ]);

        // Привязка ролей (аналог addRole() в сервисе)
        if (!empty($validated['role_ids'])) {
            $user->roles()->sync($validated['role_ids']);
        }

        return response()->json([
            'message' => 'Пользователь успешно создан',
            'user' => $user->load('roles'),
        ], 201);
    }

    // Назначить роль пользователю
    public function assignRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        // syncWithoutDetaching — добавить роль, не удаляя остальные
        $user->roles()->syncWithoutDetaching([$validated['role_id']]);

        return response()->json([
            'message' => 'Роль успешно назначена',
            'user' => $user->load('roles'),
        ], 200);
    }

    // Удалить роль у пользователя
    public function removeRole(User $user, Role $role)
    {
        $user->roles()->detach($role->id);

        return response()->json([
            'message' => 'Роль успешно отвязана',
            'user' => $user->load('roles'),
        ], 200);
    }
}
```

**Что такое `sync()`, `syncWithoutDetaching()`, `detach()`?**

| Метод | Действие | Аналог в Spring |
|-------|----------|-----------------|
| `sync([1, 2, 3])` | Заменить все связи на указанные | `user.setRoles(roleRepository.findAllById(List.of(1,2,3)))` |
| `syncWithoutDetaching([4])` | Добавить, не удаляя старые | `user.getRoles().add(role)` |
| `detach(5)` | Удалить одну связь | `user.getRoles().remove(role)` |

---

### MovieController — фильмы с поиском и фильтрацией

```php
class MovieController extends Controller
{
    // Список фильмов с поиском и фильтрацией
    public function index(Request $request)
    {
        // Начинаем запрос (аналог JpaRepository)
        $query = Movie::with('genre');

        // Поиск по названию (?search=Терминатор)
        if ($request->has('search') && !empty($request->search)) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Фильтрация по жанру (?genre_id=1)
        if ($request->has('genre_id') && !empty($request->genre_id)) {
            $query->where('genre_id', $request->genre_id);
        }

        return response()->json($query->get(), 200);
    }

    // Создать фильм
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'release_year' => 'required|integer|min:1888|max:' . (date('Y') + 1),
            'duration' => 'required|integer|min:1',
            'genre_id' => 'required|exists:genres,id',
        ]);

        $movie = Movie::create($validated);

        return response()->json([
            'message' => 'Фильм успешно создан',
            'movie' => $movie->load('genre'),
        ], 201);
    }
}
```

**Что делает `with('genre')`?**
- **Eager loading** — загружает связанные данные за один запрос (аналог `JOIN FETCH` в JPA)
- Без этого будет N+1 запрос (запрос к БД для каждого фильма)

**Аналог в Spring**:
```java
@EntityGraph(attributePaths = "genre")
Movie findAllById(Long id);
```

---

### BookingController — бронирование с бизнес-логикой

```php
class BookingController extends Controller
{
    // Список бронирований текущего пользователя
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Booking::with(['dvd.movie', 'user']);

        // Проверка прав: клиент видит только свои бронирования
        if (!$user->roles()->whereIn('name', ['admin', 'employee'])->exists()) {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get(), 200);
    }

    // Создание бронирования (с проверками)
    public function store(Request $request)
    {
        $user = $request->user();

        // Проверка: заблокирован ли пользователь
        $isBlocked = Block::where('user_id', $user->id)
            ->where(function ($query) {
                $query->whereNull('expires_at') // NULL = навсегда
                    ->orWhere('expires_at', '>', now()); // или в будущем
            })
            ->exists();

        if ($isBlocked) {
            return response()->json([
                'message' => 'Пользователь заблокирован',
            ], 403);
        }

        // Валидация
        $validated = $request->validate([
            'dvd_id' => 'required|exists:dvds,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        try {
            // Выполнение в транзакции (аналог @Transactional)
            $booking = DB::transaction(function () use ($user, $validated) {

                // Пессимистичная блокировка записи (аналог SELECT FOR UPDATE)
                $dvd = Dvd::where('id', $validated['dvd_id'])->lockForUpdate()->firstOrFail();

                // Проверка статуса DVD
                if ($dvd->status === 'unavailable') {
                    throw ValidationException::withMessages([
                        'dvd_id' => ['DVD недоступен для бронирования.'],
                    ]);
                }

                // Проверка пересечения с другими бронированиями
                $hasBookingConflict = Booking::where('dvd_id', $dvd->id)
                    ->where('status', 'active')
                    ->where(function ($query) use ($validated) {
                        $query->where('start_date', '<=', $validated['end_date'])
                            ->where('end_date', '>=', $validated['start_date']);
                    })
                    ->exists();

                if ($hasBookingConflict) {
                    throw ValidationException::withMessages([
                        'dvd_id' => ['DVD уже забронирован на выбранный период.'],
                    ]);
                }

                // Проверка: не находится ли DVD в активной аренде
                $hasRentalConflict = Rental::where('dvd_id', $dvd->id)
                    ->where('status', 'active')
                    ->whereNull('returned_at')
                    ->exists();

                if ($hasRentalConflict) {
                    throw ValidationException::withMessages([
                        'dvd_id' => ['DVD в данный момент находится в аренде.'],
                    ]);
                }

                // Создание бронирования
                return Booking::create([
                    'user_id' => $user->id,
                    'dvd_id' => $dvd->id,
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date'],
                    'status' => 'active',
                ]);
            });

            return response()->json([
                'message' => 'Бронирование успешно создано',
                'booking' => $booking->load('dvd.movie'),
            ], 201);

        } catch (ValidationException $e) {
            throw $e; // возврат 422 с ошибками валидации
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка: ' . $e->getMessage(),
            ], 500);
        }
    }
}
```

**Ключевые бизнес-правила**:

1. **Заблокированный пользователь не может бронировать**
   - Проверка `Block` с учетом срока действия

2. **Проверка доступности DVD**
   - Статус не `unavailable`
   - Нет активных бронирований в пересекающийся период
   - Нет активной аренды

3. **Конкурентный доступ**
   - `lockForUpdate()` — блокирует запись DVD в БД до завершения транзакции
   - `DB::transaction()` — откат изменений при ошибке

**Аналог в Spring**:

```java
@Transactional
public Booking createBooking(Long userId, BookingRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("User not found"));
    
    // Проверка блокировки
    if (blockRepository.existsByUserIdAndExpiresAtAfterOrIsNull(userId, LocalDateTime.now())) {
        throw new BusinessRuleException("User is blocked");
    }
    
    Dvd dvd = dvdRepository.findById(request.getDvdId())
        .orElseThrow(() -> new NotFoundException("DVD not found"));
    
    // Блокировка записи (аналог lockForUpdate)
    dvd = dvdRepository.findByIdForUpdate(dvd.getId());
    
    // Проверки...
    
    Booking booking = new Booking();
    booking.setUser(user);
    booking.setDvd(dvd);
    booking.setStartDate(request.getStartDate());
    booking.setEndDate(request.getEndDate());
    booking.setStatus(BookingStatus.ACTIVE);
    
    return bookingRepository.save(booking);
}
```

---

### RentalController — выдача и возврат DVD

```php
class RentalController extends Controller
{
    // Выдача DVD (аналог "оформить аренду")
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'dvd_id' => 'required|exists:dvds,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'days' => 'nullable|integer|min:1', // если без бронирования
        ]);

        try {
            $rental = DB::transaction(function () use ($validated) {
                // Блокировка DVD
                $dvd = Dvd::where('id', $validated['dvd_id'])->lockForUpdate()->firstOrFail();

                // Проверка доступности
                if ($dvd->status === 'rented') {
                    throw ValidationException::withMessages([
                        'dvd_id' => ['DVD уже в аренде.'],
                    ]);
                }

                if ($dvd->status === 'unavailable') {
                    throw ValidationException::withMessages([
                        'dvd_id' => ['DVD недоступен.'],
                    ]);
                }

                $rentalDays = $validated['days'] ?? 1;

                // Если есть бронирование
                if (!empty($validated['booking_id'])) {
                    $booking = Booking::findOrFail($validated['booking_id']);

                    if ($booking->status !== 'active') {
                        throw ValidationException::withMessages([
                            'booking_id' => ['Бронирование не активно.'],
                        ]);
                    }

                    // Расчет дней из дат бронирования
                    $startDate = Carbon::parse($booking->start_date);
                    $endDate = Carbon::parse($booking->end_date);
                    $rentalDays = max(1, $startDate->diffInDays($endDate));

                    // Завершаем бронирование
                    $booking->update(['status' => 'completed']);
                }

                // Расчет стоимости (дни × цена за день)
                $totalPrice = $rentalDays * $dvd->price_per_day;

                // Создание записи аренды
                $newRental = Rental::create([
                    'user_id' => $validated['user_id'],
                    'dvd_id' => $dvd->id,
                    'booking_id' => $validated['booking_id'] ?? null,
                    'issued_at' => now(),
                    'status' => 'active',
                    'price' => $totalPrice,
                ]);

                // Изменение статуса DVD
                $dvd->update(['status' => 'rented']);

                return $newRental;
            });

            return response()->json([
                'message' => 'Выдача DVD успешно оформлена',
                'rental' => $rental->load(['user', 'dvd.movie', 'booking']),
            ], 201);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Возврат DVD
    public function update(Request $request, Rental $rental)
    {
        if ($rental->status === 'returned') {
            return response()->json([
                'message' => 'DVD уже возвращен',
            ], 400);
        }

        DB::transaction(function () use ($rental) {
            $dvd = Dvd::where('id', $rental->dvd_id)->lockForUpdate()->firstOrFail();

            // Обновление аренды
            $rental->update([
                'status' => 'returned',
                'returned_at' => now(),
            ]);

            // Возврат DVD в доступные
            $dvd->update(['status' => 'available']);
        });

        return response()->json([
            'message' => 'Возврат оформлен',
            'rental' => $rental->fresh()->load(['user', 'dvd.movie']),
        ], 200);
    }
}
```

**Бизнес-логика**:

1. **Выдача DVD**:
   - Проверяем, что DVD не занят
   - Если есть бронирование — берем дни из него, завершаем бронирование
   - Если нет бронирования — берем из параметра `days`
   - Рассчитываем стоимость: `дни × цена_за_день`
   - Меняем статус DVD на `rented`

2. **Возврат DVD**:
   - Меняем статус аренды на `returned`, записываем `returned_at`
   - Меняем статус DVD на `available`

**Аналог в Spring**:

```java
@Transactional
public Rental issueDvd(Long userId, IssueDvdRequest request) {
    User user = userRepository.findById(request.getUserId())
        .orElseThrow();
    
    Dvd dvd = dvdRepository.findById(request.getDvdId())
        .orElseThrow();
    
    dvd = dvdRepository.findByIdForUpdate(dvd.getId());
    
    if (dvd.getStatus() == DvdStatus.RENTED) {
        throw new BusinessRuleException("DVD already rented");
    }
    
    int days = request.getDays() != null ? request.getDays() : 1;
    
    if (request.getBookingId() != null) {
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow();
        
        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new BusinessRuleException("Booking not active");
        }
        
        days = (int) ChronoUnit.DAYS.between(
            booking.getStartDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
            booking.getEndDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
        );
        
        booking.setStatus(BookingStatus.COMPLETED);
    }
    
    BigDecimal price = BigDecimal.valueOf(days).multiply(dvd.getPricePerDay());
    
    Rental rental = new Rental();
    rental.setUser(user);
    rental.setDvd(dvd);
    rental.setBooking(request.getBookingId() != null ? 
        bookingRepository.findById(request.getBookingId()).orElse(null) : null);
    rental.setIssuedAt(LocalDateTime.now());
    rental.setStatus(RentalStatus.ACTIVE);
    rental.setPrice(price);
    
    dvd.setStatus(DvdStatus.RENTED);
    
    return rentalRepository.save(rental);
}
```

---

### BlockController — блокировки

```php
class BlockController extends Controller
{
    // Список активных блокировок
    public function index()
    {
        // Активная блокировка: expires_at IS NULL ИЛИ в будущем
        $activeBlocks = Block::with('user')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($activeBlocks, 200);
    }

    // Создать блокировку
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'reason' => 'required|string|max:255',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $block = Block::create($validated);

        return response()->json([
            'message' => 'Пользователь заблокирован',
            'block' => $block->load('user'),
        ], 201);
    }

    // Удалить (снять) блокировку
    public function destroy(Block $block)
    {
        $block->delete();

        return response()->json([
            'message' => 'Блокировка снята',
        ], 200);
    }
}
```

---

## 🔗 Маршруты (Routes)

### Файл `routes/api.php`

```php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlockController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DvdController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Публичные маршруты (без аутентификации)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/genres', [GenreController::class, 'index']);
Route::get('/genres/{genre}', [GenreController::class, 'show']);

Route::get('/movies', [MovieController::class, 'index']);
Route::get('/movies/{movie}', [MovieController::class, 'show']);

Route::get('/dvds', [DvdController::class, 'index']);
Route::get('/dvds/{dvd}', [DvdController::class, 'show']);

// Защищенные маршруты (требуют аутентификации)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::apiResource('roles', RoleController::class);
    Route::apiResource('users', UserController::class);
    Route::post('/users/{user}/roles', [UserController::class, 'assignRole']);
    Route::delete('/users/{user}/roles/{role}', [UserController::class, 'removeRole']);

    Route::post('/genres', [GenreController::class, 'store']);
    Route::put('/genres/{genre}', [GenreController::class, 'update']);
    Route::delete('/genres/{genre}', [GenreController::class, 'destroy']);

    Route::post('/movies', [MovieController::class, 'store']);
    Route::put('/movies/{movie}', [MovieController::class, 'update']);
    Route::delete('/movies/{movie}', [MovieController::class, 'destroy']);

    Route::post('/dvds', [DvdController::class, 'store']);
    Route::put('/dvds/{dvd}', [DvdController::class, 'update']);
    Route::delete('/dvds/{dvd}', [DvdController::class, 'destroy']);

    Route::apiResource('bookings', BookingController::class);
    Route::apiResource('blocks', BlockController::class)->except(['update']);

    Route::apiResource('rentals', RentalController::class);
});
```

### Что делает `Route::apiResource()`?

Создает стандартные REST endpoint'ы:

| Метод | Путь | Метод контроллера | Описание |
|-------|------|------------------|----------|
| GET | `/api/roles` | `index()` | Список |
| POST | `/api/roles` | `store()` | Создание |
| GET | `/api/roles/{role}` | `show()` | Детали |
| PUT | `/api/roles/{role}` | `update()` | Обновление |
| DELETE | `/api/roles/{role}` | `destroy()` | Удаление |

**`->except(['update'])`** — исключает метод `update()` (блокировки нельзя редактировать).

### Route Model Binding

```php
// В контроллере:
public function show(Movie $movie)
{
    return response()->json($movie);
}

// Laravel автоматически найдет Movie по ID из URL:
// GET /api/movies/5 -> Laravel выполнит Movie::findOrFail(5)
```

**Аналог в Spring**: `@PathVariable` + `@EntityGraph`, но в Spring нужно писать код вручную.

---

## 🔐 Аутентификация и Авторизация

### Laravel Sanctum

** Sanctum** — это легковесная система аутентификации для SPA и API.

#### Как работает?

1. Пользователь логинится (`POST /api/login`)
2. Sanctum создает **personal access token** в таблице `personal_access_tokens`
3. Токен возвращается клиенту (в ответе JSON)
4. Клиент отправляет токен в заголовке `Authorization: Bearer <token>`
5. Middleware `auth:sanctum` проверяет токен и загружает пользователя

#### Сравнение с Spring Security + JWT

| Концепт | Spring Security + JWT | Laravel Sanctum |
|---------|----------------------|-----------------|
| **Токен** | JWT (самодостаточный) | Access token (хранится в БД) |
| **Хранение** | Клиент (localStorage) | Сервер (DB) |
| **Проверка** | Подпись токена | Запрос к БД |
| **Отзыв** | Через черный список | Удаление из БД |
| **Состояние** | Stateless | Stateful (с БД) |

**Почему Sanctum?**
- Проще в настройке, чем OAuth2
- Хорош для SPA (React/Vue)
- Не нужно хранить секретный ключ на сервере (как JWT)

---

### Проверка прав (Authorization)

#### Встроенные проверки в контроллерах

```php
// Пример из BookingController
public function index(Request $request)
{
    $user = $request->user();

    // Проверка: клиент видит только свои бронирования
    if (!$user->roles()->whereIn('name', ['admin', 'employee'])->exists()) {
        $query->where('user_id', $user->id);
    }

    return response()->json($query->get(), 200);
}
```

**Что делает `exists()`?**
- Возвращает `true`, если хотя бы одна роль совпадает
- Аналог `user.hasRole('ADMIN') || user.hasRole('EMPLOYEE')`

#### Принцип работы прав:

| Роль | Что может |
|------|----------|
| **Client** | Бронировать DVD, смотреть свои бронирования/аренды, фильмы |
| **Employee** | Всё, что Client + управление фильмами/DVD, выдача/возврат |
| **Admin** | Всё, что Employee + управление пользователями и блокировками |

---

## 🧪 Валидация (Validation)

### Встроенная валидация Laravel

```php
$validated = $request->validate([
    'email' => 'required|email|max:255|unique:users',
    'password' => 'required|string|min:8',
    'phone' => 'nullable|string|max:20',
]);
```

### Правила валидации

| Правило | Описание | Пример |
|---------|----------|--------|
| `required` | Поле обязательно | `'name' => 'required'` |
| `email` | Проверка email | `'email' => 'email'` |
| `max:255` | Максимальная длина | `'name' => 'max:255'` |
| `unique:users` | Уникальность в таблице | `'email' => 'unique:users'` |
| `exists:roles,id` | Существование в таблице | `'role_id' => 'exists:roles,id'` |
| `nullable` | Поле может быть NULL | `'phone' => 'nullable'` |
| `after:today` | Дата после сегодня | `'start_date' => 'after:today'` |
| `required_without:other` | Обязательно, если другое пусто | `'field' => 'required_without:other'` |

### Rule::unique() для обновления

```php
use Illuminate\Validation\Rule;

$validated = $request->validate([
    'email' => [
        'required',
        'email',
        Rule::unique('users', 'email')->ignore($user->id),
    ],
]);
```

**Почему нужно игнорировать ID при обновлении?**
- Иначе валидация будет ругаться на собственный email пользователя

---

## 🏗️ Бизнес-логика: ключевые сценарии

### Сценарий 1: Клиент бронирует DVD

1. **Проверка блокировки**
   ```php
   $isBlocked = Block::where('user_id', $user->id)
       ->where(function ($query) {
           $query->whereNull('expires_at')
               ->orWhere('expires_at', '>', now());
       })
       ->exists();
   ```

2. **Валидация дат**
   ```php
   'start_date' => 'required|date|after_or_equal:today',
   'end_date' => 'required|date|after_or_equal:start_date',
   ```

3. **Проверка доступности DVD**
   - Статус не `unavailable`
   - Нет пересекающихся активных бронирований
   - Нет активной аренды

4. **Конкурентный доступ**
   ```php
   DB::transaction(function () use ($dvdId) {
       $dvd = Dvd::where('id', $dvdId)->lockForUpdate()->firstOrFail();
       // ... проверки и создание
   });
   ```

**Аналог в Spring**:
```java
@Transactional
public Booking bookDvd(Long userId, BookingRequest request) {
    // Проверка блокировки
    if (blockRepository.existsByUserIdAndExpiresAtAfterOrIsNull(userId, now())) {
        throw new BusinessRuleException("User is blocked");
    }
    
    // Валидация
    
    // Блокировка и проверка
    Dvd dvd = dvdRepository.findByIdForUpdate(request.getDvdId());
    
    // Проверки
    
    return bookingRepository.save(booking);
}
```

---

### Сценарий 2: Сотрудник выдает DVD

1. **Получение параметров**
   - `user_id` — кто получает
   - `dvd_id` — какой DVD
   - `booking_id` — есть ли бронирование
   - `days` — если без бронирования

2. **Проверка доступности**
   ```php
   if ($dvd->status === 'rented') {
       throw ValidationException::withMessages([
           'dvd_id' => ['DVD уже в аренде.'],
       ]);
   }
   ```

3. **Расчет стоимости**
   ```php
   $rentalDays = $validated['days'] ?? 1;
   
   if (!empty($validated['booking_id'])) {
       $booking = Booking::findOrFail($validated['booking_id']);
       $rentalDays = max(1, $startDate->diffInDays($endDate));
       $booking->update(['status' => 'completed']);
   }
   
   $totalPrice = $rentalDays * $dvd->price_per_day;
   ```

4. **Создание записи**
   ```php
   Rental::create([
       'user_id' => $validated['user_id'],
       'dvd_id' => $dvd->id,
       'booking_id' => $validated['booking_id'] ?? null,
       'issued_at' => now(),
       'status' => 'active',
       'price' => $totalPrice,
   ]);
   
   $dvd->update(['status' => 'rented']);
   ```

---

### Сценарий 3: Сотрудник принимает возврат

1. **Проверка статуса**
   ```php
   if ($rental->status === 'returned') {
       return response()->json([
           'message' => 'DVD уже возвращен',
       ], 400);
   }
   ```

2. **Обновление**
   ```php
   DB::transaction(function () use ($rental) {
       $dvd = Dvd::where('id', $rental->dvd_id)->lockForUpdate()->firstOrFail();
       
       $rental->update([
           'status' => 'returned',
           'returned_at' => now(),
       ]);
       
       $dvd->update(['status' => 'available']);
   });
   ```

---

## 🚀 Как запустить проект

### 1. Установка зависимостей

```bash
cd dvd-rental
composer install
```

**Аналог `npm install` или `mvn dependency:resolve`**

---

### 2. Настройка БД

Создать файл `.env` на основе `.env.example`:

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dvd_rental
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

---

### 3. Миграции

```bash
php artisan migrate
```

**Аналог `flyway migrate` или `mvn liquibase:migrate`**

Laravel выполнит все миграции из `database/migrations/` и создаст таблицы.

---

### 4. Генерация ключа приложения

```bash
php artisan key:generate
```

Создаст `APP_KEY` в `.env` (используется для шифрования токенов).

---

### 5. Запуск сервера

```bash
php artisan serve
```

Запустит сервер на `http://localhost:8000`.

---

## 📋 Полезные команды artisan

| Команда | Описание |
|---------|----------|
| `php artisan make:model ModelName` | Создать модель |
| `php artisan make:controller ControllerName` | Создать контроллер |
| `php artisan make:migration create_table_name` | Создать миграцию |
| `php artisan migrate` | Выполнить миграции |
| `php artisan migrate:fresh` | Пересоздать БД (удалить + создать) |
| `php artisan db:seed` | Заполнить тестовыми данными |
| `php artisan tinker` | Интерактивная консоль (аналог `mvn spring-boot:run` с debug) |

---

## ❓ FAQ (Часто задаваемые вопросы)

### Вопрос 1: Почему Laravel, а не Spring?

**Ответ**: В проекте Laravel выбран потому что:
- Быстрая разработка (меньше шаблонного кода)
- Встроенные решения (мigrations, validation, auth)
- Простота для небольших команд
- Хорошая документация

**Но Spring имеет преимущество**:
- Типобезопасность (Java)
- Лучшая производительность
- Более зрелая экосистема
- Легче масштабировать

---

### Вопрос 2: Почему PostgreSQL, а не MySQL?

**Ответ**: В проекте PostgreSQL используется по умолчанию (из README). Laravel поддерживает обе СУБД через одну конфигурацию.

**Конфигурация в `config/database.php`**:
```php
'pgsql' => [
    'driver' => 'pgsql',
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '5432'),
    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
],
```

---

### Вопрос 3: Почему нет Service слоя?

**Ответ**: В этом проекте логика находится в контроллерах. Это упрощенный подход для небольших проектов.

**Правильный подход (аналог Spring)**:
```
Controller → Service → Repository → Entity
```

**В текущем проекте**:
```
Controller → Model (Repository + Entity + Service)
```

**Рефакторинг для Spring-стиля**:
```php
// app/Services/BookingService.php
class BookingService
{
    public function createBooking(User $user, CreateBookingRequest $request): Booking
    {
        // вся бизнес-логика
    }
}

// app/Http/Controllers/BookingController.php
class BookingController extends Controller
{
    public function store(BookingService $service, Request $request)
    {
        return response()->json($service->createBooking($request->user(), $request), 201);
    }
}
```

---

### Вопрос 4: Почему нет Policy?

**Ответ**: В проекте авторизация через inline-проверки в контроллерах (`if (!$user->hasRole('ADMIN'))`).

**Современный подход (Laravel Policies)**:
```bash
php artisan make:policy MoviePolicy --model=Movie
```

```php
// app/Policies/MoviePolicy.php
class MoviePolicy
{
    public function update(User $user, Movie $movie): bool
    {
        return $user->hasRole('admin') || $user->hasRole('employee');
    }
}

// В контроллере
public function update(Request $request, Movie $movie)
{
    $this->authorize('update', $movie); // выбросит 403, если нельзя
    // ...
}
```

---

### Вопрос 5: Как добавить новую функциональность?

**Пример: добавить отзыв к фильму**

1. **Создать миграцию**
   ```bash
   php artisan make:migration create_reviews_table
   ```

2. **Создать модель**
   ```bash
   php artisan make:model Review
   ```

3. **Создать контроллер**
   ```bash
   php artisan make:controller ReviewController
   ```

4. **Добавить маршрут**
   ```php
   Route::apiResource('reviews', ReviewController::class);
   ```

5. **Добавить валидацию и логику**

---

## 📚 Дополнительные ресурсы

### Laravel Documentation
- [Official Docs](https://laravel.com/docs) — официальная документация
- [Eloquent ORM](https://laravel.com/docs/eloquent) — работа с моделями
- [Validation](https://laravel.com/docs/validation) — валидация
- [Sanctum](https://laravel.com/docs/sanctum) — аутентификация

### Для Java разработчиков
- [Laravel for Spring Developers](https://laravel.com/docs/spring) — сравнение концепций

---

## ✅ Заключение

Это руководство охватывает все ключевые аспекты Laravel backend системы DVD Rental.

**Что важно запомнить**:

1. **Laravel = PHP аналог Spring Boot**
2. **Model = Entity + Repository** (встроено)
3. **Controller = @RestController**
4. **Validation = $request->validate()**
5. **Transactions = DB::transaction()**
6. **Auth = Sanctum (Bearer токены)**

**Если вы знаете Spring, вам будет легко разобраться в Laravel** — просто другие названия и синтаксис.

---

**Удачи с отчетом! 🎬**