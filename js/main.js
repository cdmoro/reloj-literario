import { FALLBACK_QUOTES } from './utils.js';

const clock = document.getElementById("clock");
const addQuoteLink = document.getElementById("add-quote");
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

        return await response.json();
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
        quote.missingQuoteMessage = /*html*/`(si sabés de alguna cita hacé click <a href='${url.href}' target='_blank'>acá</a> o escribime!)`;
    }

    addQuoteLink.textContent = `Agregar cita (${time})`;
    addQuoteLink.href = url.href;

    return quote;
}

async function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let quotes = [];
    let quote = {};
    let html = "";
    const fileName = `${hours.toString().padStart(2, '0')}_${minutes.toString().padStart(2, '0')}`;
    const time = fileName.replace("_", ":");

    if (lastTime !== time) {
        //const response = await fetch(`../times/${fileName}.json`);
        //quotes = await response.json();
        quotes = await getQuotes(fileName);
        quote = getQuote(quotes, time);
        
        html = /*html*/`
            <blockquote aria-label="${quote.time}">
                <p>${quote.quote_first}<strong>${quote.quote_time_case}</strong>${quote.quote_last}</p>
                <cite>— ${quote.title}, ${quote.author}</cite>
        `;

        if (quote.missingQuoteMessage) {
            html += /*html*/`
                <div id="missing-quote-message">${quote.missingQuoteMessage}</div>
            `;
        }

        html += `</blockquote>`;

        clock.innerHTML = html.replace(/\r\n/g, "<br>");
        lastTime = time;
    }
}

updateTime();
getStatistics();

setInterval(updateTime, 1000);