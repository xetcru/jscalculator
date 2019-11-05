// контсанты пределов
const CREDIT_MIN = 5000;
const CREDIT_MAX = 15000000;
const FIRSTCONTRIBUTION_MIN = 5000;
const FIRSTCONTRIBUTION_MAX = 15000000;
const CREDIT_YEAR_MIN = 1;
const CREDIT_YEAR_MAX = 120;

// определяем элементы из верстки
const creditText = document.querySelector('#creditText');
const creditRange = document.querySelector('#creditRange');

// константы для блока первоначального взноса
const firstContributionText = document.querySelector('#firstContributionText');
const firstContributionRange = document.querySelector('#firstContributionRange');

// константы для срока кредита
const returnPeriodText = document.querySelector('#returnPeriodText');
const returnPeriodRange = document.querySelector('#returnPeriodRange');

// форматируем результат - разбиваем по три цифры, добавляем "₽"
const formatterNumber = new Intl.NumberFormat('ru');
const formatterCurrency = new Intl.NumberFormat('ru', {
    style: 'currency',
    currency: 'RUB',
    // убираем копейки
    minimumFractionDigits: 0
});

// года
const formatterDate = {
    format (years) {
        years = parseInt(years);
        let count = years % 10;
        let txt = 'лет';

        if (years >= 5 && years <= 20) {
            txt = 'лет';
        } else {
            if (count == 1) {
                txt = 'год';
            } else {
                if (count >= 2 && count <=4) {
                    txt = 'года';
                }
            }
        }
        return years + ' ' + txt;
    }
};

/* кстати, последовательность событий:
focus -> keydown -> keypress -> input -> keyup*/

// массивы констант
setDoubleDependencies(
    creditText,
    creditRange,
    formatterNumber,
    formatterCurrency,
    CREDIT_MIN,
    CREDIT_MAX
);
setDoubleDependencies(
    firstContributionText,
    firstContributionRange,
    formatterNumber,
    formatterCurrency,
    FIRSTCONTRIBUTION_MIN,
    FIRSTCONTRIBUTION_MAX
);
setDoubleDependencies(
    returnPeriodText,
    returnPeriodRange,
    formatterNumber,
    formatterDate,
    CREDIT_YEAR_MIN,
    CREDIT_YEAR_MAX
);

setReaction(
    creditText,
    creditRange,
    firstContributionText,
    firstContributionRange,
    returnPeriodText,
    returnPeriodRange,
    // добавляем функцию
    mainProcess
);

// вызываем ф-ю mainProcess, что бы отображался сразу корректный результат
mainProcess();

// дублирующие запросы оборачиваем в одну функцию
function setDoubleDependencies(textElement, rangeElement, formatterNumber, formatterGoal, min, max) {
    const middle = (min + max) / 2

    rangeElement.setAttribute('min', min)
    rangeElement.setAttribute('max', max)
    rangeElement.value = middle
    textElement.value = formatterGoal.format(middle)

    textElement.addEventListener('focus', function (event) {
        let number = '';
        
        for (const letter of this.value) {
            if ('0123456789'.includes(letter)) {
                number += letter;
            }
        }
        
        number = parseInt(number);
    
        this.value = formatterNumber.format(number);
    });
    
    // записываем цифры в textElement из number
    textElement.addEventListener('input', function (event) {
        let number = '';

        for (const letter of this.value) {
            if ('0123456789'.includes(letter)) {
                number += letter;
            }
        }
    
        number = parseInt(number);
        // не даем уйти за лимиты
        if (number < min) {
            number = min;
        }
    
        if (number > max) {
            number = max;
        }
    
        // сопоставляем ползунок с введенным числом
        rangeElement.value = number;
    
        number = formatterNumber.format(number);
        // записываем результат в поле
        this.value = number;
    });
    
    textElement.addEventListener('blur', function (event) {
        // иначе без этого будет считать до первого пробела
        let number = '';

        for (const letter of this.value) {
            if ('0123456789'.includes(letter)) {
                number += letter;
            }
        }
        // из строки number в число number
        number = parseInt(number);
        // форматируем, как надо
        this.value = formatterGoal.format(number);
    });
    rangeElement.addEventListener('input', function (event) {
        textElement.value = formatterGoal.format(parseInt(this.value));
    });
};

function setReaction (...args) {
    const handler = args.splice(-1)[0];

    for (const element of args) {
        element.addEventListener('input', function (event) {
            handler.call(this, event, args.slice())
        });
    }
    // console.log(args, handler);
};

// вывод результатов
function mainProcess (event, elements) {  
    const credit = parseInt(creditRange.value);
    const firstContribution = parseInt(firstContributionRange.value);
    const returnPeriod = parseInt(returnPeriodRange.value);

    // проценты
    let percent = 10 + Math.log(returnPeriod) / Math.log(0.5);
    percent = parseInt(percent * 100) / 100 + 1;
    document.querySelector('#percentNumber').value = percent + ' %';

    // общая выплата
    let commonDebit = (credit - firstContribution) * (1 + percent) ^ returnPeriod;
    document.querySelector('#common').textContent = formatterCurrency.format(commonDebit);

    // переплата
    const subpayment = commonDebit - (credit - firstContribution);
    document.querySelector('#subpayment').textContent = formatterCurrency.format(subpayment);

    // итого
    const payment = subpayment / (returnPeriod * 12);
    document.querySelector('#payment').textContent = formatterCurrency.format(payment);
};

/*// Import stylesheets
import './style.css';

// Write Javascript code!
const appDiv = document.getElementById('app');
appDiv.innerHTML = `<h1>JS Starter</h1>`;*/