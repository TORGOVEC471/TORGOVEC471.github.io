import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const quizData = {
    start: {
        question: "Какая сфера помощи вам требуется?",
        options: [
            { text: "🏥 Медицинские фонды", next: "medical" },
            { text: "🐾 Приюты", next: "shelters" },
            { text: "🌱 Экологические", next: "eco" },
            { text: "💰 Благотворительность", next: "charity" }
            // { text: "📖 Образование", next: "education" }
        ]
    },
    shelters: {
        question: "Кому именно нужна помощь?",
        options: [
            { text: "Кошкам и собакам", mainCat: "Приюты", subCat: "Животные" },
            { text: "Людям без дома", mainCat: "Приюты", subCat: "Люди" }
        ]
    },
    medical: {
        question: "Какое направление медицины?",
        options: [
            { text: "Детское здоровье", mainCat: "Медицинские", subCat: "Дети" },
            { text: "Реабилитация", mainCat: "Медицинские", subCat: "Реабилитация" }
        ]
    },
    eco: {
        question: "Какая экологическая помощь?",
        options: [
            { text: "Эко-мониторинг", mainCat: "Экологические", subCat: "Мониторинг" },
            { text: "Экология", mainCat: "Экологические", subCat: "Экология" }
        ]
    },
    charity: {
        question: "Социальная поддержка:",
        options: [
            { text: "Помощь пожилым", mainCat: "Благотворительность", subCat: "Пожилые" },
            { text: "Малоимущие семьи", mainCat: "Благотворительность", subCat: "Соц. Помощь" },
            { text: "Молодежь", mainCat: "Благотворительность", subCat: "Молодежь" }
        ]
    }
    // education: {
    //     question: "Ка",
    //     options: [
    //         { text: "Помощь пожилым", mainCat: "Благотворительные", subCat: "Пожилые" },
    //         { text: "Малоимущие семьи", mainCat: "Благотворительные", subCat: "Соц. Помощь" },
    //         { text: "Молодежь", mainCat: "Благотворительные", subCat: "Молодежь" }
    //     ]
    // }
};

const container = document.getElementById('quiz-app');

function renderStep(stepKey) {
    const step = quizData[stepKey];
    container.innerHTML = `<h2>${step.question}</h2>`;

    step.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        
        btn.onclick = () => {
            if (opt.next) {
                renderStep(opt.next);
            } else {
                showFinalResults(opt.mainCat, opt.subCat);
            }
        };
        container.appendChild(btn);
    });
}

async function showFinalResults(main, sub) {
    container.innerHTML = `<h2>Ищем подходящие фонды...</h2>`;
    
    try {
        const orgsRef = collection(window.db, "organizations");
        const q = query(orgsRef, where("main_category", "==", main), where("sub_category", "==", sub));
        const snap = await getDocs(q);

        container.innerHTML = `<h2>Результаты для: ${sub}</h2>`;

        if (snap.empty) {
            container.innerHTML += `<p>К сожалению, в базе пока нет таких фондов.</p>`;
        } else {
            snap.forEach(doc => {
                const data = doc.data();
                container.innerHTML += `
                    <div class="fund-result">
                        <h3>${data.title}</h3>
                        <p>${data.description}</p>
                        <small>Контакты: ${data.contacts || 'не указаны'}</small><br>
                        <small>Сайт:
                            ${data.link
                                ? `<a href="${data.link}" target="_blank">перейти на сайт</a>`
                                : 'не указан'
                            }</small>
                    </div>
                `;
            });
        }
        
        container.innerHTML += `<button onclick="location.reload()" class="option-btn">Начать сначала</button>`;
        
    } catch (e) {
        console.error(e);
        container.innerHTML = "Ошибка при загрузке данных.";
    }
}

// Запуск (ждем инициализацию db из window)
const checkDb = () => {
    if (window.db) renderStep('start');
    else setTimeout(checkDb, 100);
};
checkDb();