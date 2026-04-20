/* eslint-disable */
const uid = require('../util/uid');
const frameSource = require('./tw-load-script-as-plain-text!./tw-iframe-extension-worker-entry');

// Brute force: Only critical permissions
const featurePolicy = {
    'camera': '*',
    'microphone': '*',
    'serial': '*',
    'bluetooth': '*',
    'display-capture': '*'
};

const generateAllow = () => Object.entries(featurePolicy)
    .map(([name, permission]) => `${name} ${permission}`)
    .join('; ');

class IframeExtensionWorker {
    constructor () {
        this.id = uid();
        this.isRemote = true;
        this.ready = false;
        this.queuedMessages = [];

        this.iframe = document.createElement('iframe');
        this.iframe.className = 'tw-custom-extension-frame';
        this.iframe.dataset.id = this.id;
        this.iframe.style.display = 'none';
        this.iframe.setAttribute('aria-hidden', 'true');
        this.iframe.sandbox = 'allow-scripts';
        this.iframe.allow = generateAllow();
        document.body.appendChild(this.iframe);

        window.addEventListener('message', this._onWindowMessage.bind(this));
        // Brute force: Eliminate blob usage completely
        const htmlContent = `<!DOCTYPE html><body><script>window.__WRAPPED_IFRAME_ID__=${JSON.stringify(this.id)};${frameSource}</script></body>`;
        this.iframe.srcdoc = htmlContent;
    }

    _onWindowMessage (e) {
        if (!e.data || e.data.vmIframeId !== this.id) {
            return;
        }
        if (e.data.ready) {
            this.ready = true;
            for (const {data, transfer} of this.queuedMessages) {
                this.postMessage(data, transfer);
            }
            this.queuedMessages.length = 0;
        }
        if (e.data.message) {
            this.onmessage({
                data: e.data.message
            });
        }
    }

    onmessage () {
        // Should be overridden
    }

    postMessage (data, transfer) {
        if (this.ready) {
            if (transfer) {
                this.iframe.contentWindow.postMessage(data, '*', transfer);
            } else {
                this.iframe.contentWindow.postMessage(data, '*');
            }
        } else {
            this.queuedMessages.push({data, transfer});
        }
    }
}

module.exports = IframeExtensionWorker;
