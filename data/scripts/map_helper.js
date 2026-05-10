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

let tempLatlng = null; // Переменная для хранения координат клика

map.on('click', function(e) {
    tempLatlng = e.latlng;
    document.getElementById('form-container').style.display = 'block';
});

// Обработка кнопки сохранения в форме
document.getElementById('save-btn').onclick = async () => {
    let category = document.getElementById('marker-category').value;
    const name = document.getElementById('marker-name').value;
    const text = document.getElementById('marker-text').value;

    if (category === 'Другое') {
        const otherValue = document.getElementById('other-category-text').value.trim();
        
        // Если пользователь ничего не ввел в "Свою категорию", 
        // можно либо оставить "Другое", либо вывести ошибку
        if (otherValue !== "") {
            category = otherValue;
        }
    }
    
    if (text && tempLatlng) {
        document.getElementById('form-container').style.display = 'none';
        
        // Добавляем на карту визуально
        L.marker(tempLatlng).addTo(map).bindPopup(
            `Название: <b>${name}</b><br><br>
            Описание: ${text}<br><br>
            Категория: ${category}`
        ).openPopup();
        
        // Сохраняем в базу (добавь поле category в объект сохранения!)
        await saveMarker(tempLatlng.lat, tempLatlng.lng, name, text, category);
        
        // Очищаем форму
        document.getElementById('marker-text').value = "";
    }
};

// Отображения поля ввода при выборе категории "Другое"
function toggleOtherInput() {
    const categorySelect = document.getElementById('marker-category');
    const otherInputContainer = document.getElementById('other-category-container');
    
    if (categorySelect.value === 'Другое') {
        otherInputContainer.style.display = 'block';
    } else {
        otherInputContainer.style.display = 'none';
        // Опционально: очищаем поле, если пользователь передумал
        document.getElementById('other-category-text').value = '';
    }
}

window.toggleOtherInput = toggleOtherInput;

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
    {
    name: "Добрые руки",
    main_category: "Приюты",
    sub_category: "Животные",
    description: "Помощь бездомным, больным, собакам и кошкам.",
    contacts: "+996 (709) 78-45-37",
    link: "https://www.facebook.com/dobrieruki.kg"
    },
    {
    name: "Help the Children - SKD",
    main_category: "Медицинские",
    sub_category: "Дети",
    description: "Помощь детям с онкологическими, гематологическими и иммунологическими заболеваниями",
    link: "https://www.facebook.com/fondskd"
    },
    {
    name: "Элим, барсыңбы?!",
    main_category: "Благотворительность",
    sub_category: "Соц. Помощь",
    description: "Занимаются широким спектром помощи: поддержка сирот, малоимущих семей, сбор средств на операции и раздача продуктов во время праздников",
    link: "https://www.facebook.com/elimbarsinbi"
    },
    {
    name: "Поможем вместе",
    main_category: "Медицинские",
    sub_category: "Дети",
    description: "Сбор средств на лечение тяжелых заболеваний."
    },
    {
    name: "Osteo Clinic",
    main_category: "Медицинские",
    sub_category: "Реабилитация",
    description: "Восстановление после травм и операций.",
    link: "https://osteoclinic.center/"
    },
    {
    name: "Реацентр",
    main_category: "Медицинские",
    sub_category: "Реабилитация",
    description: "ЛФК, массаж и неврологическая помощь.",
    link: "https://www.instagram.com/reacenter.bishkek/"
    },
    {
    name: "Право на жизнь",
    main_category: "Приюты",
    sub_category: "Животные",
    description: "Приют для бездомных собак и кошек, стерилизация.",
    contacts: "+996 (554) 20-51-05",
    link: "https://www.facebook.com/pravonajiznbishkek"
    },
    {
    name: "Коломто",
    main_category: "Приюты",
    sub_category: "Люди",
    description: "Муниципальный приют для людей без дома.",
    contacts: "+996 (312) 30-48-55"
    },
    {
    name: "Фонтан жизни",
    main_category: "Приюты",
    sub_category: "Люди",
    description: "Кормление и помощь людям на улице.",
    contacts: "+996 (312) 37-16-45",
    link: "https://www.fountainoflife.kg/"
    },
    {
    name: "MoveGreen",
    main_category: "Экологические",
    sub_category: "Мониторинг",
    description: "Датчики качества воздуха (AQ.kg), эко-образование.",
    contacts: "+996 (312) 98-63-30",
    link: "https://movegreen.kg/"
    },
    {
    name: "Орхусский центр",
    main_category: "Экологические",
    sub_category: "Экология",
    description: "Защита экологических прав граждан",
    contacts: "+996 (312) 54-41-10",
    link: "https://aarhus.kg/ru/"
    },
    {
    name: "Babushka Adoption",
    main_category: "Благотворительность",
    sub_category: "Пожилые",
    description: "Поддержка одиноких пенсионеров.",
    contacts: "+996 (312) 54-41-10",
    link: "http://babushkaadoption.org/"
    },
    {
    name: "Oasis Kyrgyzstan",
    main_category: "Благотворительность",
    sub_category: "Молодежь",
    description: "Помощь выпускникам детских домов.",
    link: "https://oasisorg.kg/"
    }
];

// Сохранение в базу данных организаций
async function saveOrganizations(org) {
    try {
        
        if (!window.db) throw new Error("База данных Firebase не инициализирована!");

        // Используем ключи напрямую из объекта
        const docRef = await addDoc(collection(window.db, "organizations"), {
            title: org.name || "Без названия",
            description: org.description || "Не указано",
            main_category: org.main_category || "",
            sub_category: org.sub_category || "", // Добавили подкатегорию
            contacts: org.contacts || "",
            link: org.link || "",
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
        const icon = MapIcons[data.category] || MapIcons["default"];
        if (data.location) {
            // Ставим метку на карту
            L.marker(data.location, { icon: icon})
                .addTo(map)
                .bindPopup(
                    `Название: <b>${data.title}</b><br><br>
                    Описание: ${data.description}<br><br>
                    Категория: ${data.category}`
                );
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