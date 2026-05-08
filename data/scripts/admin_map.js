import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Импортируем сам скрипт геокодера как модуль (если доступно) или используем рабочий хак:
import "https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js";

// Координаты центра (Бишкек)
const map = L.map('map').setView([42.8746, 74.5698], 13);

// Подключаем слой карты (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);
L.Control.geocoder().addTo(map);

let allMarkersData = []; // очищаем перед загрузкой

async function loadAdminMarkers() {
    if (!window.db) {
        setTimeout(loadAdminMarkers, 200);
        return;
    }
    
    const querySnapshot = await getDocs(collection(window.db, "markers"));
    
    querySnapshot.forEach((markerDoc) => {
        const data = markerDoc.data();
        const markerId = markerDoc.id;

        // Делаем разные цвета для одобренных и неодобренных (по желанию)
        const markerColor = data.status === "approved" ? "green" : "orange";
        allMarkersData.push({
            id: markerId,
            title: data.title,
            description: data.description,
            category: data.category,
            status: data.status
        })
        
        const marker = L.marker(data.location).addTo(map);
        
        const adminContent = `
            <div style="min-width: 150px;">
                <b style="color: ${data.status === 'approved' ? 'green' : 'red'}">
                    Статус: ${data.status}
                </b><br>
                <hr>
                <b>Название: ${data.title}</b><br>
                <p>Описание: ${data.description}</p>
                <p>Категория: ${data.category}</p>
                <hr>
                ${data.status === 'pending' ? 
                    `<button onclick="approveMarker('${markerId}')" style="background: #4CAF50; color: white; border: none; padding: 5px; cursor: pointer; width: 100%;">✅ Одобрить</button>` 
                    : ''
                }
                <button onclick="deleteMarker('${markerId}')" style="background: #f44336; color: white; border: none; padding: 5px; cursor: pointer; width: 100%; margin-top: 5px;">🗑️ Удалить</button>
                <button onclick="openEditModal('${markerId}')" style="background: #f4b836; color: white; border: none; padding: 5px; cursor: pointer; width: 100%; margin-top: 5px;">📝 Редактировать</button>
            </div>
        `;
        marker.bindPopup(adminContent);
    });
    renderTable('all');
}

// Функция для отрисовки таблицы
window.renderTable = (filter) => {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = ''; // Очистка

    const filtered = filter === 'pending' 
        ? allMarkersData.filter(m => m.status === 'pending') 
        : allMarkersData;

    filtered.forEach(m => {
        const row = `
            <tr>
                <td>${m.title || 'Без названия'}</td>
                <td>${m.category}</td>
                <td>${m.description}</td>
                <td style="color: ${m.status === 'approved' ? 'green' : 'orange'}">${m.status}</td>
                <td>
                    <button onclick="approveMarker('${m.id}')">✅</button>
                    <button onclick="openEditModal('${m.id}')">📝</button>
                    <button onclick="deleteMarker('${m.id}')">🗑️</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// РЕДАКТИРОВАНИЕ
window.openEditModal = (id) => {
    const marker = allMarkersData.find(m => m.id === id);
    if (marker) {
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-name').value = marker.title || '';
        document.getElementById('edit-text').value = marker.description || '';
        document.getElementById('edit-modal').style.display = 'block';
    }
}

window.saveEdit = async () => {
    const id = document.getElementById('edit-id').value;
    const newName = document.getElementById('edit-name').value;
    const newText = document.getElementById('edit-text').value;

    try {
        const docRef = doc(window.db, "markers", id);
        await updateDoc(docRef, {
            title: newName,
            description: newText
        });
        alert("Изменено!");
        location.reload();
    } catch (e) {
        console.error(e);
    }
}

// Функции window остаются такими же...
window.approveMarker = async (id) => {
    const docRef = doc(window.db, "markers", id);
    await updateDoc(docRef, { status: "approved" });
    alert("Метка одобрена и теперь видна всем!");
    location.reload();
};

window.deleteMarker = async (id) => {
    if(confirm("Удалить эту метку навсегда?")) {
        await deleteDoc(doc(window.db, "markers", id));
        location.reload();
    }
};

// Запуск
loadAdminMarkers();