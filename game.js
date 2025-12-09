// ============================================
// СОСТОЯНИЕ ИГРЫ
// ============================================
let gameState = {
    ideas: 0,
    fame: 0,
    knowledge: 0,
    writers: 0,
    researchers: 0,
    factsFound: 0,
    writerLevel: 1,
    upgrades: [],
    hasPublished: false,
    hasWriterUnlocked: false,
    isWriterHired: false,
    hasResearcherUnlocked: false,
    isResearcherHired: false,
    lastSave: Date.now()
};

// ============================================
// DOM ЭЛЕМЕНТЫ
// ============================================
const ideasEl = document.getElementById('ideas');
const fameEl = document.getElementById('fame');
const writersEl = document.getElementById('writers');
const knowledgeEl = document.getElementById('knowledge');
const researchersEl = document.getElementById('researchers');
const logEl = document.getElementById('log');

// Создаём контейнер для сообщений
const logContent = document.createElement('div');
logContent.className = 'log-content';
logEl.appendChild(logContent);

// ============================================
// БАЗА ДАННЫХ
// ============================================
const facts = [
    "Грех #001: Гордыня. Статистика показывает, что 92% водителей считают своё вождение лучше среднего.",
    "Архив. Найдена запись: 'Они не хотели, чтобы это стало известно. Цена правды — молчание.'",
    "Слух. В отделе говорят, что предыдущий главный редактор исчез после публикации факта #777.",
    "Анализ. Чревоугодие - единственный грех, который требует ежеминутного подтверждения.",
    "Заметка. Зависть — это когда ты считаешь чужие цифры вместо своих.",
    "Отчёт. Лень: 78% гениальных идей теряются между 'сделаю завтра' и 'а нужно ли?'.",
    "Шёпот. Говорят, Семьям правят не короли, а те, кто пишет о них факты.",
    "Расследование. Алчность: 99% людей готовы солгать за сумму, равную их трёхмесячному доходу.",
    "Наблюдение. Гнев — единственная эмоция, которую можно измерить в децибелах.",
    "Откровение. Похоть отвечает за 83% необдуманных решений в истории человечества."
];

const writerMessages = [
    "Писатель: 'Нашёл упоминание о Факте #666... Его изъяли из всех архивов.'",
    "Писатель: 'Кто-то был в нашем архиве ночью. Файлы переставлены.'",
    "Писатель: 'Следы ведут к организации \"Инквизиция 2.0\". Шутка? Не думаю.'",
    "Писатель: 'Проверил источники. Факт #434 был удалён по приказу свыше.'",
    "Писатель: 'Нашёл старую печатную машинку. На ней застыла последняя буква 'П'...'"
];

// ============================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================

// Функция добавления записи в лог (НОВАЯ ВЕРСИЯ)
function addLog(text, isCommand = false) {
    const p = document.createElement('p');
    
    if (isCommand) {
        // Для команд передаём готовую разметку
        p.innerHTML = text;
        
        // Находим все команды в тексте и добавляем обработчики
        setTimeout(() => {
            const cmdSpans = p.querySelectorAll('.cmd');
            cmdSpans.forEach(span => {
                const id = span.id;
                if (id) {
                    // Для каждой команды ищем соответствующую функцию
                    if (id === 'cmd-publish-safe') {
                        span.addEventListener('click', publishSafe);
                    } else if (id === 'cmd-publish-risky') {
                        span.addEventListener('click', publishRisky);
                    } else if (id === 'cmd-hire-check') {
                        span.addEventListener('click', checkHireConditions);
                    } else if (id === 'cmd-hire-writer') {
                        span.addEventListener('click', hireWriter);
                    } else if (id === 'cmd-upgrade-writer') {
                        span.addEventListener('click', upgradeWriter);
                    } else if (id === 'cmd-hire-researcher') {
                        span.addEventListener('click', hireResearcher);
                    }
                }
            });
        }, 10);
    } else {
        p.innerHTML = `> ${text}`;
    }
    
    // Вставляем новое сообщение В НАЧАЛО контейнера
    if (logContent.firstChild) {
        logContent.insertBefore(p, logContent.firstChild);
    } else {
        logContent.appendChild(p);
    }
    
    // Скроллим к верху (новые сообщения видны сразу)
    logEl.scrollTop = 0;
}

// Функция для мыслей персонажа
function addThought(text) {
    const p = document.createElement('p');
    p.className = 'thought';
    p.innerHTML = `> ${text}`;
    
    if (logContent.firstChild) {
        logContent.insertBefore(p, logContent.firstChild);
    } else {
        logContent.appendChild(p);
    }
    
    logEl.scrollTop = 0;
}

// Обновление статус-бара
function updateStatus() {
    ideasEl.textContent = Math.floor(gameState.ideas);
    fameEl.textContent = Math.floor(gameState.fame);
    writersEl.textContent = gameState.writers;
    knowledgeEl.textContent = gameState.knowledge.toFixed(1);
    researchersEl.textContent = gameState.researchers;
}

// Показать случайный факт
function getRandomFact() {
    return facts[Math.floor(Math.random() * facts.length)];
}

// ============================================
// ИГРОВЫЕ МЕХАНИКИ
// ============================================

// Основное действие: найти факт
document.getElementById('cmd-click').addEventListener('click', function(e) {
    e.preventDefault();
    gameState.ideas += 1;
    gameState.factsFound += 1;
    updateStatus();

    addLog(`Факт обнаружен: "${getRandomFact()}"`);

    // ТРИГГЕР 1: После первого факта открываем публикацию
    if (gameState.factsFound === 1 && !gameState.hasPublished) {
        addLog("<br>У вас есть материал. Можно попробовать опубликовать и получить славу.");
        addLog("<span class='cmd' id='cmd-publish-safe'>[ ОПУБЛИКОВАТЬ БЕЗОПАСНО (1 идея → 1 слава) ]</span>", true);
    }

    // ТРИГГЕР 2: После 3 фактов открываем найм писателя
    if (gameState.factsFound >= 3 && !gameState.hasWriterUnlocked) {
        gameState.hasWriterUnlocked = true;
        addLog("<br>Вы накопили достаточно материала. Пора расширяться.");
        addLog("<span class='cmd' id='cmd-hire-check'>[ ПРОВЕРИТЬ, ДОСТАТОЧНО ЛИ СЛАВЫ ДЛЯ НАЙМА? ]</span>", true);
    }
});

// Безопасная публикация
function publishSafe(e) {
    if (e) e.preventDefault();
    if (gameState.ideas >= 1) {
        gameState.ideas -= 1;
        gameState.fame += 1;
        gameState.hasPublished = true;
        updateStatus();
        
        addLog("Вы опубликовали факт. Слава +1.");
        
        if (gameState.fame === 1) {
            addThought("'Первая публикация... Теперь они обратят внимание.'");
        }
        
        // Убираем кнопку безопасной публикации
        const safeBtn = document.querySelector('#cmd-publish-safe');
        if (safeBtn) safeBtn.style.display = 'none';
        
        // Предлагаем рискованный вариант
        addLog("<span class='cmd' id='cmd-publish-risky'>[ ОПУБЛИКОВАТЬ РИСКОВАНО (1 идея → 2 славы, 70% шанс) ]</span>", true);
        
        checkHireConditions();
    } else {
        addLog("Недостаточно идей. Соберите больше фактов.");
    }
}

// Рискованная публикация (70% шанс)
function publishRisky(e) {
    if (e) e.preventDefault();
    if (gameState.ideas >= 1) {
        gameState.ideas -= 1;
        const success = Math.random() < 0.7;
        
        if (success) {
            gameState.fame += 2;
            addLog("Риск оправдан! Факт вызвал сенсацию. Слава +2.");
            addThought("'Это было слишком смело... Но работает.'");
        } else {
            addLog("Провал. Факт сочли фейком. Вы потеряли идею.");
            addThought("'Они следят за каждой публикацией...'");
        }
        
        updateStatus();
        checkHireConditions();
    }
}

// Проверка условий для найма писателя
function checkHireConditions(e) {
    if (e) e.preventDefault();
    
    if (gameState.fame >= 10 && !gameState.isWriterHired && gameState.hasWriterUnlocked) {
        addLog("<br>Накоплено достаточно славы для расширения штата.");
        addLog("<span class='cmd' id='cmd-hire-writer'>[ НАНЯТЬ ПИСАТЕЛЯ (10 СЛАВЫ) ]</span>", true);
    } else if (!gameState.isWriterHired && gameState.hasWriterUnlocked) {
        addLog(`Для найма писателя нужно 10 славы. У вас: ${gameState.fame}. Публикуйте больше фактов.`);
    }
}

// Найм писателя
function hireWriter(e) {
    if (e) e.preventDefault();
    
    if (gameState.fame >= 10) {
        gameState.fame -= 10;
        gameState.writers += 1;
        gameState.isWriterHired = true;
        updateStatus();
        
        addLog("Вы наняли первого писателя. Он будет автоматически генерировать идеи.");
        addThought("'Шеф, я начал разбирать архив. Тут есть... странные совпадения.'");
        
        // Убираем кнопку найма
        const hireBtn = document.querySelector('#cmd-hire-writer');
        if (hireBtn) hireBtn.style.display = 'none';
        
        // Предлагаем улучшение через 2 секунды
        setTimeout(() => {
            addLog("<br>Теперь можно улучшить вашего писателя. Знания накапливаются автоматически.");
            addLog("<span class='cmd' id='cmd-upgrade-writer'>[ ИЗУЧИТЬ МЕТОД «СЛЕПАЯ ПЕЧАТЬ» (5 знаний) ]</span>", true);
        }, 2000);
        
        startPassiveIncome();
    }
}

// Улучшение писателя
function upgradeWriter(e) {
    if (e) e.preventDefault();
    
    if (gameState.knowledge >= 5) {
        gameState.knowledge -= 5;
        gameState.writerLevel += 1;
        gameState.upgrades.push('blind_typing');
        updateStatus();
        
        addLog("Вы обучили писателя методу слепой печати. Теперь он генерирует на 1 идею больше в секунду.");
        addThought("'Скорость работы выросла... но и внимание к нам тоже.'");
        
        // Убираем кнопку
        const btn = document.querySelector('#cmd-upgrade-writer');
        if (btn) btn.style.display = 'none';
        
        // Разблокируем ресерчеров
        unlockResearcher();
        
        // Предлагаем следующее улучшение через 10 секунд
        setTimeout(() => {
            if (gameState.writerLevel < 3) {
                addLog("<span class='cmd' id='cmd-upgrade-writer2'>[ НАЙТИ ИСТОЧНИКИ В ТЁМНОМ НЕТЕ (15 знаний) ]</span>", true);
                // Обработчик добавится автоматически через addLog
            }
        }, 10000);
    } else {
        addLog("Недостаточно знаний. Нужно 5. Знания накапливаются медленно или можно нанять ресерчеров.");
    }
}

// Разблокировка ресерчеров
function unlockResearcher() {
    if (!gameState.hasResearcherUnlocked) {
        gameState.hasResearcherUnlocked = true;
        setTimeout(() => {
            addLog("<br>Доступен новый отдел: ИССЛЕДОВАНИЯ.");
            addLog("Ресерчеры не пишут факты, но изучают архивы, добывая знания для улучшений.");
            addLog("<span class='cmd' id='cmd-hire-researcher'>[ НАНЯТЬ РЕСЕРЧЕРА (25 славы) ]</span>", true);
        }, 3000);
    }
}

// Найм ресерчера
function hireResearcher(e) {
    if (e) e.preventDefault();
    
    if (gameState.fame >= 25) {
        gameState.fame -= 25;
        gameState.researchers += 1;
        gameState.isResearcherHired = true;
        updateStatus();
        
        addLog("Вы наняли ресерчера. Он будет добывать знания из архивов.");
        addThought("'Первая находка: фотография 1973 года. На ней... наш логотип?'");
        
        const btn = document.querySelector('#cmd-hire-researcher');
        if (btn) btn.style.display = 'none';
    } else {
        addLog(`Нужно 25 славы для найма ресерчера. У вас: ${gameState.fame}.`);
    }
}

// Пассивный доход
let passiveInterval;
function startPassiveIncome() {
    if (passiveInterval) return;
    
    let lastMessageTime = Date.now();
    
    passiveInterval = setInterval(() => {
        // Писатели генерируют идеи
        if (gameState.writers > 0) {
            const ideasPerTick = gameState.writers * gameState.writerLevel;
            const oldIdeas = gameState.ideas;
            gameState.ideas += ideasPerTick / 10;
            
            // Случайные сообщения от писателей (не чаще чем раз в 30 секунд)
            const now = Date.now();
            if (Math.floor(gameState.ideas / 15) > Math.floor(oldIdeas / 15) && 
                Math.random() > 0.7 && 
                (now - lastMessageTime) > 30000) {
                const message = writerMessages[Math.floor(Math.random() * writerMessages.length)];
                addLog(`${message}`);
                lastMessageTime = now;
            }
        }
        
        // Ресерчеры генерируют знания
        if (gameState.researchers > 0) {
            gameState.knowledge += gameState.researchers * 0.05;
        }
        
        updateStatus();
    }, 100);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
function initGame() {
    // Очищаем лог
    logContent.innerHTML = '';
    
    // Добавляем начальные сообщения
    addLog("Готов к работе. Нажмите [НАЙТИ ФАКТ], чтобы начать.");
    addLog("Добро пожаловать в редакцию 'Факт'. Вы один. Начните с поиска первого факта.");
    addLog("Система инициализирована.");
    
    updateStatus();
}

// Запуск игры
document.addEventListener('DOMContentLoaded', initGame);
