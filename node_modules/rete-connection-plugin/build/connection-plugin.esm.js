/*!
* rete-connection-plugin v0.9.0 
* (c) 2019 Vitaliy Stoliarov 
* Released under the MIT license.
*/
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

import { Output, Input } from 'rete';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
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

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function toTrainCase(str) {
  return str.toLowerCase().replace(/ /g, '-');
}

function getMapItemRecursively(map, el) {
  return map.get(el) || (el.parentElement ? getMapItemRecursively(map, el.parentElement) : null);
}
function defaultPath(points, curvature) {
  var _points = _slicedToArray(points, 4),
      x1 = _points[0],
      y1 = _points[1],
      x2 = _points[2],
      y2 = _points[3];

  var hx1 = x1 + Math.abs(x2 - x1) * curvature;
  var hx2 = x2 - Math.abs(x2 - x1) * curvature;
  return "M ".concat(x1, " ").concat(y1, " C ").concat(hx1, " ").concat(y1, " ").concat(hx2, " ").concat(y2, " ").concat(x2, " ").concat(y2);
}
function renderPathData(emitter, points, connection) {
  var data = {
    points: points,
    connection: connection,
    d: ''
  };
  emitter.trigger('connectionpath', data);
  return data.d || defaultPath(points, 0.4);
}
function updateConnection(_ref) {
  var el = _ref.el,
      d = _ref.d;
  var path = el.querySelector('.connection path');
  if (!path) throw new Error('Path of connection was broken');
  path.setAttribute('d', d);
}
function renderConnection(_ref2) {
  var _svg$classList;

  var el = _ref2.el,
      d = _ref2.d,
      connection = _ref2.connection;
  var classed = !connection ? [] : ['input-' + toTrainCase(connection.input.name), 'output-' + toTrainCase(connection.output.name), 'socket-input-' + toTrainCase(connection.input.socket.name), 'socket-output-' + toTrainCase(connection.output.socket.name)];
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  (_svg$classList = svg.classList).add.apply(_svg$classList, ['connection'].concat(classed));

  path.classList.add('main-path');
  path.setAttribute('d', d);
  svg.appendChild(path);
  el.appendChild(svg);
  updateConnection({
    el: el,
    d: d
  });
}

var PickerView =
/*#__PURE__*/
function () {
  function PickerView(emitter, editorView) {
    _classCallCheck(this, PickerView);

    this.emitter = emitter;
    this.editorView = editorView;

    _defineProperty(this, "el", void 0);

    this.el = document.createElement('div');
    this.el.style.position = 'absolute';
    this.editorView.area.appendChild(this.el);
  }

  _createClass(PickerView, [{
    key: "updatePseudoConnection",
    value: function updatePseudoConnection(io) {
      if (io !== null) {
        this.renderConnection(io);
      } else if (this.el.parentElement) {
        this.el.innerHTML = '';
      }
    }
  }, {
    key: "getPoints",
    value: function getPoints(io) {
      var mouse = this.editorView.area.mouse;
      if (!io.node) throw new Error('Node in output/input not found');
      var node = this.editorView.nodes.get(io.node);
      if (!node) throw new Error('Node view not found');

      var _node$getSocketPositi = node.getSocketPosition(io),
          _node$getSocketPositi2 = _slicedToArray(_node$getSocketPositi, 2),
          x1 = _node$getSocketPositi2[0],
          y1 = _node$getSocketPositi2[1];

      return io instanceof Output ? [x1, y1, mouse.x, mouse.y] : [mouse.x, mouse.y, x1, y1];
    }
  }, {
    key: "updateConnection",
    value: function updateConnection$1(io) {
      var d = renderPathData(this.emitter, this.getPoints(io));

      updateConnection({
        el: this.el,
        d: d
      });
    }
  }, {
    key: "renderConnection",
    value: function renderConnection$1(io) {
      var d = renderPathData(this.emitter, this.getPoints(io));

      renderConnection({
        el: this.el,
        d: d
      });
    }
  }]);

  return PickerView;
}();

var Picker =
/*#__PURE__*/
function () {
  function Picker(editor) {
    var _this = this;

    _classCallCheck(this, Picker);

    _defineProperty(this, "editor", void 0);

    _defineProperty(this, "_io", null);

    _defineProperty(this, "view", void 0);

    this.editor = editor;
    this.view = new PickerView(editor, editor.view);
    editor.on('mousemove', function () {
      return _this.io && _this.view.updateConnection(_this.io);
    });
  }

  _createClass(Picker, [{
    key: "reset",
    value: function reset() {
      this.io = null;
    }
  }, {
    key: "pickOutput",
    value: function pickOutput(output) {
      if (!this.editor.trigger('connectionpick', output)) return;

      if (this.io instanceof Input) {
        if (!output.multipleConnections && output.hasConnection()) this.editor.removeConnection(output.connections[0]);
        this.editor.connect(output, this.io);
        this.reset();
        return;
      }

      if (this.io) this.reset();
      this.io = output;
    }
  }, {
    key: "pickInput",
    value: function pickInput(input) {
      var _this2 = this;

      if (!this.editor.trigger('connectionpick', input)) return;

      if (this.io === null) {
        if (input.hasConnection()) {
          this.io = input.connections[0].output;
          this.editor.removeConnection(input.connections[0]);
        } else {
          this.io = input;
        }

        return true;
      }

      if (!input.multipleConnections && input.hasConnection()) this.editor.removeConnection(input.connections[0]);
      if (!this.io.multipleConnections && this.io.hasConnection()) this.editor.removeConnection(this.io.connections[0]);

      if (this.io instanceof Output && this.io.connectedTo(input)) {
        var connection = input.connections.find(function (c) {
          return c.output === _this2.io;
        });

        if (connection) {
          this.editor.removeConnection(connection);
        }
      }

      if (this.io instanceof Output) {
        this.editor.connect(this.io, input);
        this.reset();
      }
    }
  }, {
    key: "pickConnection",
    value: function pickConnection(connection) {
      var output = connection.output;
      this.editor.removeConnection(connection);
      this.io = output;
    }
  }, {
    key: "io",
    get: function get() {
      return this._io;
    },
    set: function set(io) {
      this._io = io;
      this.view.updatePseudoConnection(io);
    }
  }]);

  return Picker;
}();

var Flow =
/*#__PURE__*/
function () {
  function Flow(picker) {
    _classCallCheck(this, Flow);

    _defineProperty(this, "picker", void 0);

    _defineProperty(this, "target", void 0);

    this.picker = picker;
    this.target = null;
  }

  _createClass(Flow, [{
    key: "act",
    value: function act(_ref) {
      var input = _ref.input,
          output = _ref.output;
      if (this.unlock(input || output)) return;
      if (input) this.picker.pickInput(input);else if (output) this.picker.pickOutput(output);else this.picker.reset();
    }
  }, {
    key: "start",
    value: function start(params, io) {
      this.act(params);
      this.target = io;
    }
  }, {
    key: "complete",
    value: function complete() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.act(params);
    }
  }, {
    key: "hasTarget",
    value: function hasTarget() {
      return Boolean(this.target);
    }
  }, {
    key: "unlock",
    value: function unlock(io) {
      var target = this.target;
      this.target = null;
      return target && target === io;
    }
  }]);

  return Flow;
}();

___$insertStyle(".connection {\n  overflow: visible !important;\n  position: absolute;\n  z-index: -1;\n  pointer-events: none; }\n  .connection > * {\n    pointer-events: all; }\n  .connection .main-path {\n    fill: none;\n    stroke-width: 5px;\n    stroke: steelblue; }\n");

function install(editor) {
  editor.bind('connectionpath');
  editor.bind('connectiondrop');
  editor.bind('connectionpick');
  editor.bind('resetconnection');
  var picker = new Picker(editor);
  var flow = new Flow(picker);
  var socketsParams = new WeakMap();

  function pointerDown(e) {
    var flowParams = socketsParams.get(this);

    if (flowParams) {
      var input = flowParams.input,
          output = flowParams.output;
      editor.view.container.dispatchEvent(new PointerEvent('pointermove', e));
      e.preventDefault();
      e.stopPropagation();
      flow.start({
        input: input,
        output: output
      }, input || output);
    }
  }

  function pointerUp(e) {
    var flowEl = document.elementFromPoint(e.clientX, e.clientY);

    if (picker.io) {
      editor.trigger('connectiondrop', picker.io);
    }

    if (flowEl) {
      flow.complete(getMapItemRecursively(socketsParams, flowEl) || {});
    }
  }

  editor.on('resetconnection', function () {
    return flow.complete();
  });
  editor.on('rendersocket', function (_ref) {
    var el = _ref.el,
        input = _ref.input,
        output = _ref.output;
    socketsParams.set(el, {
      input: input,
      output: output
    });
    el.removeEventListener('pointerdown', pointerDown);
    el.addEventListener('pointerdown', pointerDown);
  });
  window.addEventListener('pointerup', pointerUp);
  editor.on('renderconnection', function (_ref2) {
    var el = _ref2.el,
        connection = _ref2.connection,
        points = _ref2.points;
    var d = renderPathData(editor, points, connection);
    renderConnection({
      el: el,
      d: d,
      connection: connection
    });
  });
  editor.on('updateconnection', function (_ref3) {
    var el = _ref3.el,
        connection = _ref3.connection,
        points = _ref3.points;
    var d = renderPathData(editor, points, connection);
    updateConnection({
      el: el,
      d: d
    });
  });
  editor.on('destroy', function () {
    window.removeEventListener('pointerup', pointerUp);
  });
}

var index = {
  name: 'connection',
  install: install
};

export default index;
export { defaultPath };
//# sourceMappingURL=connection-plugin.esm.js.map
