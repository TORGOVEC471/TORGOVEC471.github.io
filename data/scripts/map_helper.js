import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { MapIcons } from "./icons_map.js";
// Импортируем сам скрипт геокодера как модуль (если доступно) или используем рабочий хак:
import "https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js";

// Координаты центра (Бишкек)
const map = L.map('map').setView([42.8746, 74.5698], 13);

// Подключаем слой карты (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);
L.Control.geocoder().addTo(map);

// // Пример готовой метки с описанием и "отзывом"
// const marker = L.marker([42.8746, 74.5698]).addTo(map);
// marker.bindPopup("<b>Центр помощи</b><br>Нужны волонтеры для сборки конструкторов.");

let tempLatlng = null; // Переменная для хранения координат клика

map.on('click', function(e) {
    tempLatlng = e.latlng;
    document.getElementById('form-container').style.display = 'block';
});

// Обработка кнопки сохранения в форме
document.getElementById('save-btn').onclick = async () => {
    const category = document.getElementById('marker-category').value;
    const name = document.getElementById('marker-name').value;
    const text = document.getElementById('marker-text').value;
    
    if (text && tempLatlng) {
        document.getElementById('form-container').style.display = 'none';
        
        // Добавляем на карту визуально
        L.marker(tempLatlng).addTo(map).bindPopup(`Название: <b>${name}</b><br><br>Описание: ${text}<br><br>Категория: ${category}`).openPopup();
        
        // Сохраняем в базу (добавь поле category в объект сохранения!)
        await saveMarker(tempLatlng.lat, tempLatlng.lng, name, text, category);
        
        // Очищаем форму
        document.getElementById('marker-text').value = "";
    }
};

// map.on('click', async function(e) {
//     const lat = e.latlng.lat;
//     const lng = e.latlng.lng;

//     // В будущем здесь будет форма для ввода описания
//     const description = prompt("Введите описание вашей помощи:");
    
//     if (description) {
//         L.marker([lat, lng]).addTo(map)
//             .bindPopup(`<b>Предложение помощи:</b><br>${description}`)
//             .openPopup();
            
//         await saveMarker(lat, lng, description);
//     }
// });

// Сохранение в базу данных меток
async function saveMarker(lat, lng, name, text, category) {
    try {
        
        if (!window.db) throw new Error("База данных Firebase не инициализирована!");

        const docRef = await addDoc(collection(window.db, "markers"), {
            location: [lat, lng],
            title: name,
            description: text,
            category: category,
            status: "pending", // Статус для админской проверки
            timestamp: new Date()
        });
        console.log("Метка записана в базе с ID: ", docRef.id);
    } catch (e) {
        console.error("Ошибка при добавлении: ", e);
        alert("Ошибка сохранения! Проверьте консоль.");
    }
}

// =======

const organizationsData = [
  { name: "Добрые руки",
    main_category: "Приюты",
    sub_category: "Животные",
    description: "Помощь бездомным собакам и кошкам...",
    contacts: "+996...",
    link: "https://..." },
  { name: "Злые руки хирургии",
    main_category: "Медицина",
    sub_category: "Люди",
    description: "Вырежем все, чтобы спасти жизнь.",
    contacts: "+996...",
    link: "https://..." }
];

// Сохранение в базу данных организаций
async function saveOrganizations(org) {
    try {
        
        if (!window.db) throw new Error("База данных Firebase не инициализирована!");

        // Используем ключи напрямую из объекта
        const docRef = await addDoc(collection(window.db, "organizations"), {
            title: org.name,
            description: org.description,
            main_category: org.main_category,
            sub_category: org.sub_category, // Добавили подкатегорию
            contacts: org.contacts,
            link: org.link,
            status: "pending",
            timestamp: new Date()
        });
        console.log(`Организация "${org.name}" сохранена с ID: ${docRef.id}`);
    } catch (e) {
        console.error(`Ошибка при добавлении "${org.name}": `, e);
    }
}

async function processAndSaveAll() {
    // Используем for...of для более чистого обхода массива объектов
    for (const org of organizationsData) {
        
        if (!org.name || org.name.trim() === "") {
            console.warn("Пропущена запись без имени");
            continue;
        }

        // Передаем весь объект целиком для удобства
        await saveOrganizations(org);
    }
    
    console.log("Все записи обработаны!");
}

// processAndSaveAll();


// =======

// Загрузка меток на карту.
async function loadMarkers() {
    if (!window.db) return;

    const q = query(collection(window.db, "markers"), where("status", "==", "approved"));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.location) {
            // Ставим метку на карту
            L.marker(data.location).addTo(map)
                // .bindPopup(`<b>Загружено из базы:</b><br>${data.description}`);
                .bindPopup(`Название: <b>${data.title}</b><br><br>Описание: ${data.description}<br><br>Категория: ${data.category}`);
        }
    });
}

// Функция для ожидания инициализации window.db
const checkDbAndLoad = () => {
    if (window.db) {
        console.log("База готова, загружаем метки...");
        loadMarkers();
    } else {
        console.log("Ждем инициализацию базы...");
        setTimeout(checkDbAndLoad, 100); // Проверяем каждые 100мс
    }
};

checkDbAndLoad();

// Нужно закончить карту.
// - Сделать цветные метки
// - Сделать свои иконки меток