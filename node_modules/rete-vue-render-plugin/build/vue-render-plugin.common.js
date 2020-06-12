/*!
* rete-vue-render-plugin v0.5.0 
* (c) 2019 Vitaliy Stoliarov 
* Released under the MIT license.
*/
'use strict';

function ___$insertStyle(css) {
  if (!css) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  var style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);
  return css;
}

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

Vue.filter('kebab', function (str) {
  var replace = function replace(s) {
    return s.toLowerCase().replace(/ /g, '-');
  };

  return Array.isArray(str) ? str.map(replace) : replace(str);
});

var mixin = {
  props: ['node', 'editor', 'bindSocket', 'bindControl'],
  methods: {
    inputs: function inputs() {
      return Array.from(this.node.inputs.values());
    },
    outputs: function outputs() {
      return Array.from(this.node.outputs.values());
    },
    controls: function controls() {
      return Array.from(this.node.controls.values());
    },
    selected: function selected() {
      return this.editor.selected.contains(this.node) ? 'selected' : '';
    }
  },
  directives: {
    socket: {
      bind: function bind(el, binding, vnode) {
        vnode.context.bindSocket(el, binding.arg, binding.value);
      },
      update: function update(el, binding, vnode) {
        vnode.context.bindSocket(el, binding.arg, binding.value);
      }
    },
    control: {
      bind: function bind(el, binding, vnode) {
        if (!binding.value) return;
        vnode.context.bindControl(el, binding.value);
      }
    }
  }
};

//
//
//
//
//
//
//
var script = {
  props: ['type', 'socket']
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
  return function (id, style) {
    return addStyle(id, style);
  };
}
var HEAD = document.head || document.getElementsByTagName('head')[0];
var styles = {};

function addStyle(id, css) {
  var group = isOldIE ? css.media || 'default' : id;
  var style = styles[group] || (styles[group] = {
    ids: new Set(),
    styles: []
  });

  if (!style.ids.has(id)) {
    style.ids.add(id);
    var code = css.source;

    if (css.map) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

      code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
    }

    if (!style.element) {
      style.element = document.createElement('style');
      style.element.type = 'text/css';
      if (css.media) style.element.setAttribute('media', css.media);
      HEAD.appendChild(style.element);
    }

    if ('styleSheet' in style.element) {
      style.styles.push(code);
      style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
    } else {
      var index = style.ids.size - 1;
      var textNode = document.createTextNode(code);
      var nodes = style.element.childNodes;
      if (nodes[index]) style.element.removeChild(nodes[index]);
      if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
    }
  }
}

var browser = createInjector;

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", {
    staticClass: "socket",
    class: _vm._f("kebab")([_vm.type, _vm.socket.name]),
    attrs: { title: _vm.socket.name }
  })
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-212b9c54_0", { source: ".socket[data-v-212b9c54] {\n  display: inline-block;\n  cursor: pointer;\n  border: 1px solid white;\n  border-radius: 12px;\n  width: 24px;\n  height: 24px;\n  margin: 6px;\n  vertical-align: middle;\n  background: #96b38a;\n  z-index: 2;\n  box-sizing: border-box;\n}\n.socket[data-v-212b9c54]:hover {\n    border-width: 4px;\n}\n.socket.multiple[data-v-212b9c54] {\n    border-color: yellow;\n}\n.socket.output[data-v-212b9c54] {\n    margin-right: -12px;\n}\n.socket.input[data-v-212b9c54] {\n    margin-left: -12px;\n}\n\n/*# sourceMappingURL=Socket.vue.map */", map: {"version":3,"sources":["/home/travis/build/retejs/vue-render-plugin/src/Socket.vue","Socket.vue"],"names":[],"mappings":"AAgBA;EACA,qBAAA;EACA,eAAA;EACA,uBAAA;EACA,mBAAA;EACA,WAAA;EACA,YAAA;EACA,WAAA;EACA,sBAAA;EACA,mBAAA;EACA,UAAA;EACA,sBAAA;AAAA;AAXA;IAaA,iBAAA;AAAA;AAbA;IAeA,oBAAA;AAAA;AAfA;IAiBA,mBAAA;AAAA;AAjBA;IAmBA,kBAAA;AAAA;;ACdA,qCAAqC","file":"Socket.vue","sourcesContent":["<template lang=\"pug\">\n.socket(\n  :class=\"[type, socket.name] | kebab\",\n  :title=\"socket.name\"\n)\n</template>\n\n<script>\nexport default {\n  props: ['type', 'socket']\n}\n</script>\n\n<style lang=\"sass\" scoped>\n@import \"./vars\"\n\n.socket\n  display: inline-block\n  cursor: pointer\n  border: 1px solid white\n  border-radius: $socket-size/2.0\n  width: $socket-size\n  height: $socket-size\n  margin: $socket-margin\n  vertical-align: middle\n  background: $socket-color\n  z-index: 2\n  box-sizing: border-box\n  &:hover\n    border-width: 4px\n  &.multiple\n    border-color: yellow\n  &.output\n    margin-right: - $socket-size / 2\n  &.input\n    margin-left: - $socket-size / 2\n</style>\n",".socket {\n  display: inline-block;\n  cursor: pointer;\n  border: 1px solid white;\n  border-radius: 12px;\n  width: 24px;\n  height: 24px;\n  margin: 6px;\n  vertical-align: middle;\n  background: #96b38a;\n  z-index: 2;\n  box-sizing: border-box; }\n  .socket:hover {\n    border-width: 4px; }\n  .socket.multiple {\n    border-color: yellow; }\n  .socket.output {\n    margin-right: -12px; }\n  .socket.input {\n    margin-left: -12px; }\n\n/*# sourceMappingURL=Socket.vue.map */"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-212b9c54";
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  

  
  var Socket = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    browser,
    undefined
  );

//
var script$1 = {
  mixins: [mixin],
  components: {
    Socket: Socket
  }
};

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "node",
      class: _vm._f("kebab")([_vm.selected(), _vm.node.name])
    },
    [
      _c("div", { staticClass: "title" }, [_vm._v(_vm._s(_vm.node.name))]),
      _vm._l(_vm.outputs(), function(output) {
        return _c(
          "div",
          { key: output.key, staticClass: "output" },
          [
            _c("div", { staticClass: "output-title" }, [
              _vm._v(_vm._s(output.name))
            ]),
            _c("Socket", {
              directives: [
                {
                  name: "socket",
                  rawName: "v-socket:output",
                  value: output,
                  expression: "output",
                  arg: "output"
                }
              ],
              attrs: { type: "output", socket: output.socket }
            })
          ],
          1
        )
      }),
      _vm._l(_vm.controls(), function(control) {
        return _c("div", {
          directives: [
            {
              name: "control",
              rawName: "v-control",
              value: control,
              expression: "control"
            }
          ],
          staticClass: "control"
        })
      }),
      _vm._l(_vm.inputs(), function(input) {
        return _c(
          "div",
          { key: input.key, staticClass: "input" },
          [
            _c("Socket", {
              directives: [
                {
                  name: "socket",
                  rawName: "v-socket:input",
                  value: input,
                  expression: "input",
                  arg: "input"
                }
              ],
              attrs: { type: "input", socket: input.socket }
            }),
            _c(
              "div",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: !input.showControl(),
                    expression: "!input.showControl()"
                  }
                ],
                staticClass: "input-title"
              },
              [_vm._v(_vm._s(input.name))]
            ),
            _c("div", {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: input.showControl(),
                  expression: "input.showControl()"
                },
                {
                  name: "control",
                  rawName: "v-control",
                  value: input.control,
                  expression: "input.control"
                }
              ],
              staticClass: "input-control"
            })
          ],
          1
        )
      })
    ],
    2
  )
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  const __vue_inject_styles__$1 = function (inject) {
    if (!inject) return
    inject("data-v-61cff9dc_0", { source: ".node[data-v-61cff9dc] {\n  background: rgba(110, 136, 255, 0.8);\n  border: 2px solid #4e58bf;\n  border-radius: 10px;\n  cursor: pointer;\n  min-width: 180px;\n  height: auto;\n  padding-bottom: 6px;\n  box-sizing: content-box;\n  position: relative;\n  user-select: none;\n}\n.node[data-v-61cff9dc]:hover {\n    background: rgba(130, 153, 255, 0.8);\n}\n.node.selected[data-v-61cff9dc] {\n    background: #ffd92c;\n    border-color: #e3c000;\n}\n.node .title[data-v-61cff9dc] {\n    color: white;\n    font-family: sans-serif;\n    font-size: 18px;\n    padding: 8px;\n}\n.node .output[data-v-61cff9dc] {\n    text-align: right;\n}\n.node .input[data-v-61cff9dc] {\n    text-align: left;\n}\n.node .input-title[data-v-61cff9dc], .node .output-title[data-v-61cff9dc] {\n    vertical-align: middle;\n    color: white;\n    display: inline-block;\n    font-family: sans-serif;\n    font-size: 14px;\n    margin: 6px;\n    line-height: 24px;\n}\n.node .input-control[data-v-61cff9dc] {\n    z-index: 1;\n    width: calc(100% - 36px);\n    vertical-align: middle;\n    display: inline-block;\n}\n.node .control[data-v-61cff9dc] {\n    padding: 6px 18px;\n}\n\n/*# sourceMappingURL=Node.vue.map */", map: {"version":3,"sources":["/home/travis/build/retejs/vue-render-plugin/src/Node.vue","Node.vue"],"names":[],"mappings":"AAwCA;EACA,oCAAA;EACA,yBAAA;EACA,mBAAA;EACA,eAAA;EACA,gBAAA;EACA,YAAA;EACA,mBAAA;EACA,uBAAA;EACA,kBAAA;EACA,iBAAA;AAAA;AAVA;IAYA,oCAAA;AAAA;AAZA;IAcA,mBAAA;IACA,qBAAA;AAAA;AAfA;IAiBA,YAAA;IACA,uBAAA;IACA,eAAA;IACA,YAAA;AAAA;AApBA;IAsBA,iBAAA;AAAA;AAtBA;IAwBA,gBAAA;AAAA;AAxBA;IA0BA,sBAAA;IACA,YAAA;IACA,qBAAA;IACA,uBAAA;IACA,eAAA;IACA,WAAA;IACA,iBAAA;AAAA;AAhCA;IAkCA,UAAA;IACA,wBAAA;IACA,sBAAA;IACA,qBAAA;AAAA;AArCA;IAuCA,iBAAA;AAAA;;ACtCA,mCAAmC","file":"Node.vue","sourcesContent":["<template lang=\"pug\">\n.node(:class=\"[selected(), node.name] | kebab\")\n  .title {{node.name}}\n\n  // Outputs\n  .output(v-for='output in outputs()' :key=\"output.key\")\n    .output-title {{output.name}}\n    Socket(v-socket:output=\"output\", type=\"output\", :socket=\"output.socket\")\n\n  // Controls\n  .control(\n    v-for='control in controls()',\n    v-control=\"control\"\n  )\n\n  // Inputs\n  .input(v-for='input in inputs()' :key=\"input.key\")\n    Socket(v-socket:input=\"input\", type=\"input\", :socket=\"input.socket\")\n    .input-title(v-show='!input.showControl()') {{input.name}}\n    .input-control(\n      v-show='input.showControl()'\n      v-control=\"input.control\"\n    )\n</template>\n\n<script>\nimport mixin from './mixin';\nimport Socket from './Socket.vue';\n\nexport default {\n  mixins: [mixin],\n  components: {\n    Socket\n  }\n}\n</script>\n\n<style lang=\"sass\" scoped>\n@import \"./vars\"\n\n.node\n  background: $node-color\n  border: 2px solid #4e58bf\n  border-radius: 10px\n  cursor: pointer\n  min-width: $node-width\n  height: auto\n  padding-bottom: 6px\n  box-sizing: content-box\n  position: relative\n  user-select: none\n  &:hover\n    background: lighten($node-color,4%)\n  &.selected\n    background: $node-color-selected\n    border-color: #e3c000\n  .title\n    color: white\n    font-family: sans-serif\n    font-size: 18px\n    padding: 8px\n  .output\n    text-align: right\n  .input\n    text-align: left\n  .input-title,.output-title\n    vertical-align: middle\n    color: white\n    display: inline-block\n    font-family: sans-serif\n    font-size: 14px\n    margin: $socket-margin\n    line-height: $socket-size\n  .input-control\n    z-index: 1\n    width: calc(100% - #{$socket-size + 2*$socket-margin})\n    vertical-align: middle\n    display: inline-block\n  .control\n    padding: $socket-margin $socket-size/2 + $socket-margin\n</style>",".node {\n  background: rgba(110, 136, 255, 0.8);\n  border: 2px solid #4e58bf;\n  border-radius: 10px;\n  cursor: pointer;\n  min-width: 180px;\n  height: auto;\n  padding-bottom: 6px;\n  box-sizing: content-box;\n  position: relative;\n  user-select: none; }\n  .node:hover {\n    background: rgba(130, 153, 255, 0.8); }\n  .node.selected {\n    background: #ffd92c;\n    border-color: #e3c000; }\n  .node .title {\n    color: white;\n    font-family: sans-serif;\n    font-size: 18px;\n    padding: 8px; }\n  .node .output {\n    text-align: right; }\n  .node .input {\n    text-align: left; }\n  .node .input-title, .node .output-title {\n    vertical-align: middle;\n    color: white;\n    display: inline-block;\n    font-family: sans-serif;\n    font-size: 14px;\n    margin: 6px;\n    line-height: 24px; }\n  .node .input-control {\n    z-index: 1;\n    width: calc(100% - 36px);\n    vertical-align: middle;\n    display: inline-block; }\n  .node .control {\n    padding: 6px 18px; }\n\n/*# sourceMappingURL=Node.vue.map */"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$1 = "data-v-61cff9dc";
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject SSR */
  

  
  var Node = normalizeComponent_1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    browser,
    undefined
  );

function createVue(el, vueComponent, vueProps) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var app = new Vue(_objectSpread({
    render: function render(h) {
      return h(vueComponent, {
        props: vueProps
      });
    }
  }, options));
  var nodeEl = document.createElement('div');
  el.appendChild(nodeEl);
  app.$mount(nodeEl);
  return app;
}

function createNode(editor, CommonVueComponent, _ref, options) {
  var el = _ref.el,
      node = _ref.node,
      component = _ref.component,
      bindSocket = _ref.bindSocket,
      bindControl = _ref.bindControl;
  var vueComponent = component.component || CommonVueComponent || Node;

  var vueProps = _objectSpread({}, component.props, {
    node: node,
    editor: editor,
    bindSocket: bindSocket,
    bindControl: bindControl
  });

  var app = createVue(el, vueComponent, vueProps, options);
  node.vueContext = app.$children[0];
  return app;
}

function createControl(editor, _ref2, options) {
  var el = _ref2.el,
      control = _ref2.control;
  var vueComponent = control.component;

  var vueProps = _objectSpread({}, control.props, {
    getData: control.getData.bind(control),
    putData: control.putData.bind(control)
  });

  var app = createVue(el, vueComponent, vueProps, options);
  control.vueContext = app.$children[0];
  return app;
}

var update = function update(entity) {
  return new Promise(function (res) {
    if (!entity.vueContext) return res();
    entity.vueContext.$forceUpdate();
    entity.vueContext.$nextTick(res);
  });
};

function install(editor, _ref3) {
  var CommonVueComponent = _ref3.component,
      options = _ref3.options;
  editor.on('rendernode', function (_ref4) {
    var el = _ref4.el,
        node = _ref4.node,
        component = _ref4.component,
        bindSocket = _ref4.bindSocket,
        bindControl = _ref4.bindControl;
    if (component.render && component.render !== 'vue') return;
    node._vue = createNode(editor, CommonVueComponent, {
      el: el,
      node: node,
      component: component,
      bindSocket: bindSocket,
      bindControl: bindControl
    }, options);
    node.update =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return update(node);

            case 2:
              return _context.abrupt("return", _context.sent);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
  });
  editor.on('rendercontrol', function (_ref6) {
    var el = _ref6.el,
        control = _ref6.control;
    if (control.render && control.render !== 'vue') return;
    control._vue = createControl(editor, {
      el: el,
      control: control
    }, options);
    control.update =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return update(control);

            case 2:
              return _context2.abrupt("return", _context2.sent);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
  });
  editor.on('connectioncreated connectionremoved', function (connection) {
    update(connection.output.node);
    update(connection.input.node);
  });
  editor.on('nodeselected', function () {
    editor.nodes.map(update);
  });
}

var index = {
  name: 'vue-render',
  install: install,
  mixin: mixin,
  Node: Node,
  Socket: Socket
};

exports.default = index;
//# sourceMappingURL=vue-render-plugin.common.js.map
