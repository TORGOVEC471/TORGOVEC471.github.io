// import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// async function findFunds(need) {
//     const orgsRef = collection(window.db, "organizations");
//     // Ищем фонды, у которых категория совпадает с ответом пользователя
//     const q = query(orgsRef, where("category", "==", need));
    
//     const querySnapshot = await getDocs(q);
//     querySnapshot.forEach((doc) => {
//         console.log("Подходящий фонд:", doc.data().name);
//         // Выводим пользователю в список
//     });
// }

// const steps = {
//     start: {
//         question: "Что вам требуется?",
//         options: [
//             { text: "Медицинские", next: "medical" },
//             { text: "Приюты", next: "shelters" },
//             { text: "Экологические", next: "eco" }
//         ]
//     },
//     shelters: {
//         question: "Кому нужна помощь?",
//         options: [
//             { text: "Животные", category: "Приюты", sub: "Животные" },
//             { text: "Бездомные люди", category: "Приюты", sub: "Люди" }
//         ]
//     }
//     // и так далее
// };

// import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// async function showResults(mainCat, subCat) {
//     const orgsRef = collection(window.db, "organizations");
    
//     // Делаем запрос к базе по двум параметрам
//     const q = query(
//         orgsRef, 
//         where("main_category", "==", mainCat), 
//         where("sub_category", "==", subCat)
//     );

//     const querySnapshot = await getDocs(q);
//     const resultsDiv = document.getElementById("results");
//     resultsDiv.innerHTML = ""; // Очистить старые результаты

//     if (querySnapshot.empty) {
//         resultsDiv.innerHTML = "К сожалению, подходящих фондов пока не найдено.";
//         return;
//     }

//     querySnapshot.forEach((doc) => {
//         const data = doc.data();
//         resultsDiv.innerHTML += `
//             <div class="fund-card">
//                 <h3>${data.name}</h3>
//                 <p>${data.description}</p>
//                 <a href="${data.link}" target="_blank">Перейти на сайт</a>
//             </div>
//         `;
//     });
// }



import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const quizData = {
    start: {
        question: "Какая сфера помощи вам требуется?",
        options: [
            { text: "🏥 Медицинские фонды", next: "medical" },
            { text: "🐾 Приюты", next: "shelters" },
            { text: "🌱 Экологические", next: "eco" }
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
    }
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