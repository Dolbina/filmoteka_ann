// Создай фронтенд часть приложения поиска и просмотра изображений по ключевому слову. Добавь оформление элементов интерфейса. 

import './css/styles.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

// Пошук форми, поля вводу, кнопки
const refs = {
  searchForm: document.querySelector('#search-form'),
  input: document.querySelector('input'),
  button: document.querySelector('button'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};


let page = 1;

refs.searchForm.addEventListener('submit', onSearchImg);
refs.loadMoreBtn.addEventListener("click", onLoadMore);
refs.loadMoreBtn.style.display = 'none'; // кнопку не бачимо


// колбек функція для кнопки load More
function onLoadMore () {
  let name = refs.input.value.trim();
  page += 1;
  fetchImg(name, page);
}

function onSearchImg(event) {
  // відміна перезавантаження сторінки по замовчуванню
  event.preventDefault();

  page = 1;
  // очищення галереї
  refs.gallery.innerHTML = '';

  let form = event.currentTarget;

  // записує в змінну введене значення користувачем (trim прибирає пробіли)
  let name = form.elements.searchQuery.value.trim();
 

  // перевірка, якщо значення не пустий рядок
  if (name !== '') {
    fetchImg(name, page);
  } else {
    refs.loadMoreBtn.style.display = 'none'; // кнопку не бачимо
    return Notiflix.Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`
    );
  }
}


// Розмітка для 1 шт. фото
const createImg = item =>
  `<a class="photo-link" href="${item.largeImageURL}">
  <div class="photo-card">
  <div class="photo-wrap">
  <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
  </div>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${item.likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${item.views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${item.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${item.downloads}
    </p>
  </div>
</div>
</a>`;


// Перебір масива
const generateContent = (array) => array.reduce((acc, item) => {
    return acc + createImg(item);
}, "");

// Додавання в DOM
const insertContent = (array) => {
  const result = generateContent(array);
  refs.gallery.insertAdjacentHTML('beforeend', result);
  simpleLightBox.refresh(); // оновлення слайдера lightbox
};


// запрос зображення
async function fetchImg(name, page) {
  const API_URL = 'https://pixabay.com/api/';
  const options = {
    params: {
      key: '34361382-9628d27261ff8745ccc230a20',
      q: name,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 40,
    },
  };
  try {
    const response = await axios.get(API_URL, options);
   

    // якщо користувач ввів не існуючу назву зображення, то відображає повідомлення
    if (response.data.hits.length === 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again`
      );
      return;
    }

    if (response.data.totalHits !== 0) {
      refs.loadMoreBtn.style.display = 'block'; // кнопку бачимо
    }
   
    //  відображає повідомлення з кількістю знайдених зображень при кожному новому запиті
    if (page === 1) {
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.totalHits} images`
      );
    }
    //Якщо користувач дійшов до кінця колекції
    if (response.data.hits.length < 40) {
      refs.loadMoreBtn.style.display = 'none'; // кнопку не бачимо
      Notiflix.Notify.info(
        `We're sorry, but you've reached the end of search results.`
      );
    }

    insertContent(response.data.hits);
  } catch (error) {
    console.log(error);
  }
}
// слайдер
const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});



  
  