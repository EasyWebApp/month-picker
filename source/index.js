(() => {

    const template = document.currentScript.previousElementSibling.content;


    class MonthPicker extends HTMLElement {

        constructor() {

            const shadow = super().attachShadow({mode: 'open'});

            shadow.appendChild( template.cloneNode( true ) );

            shadow.addEventListener('click',  (event) => {

                Array.from(
                    event.target.parentNode.children,
                    (child) => child.classList.remove('active')
                );

                event.target.classList.add('active');
            });
        }
    }

    self.customElements.define('month-picker', MonthPicker);
})();
