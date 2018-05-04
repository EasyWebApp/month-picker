(() => {  'use strict';

    const selector_map = {
        Step:    '.table-row > ul > li',
        Month:    'main > span',
        Year:     'nav > span'
    };


    customElements.define('month-picker',  class MonthPicker extends EWA.component() {

        constructor() {

            super().listen();
        }

        static get observedAttributes() {

            return this.defineAccessor({
                value:         1,
                step:          1,
                convention:    3
            });
        }

        get defaultValue() {

            return this.getAttribute('value');
        }

        set value(value) {

            if ((value instanceof Array)  &&  (! value[1]))  value.pop();

            this.$('div[contenteditable]')[0].textContent =
                EWA.set(this,  'value',  value + '');

            const event = document.createEvent('Event');

            event.initEvent('change', true, false);

            this.shadowRoot.host.dispatchEvent( event );
        }

        show(visible, event) {

            const layer = this.$('div[contenteditable] + .table-row')[0];

            if (! visible)  return  (! layer.hidden) && (layer.hidden = true);

            const coord = MonthPicker.targetOf( event ).getBoundingClientRect();

            layer.style.left = coord.left;

            layer.style.top = coord.bottom;

            if ( layer.hidden )  layer.hidden = false;
        }

        listen() {

            const year = this.$('nav > div')[0],
                month = this.$( selector_map.Month );

            this.shadowRoot.host.addEventListener(
                'focus',  this.show.bind(this, true)
            );

            this.shadowRoot.host.addEventListener(
                'blur',  this.show.bind(this, false)
            );

            this.shadowRoot.addEventListener('click',  event => {

                const target = event.target;

                for (let key  in  selector_map)
                    if (target.matches( selector_map[key] ))
                        this['switch' + key]( target );
            });

            this.$('div[contenteditable]')[0].addEventListener(
                'blur',  event => {

                    const date = new Date( event.target.textContent.split(',')[0] );

                    if (date == 'Invalid Date')  return event.target.focus();

                    year.textContent = date.getFullYear();

                    this.switchMonth( month[ date.getMonth() ] );
                }
            );
        }

        makeDate(month) {

            const year = this.$('nav > div')[0].textContent;

            month = month  ?  `${year}-${month.padStart(2, 0)}`  :  Date.now();

            return  (new Date( month )).toISOString().slice(0, 7);
        }

        set step(value) {

            EWA.set(this, 'step', value);

            this.switchStep(
                this.$(`${
                    selector_map.Step
                }[data-step="${
                    this.convention ? 1 : value
                }"]`)[0]
            );
        }

        connectedCallback() {

            this.value = this.defaultValue || this.makeDate();

            const value = this.value.split('-');

            this.$('nav > div')[0].textContent = value[0];

            if (! this.step)  this.step = 1;

            this.switchMonth(
                this.$(`${ selector_map.Month }:nth-child(${ +value[1] })`)[0]
            );
        }

        toggleActive(target,  step = 1) {

            const active = MonthPicker.indexOf( target ), list = [ ];

            Array.from(target.parentNode.children,  (child, index) => {

                if ((child === target)  ||  (
                    (index > active)  &&  (index < active + step)
                )) {
                    child.classList.add('active');

                    list.push( child.textContent );
                } else
                    child.classList.remove('active');
            });

            return list;
        }

        switchMonth(first) {

            first = first || this.$('main > .active')[0];

            if (! first)  return;

            if ( this.convention )
                first = this.$( selector_map.Month )[
                    this.step * Math.floor(
                        MonthPicker.indexOf( first ) / this.step
                    )
                ];

            const active = this.toggleActive(first, this.step);

            const last = active[1] && active.pop();

            this.value = [
                this.makeDate( active[0] ),  last && this.makeDate( last )
            ];
        }

        switchStep(target) {

            if (! target)  return;

            this.toggleActive(target);

            EWA.set(this, 'step', +target.dataset.step);

            this.switchMonth();
        }

        switchYear (target) {

            if ( target.previousElementSibling )
                target.previousElementSibling.textContent++;
            else
                target.nextElementSibling.textContent--;

            this.switchMonth();
        }
    });
})();
