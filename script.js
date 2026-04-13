const LANG_KEY = "brasaland_lang";
const LOYALTY_KEY = "brasaland_loyalty_registered";

const RESTAURANTS = [
  { id: "co-med-poblado", country: "co", name: { es: "Medellin - El Poblado", en: "Medellin - El Poblado" } },
  { id: "co-med-laureles", country: "co", name: { es: "Medellin - Laureles", en: "Medellin - Laureles" } },
  { id: "co-med-belen", country: "co", name: { es: "Medellin - Belen", en: "Medellin - Belen" } },
  { id: "co-envigado", country: "co", name: { es: "Envigado - Viva", en: "Envigado - Viva" } },
  { id: "co-sabaneta", country: "co", name: { es: "Sabaneta - Mayorca", en: "Sabaneta - Mayorca" } },
  { id: "co-rionegro", country: "co", name: { es: "Rionegro - San Nicolas", en: "Rionegro - San Nicolas" } },
  { id: "co-bog-usaquen", country: "co", name: { es: "Bogota - Usaquen", en: "Bogota - Usaquen" } },
  { id: "co-bog-rosales", country: "co", name: { es: "Bogota - Rosales", en: "Bogota - Rosales" } },
  { id: "co-cali-granada", country: "co", name: { es: "Cali - Granada", en: "Cali - Granada" } },
  { id: "us-miami-brickell", country: "us", name: { es: "Miami - Brickell", en: "Miami - Brickell" } },
  { id: "us-miami-doral", country: "us", name: { es: "Miami - Doral", en: "Miami - Doral" } },
  { id: "us-miami-beach", country: "us", name: { es: "Miami Beach - Collins", en: "Miami Beach - Collins" } },
  { id: "us-fort-lauderdale", country: "us", name: { es: "Fort Lauderdale", en: "Fort Lauderdale" } },
  { id: "us-orlando-lake-nona", country: "us", name: { es: "Orlando - Lake Nona", en: "Orlando - Lake Nona" } }
];

const COUNTRY_SCHEDULES = {
  co: {
    open: "12:00",
    close: "22:00",
    ranges: [
      ["12:00", "15:00"],
      ["19:00", "22:00"]
    ]
  },
  us: {
    open: "11:00",
    close: "20:00",
    ranges: [
      ["11:00", "13:30"],
      ["16:30", "20:00"]
    ]
  }
};

const COUNTRY_TIMEZONES = {
  co: "America/Bogota",
  us: "America/New_York"
};

window.BRASALAND_COUNTRY_SCHEDULES = COUNTRY_SCHEDULES;
window.BRASALAND_COUNTRY_TIMEZONES = COUNTRY_TIMEZONES;

const translations = {
  es: {
    brandTagline: "Grill House",
    languageToggle: "EN",
    backHome: "Inicio",
    bookNow: "Reservar",
    navValue: "Valor",
    navHow: "Como Funciona",
    navExpansion: "Expansion",
    navMenu: "Carta",
    navHours: "Horarios",
    heroBadge: "Desde 2008",
    heroTitle: "La Brasa Que Une Medellin Y Miami",
    heroSubtitle: "14 restaurantes, una misma firma de sabor. Brasaland combina cocina premium a la brasa, hospitalidad cercana y ejecucion impecable.",
    heroPrimary: "Explorar Carta",
    heroSecondary: "Reservar Mesa",
    valueEyebrow: "Nuestra propuesta",
    valueTitle: "Tres pilares de una marca internacional",
    pillar1Title: "Consistencia total",
    pillar1Text: "Misma receta, misma tecnica, mismo sabor en cada local de Medellin y Florida.",
    pillar2Title: "Servicio calido",
    pillar2Text: "Una experiencia confiable donde cada equipo cuida al cliente como en casa.",
    pillar3Title: "Rapidez operativa",
    pillar3Text: "Procesos de cocina optimizados para servir platos premium con agilidad.",
    step1Title: "Seleccion premium",
    step1Text: "Cortes certificados y abastecimiento controlado en ambos paises.",
    step2Title: "Maestria a la brasa",
    step2Text: "Tecnica estandarizada y entrenamiento continuo para una coccion perfecta.",
    step3Title: "Entrega impecable",
    step3Text: "Servicio cercano, tiempos agiles y consistencia en cada visita.",
    expansionEyebrow: "Expansion internacional",
    expansionTitle: "De Medellin al sur de Florida",
    expansionText: "Con liderazgo de Mariana Restrepo desde 2019, Brasaland consolidó 14 restaurantes en dos mercados, manteniendo una operacion coordinada y una identidad culinaria unica.",
    colombiaLabel: "Colombia",
    locations: "restaurantes",
    menuEyebrow: "Carta Brasaland",
    menuTitle: "Carnes a la brasa y menu infantil",
    item1Name: "Ribeye Signature",
    item1Desc: "Corte premium de 350g, mantequilla de ajo ahumado y papas rusticas.",
    item2Name: "Punta de Anca",
    item2Desc: "280g de res seleccionada, chimichurri de la casa y vegetales salteados.",
    item3Name: "Costillas BBQ Brasa",
    item3Desc: "Costillas de cerdo de coccion lenta, glaseado artesanal y mazorca grillada.",
    kidsBadge: "Menu Infantil",
    item4Name: "Mini Brasa Combo",
    item4Desc: "Mini burger de res, papas crocantes y jugo natural.",
    hoursEyebrow: "Horarios",
    hoursTitle: "Atendemos en dos paises, con la misma excelencia",
    lunch: "Almuerzo",
    dinner: "Cena",
    footerClaim: "Cocina a la brasa con consistencia internacional.",
    footerContact: "Contacto",
    footerLinks: "Accesos",
    rights: "Todos los derechos reservados.",
    reserveEyebrow: "Reservas Brasaland",
    reserveTitle: "Reserva tu mesa en minutos",
    reserveSubtitle: "Selecciona fecha, hora y cantidad de invitados. Si vienes con ninos, activa la opcion de tronas para preparar tu experiencia perfecta.",
    reservationFormTitle: "Sistema de reservas",
    fieldName: "Nombre completo",
    fieldDate: "Fecha",
    fieldTime: "Hora",
    fieldCountry: "Pais del restaurante",
    fieldRestaurant: "Restaurante",
    fieldAdults: "N. adultos",
    fieldChildren: "N. ninos",
    fieldHighchair: "Necesitas tronas?",
    selectCountry: "Selecciona un pais",
    selectRestaurant: "Selecciona un restaurante",
    countryCO: "Colombia",
    countryUS: "Estados Unidos",
    timeHintDefault: "Selecciona pais y restaurante para ver horarios disponibles.",
    timeHintCO: "Horarios Colombia: 12:00-15:00 y 19:00-22:00.",
    timeHintUS: "Horarios USA: 11:00-13:30 y 16:30-20:00.",
    selectOption: "Selecciona una opcion",
    reserveButton: "Confirmar reserva",
    loyaltyTitle: "Brasa Club",
    loyaltySubtitle: "Crea tu cuenta y accede a promociones exclusivas para clientes registrados.",
    fieldPassword: "Contrasena",
    loyaltyButton: "Crear cuenta",
    offersTitle: "Ofertas exclusivas",
    offersLockedMessage: "Solo usuarios registrados pueden acceder a promociones especiales.",
    offer1: "15% de descuento en Ribeye Signature (lunes a jueves).",
    offer2: "Postre de la casa sin costo en tu primera reserva online.",
    offer3: "Upgrade a entrada premium en reservas para 4+ adultos."
  },
  en: {
    brandTagline: "Premium Grill",
    languageToggle: "ES",
    backHome: "Home",
    bookNow: "Book",
    navValue: "Value",
    navHow: "How It Works",
    navExpansion: "Expansion",
    navMenu: "Menu",
    navHours: "Hours",
    heroBadge: "Since 2008",
    heroTitle: "The Grill Signature Of Medellin And Miami",
    heroSubtitle: "14 restaurants, one flavor standard. Brasaland delivers premium grilling, warm hospitality, and fast execution.",
    heroPrimary: "Explore Menu",
    heroSecondary: "Book A Table",
    valueEyebrow: "Our value",
    valueTitle: "Three pillars of an international brand",
    pillar1Title: "Total consistency",
    pillar1Text: "Same recipe, same technique, same flavor in Medellin and Florida.",
    pillar2Title: "Warm service",
    pillar2Text: "A reliable guest experience where every team hosts you like family.",
    pillar3Title: "Operational speed",
    pillar3Text: "Optimized kitchen workflows to serve premium dishes quickly.",
    step1Title: "Premium sourcing",
    step1Text: "Certified cuts and controlled sourcing across both countries.",
    step2Title: "Grill mastery",
    step2Text: "Standardized technique and ongoing training for perfect cooking.",
    step3Title: "Flawless delivery",
    step3Text: "Warm service, fast times, and consistency on every visit.",
    expansionEyebrow: "International expansion",
    expansionTitle: "From Medellin to South Florida",
    expansionText: "Led by Mariana Restrepo since 2019, Brasaland scaled to 14 restaurants in two markets while preserving one culinary identity.",
    colombiaLabel: "Colombia",
    locations: "restaurants",
    menuEyebrow: "Brasaland Menu",
    menuTitle: "Grilled meats and kids menu",
    item1Name: "Signature Ribeye",
    item1Desc: "350g premium cut, smoked garlic butter, and rustic potatoes.",
    item2Name: "Sirloin Cap",
    item2Desc: "280g selected beef, house chimichurri, and sauteed vegetables.",
    item3Name: "BBQ Brasa Ribs",
    item3Desc: "Slow-cooked pork ribs, artisan glaze, and grilled corn.",
    kidsBadge: "Kids Menu",
    item4Name: "Mini Brasa Combo",
    item4Desc: "Mini beef burger, crispy fries, and natural juice.",
    hoursEyebrow: "Hours",
    hoursTitle: "Serving two countries with one excellence standard",
    lunch: "Lunch",
    dinner: "Dinner",
    footerClaim: "Grill cuisine with international consistency.",
    footerContact: "Contact",
    footerLinks: "Quick Links",
    rights: "All rights reserved.",
    reserveEyebrow: "Brasaland Reservations",
    reserveTitle: "Book your table in minutes",
    reserveSubtitle: "Choose date, time, and guest count. If children join, enable highchair options for a perfect experience.",
    reservationFormTitle: "Reservation system",
    fieldName: "Full name",
    fieldDate: "Date",
    fieldTime: "Time",
    fieldCountry: "Restaurant country",
    fieldRestaurant: "Restaurant",
    fieldAdults: "Adults",
    fieldChildren: "Children",
    fieldHighchair: "Need highchairs?",
    selectCountry: "Select a country",
    selectRestaurant: "Select a restaurant",
    countryCO: "Colombia",
    countryUS: "United States",
    timeHintDefault: "Select country and restaurant to view available hours.",
    timeHintCO: "Colombia hours: 12:00-15:00 and 19:00-22:00.",
    timeHintUS: "USA hours: 11:00-13:30 and 16:30-20:00.",
    selectOption: "Select an option",
    reserveButton: "Confirm reservation",
    loyaltyTitle: "Brasa Club",
    loyaltySubtitle: "Create your account and unlock exclusive offers for registered guests.",
    fieldPassword: "Password",
    loyaltyButton: "Create account",
    offersTitle: "Exclusive offers",
    offersLockedMessage: "Only registered users can access special promotions.",
    offer1: "15% off Signature Ribeye (Monday to Thursday).",
    offer2: "Complimentary dessert on your first online booking.",
    offer3: "Premium starter upgrade for reservations of 4+ adults."
  }
};

function getCurrentLang() {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === "es" || stored === "en") {
    return stored;
  }
  return "es";
}

function formatPrice(value, lang) {
  const amount = Number(value);
  if (lang === "en") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(amount);
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(amount);
}

function applyLanguage(lang) {
  const dictionary = translations[lang] || translations.es;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (dictionary[key]) {
      element.textContent = dictionary[key];
    }
  });

  document.querySelectorAll("[data-price]").forEach((priceNode) => {
    const cop = priceNode.getAttribute("data-price-cop");
    const usd = priceNode.getAttribute("data-price-usd");
    const value = lang === "en" ? usd : cop;
    priceNode.textContent = formatPrice(value, lang);
  });

  const toggle = document.getElementById("language-toggle");
  if (toggle) {
    toggle.textContent = dictionary.languageToggle;
  }

  refreshReservationSelectors(lang);
}

function setupLanguageToggle() {
  const languageToggle = document.getElementById("language-toggle");
  if (!languageToggle) {
    return;
  }

  languageToggle.addEventListener("click", () => {
    const current = getCurrentLang();
    const next = current === "es" ? "en" : "es";
    localStorage.setItem(LANG_KEY, next);
    applyLanguage(next);
  });
}

function setupChildrenHighchairToggle() {
  const childrenInput = document.getElementById("res-children");
  const highchairWrapper = document.getElementById("highchair-wrapper");
  if (!childrenInput || !highchairWrapper) {
    return;
  }

  const onChildrenChange = () => {
    const value = Number(childrenInput.value || 0);
    if (value > 0) {
      highchairWrapper.classList.remove("hidden");
    } else {
      highchairWrapper.classList.add("hidden");
      const select = document.getElementById("res-highchair");
      if (select) {
        select.value = "";
      }
    }
  };

  childrenInput.addEventListener("input", onChildrenChange);
  onChildrenChange();
}

function timeToMinutes(value) {
  if (!value || !value.includes(":")) {
    return -1;
  }
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return -1;
  }
  return (hours * 60) + minutes;
}

function buildTimeSlots(country) {
  const schedule = COUNTRY_SCHEDULES[country];
  if (!schedule) {
    return [];
  }

  const slots = [];
  schedule.ranges.forEach(([start, end]) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    for (let minute = startMinutes; minute <= endMinutes; minute += 30) {
      const h = String(Math.floor(minute / 60)).padStart(2, "0");
      const m = String(minute % 60).padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
  });
  return slots;
}

function setTimeHint(country, lang) {
  const hint = document.getElementById("res-time-hint");
  if (!hint) {
    return;
  }

  const dictionary = translations[lang] || translations.es;
  if (country === "co") {
    hint.textContent = dictionary.timeHintCO;
    return;
  }
  if (country === "us") {
    hint.textContent = dictionary.timeHintUS;
    return;
  }
  hint.textContent = dictionary.timeHintDefault;
}

function applyCountrySchedule(country) {
  const timeInput = document.getElementById("res-time");
  const datalist = document.getElementById("reservation-time-slots");
  const dateInput = document.getElementById("res-date");
  const lang = getCurrentLang();
  if (!timeInput || !datalist || !dateInput) {
    return;
  }

  const timezone = COUNTRY_TIMEZONES[country];
  if (timezone) {
    const todayInCountry = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
    dateInput.min = todayInCountry;
    if (dateInput.value && dateInput.value < todayInCountry) {
      dateInput.value = "";
    }
  } else {
    dateInput.removeAttribute("min");
  }

  const schedule = COUNTRY_SCHEDULES[country];
  if (!schedule) {
    timeInput.removeAttribute("min");
    timeInput.removeAttribute("max");
    datalist.innerHTML = "";
    setTimeHint("", lang);
    return;
  }

  timeInput.min = schedule.open;
  timeInput.max = schedule.close;

  const options = buildTimeSlots(country)
    .map((slot) => `<option value="${slot}"></option>`)
    .join("");
  datalist.innerHTML = options;
  setTimeHint(country, lang);
}

function refreshReservationSelectors(lang) {
  const countrySelect = document.getElementById("res-country");
  const restaurantSelect = document.getElementById("res-restaurant");
  if (!countrySelect || !restaurantSelect) {
    return;
  }

  const selectedCountry = countrySelect.value;
  const selectedRestaurant = restaurantSelect.value;
  const dictionary = translations[lang] || translations.es;

  const countryOptions = [
    `<option value="">${dictionary.selectCountry}</option>`,
    `<option value="co">${dictionary.countryCO}</option>`,
    `<option value="us">${dictionary.countryUS}</option>`
  ].join("");
  countrySelect.innerHTML = countryOptions;
  countrySelect.value = selectedCountry;

  const candidates = RESTAURANTS.filter((item) => item.country === selectedCountry);
  const restaurantsOptions = [
    `<option value="">${dictionary.selectRestaurant}</option>`,
    ...candidates.map((item) => `<option value="${item.id}">${item.name[lang]}</option>`)
  ].join("");
  restaurantSelect.innerHTML = restaurantsOptions;

  if (candidates.some((item) => item.id === selectedRestaurant)) {
    restaurantSelect.value = selectedRestaurant;
  }

  applyCountrySchedule(selectedCountry);
}

function setupReservationLocationControls() {
  const countrySelect = document.getElementById("res-country");
  const restaurantSelect = document.getElementById("res-restaurant");
  if (!countrySelect || !restaurantSelect) {
    return;
  }

  const lang = getCurrentLang();
  refreshReservationSelectors(lang);

  countrySelect.addEventListener("change", () => {
    const currentLang = getCurrentLang();
    refreshReservationSelectors(currentLang);
  });

  restaurantSelect.addEventListener("change", () => {
    const selected = RESTAURANTS.find((item) => item.id === restaurantSelect.value);
    if (!selected) {
      return;
    }
    countrySelect.value = selected.country;
    applyCountrySchedule(selected.country);
  });
}

function updateLoyaltyOffers() {
  const offers = document.getElementById("offers-list");
  const message = document.querySelector("[data-i18n='offersLockedMessage']");
  if (!offers || !message) {
    return;
  }

  const isRegistered = localStorage.getItem(LOYALTY_KEY) === "true";
  if (isRegistered) {
    offers.classList.remove("hidden");
    message.classList.add("hidden");
  } else {
    offers.classList.add("hidden");
    message.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const lang = getCurrentLang();
  applyLanguage(lang);
  setupLanguageToggle();
  setupReservationLocationControls();
  setupChildrenHighchairToggle();
  updateLoyaltyOffers();
});