import { FALLBACK_QUOTES } from './utils.js';

const clock = document.getElementById("clock");
const quoteTimeBar = document.getElementById("quote-time-bar");
const addQuoteLink = document.getElementById("add-quote");
const urlParams = new URLSearchParams(window.location.search);
const testTime = urlParams.get('time');
const testQuote = urlParams.get('quote');
const zenMode = urlParams.has('zen');
const sfw = urlParams.has('sfw');
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

        if (sfw) {
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
    }

    addQuoteLink.href = url.href;

    return quote;
}   

async function updateTime(testTime) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds() / 1000;
    const secondsWithDecimal = seconds + milliseconds;
    let quotes = [];
    let quote = {};
    let html = [];

    const time = testTime || `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const fileName = time.replace(":", "_");

    if (!testTime && !testQuote) {
        quoteTimeBar.style.width = `${(secondsWithDecimal*100) / 60}%`;
        quoteTimeBar.style.transition = seconds === 0 ? 'none' : 'width 1s linear';
    }

    if (lastTime !== time) {
        quotes = await getQuotes(fileName);
        quote = getQuote(quotes, time);

        if (!testTime && !testQuote) {
            document.title = `[${time}] Reloj Literario`;
        }

        html.push(`<blockquote aria-label="${quote.time}">`);
        html.push(`<p>${testQuote || `${quote.quote_first}<span class="quote-time">${quote.quote_time_case}</span>${quote.quote_last}`}</p>`);
        html.push(`<cite>— ${quote.title}, ${quote.author}</cite>`);

        if (quote.missingQuoteMessage) {
            html.push(`<div id="footnote">${quote.missingQuoteMessage}</div>`);
        }

        html.push(`</blockquote>`);

        clock.innerHTML = html.join('').replace(/\r\n/g, "<br>");
        lastTime = time;
    }
}

if(!zenMode) {
    document.body.classList.remove('zen-mode');
}

updateTime(testTime);
getStatistics();

if (!testTime && !testQuote) {
    setInterval(updateTime, 1000);
}