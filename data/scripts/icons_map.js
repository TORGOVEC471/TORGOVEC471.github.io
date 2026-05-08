// Кастомная иконка
const myCustomIcon = L.icon({
    iconUrl: '../image/site/logo.svg', // Путь к твоему файлу
    iconSize: [38, 38], // Размер иконки [ширина, высота]
    iconAnchor: [19, 38], // Точка иконки, которая будет указывать на координаты (центр низа)
    popupAnchor: [0, -38] // Откуда будет вылезать облачко текста
});

// // Использование:
// L.marker([lat, lng], {icon: myCustomIcon}).addTo(map);


// Цвета
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// // Использование:
// L.marker([lat, lng], {icon: greenIcon}).addTo(map);

const MapIcons = [greenIcon];

export { MapIcons };