const API_KEY = '0205a163b22a4cb0a73b10d74d6d17f4';

const choiseEl = document.querySelector('.header__country-list');
const newsList = document.querySelector('.news__list');
const formSearch = document.querySelector('form');
const title = document.querySelector('.title');

const choices = new Choices(choiseEl, {
  searchEnabled: false,
  itemSelectText: '',
});

const getData = async url => {
  const response = await fetch(url, {
    headers: {
      'X-Api-Key': API_KEY,
    },
  });
  return response.json();
};

const getImage = url =>
  new Promise(resolve => {
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.addEventListener('error', () => {
      image.src = `img/photo-plug.jpg`;
      resolve(image);
    });
    image.src = url || `img/photo-plug.jpg`;
    return image;
  });

const formatDate = isoDate => {
  //Форматируем полученную дату
  const date = new Date(isoDate);
  const fullDate = date.toLocaleString('en-BG', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
  const fullTime = date.toLocaleString('re', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `<span>${fullDate}</span>    ${fullTime} `;
};

const renderCard = data => {
  newsList.innerHTML = '';
  const cards = data.map(news => {
    const card = document.createElement('li');
    card.className = 'news__item card-news';
    const img = new Image();
    img.src = news.urlToImage ?? 'img/noimage.png';
    img.alt = news.title;
    card.append(img);

    card.insertAdjacentHTML(
      'beforeend',
      `
        <h3 class="card-news__title">
          <a class="card-news__link" target="_blank" href=${news.url}>${
        news.title
      }</a>
        </h3>
        <p class="card-news__description">
        ${news.description || ''}
        </p>
        <div class="card-news__data">
          <time class="card-news__time" datetime="${
            news.publishedAt
          }"> ${formatDate(news.publishedAt)} </time>
          <div class="card-news__author">${news.author || 'Инкогнито'}</div>
        </div>
    `,
    );

    return card;
  });

  newsList.append(...cards);
};

const loadNews = async () => {
  //Создаение прелоэдера
  const preLoader = document.createElement('li');
  preLoader.className = 'preLoader';
  newsList.insertAdjacentElement('afterbegin', preLoader);

  //Поиск по стране(по умолчанию ru)
  const country = localStorage.getItem('country') || 'us';
  choices.setChoiceByValue(country);
  const data = await getData(
    `https://newsapi.org/v2/top-headlines?country=${country}`,
  );

  //Рендер карточек на основе полученных данных
  renderCard(data.articles);
};

choiseEl.addEventListener('change', e => {
  const value = e.detail.value;
  localStorage.setItem('country', value);
  title.classList.add('hide');
  loadNews();
});

//Склонение числительных
const num_word = (value, words) => {
  value = Math.abs(value) % 100;
  const num = value % 10;
  if (value > 10 && value < 20) return words[2];
  if (num > 1 && num < 5) return words[1];
  if (num == 1) return words[0];
  return words[2];
};

const searchNews = async value => {
  const data = await getData(
    `https://newsapi.org/v2/everything?q=${value}&pageSize=100`,
  );
  title.classList.remove('hide');
  title.textContent = `По вашему запросу “${value}” найдено ${
    data.articles.length
  } ${num_word(data.articles.length, [
    'результат',
    'результаты',
    'резульатов',
  ])} `;
  //Рендер карточек на основе полученных данных
  renderCard(data.articles);
};

formSearch.addEventListener('submit', e => {
  e.preventDefault();

  const value = formSearch.search.value;
  //очищаем селект
  choices.setChoiceByValue('');
  //осуществляем поиск на основе ввыденных данных
  searchNews(value);
  formSearch.reset();
});

loadNews();
