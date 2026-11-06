const wishlistApi = 'https://script.google.com/macros/s/AKfycbyVxkv622icNWPv6QfGRugYS98WPCwWtwHuRwkcoXdR7wXBDMcN1kFri2VHveOA0vn5/exec';
const wishlistForm = document.getElementById('wishlist-form');
const wishlistInput = document.getElementById('wishlist-artist');
const wishlistList = document.getElementById('wishlist-list');
const wishlistResults = document.querySelector('.wishlist-results');
const wishlistStatus = document.getElementById('wishlist-status');
const wishlistI18n = window.dnbI18n;
let knownWishes = [];
let requestNumber = 0;
let statusKey = 'wishlistStatusInitial';
let wishesLoaded = false;
let wishesFailed = false;

function setWishlistStatus(key) {
  statusKey = key;
  wishlistStatus.textContent = wishlistI18n.t(key);
}

setWishlistStatus('wishlistStatusInitial');

function fetchWishes() {
  return new Promise((resolve, reject) => {
    const callback = `dnbRadarWishes_${Date.now()}_${++requestNumber}`;
    const script = document.createElement('script');
    let finished = false;
    const finish = (result, error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      script.remove();
      delete window[callback];
      if (error) reject(error); else resolve(result);
    };
    window[callback] = data => finish(Array.isArray(data.items) ? data.items : []);
    script.onerror = () => finish(null, new Error('A kívánságlista most nem érhető el.'));
    const timeout = setTimeout(() => finish(null, new Error('A kívánságlista nem válaszol.')), 9000);
    script.src = `${wishlistApi}?callback=${callback}&t=${Date.now()}`;
    document.head.append(script);
  });
}

function showWishes(items) {
  knownWishes = items;
  wishesLoaded = true;
  wishesFailed = false;
  if (!items.length) {
    wishlistList.replaceChildren();
    wishlistResults.hidden = true;
    return;
  }
  const ul = document.createElement('ul');
  ul.className = 'wishlist-items';
  for (const item of items) {
    if (typeof item.artist !== 'string') continue;
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = item.artist;
    const date = document.createElement('time');
    const parsed = Date.parse(item.submittedAt);
    if (Number.isFinite(parsed)) {
      date.dateTime = item.submittedAt;
      date.textContent = new Intl.DateTimeFormat(wishlistI18n.language === 'en' ? 'en-GB' : 'hu-HU', {timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(parsed));
    }
    li.append(name, date);
    ul.append(li);
  }
  wishlistList.replaceChildren(ul);
  wishlistResults.hidden = false;
}

async function refreshWishes() {
  try { showWishes(await fetchWishes()); }
  catch (_) { wishesFailed = true; wishlistList.textContent = wishlistI18n.t('wishlistUnavailable'); wishlistResults.hidden = false; }
}

document.addEventListener('dnb-language-change', () => {
  wishlistStatus.textContent = wishlistI18n.t(statusKey);
  if (wishesLoaded) showWishes(knownWishes);
  else if (wishesFailed) { wishlistList.textContent = wishlistI18n.t('wishlistUnavailable'); wishlistResults.hidden = false; }
});

wishlistForm.addEventListener('submit', async event => {
  event.preventDefault();
  const artist = wishlistInput.value.trim().replace(/\s+/g, ' ');
  if (artist.length < 2 || artist.length > 70 || /https?:|www\.|[@<>\r\n]/i.test(artist)) {
    setWishlistStatus('wishlistValidation');
    return;
  }
  if (knownWishes.some(item => item.artist.toLocaleLowerCase() === artist.toLocaleLowerCase())) {
    setWishlistStatus('wishlistDuplicate');
    return;
  }
  if (wishlistForm.elements.website.value) return;
  const button = wishlistForm.querySelector('button');
  button.disabled = true;
  setWishlistStatus('wishlistSaving');
  const nonce = crypto.randomUUID().replaceAll('-', '');
  try {
    await fetch(wishlistApi, {
      method: 'POST', mode: 'no-cors', credentials: 'omit',
      body: new URLSearchParams({artist, nonce, website: ''})
    });
    let found = false;
    for (let attempt = 0; attempt < 7; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const items = await fetchWishes();
      showWishes(items);
      if (items.some(item => item.id === nonce || item.artist.toLocaleLowerCase() === artist.toLocaleLowerCase())) {
        found = true;
        break;
      }
    }
    setWishlistStatus(found ? 'wishlistSuccess' : 'wishlistUnconfirmed');
    if (found) wishlistInput.value = '';
  } catch (_) {
    setWishlistStatus('wishlistSubmitFailed');
  } finally { button.disabled = false; }
});

refreshWishes();
setInterval(() => { if (!document.hidden) refreshWishes(); }, 30000);
