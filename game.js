// Состояние игры
let state = {
    ideas: 0,
    fame: 0,
    writers: 0,
    hasWriter: false,
    factsFound: 0
};

// DOM элементы
const ideasEl = document.getElementById('ideas');
const fameEl = document.getElementById('fame');
const staffEl = document.getElementById('staff');
const logEl = document.getElementById('log');
const controlsEl = document.getElementById('controls');

// База фактов (с атмосферой)
const facts = [
    "Грех #001: Гордыня. Статистика показывает, что 92% водителей считают своё вождение лучше среднего.",
    "Архив. Найдена запись: 'Они не хотели, чтобы это стало известно. Цена правды — молчание.'",
    "Слух. В отделе говорят, что предыдущий главный редактор исчез после публикации факта #777."
];

// Функция добавления записи в лог
function addLog(text, isCommand = false) {
    const p = document.createElement('p');
    if (isCommand) {
        p.innerHTML = `> [ <a href='#' class='cmd'>${text}</a> ]`;
        // Важно: обработчик для динамических команд добавим отдельно
    } else {
        p.innerHTML = `> ${text}`;
    }
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight; // Автопрокрутка вниз
}

// Функция обновления статус-бара
function updateStatus() {
    ideasEl.textContent = state.ideas;
    fameEl.textContent = state.fame;
    staffEl.textContent = state.writers;
}

// Основное действие: найти факт
document.getElementById('cmd-click').addEventListener('click', function(e) {
    e.preventDefault();
    state.ideas += 1;
    state.factsFound += 1;
    updateStatus();

    // Показать случайный факт
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    addLog(`Факт обнаружен: "${randomFact}"`);

    // Сюжетный триггер: после 3 фактов открывается найм
    if (state.factsFound === 3 && !state.hasWriter) {
        addLog("<br>> Вы накопили достаточно материала. Пора расширяться.");
        addLog("> [ <a href='#' id='cmd-hire-writer' class='cmd'>РАЗМЕСТИТЬ ВАКАНСИЮ ПИСАТЕЛЯ (10 СЛАВЫ)</a> ]", true);
        // Вешаем обработчик на новую команду
        setTimeout(() => {
            document.getElementById('cmd-hire-wire').addEventListener('click', hireWriter);
        }, 100);
    }
});

// Функция найма писателя
function hireWriter(e) {
    e.preventDefault();
    if (state.fame >= 10) {
        state.fame -= 10;
        state.writers += 1;
        state.hasWriter = true;
        updateStatus();
        addLog("> Вы наняли писателя. Он будет автоматически генерировать идеи.");
        addLog("> <em>'Шеф, я нашёл кое-что странное в архивах...'</em>");
        // Запускаем пассивный доход
        startPassiveIncome();
    } else {
        addLog("> Недостаточно славы. Публикуйте факты!");
    }
}

// Пассивный доход (запускается один раз при первом найме)
let passiveInterval;
function startPassiveIncome() {
    if (passiveInterval) return;
    passiveInterval = setInterval(() => {
        state.ideas += state.writers;
        updateStatus();
    }, 1000); // Раз в секунду
}

// Инициализация
addLog("> Готов к работе. Нажмите [НАЙТИ ФАКТ], чтобы начать.");
updateStatus();
