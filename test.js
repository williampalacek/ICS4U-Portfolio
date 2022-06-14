// @noflow
(function () {
    const scriptURL = document.currentScript.src;
    const Embed = (window.ScratchpadEmbed = function (props) {
        this.props = {
            ...baseProps,
            ...props,
        };

        this.id = this.id || new Date().getTime() + "-" + Math.random();
        this.callbacks = [];

        if (props.url) {
            this.url = props.url;
        }

        const self = this;

        this.onrun(function (data) {
            if (data.embedReady) {
                self.onready();
            }
        });

        if (this.props.onrun) {
            this.onrun(this.props.onrun);
        }
    });

    Embed.prototype = {
        url: scriptURL.replace("embed.js", "embedded"),

        setOptions: function (options) {
            this.props = {
                ...this.props,
                ...options,
            };

            this.postFrame(this.props);
        },

        clear: function () {
            this.setOptions({code: ""});
        },

        onrun: function (callback) {
            this.bindListener();
            this.callbacks.push(callback);
        },

        onready: function () {
            const props = this.props;

            if (props.code !== undefined) {
                this.setOptions({
                    code: props.code,
                    autoFocus: props.autoFocus,
                    lines: props.lines,
                    cursor: props.cursor,
                    validate: props.validate,
                });
            }

            if (this.onload) {
                this.onload();
            }

            if (props.onload) {
                props.onload();
            }
        },

        restart: function (code) {
            this.postFrame({restart: true});
        },

        bindListener: function () {
            if (this.bound) {
                return;
            }

            const self = this;

            window.addEventListener(
                "message",
                function (e) {
                    let data;

                    try {
                        data = JSON.parse(event.data);
                    } catch (err) {
                        // Malformed JSON, we don't care about it
                    }

                    // Make sure we only listen for reponses that have the right ID
                    if (data && data.id === self.id) {
                        // Remember the source and origin so that we can reply later
                        self.frameSource = e.source;
                        self.frameOrigin = e.origin;

                        delete data.id;

                        // Call all the listening callbacks
                        for (let i = 0, l = self.callbacks.length; i < l; i++) {
                            self.callbacks[i](data);
                        }
                    }
                },
                false,
            );

            this.bound = true;
        },

        getIframe: function () {
            if (this.iframe) {
                return this.iframe;
            }

            const props = this.props;

            // Figure out the correct height and width of the embed
            let toolbarHeight = 66; // Wonder-blocks toolbar (w/borders)
            let editorWidth = 540;
            let canvasWidth = 400;
            let defaultHeight = 400;
            let borderWidth = 0;
            let borderHeight = 1; // Top border thickness

            if (props.output === false || props.editor === false) {
                borderWidth = 2;
            }

            if (props.buttons === false && props.author === false) {
                toolbarHeight = 0;
                borderHeight = 2;
            }

            if (props.buttons === false && props.editor === false) {
                borderWidth = 0;
                borderHeight = 0;
                toolbarHeight = 0;
            }

            if (props.editor === false) {
                editorWidth = 0;
            }

            if (props.output === false) {
                canvasWidth = 0;
            }

            if (props.width) {
                canvasWidth = parseFloat(props.width);
            }

            if (props.height) {
                defaultHeight = parseFloat(props.height);
            }

            let height = defaultHeight + toolbarHeight + borderHeight;
            let width = editorWidth + canvasWidth + borderWidth;

            height += "px";
            width += "px";

            if (props.frameWidth) {
                width = props.frameWidth;
            }

            if (props.frameHeight) {
                height = props.frameHeight;
            }

            const queryString = {
                id: this.id,
                // eslint-disable-next-line no-restricted-syntax
                origin: window.location.origin,
            };

            for (const [key, origVal] of Object.entries(props)) {
                const val = rpropMap[origVal] || props[key];

                if (typeof val !== "function") {
                    queryString[key] = val;
                }
            }

            const iframe = (this.iframe = document.createElement("iframe"));
            iframe.src =
                this.url.replace(/\?.*$/, "") + "?" + this.param(queryString);
            iframe.style.border = "0px";
            iframe.style.width = width;
            iframe.style.height = height;
            iframe.frameBorder = 0;
            iframe.scrolling = "no";
            return iframe;
        },

        param: function (props) {
            const results = [];
            for (const [key, val] of Object.entries(props)) {
                results.push(
                    encodeURIComponent(key) + "=" + encodeURIComponent(val),
                );
            }
            return results.join("&").replace(/%20/g, "+");
        },

        postFrame: function (data) {
            // Send the data to the frame using postMessage
            if (this.frameSource) {
                this.frameSource.postMessage(
                    JSON.stringify(data),
                    this.frameOrigin,
                );
            }
        },
    };

    const baseProps = {};
    const origProps = new URLSearchParams(
        scriptURL.slice(scriptURL.indexOf("?")),
    );
    const propMap = {no: false, yes: true};
    const rpropMap = {false: "no", true: "yes"};

    for (const [key, val] of origProps) {
        const mappedVal = propMap[val];
        if (mappedVal !== undefined) {
            baseProps[key] = mappedVal;
        }
    }

    if (baseProps.embed === true) {
        const scripts = document.getElementsByTagName("script");
        const lastScript = scripts[scripts.length - 1];

        lastScript.parentNode.insertBefore(
            new Embed(baseProps).getIframe(),
            lastScript,
        );
    }
})();