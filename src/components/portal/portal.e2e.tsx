import { newE2EPage } from '@stencil/core/testing';

describe('dom-portal', () => {
    it('renders', async () => {
        const page = await newE2EPage();

        await page.setContent('<dom-portal></dom-portal>');
        const element = await page.find('dom-portal');
        expect(element).toHaveClass('hydrated');
    });

    it('renders two elements', async () => {
        const page = await newE2EPage();

        await page.setContent('<dom-portal></dom-portal>');
        const elements = await page.findAll('dom-portal');

        expect(elements.length).toBe(2);
    });

    it('hides host by default', async () => {
        const page = await newE2EPage();

        await page.setContent('<dom-portal></dom-portal>');
        const element = await page.find('dom-portal');
        const style = await element.getComputedStyle();
        expect(style.display).toBe('none');
    });
})

describe('dom-portal projected', () => {
    it('sets "projected" attribute', async () => {
        const page = await newE2EPage();

        await page.setContent('<dom-portal></dom-portal>');
        const elements = await page.findAll('dom-portal');

        expect(elements[1]).toHaveAttribute('projected');
    });

    it('sets same "portal-id" attribute', async () => {
        const page = await newE2EPage();

        await page.setContent('<dom-portal></dom-portal>');
        const elements = await page.findAll('dom-portal');

        expect(elements[0]).toHaveAttribute('portal-id');
        expect(elements[1]).toHaveAttribute('portal-id');
        expect(elements[0].getAttribute('portal-id')).toBe(elements[1].getAttribute('portal-id'));
    });

    it('projects #text', async () => {
        const page = await newE2EPage();
        const child = 'Hello world!';
        await page.setContent(`<dom-portal>${child}</dom-portal>`);
        const elements = await page.findAll('dom-portal');

        expect(elements[1].innerText).toBe(child);
    });

    it('projects element', async () => {
        const page = await newE2EPage();
        const child = '<div>Hello world!</div>';
        await page.setContent(`<dom-portal>${child}</dom-portal>`);
        const elements = await page.findAll('dom-portal');

        expect(elements[1].innerHTML).toBe(child);
    });

    it('projects elements', async () => {
        const page = await newE2EPage();
        const child = '<div>A</div><div>B</div><div>C</div>';
        await page.setContent(`<dom-portal>${child}</dom-portal>`);
        const elements = await page.findAll('dom-portal');

        expect(elements[1].innerHTML).toBe(child);
    });
});

describe('dom-portal mutations', () => {
    it('projects content changes to children', async () => {
        const page = await newE2EPage({
            html: `
                <dom-portal>
                    <div>Hello world!</div>
                </dom-portal>
            `
        });

        const elementA = await page.find('dom-portal > div');
        const elementB = await page.find('dom-portal:last-of-type > div');
        
        expect(elementA.textContent).toBe('Hello world!');
        expect(elementB.textContent).toBe('Hello world!');

        await page.evaluate(() => {
            const element = document.querySelector('dom-portal > div');
            element.innerHTML = 'Goodbye world!';
        })
        await page.waitForChanges();

        expect(elementA.textContent).toBe('Goodbye world!');
        expect(elementB.textContent).toBe('Goodbye world!');
    });

    it('projects attribute changes to children', async () => {
        const page = await newE2EPage({
            html: `
                <dom-portal>
                    <div></div>
                </dom-portal>
            `
        });

        const elementA = await page.find('dom-portal > div');
        const elementB = await page.find('dom-portal:last-of-type > div');

        expect(elementA).not.toHaveAttribute('data-foo');
        expect(elementB).not.toHaveAttribute('data-foo');

        await page.evaluate(() => {
            const element = document.querySelector('dom-portal > div');
            element.setAttribute('data-foo', '');
        })
        await page.waitForChanges();

        expect(elementA).toHaveAttribute('data-foo');
        expect(elementB).toHaveAttribute('data-foo');
    });

    it('updates "portal-id" attribute when portals are added/removed', async () => {
        const page = await newE2EPage({
            html: `
                <div id="root">
                    <dom-portal>A</dom-portal>
                </div>
            `
        });

        let elements = await page.findAll('dom-portal');
        expect(elements.length).toBe(2);
        expect(elements[0].getAttribute('portal-id')).toBe('0');
        expect(elements[1].getAttribute('portal-id')).toBe('0');
        expect(elements[1].textContent).toBe('A');

        await page.evaluate(() => {
            const root = document.querySelector('#root');
            const element = document.createElement('dom-portal');
            element.innerText = 'B';
            root.appendChild(element);
        })
        await page.waitForChanges();
        elements = await page.findAll('dom-portal');
        
        expect(elements.length).toBe(4);
        expect(elements[1].getAttribute('portal-id')).toBe('1');
        expect(elements[3].getAttribute('portal-id')).toBe('1');
        expect(elements[3].textContent).toBe('B');

        await page.evaluate(() => {
            const element = document.querySelector('[portal-id="0"]');
            element.remove();
        })
        await page.waitForChanges();
        elements = await page.findAll('dom-portal');

        expect(elements.length).toBe(2);
        expect(elements[0].getAttribute('portal-id')).toBe('0');
        expect(elements[1].getAttribute('portal-id')).toBe('0');
        expect(elements[1].textContent).toBe('B');
    })
});