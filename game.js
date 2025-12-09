// Состояние игры
let state = {
    ideas: 0,
    fame: 0,
    writers: 0,
    factsFound: 0,
    hasPublished: false,
    hasWriterUnlocked: false,
    isWriterHired: false
};

// DOM элементы
const ideasEl = document.getElementById('ideas');
const fameEl = document.getElementById('fame');
const staffEl = document.getElementById('staff');
const logEl = document.getElementById('log');

// База фактов (с атмосферой) - расширьте её
const facts = [
    "Грех #001: Гордыня. Статистика показывает, что 92% водителей считают своё вождение лучше среднего.",
    "Архив. Найдена запись: 'Они не хотели, чтобы это стало известно. Цена правды — молчание.'",
    "Слух. В отделе говорят, что предыдущий главный редактор исчез после публикации факта #777.",
    "Анализ. Чревоугодие - единственный грех, который требует ежеминутного подтверждения.",
    "Заметка. Зависть — это когда ты считаешь чужие цифры вместо своих.",
    "Отчёт. Лень: 78% гениальных идей теряются между 'сделаю завтра' и 'а нужно ли?'.",
    "Шёпот. Говорят, Семьям правят не короли, а те, кто пишет о них факты."
];

// Функция добавления записи в лог (ИСПРАВЛЕННАЯ)
function addLog(text, isCommand = false) {
    const p = document.createElement('p');
    if (isCommand) {
        // Для команд мы передаём уже готовую разметку
        p.innerHTML = text;
    } else {
        p.innerHTML = `> ${text}`;
    }
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight;
}

// Функция обновления статус-бара
function updateStatus() {
    ideasEl.textContent = state.ideas;
    fameEl.textContent = state.fame;
    staffEl.textContent = state.writers;
}

// Функция показа случайного факта
function getRandomFact() {
    return facts[Math.floor(Math.random() * facts.length)];
}

// Основное действие: найти факт
document.getElementById('cmd-click').addEventListener('click', function(e) {
    e.preventDefault();
    state.ideas += 1;
    state.factsFound += 1;
    updateStatus();

    addLog(`Факт обнаружен: "${getRandomFact()}"`);

    // СЮЖЕТНЫЙ ТРИГГЕР 1: После первого факта открываем публикацию
    if (state.factsFound === 1 && !state.hasPublished) {
        addLog("<br>> У вас есть материал. Можно попробовать опубликовать и получить славу.");
        addLog("<span class='cmd' id='cmd-publish-safe'>[ ОПУБЛИКОВАТЬ БЕЗОПАСНО (1 идея → 1 слава) ]</span>", true);
        
        setTimeout(() => {
            document.getElementById('cmd-publish-safe').addEventListener('click', publishSafe);
        }, 10);
    }

    // СЮЖЕТНЫЙ ТРИГГЕР 2: После 3 фактов открываем найм писателя (если есть слава)
    if (state.factsFound >= 3 && !state.hasWriterUnlocked) {
        state.hasWriterUnlocked = true;
        addLog("<br>> Вы накопили достаточно материала. Пора расширяться.");
        addLog("<span class='cmd' id='cmd-hire-check'>[ ПРОВЕРИТЬ, ДОСТАТОЧНО ЛИ СЛАВЫ ДЛЯ НАЙМА? ]</span>", true);
        
        setTimeout(() => {
            document.getElementById('cmd-hire-check').addEventListener('click', checkHireConditions);
        }, 10);
    }
});

// Публикация (безопасный вариант)
function publishSafe(e) {
    e.preventDefault();
    if (state.ideas >= 1) {
        state.ideas -= 1;
        state.fame += 1;
        state.hasPublished = true;
        updateStatus();
        
        addLog("> Вы опубликовали факт. Слава +1.");
        
        // Сюжетный отклик на первую публикацию
        if (state.fame === 1) {
            addLog("> <em>'Первая публикация... Теперь они обратят внимание.'</em>");
        }
        
        // Убираем кнопку безопасной публикации
        const safeBtn = document.getElementById('cmd-publish-safe');
        if (safeBtn) safeBtn.style.display = 'none';
        
        // После первой публикации предлагаем рискованный вариант
        addLog("<span class='cmd' id='cmd-publish-risky'>[ ОПУБЛИКОВАТЬ РИСКОВАНО (1 идея → 2 славы, 50% шанс) ]</span>", true);
        
        setTimeout(() => {
            document.getElementById('cmd-publish-risky').addEventListener('click', publishRisky);
        }, 10);
        
        // Проверяем, можно ли нанять писателя
        checkHireConditions();
    } else {
        addLog("> Недостаточно идей. Соберите больше фактов.");
    }
}

// Рискованная публикация
function publishRisky(e) {
    e.preventDefault();
    if (state.ideas >= 1) {
        state.ideas -= 1;
        const success = Math.random() > 0.5; // 50% шанс
        
        if (success) {
            state.fame += 2;
            addLog("> Риск оправдан! Факт вызвал сенсацию. Слава +2.");
            addLog("> <em>'Это было слишком смело... Но работает.'</em>");
        } else {
            addLog("> Провал. Факт сочли фейком. Вы потеряли идею.");
            addLog("> <em>'Они следят за каждой публикацией...'</em>");
        }
        
        updateStatus();
        checkHireConditions();
    }
}

// Проверка условий для найма
function checkHireConditions() {
    if (state.fame >= 10 && !state.isWriterHired && state.hasWriterUnlocked) {
        addLog("<br>> Накоплено достаточно славы для расширения штата.");
        addLog("<span class='cmd' id='cmd-hire-writer'>[ НАНЯТЬ ПИСАТЕЛЯ (10 СЛАВЫ) ]</span>", true);
        
        setTimeout(() => {
            document.getElementById('cmd-hire-writer').addEventListener('click', hireWriter);
        }, 10);
    } else if (!state.isWriterHired && state.hasWriterUnlocked) {
        addLog(`> Для найма писателя нужно 10 славы. У вас: ${state.fame}. Публикуйте больше фактов.`);
    }
}

// Найм писателя
function hireWriter(e) {
    e.preventDefault();
    
    if (state.fame >= 10) {
        state.fame -= 10;
        state.writers += 1;
        state.isWriterHired = true;
        updateStatus();
        
        addLog("> Вы наняли первого писателя. Он будет автоматически генерировать идеи.");
        addLog("> <em>'Шеф, я начал разбирать архив. Тут есть... странные совпадения.'</em>");
        
        // Убираем кнопку найма
        const hireBtn = document.getElementById('cmd-hire-writer');
        if (hireBtn) hireBtn.style.display = 'none';
        
        // Запускаем пассивный доход
        startPassiveIncome();
    }
}

// Пассивный доход
let passiveInterval;
function startPassiveIncome() {
    if (passiveInterval) return;
    
    passiveInterval = setInterval(() => {
        if (state.writers > 0) {
            const oldIdeas = state.ideas;
            state.ideas += state.writers;
            updateStatus();
            
            // Периодически (каждые 10 идей) показываем сообщение от писателя
            if (Math.floor(state.ideas / 10) > Math.floor(oldIdeas / 10)) {
                const writerMessages = [
                    "Писатель: 'Нашёл упоминание о Факте #666... Его изъяли из всех архивов.'",
                    "Писатель: 'Кто-то подбросил на стол записку: \"Остановись, пока не поздно\".'",
                    "Писатель: 'Следы ведут к организации \"Инквизиция 2.0\". Шутка? Не думаю.'"
                ];
                addLog(`> ${writerMessages[Math.floor(Math.random() * writerMessages.length)]}`);
            }
        }
    }, 2000); // 1 идея каждые 2 секунды от каждого писателя
}

// Инициализация
updateStatus();
