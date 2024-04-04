import { FALLBACK_QUOTES } from './utils.js';

const clock = document.getElementById("clock");
const quoteTimeBar = document.getElementById("quote-time-bar");
const addQuoteLink = document.getElementById("add-quote");
const urlParams = new URLSearchParams(window.location.search);
const testTime = urlParams.get('time');
const testQuote = urlParams.get('quote');
const isZenMode = urlParams.has('zen');
const isWorkMode = urlParams.has('work');
let statistics;
let lastTime;

async function getStatistics() {
    const response = await fetch(`../scripts/statistics.json`);
    statistics = await response.json();
}

async function getQuotes(fileName) {
    try {
        const response = await fetch(`../times/${fileName}.json`);

        if (!response.ok) {
            return FALLBACK_QUOTES;
        }

        let quotes = await response.json();

        if (isWorkMode) {
            quotes = quotes.filter(q => q.sfw);
        }

        if (!quotes.length) {
            return FALLBACK_QUOTES;
        }

        return quotes;
    } catch (error) {
        return FALLBACK_QUOTES;
    }
}

function getQuote(quotes, time) {
    const url = new URL('https://github.com/cdmoro/reloj-literario/issues/new');
    url.searchParams.set('template', 'agregar-cita.yaml');
    url.searchParams.set('title', `[${time}] Agregar cita`);

    const quote = Object.assign({}, quotes[Math.floor(Math.random() * quotes.length)]);

    if (!quote.quote_time_case) {
        quote.time = time;
        quote.quote_time_case = time;
        quote.missingQuoteMessage = /*html*/`<span class="star">*</span> si sabés de alguna cita hacé click <a href='${url.href}' target='_blank'>acá</a> o escribime!`;

        if (!isZenMode) {
            quote.quote_last += '*';
        }
    }

    addQuoteLink.href = url.href;

    return quote;
}

async function updateTime(testTime) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    let quotes = [];
    let quote = {};
    let html = '';

    const time = testTime || `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const fileName = time.replace(":", "_");

    if (!testTime && !testQuote) {
        quoteTimeBar.style.width = `${(seconds / 60) * 100}%`;
        quoteTimeBar.style.transition = seconds === 0 ? 'none' : 'width 1s linear';
    }

    if (lastTime !== time) {
        quotes = await getQuotes(fileName);
        quote = getQuote(quotes, time);

        if (!testTime && !testQuote) {
            document.title = `[${time}] Reloj Literario`;
        }

        if (testQuote) {
            quote.title = "Libro";
            quote.author = "Autor";
        }

        html = /*html*/`
        <blockquote aria-label="${quote.time}">
            <p>${testQuote || `${quote.quote_first}<span class="quote-time">${quote.quote_time_case}</span>${quote.quote_last}`}</p>
            <cite>— ${quote.title}, ${quote.author}</cite>`;

        if (!testQuote && quote.missingQuoteMessage) {
            html += /*html*/`<div id="footnote">${quote.missingQuoteMessage}</div>`;
        }

        html += /*html*/`</blockquote>`;

        clock.innerHTML = html.replace(/\r\n/g, "<br>");
        lastTime = time;
    }
}

function updateModeLinks() {
    const zenModeURL = new URL(window.location);
    zenModeURL.searchParams.set("zen", true);
    const zenModeLink = document.getElementById("zen-mode");
    zenModeLink.textContent = `Zen [${isZenMode ? 'ON' : 'OFF'}]`;
    zenModeLink.href = zenModeURL.href;

    const exitZenModeUrl = new URL(window.location);
    const exitZenModeLink = document.getElementById("exit-zen");
    exitZenModeUrl.searchParams.delete("zen");
    exitZenModeLink.href = exitZenModeUrl;

    const workModeURL = new URL(window.location);
    if (isWorkMode) {
        workModeURL.searchParams.delete("work");
    } else {
        workModeURL.searchParams.set("work", true);
    }
    const workModeLink = document.getElementById("work-mode");
    workModeLink.textContent = `Trabajo [${isWorkMode ? 'ON' : 'OFF'}]`;
    workModeLink.href = workModeURL.href;
}

if (!isZenMode) {
    document.body.classList.remove('zen-mode');
}

updateTime(testTime);
getStatistics();
updateModeLinks();

if (!testTime && !testQuote) {
    setInterval(updateTime, 1000);
}