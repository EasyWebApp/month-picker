(() => {

    const template = document.currentScript.previousElementSibling.content;


    class MonthPicker extends HTMLElement {

        constructor() {

            const shadow = super().attachShadow({mode: 'open'});

            shadow.appendChild( template.cloneNode( true ) );

            this.range = 1;

            shadow.addEventListener('click',  (event) => {

                const target = event.target;

                if ( target.matches('.table-row > ul > li') ) {

                    this.toggleActive( target );

                    if ( target.dataset.range )
                        this.range = +target.dataset.range;

                } else if ( target.matches('main > span') )
                    this.toggleActive(target, this.range);
                else if ( target.matches('nav > span') )
                    this.switchYear( target );
            });
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

        switchYear (target) {

            if ( target.previousElementSibling )
                target.previousElementSibling.textContent++;
            else
                target.nextElementSibling.textContent--;
        }
    }

    self.customElements.define('month-picker', MonthPicker);
})();
