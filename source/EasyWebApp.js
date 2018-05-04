(() => {  'use strict';

    const _private_ = new WeakMap();


    class WebComponent {

        static defineAccessor(map) {

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

        static targetOf(event) {

            const target = event.composedPath ? event.composedPath() : event.path;

            return  (target || '')[0]  ||  event.target;
        }

        static indexOf(element) {

            var index = 0;

            while (element = element.previousElementSibling)  index++;

            return index;
        }

        $(selector) {

            return  [... this.shadowRoot.querySelectorAll( selector )];
        }
    }


    window.EWA = {

        set(object, key, value) {

            return  _private_.get( object )[ key ] = value;
        },

        get(object, key) {

            return  _private_.get( object )[ key ];
        },

        component(parent) {

            const script = document.currentScript;

            const style = script.previousElementSibling;

            const template = style.previousElementSibling.content;

            style.remove();

            if ( style.rel )  style.setAttribute('href', style.href);

            template.insertBefore(style, template.children[0]);


            class HTMLComponent extends (
                (parent instanceof Function)  ?  parent  :  HTMLElement
            ) {
                constructor() {

                    _private_.set(super(),  { });

                    this.attachShadow({
                        mode:              'open',
                        delegatesFocus:    true
                    }).appendChild(
                        document.importNode(template, true)
                    );
                }
            }

            var config = Object.getOwnPropertyDescriptors( WebComponent );

            delete config.name;  delete config.length;  delete config.prototype;

            Object.defineProperties(HTMLComponent, config);


            config = Object.getOwnPropertyDescriptors( WebComponent.prototype );

            delete config.constructor;

            Object.defineProperties(HTMLComponent.prototype, config);

            return HTMLComponent;
        }
    };
})();
