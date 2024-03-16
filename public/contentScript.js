// Функция для изменения регистра слов в выделенном тексте
function changeCase(type) {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let selectedText = selection.toString();
    if (selectedText.trim() !== "") {
      switch (type) {
        case "toggle":
          selectedText = toggleCase(selectedText);
          break;
        case "lower":
          selectedText = selectedText.toLowerCase();
          break;
        case "capitalize":
          selectedText = capitalizeWords(selectedText);
          break;
        case "addQuotes":
          selectedText = addQuotes(selectedText);
          break;
        default:
          break;
      }

      document.execCommand("insertText", false, selectedText);
    }
  }
}

// Функция для изменения регистра слов
function toggleCase(text) {
  const words = text.split(" ");
  const toggledWords = words.map((word, index) => {
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    } else {
      return word.toLowerCase();
    }
  });
  return toggledWords.join(" ");
}

// Функция для приведения первой буквы каждого слова к заглавной
function capitalizeWords(text) {
  const words = text.split(" ");
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return capitalizedWords.join(" ");
}

// Функция для добавления кавычек в начале и конце выделенного текста
function addQuotes(text) {
  text = text.trim();
  text = `"${text}"`;
  return text;
}

//Функция скачивания фото 1 кнопкой
let downloadedImages = new Set();
let imageCount = 1;

function downloadAllImages() {
  const images = document.querySelectorAll(".image-table img, .Images a, .js-attachment-list a");
  images.forEach((image) => {
    const imageUrl = image.href || image.src; // Проверяем, есть ли ссылка в href, иначе используем src
    if (!downloadedImages.has(imageUrl)) {
      chrome.runtime.sendMessage({action: "downloadImage", imageUrl: imageUrl, count: imageCount});
      downloadedImages.add(imageUrl);
      imageCount++;
    }
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "downloadAllImages") {
    downloadAllImages();
  }
});

// Обработчик сообщений от фонового скрипта
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggleCase") {
    changeCase("toggle");
  } else if (request.action === "lowerCase") {
    changeCase("lower");
  } else if (request.action === "capitalizeWords") {
    changeCase("capitalize");
  } else if (request.action === "addQuotes") {
    changeCase("addQuotes");
  } else if (request.action === "downloadAllImages") {
    downloadAllImages();
  }
});

// Функция для создания элемента, который будет содержать информацию о размере и разрешении изображения
function createTooltipElement() {
  const tooltip = document.createElement("div");
  tooltip.style.position = "fixed";
  tooltip.style.background = "rgba(0, 0, 0, 0.7)";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "5px";
  tooltip.style.borderRadius = "5px";
  tooltip.style.zIndex = "9999";
  return tooltip;
}

// Функция для обновления содержимого окна с разрешением
async function updateTooltipContent(tooltip, imgSrc, event) {
  const img = new Image();
  img.src = imgSrc;
  await img.decode(); // Дожидаемся загрузки изображения

  tooltip.textContent = `Size: ${img.naturalWidth}x${img.naturalHeight}`;
  tooltip.style.position = "absolute";
  tooltip.style.top = `${event.pageY}px`;

  // Устанавливаем left так, чтобы всплывающее окно было справа от курсора
  const offsetX = 15;
  tooltip.style.left = `${event.pageX + offsetX}px`;

  if (!tooltip.parentNode) {
    document.body.appendChild(tooltip);
  }
}

// Функция для обработки события наведения на элементы
function handleHoverWithAlt(event) {
  if (!event.altKey) {
    if (tooltip.parentNode) {
      document.body.removeChild(tooltip);
    }
    return;
  }

  const elementsMouseIsOver = document.elementsFromPoint(event.clientX, event.clientY);

  const imgElement = elementsMouseIsOver.find((element) => element.tagName === "IMG");

  if (imgElement) {
    const imgSrc = imgElement.src;
    updateTooltipContent(tooltip, imgSrc, event);
  } else {
    if (tooltip.parentNode) {
      document.body.removeChild(tooltip);
    }
  }
}

// Создаем одно окно для отображения разрешения изображения
const tooltip = createTooltipElement();

// Добавляем обработчик события наведения мыши на страницу
document.addEventListener("mousemove", handleHoverWithAlt);
