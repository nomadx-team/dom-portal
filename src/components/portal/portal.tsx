import { Component, h, Host, Element, Prop, Watch } from '@stencil/core';

@Component({
    tag: 'dom-portal',
    shadow: true
})
export class Portal {
    
    @Element() element: Element;
    
    @Prop({ reflect: true, mutable: true }) portalId: number;
    @Watch('portalId')
    portalIdChanged() {
        if (!this.projected && this.portalNode) {
            (this.portalNode as any).portalId = this.portalId;
        }
    }

    private mo: MutationObserver;
    @Prop() container: string | HTMLElement;
    @Prop({ reflect: true }) projected: boolean;
    @Prop() hosted: boolean;

    private portalNode: HTMLElement;
    private parent: HTMLElement|null = null;

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

            if (this.element.parentElement === null && this.element.parentNode && (this.element.parentNode as ShadowRoot).host) {
                const parent = (this.element.parentNode as ShadowRoot).host as HTMLElement;
                this.portalNode = ownerDocument.createElement(parent.tagName);
                parent.setAttribute('portal-id', `${this.portalId}`);
                this.portalNode.setAttribute('portal-id', `${this.portalId}`);
                this.portalNode.setAttribute('projected', '');
                [...Array.from(parent.children)].forEach(child => this.portalNode.appendChild(child));
                container.appendChild(this.portalNode);
                this.addMO(parent);
                this.parent = parent;
            } else {
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

    private project: MutationCallback = () => {
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
    }

    private addMO(element = this.element) {
        if ('MutationObserver' in window) {
            this.mo = new MutationObserver(this.project);
            this.mo.observe(element, {
                childList: true,
                attributes: true,
                subtree: true
            });
        }
    }

    private getContainer = (ownerDocument: Document) => {
        if (this.container) {
            return typeof this.container === 'string' ? ownerDocument.querySelector(this.container) : this.container;
        }

        return ownerDocument.body;
    }

    render() {
        if (this.projected) {
            return (
                <Host style={{ display: 'contents' }}>
                    <slot />
                </Host>
            );
        }

        return (
            <Host style={{ display: 'none' }}>
                <slot />
            </Host>
        );
    }
}

function onPortalConnected(element) {
    portals.push(element);
    return portals.length - 1;
}

function onPortalDisconnected(id) {
    portals.splice(portals.findIndex(p => p.portalId === id), 1);
    portals.forEach((portal, i) => {
        portal.portalId = i;
    })
}

let portals = [];