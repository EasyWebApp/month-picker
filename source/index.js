(() => {  'use strict';

    const _private_ = new WeakMap(),
        $ = document.querySelectorAll.bind( document.currentScript.ownerDocument );

    const selector_map = {
            Step:    '.table-row > ul > li',
            Month:    'main > span',
            Year:     'nav > span'
        },
        template = $('template')[0].content,
        style = $('link[rel="stylesheet"]')[0];

    style.remove();

    style.setAttribute('href', style.href);

    template.insertBefore(style, template.children[0]);


    class MonthPicker extends HTMLElement {

        constructor() {

            _private_.set(super(),  { });

            this.attachShadow({
                mode:              'open',
                delegatesFocus:    true
            }).appendChild(
                template.cloneNode( true )
            );

            this.listen();
        }

        $(selector) {

            return  [... this.shadowRoot.querySelectorAll( selector )];
        }

        static get observedAttributes() {

            const map = {
                value:         1,
                step:          1,
                convention:    3
            };

            for (let key in map) {

                let config = {enumerable: true};

                if (map[ key ]  &  1)
                    config.get = function () {

                        return  _private_.get( this )[ key ];
                    };

                if (map[ key ]  &  2)
                    config.set = function (value) {

                        _private_.get( this )[ key ] = value;
                    };

                Object.defineProperty(this.prototype, key, config);
            }

            return  Object.keys( map );
        }

        attributeChangedCallback(name, oldValue, newValue) {

            switch ( newValue ) {
                case '':      this[ name ] = true;      break;
                case null:    this[ name ] = false;     break;
                default:      try {
                    this[ name ] = JSON.parse( newValue );

                } catch (error) {

                    this[ name ] = newValue;
                }
            }
        }

        get defaultValue() {

            return this.getAttribute('value');
        }

        set value(value) {

            if ((value instanceof Array)  &&  (! value[1]))  value.pop();

            this.$('div[contenteditable]')[0].textContent =
                _private_.get( this ).value = value + '';

            const event = document.createEvent('Event');

            event.initEvent('change', true, false);

            this.shadowRoot.host.dispatchEvent( event );
        }

        static targetOf(event) {

            const target = event.composedPath ? event.composedPath() : event.path;

            return  (target || '')[0]  ||  event.target;
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

            _private_.get( this ).step = value;

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

        static indexOf(element) {

            var index = 0;

            while (element = element.previousElementSibling)  index++;

            return index;
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

            const _this_ = _private_.get( this );

            this.toggleActive(target);

            _this_.step = +target.dataset.step;

            this.switchMonth();
        }

        switchYear (target) {

            if ( target.previousElementSibling )
                target.previousElementSibling.textContent++;
            else
                target.nextElementSibling.textContent--;

            this.switchMonth();
        }
    }

    self.customElements.define('month-picker', MonthPicker);
})();
