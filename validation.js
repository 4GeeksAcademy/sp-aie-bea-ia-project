const validationMessages = {
  es: {
    required: "Este campo es obligatorio.",
    country: "Selecciona el pais del restaurante.",
    restaurant: "Selecciona uno de los 14 restaurantes.",
    name: "Ingresa un nombre valido (minimo 2 caracteres).",
    date: "Selecciona una fecha valida (hoy o futura).",
    time: "Selecciona una hora dentro del horario de apertura del pais elegido.",
    adults: "Debe haber al menos 1 adulto.",
    children: "Cantidad de ninos invalida.",
    highchair: "Selecciona cuantas tronas necesitas.",
    email: "Ingresa un correo electronico valido.",
    password: "La contrasena debe tener minimo 8 caracteres, una mayuscula y un numero.",
    reserveSuccess: "Reserva confirmada. Te contactaremos para validar disponibilidad.",
    loyaltySuccess: "Registro completado. Ya puedes acceder a ofertas exclusivas."
  },
  en: {
    required: "This field is required.",
    country: "Select the restaurant country.",
    restaurant: "Select one of the 14 restaurants.",
    name: "Enter a valid name (at least 2 characters).",
    date: "Select a valid date (today or future date).",
    time: "Select a time within the opening hours for the chosen country.",
    adults: "At least 1 adult is required.",
    children: "Invalid children count.",
    highchair: "Select how many highchairs you need.",
    email: "Enter a valid email address.",
    password: "Password must be at least 8 characters with one uppercase and one number.",
    reserveSuccess: "Reservation confirmed. We will contact you to validate availability.",
    loyaltySuccess: "Registration completed. Exclusive offers are now unlocked."
  }
};

function currentValidationLang() {
  const lang = localStorage.getItem("brasaland_lang");
  return lang === "en" ? "en" : "es";
}

function setFieldState(input, errorEl, message) {
  if (!input || !errorEl) {
    return;
  }

  if (message) {
    input.classList.remove("border-zinc-700", "focus:border-amber-400");
    input.classList.add("border-red-500", "focus:border-red-400");
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  } else {
    input.classList.remove("border-red-500", "focus:border-red-400");
    input.classList.add("border-zinc-700", "focus:border-amber-400");
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }
}

function toMinutes(value) {
  if (!value || !value.includes(":")) {
    return -1;
  }
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return -1;
  }
  return (hours * 60) + minutes;
}

function isTimeInCountrySchedule(timeValue, country) {
  const schedules = window.BRASALAND_COUNTRY_SCHEDULES;
  if (!schedules || !schedules[country]) {
    return false;
  }

  const minutes = toMinutes(timeValue);
  if (minutes < 0) {
    return false;
  }

  return schedules[country].ranges.some(([start, end]) => {
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    return minutes >= startMin && minutes <= endMin;
  });
}

function getTodayISOByCountry(country) {
  const tzMap = window.BRASALAND_COUNTRY_TIMEZONES || {};
  const timezone = tzMap[country];
  if (!timezone) {
    return null;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function validateReservationForm() {
  const form = document.getElementById("reservation-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const lang = currentValidationLang();
    const msg = validationMessages[lang];

    const nameInput = document.getElementById("res-name");
    const countryInput = document.getElementById("res-country");
    const restaurantInput = document.getElementById("res-restaurant");
    const dateInput = document.getElementById("res-date");
    const timeInput = document.getElementById("res-time");
    const adultsInput = document.getElementById("res-adults");
    const childrenInput = document.getElementById("res-children");
    const highchairInput = document.getElementById("res-highchair");

    const nameErr = document.getElementById("res-name-error");
    const countryErr = document.getElementById("res-country-error");
    const restaurantErr = document.getElementById("res-restaurant-error");
    const dateErr = document.getElementById("res-date-error");
    const timeErr = document.getElementById("res-time-error");
    const adultsErr = document.getElementById("res-adults-error");
    const childrenErr = document.getElementById("res-children-error");
    const highchairErr = document.getElementById("res-highchair-error");
    const feedback = document.getElementById("reservation-feedback");

    let isValid = true;

    const countryValue = countryInput.value;
    const validCountry = countryValue === "co" || countryValue === "us";
    setFieldState(countryInput, countryErr, validCountry ? "" : msg.country);
    if (!validCountry) {
      isValid = false;
    }

    const validRestaurant = Boolean(restaurantInput.value);
    setFieldState(restaurantInput, restaurantErr, validRestaurant ? "" : msg.restaurant);
    if (!validRestaurant) {
      isValid = false;
    }

    const nameValue = nameInput.value.trim();
    const validName = /^[a-zA-ZÀ-ÿ\s'-]{2,}$/.test(nameValue);
    setFieldState(nameInput, nameErr, validName ? "" : msg.name);
    if (!validName) {
      isValid = false;
    }

    const dateValue = dateInput.value;
    const todayISO = getTodayISOByCountry(countryValue);
    const validDate = Boolean(dateValue) && Boolean(todayISO) && dateValue >= todayISO;
    setFieldState(dateInput, dateErr, validDate ? "" : msg.date);
    if (!validDate) {
      isValid = false;
    }

    const validTime = isTimeInCountrySchedule(timeInput.value, countryValue);
    setFieldState(timeInput, timeErr, validTime ? "" : msg.time);
    if (!validTime) {
      isValid = false;
    }

    const adults = Number(adultsInput.value);
    const validAdults = Number.isInteger(adults) && adults >= 1 && adults <= 20;
    setFieldState(adultsInput, adultsErr, validAdults ? "" : msg.adults);
    if (!validAdults) {
      isValid = false;
    }

    const children = Number(childrenInput.value);
    const validChildren = Number.isInteger(children) && children >= 0 && children <= 20;
    setFieldState(childrenInput, childrenErr, validChildren ? "" : msg.children);
    if (!validChildren) {
      isValid = false;
    }

    if (children > 0) {
      const validHighchair = Boolean(highchairInput.value);
      setFieldState(highchairInput, highchairErr, validHighchair ? "" : msg.highchair);
      if (!validHighchair) {
        isValid = false;
      }
    } else {
      setFieldState(highchairInput, highchairErr, "");
    }

    if (!feedback) {
      return;
    }

    if (isValid) {
      feedback.textContent = msg.reserveSuccess;
      feedback.className = "rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300";
      form.reset();
      const highchairWrapper = document.getElementById("highchair-wrapper");
      if (highchairWrapper) {
        highchairWrapper.classList.add("hidden");
      }
    } else {
      feedback.textContent = msg.required;
      feedback.className = "rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-300";
    }
  });
}

function validateLoyaltyForm() {
  const form = document.getElementById("loyalty-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const lang = currentValidationLang();
    const msg = validationMessages[lang];

    const nameInput = document.getElementById("loy-name");
    const emailInput = document.getElementById("loy-email");
    const passwordInput = document.getElementById("loy-password");

    const nameErr = document.getElementById("loy-name-error");
    const emailErr = document.getElementById("loy-email-error");
    const passwordErr = document.getElementById("loy-password-error");
    const feedback = document.getElementById("loyalty-feedback");

    let isValid = true;

    const validName = /^[a-zA-ZÀ-ÿ\s'-]{2,}$/.test(nameInput.value.trim());
    setFieldState(nameInput, nameErr, validName ? "" : msg.name);
    if (!validName) {
      isValid = false;
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    setFieldState(emailInput, emailErr, validEmail ? "" : msg.email);
    if (!validEmail) {
      isValid = false;
    }

    const passwordValue = passwordInput.value;
    const validPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(passwordValue);
    setFieldState(passwordInput, passwordErr, validPassword ? "" : msg.password);
    if (!validPassword) {
      isValid = false;
    }

    if (!feedback) {
      return;
    }

    if (isValid) {
      localStorage.setItem("brasaland_loyalty_registered", "true");
      feedback.textContent = msg.loyaltySuccess;
      feedback.className = "rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300";
      form.reset();

      const offersList = document.getElementById("offers-list");
      const lockedMessage = document.querySelector("[data-i18n='offersLockedMessage']");
      if (offersList) {
        offersList.classList.remove("hidden");
      }
      if (lockedMessage) {
        lockedMessage.classList.add("hidden");
      }
    } else {
      feedback.textContent = msg.required;
      feedback.className = "rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-300";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  validateReservationForm();
  validateLoyaltyForm();
});