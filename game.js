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
// Ресурсы
const ideasEl = document.getElementById('ideas');
const fameEl = document.getElementById('fame');
const writersEl = document.getElementById('writers');
const knowledgeEl = document.getElementById('knowledge');
const researchersEl = document.getElementById('researchers');

// Лог
const logEl = document.getElementById('log');

// Кнопки управления
const clickBtn = document.getElementById('cmd-click');
const publishSafeBtn = document.getElementById('cmd-publish-safe');
const publishRiskyBtn = document.getElementById('cmd-publish-risky');
const hireWriterBtn = document.getElementById('cmd-hire-writer');
const hireResearcherBtn = document.getElementById('cmd-hire-researcher');
const upgradeWriterBtn = document.getElementById('cmd-upgrade-writer');
const upgradeWriter2Btn = document.getElementById('cmd-upgrade-writer2');
const saveBtn = document.getElementById('save-game');
const loadBtn = document.getElementById('load-game');
const resetBtn = document.getElementById('reset-game');
const clearLogBtn = document.getElementById('clear-log');

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
// ФУНКЦИИ ЛОГА
// ============================================
function addLog(text, type = 'normal') {
    const message = document.createElement('div');
    message.className = `log-message ${type}`;
    message.innerHTML = `> ${text}`;
    
    // Добавляем в начало лога (новые сверху)
    if (logEl.firstChild) {
        logEl.insertBefore(message, logEl.firstChild);
    } else {
        logEl.appendChild(message);
    }
    
    // Автопрокрутка к новому сообщению
    logEl.scrollTop = 0;
    
    // Ограничиваем количество сообщений
    if (logEl.children.length > 100) {
        logEl.removeChild(logEl.lastChild);
    }
}

function addThought(text) {
    addLog(text, 'thought');
}

function addFact(text) {
    addLog(`Факт: "${text}"`, 'fact');
}

// ============================================
// ФУНКЦИИ ИНТЕРФЕЙСА
// ============================================
function updateStatus() {
    ideasEl.textContent = Math.floor(gameState.ideas);
    fameEl.textContent = Math.floor(gameState.fame);
    writersEl.textContent = gameState.writers;
    knowledgeEl.textContent = gameState.knowledge.toFixed(1);
    researchersEl.textContent = gameState.researchers;
    
    updateButtons();
}

function updateButtons() {
    // Основные действия
    publishSafeBtn.disabled = !gameState.hasPublished || gameState.ideas < 1;
    publishRiskyBtn.disabled = !gameState.hasPublished || gameState.ideas < 1;
    
    // Штат сотрудников
    hireWriterBtn.disabled = !gameState.hasWriterUnlocked || gameState.fame < 10 || gameState.isWriterHired;
    hireResearcherBtn.disabled = !gameState.hasResearcherUnlocked || gameState.fame < 25;
    
    // Улучшения
    upgradeWriterBtn.disabled = gameState.knowledge < 5 || !gameState.isWriterHired;
    upgradeWriter2Btn.disabled = gameState.knowledge < 15 || !gameState.isWriterHired || gameState.writerLevel >= 3;
    
    // Обновляем текст кнопок с актуальными значениями
    hireWriterBtn.textContent = `👥 Нанять писателя (${gameState.fame}/10 славы)`;
    hireResearcherBtn.textContent = `🔍 Нанять исследователя (${gameState.fame}/25 славы)`;
    upgradeWriterBtn.textContent = `⚡ Слепая печать (${gameState.knowledge.toFixed(1)}/5 знаний)`;
    upgradeWriter2Btn.textContent = `🌐 Тёмные архивы (${gameState.knowledge.toFixed(1)}/15 знаний)`;
}

// ============================================
// ИГРОВЫЕ МЕХАНИКИ
// ============================================
function findFact() {
    gameState.ideas += 1;
    gameState.factsFound += 1;
    
    const fact = getRandomFact();
    addFact(fact);
    
    // Триггеры
    if (gameState.factsFound === 1) {
        gameState.hasPublished = true;
        addLog("У вас есть материал. Можно опубликовать факт.");
    }
    
    if (gameState.factsFound >= 3 && !gameState.hasWriterUnlocked) {
        gameState.hasWriterUnlocked = true;
        addLog("Накоплено достаточно материала. Можно нанять писателя.");
    }
    
    updateStatus();
}

function publishSafe() {
    if (gameState.ideas >= 1) {
        gameState.ideas -= 1;
        gameState.fame += 1;
        
        addLog("Вы опубликовали факт. Слава +1.");
        
        if (gameState.fame === 1) {
            addThought("Первая публикация... Теперь они обратят внимание.");
        }
        
        updateStatus();
    }
}

function publishRisky() {
    if (gameState.ideas >= 1) {
        gameState.ideas -= 1;
        const success = Math.random() < 0.7;
        
        if (success) {
            gameState.fame += 2;
            addLog("Риск оправдан! Факт вызвал сенсацию. Слава +2.");
            addThought("Это было слишком смело... Но работает.");
        } else {
            addLog("Провал. Факт сочли фейком. Вы потеряли идею.");
            addThought("Они следят за каждой публикацией...");
        }
        
        updateStatus();
    }
}

function hireWriter() {
    if (gameState.fame >= 10) {
        gameState.fame -= 10;
        gameState.writers += 1;
        gameState.isWriterHired = true;
        
        addLog("Вы наняли писателя. Он будет автоматически генерировать идеи.");
        addThought("Шеф, я начал разбирать архив. Тут есть... странные совпадения.");
        
        startPassiveIncome();
        updateStatus();
    }
}

function hireResearcher() {
    if (gameState.fame >= 25) {
        gameState.fame -= 25;
        gameState.researchers += 1;
        gameState.isResearcherHired = true;
        
        addLog("Вы наняли исследователя. Он будет добывать знания из архивов.");
        addThought("Первая находка: фотография 1973 года. На ней... наш логотип?");
        
        updateStatus();
    }
}

function upgradeWriter() {
    if (gameState.knowledge >= 5) {
        gameState.knowledge -= 5;
        gameState.writerLevel += 1;
        gameState.upgrades.push('blind_typing');
        
        addLog("Вы обучили писателя методу слепой печати. Теперь он генерирует на 1 идею больше в секунду.");
        addThought("Скорость работы выросла... но и внимание к нам тоже.");
        
        if (!gameState.hasResearcherUnlocked) {
            gameState.hasResearcherUnlocked = true;
            setTimeout(() => {
                addLog("Доступен новый отдел: ИССЛЕДОВАНИЯ.");
                addLog("Исследователи не пишут факты, но изучают архивы, добывая знания для улучшений.");
            }, 2000);
        }
        
        updateStatus();
    }
}

function upgradeWriter2() {
    if (gameState.knowledge >= 15) {
        gameState.knowledge -= 15;
        gameState.writerLevel += 2;
        gameState.upgrades.push('dark_web_sources');
        
        addLog("Доступ к тёмным архивам получен. Писатели теперь в 3 раза эффективнее!");
        addThought("Мы зашли слишком далеко, чтобы останавливаться.");
        
        updateStatus();
    }
}

function getRandomFact() {
    return facts[Math.floor(Math.random() * facts.length)];
}

// ============================================
// ПАССИВНЫЙ ДОХОД
// ============================================
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
            
            // Случайные сообщения от писателей
            const now = Date.now();
            if (Math.floor(gameState.ideas / 15) > Math.floor(oldIdeas / 15) && 
                Math.random() > 0.7 && 
                (now - lastMessageTime) > 30000) {
                const message = writerMessages[Math.floor(Math.random() * writerMessages.length)];
                addLog(message);
                lastMessageTime = now;
            }
        }
        
        // Исследователи генерируют знания
        if (gameState.researchers > 0) {
            gameState.knowledge += gameState.researchers * 0.05;
        }
        
        updateStatus();
    }, 100);
}

// ============================================
// СОХРАНЕНИЕ И ЗАГРУЗКА
// ============================================
function saveGame() {
    const saveData = {
        ...gameState,
        lastSave: Date.now()
    };
    
    localStorage.setItem('factFactorySave', JSON.stringify(saveData));
    addLog("Игра сохранена.", 'thought');
}

function loadGame() {
    const saved = localStorage.getItem('factFactorySave');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            
            // Сохраняем только допустимые свойства
            const validKeys = Object.keys(gameState);
            for (const key of validKeys) {
                if (key in loaded) {
                    gameState[key] = loaded[key];
                }
            }
            
            gameState.lastSave = Date.now();
            
            addLog("Игра загружена.", 'thought');
            
            // Запускаем пассивный доход, если есть писатели
            if (gameState.writers > 0 && !passiveInterval) {
                startPassiveIncome();
            }
            
            updateStatus();
        } catch (e) {
            addLog("Ошибка загрузки сохранения.", 'thought');
            console.error(e);
        }
    } else {
        addLog("Нет сохранённой игры.", 'thought');
    }
}

function resetGame() {
    if (confirm("Вы уверены? Весь прогресс будет потерян.")) {
        // Сбрасываем состояние
        gameState = {
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
        
        // Очищаем пассивный доход
        if (passiveInterval) {
            clearInterval(passiveInterval);
            passiveInterval = null;
        }
        
        // Очищаем лог
        logEl.innerHTML = '';
        
        // Добавляем начальное сообщение
        addLog("Игра сброшена. Начните с поиска первого факта.");
        
        updateStatus();
    }
}

// ============================================
// НАСТРОЙКА СОБЫТИЙ
// ============================================
function setupEventListeners() {
    // Основные действия
    clickBtn.addEventListener('click', findFact);
    publishSafeBtn.addEventListener('click', publishSafe);
    publishRiskyBtn.addEventListener('click', publishRisky);
    
    // Штат сотрудников
    hireWriterBtn.addEventListener('click', hireWriter);
    hireResearcherBtn.addEventListener('click', hireResearcher);
    
    // Улучшения
    upgradeWriterBtn.addEventListener('click', upgradeWriter);
    upgradeWriter2Btn.addEventListener('click', upgradeWriter2);
    
    // Система
    saveBtn.addEventListener('click', saveGame);
    loadBtn.addEventListener('click', loadGame);
    resetBtn.addEventListener('click', resetGame);
    clearLogBtn.addEventListener('click', () => {
        logEl.innerHTML = '';
        addLog("Лог очищен.");
    });
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ИГРЫ
// ============================================
function initGame() {
    setupEventListeners();
    updateStatus();
    
    addLog("Система инициализирована.");
    addLog("Добро пожаловать в редакцию 'Факт'. Вы один.");
    addLog("Нажмите 'НАЙТИ ФАКТ', чтобы начать.");
    
    // Пытаемся загрузить сохранение
    loadGame();
}

// Запуск игры
document.addEventListener('DOMContentLoaded', initGame);
