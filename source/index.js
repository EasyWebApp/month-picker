(() => {  'use strict';

    const _private_ = new WeakMap(),
        selector_map = {
            Range:    '.table-row > ul > li',
            Month:    'main > span',
            Year:     'nav > span'
        },
        template = document.currentScript.previousElementSibling.content;


    class MonthPicker extends HTMLElement {

        constructor() {

            _private_.set(super(),  {range: 1});

            this.attachShadow({
                mode:              'open',
                delegatesFocus:    true
            }).appendChild(
                template.cloneNode( true )
            );

            this.listen();
        }

        static get observedAttributes() {

            return  ['value', 'convention'];
        }

        attributeChangedCallback(name, oldValue, newValue) {

            switch ( newValue ) {
                case '':      this[ name ] = true;      break;
                case null:    this[ name ] = false;     break;
                default:      this[ name ] = newValue;
            }
        }

        get range() {

            return  _private_.get( this ).range;
        }

        get defaultValue() {

            return this.getAttribute('value');
        }

        get value() {

            return  _private_.get( this ).value;
        }

        set value(value) {

            this.shadowRoot.querySelector('div[contenteditable]').textContent =
                _private_.get( this ).value = value + '';

            const event = document.createEvent('Event');

            event.initEvent('change', true, false);

            this.shadowRoot.host.dispatchEvent( event );
        }

        set convention(value) {

            _private_.get( this ).convention = value;
        }

        get convention() {

            return  _private_.get( this ).convention;
        }

        static targetOf(event) {

            const target = event.composedPath ? event.composedPath() : event.path;

            return  (target || '')[0]  ||  event.target;
        }

        show(visible, event) {

            const layer = this.shadowRoot.querySelector(
                'div[contenteditable] + .table-row'
            );

            if (! visible)  return  (! layer.hidden) && (layer.hidden = true);

            const coord = MonthPicker.targetOf( event ).getBoundingClientRect();

            layer.style.left = coord.left;

            layer.style.top = coord.bottom;

            if ( layer.hidden )  layer.hidden = false;
        }

        listen() {

            const year = this.shadowRoot.querySelector('nav > div'),
                month = this.shadowRoot.querySelectorAll( selector_map.Month );

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

            this.shadowRoot.querySelector('div[contenteditable]').addEventListener(
                'blur',  event => {

                    const date = new Date( event.target.textContent.split(',')[0] );

                    if (date == 'Invalid Date')  return event.target.focus();

                    year.textContent = date.getFullYear();

                    this.switchMonth( month[ date.getMonth() ] );
                }
            );
        }

        makeDate(month) {

            const year = this.shadowRoot.querySelector('nav > div').textContent;

            month = month  ?  `${year}-${month.padStart(2, 0)}`  :  Date.now();

            return  (new Date( month )).toISOString().slice(0, 7);
        }

        connectedCallback() {

            this.value = this.defaultValue || this.makeDate();

            const value = this.value.split('-');

            this.shadowRoot.querySelector('nav > div').textContent = value[0];

            this.switchRange(
                this.shadowRoot.querySelector( selector_map.Range )
            );

            this.switchMonth(
                this.shadowRoot.querySelector(
                    `${selector_map.Month}:nth-child(${+value[1]})`
                )
            );
        }

        static indexOf(element) {

            var index = 0;

            while (element = element.previousElementSibling)  index++;

            return index;
        }

        toggleActive(target,  range = 1) {

            const active = MonthPicker.indexOf( target ), list = [ ];

            Array.from(target.parentNode.children,  (child, index) => {

                if ((child === target)  ||  (
                    (index > active)  &&  (index < active + range)
                )) {
                    child.classList.add('active');

                    list.push( child.textContent );
                } else
                    child.classList.remove('active');
            });

            return list;
        }

        switchMonth(first) {

            first = first || this.shadowRoot.querySelector('main > .active');

            if (! first)  return;

            if ( this.convention )
                first = this.shadowRoot.querySelectorAll( selector_map.Month )[
                    this.range * Math.floor(
                        MonthPicker.indexOf( first ) / this.range
                    )
                ];

            const active = this.toggleActive(first, this.range);

            const last = active[1] && active.pop();

            this.value = [
                this.makeDate( active[0] ),  last && this.makeDate( last )
            ];
        }

        switchRange(target) {

            const _this_ = _private_.get( this );

            this.toggleActive(target);

            _this_.range = +target.dataset.range;

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
