// Axios
import axios from 'axios';
// IziToast
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
// SimpleLightbox
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.app-form');
const gallery = document.querySelector('#appGallery');
const galleryList = document.querySelector('#galleryList');

let searchText,
  searchActivePage = 1,
  searchMaxPage;

console.log(`
  Search Photos API: https://pixabay.com/api/docs/

  Search Active Page: ${searchActivePage}
  Search Max Page: ${searchMaxPage}
  `);

const galleryItem = photoInfo => {
  const item = document.createElement('li');
  item.classList.add('gallery-item');
  item.dataset.source = photoInfo.largeImageURL;

  const itemLink = document.createElement('a');
  itemLink.href = photoInfo.largeImageURL;
  itemLink.classList.add('gallery-link');
  itemLink.style.color = 'black';

  const img = document.createElement('img');
  img.src = photoInfo.webformatURL;
  img.alt = photoInfo.tags;
  img.width = 360;
  img.height = 200;

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('content');

  // Likes
  const infoDivLikes = document.createElement('div');
  infoDivLikes.classList.add('info');

  const infoKeyLikes = document.createElement('h5');
  infoKeyLikes.classList.add('key');
  infoKeyLikes.textContent = 'Likes';
  infoDivLikes.appendChild(infoKeyLikes);

  const infoValueLikes = document.createElement('p');
  infoValueLikes.classList.add('value');
  infoValueLikes.textContent = photoInfo.likes;
  infoDivLikes.appendChild(infoValueLikes);

  // Views
  const infoDivViews = document.createElement('div');
  infoDivViews.classList.add('info');

  const infoKeyViews = document.createElement('h5');
  infoKeyViews.classList.add('key');
  infoKeyViews.textContent = 'Views';
  infoDivViews.appendChild(infoKeyViews);

  const infoValueViews = document.createElement('p');
  infoValueViews.classList.add('value');
  infoValueViews.textContent = photoInfo.views;
  infoDivViews.appendChild(infoValueViews);

  // Comments
  const infoDivComments = document.createElement('div');
  infoDivComments.classList.add('info');

  const infoKeyComments = document.createElement('h5');
  infoKeyComments.classList.add('key');
  infoKeyComments.textContent = 'Comments';
  infoDivComments.appendChild(infoKeyComments);

  const infoValueComments = document.createElement('p');
  infoValueComments.classList.add('value');
  infoValueComments.textContent = photoInfo.views;
  infoDivComments.appendChild(infoValueComments);

  // Comments
  const infoDivDownloads = document.createElement('div');
  infoDivDownloads.classList.add('info');

  const infoKeyDownloads = document.createElement('h5');
  infoKeyDownloads.classList.add('key');
  infoKeyDownloads.textContent = 'Downloads';
  infoDivDownloads.appendChild(infoKeyDownloads);

  const infoValueDownloads = document.createElement('p');
  infoValueDownloads.classList.add('value');
  infoValueDownloads.textContent = photoInfo.downloads;
  infoDivDownloads.appendChild(infoValueDownloads);

  contentDiv.appendChild(infoDivLikes);
  contentDiv.appendChild(infoDivViews);
  contentDiv.appendChild(infoDivComments);
  contentDiv.appendChild(infoDivDownloads);

  itemLink.appendChild(img);
  item.appendChild(contentDiv);
  item.appendChild(itemLink);
  galleryList.appendChild(item);
};

let galleryBox = new SimpleLightbox('.gallery li > a', {
  captionsData: 'alt',
  captionDelay: 350,
});

const searchPhotos = (search, page) => {
  return new Promise(async (resolve, reject) => {
    console.log(`SearchPhotos()`, search, page);

    if (page > searchMaxPage) {
      searchActivePage = 1;
      page = 1;
    } else {
      const pixabayResponse = await axios.get(`https://pixabay.com/api/`, {
        params: {
          key: '49344582-c64095957e0f61b264d1bf806',
          q: search,
          images_type: 'photo',
          orientation: 'all',
          safesearch: 'false',
          page: page,
          per_page: 40,
        },
      });
      searchMaxPage = parseFloat(
        pixabayResponse.data.totalHits / pixabayResponse.data.hits.lenght
      ).toFixed(0);
      console.log(`
        Search Active Text: ${searchText}
        Search Active Page: ${searchActivePage}
        Search Max Page: ${searchMaxPage}
      `);
      if (pixabayResponse.data.hits.lenght === 0) {
        iziToast.error({
          position: `topRight`,
          color: `red`,
          message: `Sorry, there are no images matching your search query.Please try again!!`,
        });
      }
      if (searchActivePage < searchMaxPage) {
        document.querySelector(`#nextPage`).style.display = `block`;
        document.querySelector(`#nextPage`).textContent = `Next Page (${
          sear + 1
        })`;
      }

      resolve(pixabayResponse);
    }
  });
};

const renderPhotos = async () => {
  const search = searchText;
  const photosResponse = await searchPhotos(search, searchActivePage);
  const photos = photosResponse.data.hits;

  galleryList.innerHTML = '';
  if (photos.lenght === 0) {
    iziToast.error({
      position: `topRight`,
      color: `red`,
      message: `Sorry, there are no images matching your search query.Please try again!!`,
    });
  } else {
    photos.forEach(photo => {
      galleryItem(photo);
    });
    galleryBox.refresh();
  }
};

form.addEventListener(`submit`, async e => {
  e.preventDefault();
  galleryList.innerHTML = '';
  const search = e.target.elements.search.value;
  searchText = search;
  searchActivePage = 1;
  searchMaxPage = undefined;
  if (search === ``) {
    iziToast.warning({
      position: `topRight`,
      color: `yellow`,
      message: `Please enter a valid search query!!`,
    });
    return false;
  } else {
    const item = document.createElement(`li`);
    item.classList.add(`gallery-item`);

    const itemLoader = document.createElement(`span`);
    itemLoader.classList.add(`loader`);

    item.appendChild(itemLoader);
    item.style.textAlign = `center`;
    item.style.border = `none`;
    galleryList.appendChild(item);
    renderPhotos();
    e.target.reset();
  }
});

document.querySelector(`#nextPage`).addEventListener(`click`, async e => {
  searchActivePage++;
  renderPhotos();

  const galleryItemi = document.querySelector(`.gallery-item`);
  if (galleryItemi) {
    const cardHeight = galleryItemi.getBoundingClientRect().height;
    window.scrollBy({
      top: cardHeight * 2.75,
      behavior: `smooth`,
    });
  }
  if (searchActivePage === searchMaxPage) {
    document.querySelector(`#nextPage`).dispatchEvent(`click`);
    iziToast.info({
      positon: `topRight`,
      message: "we're sorry,but you've reached the end of the search results",
    });
  }
});
