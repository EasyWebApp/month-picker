import { component, mapProperty, mapData, on, indexOf } from 'web-cell';

import template from './index.html';

import style from './index.less';

@component({ template, style })
export default class MonthPicker extends HTMLElement {
    constructor() {
        super().buildDOM();
    }

    @mapProperty
    static get observedAttributes() {
        return ['value', 'step', 'convention'];
    }

    @mapData
    attributeChangedCallback() {}

    connectedCallback() {
        var value = this.defaultValue;

        if (!value) return;

        value = value.split('-');

        (this.year = value[0]), (this.month = value[1] - 1);
    }

    get defaultValue() {
        return this.getAttribute('value');
    }

    static get data() {
        const now = new Date();

        return {
            value: [now],
            year: now.getFullYear(),
            month: now.getMonth(),
            months: Array(12)
                .fill(0)
                .map(() => ({})),
            step: 1
        };
    }

    /**
     * @private
     *
     * @param {Date} date
     *
     * @return {String} `YYYY-MM`
     */
    static valueOf(date) {
        return /^\d+-\d+/.exec(date.toJSON())[0];
    }

    set value(raw) {
        const [start, end] = (raw + '').split(','),
            value = [];

        if (start) value.push(new Date(start));

        if (end) value.push(new Date(end));

        this.view.value = value;
    }

    get value() {
        var [start, end] = this.view.value;

        start = MonthPicker.valueOf(start);

        return end ? [start, MonthPicker.valueOf(end)] : start;
    }

    get year() {
        return this.view.year;
    }

    set year(year) {
        const [start, end] = this.view.value;

        start.setFullYear(year);

        if (end) end.setFullYear(year);

        this.view.render({ year, value: [start, end] });
    }

    static startOf(month, step) {
        return month - ((month - 1) % step);
    }

    get month() {
        return this.view.month;
    }

    set month(month) {
        if (this.convention)
            month = MonthPicker.startOf(month + 1, this.step) - 1;

        var [start, end] = this.view.value,
            { step } = this;

        start.setMonth(month);

        if (step > 1) {
            end = end || new Date();

            end.setFullYear(this.year);

            end.setUTCMonth(month + step - 1);
        } else {
            end = '';
        }

        this.view.render({ month, value: [start, end] });
    }

    isChecked(input) {
        return this.step == input.value;
    }

    isSelected(index) {
        const { month, step } = this;

        const distance = index - month;

        return distance >= 0 && distance % step === distance;
    }

    @on('click', ':host nav > span')
    changeYear(_, target) {
        target.nextElementSibling ? this.year-- : this.year++;
    }

    @on('click', ':host #Month > *')
    changeMonth(_, target) {
        this.month = indexOf(target);
    }

    @on('click', ':host main > nav input')
    changeStep(_, target) {
        this.view.render({ step: +target.value });

        this.month = this.month;
    }
}
