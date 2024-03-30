import { NOT_FOUND_QUOTES } from './utils.js';

const clock = document.getElementById("clock");
let lastTime;
let times;

function getRandomItem(quotes, time) {
    if (!quotes.length) {
        quotes = NOT_FOUND_QUOTES;
    }

    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    if (!quote.quote_time_case) {
        quote.time = time;
        quote.quote_time_case = time;
        quote.link = /*html*/`(si sabés de alguna hace click <a href='https://github.com/cdmoro/reloj-literario/issues/new?title=%5B${time}%5D Nueva%20frase' target='_blank'>acá</a> o escribinos!)`;
    }

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
        const response = await fetch(`../times/${fileName}.json`);
        quotes = await response.json();
        quote = getRandomItem(quotes, time);

        html = /*html*/`
            <blockquote aria-label="${quote.time}">
                <p>${quote.quote_first}<strong>${quote.quote_time_case}</strong>${quote.quote_last}</p>
                <cite>${quote.title}, ${quote.author}</cite>
        `;

        if (quote.link) {
            html += /*html*/`
                <div id="link">${quote.link}</div>
            `;
        }

        html += `</blockquote>`;

        clock.innerHTML = html;
        lastTime = time;
    }
}

updateTime();
setInterval(updateTime, 1000);