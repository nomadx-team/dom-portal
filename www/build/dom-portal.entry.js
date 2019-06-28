import { e as registerInstance, f as h, g as Host, h as getElement } from './dom-portal-4fd39a76.js';

class Portal {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.parent = null;
        this.project = () => {
            if (!this.projected) {
                let content = [];
                if (this.parent) {
                    content = [...Array.from(this.parent.children)];
                    content.map(el => this.portalNode.shadowRoot.querySelector('dom-portal').appendChild(el));
                    return;
                }
                content = this.element.shadowRoot.querySelector('slot').assignedNodes();
                content.map(el => this.portalNode.appendChild(el));
            }
        };
        this.getContainer = (ownerDocument) => {
            if (this.container) {
                return typeof this.container === 'string' ? ownerDocument.querySelector(this.container) : this.container;
            }
            return ownerDocument.body;
        };
    }
    portalIdChanged() {
        if (!this.projected && this.portalNode) {
            this.portalNode.portalId = this.portalId;
        }
    }
    connectedCallback() {
        if (!this.projected && this.element) {
            this.portalId = onPortalConnected(this.element);
            if (document.querySelector(`[portal-id="${this.portalId}"]`)) {
                return;
            }
        }
        if (!this.projected) {
            const ownerDocument = this.element.ownerDocument;
            const container = this.getContainer(ownerDocument);
            if (this.element.parentElement === null && this.element.parentNode && this.element.parentNode.host) {
                const parent = this.element.parentNode.host;
                this.portalNode = ownerDocument.createElement(parent.tagName);
                parent.setAttribute('portal-id', `${this.portalId}`);
                this.portalNode.setAttribute('portal-id', `${this.portalId}`);
                this.portalNode.setAttribute('projected', '');
                [...Array.from(parent.children)].forEach(child => this.portalNode.appendChild(child));
                container.appendChild(this.portalNode);
                this.addMO(parent);
                this.parent = parent;
            }
            else {
                this.portalNode = ownerDocument.createElement(this.element.tagName);
                this.portalNode.setAttribute('projected', '');
                this.portalNode.setAttribute('portal-id', `${this.portalId}`);
                container.appendChild(this.portalNode);
                this.addMO();
            }
        }
    }
    disconnectedCallback() {
        if (!this.projected) {
            this.portalNode.remove();
            onPortalDisconnected(this.portalId);
        }
    }
    addMO(element = this.element) {
        if ('MutationObserver' in window) {
            this.mo = new MutationObserver(this.project);
            this.mo.observe(element, {
                childList: true,
                attributes: true,
                subtree: true
            });
        }
    }
    render() {
        if (this.projected) {
            return (h(Host, { style: { display: 'contents' } }, h("slot", null)));
        }
        return (h(Host, { style: { display: 'none' } }, h("slot", null)));
    }
    get element() { return getElement(this); }
    static get watchers() { return {
        "portalId": ["portalIdChanged"]
    }; }
}
function onPortalConnected(element) {
    portals.push(element);
    return portals.length - 1;
}
function onPortalDisconnected(id) {
    portals.splice(portals.findIndex(p => p.portalId === id), 1);
    portals.forEach((portal, i) => {
        portal.portalId = i;
    });
}
let portals = [];

export { Portal as dom_portal };
