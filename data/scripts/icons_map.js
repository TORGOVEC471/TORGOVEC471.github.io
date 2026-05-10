// // Кастомная иконка
// const myCustomIcon = L.icon({
//     iconUrl: '../image/site/icon_marker.svg', // Путь к твоему файлу
//     iconSize: [38, 38], // Размер иконки [ширина, высота]
//     iconAnchor: [19, 38], // Точка иконки, которая будет указывать на координаты (центр низа)
//     popupAnchor: [0, -38] // Откуда будет вылезать облачко текста
// });

const baseOptions = {
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -20],
};

const MapIcons = {
    "Еда": new L.Icon({
      ...baseOptions,
      iconUrl: '../image/site/icon_marker_green.svg'
    }),
    "Медицина": new L.Icon({
      ...baseOptions,
      iconUrl: '../image/site/icon_marker_red.svg'
    }),
    "Благотворительность": new L.Icon({
      ...baseOptions,
      iconUrl: '../image/site/icon_marker_ocean.svg'
    }),
    "Одежда": new L.Icon({
      ...baseOptions,
      iconUrl:'../image/site/icon_marker_blue.svg'
    }),
    "Приют": new L.Icon({
      ...baseOptions,
      iconUrl: '../image/site/icon_marker_orange.svg'
    }),
    "Экология": new L.Icon({
      ...baseOptions,
      iconUrl: '../image/site/icon_marker.svg' /* Пока что обычный маркер, потому что цветов больше нет */
    }),
    "Другое": new L.Icon({
      ...baseOptions,
      iconUrl: '../image/site/icon_marker_fiol.svg'
    }),
    
    // Твоя кастомная иконка (логотип)
    "default": L.icon({
        ...baseOptions,
        iconUrl: '../image/site/icon_marker.svg'
    })
};

export { MapIcons };