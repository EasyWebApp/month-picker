(() => {  'use strict';

    const _private_ = new WeakMap();

    const template = document.currentScript.previousElementSibling.content;


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

            return ['value'];
        }

        attributeChangedCallback(name, oldValue, newValue) {

            this[ name ] = newValue;
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

            _private_.get( this ).value = value;

            value = value.split(',');

            Array.from(
                this.shadowRoot.querySelectorAll('input'),
                (input, index)  =>  input.value = value[ index ] || ''
            );
        }

        listen() {

            const _this_ = _private_.get( this );

            const layer = this.shadowRoot.querySelector('input[name] + [hidden]');

            this.shadowRoot.addEventListener('click',  event => {

                const target = event.target;

                if ( target.matches('.table-row > ul > li') )
                    this.switchRange( target );
                else if ( target.matches('main > span') )
                    this.toggleActive(target, _this_.range);
                else if ( target.matches('nav > span') )
                    this.switchYear( target );
            });

            this.shadowRoot.host.addEventListener(
                'focus',  () => layer.hidden && (layer.hidden = false)
            );

            this.shadowRoot.host.addEventListener(
                'blur',  () => (! layer.hidden) && (layer.hidden = true)
            );
        }

        connectedCallback() {

            this.shadowRoot.querySelector('.table-row > ul > li').click();

            this.value = this.defaultValue ||
                (new Date()).toISOString().slice(0, 7);
        }

        static indexOf(element) {

            var index = 0;

            while (element = element.previousElementSibling)  index++;

            return index;
        }

        toggleActive(target,  range = 1) {

            const active = MonthPicker.indexOf( target );

            Array.from(target.parentNode.children,  (child, index) => {

                if ((child === target)  ||  (
                    (index > active)  &&  (index < active + range)
                ))
                    child.classList.add('active');
                else
                    child.classList.remove('active');
            });
        }

        switchRange(target) {

            const _this_ = _private_.get( this );

            this.toggleActive(target);

            _this_.range = +target.dataset.range;

            this.shadowRoot.querySelectorAll('input')[1].disabled =
                (_this_.range === 1);

            let first = this.shadowRoot.querySelector('main > .active');

            if (first)  this.toggleActive(first, _this_.range);
        }

        switchYear (target) {

            if ( target.previousElementSibling )
                target.previousElementSibling.textContent++;
            else
                target.nextElementSibling.textContent--;
        }
    }

    self.customElements.define('month-picker', MonthPicker);
})();
