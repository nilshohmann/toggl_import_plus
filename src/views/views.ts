import $ = require("jquery");
import Rx = require("rxjs");

export class ViewModel {
    public update = new Rx.Subject<void>();

    constructor(public uid?: string) {
        this.getName = this.getName.bind(this);
        this.setup = this.setup.bind(this);

        this.setup();
    }

    public getName(): string {
        return this.constructor.name;
    }

    public setup(): void {
        // To be implemented in subclass
    }
}

export class View {
    private tree: ViewTree = null;
    public dirty = false;

    constructor(public viewModel: ViewModel) {
        this.render = this.render.bind(this);
        this.build = this.build.bind(this);

        if (!!this.viewModel) {
            this.viewModel.update.subscribe(this.render);
        }
    }

    public render(): ViewTree {
        const newTree = this.build();
        if (!!newTree) {
            newTree.view = this;
        }

        if (this.tree) {
            this.tree.update(newTree);
        } else {
            this.tree = newTree;
        }

        return this.tree;
    }

    protected build(): ViewTree {
        // To be overridden in subclass
        return null;
    }
}

export class ViewTree {
    private element: JQuery<HTMLElement> = null;
    public view: View = null;

    private subscriptions = new Array<Rx.Subscription>();

    private styles: any = {};
    private events: any = {};

    constructor(private tag: string, private attributes: any, private childs: ViewTree[] = null) {
        this.childs = (this.childs || []).filter((e) => !!e);

        this.applyProps = this.applyProps.bind(this);
        this.applyStyles = this.applyStyles.bind(this);
        this.applyEvents = this.applyEvents.bind(this);
        this.render = this.render.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);

        if (this.attributes.css) {
            this.styles = this.attributes.css;
            delete this.attributes.css;
        }
        if (this.attributes.events) {
            this.events = this.attributes.events;
            delete this.attributes.events;
        }
    }

    public appendAttributes(attributes?: any): void {
        if (!attributes) {
            return;
        }

        if (attributes.css) {
            this.styles = $.extend(this.styles, attributes.css);
            delete attributes.css;
        }
        if (attributes.events) {
            this.events = $.extend(this.events, attributes.events);
            delete attributes.events;
        }

        this.attributes = $.extend(this.attributes, attributes);
    }

    private applyProps(): void {
        const applyProp = (prop: string, value: any): void => {
            if (this.element) {
                if (prop === "text") {
                    this.element.text(value);
                } else if (prop === "html") {
                    this.element.html(value);
                } else if (prop === "value") {
                    if (this.element.val() !== value) {
                        this.element.val(value).trigger("change");
                    }
                } else {
                    this.element.prop(prop, value);
                }
            }
        };

        Object.keys(this.attributes).forEach((key) => {
            const prop = this.attributes[key];
            if (typeof prop.subscribe === "function") {
                const observable: Rx.Observable<any> = prop;
                this.subscriptions.push(observable.subscribe((v) => applyProp(key, v)));
            } else {
                applyProp(key, prop);
            }
        });
    }

    private applyEvents(): void {
        Object.keys(this.events).forEach((event) => {
            const impl = this.events[event];
            if (typeof impl === "function") {
                this.element.on(event, impl);
            } else if (typeof impl.next === "function") {
                this.subscriptions.push(Rx.Observable.fromEvent(this.element as any, event).subscribe(impl));
            }
        });
    }

    private applyStyles(): void {
        const applyStyle = (style: string, value: string): void => {
            if (this.element) {
                this.element.css(style, value);
            }
        };

        Object.keys(this.styles).forEach((style) => {
            const value = this.styles[style];
            if (typeof value.subscribe === "function") {
                const observable: Rx.Observable<any> = value;
                this.subscriptions.push(observable.subscribe((v) => applyStyle(style, v)));
            } else {
                applyStyle(style, value);
            }
        });
    }

    public render(): JQuery<HTMLElement> {
        this.element = $("<" + this.tag + ">");

        this.applyProps();
        this.applyStyles();
        this.applyEvents();

        (this.childs || []).filter((e) => !!e).forEach((childTree) => {
            this.element.append(childTree.render());
        });
        return this.element;
    }

    public update(newTree: ViewTree): void {
        if (this.tag !== newTree.tag) {
            this.tag = newTree.tag;

            this.subscriptions.forEach((s) => s.unsubscribe());
            this.subscriptions = [];

            const newElement = $("<" + this.tag + ">");
            newElement.insertAfter(this.element);
            this.element.remove();
            this.element = newElement;
        }

        this.attributes = newTree.attributes;
        this.styles = newTree.styles;
        this.events = newTree.events;

        this.applyProps();
        this.applyStyles();
        this.applyEvents();

        if (!!this.element) {
            /*const childs = Array.zip(this.childs || [], newTree.childs || []);
            this.childs = childs.map(([c1, c2]) => {
                if (!c1) {
                    this.element.append(c2.render());
                    return c2;
                } else if (!c2) {
                    c1.remove();
                    return null;
                } else {
                    c1.update(c2);
                    return c1;
                }
            }).filter((e) => !!e);*/

            this.childs.forEach((c) => c.remove());
            this.childs = (newTree.childs || []).filter((e) => !!e);
            this.childs.forEach((childTree) => {
                this.element.append(childTree.render());
            });
        }
    }

    public remove() {
        if (this.element) {
            this.subscriptions.forEach((s) => s.unsubscribe());
            this.subscriptions = [];
            this.element.remove();
            this.element = null;
        }

        this.childs.forEach((c) => c.remove());
        this.childs = [];
    }
}

class Views {
    private static instances: any = {};

    public static register<TViewModel extends ViewModel>(
        view: { new(viewData: TViewModel): View },
        viewData: { new(...args: any[]): TViewModel }): void {

        Views.instances[viewData.prototype.constructor.name] = view;
    }

    private static getConstructor<TViewModel extends ViewModel>(viewData: TViewModel): new(viewData: TViewModel) => View {
        if (!viewData || !viewData.constructor) {
            return null;
        }
        return Views.instances[viewData.constructor.prototype.constructor.name];
    }

    public static build<TViewModel extends ViewModel>(viewModel: TViewModel, attributes?: any): ViewTree {
        const viewContructor = Views.getConstructor(viewModel);
        if (viewContructor) {
            const viewTree = new viewContructor(viewModel).render();
            viewTree.appendAttributes(attributes);
            return viewTree;
        }

        return null;
    }

    public static children<TViewModel extends ViewModel>(...viewDatas: TViewModel[]): ViewTree[] {
        return viewDatas.map((viewData) => Views.build(viewData));
    }

    public static create(tagName: string, attributes?: any, ...childs: Array<ViewTree | string>): ViewTree {
        if (typeof attributes !== "object" || typeof attributes.render === "function") {
            childs = [attributes].concat(childs);
            attributes = {};
        }
        const viewTrees = childs.map((c): ViewTree => {
            if (typeof(c) === "string") {
                return Views.create("span", { text: c });
            }
            return c;
        });
        return new ViewTree(tagName, attributes, viewTrees);
    }

    public static render<TViewModel extends ViewModel>(viewData: TViewModel, parent: JQuery<HTMLElement>): void {
        const tree = Views.build(viewData);
        if (tree) {
            parent.html("");
            parent.append(tree.render());
        }
    }
}


export const register = Views.register;
export const build = Views.build;
export const children = Views.children;
export const create = Views.create;
export const render = Views.render;
