import { FALLBACK_QUOTES } from './utils.js';

const clock = document.getElementById("clock");
const quoteTimeBar = document.getElementById("quote-time-bar");
const addQuoteLink = document.getElementById("add-quote");
const urlParams = new URLSearchParams(window.location.search);
const testTime = urlParams.get('time');
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
        quote.missingQuoteMessage = /*html*/`<span class="star">*</span> si sabés de alguna cita hacé click <a href='${url.href}' target='_blank'>acá</a> o escribime!`;
    }

    addQuoteLink.href = url.href;

    return quote;
}   

async function updateTime(testTime) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let quotes = [];
    let quote = {};
    let html = "";

    const time = testTime || `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const fileName = time.replace(":", "_");

    if (lastTime !== time) {
        quotes = await getQuotes(fileName);
        quote = getQuote(quotes, time);
        
        html = /*html*/`
            <blockquote aria-label="${quote.time}">
                <p>${quote.quote_first}<span class="quote-time">${quote.quote_time_case}</span>${quote.quote_last}</p>
                <cite>— ${quote.title}, ${quote.author}</cite>
        `;

        if (quote.missingQuoteMessage) {
            html += /*html*/`
                <div id="footnote">${quote.missingQuoteMessage}</div>
            `;
        }

        html += `</blockquote>`;

        clock.innerHTML = html.replace(/\r\n/g, "<br>");
        lastTime = time;
    }
}

function updateQuoteTime() {
    const now = new Date();
    const s = now.getSeconds();
    const ms = now.getMilliseconds() / 1000;
    const seconds = s + ms;

    quoteTimeBar.style.width = `${(seconds*100) / 60}%`;
    quoteTimeBar.style.transition = s === 0 ? 'none' : 'width 1s linear';
}

updateTime(testTime);
getStatistics();

if (!testTime) {
    setInterval(updateTime, 1000);
    setInterval(updateQuoteTime, 1000);
}