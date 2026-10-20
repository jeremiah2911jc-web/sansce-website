var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../../../../../src/sanze-cases-desktop/node_modules/polygon-clipping/dist/polygon-clipping.umd.js
var require_polygon_clipping_umd = __commonJS({
  "../../../../../../src/sanze-cases-desktop/node_modules/polygon-clipping/dist/polygon-clipping.umd.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.polygonClipping = factory());
    })(exports, (function() {
      "use strict";
      function __generator(thisArg, body) {
        var _ = {
          label: 0,
          sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
          },
          trys: [],
          ops: []
        }, f7, y, t, g;
        return g = {
          next: verb(0),
          "throw": verb(1),
          "return": verb(2)
        }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f7) throw new TypeError("Generator is already executing.");
          while (_) try {
            if (f7 = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                _.label++;
                return {
                  value: op[1],
                  done: false
                };
              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = _.ops.pop();
                _.trys.pop();
                continue;
              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2];
                  _.ops.push(op);
                  break;
                }
                if (t[2]) _.ops.pop();
                _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f7 = t = 0;
          }
          if (op[0] & 5) throw op[1];
          return {
            value: op[0] ? op[1] : void 0,
            done: true
          };
        }
      }
      var Node = (
        /** @class */
        /* @__PURE__ */ (function() {
          function Node2(key, data) {
            this.next = null;
            this.key = key;
            this.data = data;
            this.left = null;
            this.right = null;
          }
          return Node2;
        })()
      );
      function DEFAULT_COMPARE(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
      }
      function splay(i, t, comparator) {
        var N = new Node(null, null);
        var l = N;
        var r = N;
        while (true) {
          var cmp2 = comparator(i, t.key);
          if (cmp2 < 0) {
            if (t.left === null) break;
            if (comparator(i, t.left.key) < 0) {
              var y = t.left;
              t.left = y.right;
              y.right = t;
              t = y;
              if (t.left === null) break;
            }
            r.left = t;
            r = t;
            t = t.left;
          } else if (cmp2 > 0) {
            if (t.right === null) break;
            if (comparator(i, t.right.key) > 0) {
              var y = t.right;
              t.right = y.left;
              y.left = t;
              t = y;
              if (t.right === null) break;
            }
            l.right = t;
            l = t;
            t = t.right;
          } else break;
        }
        l.right = t.left;
        r.left = t.right;
        t.left = N.right;
        t.right = N.left;
        return t;
      }
      function insert(i, data, t, comparator) {
        var node = new Node(i, data);
        if (t === null) {
          node.left = node.right = null;
          return node;
        }
        t = splay(i, t, comparator);
        var cmp2 = comparator(i, t.key);
        if (cmp2 < 0) {
          node.left = t.left;
          node.right = t;
          t.left = null;
        } else if (cmp2 >= 0) {
          node.right = t.right;
          node.left = t;
          t.right = null;
        }
        return node;
      }
      function split(key, v, comparator) {
        var left = null;
        var right = null;
        if (v) {
          v = splay(key, v, comparator);
          var cmp2 = comparator(v.key, key);
          if (cmp2 === 0) {
            left = v.left;
            right = v.right;
          } else if (cmp2 < 0) {
            right = v.right;
            v.right = null;
            left = v;
          } else {
            left = v.left;
            v.left = null;
            right = v;
          }
        }
        return {
          left,
          right
        };
      }
      function merge(left, right, comparator) {
        if (right === null) return left;
        if (left === null) return right;
        right = splay(left.key, right, comparator);
        right.left = left;
        return right;
      }
      function printRow(root, prefix, isTail, out, printNode) {
        if (root) {
          out("" + prefix + (isTail ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 ") + printNode(root) + "\n");
          var indent = prefix + (isTail ? "    " : "\u2502   ");
          if (root.left) printRow(root.left, indent, false, out, printNode);
          if (root.right) printRow(root.right, indent, true, out, printNode);
        }
      }
      var Tree = (
        /** @class */
        (function() {
          function Tree2(comparator) {
            if (comparator === void 0) {
              comparator = DEFAULT_COMPARE;
            }
            this._root = null;
            this._size = 0;
            this._comparator = comparator;
          }
          Tree2.prototype.insert = function(key, data) {
            this._size++;
            return this._root = insert(key, data, this._root, this._comparator);
          };
          Tree2.prototype.add = function(key, data) {
            var node = new Node(key, data);
            if (this._root === null) {
              node.left = node.right = null;
              this._size++;
              this._root = node;
            }
            var comparator = this._comparator;
            var t = splay(key, this._root, comparator);
            var cmp2 = comparator(key, t.key);
            if (cmp2 === 0) this._root = t;
            else {
              if (cmp2 < 0) {
                node.left = t.left;
                node.right = t;
                t.left = null;
              } else if (cmp2 > 0) {
                node.right = t.right;
                node.left = t;
                t.right = null;
              }
              this._size++;
              this._root = node;
            }
            return this._root;
          };
          Tree2.prototype.remove = function(key) {
            this._root = this._remove(key, this._root, this._comparator);
          };
          Tree2.prototype._remove = function(i, t, comparator) {
            var x;
            if (t === null) return null;
            t = splay(i, t, comparator);
            var cmp2 = comparator(i, t.key);
            if (cmp2 === 0) {
              if (t.left === null) {
                x = t.right;
              } else {
                x = splay(i, t.left, comparator);
                x.right = t.right;
              }
              this._size--;
              return x;
            }
            return t;
          };
          Tree2.prototype.pop = function() {
            var node = this._root;
            if (node) {
              while (node.left) node = node.left;
              this._root = splay(node.key, this._root, this._comparator);
              this._root = this._remove(node.key, this._root, this._comparator);
              return {
                key: node.key,
                data: node.data
              };
            }
            return null;
          };
          Tree2.prototype.findStatic = function(key) {
            var current = this._root;
            var compare = this._comparator;
            while (current) {
              var cmp2 = compare(key, current.key);
              if (cmp2 === 0) return current;
              else if (cmp2 < 0) current = current.left;
              else current = current.right;
            }
            return null;
          };
          Tree2.prototype.find = function(key) {
            if (this._root) {
              this._root = splay(key, this._root, this._comparator);
              if (this._comparator(key, this._root.key) !== 0) return null;
            }
            return this._root;
          };
          Tree2.prototype.contains = function(key) {
            var current = this._root;
            var compare = this._comparator;
            while (current) {
              var cmp2 = compare(key, current.key);
              if (cmp2 === 0) return true;
              else if (cmp2 < 0) current = current.left;
              else current = current.right;
            }
            return false;
          };
          Tree2.prototype.forEach = function(visitor, ctx) {
            var current = this._root;
            var Q = [];
            var done = false;
            while (!done) {
              if (current !== null) {
                Q.push(current);
                current = current.left;
              } else {
                if (Q.length !== 0) {
                  current = Q.pop();
                  visitor.call(ctx, current);
                  current = current.right;
                } else done = true;
              }
            }
            return this;
          };
          Tree2.prototype.range = function(low, high, fn, ctx) {
            var Q = [];
            var compare = this._comparator;
            var node = this._root;
            var cmp2;
            while (Q.length !== 0 || node) {
              if (node) {
                Q.push(node);
                node = node.left;
              } else {
                node = Q.pop();
                cmp2 = compare(node.key, high);
                if (cmp2 > 0) {
                  break;
                } else if (compare(node.key, low) >= 0) {
                  if (fn.call(ctx, node)) return this;
                }
                node = node.right;
              }
            }
            return this;
          };
          Tree2.prototype.keys = function() {
            var keys = [];
            this.forEach(function(_a) {
              var key = _a.key;
              return keys.push(key);
            });
            return keys;
          };
          Tree2.prototype.values = function() {
            var values = [];
            this.forEach(function(_a) {
              var data = _a.data;
              return values.push(data);
            });
            return values;
          };
          Tree2.prototype.min = function() {
            if (this._root) return this.minNode(this._root).key;
            return null;
          };
          Tree2.prototype.max = function() {
            if (this._root) return this.maxNode(this._root).key;
            return null;
          };
          Tree2.prototype.minNode = function(t) {
            if (t === void 0) {
              t = this._root;
            }
            if (t) while (t.left) t = t.left;
            return t;
          };
          Tree2.prototype.maxNode = function(t) {
            if (t === void 0) {
              t = this._root;
            }
            if (t) while (t.right) t = t.right;
            return t;
          };
          Tree2.prototype.at = function(index2) {
            var current = this._root;
            var done = false;
            var i = 0;
            var Q = [];
            while (!done) {
              if (current) {
                Q.push(current);
                current = current.left;
              } else {
                if (Q.length > 0) {
                  current = Q.pop();
                  if (i === index2) return current;
                  i++;
                  current = current.right;
                } else done = true;
              }
            }
            return null;
          };
          Tree2.prototype.next = function(d) {
            var root = this._root;
            var successor = null;
            if (d.right) {
              successor = d.right;
              while (successor.left) successor = successor.left;
              return successor;
            }
            var comparator = this._comparator;
            while (root) {
              var cmp2 = comparator(d.key, root.key);
              if (cmp2 === 0) break;
              else if (cmp2 < 0) {
                successor = root;
                root = root.left;
              } else root = root.right;
            }
            return successor;
          };
          Tree2.prototype.prev = function(d) {
            var root = this._root;
            var predecessor = null;
            if (d.left !== null) {
              predecessor = d.left;
              while (predecessor.right) predecessor = predecessor.right;
              return predecessor;
            }
            var comparator = this._comparator;
            while (root) {
              var cmp2 = comparator(d.key, root.key);
              if (cmp2 === 0) break;
              else if (cmp2 < 0) root = root.left;
              else {
                predecessor = root;
                root = root.right;
              }
            }
            return predecessor;
          };
          Tree2.prototype.clear = function() {
            this._root = null;
            this._size = 0;
            return this;
          };
          Tree2.prototype.toList = function() {
            return toList(this._root);
          };
          Tree2.prototype.load = function(keys, values, presort) {
            if (values === void 0) {
              values = [];
            }
            if (presort === void 0) {
              presort = false;
            }
            var size = keys.length;
            var comparator = this._comparator;
            if (presort) sort(keys, values, 0, size - 1, comparator);
            if (this._root === null) {
              this._root = loadRecursive(keys, values, 0, size);
              this._size = size;
            } else {
              var mergedList = mergeLists(this.toList(), createList(keys, values), comparator);
              size = this._size + size;
              this._root = sortedListToBST({
                head: mergedList
              }, 0, size);
            }
            return this;
          };
          Tree2.prototype.isEmpty = function() {
            return this._root === null;
          };
          Object.defineProperty(Tree2.prototype, "size", {
            get: function() {
              return this._size;
            },
            enumerable: true,
            configurable: true
          });
          Object.defineProperty(Tree2.prototype, "root", {
            get: function() {
              return this._root;
            },
            enumerable: true,
            configurable: true
          });
          Tree2.prototype.toString = function(printNode) {
            if (printNode === void 0) {
              printNode = function(n) {
                return String(n.key);
              };
            }
            var out = [];
            printRow(this._root, "", true, function(v) {
              return out.push(v);
            }, printNode);
            return out.join("");
          };
          Tree2.prototype.update = function(key, newKey, newData) {
            var comparator = this._comparator;
            var _a = split(key, this._root, comparator), left = _a.left, right = _a.right;
            if (comparator(key, newKey) < 0) {
              right = insert(newKey, newData, right, comparator);
            } else {
              left = insert(newKey, newData, left, comparator);
            }
            this._root = merge(left, right, comparator);
          };
          Tree2.prototype.split = function(key) {
            return split(key, this._root, this._comparator);
          };
          Tree2.prototype[Symbol.iterator] = function() {
            var current, Q, done;
            return __generator(this, function(_a) {
              switch (_a.label) {
                case 0:
                  current = this._root;
                  Q = [];
                  done = false;
                  _a.label = 1;
                case 1:
                  if (!!done) return [3, 6];
                  if (!(current !== null)) return [3, 2];
                  Q.push(current);
                  current = current.left;
                  return [3, 5];
                case 2:
                  if (!(Q.length !== 0)) return [3, 4];
                  current = Q.pop();
                  return [4, current];
                case 3:
                  _a.sent();
                  current = current.right;
                  return [3, 5];
                case 4:
                  done = true;
                  _a.label = 5;
                case 5:
                  return [3, 1];
                case 6:
                  return [
                    2
                    /*return*/
                  ];
              }
            });
          };
          return Tree2;
        })()
      );
      function loadRecursive(keys, values, start, end) {
        var size = end - start;
        if (size > 0) {
          var middle = start + Math.floor(size / 2);
          var key = keys[middle];
          var data = values[middle];
          var node = new Node(key, data);
          node.left = loadRecursive(keys, values, start, middle);
          node.right = loadRecursive(keys, values, middle + 1, end);
          return node;
        }
        return null;
      }
      function createList(keys, values) {
        var head = new Node(null, null);
        var p = head;
        for (var i = 0; i < keys.length; i++) {
          p = p.next = new Node(keys[i], values[i]);
        }
        p.next = null;
        return head.next;
      }
      function toList(root) {
        var current = root;
        var Q = [];
        var done = false;
        var head = new Node(null, null);
        var p = head;
        while (!done) {
          if (current) {
            Q.push(current);
            current = current.left;
          } else {
            if (Q.length > 0) {
              current = p = p.next = Q.pop();
              current = current.right;
            } else done = true;
          }
        }
        p.next = null;
        return head.next;
      }
      function sortedListToBST(list, start, end) {
        var size = end - start;
        if (size > 0) {
          var middle = start + Math.floor(size / 2);
          var left = sortedListToBST(list, start, middle);
          var root = list.head;
          root.left = left;
          list.head = list.head.next;
          root.right = sortedListToBST(list, middle + 1, end);
          return root;
        }
        return null;
      }
      function mergeLists(l1, l2, compare) {
        var head = new Node(null, null);
        var p = head;
        var p1 = l1;
        var p2 = l2;
        while (p1 !== null && p2 !== null) {
          if (compare(p1.key, p2.key) < 0) {
            p.next = p1;
            p1 = p1.next;
          } else {
            p.next = p2;
            p2 = p2.next;
          }
          p = p.next;
        }
        if (p1 !== null) {
          p.next = p1;
        } else if (p2 !== null) {
          p.next = p2;
        }
        return head.next;
      }
      function sort(keys, values, left, right, compare) {
        if (left >= right) return;
        var pivot = keys[left + right >> 1];
        var i = left - 1;
        var j = right + 1;
        while (true) {
          do
            i++;
          while (compare(keys[i], pivot) < 0);
          do
            j--;
          while (compare(keys[j], pivot) > 0);
          if (i >= j) break;
          var tmp = keys[i];
          keys[i] = keys[j];
          keys[j] = tmp;
          tmp = values[i];
          values[i] = values[j];
          values[j] = tmp;
        }
        sort(keys, values, left, j, compare);
        sort(keys, values, j + 1, right, compare);
      }
      const isInBbox = (bbox, point) => {
        return bbox.ll.x <= point.x && point.x <= bbox.ur.x && bbox.ll.y <= point.y && point.y <= bbox.ur.y;
      };
      const getBboxOverlap = (b1, b2) => {
        if (b2.ur.x < b1.ll.x || b1.ur.x < b2.ll.x || b2.ur.y < b1.ll.y || b1.ur.y < b2.ll.y) return null;
        const lowerX = b1.ll.x < b2.ll.x ? b2.ll.x : b1.ll.x;
        const upperX = b1.ur.x < b2.ur.x ? b1.ur.x : b2.ur.x;
        const lowerY = b1.ll.y < b2.ll.y ? b2.ll.y : b1.ll.y;
        const upperY = b1.ur.y < b2.ur.y ? b1.ur.y : b2.ur.y;
        return {
          ll: {
            x: lowerX,
            y: lowerY
          },
          ur: {
            x: upperX,
            y: upperY
          }
        };
      };
      let epsilon$1 = Number.EPSILON;
      if (epsilon$1 === void 0) epsilon$1 = Math.pow(2, -52);
      const EPSILON_SQ = epsilon$1 * epsilon$1;
      const cmp = (a, b) => {
        if (-epsilon$1 < a && a < epsilon$1) {
          if (-epsilon$1 < b && b < epsilon$1) {
            return 0;
          }
        }
        const ab = a - b;
        if (ab * ab < EPSILON_SQ * a * b) {
          return 0;
        }
        return a < b ? -1 : 1;
      };
      class PtRounder {
        constructor() {
          this.reset();
        }
        reset() {
          this.xRounder = new CoordRounder();
          this.yRounder = new CoordRounder();
        }
        round(x, y) {
          return {
            x: this.xRounder.round(x),
            y: this.yRounder.round(y)
          };
        }
      }
      class CoordRounder {
        constructor() {
          this.tree = new Tree();
          this.round(0);
        }
        // Note: this can rounds input values backwards or forwards.
        //       You might ask, why not restrict this to just rounding
        //       forwards? Wouldn't that allow left endpoints to always
        //       remain left endpoints during splitting (never change to
        //       right). No - it wouldn't, because we snap intersections
        //       to endpoints (to establish independence from the segment
        //       angle for t-intersections).
        round(coord) {
          const node = this.tree.add(coord);
          const prevNode = this.tree.prev(node);
          if (prevNode !== null && cmp(node.key, prevNode.key) === 0) {
            this.tree.remove(coord);
            return prevNode.key;
          }
          const nextNode = this.tree.next(node);
          if (nextNode !== null && cmp(node.key, nextNode.key) === 0) {
            this.tree.remove(coord);
            return nextNode.key;
          }
          return coord;
        }
      }
      const rounder = new PtRounder();
      const epsilon = 11102230246251565e-32;
      const splitter = 134217729;
      const resulterrbound = (3 + 8 * epsilon) * epsilon;
      function sum2(elen, e, flen, f7, h) {
        let Q, Qnew, hh, bvirt;
        let enow = e[0];
        let fnow = f7[0];
        let eindex = 0;
        let findex = 0;
        if (fnow > enow === fnow > -enow) {
          Q = enow;
          enow = e[++eindex];
        } else {
          Q = fnow;
          fnow = f7[++findex];
        }
        let hindex = 0;
        if (eindex < elen && findex < flen) {
          if (fnow > enow === fnow > -enow) {
            Qnew = enow + Q;
            hh = Q - (Qnew - enow);
            enow = e[++eindex];
          } else {
            Qnew = fnow + Q;
            hh = Q - (Qnew - fnow);
            fnow = f7[++findex];
          }
          Q = Qnew;
          if (hh !== 0) {
            h[hindex++] = hh;
          }
          while (eindex < elen && findex < flen) {
            if (fnow > enow === fnow > -enow) {
              Qnew = Q + enow;
              bvirt = Qnew - Q;
              hh = Q - (Qnew - bvirt) + (enow - bvirt);
              enow = e[++eindex];
            } else {
              Qnew = Q + fnow;
              bvirt = Qnew - Q;
              hh = Q - (Qnew - bvirt) + (fnow - bvirt);
              fnow = f7[++findex];
            }
            Q = Qnew;
            if (hh !== 0) {
              h[hindex++] = hh;
            }
          }
        }
        while (eindex < elen) {
          Qnew = Q + enow;
          bvirt = Qnew - Q;
          hh = Q - (Qnew - bvirt) + (enow - bvirt);
          enow = e[++eindex];
          Q = Qnew;
          if (hh !== 0) {
            h[hindex++] = hh;
          }
        }
        while (findex < flen) {
          Qnew = Q + fnow;
          bvirt = Qnew - Q;
          hh = Q - (Qnew - bvirt) + (fnow - bvirt);
          fnow = f7[++findex];
          Q = Qnew;
          if (hh !== 0) {
            h[hindex++] = hh;
          }
        }
        if (Q !== 0 || hindex === 0) {
          h[hindex++] = Q;
        }
        return hindex;
      }
      function estimate(elen, e) {
        let Q = e[0];
        for (let i = 1; i < elen; i++) Q += e[i];
        return Q;
      }
      function vec(n) {
        return new Float64Array(n);
      }
      const ccwerrboundA = (3 + 16 * epsilon) * epsilon;
      const ccwerrboundB = (2 + 12 * epsilon) * epsilon;
      const ccwerrboundC = (9 + 64 * epsilon) * epsilon * epsilon;
      const B = vec(4);
      const C1 = vec(8);
      const C2 = vec(12);
      const D = vec(16);
      const u = vec(4);
      function orient2dadapt(ax, ay, bx, by, cx, cy, detsum) {
        let acxtail, acytail, bcxtail, bcytail;
        let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;
        const acx = ax - cx;
        const bcx = bx - cx;
        const acy = ay - cy;
        const bcy = by - cy;
        s1 = acx * bcy;
        c = splitter * acx;
        ahi = c - (c - acx);
        alo = acx - ahi;
        c = splitter * bcy;
        bhi = c - (c - bcy);
        blo = bcy - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acy * bcx;
        c = splitter * acy;
        ahi = c - (c - acy);
        alo = acy - ahi;
        c = splitter * bcx;
        bhi = c - (c - bcx);
        blo = bcx - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        B[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        B[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        B[2] = _j - (u3 - bvirt) + (_i - bvirt);
        B[3] = u3;
        let det = estimate(4, B);
        let errbound = ccwerrboundB * detsum;
        if (det >= errbound || -det >= errbound) {
          return det;
        }
        bvirt = ax - acx;
        acxtail = ax - (acx + bvirt) + (bvirt - cx);
        bvirt = bx - bcx;
        bcxtail = bx - (bcx + bvirt) + (bvirt - cx);
        bvirt = ay - acy;
        acytail = ay - (acy + bvirt) + (bvirt - cy);
        bvirt = by - bcy;
        bcytail = by - (bcy + bvirt) + (bvirt - cy);
        if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
          return det;
        }
        errbound = ccwerrboundC * detsum + resulterrbound * Math.abs(det);
        det += acx * bcytail + bcy * acxtail - (acy * bcxtail + bcx * acytail);
        if (det >= errbound || -det >= errbound) return det;
        s1 = acxtail * bcy;
        c = splitter * acxtail;
        ahi = c - (c - acxtail);
        alo = acxtail - ahi;
        c = splitter * bcy;
        bhi = c - (c - bcy);
        blo = bcy - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acytail * bcx;
        c = splitter * acytail;
        ahi = c - (c - acytail);
        alo = acytail - ahi;
        c = splitter * bcx;
        bhi = c - (c - bcx);
        blo = bcx - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const C1len = sum2(4, B, 4, u, C1);
        s1 = acx * bcytail;
        c = splitter * acx;
        ahi = c - (c - acx);
        alo = acx - ahi;
        c = splitter * bcytail;
        bhi = c - (c - bcytail);
        blo = bcytail - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acy * bcxtail;
        c = splitter * acy;
        ahi = c - (c - acy);
        alo = acy - ahi;
        c = splitter * bcxtail;
        bhi = c - (c - bcxtail);
        blo = bcxtail - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const C2len = sum2(C1len, C1, 4, u, C2);
        s1 = acxtail * bcytail;
        c = splitter * acxtail;
        ahi = c - (c - acxtail);
        alo = acxtail - ahi;
        c = splitter * bcytail;
        bhi = c - (c - bcytail);
        blo = bcytail - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acytail * bcxtail;
        c = splitter * acytail;
        ahi = c - (c - acytail);
        alo = acytail - ahi;
        c = splitter * bcxtail;
        bhi = c - (c - bcxtail);
        blo = bcxtail - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const Dlen = sum2(C2len, C2, 4, u, D);
        return D[Dlen - 1];
      }
      function orient2d(ax, ay, bx, by, cx, cy) {
        const detleft = (ay - cy) * (bx - cx);
        const detright = (ax - cx) * (by - cy);
        const det = detleft - detright;
        const detsum = Math.abs(detleft + detright);
        if (Math.abs(det) >= ccwerrboundA * detsum) return det;
        return -orient2dadapt(ax, ay, bx, by, cx, cy, detsum);
      }
      const crossProduct = (a, b) => a.x * b.y - a.y * b.x;
      const dotProduct = (a, b) => a.x * b.x + a.y * b.y;
      const compareVectorAngles = (basePt, endPt1, endPt2) => {
        const res = orient2d(basePt.x, basePt.y, endPt1.x, endPt1.y, endPt2.x, endPt2.y);
        if (res > 0) return -1;
        if (res < 0) return 1;
        return 0;
      };
      const length = (v) => Math.sqrt(dotProduct(v, v));
      const sineOfAngle = (pShared, pBase, pAngle) => {
        const vBase = {
          x: pBase.x - pShared.x,
          y: pBase.y - pShared.y
        };
        const vAngle = {
          x: pAngle.x - pShared.x,
          y: pAngle.y - pShared.y
        };
        return crossProduct(vAngle, vBase) / length(vAngle) / length(vBase);
      };
      const cosineOfAngle = (pShared, pBase, pAngle) => {
        const vBase = {
          x: pBase.x - pShared.x,
          y: pBase.y - pShared.y
        };
        const vAngle = {
          x: pAngle.x - pShared.x,
          y: pAngle.y - pShared.y
        };
        return dotProduct(vAngle, vBase) / length(vAngle) / length(vBase);
      };
      const horizontalIntersection = (pt, v, y) => {
        if (v.y === 0) return null;
        return {
          x: pt.x + v.x / v.y * (y - pt.y),
          y
        };
      };
      const verticalIntersection = (pt, v, x) => {
        if (v.x === 0) return null;
        return {
          x,
          y: pt.y + v.y / v.x * (x - pt.x)
        };
      };
      const intersection$1 = (pt1, v1, pt2, v2) => {
        if (v1.x === 0) return verticalIntersection(pt2, v2, pt1.x);
        if (v2.x === 0) return verticalIntersection(pt1, v1, pt2.x);
        if (v1.y === 0) return horizontalIntersection(pt2, v2, pt1.y);
        if (v2.y === 0) return horizontalIntersection(pt1, v1, pt2.y);
        const kross = crossProduct(v1, v2);
        if (kross == 0) return null;
        const ve = {
          x: pt2.x - pt1.x,
          y: pt2.y - pt1.y
        };
        const d1 = crossProduct(ve, v1) / kross;
        const d2 = crossProduct(ve, v2) / kross;
        const x1 = pt1.x + d2 * v1.x, x2 = pt2.x + d1 * v2.x;
        const y1 = pt1.y + d2 * v1.y, y2 = pt2.y + d1 * v2.y;
        const x = (x1 + x2) / 2;
        const y = (y1 + y2) / 2;
        return {
          x,
          y
        };
      };
      class SweepEvent {
        // for ordering sweep events in the sweep event queue
        static compare(a, b) {
          const ptCmp = SweepEvent.comparePoints(a.point, b.point);
          if (ptCmp !== 0) return ptCmp;
          if (a.point !== b.point) a.link(b);
          if (a.isLeft !== b.isLeft) return a.isLeft ? 1 : -1;
          return Segment.compare(a.segment, b.segment);
        }
        // for ordering points in sweep line order
        static comparePoints(aPt, bPt) {
          if (aPt.x < bPt.x) return -1;
          if (aPt.x > bPt.x) return 1;
          if (aPt.y < bPt.y) return -1;
          if (aPt.y > bPt.y) return 1;
          return 0;
        }
        // Warning: 'point' input will be modified and re-used (for performance)
        constructor(point, isLeft) {
          if (point.events === void 0) point.events = [this];
          else point.events.push(this);
          this.point = point;
          this.isLeft = isLeft;
        }
        link(other) {
          if (other.point === this.point) {
            throw new Error("Tried to link already linked events");
          }
          const otherEvents = other.point.events;
          for (let i = 0, iMax = otherEvents.length; i < iMax; i++) {
            const evt = otherEvents[i];
            this.point.events.push(evt);
            evt.point = this.point;
          }
          this.checkForConsuming();
        }
        /* Do a pass over our linked events and check to see if any pair
         * of segments match, and should be consumed. */
        checkForConsuming() {
          const numEvents = this.point.events.length;
          for (let i = 0; i < numEvents; i++) {
            const evt1 = this.point.events[i];
            if (evt1.segment.consumedBy !== void 0) continue;
            for (let j = i + 1; j < numEvents; j++) {
              const evt2 = this.point.events[j];
              if (evt2.consumedBy !== void 0) continue;
              if (evt1.otherSE.point.events !== evt2.otherSE.point.events) continue;
              evt1.segment.consume(evt2.segment);
            }
          }
        }
        getAvailableLinkedEvents() {
          const events = [];
          for (let i = 0, iMax = this.point.events.length; i < iMax; i++) {
            const evt = this.point.events[i];
            if (evt !== this && !evt.segment.ringOut && evt.segment.isInResult()) {
              events.push(evt);
            }
          }
          return events;
        }
        /**
         * Returns a comparator function for sorting linked events that will
         * favor the event that will give us the smallest left-side angle.
         * All ring construction starts as low as possible heading to the right,
         * so by always turning left as sharp as possible we'll get polygons
         * without uncessary loops & holes.
         *
         * The comparator function has a compute cache such that it avoids
         * re-computing already-computed values.
         */
        getLeftmostComparator(baseEvent) {
          const cache = /* @__PURE__ */ new Map();
          const fillCache = (linkedEvent) => {
            const nextEvent = linkedEvent.otherSE;
            cache.set(linkedEvent, {
              sine: sineOfAngle(this.point, baseEvent.point, nextEvent.point),
              cosine: cosineOfAngle(this.point, baseEvent.point, nextEvent.point)
            });
          };
          return (a, b) => {
            if (!cache.has(a)) fillCache(a);
            if (!cache.has(b)) fillCache(b);
            const {
              sine: asine,
              cosine: acosine
            } = cache.get(a);
            const {
              sine: bsine,
              cosine: bcosine
            } = cache.get(b);
            if (asine >= 0 && bsine >= 0) {
              if (acosine < bcosine) return 1;
              if (acosine > bcosine) return -1;
              return 0;
            }
            if (asine < 0 && bsine < 0) {
              if (acosine < bcosine) return -1;
              if (acosine > bcosine) return 1;
              return 0;
            }
            if (bsine < asine) return -1;
            if (bsine > asine) return 1;
            return 0;
          };
        }
      }
      let segmentId = 0;
      class Segment {
        /* This compare() function is for ordering segments in the sweep
         * line tree, and does so according to the following criteria:
         *
         * Consider the vertical line that lies an infinestimal step to the
         * right of the right-more of the two left endpoints of the input
         * segments. Imagine slowly moving a point up from negative infinity
         * in the increasing y direction. Which of the two segments will that
         * point intersect first? That segment comes 'before' the other one.
         *
         * If neither segment would be intersected by such a line, (if one
         * or more of the segments are vertical) then the line to be considered
         * is directly on the right-more of the two left inputs.
         */
        static compare(a, b) {
          const alx = a.leftSE.point.x;
          const blx = b.leftSE.point.x;
          const arx = a.rightSE.point.x;
          const brx = b.rightSE.point.x;
          if (brx < alx) return 1;
          if (arx < blx) return -1;
          const aly = a.leftSE.point.y;
          const bly = b.leftSE.point.y;
          const ary = a.rightSE.point.y;
          const bry = b.rightSE.point.y;
          if (alx < blx) {
            if (bly < aly && bly < ary) return 1;
            if (bly > aly && bly > ary) return -1;
            const aCmpBLeft = a.comparePoint(b.leftSE.point);
            if (aCmpBLeft < 0) return 1;
            if (aCmpBLeft > 0) return -1;
            const bCmpARight = b.comparePoint(a.rightSE.point);
            if (bCmpARight !== 0) return bCmpARight;
            return -1;
          }
          if (alx > blx) {
            if (aly < bly && aly < bry) return -1;
            if (aly > bly && aly > bry) return 1;
            const bCmpALeft = b.comparePoint(a.leftSE.point);
            if (bCmpALeft !== 0) return bCmpALeft;
            const aCmpBRight = a.comparePoint(b.rightSE.point);
            if (aCmpBRight < 0) return 1;
            if (aCmpBRight > 0) return -1;
            return 1;
          }
          if (aly < bly) return -1;
          if (aly > bly) return 1;
          if (arx < brx) {
            const bCmpARight = b.comparePoint(a.rightSE.point);
            if (bCmpARight !== 0) return bCmpARight;
          }
          if (arx > brx) {
            const aCmpBRight = a.comparePoint(b.rightSE.point);
            if (aCmpBRight < 0) return 1;
            if (aCmpBRight > 0) return -1;
          }
          if (arx !== brx) {
            const ay = ary - aly;
            const ax = arx - alx;
            const by = bry - bly;
            const bx = brx - blx;
            if (ay > ax && by < bx) return 1;
            if (ay < ax && by > bx) return -1;
          }
          if (arx > brx) return 1;
          if (arx < brx) return -1;
          if (ary < bry) return -1;
          if (ary > bry) return 1;
          if (a.id < b.id) return -1;
          if (a.id > b.id) return 1;
          return 0;
        }
        /* Warning: a reference to ringWindings input will be stored,
         *  and possibly will be later modified */
        constructor(leftSE, rightSE, rings, windings) {
          this.id = ++segmentId;
          this.leftSE = leftSE;
          leftSE.segment = this;
          leftSE.otherSE = rightSE;
          this.rightSE = rightSE;
          rightSE.segment = this;
          rightSE.otherSE = leftSE;
          this.rings = rings;
          this.windings = windings;
        }
        static fromRing(pt1, pt2, ring) {
          let leftPt, rightPt, winding;
          const cmpPts = SweepEvent.comparePoints(pt1, pt2);
          if (cmpPts < 0) {
            leftPt = pt1;
            rightPt = pt2;
            winding = 1;
          } else if (cmpPts > 0) {
            leftPt = pt2;
            rightPt = pt1;
            winding = -1;
          } else throw new Error(`Tried to create degenerate segment at [${pt1.x}, ${pt1.y}]`);
          const leftSE = new SweepEvent(leftPt, true);
          const rightSE = new SweepEvent(rightPt, false);
          return new Segment(leftSE, rightSE, [ring], [winding]);
        }
        /* When a segment is split, the rightSE is replaced with a new sweep event */
        replaceRightSE(newRightSE) {
          this.rightSE = newRightSE;
          this.rightSE.segment = this;
          this.rightSE.otherSE = this.leftSE;
          this.leftSE.otherSE = this.rightSE;
        }
        bbox() {
          const y1 = this.leftSE.point.y;
          const y2 = this.rightSE.point.y;
          return {
            ll: {
              x: this.leftSE.point.x,
              y: y1 < y2 ? y1 : y2
            },
            ur: {
              x: this.rightSE.point.x,
              y: y1 > y2 ? y1 : y2
            }
          };
        }
        /* A vector from the left point to the right */
        vector() {
          return {
            x: this.rightSE.point.x - this.leftSE.point.x,
            y: this.rightSE.point.y - this.leftSE.point.y
          };
        }
        isAnEndpoint(pt) {
          return pt.x === this.leftSE.point.x && pt.y === this.leftSE.point.y || pt.x === this.rightSE.point.x && pt.y === this.rightSE.point.y;
        }
        /* Compare this segment with a point.
         *
         * A point P is considered to be colinear to a segment if there
         * exists a distance D such that if we travel along the segment
         * from one * endpoint towards the other a distance D, we find
         * ourselves at point P.
         *
         * Return value indicates:
         *
         *   1: point lies above the segment (to the left of vertical)
         *   0: point is colinear to segment
         *  -1: point lies below the segment (to the right of vertical)
         */
        comparePoint(point) {
          if (this.isAnEndpoint(point)) return 0;
          const lPt = this.leftSE.point;
          const rPt = this.rightSE.point;
          const v = this.vector();
          if (lPt.x === rPt.x) {
            if (point.x === lPt.x) return 0;
            return point.x < lPt.x ? 1 : -1;
          }
          const yDist = (point.y - lPt.y) / v.y;
          const xFromYDist = lPt.x + yDist * v.x;
          if (point.x === xFromYDist) return 0;
          const xDist = (point.x - lPt.x) / v.x;
          const yFromXDist = lPt.y + xDist * v.y;
          if (point.y === yFromXDist) return 0;
          return point.y < yFromXDist ? -1 : 1;
        }
        /**
         * Given another segment, returns the first non-trivial intersection
         * between the two segments (in terms of sweep line ordering), if it exists.
         *
         * A 'non-trivial' intersection is one that will cause one or both of the
         * segments to be split(). As such, 'trivial' vs. 'non-trivial' intersection:
         *
         *   * endpoint of segA with endpoint of segB --> trivial
         *   * endpoint of segA with point along segB --> non-trivial
         *   * endpoint of segB with point along segA --> non-trivial
         *   * point along segA with point along segB --> non-trivial
         *
         * If no non-trivial intersection exists, return null
         * Else, return null.
         */
        getIntersection(other) {
          const tBbox = this.bbox();
          const oBbox = other.bbox();
          const bboxOverlap = getBboxOverlap(tBbox, oBbox);
          if (bboxOverlap === null) return null;
          const tlp = this.leftSE.point;
          const trp = this.rightSE.point;
          const olp = other.leftSE.point;
          const orp = other.rightSE.point;
          const touchesOtherLSE = isInBbox(tBbox, olp) && this.comparePoint(olp) === 0;
          const touchesThisLSE = isInBbox(oBbox, tlp) && other.comparePoint(tlp) === 0;
          const touchesOtherRSE = isInBbox(tBbox, orp) && this.comparePoint(orp) === 0;
          const touchesThisRSE = isInBbox(oBbox, trp) && other.comparePoint(trp) === 0;
          if (touchesThisLSE && touchesOtherLSE) {
            if (touchesThisRSE && !touchesOtherRSE) return trp;
            if (!touchesThisRSE && touchesOtherRSE) return orp;
            return null;
          }
          if (touchesThisLSE) {
            if (touchesOtherRSE) {
              if (tlp.x === orp.x && tlp.y === orp.y) return null;
            }
            return tlp;
          }
          if (touchesOtherLSE) {
            if (touchesThisRSE) {
              if (trp.x === olp.x && trp.y === olp.y) return null;
            }
            return olp;
          }
          if (touchesThisRSE && touchesOtherRSE) return null;
          if (touchesThisRSE) return trp;
          if (touchesOtherRSE) return orp;
          const pt = intersection$1(tlp, this.vector(), olp, other.vector());
          if (pt === null) return null;
          if (!isInBbox(bboxOverlap, pt)) return null;
          return rounder.round(pt.x, pt.y);
        }
        /**
         * Split the given segment into multiple segments on the given points.
         *  * Each existing segment will retain its leftSE and a new rightSE will be
         *    generated for it.
         *  * A new segment will be generated which will adopt the original segment's
         *    rightSE, and a new leftSE will be generated for it.
         *  * If there are more than two points given to split on, new segments
         *    in the middle will be generated with new leftSE and rightSE's.
         *  * An array of the newly generated SweepEvents will be returned.
         *
         * Warning: input array of points is modified
         */
        split(point) {
          const newEvents = [];
          const alreadyLinked = point.events !== void 0;
          const newLeftSE = new SweepEvent(point, true);
          const newRightSE = new SweepEvent(point, false);
          const oldRightSE = this.rightSE;
          this.replaceRightSE(newRightSE);
          newEvents.push(newRightSE);
          newEvents.push(newLeftSE);
          const newSeg = new Segment(newLeftSE, oldRightSE, this.rings.slice(), this.windings.slice());
          if (SweepEvent.comparePoints(newSeg.leftSE.point, newSeg.rightSE.point) > 0) {
            newSeg.swapEvents();
          }
          if (SweepEvent.comparePoints(this.leftSE.point, this.rightSE.point) > 0) {
            this.swapEvents();
          }
          if (alreadyLinked) {
            newLeftSE.checkForConsuming();
            newRightSE.checkForConsuming();
          }
          return newEvents;
        }
        /* Swap which event is left and right */
        swapEvents() {
          const tmpEvt = this.rightSE;
          this.rightSE = this.leftSE;
          this.leftSE = tmpEvt;
          this.leftSE.isLeft = true;
          this.rightSE.isLeft = false;
          for (let i = 0, iMax = this.windings.length; i < iMax; i++) {
            this.windings[i] *= -1;
          }
        }
        /* Consume another segment. We take their rings under our wing
         * and mark them as consumed. Use for perfectly overlapping segments */
        consume(other) {
          let consumer = this;
          let consumee = other;
          while (consumer.consumedBy) consumer = consumer.consumedBy;
          while (consumee.consumedBy) consumee = consumee.consumedBy;
          const cmp2 = Segment.compare(consumer, consumee);
          if (cmp2 === 0) return;
          if (cmp2 > 0) {
            const tmp = consumer;
            consumer = consumee;
            consumee = tmp;
          }
          if (consumer.prev === consumee) {
            const tmp = consumer;
            consumer = consumee;
            consumee = tmp;
          }
          for (let i = 0, iMax = consumee.rings.length; i < iMax; i++) {
            const ring = consumee.rings[i];
            const winding = consumee.windings[i];
            const index2 = consumer.rings.indexOf(ring);
            if (index2 === -1) {
              consumer.rings.push(ring);
              consumer.windings.push(winding);
            } else consumer.windings[index2] += winding;
          }
          consumee.rings = null;
          consumee.windings = null;
          consumee.consumedBy = consumer;
          consumee.leftSE.consumedBy = consumer.leftSE;
          consumee.rightSE.consumedBy = consumer.rightSE;
        }
        /* The first segment previous segment chain that is in the result */
        prevInResult() {
          if (this._prevInResult !== void 0) return this._prevInResult;
          if (!this.prev) this._prevInResult = null;
          else if (this.prev.isInResult()) this._prevInResult = this.prev;
          else this._prevInResult = this.prev.prevInResult();
          return this._prevInResult;
        }
        beforeState() {
          if (this._beforeState !== void 0) return this._beforeState;
          if (!this.prev) this._beforeState = {
            rings: [],
            windings: [],
            multiPolys: []
          };
          else {
            const seg = this.prev.consumedBy || this.prev;
            this._beforeState = seg.afterState();
          }
          return this._beforeState;
        }
        afterState() {
          if (this._afterState !== void 0) return this._afterState;
          const beforeState = this.beforeState();
          this._afterState = {
            rings: beforeState.rings.slice(0),
            windings: beforeState.windings.slice(0),
            multiPolys: []
          };
          const ringsAfter = this._afterState.rings;
          const windingsAfter = this._afterState.windings;
          const mpsAfter = this._afterState.multiPolys;
          for (let i = 0, iMax = this.rings.length; i < iMax; i++) {
            const ring = this.rings[i];
            const winding = this.windings[i];
            const index2 = ringsAfter.indexOf(ring);
            if (index2 === -1) {
              ringsAfter.push(ring);
              windingsAfter.push(winding);
            } else windingsAfter[index2] += winding;
          }
          const polysAfter = [];
          const polysExclude = [];
          for (let i = 0, iMax = ringsAfter.length; i < iMax; i++) {
            if (windingsAfter[i] === 0) continue;
            const ring = ringsAfter[i];
            const poly = ring.poly;
            if (polysExclude.indexOf(poly) !== -1) continue;
            if (ring.isExterior) polysAfter.push(poly);
            else {
              if (polysExclude.indexOf(poly) === -1) polysExclude.push(poly);
              const index2 = polysAfter.indexOf(ring.poly);
              if (index2 !== -1) polysAfter.splice(index2, 1);
            }
          }
          for (let i = 0, iMax = polysAfter.length; i < iMax; i++) {
            const mp = polysAfter[i].multiPoly;
            if (mpsAfter.indexOf(mp) === -1) mpsAfter.push(mp);
          }
          return this._afterState;
        }
        /* Is this segment part of the final result? */
        isInResult() {
          if (this.consumedBy) return false;
          if (this._isInResult !== void 0) return this._isInResult;
          const mpsBefore = this.beforeState().multiPolys;
          const mpsAfter = this.afterState().multiPolys;
          switch (operation.type) {
            case "union": {
              const noBefores = mpsBefore.length === 0;
              const noAfters = mpsAfter.length === 0;
              this._isInResult = noBefores !== noAfters;
              break;
            }
            case "intersection": {
              let least;
              let most;
              if (mpsBefore.length < mpsAfter.length) {
                least = mpsBefore.length;
                most = mpsAfter.length;
              } else {
                least = mpsAfter.length;
                most = mpsBefore.length;
              }
              this._isInResult = most === operation.numMultiPolys && least < most;
              break;
            }
            case "xor": {
              const diff = Math.abs(mpsBefore.length - mpsAfter.length);
              this._isInResult = diff % 2 === 1;
              break;
            }
            case "difference": {
              const isJustSubject = (mps) => mps.length === 1 && mps[0].isSubject;
              this._isInResult = isJustSubject(mpsBefore) !== isJustSubject(mpsAfter);
              break;
            }
            default:
              throw new Error(`Unrecognized operation type found ${operation.type}`);
          }
          return this._isInResult;
        }
      }
      class RingIn {
        constructor(geomRing, poly, isExterior) {
          if (!Array.isArray(geomRing) || geomRing.length === 0) {
            throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
          }
          this.poly = poly;
          this.isExterior = isExterior;
          this.segments = [];
          if (typeof geomRing[0][0] !== "number" || typeof geomRing[0][1] !== "number") {
            throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
          }
          const firstPoint = rounder.round(geomRing[0][0], geomRing[0][1]);
          this.bbox = {
            ll: {
              x: firstPoint.x,
              y: firstPoint.y
            },
            ur: {
              x: firstPoint.x,
              y: firstPoint.y
            }
          };
          let prevPoint = firstPoint;
          for (let i = 1, iMax = geomRing.length; i < iMax; i++) {
            if (typeof geomRing[i][0] !== "number" || typeof geomRing[i][1] !== "number") {
              throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
            }
            let point = rounder.round(geomRing[i][0], geomRing[i][1]);
            if (point.x === prevPoint.x && point.y === prevPoint.y) continue;
            this.segments.push(Segment.fromRing(prevPoint, point, this));
            if (point.x < this.bbox.ll.x) this.bbox.ll.x = point.x;
            if (point.y < this.bbox.ll.y) this.bbox.ll.y = point.y;
            if (point.x > this.bbox.ur.x) this.bbox.ur.x = point.x;
            if (point.y > this.bbox.ur.y) this.bbox.ur.y = point.y;
            prevPoint = point;
          }
          if (firstPoint.x !== prevPoint.x || firstPoint.y !== prevPoint.y) {
            this.segments.push(Segment.fromRing(prevPoint, firstPoint, this));
          }
        }
        getSweepEvents() {
          const sweepEvents = [];
          for (let i = 0, iMax = this.segments.length; i < iMax; i++) {
            const segment = this.segments[i];
            sweepEvents.push(segment.leftSE);
            sweepEvents.push(segment.rightSE);
          }
          return sweepEvents;
        }
      }
      class PolyIn {
        constructor(geomPoly, multiPoly) {
          if (!Array.isArray(geomPoly)) {
            throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
          }
          this.exteriorRing = new RingIn(geomPoly[0], this, true);
          this.bbox = {
            ll: {
              x: this.exteriorRing.bbox.ll.x,
              y: this.exteriorRing.bbox.ll.y
            },
            ur: {
              x: this.exteriorRing.bbox.ur.x,
              y: this.exteriorRing.bbox.ur.y
            }
          };
          this.interiorRings = [];
          for (let i = 1, iMax = geomPoly.length; i < iMax; i++) {
            const ring = new RingIn(geomPoly[i], this, false);
            if (ring.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = ring.bbox.ll.x;
            if (ring.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = ring.bbox.ll.y;
            if (ring.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = ring.bbox.ur.x;
            if (ring.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = ring.bbox.ur.y;
            this.interiorRings.push(ring);
          }
          this.multiPoly = multiPoly;
        }
        getSweepEvents() {
          const sweepEvents = this.exteriorRing.getSweepEvents();
          for (let i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
            const ringSweepEvents = this.interiorRings[i].getSweepEvents();
            for (let j = 0, jMax = ringSweepEvents.length; j < jMax; j++) {
              sweepEvents.push(ringSweepEvents[j]);
            }
          }
          return sweepEvents;
        }
      }
      class MultiPolyIn {
        constructor(geom, isSubject) {
          if (!Array.isArray(geom)) {
            throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
          }
          try {
            if (typeof geom[0][0][0] === "number") geom = [geom];
          } catch (ex) {
          }
          this.polys = [];
          this.bbox = {
            ll: {
              x: Number.POSITIVE_INFINITY,
              y: Number.POSITIVE_INFINITY
            },
            ur: {
              x: Number.NEGATIVE_INFINITY,
              y: Number.NEGATIVE_INFINITY
            }
          };
          for (let i = 0, iMax = geom.length; i < iMax; i++) {
            const poly = new PolyIn(geom[i], this);
            if (poly.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = poly.bbox.ll.x;
            if (poly.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = poly.bbox.ll.y;
            if (poly.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = poly.bbox.ur.x;
            if (poly.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = poly.bbox.ur.y;
            this.polys.push(poly);
          }
          this.isSubject = isSubject;
        }
        getSweepEvents() {
          const sweepEvents = [];
          for (let i = 0, iMax = this.polys.length; i < iMax; i++) {
            const polySweepEvents = this.polys[i].getSweepEvents();
            for (let j = 0, jMax = polySweepEvents.length; j < jMax; j++) {
              sweepEvents.push(polySweepEvents[j]);
            }
          }
          return sweepEvents;
        }
      }
      class RingOut {
        /* Given the segments from the sweep line pass, compute & return a series
         * of closed rings from all the segments marked to be part of the result */
        static factory(allSegments) {
          const ringsOut = [];
          for (let i = 0, iMax = allSegments.length; i < iMax; i++) {
            const segment = allSegments[i];
            if (!segment.isInResult() || segment.ringOut) continue;
            let prevEvent = null;
            let event = segment.leftSE;
            let nextEvent = segment.rightSE;
            const events = [event];
            const startingPoint = event.point;
            const intersectionLEs = [];
            while (true) {
              prevEvent = event;
              event = nextEvent;
              events.push(event);
              if (event.point === startingPoint) break;
              while (true) {
                const availableLEs = event.getAvailableLinkedEvents();
                if (availableLEs.length === 0) {
                  const firstPt = events[0].point;
                  const lastPt = events[events.length - 1].point;
                  throw new Error(`Unable to complete output ring starting at [${firstPt.x}, ${firstPt.y}]. Last matching segment found ends at [${lastPt.x}, ${lastPt.y}].`);
                }
                if (availableLEs.length === 1) {
                  nextEvent = availableLEs[0].otherSE;
                  break;
                }
                let indexLE = null;
                for (let j = 0, jMax = intersectionLEs.length; j < jMax; j++) {
                  if (intersectionLEs[j].point === event.point) {
                    indexLE = j;
                    break;
                  }
                }
                if (indexLE !== null) {
                  const intersectionLE = intersectionLEs.splice(indexLE)[0];
                  const ringEvents = events.splice(intersectionLE.index);
                  ringEvents.unshift(ringEvents[0].otherSE);
                  ringsOut.push(new RingOut(ringEvents.reverse()));
                  continue;
                }
                intersectionLEs.push({
                  index: events.length,
                  point: event.point
                });
                const comparator = event.getLeftmostComparator(prevEvent);
                nextEvent = availableLEs.sort(comparator)[0].otherSE;
                break;
              }
            }
            ringsOut.push(new RingOut(events));
          }
          return ringsOut;
        }
        constructor(events) {
          this.events = events;
          for (let i = 0, iMax = events.length; i < iMax; i++) {
            events[i].segment.ringOut = this;
          }
          this.poly = null;
        }
        getGeom() {
          let prevPt = this.events[0].point;
          const points = [prevPt];
          for (let i = 1, iMax = this.events.length - 1; i < iMax; i++) {
            const pt2 = this.events[i].point;
            const nextPt2 = this.events[i + 1].point;
            if (compareVectorAngles(pt2, prevPt, nextPt2) === 0) continue;
            points.push(pt2);
            prevPt = pt2;
          }
          if (points.length === 1) return null;
          const pt = points[0];
          const nextPt = points[1];
          if (compareVectorAngles(pt, prevPt, nextPt) === 0) points.shift();
          points.push(points[0]);
          const step = this.isExteriorRing() ? 1 : -1;
          const iStart = this.isExteriorRing() ? 0 : points.length - 1;
          const iEnd = this.isExteriorRing() ? points.length : -1;
          const orderedPoints = [];
          for (let i = iStart; i != iEnd; i += step) orderedPoints.push([points[i].x, points[i].y]);
          return orderedPoints;
        }
        isExteriorRing() {
          if (this._isExteriorRing === void 0) {
            const enclosing = this.enclosingRing();
            this._isExteriorRing = enclosing ? !enclosing.isExteriorRing() : true;
          }
          return this._isExteriorRing;
        }
        enclosingRing() {
          if (this._enclosingRing === void 0) {
            this._enclosingRing = this._calcEnclosingRing();
          }
          return this._enclosingRing;
        }
        /* Returns the ring that encloses this one, if any */
        _calcEnclosingRing() {
          let leftMostEvt = this.events[0];
          for (let i = 1, iMax = this.events.length; i < iMax; i++) {
            const evt = this.events[i];
            if (SweepEvent.compare(leftMostEvt, evt) > 0) leftMostEvt = evt;
          }
          let prevSeg = leftMostEvt.segment.prevInResult();
          let prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;
          while (true) {
            if (!prevSeg) return null;
            if (!prevPrevSeg) return prevSeg.ringOut;
            if (prevPrevSeg.ringOut !== prevSeg.ringOut) {
              if (prevPrevSeg.ringOut.enclosingRing() !== prevSeg.ringOut) {
                return prevSeg.ringOut;
              } else return prevSeg.ringOut.enclosingRing();
            }
            prevSeg = prevPrevSeg.prevInResult();
            prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;
          }
        }
      }
      class PolyOut {
        constructor(exteriorRing) {
          this.exteriorRing = exteriorRing;
          exteriorRing.poly = this;
          this.interiorRings = [];
        }
        addInterior(ring) {
          this.interiorRings.push(ring);
          ring.poly = this;
        }
        getGeom() {
          const geom = [this.exteriorRing.getGeom()];
          if (geom[0] === null) return null;
          for (let i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
            const ringGeom = this.interiorRings[i].getGeom();
            if (ringGeom === null) continue;
            geom.push(ringGeom);
          }
          return geom;
        }
      }
      class MultiPolyOut {
        constructor(rings) {
          this.rings = rings;
          this.polys = this._composePolys(rings);
        }
        getGeom() {
          const geom = [];
          for (let i = 0, iMax = this.polys.length; i < iMax; i++) {
            const polyGeom = this.polys[i].getGeom();
            if (polyGeom === null) continue;
            geom.push(polyGeom);
          }
          return geom;
        }
        _composePolys(rings) {
          const polys = [];
          for (let i = 0, iMax = rings.length; i < iMax; i++) {
            const ring = rings[i];
            if (ring.poly) continue;
            if (ring.isExteriorRing()) polys.push(new PolyOut(ring));
            else {
              const enclosingRing = ring.enclosingRing();
              if (!enclosingRing.poly) polys.push(new PolyOut(enclosingRing));
              enclosingRing.poly.addInterior(ring);
            }
          }
          return polys;
        }
      }
      class SweepLine {
        constructor(queue) {
          let comparator = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Segment.compare;
          this.queue = queue;
          this.tree = new Tree(comparator);
          this.segments = [];
        }
        process(event) {
          const segment = event.segment;
          const newEvents = [];
          if (event.consumedBy) {
            if (event.isLeft) this.queue.remove(event.otherSE);
            else this.tree.remove(segment);
            return newEvents;
          }
          const node = event.isLeft ? this.tree.add(segment) : this.tree.find(segment);
          if (!node) throw new Error(`Unable to find segment #${segment.id} [${segment.leftSE.point.x}, ${segment.leftSE.point.y}] -> [${segment.rightSE.point.x}, ${segment.rightSE.point.y}] in SweepLine tree.`);
          let prevNode = node;
          let nextNode = node;
          let prevSeg = void 0;
          let nextSeg = void 0;
          while (prevSeg === void 0) {
            prevNode = this.tree.prev(prevNode);
            if (prevNode === null) prevSeg = null;
            else if (prevNode.key.consumedBy === void 0) prevSeg = prevNode.key;
          }
          while (nextSeg === void 0) {
            nextNode = this.tree.next(nextNode);
            if (nextNode === null) nextSeg = null;
            else if (nextNode.key.consumedBy === void 0) nextSeg = nextNode.key;
          }
          if (event.isLeft) {
            let prevMySplitter = null;
            if (prevSeg) {
              const prevInter = prevSeg.getIntersection(segment);
              if (prevInter !== null) {
                if (!segment.isAnEndpoint(prevInter)) prevMySplitter = prevInter;
                if (!prevSeg.isAnEndpoint(prevInter)) {
                  const newEventsFromSplit = this._splitSafely(prevSeg, prevInter);
                  for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                    newEvents.push(newEventsFromSplit[i]);
                  }
                }
              }
            }
            let nextMySplitter = null;
            if (nextSeg) {
              const nextInter = nextSeg.getIntersection(segment);
              if (nextInter !== null) {
                if (!segment.isAnEndpoint(nextInter)) nextMySplitter = nextInter;
                if (!nextSeg.isAnEndpoint(nextInter)) {
                  const newEventsFromSplit = this._splitSafely(nextSeg, nextInter);
                  for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                    newEvents.push(newEventsFromSplit[i]);
                  }
                }
              }
            }
            if (prevMySplitter !== null || nextMySplitter !== null) {
              let mySplitter = null;
              if (prevMySplitter === null) mySplitter = nextMySplitter;
              else if (nextMySplitter === null) mySplitter = prevMySplitter;
              else {
                const cmpSplitters = SweepEvent.comparePoints(prevMySplitter, nextMySplitter);
                mySplitter = cmpSplitters <= 0 ? prevMySplitter : nextMySplitter;
              }
              this.queue.remove(segment.rightSE);
              newEvents.push(segment.rightSE);
              const newEventsFromSplit = segment.split(mySplitter);
              for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                newEvents.push(newEventsFromSplit[i]);
              }
            }
            if (newEvents.length > 0) {
              this.tree.remove(segment);
              newEvents.push(event);
            } else {
              this.segments.push(segment);
              segment.prev = prevSeg;
            }
          } else {
            if (prevSeg && nextSeg) {
              const inter = prevSeg.getIntersection(nextSeg);
              if (inter !== null) {
                if (!prevSeg.isAnEndpoint(inter)) {
                  const newEventsFromSplit = this._splitSafely(prevSeg, inter);
                  for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                    newEvents.push(newEventsFromSplit[i]);
                  }
                }
                if (!nextSeg.isAnEndpoint(inter)) {
                  const newEventsFromSplit = this._splitSafely(nextSeg, inter);
                  for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                    newEvents.push(newEventsFromSplit[i]);
                  }
                }
              }
            }
            this.tree.remove(segment);
          }
          return newEvents;
        }
        /* Safely split a segment that is currently in the datastructures
         * IE - a segment other than the one that is currently being processed. */
        _splitSafely(seg, pt) {
          this.tree.remove(seg);
          const rightSE = seg.rightSE;
          this.queue.remove(rightSE);
          const newEvents = seg.split(pt);
          newEvents.push(rightSE);
          if (seg.consumedBy === void 0) this.tree.add(seg);
          return newEvents;
        }
      }
      const POLYGON_CLIPPING_MAX_QUEUE_SIZE = typeof process !== "undefined" && process.env.POLYGON_CLIPPING_MAX_QUEUE_SIZE || 1e6;
      const POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS = typeof process !== "undefined" && process.env.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS || 1e6;
      class Operation {
        run(type, geom, moreGeoms) {
          operation.type = type;
          rounder.reset();
          const multipolys = [new MultiPolyIn(geom, true)];
          for (let i = 0, iMax = moreGeoms.length; i < iMax; i++) {
            multipolys.push(new MultiPolyIn(moreGeoms[i], false));
          }
          operation.numMultiPolys = multipolys.length;
          if (operation.type === "difference") {
            const subject = multipolys[0];
            let i = 1;
            while (i < multipolys.length) {
              if (getBboxOverlap(multipolys[i].bbox, subject.bbox) !== null) i++;
              else multipolys.splice(i, 1);
            }
          }
          if (operation.type === "intersection") {
            for (let i = 0, iMax = multipolys.length; i < iMax; i++) {
              const mpA = multipolys[i];
              for (let j = i + 1, jMax = multipolys.length; j < jMax; j++) {
                if (getBboxOverlap(mpA.bbox, multipolys[j].bbox) === null) return [];
              }
            }
          }
          const queue = new Tree(SweepEvent.compare);
          for (let i = 0, iMax = multipolys.length; i < iMax; i++) {
            const sweepEvents = multipolys[i].getSweepEvents();
            for (let j = 0, jMax = sweepEvents.length; j < jMax; j++) {
              queue.insert(sweepEvents[j]);
              if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
                throw new Error("Infinite loop when putting segment endpoints in a priority queue (queue size too big).");
              }
            }
          }
          const sweepLine = new SweepLine(queue);
          let prevQueueSize = queue.size;
          let node = queue.pop();
          while (node) {
            const evt = node.key;
            if (queue.size === prevQueueSize) {
              const seg = evt.segment;
              throw new Error(`Unable to pop() ${evt.isLeft ? "left" : "right"} SweepEvent [${evt.point.x}, ${evt.point.y}] from segment #${seg.id} [${seg.leftSE.point.x}, ${seg.leftSE.point.y}] -> [${seg.rightSE.point.x}, ${seg.rightSE.point.y}] from queue.`);
            }
            if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
              throw new Error("Infinite loop when passing sweep line over endpoints (queue size too big).");
            }
            if (sweepLine.segments.length > POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS) {
              throw new Error("Infinite loop when passing sweep line over endpoints (too many sweep line segments).");
            }
            const newEvents = sweepLine.process(evt);
            for (let i = 0, iMax = newEvents.length; i < iMax; i++) {
              const evt2 = newEvents[i];
              if (evt2.consumedBy === void 0) queue.insert(evt2);
            }
            prevQueueSize = queue.size;
            node = queue.pop();
          }
          rounder.reset();
          const ringsOut = RingOut.factory(sweepLine.segments);
          const result = new MultiPolyOut(ringsOut);
          return result.getGeom();
        }
      }
      const operation = new Operation();
      const union2 = function(geom) {
        for (var _len = arguments.length, moreGeoms = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          moreGeoms[_key - 1] = arguments[_key];
        }
        return operation.run("union", geom, moreGeoms);
      };
      const intersection = function(geom) {
        for (var _len2 = arguments.length, moreGeoms = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          moreGeoms[_key2 - 1] = arguments[_key2];
        }
        return operation.run("intersection", geom, moreGeoms);
      };
      const xor = function(geom) {
        for (var _len3 = arguments.length, moreGeoms = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          moreGeoms[_key3 - 1] = arguments[_key3];
        }
        return operation.run("xor", geom, moreGeoms);
      };
      const difference2 = function(subjectGeom) {
        for (var _len4 = arguments.length, clippingGeoms = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          clippingGeoms[_key4 - 1] = arguments[_key4];
        }
        return operation.run("difference", subjectGeom, clippingGeoms);
      };
      var index = {
        union: union2,
        intersection,
        xor,
        difference: difference2
      };
      return index;
    }));
  }
});

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/BonusAssessmentPanel.tsx
import { FieldLabel as FieldLabel2, PublicNumber as PublicNumber2 } from "/src/land-evaluation/PublicFields.jsx";
import { PublicSelect as PublicSelect2 } from "/src/land-evaluation/PublicSelect.jsx";
import { publicText as publicText2 } from "/src/land-evaluation/public-copy.mjs";

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/TdrApplicationPanel.tsx
import { FieldLabel, PublicNumber } from "/src/land-evaluation/PublicFields.jsx";
import { PublicSelect } from "/src/land-evaluation/PublicSelect.jsx";
import { publicText } from "/src/land-evaluation/public-copy.mjs";

// ../../../../../../src/sanze-cases-desktop/src/lib/site/siteRoadConditions.ts
var newSiteRoadConditions = () => ({ version: "site-road.v1", roadName: "", plannedWidth: "", openedWidth: "", frontage: "", connected: "unknown", status: "unknown", source: "", checkedAt: "" });
function reviewSiteRoad(r) {
  const errors = [], notes = [];
  if (!r) return { errors, notes: ["\u57FA\u5730\u8DEF\u5BEC\u5C1A\u672A\u8F38\u5165\u78BA\u8A8D\uFF1B\u4FDD\u7559\u898F\u5283\u76EE\u6A19\u4F5C\u5047\u8A2D\uFF0C\u4E0D\u80FD\u8A8D\u5B9A\u9053\u8DEF\u8CC7\u683C\u3002"] };
  for (const k of ["plannedWidth", "openedWidth", "frontage"]) if (r[k].trim() && (!Number.isFinite(Number(r[k])) || Number(r[k]) <= 0)) errors.push({ plannedWidth: "\u8A08\u756B\u8DEF\u5BEC", openedWidth: "\u5BE6\u969B\u958B\u95E2\u5BEC\u5EA6", frontage: "\u540C\u8DEF\u6BB5\u57FA\u5730\u9762\u5BEC" }[k] + "\u9808\u5927\u65BC0\uFF1B\u672A\u77E5\u8ACB\u7559\u767D");
  if (r.status === "confirmed" && (!r.plannedWidth.trim() || !r.source.trim() || (!/^\d{4}-\d{2}-\d{2}$/.test(r.checkedAt) || !Number.isFinite(Date.parse(r.checkedAt)) || new Date(r.checkedAt).toISOString().slice(0, 10) !== r.checkedAt))) errors.push("\u78BA\u8A8D\u8DEF\u5BEC\u9808\u586B\u8A08\u756B\u8DEF\u5BEC\u3001\u67E5\u8B49\u4F86\u6E90\u53CA\u67E5\u8B49\u65E5\u671F");
  if (r.status !== "confirmed") notes.push("\u57FA\u5730\u9053\u8DEF\u8CC7\u6599\u5C1A\u5C6C" + (r.status === "assumed" ? "\u660E\u793A\u66AB\u63A1\u503C" : "\u5F85\u78BA\u8A8D") + "\uFF0C\u672A\u8A8D\u5B9A\u7B26\u5408\u7533\u8ACB\u8CC7\u683C\u3002");
  if (!r.openedWidth.trim() || !r.frontage.trim() || r.connected === "unknown") notes.push("\u5BE6\u969B\u958B\u95E2\u5BEC\u5EA6\u3001\u540C\u8DEF\u6BB5\u9762\u5BEC\u6216\u958B\u95E2\u9023\u901A\u5C1A\u7F3A\uFF0C\u4E0D\u56E0\u8A08\u756B\u8DEF\u5BEC\u5DF2\u78BA\u8A8D\u5373\u8A8D\u5B9A\u5176\u9918\u8CC7\u683C\u3002");
  return { errors, notes };
}
function applySiteRoad(t, r) {
  if (!r) return t;
  return { ...t, roadWidth: r.plannedWidth, roadFrontage: r.frontage, roadOpened: r.connected === "no" || r.openedWidth.trim() && Number(r.openedWidth) < 8 ? "no" : r.openedWidth.trim() && r.connected === "yes" ? "yes" : "unknown" };
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/tdrApplication.ts
var TDR_APPLICATION_VERSION = "tdr-application.2026-10-19.v1";
var inferTdrCity = (district) => district.includes("\u65B0\u5317") ? "ntpc" : /臺北|台北/.test(district) ? "taipei" : "other";
var newTdrApplication = (city) => ({ version: TDR_APPLICATION_VERSION, city, method: "unselected", cashPercent: "", quantityBasis: "target", taipeiCap: "general30", taipeiRequested: "30", receiverUnitValue: "", senderParcels: [], cashSqm: "", valuationUnitPrice: "", valuationStatus: "assumed", valuationDate: "", valuationSource: "", appraisalFee: "", otherFee: "", paidAmount: "", stage: "planning", receiverEligibility: "unknown", methodEligibility: "unknown", roadWidth: "", roadOpened: "unknown", roadFrontage: "", specialRoadApproved: false, taipeiLocation: "unknown", source: "" });
var newTdrSender = () => ({ id: crypto.randomUUID(), parcel: "", kind: "road", area: "", share: "100", unitValue: "", year: String((/* @__PURE__ */ new Date()).getFullYear() - 1911), existingVolume: "", baseVolume: "", compensationPercent: "0", opening: "unknown", unanimous: "unknown", eligible: "unknown", purchaseCost: "", source: "" });
var strs = (x, keys) => keys.every((k) => typeof x[k] === "string");
function isTdrApplication(x) {
  if (!x || typeof x !== "object") return false;
  const t = x;
  return (t.buildingAct81 === void 0 || typeof t.buildingAct81 === "boolean") && (t.receiverPlan === void 0 || typeof t.receiverPlan === "string") && ["landEligibility", "cashEligibility"].every((k) => t[k] === void 0 || ["unknown", "yes", "no"].includes(t[k])) && t.version === TDR_APPLICATION_VERSION && ["ntpc", "taipei", "other"].includes(t.city) && ["unselected", "land", "cash", "mixed"].includes(t.method) && ["target", "supply", "permitted"].includes(t.quantityBasis) && ["permittedSqm", "permittedSource"].every((k) => t[k] === void 0 || typeof t[k] === "string") && ["general30", "qualified40"].includes(t.taipeiCap) && ["assumed", "approved"].includes(t.valuationStatus) && ["planning", "written", "reviewed", "transferred", "paid", "permitted"].includes(t.stage) && ["receiverEligibility", "methodEligibility", "roadOpened"].every((k) => ["unknown", "yes", "no"].includes(t[k])) && ["unknown", "metro", "park", "historic"].includes(t.taipeiLocation) && typeof t.specialRoadApproved === "boolean" && strs(t, ["cashPercent", "taipeiRequested", "receiverUnitValue", "cashSqm", "valuationUnitPrice", "valuationDate", "valuationSource", "appraisalFee", "otherFee", "paidAmount", "roadWidth", "roadFrontage", "source"]) && Array.isArray(t.senderParcels) && t.senderParcels.length <= 1e3 && new Set(t.senderParcels.map((p) => p.id)).size === t.senderParcels.length && t.senderParcels.every((p) => p && strs(p, ["id", "parcel", "area", "share", "unitValue", "year", "existingVolume", "baseVolume", "compensationPercent", "purchaseCost", "source"]) && ["park", "green", "plaza", "road", "playground", "sport", "other_public", "historic"].includes(p.kind) && ["unknown", "opened", "unopened"].includes(p.opening) && ["unanimous", "eligible"].every((k) => ["unknown", "yes", "no"].includes(p[k])));
}
function tdrCashPercent(t, legacy) {
  if (!t) return legacy;
  return t.method === "cash" ? 100 : t.method === "land" || t.method === "unselected" ? 0 : t.cashPercent.trim() ? Number(t.cashPercent) : 50;
}
var tdrLaws = { ntpc: "https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150015", ntpcProcedure: "https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150122", ntpcPoints: "https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150118", taipei: "https://laws.gov.taipei/Law/LawSearch/LawArticleContent/FL074357", taipeiProcedure: "https://udd.gov.taipei/events/f3gxcu9-10547", central: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070028" };
function reviewTdrApplication(t, c, requestedPercent, capPercent, otherAwardPercent = 0) {
  t = applySiteRoad(t, c.roadConditions);
  const roadReview = reviewSiteRoad(c.roadConditions);
  const errors = [...roadReview.errors], notes = [...roadReview.notes], gaps = [], base = c.site * c.far / 100, landActive = t.method === "land" || t.method === "mixed", cashActive = t.method === "cash" || t.method === "mixed";
  let eligible = true, roadCap = capPercent;
  const n = (s, label, fallback = 0) => {
    if (!s.trim()) return fallback;
    const z = Number(s);
    if (!Number.isFinite(z) || z < 0) {
      errors.push(label + "\u9808\u70BA\u6709\u6548\u975E\u8CA0\u6578");
      return 0;
    }
    return z;
  };
  const cashPercent = tdrCashPercent(t, 0), city = inferTdrCity(c.district ?? "");
  if (c.district && city !== "other" && city !== t.city) errors.push("\u6848\u4EF6\u884C\u653F\u5340\u8207\u6240\u9078\u5BB9\u79FB\u6CD5\u898F\u5730\u5340\u4E0D\u7B26\uFF0C\u8ACB\u5148\u6838\u5C0D\u6848\u4EF6\u6240\u5728\u5730");
  if (t.quantityBasis === "permitted") {
    const quota = n(t.permittedSqm ?? "", "\u65E2\u6709\u8A31\u53EF\u79FB\u5165\u5BB9\u7A4D\u33A1");
    if (quota <= 0) errors.push("\u65E2\u6709\u8A31\u53EF\u79FB\u5165\u5BB9\u7A4D\u9808\u5927\u65BC0");
    if (!t.permittedSource?.trim()) errors.push("\u9808\u586B\u65E2\u6709\u5BB9\u79FB\u8A31\u53EF\u6587\u865F\u53CA\u6587\u4EF6\u4F86\u6E90");
    if (t.stage !== "permitted") errors.push("\u65E2\u6709\u8A31\u53EF\u5C0D\u7167\u9808\u660E\u793A\u5DF2\u6709\u8A31\u53EF\u6587\u4EF6\uFF1B\u898F\u5283\u6216\u5BE9\u67E5\u4E2D\u4E0D\u5F97\u63A1\u7528");
    if (!Number.isFinite(requestedPercent) || requestedPercent < 0) errors.push("\u5BB9\u79FB\u76EE\u6A19\u9808\u70BA\u6709\u6548\u975E\u8CA0\u6578");
    const cap2 = base > 0 ? quota / base * 100 : 0, targetSqm2 = base * Math.max(0, requestedPercent) / 100;
    const appliedSqm2 = errors.length ? 0 : Math.min(targetSqm2, quota);
    notes.push("\u65E2\u6709\u8A31\u53EF\u5BB9\u7A4D\u5C0D\u7167\uFF1A\u50C5\u4F7F\u7528\u6240\u9644\u6587\u4EF6\u984D\u5EA6\uFF0C\u4E0D\u91CD\u65B0\u8A8D\u5B9A\u672C\u6848\u7B26\u5408\u73FE\u884C\u65B0\u7533\u8ACB\u8CC7\u683C\uFF1B\u4E0D\u56E0\u6B64\u8C41\u514D\u4E00\u822C\u6216\u6587\u8CC7\u5BB9\u79FB\u7684\u57FA\u5730\u9580\u6ABB\u3002");
    notes.push(`\u65E2\u6709\u8A31\u53EF\u4F86\u6E90\uFF1A${t.permittedSource ?? "\u672A\u586B"}\uFF1B\u6587\u4EF6\u79FB\u5165\u91CF${quota.toFixed(2)}\u33A1\uFF0C\u672C\u6B21\u76EE\u6A19${requestedPercent}%\u3002\u53D6\u5F97\u6210\u672C\u53E6\u6838\u3002`);
    return { city: t.city, method: t.method, landActive: false, cashActive: false, cashPercent: 0, eligible: !errors.length, capPercent: cap2, targetSqm: targetSqm2, landTarget: 0, cashTarget: 0, donorSqm: 0, cashSupplied: null, supplySqm: quota, appliedSqm: appliedSqm2, appliedPercent: base > 0 ? appliedSqm2 / base * 100 : 0, actualLand: 0, actualCash: 0, cashCost: null, landCost: null, fees: 0, totalCost: null, senders: [], errors, notes, gaps, stage: t.stage, valuationStatus: "assumed" };
  }
  if (!Number.isFinite(cashPercent) || cashPercent < 0 || cashPercent > 100) errors.push("\u4EE3\u91D1\u6BD4\u4F8B\u9808\u70BA0\u81F3100%");
  if (t.method === "mixed" && (cashPercent <= 0 || cashPercent >= 100)) errors.push("\u6DF7\u5408\u65B9\u5F0F\u4EE3\u91D1\u6BD4\u4F8B\u9808\u5927\u65BC0\u4E14\u5C0F\u65BC100%\uFF1B\u7D14\u4EE3\u91D1\u8ACB\u9078\u5168\u4EE3\u91D1");
  if (t.method === "unselected") gaps.push("\u5C1A\u672A\u9078\u5B9A\u53D6\u5F97\u65B9\u5F0F\uFF0C\u50C5\u8A66\u7B97\u76EE\u6A19\u5BB9\u7A4D\uFF0C\u672A\u78BA\u8A8D\u9001\u51FA\u5730\u6216\u4EE3\u91D1\u69CB\u6210");
  if (t.method === "mixed" && !t.cashPercent.trim()) gaps.push("\u6DF7\u5408\u65B9\u5F0F\u6BD4\u4F8B\u672A\u586B\uFF0C\u66AB\u63A1\u4EE3\u91D150%\u4F5C\u660E\u793A\u5047\u8A2D");
  if (t.city === "taipei" && t.method !== "unselected" && cashPercent < 50) errors.push("\u81FA\u5317\u5E02\u4E00\u822C\u90FD\u5E02\u8A08\u756B\u5BB9\u79FB\u81F3\u5C1150%\u4EE3\u91D1\uFF1B\u4E0D\u53EF\u7528\u5168\u9001\u51FA\u5730\u6350\u8D08\u6216\u4F4E\u65BC50%\u4EE3\u91D1\u69CB\u6210");
  if (t.receiverEligibility === "no" || t.methodEligibility === "no") {
    eligible = false;
    notes.push("\u5DF2\u77E5\u63A5\u53D7\u57FA\u5730\u6216\u7533\u8ACB\u65B9\u5F0F\u4E0D\u9069\u7528\uFF0C\u63A1\u8A08\u79FB\u5165\u91CF0");
  }
  if (landActive && t.landEligibility === "no" || cashActive && t.cashEligibility === "no") {
    eligible = false;
    notes.push("\u6240\u9078\u65B9\u5F0F\u7684\u9001\u51FA\u5730\u6350\u8D08\u6216\u4EE3\u91D1\u7533\u8ACB\u8CC7\u683C\u5DF2\u77E5\u4E0D\u7B26\uFF0C\u672C\u6B21\u7D44\u5408\u63A1\u8A080\uFF1B\u4E0D\u81EA\u52D5\u66F4\u63DB\u53D6\u5F97\u65B9\u5F0F");
  }
  if (cashActive && t.cashEligibility !== "yes") gaps.push("\u4EE3\u91D1\u65B9\u5F0F\u8CC7\u683C\u5F85\u6838\uFF1A\u4E3B\u7BA1\u6A5F\u95DC\u53D7\u7406\u7BC4\u570D\u3001\u540C\u4E3B\u8981\u8A08\u756B\u5340\u53EF\u53D6\u5F97\u516C\u8A2D\u53CA\u500B\u6848\u898F\u5B9A\uFF0C\u5C1A\u672A\u8A8D\u5B9A\u53EF\u7E73\u4EE3\u91D1\u53D6\u5F97");
  if (landActive && t.landEligibility !== "yes") gaps.push("\u6350\u8D08\uFF0F\u9001\u51FA\u5730\u65B9\u5F0F\u8CC7\u683C\u5F85\u6838\uFF1A\u540C\u610F\u3001\u53D7\u8D08\u689D\u4EF6\u3001\u6B0A\u5229\u6E05\u7406\u3001\u6240\u5728\u5730\u53CA\u8A08\u756B\u7BC4\u570D\u672A\u9F4A");
  const road = t.roadWidth.trim() ? n(t.roadWidth, "\u9053\u8DEF\u5BEC\u5EA6") : null, front = t.roadFrontage.trim() ? n(t.roadFrontage, "\u9023\u63A5\u9053\u8DEF\u57FA\u5730\u9762\u5BEC") : null;
  if (t.city === "ntpc") {
    const act81 = t.specialRoadApproved && t.buildingAct81 === true;
    if (c.site < 500 && !act81) {
      eligible = false;
      notes.push("\u65B0\u5317\u4E00\u822C\u53CA\u7A84\u8DEF\u4F8B\u5916\u57FA\u5730\u4ECD\u9808\u2265500\u33A1\uFF1B\u53EA\u6709\u5EFA\u7BC9\u6CD581\u689D\u7279\u5B9A\u4F8B\u5916\u53E6\u6838\u3002");
    }
    if (front !== null && front < 8 && !act81) {
      eligible = false;
      notes.push("\u540C\u4E00\u8DEF\u6BB5\u57FA\u5730\u9762\u5BEC\u672A\u90548m\uFF1B\u4E00\u822C\u7A84\u8DEF\u4F8B\u5916\u4E0D\u514D\u9664\u9762\u5BEC\u689D\u4EF6\uFF0C\u63A1\u8A080\u3002");
    }
    if (act81) {
      roadCap = Math.min(roadCap, 15);
      notes.push("\u4F9D\u660E\u793A\u5EFA\u7BC9\u6CD581\u689D\u8A8D\u5B9A\u4F8B\u5916\u521D\u4F30\uFF0C\u4E0A\u965015%\uFF1B\u9808\u53E6\u9644\u4E3B\u7BA1\u6A5F\u95DC\u8A8D\u5B9A\u8207\u6838\u51C6\u91CD\u5EFA\u6587\u4EF6\u3002");
    } else if (road !== null && road < 8) {
      if (t.specialRoadApproved && road >= 6) {
        roadCap = Math.min(roadCap, 15);
        notes.push("\u7D93\u6838\u51C6\u91CD\u5EFA\u7A84\u8DEF\u4F8B\u5916\uFF1A\u9053\u8DEF6m\u4EE5\u4E0A\u672A\u90548m\uFF0C\u4F9D\u7B2C6\u9EDE\u9650\u57FA\u6E96\u5BB9\u7A4D15%\uFF0C\u4E0D\u53D7\u4E00\u822C30%\u9078\u55AE\u653E\u5BEC\u3002");
      } else {
        eligible = false;
        notes.push("\u9053\u8DEF\u672A\u90548m\u4E14\u672A\u7B26\u54086m\u4EE5\u4E0A\u6838\u51C6\u91CD\u5EFA\u4F8B\u5916\uFF0C\u63A1\u8A080\uFF1B\u672A\u90546m\u9808\u53E6\u6838\u5EFA\u7BC9\u6CD581\u689D\u8DEF\u5F91\u3002");
      }
    }
    if (t.roadOpened === "no" && !act81 && !(t.specialRoadApproved && road !== null && road >= 6 && road < 8)) {
      eligible = false;
      notes.push("\u9053\u8DEF\u8DB3\u5BEC\u958B\u95E2\u53CA\u9023\u901A\u689D\u4EF6\u5DF2\u77E5\u672A\u7B26\uFF0C\u4EA6\u672A\u9069\u7528\u7B2C6\u9EDE\u4F8B\u5916\uFF0C\u63A1\u8A080\u3002");
    }
    if (t.specialRoadApproved && road === null && !act81) {
      roadCap = Math.min(roadCap, 15);
      gaps.push("\u7A84\u8DEF\u4F8B\u5916\u8DEF\u5BEC\u672A\u586B\uFF0C\u66AB\u4F9D6m\u81F3\u672A\u6EFF8m\u3001\u4E0A\u965015%\u521D\u4F30\uFF1B\u9762\u7A4D\u8207\u540C\u8DEF\u6BB5\u9762\u5BEC\u4ECD\u9808\u7B26\u5408\u3002");
    }
    notes.push("\u65B0\u5317\u7279\u6B8A\u6838\u51C6\u91CD\u5EFA\u82E5\u9078\u514D\u91CF\u9AD4\u8A55\u5B9A\u8DEF\u5F91\uFF0C\u734E\u52F5\u53CA\u5BB9\u79FB\u5408\u8A08\u965050%\uFF1B\u4F9D\u4E00\u822C\u91CF\u9AD4\u8A55\u5B9A\u8DEF\u5F91\u8005\uFF0C\u4E0D\u56E0\u5C6C\u5371\u8001\u5C31\u81EA\u52D5\u5957\u7528\u8A72\u7279\u6B8A\u5408\u8A08\u4E0A\u9650\u3002");
    notes.push("\u65B0\u5317\uFF1A\u4E00\u822C\u6848\u4EF6\u4F9D\u91CF\u9AD4\u8A55\u5B9A\uFF1B\u4EE3\u91D160\uFF0F80\uFF0F100%\u5C0D\u57FA\u6E96\u91CF\u53CA\u5167\u90E8\u5206\u5225\u52A00.1\uFF0F0.2\uFF0F0.3\u500D\u3002100%\u4EE3\u91D1\u7684\u9001\u51FA\u4F4D\u7F6E\u7D44\u4EE510\u5206\u53D6\u4EE3\uFF0C\u90E8\u5206\u4EE3\u91D1\u4E0D\u9069\u7528\u8A72\u7D44\u3002");
  } else if (t.city === "taipei") {
    if (c.site <= 1e3) {
      eligible = false;
      notes.push("\u81FA\u5317\u63A5\u53D7\u57FA\u5730\u9808\u8D85\u904E1000\u33A1\uFF081000\u33A1\u672C\u8EAB\u4E0D\u7B26\u5408\uFF09\uFF0C\u63A1\u8A080");
    }
    if (t.roadOpened === "no" && t.taipeiLocation !== "historic") {
      eligible = false;
      notes.push("\u81FA\u5317\u516C\u8A2D\u9001\u51FA\u5730\u63A5\u53D7\u57FA\u5730\u7684\u5DF2\u958B\u95E2\u9053\u8DEF\u689D\u4EF6\u5DF2\u77E5\u672A\u7B26\uFF0C\u63A1\u8A080");
    }
    if (road !== null && (t.taipeiLocation === "metro" && road < 8 || t.taipeiLocation === "park" && road < 12)) {
      eligible = false;
      notes.push("\u81FA\u5317\u6240\u9078\u63A5\u53D7\u57FA\u5730\u4F4D\u7F6E\u7684\u9053\u8DEF\u9580\u6ABB\u5DF2\u77E5\u672A\u7B26\uFF0C\u63A1\u8A080");
    }
    if (t.taipeiLocation === "unknown") gaps.push("\u81FA\u5317\u7B2C6\u689D\u4F4D\u7F6E\u689D\u4EF6\u5C1A\u672A\u6838\u5BE6\uFF1A\u6377\u904B800m\uFF0B\u5DF2\u95E28m\u9053\u8DEF\uFF0C\u6216500m\u5167\u22650.5ha\u516C\u5712\u7DA0\u5730\u5EE3\u5834\uFF0B\u5DF2\u95E215m\u9053\u8DEF\uFF0F\u5169\u8DEF\u5176\u4E2D12m\uFF1B\u6B77\u53F2\u5EFA\u7269\u53E6\u6838");
    notes.push("\u81FA\u5317\u7B2C2-1\u30014\u689D\uFF1A\u4EE3\u91D1\u81F3\u5C1150%\u3001\u9001\u51FA\u5730\u7576\u6B21\u6700\u591A50%\uFF1B\u7B2C9\u689D\u5BB9\u79FB\u52A0\u5176\u4ED6\u734E\u52F5\u5408\u8A08\u2264\u6CD5\u5B9A\u5BB9\u7A4D50%\uFF0C\u4F46\u90FD\u66F4\u53CA\u5371\u8001\u734E\u52F5\u4E0D\u7D0D\u5165\u8A72\u5408\u8A08\u3002\u4E0D\u5F97\u5957\u7528\u65B0\u5317\u8A55\u9EDE\u3001\u4EE3\u91D1\u52A0\u500D\u3001\u66F4\u65B0\u5730\u53400.3\u6216\u7279\u6B8A\u5408\u8A0850%\u898F\u5247\u3002");
  } else gaps.push("\u5176\u4ED6\u7E23\u5E02\u672A\u5EFA\u5730\u65B9\u5BB9\u79FB\u898F\u5247\uFF0C\u4E0D\u5957\u65B0\u5317\u6216\u81FA\u5317\u7D30\u9805\uFF0C\u50C5\u4FDD\u7559\u660E\u793A\u76EE\u6A19");
  if (road === null) gaps.push("\u9053\u8DEF\u5BEC\u5EA6\u672A\u586B\uFF0C\u66AB\u6309\u6240\u9078\u8DEF\u5F91\u53EF\u7B26\u5408\uFF1B\u5F85\u5716\u8CC7\u3001\u958B\u95E2\u53CA\u5EFA\u7BC9\u7DDA\u6587\u4EF6\u8986\u6838");
  if (t.receiverEligibility === "unknown" || t.methodEligibility === "unknown") gaps.push("\u8CC7\u683C\u672A\u77E5\uFF0C\u4F9D\u76EE\u6A19\u5047\u8A2D\u7E7C\u7E8C\uFF1B\u975E\u6838\u51C6\u3001\u975E\u5DF2\u53D6\u5F97\u5BB9\u7A4D");
  const receiver = landActive ? n(t.receiverUnitValue, "\u63A5\u53D7\u57FA\u5730\u52A0\u6B0A\u516C\u544A\u73FE\u503C") : 0;
  const senders = t.senderParcels.map((p) => {
    if (!landActive || p.eligible === "no") return { id: p.id, parcel: p.parcel, kind: p.kind, valid: false, volume: 0, issues: [!landActive ? "\u672C\u6B21\u672A\u63A1\u9001\u51FA\u5730\uFF1B\u8CC7\u6599\u4FDD\u7559\u4E0D\u53C3\u8207\u8A08\u7B97" : "\u672C\u7B46\u5DF2\u505C\u7528\u6216\u8CC7\u683C\u4E0D\u7B26\uFF1B\u4E0D\u5217\u4F9B\u7D66\u8207\u672C\u6B21\u53D6\u5F97\u6210\u672C"], cost: null };
    const issues = [];
    let valid = true;
    const area2 = n(p.area, "\u9001\u51FA\u5730\u9762\u7A4D"), share = n(p.share, "\u9001\u51FA\u5730\u6301\u5206%", 100), unit = n(p.unitValue, "\u9001\u51FA\u5730\u516C\u544A\u73FE\u503C"), comp = p.kind === "historic" ? 0 : n(p.compensationPercent, "\u88DC\u511F\u6BD4\u7387");
    if (share > 100 || comp > 100) errors.push("\u9001\u51FA\u5730\u6301\u5206\u53CA\u88DC\u511F\u6BD4\u7387\u4E0D\u5F97\u8D85\u904E100%");
    if (!p.parcel.trim() || !area2 || !unit || !receiver) issues.push("\u5730\u865F\u3001\u9762\u7A4D\u6216\u7533\u8ACB\u7576\u671F\u516C\u544A\u73FE\u503C\u5C1A\u7F3A\uFF0C\u8A72\u7B46\u4F9B\u7D66\u66AB\u63A10");
    if (t.city === "taipei") {
      if (["playground", "sport", "other_public"].includes(p.kind)) {
        valid = false;
        issues.push("\u81FA\u5317\u4E00\u822C\u90FD\u5E02\u8A08\u756B\u9001\u51FA\u985E\u578B\u4E0D\u542B\u6B64\u9805");
      }
      if (p.kind === "road" && p.opening === "unopened") issues.push("\u672A\u95E2\u9053\u8DEF\u9808\u5B8C\u6574\u8DEF\u6BB5\u5169\u7AEF\u9023\u63A5\u5DF2\u95E2\u8A08\u756B\u9053\u8DEF\u6216\u516C\u544A\u6D88\u9632\u901A\u9053\uFF0C\u4E26\u5168\u9AD4\u540C\u610F\u4E00\u6B21\u6350\u8D08");
      if (["park", "green", "plaza"].includes(p.kind) && p.opening === "opened") {
        valid = false;
        issues.push("\u81FA\u5317\u7B2C4\u689D\u6B64\u985E\u9001\u51FA\u571F\u5730\u9650\u672A\u958B\u95E2\u8005");
      }
      if (p.opening === "unopened" && p.unanimous === "no") {
        valid = false;
        issues.push("\u9808\u5168\u6578\u540C\u610F\u4E14\u4E00\u6B21\u6350\u8D08\uFF0C\u5DF2\u77E5\u672A\u53D6\u5F97\u540C\u610F");
      }
    } else if (t.city === "ntpc" && !["park", "playground", "green", "sport", "plaza", "historic"].includes(p.kind) && p.opening !== "opened" && p.unanimous === "no") {
      valid = false;
      issues.push("\u65B0\u5317\u975E\u4E94\u9805\u958B\u653E\u516C\u8A2D\u4E14\u672A\u958B\u95E2\uFF0C\u9808\u5168\u5730\u865F\u79C1\u6709\u6240\u6709\u6B0A\u4EBA\u540C\u610F\uFF08\u4F8B\u5916\u53E6\u6838\uFF09");
    }
    let volume = receiver > 0 ? area2 * Math.min(100, share) / 100 * unit / receiver * c.far / 100 : 0;
    if (p.kind === "historic") {
      const existing = n(p.existingVolume, "\u73FE\u5DF2\u5EFA\u7BC9\u5BB9\u7A4D"), senderBase = n(p.baseVolume, "\u9001\u51FA\u5730\u57FA\u6E96\u5BB9\u7A4D");
      volume *= senderBase > 0 && p.existingVolume.trim() ? Math.max(0, 1 - existing / senderBase) : 0;
      if (!senderBase || !p.existingVolume.trim()) issues.push("\u6B77\u53F2\u5EFA\u7269\u7684\u73FE\u6709\u53CA\u57FA\u6E96\u5BB9\u7A4D\u672A\u6838\uFF0C\u4E0D\u4EE5\u4E00\u822C\u516C\u8A2D\u8DB3\u984D\u79FB\u51FA");
      issues.push("\u4E00\u822C\u90FD\u5E02\u8A08\u756B\u6B77\u53F2\u5EFA\u7269\u8DEF\u5F91\u9808\u4FDD\u5B58\u4FEE\u5FA9\u53CA\u6587\u5316\u6A5F\u95DC\u5BE9\u67E5\uFF0C\u4E0D\u662F\u571F\u5730\u76F4\u63A5\u6350\u8D08\uFF1B\u7368\u7ACB\u6587\u8CC7\u79FB\u8F49\u53E6\u6CD5\u53E6\u6838");
    }
    volume *= 1 - Math.min(100, comp) / 100;
    if (!valid || !area2 || !unit || !receiver || !p.parcel.trim()) volume = 0;
    const expectedYear = String((/* @__PURE__ */ new Date()).getFullYear() - 1911);
    if (!p.year.trim() || p.year !== expectedYear) issues.push("\u516C\u544A\u73FE\u503C\u5E74\u5EA6\u9700\u5C0D\u7167\u5BE6\u969B\u7533\u8ACB\u7576\u671F\uFF0C\u4E0D\u80FD\u628A\u820A\u5E74\u5EA6\u6578\u503C\u6A19\u70BA\u7576\u671F\u5DF2\u67E5\u8B49");
    if (p.eligible === "unknown" || p.unanimous === "unknown" || p.opening === "unknown") issues.push("\u9001\u51FA\u8CC7\u683C\uFF0F\u958B\u95E2\u6216\u540C\u610F\u5C1A\u5F85\u8B49\u660E\uFF0C\u672C\u7B46\u6309\u660E\u793A\u5047\u8A2D\u8A08\u7B97\uFF0C\u975E\u5DF2\u53D6\u5F97");
    return { id: p.id, parcel: p.parcel, kind: p.kind, valid, volume, issues, cost: p.purchaseCost.trim() ? n(p.purchaseCost, "\u9001\u51FA\u5730\u53D6\u5F97\u6210\u672C") : null };
  });
  let donorSqm = senders.reduce((a, p) => a + p.volume, 0);
  if (t.city === "ntpc") {
    const nonOpen = senders.filter((p) => !["park", "playground", "green", "sport", "plaza", "historic"].includes(p.kind)).reduce((a, p) => a + p.volume, 0);
    donorSqm -= Math.max(0, nonOpen - base * 0.2);
    if (nonOpen > base * 0.2) notes.push("\u65B0\u5317\u975E\u4E94\u9805\u958B\u653E\u516C\u8A2D\u9001\u51FA\u91CF\u4F9D\u8981\u9EDE8(5)\u5408\u8A08\u9650\u63A5\u53D7\u57FA\u5730\u57FA\u6E96\u5BB9\u7A4D20%\uFF0C\u5DF2\u622A\u9650");
  }
  if (c.roadConditions?.status === "confirmed" && !eligible && requestedPercent > 0) errors.push("\u5DF2\u78BA\u8A8D\u57FA\u5730\u9053\u8DEF\uFF0F\u8CC7\u683C\u4E0D\u7B26\u6240\u9078\u5BB9\u79FB\u7533\u8ACB\u689D\u4EF6\uFF1A\u963B\u64CB\u78BA\u8A8D\u63A1\u7528\uFF1B\u9808\u4F9D\u6CD5\u4FEE\u6B63\u7533\u8ACB\u8DEF\u5F91\uFF0C\u4E0D\u53EF\u6539\u7528\u5047\u8A2D\u653E\u884C\u3002");
  const cap = t.city === "taipei" ? Math.min(t.taipeiCap === "qualified40" ? 40 : 30, Math.max(0, 50 - otherAwardPercent)) : roadCap;
  if (c.roadConditions?.status === "confirmed" && requestedPercent > cap + 1e-8) errors.push(`\u5DF2\u78BA\u8A8D\u9053\u8DEF\u689D\u4EF6\u4E0B\u7533\u8ACB\u76EE\u6A19${requestedPercent}%\u8D85\u904E\u672C\u8DEF\u5F91${cap}%\u4E0A\u9650\uFF0C\u9808\u4FEE\u6B63\u76EE\u6A19\u5F8C\u624D\u80FD\u78BA\u8A8D\u63A1\u7528\u3002`);
  const desired = Math.min(Math.max(0, requestedPercent), cap), targetSqm = base * desired / 100, landTarget = landActive ? targetSqm * (1 - cashPercent / 100) : 0, cashTarget = cashActive ? targetSqm * cashPercent / 100 : 0;
  const cashSupplied = cashActive && t.cashSqm.trim() ? n(t.cashSqm, "\u4EE3\u91D1\u7533\u8ACB\u5BB9\u7A4D\u33A1") : null;
  let supplySqm = t.method === "cash" ? cashSupplied ?? 0 : t.method === "land" ? donorSqm : t.method === "mixed" ? Math.min(cashPercent > 0 ? (cashSupplied ?? 0) / (cashPercent / 100) : 0, cashPercent < 100 ? donorSqm / (1 - cashPercent / 100) : 0) : 0;
  const unitPrice = cashActive && t.valuationUnitPrice.trim() ? n(t.valuationUnitPrice, "\u4EE3\u91D1\u6BCF\u5BB9\u7A4D\u33A1\u4F30\u50F9") : null;
  if (unitPrice === 0) errors.push("\u5DF2\u586B\u4EE3\u91D1\u6BCF\u5BB9\u7A4D\u33A1\u4F30\u50F9\u9808\u5927\u65BC0\uFF1B\u672A\u4F30\u8ACB\u7559\u767D\uFF0C\u4E0D\u4EE50\u8996\u70BA\u514D\u8CBB\u6216\u6838\u5B9A\u3002");
  const fees = (cashActive && t.appraisalFee.trim() ? n(t.appraisalFee, "\u4F30\u50F9\u8CBB") : 0) + (t.method !== "unselected" && t.otherFee.trim() ? n(t.otherFee, "\u5176\u4ED6\u898F\u8CBB") : 0);
  if (cashActive && t.paidAmount.trim()) n(t.paidAmount, "\u5DF2\u7E73\u4EE3\u91D1");
  const appliedSqm = eligible && !errors.length ? t.quantityBasis === "supply" ? Math.min(targetSqm, supplySqm) : targetSqm : 0;
  const actualCash = cashActive ? appliedSqm * cashPercent / 100 : 0, actualLand = landActive ? appliedSqm * (1 - cashPercent / 100) : 0;
  const activeSenders = senders.filter((p) => p.valid && p.volume > 0);
  const cashCost = cashActive && unitPrice !== null ? actualCash * unitPrice : null, landCost = landActive && activeSenders.length && activeSenders.every((p) => p.cost !== null) ? activeSenders.reduce((a, p) => a + (p.cost ?? 0), 0) : null;
  if (cashActive && !unitPrice) gaps.push("\u4EE3\u91D1\u91D1\u984D\u9808\u7531\u4E3B\u7BA1\u6A5F\u95DC\u59D4\u8A17\u4E09\u5BB6\u4EE5\u4E0A\u5C08\u696D\u4F30\u50F9\u8005\u67E5\u4F30\u8A55\u5B9A\uFF1B\u7F3A\u503C\u986F\u793A\u672A\u4F30\uFF0C\u4E0D\u4EE5\u516C\u544A\u73FE\u503C\u6BD4\u76F4\u63A5\u7576\u4EE3\u91D1");
  if (t.valuationStatus === "approved" && !t.valuationSource.trim()) gaps.push("\u672A\u9644\u6B63\u5F0F\u8A55\u5B9A\u4F86\u6E90\uFF0C\u4F30\u50F9\u4ECD\u6A19\u793A\u898F\u5283\u5047\u8A2D\uFF0C\u4E0D\u8996\u70BA\u5DF2\u6838\u5B9A");
  return { city: t.city, method: t.method, landActive, cashActive, cashPercent, eligible, capPercent: cap, targetSqm, landTarget, cashTarget, donorSqm, cashSupplied, supplySqm, appliedSqm, appliedPercent: base > 0 ? appliedSqm / base * 100 : 0, actualLand, actualCash, cashCost, landCost, fees, totalCost: t.method === "unselected" ? null : cashActive && cashCost === null || landActive && landCost === null ? null : (cashCost ?? 0) + (landCost ?? 0) + fees, senders, errors, notes, gaps, stage: t.stage, valuationStatus: t.valuationStatus === "approved" && t.valuationSource.trim() && unitPrice !== null ? "approved" : "assumed" };
}
var esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function renderTdrApplication(t, r) {
  if (t.quantityBasis === "permitted") return `<h3>\u65E2\u6709\u8A31\u53EF\u5BB9\u7A4D\u5C0D\u7167</h3><p>\u6587\u4EF6\u79FB\u5165\u91CF${r.supplySqm.toFixed(2)}\u33A1\uFF1B\u672C\u6B21\u63A1\u8A08${r.appliedSqm.toFixed(2)}\u33A1\uFF08${r.appliedPercent.toFixed(4)}%\uFF09\u3002</p>${[...r.errors, ...r.notes].map((n) => `<p>${esc(n)}</p>`).join("")}`;
  return `<h3>\u5BB9\u79FB\u5730\u5340\u53CA\u53D6\u5F97\u65B9\u5F0F</h3><p>\u6CD5\u898F\u5730\u5340${r.city === "ntpc" ? "\u65B0\u5317\u5E02" : r.city === "taipei" ? "\u81FA\u5317\u5E02" : "\u5176\u4ED6"}\uFF0C\u65B9\u5F0F${esc(r.method)}\uFF0C\u91CF\u6E90${t.quantityBasis === "target" ? "\u898F\u5283\u76EE\u6A19" : "\u9001\u51FA\u5730\u53CA\u4EE3\u91D1\u6578\u91CF"}\u3002\u4EE3\u91D1${r.cashPercent}%\uFF1B\u672C\u6B21\u63A1\u8A08${r.appliedSqm.toFixed(2)}\u33A1\uFF08${r.appliedPercent.toFixed(4)}%\uFF09\u3002</p><p>\u9001\u51FA\u5730\u4F9B\u7D66${r.donorSqm.toFixed(2)}\u33A1\u3001\u4EE3\u91D1\u7533\u8ACB${r.cashSupplied === null ? "\u672A\u586B" : r.cashSupplied.toFixed(2)}\u33A1\uFF1B\u672C\u6B21\u914D\u7F6E\u9001\u51FA\u5730${r.actualLand.toFixed(2)}\u33A1\u3001\u4EE3\u91D1${r.actualCash.toFixed(2)}\u33A1\u3002\u672A\u9078\u65B9\u5F0F\u4E0D\u4EE3\u8868\u5DF2\u53D6\u5F97\uFF0C\u4F86\u6E90\u8207\u6838\u51C6\u5206\u958B\u3002</p><table><tr><th>\u9001\u51FA\u5730</th><th>\u7A2E\u985E</th><th>\u63DB\u5165\u91CF\u33A1</th><th>\u67E5\u6838</th></tr>${r.senders.map((p) => `<tr><td>${esc(p.parcel)}</td><td>${esc(p.kind)}</td><td>${p.volume.toFixed(2)}</td><td>${esc(p.issues.join("\uFF1B"))}</td></tr>`).join("")}</table><p>\u4EE3\u91D1${r.cashCost === null ? "\u672A\u4F30" : r.cashCost.toFixed(0) + "\u5143"}\uFF1B\u9001\u51FA\u5730\u53D6\u5F97\u6210\u672C${r.landCost === null ? "\u672A\u4F30" : r.landCost.toFixed(0) + "\u5143"}\uFF1B\u4F30\u50F9\u53CA\u5176\u4ED6\u898F\u8CBB${r.fees.toFixed(0)}\u5143\uFF1B\u53D6\u5F97\u6210\u672C\u5408\u8A08${r.totalCost === null ? "\u672A\u4F30\u5B8C\u6574" : r.totalCost.toFixed(0) + "\u5143"}\u3002\u4EE3\u91D1\u4F30\u50F9\u72C0\u614B${esc(r.valuationStatus)}\uFF0C\u4F86\u6E90${esc(t.valuationSource || "\u672A\u586B")}\u3002\u6210\u672C\u4E0D\u81EA\u52D5\u5012\u586B\u81F3\u5176\u4ED6\u6A21\u7D44\uFF0C\u907F\u514D\u91CD\u8907\u5217\u5E33\u3002</p>${[...r.errors, ...r.notes, ...r.gaps].map((n) => `<p>${esc(n)}</p>`).join("")}<p><a href="${tdrLaws[r.city === "taipei" ? "taipei" : "ntpc"]}">\u5730\u65B9\u5BB9\u79FB\u898F\u5247</a> \uFF0F <a href="${tdrLaws[r.city === "taipei" ? "taipeiProcedure" : "ntpcProcedure"]}">\u7533\u8ACB\u7A0B\u5E8F</a> \uFF0F <a href="${tdrLaws.central}">\u4E2D\u592E\u7B2C9\u30019-1\u689D</a></p>`;
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/TdrApplicationPanel.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function TdrApplicationPanel({
  assessment,
  district,
  review,
  change,
  roadConditions
}) {
  const saved = assessment.tdrApplication ?? newTdrApplication(inferTdrCity(district)), t = applySiteRoad(saved, roadConditions), r = review;
  const edit = (patch) => {
    const next = {
      ...saved,
      ...patch
    };
    change({
      tdrApplication: next,
      tdrApplications: {
        ...assessment.tdrApplications,
        [t.city]: next
      }
    });
  };
  const city = (next) => {
    const target = assessment.tdrApplications?.[next] ?? newTdrApplication(next);
    change({
      tdrApplication: target,
      tdrApplications: {
        ...assessment.tdrApplications,
        [t.city]: t,
        [next]: target
      }
    });
  };
  const number = (key, label) => /* @__PURE__ */ jsxs("label", { children: [
    /* @__PURE__ */ jsx(FieldLabel, { children: label }),
    /* @__PURE__ */ jsx(PublicNumber, { "aria-label": label, type: "number", min: "0", step: "any", value: t[key] ?? "", onChange: (e) => edit({
      [key]: e.target.value
    }) })
  ] });
  const condition = (key, label) => /* @__PURE__ */ jsxs("label", { children: [
    /* @__PURE__ */ jsx(FieldLabel, { children: label }),
    /* @__PURE__ */ jsxs(PublicSelect, { "aria-label": label, value: t[key] ?? "unknown", onChange: (e) => edit({
      [key]: e.target.value
    }), children: [
      /* @__PURE__ */ jsx("option", { value: "unknown", children: "\u7F3A\u6587\u4EF6\uFF0C\u4F9D\u76EE\u6A19\u5047\u8A2D\u521D\u4F30" }),
      /* @__PURE__ */ jsx("option", { value: "yes", children: "\u4F9D\u6240\u9644\u8CC7\u6599\u78BA\u8A8D\u7B26\u5408" }),
      /* @__PURE__ */ jsx("option", { value: "no", children: "\u5DF2\u77E5\u4E0D\u7B26\u5408\uFF0C\u63A1\u8A080" })
    ] })
  ] });
  const land = t.method === "land" || t.method === "mixed", cash = t.method === "cash" || t.method === "mixed";
  const editSender = (id, patch) => edit({
    senderParcels: t.senderParcels.map((p) => p.id === id ? {
      ...p,
      ...patch
    } : p)
  });
  return /* @__PURE__ */ jsxs("section", { className: "area-review-panel", "aria-label": "\u5BB9\u79FB\u5730\u5340\u8207\u53D6\u5F97\u65B9\u5F0F", children: [
    /* @__PURE__ */ jsx("h4", { children: "\u5BB9\u79FB\u5730\u5340\u8207\u53D6\u5F97\u65B9\u5F0F" }),
    /* @__PURE__ */ jsx("p", { children: "\u4F9D\u6848\u4EF6\u6240\u5728\u5730\u5E36\u5165\uFF1B\u65B0\u5317\u8207\u81FA\u5317\u5404\u81EA\u4FDD\u7559\u65B9\u5F0F\u8207\u6578\u64DA\uFF0C\u5207\u63DB\u4E0D\u6DF7\u7528\u3002\u6B64\u8655\u662F\u4E00\u822C\u90FD\u5E02\u8A08\u756B\u5BB9\u79FB\uFF1B\u7368\u7ACB\u6587\u8CC7\u5BB9\u79FB\u3001\u7279\u5225\u90FD\u5E02\u8A08\u756B\u53CA\u820A\u6848\u904E\u6E21\u898F\u5B9A\u9808\u53E6\u6838\u3002" }),
    /* @__PURE__ */ jsxs("div", { className: "planning-field-grid", children: [
      /* @__PURE__ */ jsxs("label", { children: [
        /* @__PURE__ */ jsx(FieldLabel, { children: "\u5BB9\u79FB\u6CD5\u898F\u5730\u5340" }),
        /* @__PURE__ */ jsxs(PublicSelect, { "aria-label": "\u5BB9\u79FB\u6CD5\u898F\u5730\u5340", value: t.city, onChange: (e) => city(e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "ntpc", children: "\u65B0\u5317\u5E02" }),
          /* @__PURE__ */ jsx("option", { value: "taipei", children: "\u81FA\u5317\u5E02" }),
          /* @__PURE__ */ jsx("option", { value: "other", children: "\u5176\u4ED6\u7E23\u5E02\uFF08\u53E6\u6838\uFF09" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { children: [
        /* @__PURE__ */ jsx(FieldLabel, { children: "\u5BB9\u79FB\u53D6\u5F97\u65B9\u5F0F" }),
        /* @__PURE__ */ jsxs(PublicSelect, { "aria-label": "\u5BB9\u79FB\u53D6\u5F97\u65B9\u5F0F", value: t.method, onChange: (e) => edit({
          method: e.target.value
        }), children: [
          /* @__PURE__ */ jsx("option", { value: "unselected", children: "\u672A\u9078\u5B9A\uFF0C\u5148\u6309\u76EE\u6A19\u521D\u4F30" }),
          /* @__PURE__ */ jsx("option", { value: "land", children: "\u9001\u51FA\u57FA\u5730\uFF08\u571F\u5730\u6350\u8D08\uFF0F\u6B77\u53F2\u5EFA\u7269\u53E6\u6838\uFF09" }),
          /* @__PURE__ */ jsx("option", { value: "cash", children: "\u5168\u90E8\u7E73\u7D0D\u5BB9\u7A4D\u4EE3\u91D1" }),
          /* @__PURE__ */ jsx("option", { value: "mixed", children: "\u9001\u51FA\u57FA\u5730\uFF0B\u4EE3\u91D1\u6DF7\u5408" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { children: [
        /* @__PURE__ */ jsx(FieldLabel, { children: "\u79FB\u5165\u91CF\u4F86\u6E90" }),
        /* @__PURE__ */ jsxs(PublicSelect, { "aria-label": "\u79FB\u5165\u91CF\u4F86\u6E90", value: t.quantityBasis, onChange: (e) => edit({
          quantityBasis: e.target.value
        }), children: [
          /* @__PURE__ */ jsx("option", { value: "target", children: "\u5148\u63A1\u898F\u5283\u76EE\u6A19\uFF08\u53D6\u5F97\u91CF\u5C1A\u5F85\u78BA\u8A8D\uFF09" }),
          /* @__PURE__ */ jsx("option", { value: "permitted", children: "\u65E2\u6709\u8A31\u53EF\u5BB9\u7A4D\uFF08\u6587\u4EF6\u5C0D\u7167\uFF09" }),
          /* @__PURE__ */ jsx("option", { value: "supply", children: "\u4F9D\u5DF2\u586B\u9001\u51FA\u5730\u53CA\u4EE3\u91D1\u7533\u8ACB\u91CF\u9650\u5236" })
        ] })
      ] }),
      t.method === "mixed" && number("cashPercent", "\u4EE3\u91D1\u5360\u7576\u6B21\u79FB\u5165\u5BB9\u7A4D\u6BD4\u4F8B%\uFF08\u975E\u91D1\u984D\u6BD4\uFF09")
    ] }),
    t.quantityBasis === "permitted" ? /* @__PURE__ */ jsxs("div", { className: "planning-field-grid", children: [
      number("permittedSqm", "\u65E2\u6709\u8A31\u53EF\u79FB\u5165\u5BB9\u7A4D\u33A1"),
      /* @__PURE__ */ jsxs("label", { children: [
        /* @__PURE__ */ jsx(FieldLabel, { children: "\u65E2\u6709\u5BB9\u79FB\u8A31\u53EF\u6587\u865F\u53CA\u6587\u4EF6\u4F86\u6E90" }),
        /* @__PURE__ */ jsx("textarea", { "aria-label": "\u65E2\u6709\u5BB9\u79FB\u8A31\u53EF\u6587\u865F\u53CA\u6587\u4EF6\u4F86\u6E90", value: t.permittedSource ?? "", onChange: (e) => edit({
          permittedSource: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsx("p", { children: "\u65E2\u6709\u8A31\u53EF\u6848\u4EF6\u4F9D\u6587\u4EF6\u5C0D\u7167\uFF1B\u65B0\u7533\u8ACB\u6848\u4EF6\u4F9D\u73FE\u884C\u8CC7\u683C\u6AA2\u6838\u3002\u63A1\u8A08\u91CF\u4E0D\u8D85\u904E\u6587\u4EF6\u984D\u5EA6\uFF0C\u4E14\u9808\u660E\u793A\u5DF2\u6709\u8A31\u53EF\u6587\u4EF6\u3002" })
    ] }) : null,
    /* @__PURE__ */ jsxs("div", { hidden: t.quantityBasis === "permitted", children: [
      t.city === "taipei" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "\u81FA\u5317\u4E00\u822C\u5BB9\u79FB\uFF1A\u81F3\u5C1150%\u7E73\u4EE3\u91D1\uFF0C\u9001\u51FA\u5730\u7576\u6B21\u6700\u591A50%\u3002" }),
          "\u7121\u65B0\u5317\u91CF\u9AD4\u8A55\u9EDE\u621660\uFF0F80\uFF0F100%\u4EE3\u91D1\u500D\u6578\uFF1B\u4E0D\u628A\u90FD\u66F4\u6216\u5371\u8001\u734E\u52F5\u7B97\u9032\u81EA\u6CBB\u689D\u4F8B\u7B2C9\u689D\u7684\u5176\u4ED6\u734E\u52F5\u5408\u8A0850%\u9650\u5236\u3002"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "planning-field-grid", children: [
          /* @__PURE__ */ jsxs("label", { children: [
            /* @__PURE__ */ jsx(FieldLabel, { children: "\u81FA\u5317\u5BB9\u79FB\u4E0A\u9650\u689D\u4EF6" }),
            /* @__PURE__ */ jsxs(PublicSelect, { "aria-label": "\u81FA\u5317\u5BB9\u79FB\u4E0A\u9650\u689D\u4EF6", value: t.taipeiCap, onChange: (e) => edit({
              taipeiCap: e.target.value
            }), children: [
              /* @__PURE__ */ jsx("option", { value: "general30", children: "\u4E00\u822C\u57FA\u6E96\u5BB9\u7A4D30%" }),
              /* @__PURE__ */ jsx("option", { value: "qualified40", children: "\u7B26\u5408\u4E2D\u592E\u7B2C8\u689D\u589E\u52A0\u5730\u5340\u689D\u4EF640%\uFF08\u9808\u9644\u4F9D\u64DA\uFF09" })
            ] })
          ] }),
          number("taipeiRequested", "\u81FA\u5317\u7D30\u9805\u7533\u8ACB\u76EE\u6A19%"),
          /* @__PURE__ */ jsxs("label", { children: [
            /* @__PURE__ */ jsx(FieldLabel, { children: "\u81FA\u5317\u63A5\u53D7\u57FA\u5730\u4F4D\u7F6E\u689D\u4EF6" }),
            /* @__PURE__ */ jsxs(PublicSelect, { value: t.taipeiLocation, onChange: (e) => edit({
              taipeiLocation: e.target.value
            }), children: [
              /* @__PURE__ */ jsx("option", { value: "unknown", children: "\u5F85\u6838\uFF1A\u66AB\u6309\u7B26\u5408\u6240\u9078\u8DEF\u5F91" }),
              /* @__PURE__ */ jsx("option", { value: "metro", children: "\u6377\u904B\u51FA\u5165\u53E3800m\u5167\uFF0B\u5DF2\u95E28m\u9053\u8DEF" }),
              /* @__PURE__ */ jsx("option", { value: "park", children: "500m\u5167\u22650.5ha\u516C\u5712\u7B49\uFF0B15m\u9053\u8DEF\u6216\u5169\u8DEF\u5176\u4E2D12m" }),
              /* @__PURE__ */ jsx("option", { value: "historic", children: "\u4E00\u822C\u6B77\u53F2\u5EFA\u7269\u9001\u51FA\u5730\u4E4B\u63A5\u53D7\u57FA\u5730\u8DEF\u5F91" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { children: "\u9762\u7A4D\u9808\u8D85\u904E1000\u33A1\uFF0C\u4E26\u6838\u5C71\u5761\u5730\u3001\u5730\u8CEA\u6F5B\u529B\u3001\u6587\u8CC7\u3001\u4FDD\u8B77\u5340\u8B8A\u66F4\u53CA\u571F\u7BA1\u7981\u9650\u3002\u6350\u5730\u9650\u7B2C4\u689D\u8DEF\u6BB5\u53CA\u672A\u958B\u95E2\u516C\u5712\uFF0F\u7DA0\u5730\uFF0F\u5EE3\u5834\uFF1B\u672A\u958B\u95E2\u8DEF\u6BB5\u7B49\u9808\u5168\u9AD4\u540C\u610F\u4E00\u6B21\u6350\u8D08\u3002\u6B77\u53F2\u5EFA\u7269\u53E6\u9808\u6587\u5316\u6A5F\u95DC\u4FDD\u5B58\u4FEE\u5FA9\u7A0B\u5E8F\u3002" })
      ] }) : t.city === "ntpc" ? /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "\u65B0\u5317\uFF1A\u4E00\u822C\u57FA\u5730\u2265500\u33A1\uFF0C\u540C\u4E00\u8DEF\u6BB5\u9762\u5BEC\u3001\u9053\u8DEF\u53CA\u8DB3\u5BEC\u958B\u95E2\u901A\u5E38\u9808\u90548m\uFF1B\u4F8B\u5916\u53E6\u6838\u3002" }),
        "\u9001\u51FA\u5730\u65B9\u5F0F\u4F9D\u7B2C8\u9EDE\u5BE9\u67E5\uFF1B\u4EE3\u91D1\u4F9D\u7B2C7\u9EDE\u4F30\u50F9\u300260\uFF0F80\uFF0F100%\u4EE3\u91D1\u52A0\u8A08\u50C5\u9069\u7528\u65B0\u5317\uFF1B100%\u4EE3\u91D1\u4E4B\u9001\u51FA\u4F4D\u7F6E\u7D44\u53D610\u5206\uFF0C\u90E8\u5206\u4EE3\u91D1\u4E0D\u9069\u7528\u8A72\u7D44\uFF0C\u4E26\u53D7\u6240\u9078\u8DEF\u5F91\u4E0A\u9650\u3002"
      ] }) : /* @__PURE__ */ jsx("p", { children: "\u5176\u4ED6\u7E23\u5E02\u4E0D\u5957\u7528\u65B0\u5317\uFF0F\u81FA\u5317\u5730\u65B9\u7D30\u5247\uFF0C\u9808\u88DC\u5165\u7576\u5730\u6CD5\u6E90\u3002" }),
      /* @__PURE__ */ jsxs("p", { children: [
        "\u8A08\u756B\u8DEF\u5BEC\uFF1A",
        t.roadWidth || "\u672A\u586B",
        "m\uFF1B\u540C\u8DEF\u6BB5\u57FA\u5730\u9762\u5BEC\uFF1A",
        t.roadFrontage || "\u672A\u586B",
        "m\u3002\u8DEF\u5BEC\u61C9\u65BC\u57FA\u5730\u8207\u689D\u4EF6\u8F38\u5165\u78BA\u8A8D\uFF1B\u6B64\u8655\u8B80\u53D6\u540C\u4E00\u4F86\u6E90\u3002"
      ] }),
      /* @__PURE__ */ jsxs("details", { children: [
        /* @__PURE__ */ jsx("summary", { children: "\u63A5\u53D7\u57FA\u5730\u53CA\u7533\u8ACB\u8CC7\u683C" }),
        /* @__PURE__ */ jsxs("div", { className: "planning-field-grid", children: [
          /* @__PURE__ */ jsxs("label", { children: [
            /* @__PURE__ */ jsx(FieldLabel, { children: "\u63A5\u53D7\u57FA\u5730\u4E3B\u8981\uFF0F\u7D30\u90E8\u8A08\u756B\u540D\u7A31" }),
            /* @__PURE__ */ jsx("input", { value: t.receiverPlan ?? "", onChange: (e) => edit({
              receiverPlan: e.target.value
            }) })
          ] }),
          condition("receiverEligibility", "\u63A5\u53D7\u57FA\u5730\u4F4D\u7F6E\u3001\u5206\u5340\u53CA\u7981\u9650\u8CC7\u683C"),
          condition("methodEligibility", "\u7533\u8ACB\u65B9\u5F0F\u53CA\u9001\u51FA\u5730\uFF0F\u4EE3\u91D1\u9069\u7528\u8CC7\u683C"),
          /* @__PURE__ */ jsxs("label", { children: [
            /* @__PURE__ */ jsx(FieldLabel, { children: "\u9053\u8DEF\u8DB3\u5BEC\u958B\u95E2\u53CA\u9023\u901A\uFF08\u9023\u52D5\u57FA\u5730\u8CC7\u6599\uFF09" }),
            /* @__PURE__ */ jsxs(PublicSelect, { disabled: true, value: t.roadOpened, onChange: (e) => edit({
              roadOpened: e.target.value
            }), children: [
              /* @__PURE__ */ jsx("option", { value: "unknown", children: "\u5F85\u78BA\u8A8D\uFF0C\u660E\u793A\u5047\u8A2D" }),
              /* @__PURE__ */ jsx("option", { value: "yes", children: "\u4F9D\u6587\u4EF6\u78BA\u8A8D" }),
              /* @__PURE__ */ jsx("option", { value: "no", children: "\u5DF2\u77E5\u4E0D\u7B26\u5408" })
            ] })
          ] }),
          t.city === "ntpc" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("label", { children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: t.specialRoadApproved, onChange: (e) => edit({
                specialRoadApproved: e.target.checked
              }) }),
              "\u65B0\u5317\u6838\u51C6\u91CD\u5EFA\u7A84\u8DEF\u4F8B\u5916\uFF086m\u81F3\u672A\u6EFF8m\u965015%\uFF1B\u4ECD\u9808\u2265500\u33A1\u53CA\u540C\u8DEF\u6BB5\u9762\u5BEC8m\uFF09"
            ] }),
            t.specialRoadApproved && /* @__PURE__ */ jsxs("label", { children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: t.buildingAct81 ?? false, onChange: (e) => edit({
                buildingAct81: e.target.checked
              }) }),
              "\u53E6\u6709\u5EFA\u7BC9\u6CD581\u689D\u5371\u96AA\u6216\u5B89\u5168\u4E4B\u865E\u8A8D\u5B9A\u53CA\u6838\u51C6\u91CD\u5EFA\u6587\u4EF6\uFF08\u7B2C6\u9EDE\u7B2C2\u6B3E\uFF0C\u965015%\uFF09"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          /* @__PURE__ */ jsx(FieldLabel, { children: "\u8CC7\u683C\u3001\u7BC4\u570D\u3001\u4F8B\u5916\u53CA\u67E5\u8A62\u4F86\u6E90" }),
          /* @__PURE__ */ jsx("textarea", { value: t.source, onChange: (e) => edit({
            source: e.target.value
          }) })
        ] })
      ] }),
      land && /* @__PURE__ */ jsxs("details", { open: true, children: [
        /* @__PURE__ */ jsx("summary", { children: "\u9001\u51FA\u57FA\u5730\u8CC7\u6599\u8207\u63DB\u5165\u91CF" }),
        /* @__PURE__ */ jsx("p", { children: "\u4EE5\u7533\u8ACB\u7576\u671F\u516C\u544A\u73FE\u503C\u63DB\u7B97\uFF0C\u516C\u544A\u73FE\u503C\u4E0D\u662F\u8CFC\u5730\u6210\u4EA4\u50F9\u6216\u5BB9\u7A4D\u4EE3\u91D1\u4F30\u50F9\u3002\u591A\u7B46\u5404\u6309\u5BE6\u969B\u6301\u5206\u53CA\u9762\u7A4D\u8A08\u7B97\uFF1B\u63A5\u53D7\u57FA\u5730\u516C\u544A\u73FE\u503C\u9808\u4F9D\u57FA\u5730\u9762\u7A4D\u52A0\u6B0A\uFF0C\u5206\u5340\u5BB9\u7A4D\u7387\u4E0D\u540C\u6642\u53E6\u6838\u52A0\u6B0A\u3002" }),
        condition("landEligibility", "\u9001\u51FA\u5730\uFF0F\u6350\u8D08\u65B9\u5F0F\u8CC7\u683C"),
        number("receiverUnitValue", "\u63A5\u53D7\u57FA\u5730\u9762\u7A4D\u52A0\u6B0A\u516C\u544A\u73FE\u503C\u5143\uFF0F\u33A1"),
        /* @__PURE__ */ jsx("button", { className: "secondary-btn", onClick: () => edit({
          senderParcels: [...t.senderParcels, newTdrSender()]
        }), children: "\u65B0\u589E\u9001\u51FA\u5730\u865F" }),
        t.senderParcels.map((p, j) => {
          const send = (patch) => editSender(p.id, patch), num = (key, label) => /* @__PURE__ */ jsxs("label", { children: [
            /* @__PURE__ */ jsx(FieldLabel, { children: label }),
            /* @__PURE__ */ jsx(PublicNumber, { "aria-label": `\u9001\u51FA\u5730${j + 1}${label}`, type: "number", min: "0", step: "any", value: p[key], onChange: (e) => send({
              [key]: e.target.value
            }) })
          ] });
          return /* @__PURE__ */ jsxs("details", { open: true, children: [
            /* @__PURE__ */ jsxs("summary", { children: [
              "\u9001\u51FA\u5730",
              j + 1,
              "\uFF1A",
              p.parcel || "\u5730\u865F\u672A\u586B"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "planning-field-grid", children: [
              /* @__PURE__ */ jsxs("label", { children: [
                /* @__PURE__ */ jsx(FieldLabel, { children: "\u5730\u865F" }),
                /* @__PURE__ */ jsx("input", { "aria-label": `\u9001\u51FA\u5730${j + 1}\u5730\u865F`, value: p.parcel, onChange: (e) => send({
                  parcel: e.target.value
                }) })
              ] }),
              /* @__PURE__ */ jsxs("label", { children: [
                /* @__PURE__ */ jsx(FieldLabel, { children: "\u9001\u51FA\u5730\u7A2E\u985E" }),
                /* @__PURE__ */ jsx(PublicSelect, { value: p.kind, onChange: (e) => send({
                  kind: e.target.value
                }), children: [["road", "\u9053\u8DEF"], ["park", "\u516C\u5712"], ["green", "\u7DA0\u5730"], ["plaza", "\u5EE3\u5834"], ["playground", "\u5152\u7AE5\u904A\u6A02\u5834\uFF08\u65B0\u5317\uFF09"], ["sport", "\u9AD4\u80B2\u5834\uFF08\u65B0\u5317\uFF09"], ["other_public", "\u5176\u4ED6\u516C\u5171\u8A2D\u65BD\uFF08\u65B0\u5317\u53E6\u965020%\uFF09"], ["historic", "\u4E00\u822C\u90FD\u5E02\u8A08\u756B\u6B77\u53F2\u5EFA\u7269\uFF08\u4FDD\u5B58\u7A0B\u5E8F\u53E6\u6838\uFF09"]].map(([v, l]) => /* @__PURE__ */ jsx("option", { value: v, children: l }, v)) })
              ] }),
              num("area", "\u571F\u5730\u9762\u7A4D\u33A1"),
              num("share", "\u7533\u8ACB\u6301\u5206%"),
              num("unitValue", "\u516C\u544A\u73FE\u503C\u5143\uFF0F\u33A1"),
              num("year", "\u516C\u544A\u73FE\u503C\u5E74\u5EA6\uFF08\u6C11\u570B\uFF09"),
              num("purchaseCost", "\u53D6\u5F97\u6210\u672C\u5143\uFF08\u6574\u7B46\u7533\u8ACB\u6301\u5206\u7E3D\u50F9\uFF09"),
              /* @__PURE__ */ jsxs("label", { children: [
                /* @__PURE__ */ jsx(FieldLabel, { children: "\u958B\u95E2\u72C0\u614B" }),
                /* @__PURE__ */ jsxs(PublicSelect, { value: p.opening, onChange: (e) => send({
                  opening: e.target.value
                }), children: [
                  /* @__PURE__ */ jsx("option", { value: "unknown", children: "\u5F85\u78BA\u8A8D" }),
                  /* @__PURE__ */ jsx("option", { value: "opened", children: "\u5DF2\u958B\u95E2" }),
                  /* @__PURE__ */ jsx("option", { value: "unopened", children: "\u672A\u958B\u95E2" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("label", { children: [
                /* @__PURE__ */ jsx(FieldLabel, { children: "\u5168\u9AD4\u6240\u6709\u6B0A\u4EBA\u540C\u610F" }),
                /* @__PURE__ */ jsxs(PublicSelect, { value: p.unanimous, onChange: (e) => send({
                  unanimous: e.target.value
                }), children: [
                  /* @__PURE__ */ jsx("option", { value: "unknown", children: "\u5F85\u78BA\u8A8D" }),
                  /* @__PURE__ */ jsx("option", { value: "yes", children: "\u5DF2\u5177\u5099" }),
                  /* @__PURE__ */ jsx("option", { value: "no", children: "\u5C1A\u672A\u53D6\u5F97\uFF0F\u5DF2\u77E5\u4E0D\u7B26\u5408" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("label", { children: [
                /* @__PURE__ */ jsx(FieldLabel, { children: "\u9001\u51FA\u8CC7\u683C\u53CA\u53D7\u8D08\u689D\u4EF6" }),
                /* @__PURE__ */ jsxs(PublicSelect, { value: p.eligible, onChange: (e) => send({
                  eligible: e.target.value
                }), children: [
                  /* @__PURE__ */ jsx("option", { value: "unknown", children: "\u76EE\u6A19\u5047\u8A2D\uFF0C\u5C1A\u672A\u8B49\u5BE6" }),
                  /* @__PURE__ */ jsx("option", { value: "yes", children: "\u4F9D\u6240\u9644\u6587\u4EF6\u7B26\u5408" }),
                  /* @__PURE__ */ jsx("option", { value: "no", children: "\u4E0D\u7B26\u5408\uFF0F\u505C\u7528\u672C\u7B46\uFF0C\u4E0D\u5217\u4F9B\u7D66" })
                ] })
              ] }),
              p.kind === "historic" && /* @__PURE__ */ jsxs(Fragment, { children: [
                num("existingVolume", "\u73FE\u5DF2\u5EFA\u7BC9\u5BB9\u7A4D\u33A1"),
                num("baseVolume", "\u9001\u51FA\u5730\u57FA\u6E96\u5BB9\u7A4D\u33A1")
              ] }),
              p.kind !== "historic" && num("compensationPercent", "\u5730\u4E0A\u6B0A\uFF0F\u6377\u904B\u88DC\u511F\u5360\u7576\u6642\u516C\u544A\u73FE\u503C\u6BD4\u7387%\uFF08\u7121\u52470\uFF09")
            ] }),
            /* @__PURE__ */ jsxs("label", { children: [
              /* @__PURE__ */ jsx(FieldLabel, { children: "\u7576\u671F\u516C\u544A\u3001\u6B0A\u5229\u6E05\u7406\u3001\u8DEF\u6BB5\u3001\u53D7\u8D08\u53CA\u4FDD\u5B58\u7A0B\u5E8F\u4F86\u6E90" }),
              /* @__PURE__ */ jsx("input", { value: p.source, onChange: (e) => send({
                source: e.target.value
              }) })
            ] })
          ] }, p.id);
        })
      ] }),
      cash && /* @__PURE__ */ jsxs("details", { open: true, children: [
        /* @__PURE__ */ jsx("summary", { children: "\u4EE3\u91D1\u7533\u8ACB\u8207\u4F30\u50F9\u8CC7\u6599" }),
        condition("cashEligibility", "\u6298\u7E73\u4EE3\u91D1\u65B9\u5F0F\u8CC7\u683C"),
        /* @__PURE__ */ jsx("p", { children: "\u4EE3\u91D1\u91CF\u4EE5\u5BB9\u7A4D\u6A13\u5730\u677F\u33A1\u8868\u793A\uFF1B\u4EE3\u91D1\u6BD4\u4F8B\u662F\u79FB\u5165\u5BB9\u7A4D\u91CF\u6BD4\u4F8B\u3002\u4F30\u50F9\u9808\u4E3B\u7BA1\u6A5F\u95DC\u59D4\u8A17\u4E09\u5BB6\u4EE5\u4E0A\u5C08\u696D\u4F30\u50F9\u8005\u67E5\u4F30\u8A55\u5B9A\uFF0C\u4E0D\u7528\u9001\u51FA\u5730\u516C\u544A\u73FE\u503C\u6BD4\u63DB\u7B97\u4EE3\u91D1\u3002\u898F\u5283\u55AE\u50F9\u53EF\u5148\u4F30\uFF0C\u4F46\u4E0D\u6A19\u70BA\u6838\u5B9A\u3002" }),
        /* @__PURE__ */ jsxs("div", { className: "planning-field-grid", children: [
          number("cashSqm", "\u4EE3\u91D1\u7533\u8ACB\u5BB9\u7A4D\u33A1\uFF08\u4F9D\u4F9B\u7D66\u91CF\u8A08\u7B97\u6642\u4F7F\u7528\uFF09"),
          number("valuationUnitPrice", "\u6BCF\u5BB9\u7A4D\u33A1\u4EE3\u91D1\u4F30\u50F9\u5143"),
          /* @__PURE__ */ jsxs("label", { children: [
            /* @__PURE__ */ jsx(FieldLabel, { children: "\u4F30\u50F9\u72C0\u614B" }),
            /* @__PURE__ */ jsxs(PublicSelect, { value: t.valuationStatus, onChange: (e) => edit({
              valuationStatus: e.target.value
            }), children: [
              /* @__PURE__ */ jsx("option", { value: "assumed", children: "\u898F\u5283\u5047\u8A2D\uFF0C\u975E\u6B63\u5F0F\u4F30\u50F9" }),
              /* @__PURE__ */ jsx("option", { value: "approved", children: "\u5DF2\u9644\u4E3B\u7BA1\u6A5F\u95DC\u8A55\u5B9A\u6587\u4EF6" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { children: [
            /* @__PURE__ */ jsx(FieldLabel, { children: "\u4F30\u50F9\uFF0F\u6838\u5B9A\u65E5\u671F" }),
            /* @__PURE__ */ jsx("input", { type: "date", value: t.valuationDate, onChange: (e) => edit({
              valuationDate: e.target.value
            }) })
          ] }),
          number("appraisalFee", "\u4F30\u50F9\u53CA\u5354\u6AA2\u8CBB\u5143"),
          number("otherFee", "\u5176\u4ED6\u7533\u8ACB\u898F\u8CBB\u5143"),
          number("paidAmount", "\u5DF2\u7E73\uFF0F\u9810\u7E73\u4EE3\u91D1\u5143")
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          /* @__PURE__ */ jsx(FieldLabel, { children: "\u4F30\u50F9\u3001\u8A55\u5B9A\u53CA\u7E73\u6B3E\u4F86\u6E90" }),
          /* @__PURE__ */ jsx("textarea", { value: t.valuationSource, onChange: (e) => edit({
            valuationSource: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsx("p", { children: t.city === "ntpc" ? "\u65B0\u5317\uFF1A\u66F8\u9762\uFF0F\u91CF\u9AD4\u5BE9\u67E5\u5F8C\u8FA6\u7406\u4F30\u50F9\uFF1B\u901A\u77E5\u7E73\u7D0D\u6216\u9810\u7E73\u4E26\u4F9D\u898F\u5B9A\u627E\u88DC\uFF0C\u5E02\u5E9C\u78BA\u8A8D\u5F8C\u6838\u767C\u8A31\u53EF\u3002" : "\u81FA\u5317\uFF1A\u7DDA\u4E0A\u53CA\u66F8\u9762\u7533\u8ACB\u3001\u5EFA\u7BC9\u8A08\u756B\u90FD\u5BE9\uFF0F\u6838\u5B9A\uFF0C\u4F9D\u4EE3\u91D1\u4F30\u50F9\u3001\u7E73\u6B3E\u53CA\u8A31\u53EF\u7A0B\u5E8F\uFF1B\u90FD\u66F4\u4F75\u8B8A\u66F4\u90FD\u8A08\u8207\u5FEB\u901F\u8ACB\u7167\u53E6\u6709\u6D41\u7A0B\u3002" })
      ] }),
      t.method === "unselected" && /* @__PURE__ */ jsx("p", { children: "\u8ACB\u9078\u64C7\u6350\u8D08\u3001\u4EE3\u91D1\u6216\u6DF7\u5408\u65B9\u5F0F\uFF1B\u7559\u767D\u6642\u4F9D\u76EE\u6A19\u4F30\u7B97\u3002" })
    ] }),
    t.quantityBasis === "permitted" && /* @__PURE__ */ jsxs("label", { children: [
      /* @__PURE__ */ jsx(FieldLabel, { children: "\u65E2\u6709\u8A31\u53EF\u6587\u4EF6\u78BA\u8A8D" }),
      /* @__PURE__ */ jsxs(PublicSelect, { "aria-label": "\u65E2\u6709\u8A31\u53EF\u6587\u4EF6\u78BA\u8A8D", value: t.stage, onChange: (e) => edit({
        stage: e.target.value
      }), children: [
        /* @__PURE__ */ jsx("option", { value: "planning", children: "\u5C1A\u672A\u53D6\u5F97\u8A31\u53EF\u6587\u4EF6" }),
        /* @__PURE__ */ jsx("option", { value: "permitted", children: "\u5DF2\u6709\u8A31\u53EF\u6587\u4EF6\uFF0C\u4F9B\u672C\u6B21\u5C0D\u7167" })
      ] })
    ] }),
    r && /* @__PURE__ */ jsxs("details", { children: [
      /* @__PURE__ */ jsx("summary", { children: "\u5BB9\u79FB\u63DB\u7B97\u8207\u8CC7\u683C\u6AA2\u6838\u660E\u7D30" }),
      /* @__PURE__ */ jsx("div", { className: "burden-table basement-audit-table", dangerouslySetInnerHTML: {
        __html: publicText(renderTdrApplication(t, r)).replaceAll("\u53D6\u5F97\u65B9\u5F0F\u5C1A\u672A\u9078\u5B9A\u3002", "\u53D6\u5F97\u65B9\u5F0F\u5C1A\u672A\u9078\u5B9A\u3002").replaceAll("unselected", "\u672A\u9078\u5B9A").replaceAll("assumed", "\u898F\u5283\u5047\u8A2D").replaceAll("\u6210\u672C\u4E0D\u81EA\u52D5\u5012\u586B\u81F3\u5176\u4ED6\u6A21\u7D44\uFF0C\u907F\u514D\u91CD\u8907\u5217\u5E33\u3002", "")
      } })
    ] }),
    /* @__PURE__ */ jsxs("p", { children: [
      /* @__PURE__ */ jsx("a", { href: tdrLaws[t.city === "taipei" ? "taipei" : "ntpc"], children: "\u5730\u65B9\u898F\u5247" }),
      " \uFF0F ",
      /* @__PURE__ */ jsx("a", { href: tdrLaws[t.city === "taipei" ? "taipeiProcedure" : "ntpcProcedure"], children: "\u7533\u8ACB\u7A0B\u5E8F" })
    ] })
  ] });
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/permittedAward.ts
function isPermittedAward(x) {
  if (!x || typeof x !== "object") return false;
  const a = x;
  return ["renewal", "danger"].includes(a.route) && ["baseSqm", "awardSqm", "approvedAt", "source"].every((k) => typeof a[k] === "string");
}
function reviewPermittedAward(a, route, base) {
  const errors = [];
  if (!a || !isPermittedAward(a)) return { errors: ["\u65E2\u6709\u6838\u51C6\u734E\u52F5\u8CC7\u6599\u4E0D\u5B8C\u6574"], percent: 0 };
  if (a.route !== route) errors.push("\u65E2\u6709\u6838\u51C6\u734E\u52F5\u8207\u6240\u9078\u91CD\u5EFA\u8DEF\u5F91\u4E0D\u4E00\u81F4");
  if (!a.source.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(a.approvedAt) || !Number.isFinite(Date.parse(a.approvedAt))) errors.push("\u65E2\u6709\u6838\u51C6\u734E\u52F5\u9808\u586B\u6838\u51C6\u65E5\u671F\u53CA\u6587\u4EF6\u4F86\u6E90");
  if (Number.isFinite(Date.parse(a.approvedAt)) && new Date(a.approvedAt).toISOString().slice(0, 10) !== a.approvedAt) errors.push("\u734E\u52F5\u6838\u51C6\u65E5\u671F\u4E0D\u5B58\u5728");
  const approvedBase = Number(a.baseSqm), amount = Number(a.awardSqm);
  if (!a.baseSqm.trim() || !a.awardSqm.trim() || !Number.isFinite(approvedBase) || approvedBase <= 0 || !Number.isFinite(amount) || amount < 0) errors.push("\u6838\u51C6\u57FA\u6E96\u5BB9\u7A4D\u8207\u734E\u52F5\u9762\u7A4D\u9808\u70BA\u6709\u6548\u6578\u503C");
  if (Math.abs(approvedBase - base) > 0.01) errors.push("\u57FA\u5730\u6216\u57FA\u6E96\u5BB9\u7A4D\u5DF2\u8B8A\u66F4\uFF0C\u8207\u65E2\u6709\u734E\u52F5\u6838\u51C6\u57FA\u6E96\u4E0D\u4E00\u81F4\uFF0C\u9808\u91CD\u65B0\u6838\u5C0D\u6587\u4EF6");
  return { errors, percent: errors.length ? 0 : amount / base * 100 };
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/bonusAssessment.ts
var BONUS_VERSION = "bonus-assessment.2026-10-19.v1";
var newBonusAssessment = (danger2 = false, date = (/* @__PURE__ */ new Date()).toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" })) => ({ version: BONUS_VERSION, route: danger2 ? "danger" : "renewal", renewalMode: "quick", tdrMode: "quick", dangerMode: "quick", date, entries: {}, renewalQualification: "unknown", tdrQualification: "unknown", dangerQualification: "unknown", source: "", deduction: "0", tdrProfile: "general", dangerOriginal: "", dangerEligibleSite: "", dangerAdjacentSite: "" });
var central = "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070027";
var local = "https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150143";
var tdr = "https://web.law.ntpc.gov.tw/Download.ashx?pfid=0000327775";
var danger = "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070258";
var opts = (pairs) => pairs.map(([s, n], j) => [String(j + 1), s, n]);
var yes = (n) => [["yes", "\u4EE5\u6B64\u689D\u4EF6\u70BA\u76EE\u6A19", n]];
var grade = opts([["\u947D\u77F310%", 10], ["\u9EC3\u91D18%", 8], ["\u92806%", 6], ["\u92854%", 4], ["\u5408\u683C2%", 2]]);
var seismic = opts([["\u8010\u9707\u6A19\u7AE010%", 10], ["\u6027\u80FD\u7B2C\u4E00\u7D1A6%", 6], ["\u6027\u80FD\u7B2C\u4E8C\u7D1A4%", 4], ["\u6027\u80FD\u7B2C\u4E09\u7D1A2%", 2]]);
var access = opts([["\u7121\u969C\u7919\u4F4F\u5B85\u6A19\u7AE05%", 5], ["\u6027\u80FD\u7B2C\u4E00\u7D1A4%", 4], ["\u6027\u80FD\u7B2C\u4E8C\u7D1A3%", 3]]);
var bonusItems = [
  { id: "u-old", group: "central", label: "\u539F\u5BB9\u7A4D\u9AD8\u65BC\u57FA\u6E96", law: central, options: yes(10), condition: "\u4E2D\u592E\u7B2C5\u689D\uFF1A\u5BB9\u7A4D\u7BA1\u5236\u524D\u5408\u6CD5\u5EFA\u7269\u539F\u5BB9\u7A4D\u8F03\u9AD8\uFF1B\u9078\u672C10%\u734E\u52F5\u8DEF\u5F91\u3002\u4F9D\u539F\u5BB9\u7A4D\u5EFA\u7BC9\u7684\u66FF\u4EE3\u8DEF\u5F91\u61C9\u53E6\u6838\uFF0C\u4E0D\u820710%\u91CD\u8907\u3002" },
  { id: "u-unsafe", group: "central", label: "\u5371\u96AA\u6216\u8010\u9707\u4E0D\u8DB3", law: central, options: opts([["\u4E3B\u7BA1\u6A5F\u95DC\u9650\u671F\u88DC\u5F37\uFF0F\u62C6\u966410%", 10], ["\u7D50\u69CB\u5B89\u5168\u8A55\u4F30\u672A\u9054\u6700\u4F4E\u7B49\u7D1A8%", 8]]), condition: "\u4E2D\u592E\u7B2C6\u689D\u5169\u6B3E\u64C7\u4E00\uFF0C\u9650\u539F\u5408\u6CD5\u5EFA\u7269\u9069\u7528\u57FA\u5730\uFF1B\u53EF\u8ABF\u9069\u7528\u57FA\u6E96\u5BB9\u7A4D\u6BD4\u4F8B\u3002" },
  { id: "u-public", group: "central", label: "\u6350\u8D08\u793E\u798F\uFF0F\u516C\u76CA\u8A2D\u65BD", law: local, options: opts([["\u793E\u5B85\u3001\u516C\u5171\u6258\u8001\u3001\u9280\u9AEE\u4FF1\u6A02\u90E8\uFF1A\u4FC2\u65781.8", 1.8], ["\u80B2\u6210\u3001\u5E7C\u5152\u5712\u3001\u6258\u80B2\u3001\u5065\u8EAB\u53CA\u5176\u4ED6\uFF1A\u4FC2\u65781.5", 1.5]]), formula: "area", amount: "\u5408\u683C\u8A2D\u65BD\u8A08\u5BB9\u6A13\u5730\u677F\u33A1", cap: 30, condition: "\u4E2D\u592E\u7B2C7\u689D\u3001\u65B0\u5317\u7B2C8\u689D\u9644\u8868\u4E8C\uFF1A\u516C\u544A\u6307\u5B9A\u3001\u53D7\u8D08\u6A5F\u95DC\u540C\u610F\uFF0C\u7121\u511F\u79FB\u8F49\u623F\u5730\uFF1B\u4EE5\u6709\u6548\u5C08\u6709\u8A2D\u65BD\u8A08\u5BB9\u9762\u7A4D\xD7\u4FC2\u6578\uFF0F\u5168\u6848\u57FA\u6E96\u5BB9\u7A4D\uFF0C\u6700\u9AD830%\uFF1B\u4E0D\u81EA\u52D5\u628A\u6350\u8D08\u623F\u5C4B\u5217\u672C\u6848\u53EF\u552E\u3002" },
  { id: "u-infra", group: "central", label: "\u5354\u52A9\u958B\u95E2\u516C\u5171\u8A2D\u65BD", law: central, options: yes(1), formula: "public", amount: "\u516C\u5171\u8A2D\u65BD\u7528\u5730\u9762\u7A4D\u33A1", cap: 15, condition: "\u4E2D\u592E\u7B2C8\u689D\uFF1A\u958B\u95E2\u4E26\u79FB\u8F49\u516C\u6709\uFF1B\u7B49\u503C\u571F\u5730\u9762\u7A4D\uFF0F\u57FA\u5730\xD7100\uFF0C\u6700\u9AD815%\u3002\u516C\u544A\u73FE\u503C\u53CA\u5BB9\u7A4D\u7387\u4F9D\u689D\u6587\u52A0\u6B0A\uFF1B\u5DF2\u4F5C\u5BB9\u79FB\u9001\u51FA\u5730\u4E0D\u5F97\u91CD\u8907\u3002" },
  { id: "u-heritage", group: "central", label: "\u53E4\u8E5F\u6216\u4FDD\u5B58\u5EFA\u7269", law: central, options: opts([["\u53E4\u8E5F\u7B49\u6574\u9AD4\u4FDD\u5B58\u4FEE\u5FA9\uFF1A1.5\u500D", 1.5], ["\u90FD\u5E02\u8A08\u756B\u4FDD\u5B58\u7DAD\u8B77\uFF1A1\u500D", 1]]), formula: "area", amount: "\u6838\u51C6\u4FDD\u5B58\u5EFA\u7269\u5BE6\u969B\u9762\u7A4D\u33A1", condition: "\u4E2D\u592E\u7B2C9\u689D\uFF1A\u4FDD\u5B58\uFF0F\u4FEE\u5FA9\u8A08\u756B\u3001\u5354\u8B70\u53CA\u5B8C\u5DE5\u8981\u6C42\uFF1B\u4E0D\u5F97\u8207\u5BB9\u79FB\u91CD\u8907\u3002" },
  { id: "u-green", group: "central", label: "\u7DA0\u5EFA\u7BC9", law: central, options: grade, condition: "\u4E2D\u592E\u7B2C10\u300118\u689D\uFF1A\u5019\u9078\u8B49\u66F8\u3001\u5354\u8B70\u3001\u4FDD\u8B49\u91D1\u53CA\u4F7F\u7167\u5F8C2\u5E74\u53D6\u5F97\u6A19\u7AE0\u3002\u9285\uFF0F\u5408\u683C\u50C5\u7B2C7\u689D\u7B2C1\u9805\u7B2C3\u6B3E\u4E14\u57FA\u5730\u672A\u9054500\u33A1\uFF1B\u9AD8\u65BC\u6CD5\u5B9A\u6700\u4F4E\u7B49\u7D1A\u624D\u6709\u734E\u52F5\u3002" },
  { id: "u-smart", group: "central", label: "\u667A\u6167\u5EFA\u7BC9", law: central, options: grade, condition: "\u4E2D\u592E\u7B2C11\u300118\u689D\uFF1A\u5019\u9078\u8B49\u66F8\u3001\u5354\u8B70\u3001\u4FDD\u8B49\u91D1\u53CA\u4F7F\u7167\u5F8C2\u5E74\u53D6\u5F97\u6A19\u7AE0\uFF1B\u9285\uFF0F\u5408\u683C\u50C5\u6307\u5B9A\u66F4\u65B0\u65B9\u5F0F\u4E14\u57FA\u5730\u672A\u9054500\u33A1\u3002" },
  { id: "u-access", group: "central", label: "\u7121\u969C\u7919\u74B0\u5883", law: central, options: access, condition: "\u4E2D\u592E\u7B2C12\u300118\u689D\u64C7\u4E00\uFF1B\u5354\u8B70\u3001\u4FDD\u8B49\u91D1\u53CA\u4F7F\u7167\u5F8C2\u5E74\u53D6\u5F97\u6A19\u7AE0\uFF0F\u8A55\u4F30\u3002" },
  { id: "u-seismic", group: "central", label: "\u8010\u9707\u8A2D\u8A08", law: central, options: seismic, condition: "\u4E2D\u592E\u7B2C13\u300118\u689D\u64C7\u4E00\uFF1B\u5354\u8B70\u3001\u4FDD\u8B49\u91D1\u53CA\u4F7F\u7167\u5F8C2\u5E74\u53D6\u5F97\u6A19\u7AE0\uFF0F\u8A55\u4F30\u3002" },
  { id: "u-time", group: "central", label: "\u5831\u6838\u6642\u7A0B", law: central, options: opts([["\u5283\u5B9A\u61C9\u5BE6\u65BD\u66F4\u65B0\u5730\u5340", 1], ["\u672A\u5283\u5B9A\u61C9\u5BE6\u65BD\u66F4\u65B0\u5730\u5340", 0]]), formula: "time", condition: "\u4E2D\u592E\u7B2C14\u689D\uFF1A\u4EE5\u5831\u6838\u65E5\u8A08\u7B97\uFF1B2019-05-15\u8D77\u524D5\u5E7410%\uFF0F7%\uFF0C\u5176\u5F8C5\u5E745%\uFF0F3.5%\uFF0C2029-05-15\u8D770\uFF1B\u4F9D\u7BC4\u570D\u516C\u544A\u8A8D\u5B9A\u3002" },
  { id: "u-block", group: "central", label: "\u5B8C\u6574\u8A08\u756B\u8857\u5ED3", law: central, options: yes(5), condition: "\u4E2D\u592E\u7B2C15\u689D\uFF1A\u542B\u81F3\u5C11\u4E00\u5B8C\u6574\u8A08\u756B\u8857\u5ED3\uFF0C\u9808\u4E3B\u7BA1\u6A5F\u95DC\u8A8D\u5B9A\uFF1B\u53EF\u8207\u9762\u7A4D\u898F\u6A21\u9805\u76EE\u5408\u4F75\u3002" },
  { id: "u-size", group: "central", label: "\u66F4\u65B0\u898F\u6A21", law: central, options: yes(1), formula: "size", condition: "\u4E2D\u592E\u7B2C15\u689D\uFF1A3000\u33A1\u8D775%\uFF0C\u6BCF\u589E\u52A0100\u33A1\u52A00.3%\uFF1B10000\u33A1\u8D7730%\uFF1B\u571F\u5730\u672A\u90543000\u33A1\u4E0D\u53D6\u5206\u3002\u91CD\u5EFA\u5340\u6BB5\u9762\u7A4D\u9808\u6838\u5C0D\u3002" },
  { id: "u-agreement", group: "central", label: "\u5168\u9AD4\u5354\u8B70\u5408\u5EFA", law: central, options: yes(5), condition: "\u4E2D\u592E\u7B2C16\u689D\uFF1A\u66F4\u65B0\u524D\u9580\u724C\u226520\u6236\uFF1B\u5831\u6838\u6642\u5168\u9AD4\u571F\u5730\u53CA\u5408\u6CD5\u5EFA\u7269\u6240\u6709\u6B0A\u4EBA\u540C\u610F\u5354\u8B70\u5408\u5EFA\u300280\u5EFA\u865F\u4E0D\u7B49\u65BC\u5DF2\u78BA\u8A8D\u9580\u724C\u53CA\u540C\u610F\u3002" },
  { id: "u-illegal", group: "central", label: "\u8655\u7406\u5360\u6709\u4ED6\u4EBA\u571F\u5730\u820A\u9055\u7AE0\u6236", law: central, options: yes(1), formula: "area", amount: "\u9010\u6236\u4E0A\u9650\u6AA2\u6838\u5F8C\u53EF\u734E\u52F5\u9762\u7A4D\u33A1", cap: 20, condition: "\u4E2D\u592E\u7B2C17\u689D\u3001\u65B0\u5317\u7B2C9\u689D\uFF1A1992-01-10\u524D\u5EFA\u9020\u4E26\u7DE8\u9580\u724C\uFF1B\u6AA2\u9644\u5360\u7528\u3001\u5B58\u7E8C\u53CA\u5354\u8B70\uFF1B\u9010\u6236\u4E0D\u5F97\u8D85\u904E\u666E\u67E5\u5E73\u5747\u6BCF\u6236\u6A13\u5730\u677F\u9762\u7A4D\uFF0C\u5168\u6848\u6700\u9AD820%\u3002" },
  { id: "l-setback", group: "local", label: "\u65B0\u5317\u9000\u7E2E\u8207\u8A2D\u8A08\u65B9\u6848\uFF08\u64C7\u4E00\uFF09", law: local, options: opts([["\u9644\u8868\u4E001\uFF1A\u9000\u7E2E\u53CA\u5883\u754C\u6DE8\u7A7A2m\uFF0C8%", 8], ["\u9644\u8868\u4E002\uFF1A\u5EFA\u7BC9\u7DDA4m\u3001\u5883\u754C2m\uFF0C10%", 10], ["\u9644\u8868\u4E003\uFF1A\u524D\u9805\uFF0B\u975E\u5DE5\u696D\uFF0F\u7522\u5C08\u3001\u5EFA\u853D\u5DEE\u22655\uFF0C12%", 12], ["\u9644\u8868\u4E004\uFF1A\u5EFA\u7BC9\u7DDA4m\u3001\u5883\u754C3m\u3001\u5EFA\u853D\u5DEE\u226510\uFF0C15%", 15], ["\u9644\u8868\u4E005\uFF1A\u7B56\u7565\u5730\u5340\u3001\u5EFA\u7BC9\u7DDA6m\u3001\u5883\u754C3m\u3001\u5EFA\u853D\u5DEE\u226515\uFF0C20%", 20], ["\u9644\u8868\u4E006\uFF1A\u7B56\u7565\u5730\u5340\u3001\u5EFA\u7BC9\u7DDA8m\u3001\u5883\u754C4m\u3001\u5EFA\u853D\u5DEE\u226520\uFF0C30%", 30]]), condition: "\u65B0\u5317\u7B2C2\u689D\u53CA\u9644\u8868\u4E00\u64C7\u4E00\uFF1B\u9053\u8DEF\u4E0D\u8DB38m\u4F9D\u6CD5\u81EA\u884C\u9000\u7E2E\u5F8C\u518D\u91CF\u6240\u9700\u6DE8\u5BEC\uFF0C\u9000\u7E2E\u7BC4\u570D\u6DE8\u7A7A\u3002\u4E00\u822C\u5730\u65B9\u5408\u8A08\u4ECD\u53D7\u689D\u4F8B\u7B2C65\u689D20%\u4E0A\u9650\uFF1B\u7279\u6B8A\u7B56\u7565\u8DEF\u5F91\u9808\u53E6\u683840%\u4E0A\u9650\uFF0C\u975E\u53EA\u9078\u65B9\u6848\u5373\u9069\u7528\u3002" },
  { id: "l-donation", group: "local", label: "\u6350\u8D08\u90FD\u66F4\u57FA\u91D1", law: local, options: yes(1), formula: "donation", amount: "\u6350\u8D08\u90FD\u66F4\u57FA\u91D1\u91D1\u984D\u5143", condition: "\u65B0\u5317\u7B2C3\u689D\uFF1A\u734E\u52F5\u7387\uFF1D\u6350\u6B3E\uFF0F\uFF08\u516C\u544A\u73FE\u503C\u7E3D\u984D\xD71.4\uFF09\xD7100\uFF1B\u5404\u7B46\u516C\u544A\u73FE\u503C\u4F9D\u9762\u7A4D\u52A0\u6B0A\uFF0C\u4E0D\u662F\u53EA\u586B\u6BCF\u33A1\u55AE\u50F9\u3002" },
  { id: "l-plaza", group: "local", label: "\u7121\u9802\u84CB\u8857\u89D2\u5EE3\u5834", law: local, options: yes(1), formula: "area", amount: "\u5408\u683C\u5EE3\u5834\u9762\u7A4D\u33A1", condition: "\u65B0\u5317\u7B2C4\u689D\uFF1A\u81E8\u5169\u5074\u8A08\u756B\u9053\u8DEF\u6216\u6307\u5B9A\u5EFA\u7BC9\u7DDA\u5DF7\u9053\uFF0C\u9762\u7A4D\u226536\u33A1\u3001\u5404\u908A\u22656m\uFF1B\u7B49\u984D\u734E\u52F5\u3002" },
  { id: "l-path", group: "local", label: "\u66F4\u65B0\u8A08\u756B\u516C\u5171\u901A\u9053", law: local, options: yes(1), formula: "area", amount: "\u5408\u683C\u901A\u9053\u9762\u7A4D\u33A1", condition: "\u65B0\u5317\u7B2C5\u689D\uFF1A\u4F9D\u516C\u544A\u66F4\u65B0\u8A08\u756B\u7559\u22654m\u7B49\u5BEC\u901A\u9053\uFF0C\u6C38\u4E45\u4F9B\u4E0D\u7279\u5B9A\u516C\u773E\u901A\u884C\u3001\u6DE8\u7A7A\uFF1B\u4F9D\u5BE6\u7559\u9762\u7A4D\u7B49\u984D\u734E\u52F5\u3002" },
  { id: "l-old", group: "local", label: "30\u5E74\u4EE5\u4E0A\u5408\u6CD5\u5EFA\u7269\u6A13\u5C64", law: local, options: opts([["\u56DB\u5C642%", 2], ["\u4E94\u5C64\u4EE5\u4E0A4%", 4]]), condition: "\u65B0\u5317\u7B2C6\u689D\uFF1A\u9650\u7B26\u5408\u5C4B\u9F61\u53CA\u6A13\u5C64\u7684\u5408\u6CD5\u5EFA\u7269\u5750\u843D\u57FA\u5730\u57FA\u6E96\u5BB9\u7A4D\uFF0C\u6DF7\u5408\u57FA\u5730\u61C9\u8ABF\u6574\u9069\u7528\u6BD4\u4F8B\u3002" },
  { id: "l-road", group: "local", label: "\u7A84\u8DEF\u4F9D\u6CD5\u964D\u4F4E\u57FA\u6E96\u5BB9\u7A4D", law: local, options: yes(10), condition: "\u65B0\u5317\u7B2C7\u689D\uFF1A\u81E8\u9053\u8DEF\u4E0D\u8DB38m\u4E14\u571F\u7BA1\u78BA\u6709\u964D\u4F4E\u57FA\u6E96\u5BB9\u7A4D\u7387\uFF0C\u4E0D\u80FD\u50C5\u6191\u8DEF\u5BEC\u9078\u53D610%\u3002" },
  { id: "t-base", group: "internal", label: "\u9023\u63A5\u9053\u8DEF\u57FA\u6E96\u91CF", law: tdr, options: yes(1), formula: "tdrBase", amount: "\u7B26\u5408\u8981\u9EDE\u7B2C4\u9EDE\u7684\u9053\u8DEF\u5BEC\u5EA6m", condition: "8\u2264\u8DEF\u5BEC<20m\u53D6\u9053\u8DEF\u5BEC\u5EA6\u6578\u503C\uFF0C\u57FA\u672C\u5206\u4EE5\u6574\u6578\u8655\u7406\uFF1B\u226520m\u53D620%\u3002\u540C\u4E00\u8DEF\u6BB5\u57FA\u5730\u9762\u5BEC\u22658m\u3001\u8DB3\u5BEC\u958B\u95E2\u4E26\u9023\u901A8m\u9053\u8DEF\uFF1B\u4E0D\u662F\u5730\u7C4D\u5716\u4E0A\u540D\u76EE\u8DEF\u5BEC\u5373\u5408\u683C\u3002" },
  { id: "t-size", group: "internal", label: "\u57FA\u5730\u5927\u5C0F\u8207\u6700\u5C0F\u908A\u9577", law: tdr, options: opts([["\u6700\u5C0F\u908A\u9577\u22648m", 0], ["\u6700\u5C0F\u908A\u9577\u22658\u4E14<20m", 1], ["\u6700\u5C0F\u908A\u9577\u226520m", 2]]), formula: "tdrMatrix", condition: "\u9762\u7A4D\u5206500\uFF0F1500\uFF0F2000\uFF0F4000\uFF0F6000\uFF0F10000\u33A1\u516D\u7D1A\uFF0C\u4F9D\u9644\u8868\u5927\u5C0F\xD7\u5B8C\u6574\u6027\u77E9\u9663\u53D60\u20136\u5206\uFF1B8m\u4EA4\u754C\u4F9D\u9644\u8868\u6587\u5B57\u8986\u6838\uFF0C\u521D\u4F308m\u63A1\u7B2C\u4E8C\u7D1A\u3002" },
  { id: "t-angle", group: "internal", label: "\u5168\u90E8\u57FA\u5730\u5167\u89D2", law: tdr, options: yes(1), condition: "\u5404\u5167\u89D2\u5747\u4ECB\u65BC60\u2013120\u5EA6\u52A01\u5206\uFF1B\u4E0D\u898F\u5247\u7F3A\u89D2\u4E0D\u5F97\u53EA\u4EE5\u77E9\u5F62\u5916\u6846\u8A8D\u5B9A\u3002" },
  { id: "t-roads", group: "internal", label: "\u81E8\u63A5\u5169\u689D\u4EE5\u4E0A\u9053\u8DEF", law: tdr, options: opts([["\u8DEF\u5BEC8\u81F3\u672A\u905415m\uFF1A1\u5206", 1], ["\u8DEF\u5BEC\u226515m\uFF1A2\u5206", 2]]), condition: "\u57FA\u5730\u22651500\u33A1\uFF1B\u81E8\u5169\u689D\u4EE5\u4E0A\u9053\u8DEF\u4E14\u9023\u63A5\u9053\u8DEF\u57FA\u5730\u9762\u5BEC\u226515m\u3002" },
  { id: "t-setback", group: "internal", label: "\u975E\u81E8\u8DEF\u5883\u754C\u9000\u7E2E", law: tdr, options: opts([["\u6DE8\u7A7A3\u81F3\u672A\u90545m\uFF1A2\u5206", 2], ["\u6DE8\u7A7A\u22655m\uFF1A3\u5206", 3]]), condition: "\u975E\u6CD5\u5B9A\u9000\u7E2E\u3001\u975E\u5176\u4ED6\u734E\u52F5\u9000\u7E2E\uFF1B\u4E0D\u5F97\u6709\u69CB\u9020\u7269\uFF0C\u4E0D\u80FD\u8207\u5730\u65B9\u90FD\u66F4\u9000\u7E2E\u91CD\u8907\u53D6\u5206\u3002" },
  { id: "t-park", group: "internal", label: "500m\u5167\u5DF2\u958B\u95E2\u516C\u5171\u8A2D\u65BD", law: tdr, options: opts([["\u5408\u8A08\u22650.5ha\u4E14\u55AE\u4E00\u22650.5ha\uFF1A3\u5206", 3], ["\u5408\u8A08\u22650.5ha\uFF1A2\u5206", 2], ["\u5408\u8A080.2\u81F3\u672A\u90540.5ha\uFF1A1\u5206", 1]]), condition: "\u50C5\u516C\u5712\u3001\u5152\u7AE5\u904A\u6A02\u5834\u3001\u7DA0\u5730\u3001\u9AD4\u80B2\u5834\u3001\u5EE3\u5834\uFF1B\u672A\u958B\u95E2\u4E0D\u7B97\u3002" },
  { id: "t-tod", group: "internal", label: "TOD\u8ECA\u7AD9\u8DDD\u96E2", law: tdr, options: opts([["\u672A\u9054300m\uFF1A2\u5206", 2], ["300\u81F3\u672A\u9054500m\uFF1A1\u5206", 1]]), condition: "\u4F9D\u9644\u8868\u6307\u5B9A\u8ECA\u7AD9\u7528\u5730\u754C\u6216\u5730\u9762\u5165\u53E3\u7D50\u69CB\u9AD4\u91CF\u6E2C\uFF1B\u4E09\u7B49\uFF0F\u7C21\u6613\u706B\u8ECA\u7AD9\u50C5300m\u5167\u53EF\u53D6\u5206\uFF1B\u4E0D\u542B\u975E\u539F\u898F\u5283\u5165\u53E3\u3001\u7DCA\u6025\u51FA\u53E3\u53CA\u901A\u98A8\u8A2D\u65BD\u3002" },
  { id: "t-sender", group: "internal", label: "\u9001\u51FA\u57FA\u5730\u9130\u63A5\u6BD4\u4F8B", law: tdr, options: opts([["100%\uFF1A3\u5206", 3], ["80\u81F3\u672A\u9054100%\uFF1A2\u5206", 2], ["60\u81F3\u672A\u905480%\uFF1A1\u5206", 1]]), condition: "\u9001\u51FA\u5730\u4EFB\u4E00\u908A\u9808\u9130\u63A5\u53D7\u5730\uFF1B\u90E8\u5206\u6298\u4EE3\u91D1\u6642\u672C\u7D30\u76EE\u4E0D\u9069\u7528\u3002" },
  { id: "t-open", group: "internal", label: "\u9001\u51FA\u5730\u4E94\u9805\u516C\u5171\u8A2D\u65BD\u6BD4\u4F8B", law: tdr, options: opts([["100%\uFF1A3\u5206", 3], ["80\u81F3\u672A\u9054100%\uFF1A2\u5206", 2], ["60\u81F3\u672A\u905480%\uFF1A1\u5206", 1]]), condition: "\u516C\u3001\u5152\u3001\u7DA0\u3001\u9AD4\u3001\u5EE3\u5360\u9001\u51FA\u7E3D\u9762\u7A4D\uFF1B\u90E8\u5206\u6298\u4EE3\u91D1\u6642\u672C\u7D30\u76EE\u4E0D\u9069\u7528\u3002" },
  { id: "t-priority", group: "internal", label: "\u512A\u5148\u53D6\u5F97\u516C\u5171\u8A2D\u65BD\u6BD4\u4F8B", law: tdr, options: opts([["\u226580%\uFF1A3\u5206", 3], ["60\u81F3\u672A\u905480%\uFF1A2\u5206", 2], ["40\u81F3\u672A\u905460%\uFF1A1\u5206", 1]]), condition: "\u4E3B\u7BA1\u6A5F\u95DC\u5DF2\u516C\u544A\u512A\u5148\u53D6\u5F97\uFF0C\u5F97\u52A0\u9001\u51FA\u5730\u4E94\u9805\u516C\u5171\u8A2D\u65BD\u6BD4\u4F8B\u7A4D\u5206\uFF1B\u90E8\u5206\u6298\u4EE3\u91D1\u6642\u4E0D\u9069\u7528\u3002" },
  { id: "t-acquire", group: "internal", label: "\u516C\u544A\u53D6\u5F97\u65B9\u5F0F", law: tdr, options: opts([["\u516C\u544A\u65B9\u5F0F1\u5206", 1], ["\u516C\u544A\u65B9\u5F0F2\u5206", 2], ["\u516C\u544A\u65B9\u5F0F3\u5206", 3]]), condition: "\u5FC5\u9808\u586B\u516C\u544A\u6240\u5B9A\u53D6\u5F97\u65B9\u5F0F\u53CA\u5206\u6578\u4F86\u6E90\uFF1B\u7121\u516C\u544A\u8CC7\u6599\u50C5\u53EF\u5217\u76EE\u6A19\u5047\u8A2D\uFF0C\u90E8\u5206\u6298\u4EE3\u91D1\u6642\u4E0D\u9069\u7528\u3002" },
  { id: "t-road-owned", group: "internal", label: "\u5168\u6301\u5206\u5DF2\u958B\u95E2\u9053\u8DEF", law: tdr, options: yes(1), condition: "\u9001\u51FA\u5730\u865F\u5168\u6301\u5206\u5DF2\u958B\u95E2\u9053\u8DEF\uFF0C\u4E14\u5360\u9001\u51FA\u7E3D\u9762\u7A4D\u226550%\uFF1B\u90E8\u5206\u6298\u4EE3\u91D1\u6642\u4E0D\u9069\u7528\u3002" },
  { id: "t-cash", group: "internal", label: "\u767E\u5206\u4E4B\u767E\u6298\u7E73\u4EE3\u91D1", law: tdr, options: yes(10), condition: "100%\u6298\u4EE3\u91D1\u6642\u9001\u51FA\u57FA\u5730\u4F4D\u7F6E\u6574\u7D44\u4EE510\u5206\u53D6\u4EE3\uFF1B\u4E0D\u518D\u52A0\u8A08\u5176\u4ED6\u9001\u51FA\u57FA\u5730\u4F4D\u7F6E\u7D30\u76EE\u3002" },
  { id: "t-plaza", group: "internal", label: "\u5EE3\u5834\u5F0F\u958B\u653E\u7A7A\u9593", law: tdr, options: opts([["\u6CD5\u5B9A\u7A7A\u5730\u226540%\uFF1A8\u5206", 8], ["30\u81F3\u672A\u905440%\uFF1A6\u5206", 6], ["20\u81F3\u672A\u905430%\uFF1A4\u5206", 4], ["10\u81F3\u672A\u905420%\uFF1A2\u5206", 2]]), condition: "\u7B26\u5408\u5EFA\u6280283\u689D\u53CA\u65B0\u5317\u90FD\u5BE9\uFF0C\u9806\u5E73\u3001\u8857\u9053\u5BB6\u5177\u3001\u6A19\u793A\u3001\u898F\u7D04\u53CA\u7DAD\u8B77\u57FA\u91D1\uFF1B\u4E0D\u5F97\u91CD\u8907\u958B\u653E\u7A7A\u9593\u734E\u52F5\u3001\u6CD5\u5B9A\u9000\u7E2E\u3002" },
  { id: "t-walk", group: "internal", label: "\u6CBF\u8857\u6B65\u9053\u5F0F\u958B\u653E\u7A7A\u9593", law: tdr, options: opts([["\u55AE\u50741.5\u81F3\u672A\u90544m\uFF1A1\u5206", 1], ["\u5169\u50741.5\u81F3\u672A\u90544m\uFF1A2\u5206", 2], ["\u4E09\u50741.5\u81F3\u672A\u90544m\uFF1A3\u5206", 3], ["\u55AE\u5074\u22654m\uFF1A2\u5206", 2], ["\u5169\u5074\u22654m\uFF1A4\u5206", 4], ["\u4E09\u5074\u22654m\uFF1A6\u5206", 6]]), condition: "\u540C\u958B\u653E\u7A7A\u9593\u516C\u5171\u4F7F\u7528\u3001\u7DAD\u8B77\u53CA\u4E0D\u5F97\u91CD\u8907\u689D\u4EF6\uFF1B\u540C\u4E00\u7BC4\u570D\u4E0D\u91CD\u8907\u7B97\u5EE3\u5834\u8207\u6B65\u9053\u3002" },
  ...[["t-social", "\u6350\u8D08\u793E\u6703\u4F4F\u5B85"], ["t-care", "\u6350\u8D08\u516C\u5171\u6258\u80B2"], ["t-elder", "\u6350\u8D08\u8001\u4EBA\u5B89\u990A"]].map(([id, label]) => ({ id, label, group: "internal", law: tdr, options: yes(2), condition: "\u57FA\u5730\u22653000\u33A1\uFF1B\u7B26\u5408\u65B0\u5317\u7D30\u524748\u689D\u3001\u51FA\u5165\u53E3\u3001\u505C\u8ECA\u3001\u5C64\u9AD8\u3001\u7DAD\u8B77\u57FA\u91D1\u53CA\u76EE\u7684\u4E8B\u696D\uFF0F\u63A5\u7BA1\u6A5F\u95DC\u540C\u610F\u3002" })),
  { id: "t-ex-infra", group: "external", label: "\u5354\u52A9\u958B\u95E2\u516C\u5171\u8A2D\u65BD", law: tdr, options: opts([["\u9130\u63A5\u57FA\u5730\u56DB\u5468\uFF1A4\u5206", 4], ["500m\u5167\u57FA\u5730\u5916\u570D\uFF1A2\u5206", 2]]), condition: "\u6B0A\u7BA1\u540C\u610F\uFF1B\u958B\u95E2\u9762\u7A4D>\u7533\u8ACB\u79FB\u5165\u6A13\u5730\u677F\u9762\u7A4D1/2\u4E14\u2265500\u33A1\u3002" },
  { id: "t-ex-price", group: "external", label: "\u74B0\u5883\u6539\u5584\u50F9\u91D1", law: tdr, options: yes(1), formula: "percent", amount: "\u76EE\u6A19\u7A4D\u5206%", condition: "\u50F9\u91D1\uFF1D\u57FA\u5730\u9762\u7A4D\xD7\u6CD5\u5B9A\u5BB9\u7A4D\u7387\xD71.31\xD720000\u5143\xD7\u7A4D\u5206\u6578\uFF1B\u53D7\u5916\u90E8\u5408\u8A08\u4E0A\u9650\uFF08\u52A0\u8A08\u5F8C\u5167\u90E8\u689D\u4EF61/3\uFF09\u63A7\u5236\u3002" },
  { id: "t-ex-green", group: "external", label: "\u516C\u5171\u81EA\u884C\u8ECA\uFF0F\u5019\u8ECA\u4EAD", law: tdr, options: yes(1), condition: "4\xD740m\u62166\xD720m\u4EE5\u4E0A\u3001\u5EFA\u7F6E\u7DAD\u8B77\u8CBB200\u842C\u5143\uFF1B\u57FA\u6E96\u5916\u589E\u52A0\u5BB9\u7A4D\u22656000\u33A1\u52A0\u500D\u7559\u8A2D\uFF0C\u4EA4\u901A\u5C40\u8A55\u4F30\u540C\u610F\u3002" },
  { id: "d-old", group: "danger", label: "\u539F\u5BB9\u7A4D\u9AD8\u65BC\u57FA\u6E96", law: danger, options: yes(10), condition: "\u5371\u8001\u5BB9\u734E\u7B2C3\u689D\uFF1A\u5BB9\u7A4D\u7BA1\u5236\u524D\u5408\u6CD5\u539F\u5EFA\u7BC9\u57FA\u5730\uFF0C\u907810%\u734E\u52F5\u6216\u4F9D\u539F\u5BB9\u7A4D\u5EFA\u7BC9\uFF1B\u672C\u9805\u53EA\u63A110%\u734E\u52F5\uFF1B\u4F9D\u539F\u5BB9\u7A4D\u76F4\u63A5\u5EFA\u7BC9\u7684\u66FF\u4EE3\u8DEF\u5F91\u5C1A\u672A\u63A5\u5165\uFF0C\u4E0D\u4EE5\u586B\u5165\u539F\u5BB9\u7A4D\u81EA\u52D5\u53D6\u5F97\u8A72\u5DEE\u984D\u3002" },
  { id: "d-unsafe", group: "danger", label: "\u5371\u8001\u8CC7\u683C\u8207\u7D50\u69CB\u689D\u4EF6", law: danger, options: opts([["\u7B2C3\u689D\u7B2C1\u9805\u7B2C1\u6B3E\uFF1A10%", 10], ["\u7B2C3\u689D\u7B2C1\u9805\u7B2C2\u6B3E\uFF1A8%", 8], ["\u7B2C3\u689D\u7B2C1\u9805\u7B2C3\u6B3E\uFF1A6%", 6]]), condition: "\u5371\u8001\u5BB9\u734E\u7B2C4\u689D\u5404\u6B3E\u64C7\u4E00\uFF1A\u9650\u671F\u88DC\u5F37\u62C6\u9664\uFF1B\u8A55\u4F30\u672A\u9054\u6700\u4F4E\uFF1B\u621630\u5E74\u4EE5\u4E0A\u4E14\u8010\u9707\u672A\u9054\u6A19\u6E96\u3001\u6539\u5584\u4E0D\u5177\u6548\u76CA\u6216\u672A\u8A2D\u6607\u964D\u8A2D\u5099\u3002\u9650\u9069\u7528\u539F\u57FA\u5730\u6BD4\u4F8B\u3002" },
  { id: "d-small", group: "danger", label: "\u672A\u9054200\u33A1\u5C0F\u57FA\u5730", law: danger, options: yes(2), condition: "\u5371\u8001\u5BB9\u734E\u7B2C4-1\u689D\uFF1A\u9130\u63A5\u5408\u6CD5\u5EFA\u7269\u5C4B\u9F61\u5747\u672A\u905430\u5E74\uFF1B\u5371\u8001\u689D\u4F8B\u7B2C3\u689D\u7B2C1\u9805\u7B2C1\u6B3E\u4E0D\u9069\u7528\u3002" },
  { id: "d-setback", group: "danger", label: "\u9000\u7E2E\u5EFA\u7BC9", law: danger, options: opts([["\u9053\u8DEF\u9000\u7E2E\u22654m\u4E14\u9130\u754C\u22652m\uFF1A10%", 10], ["\u9053\u8DEF\u9000\u7E2E\u22652m\u4E14\u9130\u754C\u22652m\uFF1A8%", 8]]), condition: "\u5371\u8001\u5BB9\u734E\u7B2C5\u689D\u64C7\u4E00\uFF1B\u6DE8\u7A7A\u3001\u7121\u906E\u7C37\u4EBA\u884C\u6B65\u9053\uFF1B\u7B26\u5408\u5168\u57FA\u5730\u689D\u4EF6\u3002" },
  { id: "d-seismic", group: "danger", label: "\u8010\u9707\u8A2D\u8A08", law: danger, options: seismic, condition: "\u5371\u8001\u5BB9\u734E\u7B2C6\u300111\u689D\u64C7\u4E00\uFF1B\u5354\u8B70\u3001\u4FDD\u8B49\u91D1\u3001\u4F7F\u7167\u5F8C2\u5E74\u6A19\u7AE0\uFF0F\u8A55\u4F30\u3002" },
  { id: "d-green", group: "danger", label: "\u7DA0\u5EFA\u7BC9", law: danger, options: grade, condition: "\u5371\u8001\u5BB9\u734E\u7B2C7\u300111\u300112\u689D\uFF1B\u57FA\u5730\u2265500\u33A1\u4E0D\u5F97\u9285\uFF0F\u5408\u683C\uFF1B\u5148\u4F9D\u7B2C3\u20136\u689D\u5F8C\u672A\u9054\u4E0A\u9650\u624D\u7533\u8ACB\u3002" },
  { id: "d-smart", group: "danger", label: "\u667A\u6167\u5EFA\u7BC9", law: danger, options: grade, condition: "\u5371\u8001\u5BB9\u734E\u7B2C8\u300111\u300112\u689D\uFF1B\u57FA\u5730\u2265500\u33A1\u4E0D\u5F97\u9285\uFF0F\u5408\u683C\uFF1B\u5148\u4F9D\u7B2C3\u20136\u689D\u5F8C\u672A\u9054\u4E0A\u9650\u624D\u7533\u8ACB\u3002" },
  { id: "d-access", group: "danger", label: "\u7121\u969C\u7919\u74B0\u5883", law: danger, options: access, condition: "\u5371\u8001\u5BB9\u734E\u7B2C9\u300111\u300112\u689D\u64C7\u4E00\uFF1B\u5148\u4F9D\u7B2C3\u20136\u689D\u5F8C\u672A\u9054\u4E0A\u9650\u624D\u7533\u8ACB\u3002" },
  { id: "d-infra", group: "danger", label: "\u5354\u52A9\u958B\u95E2\u516C\u5171\u8A2D\u65BD", law: danger, options: yes(1), formula: "public", amount: "\u516C\u5171\u8A2D\u65BD\u7528\u5730\u9762\u7A4D\u33A1", cap: 5, condition: "\u5371\u8001\u5BB9\u734E\u7B2C10\u300112\u689D\uFF1B\u958B\u95E2\u4E14\u79FB\u8F49\u516C\u6709\uFF0C\u6E05\u7406\u6B0A\u5229\uFF0C\u7B49\u503C\u571F\u5730\u9762\u7A4D\uFF0F\u57FA\u5730\xD7100\uFF0C\u6700\u9AD85%\u3002" },
  { id: "d-size", group: "danger", label: "\u898F\u6A21\u734E\u52F5", law: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070249&flno=6", options: yes(1), formula: "dangerSize", condition: "\u5371\u8001\u689D\u4F8B6\u689D\uFF1A\u5408\u683C\u539F\u57FA\u5730\uFF0B\u53EF\u4F75\u9130\u5730\u2265200\u33A1\u7D662%\uFF0C\u6BCF\u5B8C\u6574\u589E\u52A0100\u33A1\u52A00.5%\uFF1B\u8207\u6642\u7A0B\u5408\u8A08\u226410%\u3002\u9130\u5730\u53EF\u8A08\u9762\u7A4D\u2264\u539F\u57FA\u5730\u4E14\u22641000\u33A1\uFF0C\u8D85\u51FA\u90E8\u5206\u4E0D\u7372\u734E\u52F5\u3002" },
  { id: "d-time", group: "danger", label: "\u6642\u7A0B\u734E\u52F5", law: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070249&flno=6", options: yes(1), formula: "dangerTime", condition: "\u5371\u8001\u689D\u4F8B6\u689D\uFF1A\u4F9D\u7533\u8ACB\u65E5\u671F\uFF0C2025-05-12\u8D77\u6642\u7A0B\u70BA0%\uFF1B\u8207\u898F\u6A21\u5408\u8A08\u226410%\u3002\u73FE\u884C\u91CD\u5EFA\u8A08\u756B\u7533\u8ACB\u671F\u96502027-05-31\u3002" }
];
function isBonusAssessment(x) {
  if (!x || typeof x !== "object") return false;
  const a = x;
  return (a.awardBasis === void 0 || ["target", "permitted"].includes(a.awardBasis)) && (a.permittedAward === void 0 || isPermittedAward(a.permittedAward)) && (a.tdrApplication === void 0 || isTdrApplication(a.tdrApplication)) && (a.tdrApplications === void 0 || a.tdrApplications && typeof a.tdrApplications === "object" && !Array.isArray(a.tdrApplications) && Object.entries(a.tdrApplications).every(([k, v]) => ["ntpc", "taipei", "other"].includes(k) && isTdrApplication(v) && v.city === k)) && (a.distinctSpaces === void 0 || typeof a.distinctSpaces === "boolean") && a.version === BONUS_VERSION && ["renewal", "danger", "none"].includes(a.route) && ["renewalMode", "tdrMode", "dangerMode"].every((k) => ["quick", "detail"].includes(a[k])) && ["date", "source", "deduction", "dangerOriginal", "dangerEligibleSite", "dangerAdjacentSite"].every((k) => typeof a[k] === "string") && /^\d{4}-\d{2}-\d{2}$/.test(a.date) && ["general", "forty", "hillside", "narrow", "special50"].includes(a.tdrProfile) && ["renewalQualification", "tdrQualification", "dangerQualification"].every((k) => ["unknown", "yes", "no"].includes(a[k])) && !!a.entries && typeof a.entries === "object" && !Array.isArray(a.entries) && Object.entries(a.entries).every(([id, e]) => bonusItems.some((d) => d.id === id) && e && typeof e.choice === "string" && (e.choice === "" || bonusItems.find((d) => d.id === id).options.some((o) => o[0] === e.choice)) && ["amount", "amount2", "amount3", "share", "source"].every((k) => e[k] === void 0 || typeof e[k] === "string") && (e.status === void 0 || ["assumed", "verified", "excluded"].includes(e.status)));
}
function assessBonuses(a, c, cash, updateArea) {
  const errors = [], notes = [], base = c.site * c.far / 100;
  const city = a.tdrApplication?.city ?? (c.district ? inferTdrCity(c.district) : "ntpc");
  cash = tdrCashPercent(a.tdrApplication, cash);
  if (city !== "ntpc") notes.push("\u76EE\u524D\u975E\u65B0\u5317\uFF1A\u65B0\u5317\u5730\u65B9\u90FD\u66F4\u734E\u52F5\u3001\u5BB9\u79FB\u8A55\u9EDE\u8207\u4EE3\u91D1\u500D\u6578\u4E0D\u5957\u7528\u3002\u81FA\u5317\u5BB9\u79FB\u53E6\u6309\u8CC7\u683C\u3001\u4E0A\u9650\u53CA\u53D6\u5F97\u65B9\u5F0F\u8A55\u4F30\uFF0C\u672A\u5EFA\u81FA\u5317\u5730\u65B9\u90FD\u66F4\u734E\u52F5\u7D30\u9805\u3002");
  const renewalActive = a.route === "renewal" && a.renewalMode === "detail" && a.renewalQualification !== "no", dangerActive = a.route === "danger" && a.dangerMode === "detail" && a.dangerQualification !== "no", tdrActive = a.tdrMode === "detail" && a.tdrQualification !== "no" && !(city === "ntpc" && a.tdrProfile === "special50");
  let validate = dangerActive;
  const selected = (id) => !!a.entries[id]?.choice && a.entries[id]?.status !== "excluded";
  const num = (x, label, fallback = 0) => {
    if (!x?.trim()) return fallback;
    const n = Number(x);
    if (!Number.isFinite(n) || n < 0) {
      if (validate) errors.push(label + "\u9808\u70BA\u975E\u8CA0\u6578");
      return 0;
    }
    return n;
  };
  const eligible = a.dangerEligibleSite.trim() ? Math.min(c.site, num(a.dangerEligibleSite, "\u5408\u683C\u539F\u57FA\u5730")) : c.site, adjacent = num(a.dangerAdjacentSite, "\u5408\u4F75\u9130\u5730"), eligibleTotal = Math.min(c.site, eligible + Math.min(adjacent, eligible, 1e3));
  if (!a.dangerEligibleSite.trim()) notes.push("\u5371\u8001\u539F\u5408\u683C\u57FA\u5730\u672A\u63D0\u4F9B\uFF0C\u898F\u6A21\u521D\u4F30\u66AB\u4EE5\u5168\u57FA\u5730\u8996\u70BA\u5408\u683C\u539F\u57FA\u5730\uFF1B\u5982\u542B\u9130\u5730\u9808\u62C6\u5206\u3002");
  if (adjacent > Math.min(eligible, 1e3)) notes.push("\u5408\u4F75\u9130\u5730\u8D85\u904E\u539F\u5408\u683C\u57FA\u5730\u62161000\u33A1\u90E8\u5206\u4E0D\u5217\u5371\u8001\u734E\u52F5\u3002");
  const rows = bonusItems.map((d) => {
    const e = a.entries[d.id], option = d.options.find((o) => o[0] === e?.choice);
    let value = option?.[2] ?? 0;
    const messages = [];
    if (!option || e?.status === "excluded") return { id: d.id, label: d.label, group: d.group, selected: false, value: 0, messages, condition: d.condition, law: d.law, status: "\u672A\u9078\u53D6" };
    validate = d.group === "danger" ? dangerActive : ["central", "local"].includes(d.group) ? renewalActive : tdrActive;
    if (city !== "ntpc" && ["internal", "external", "local"].includes(d.group)) return { id: d.id, label: d.label, group: d.group, selected: true, value: 0, messages: ["\u975E\u65B0\u5317\u6848\u4EF6\uFF0C\u4E0D\u63A1\u65B0\u5317\u5730\u65B9\u9805\u76EE\u6216\u8A55\u9EDE"], condition: d.condition, law: d.law, status: "\u4E0D\u9069\u7528\u672C\u5730\u5340" };
    const amount = num(d.id === "t-base" && c.roadConditions ? c.roadConditions.plannedWidth : e?.amount, d.label), share = num(e?.share, d.label + "\u9069\u7528\u6BD4\u4F8B", 100);
    if (share > 100 && validate) errors.push(d.label + "\u9069\u7528\u6BD4\u4F8B\u4E0D\u5F97\u8D85\u904E100%");
    if (d.formula === "area") value = base > 0 ? amount * value / base * 100 : 0;
    if (d.formula === "public") {
      const sender = num(e?.amount2, d.label + "\u516C\u5171\u8A2D\u65BD\u516C\u544A\u73FE\u503C"), receiver = num(e?.amount3, d.label + "\u57FA\u5730\u516C\u544A\u73FE\u503C");
      value = c.site > 0 && receiver > 0 ? amount * sender / receiver / c.site * 100 : 0;
      if (!sender || !receiver) messages.push("\u516C\u544A\u73FE\u503C\u672A\u9F4A\uFF0C\u8A72\u9805\u51480\uFF1B\u7531App\u4F9D\u9762\u7A4D\u53CA\u73FE\u503C\u6BD4\u8A08\u7B97");
    }
    if (d.formula === "donation") {
      const total = num(e?.amount2, "\u5168\u57FA\u5730\u516C\u544A\u73FE\u503C\u7E3D\u984D");
      value = total > 0 ? amount / total / 1.4 * 100 : 0;
      if (!total) messages.push("\u5168\u57FA\u5730\u516C\u544A\u73FE\u503C\u7E3D\u984D\u672A\u586B\uFF0C\u8A72\u9805\u51480");
    }
    if (d.formula === "size") value = c.site >= 1e4 ? 30 : c.site >= 3e3 ? 5 + Math.floor((c.site - 3e3) / 100) * 0.3 : 0;
    if (d.formula === "time") {
      const first = a.date >= "2019-05-15" && a.date < "2024-05-15", second = a.date >= "2024-05-15" && a.date < "2029-05-15";
      value = first ? value === 1 ? 10 : 7 : second ? value === 1 ? 5 : 3.5 : 0;
    }
    if (d.formula === "tdrBase") value = amount >= 8 ? Math.min(20, Math.floor(amount)) : 0;
    if (d.formula === "tdrMatrix") {
      const col = c.site >= 1e4 ? 5 : c.site >= 6e3 ? 4 : c.site >= 4e3 ? 3 : c.site >= 2e3 ? 2 : c.site >= 1500 ? 1 : 0;
      value = c.site >= 500 ? [[0, 1, 1, 2, 3, 4], [0, 1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6]][value][col] : 0;
    }
    if (d.formula === "percent") value = amount;
    if (d.formula === "dangerSize") value = eligibleTotal >= 200 ? Math.min(10, 2 + Math.floor((eligibleTotal - 200) / 100) * 0.5) : 0;
    if (d.formula === "dangerTime") {
      value = a.date < "2017-05-12" ? 0 : a.date < "2020-05-12" ? 10 : a.date < "2021-05-12" ? 8 : a.date < "2022-05-12" ? 6 : a.date < "2023-05-12" ? 4 : a.date < "2024-05-12" ? 2 : a.date < "2025-05-12" ? 1 : 0;
    }
    const disallow = (reason) => {
      value = 0;
      messages.push(reason);
    };
    if (["u-green", "u-smart", "d-green", "d-smart"].includes(d.id) && ["4", "5"].includes(e.choice) && c.site >= 500) disallow("\u57FA\u5730\u2265500\u33A1\uFF0C\u9285\uFF0F\u5408\u683C\u4E0D\u9069\u7528");
    if (d.id === "d-small" && (c.site >= 200 || selected("d-unsafe") && a.entries["d-unsafe"]?.choice === "1")) disallow("\u9762\u7A4D\u6216\u5371\u96AA\u8CC7\u683C\u4E0D\u7B26\u5408\u5C0F\u57FA\u5730\u734E\u52F5");
    if (["t-social", "t-care", "t-elder"].includes(d.id) && c.site < 3e3) disallow("\u57FA\u5730\u672A\u90543000\u33A1");
    if (d.id === "t-roads" && c.site < 1500) disallow("\u57FA\u5730\u672A\u90541500\u33A1");
    if (d.id === "l-plaza" && amount < 36) disallow("\u5EE3\u5834\u672A\u905436\u33A1");
    if (d.id === "t-cash" && cash !== 100) disallow("\u975E100%\u6298\u7E73\u4EE3\u91D1");
    if (["t-sender", "t-open", "t-priority", "t-acquire", "t-road-owned"].includes(d.id) && cash > 0) disallow(cash === 100 ? "100%\u4EE3\u91D1\u53D6\u4EE3\u9001\u51FA\u5730\u4F4D\u7F6E\u6574\u7D44" : "\u90E8\u5206\u4EE3\u91D1\u4E0D\u9069\u7528\u9001\u51FA\u5730\u4F4D\u7F6E\u7D30\u76EE");
    if (!a.distinctSpaces && (d.id === "t-setback" && renewalActive && selected("l-setback") || d.id === "t-plaza" && renewalActive && selected("l-plaza") || d.id === "t-walk" && (renewalActive && selected("l-path") || selected("t-plaza")))) disallow("\u5C1A\u672A\u5340\u5206\u4E0D\u540C\u7A7A\u9593\u7BC4\u570D\uFF0C\u907F\u514D\u9000\u7E2E\uFF0F\u958B\u653E\u7A7A\u9593\u91CD\u8907\u53D6\u5206\uFF1B\u52FE\u9078\u7BC4\u570D\u4E0D\u91CD\u758A\u4E26\u8AAA\u660E\u5F8C\u624D\u63A1\u8A08");
    if (city !== "ntpc" && ["internal", "external", "local"].includes(d.group)) disallow("\u975E\u65B0\u5317\u6848\u4EF6\uFF0C\u4E0D\u63A1\u65B0\u5317\u5730\u65B9\u9805\u76EE\u6216\u8A55\u9EDE");
    if (d.id === "u-agreement") messages.push("\u9700\u53E6\u6838\u226520\u9580\u724C\u53CA\u5831\u6838\u6642\u5168\u9AD4\u540C\u610F\uFF0C\u4E0D\u80FD\u4EE5\u5EFA\u865F\u6578\u4EE3\u66FF");
    if (d.id === "u-green" && ["4", "5"].includes(e.choice)) messages.push("\u53E6\u9808\u7B26\u5408\u7B2C7\u689D\u7B2C1\u9805\u7B2C3\u6B3E\u66F4\u65B0\u65B9\u5F0F\uFF0C\u4F9D\u6240\u9078\u76EE\u6A19\u5047\u8A2D");
    if (d.amount && !e?.amount?.trim()) messages.push("\u7F3A\u8A08\u7B97\u91CF\uFF0C\u8A72\u9805\u51480\uFF0C\u5176\u9918\u9078\u9805\u7E7C\u7E8C\u52A0\u7E3D");
    value = Math.min(d.cap ?? Infinity, value) * Math.min(share, 100) / 100;
    if (["d-old", "d-unsafe"].includes(d.id) && eligibleTotal > 0) value *= eligible / eligibleTotal;
    return { id: d.id, label: d.label, group: d.group, selected: true, value, messages, condition: d.condition, law: d.law, status: e?.status === "verified" && e.source?.trim() ? "\u9644\u8986\u6838\u4F86\u6E90\uFF08\u975E\u6838\u5B9A\uFF09" : "\u76EE\u6A19\u5047\u8A2D" };
  });
  const sum2 = (ids) => rows.filter((r) => ids.includes(r.id)).reduce((t, r) => t + r.value, 0), group2 = (name) => rows.filter((r) => r.group === name).reduce((t, r) => t + r.value, 0);
  validate = renewalActive;
  const localRaw = group2("local"), localApplied = Math.min(20, localRaw), deduction = num(a.deduction, "\u91CD\u8907\u734E\u52F5\u6263\u9664");
  const renewalRaw = group2("central") + localApplied, renewal = Math.max(0, Math.min(50, renewalRaw - deduction));
  validate = tdrActive;
  const b = sum2(["t-base"]), internal = group2("internal") - b, factor = city === "ntpc" ? 1 + (updateArea ? 0.3 : 0) + (cash >= 100 ? 0.3 : cash >= 80 ? 0.2 : cash >= 60 ? 0.1 : 0) : 1, externalRaw = group2("external"), external = Math.min(externalRaw, internal * factor / 3), ntpcTdrRaw = (b + internal) * factor + external, tdrRaw = city === "ntpc" ? ntpcTdrRaw : city === "taipei" ? num(a.tdrApplication?.taipeiRequested, "\u81FA\u5317\u7533\u8ACB\u76EE\u6A19", c.tdrTarget ?? 30) : 0;
  const tdrCap = city === "taipei" ? a.tdrApplication?.taipeiCap === "qualified40" ? 40 : 30 : { general: 30, forty: 40, hillside: 20, narrow: 15, special50: 30 }[a.tdrProfile];
  validate = dangerActive;
  const coreFirst = sum2(["d-old", "d-unsafe", "d-small", "d-setback", "d-seismic"]), coreLater = sum2(["d-green", "d-smart", "d-access", "d-infra"]), original = num(a.dangerOriginal, "\u5408\u6CD5\u539F\u5BB9\u7A4D"), coreCap = eligibleTotal === c.site && eligible === c.site ? Math.max(30, base > 0 ? (original * 1.15 / base - 1) * 100 : 30) : 30, core = Math.min(coreCap, coreFirst + coreLater), extra = Math.min(10, sum2(["d-size", "d-time"])), dangerTotal = c.site > 0 ? (core + extra) * eligibleTotal / c.site : 0;
  if (original > 0 && (eligible !== c.site || eligibleTotal !== c.site)) notes.push("\u5371\u8001\u542B\u9130\u5730\u6216\u90E8\u5206\u5408\u683C\u57FA\u5730\uFF1A\u539F\u5BB9\u7A4D115%\u66FF\u4EE3\u8DEF\u5F91\u5C1A\u672A\u9010\u57FA\u5730\u62C6\u7B97\uFF0C\u672C\u6B21\u50C5\u63A1\u4E00\u822C\u57FA\u6E96\u6838\u5FC3\u4E0A\u965030%\uFF0C\u4E0D\u4EE5\u5168\u57FA\u5730\u6BCD\u6578\u91CD\u8907\u6298\u7B97\u6216\u64F4\u5F35\u539F\u5BB9\u7A4D\u3002");
  if (a.route === "danger" && a.date > "2027-05-31") notes.push("\u8D85\u904E\u73FE\u884C\u5371\u8001\u8A08\u756B\u7533\u8ACB\u671F\u96502027-05-31\uFF0C\u5371\u8001\u63A1\u8A080\uFF1B\u9700\u6CD5\u898F\u5EF6\u9577\u624D\u53EF\u518D\u8A55\u4F30\u3002");
  notes.push(`\u90FD\u66F4\u4E2D\u592E${group2("central").toFixed(2)}%\uFF0B\u5730\u65B9${localRaw.toFixed(2)}%\uFF08\u4E00\u822C\u5730\u65B9\u965020%\uFF0C\u63A1${localApplied.toFixed(2)}%\uFF09\uFF0D\u91CD\u8907\u6263\u9664${deduction}%\uFF1B\u7E3D\u734E\u52F5\u4E00\u822C\u965050%\u3002\u7279\u6B8A\u539F\u5BB9\u7A4D\u3001\u6D77\u7802\uFF0F\u8010\u9707\u5371\u96AA\u3001\u7B56\u7565\u6027\u8DEF\u5F91\u53CA\u820A\u6848\u904E\u6E21\u53E6\u9700\u5C08\u6848\u4F9D\u64DA\uFF0C\u672C\u8868\u4E0D\u81EA\u52D5\u653E\u5BEC\u3002`);
  if (city === "ntpc") notes.push(`\u5BB9\u79FB\u57FA\u6E96${b}%\uFF0B\u5167\u90E8${internal}%\uFF0C\u52A0\u8A08\u4FC2\u6578${factor}\uFF1B\u5916\u90E8\u539F${externalRaw}%\uFF0F\u63A1${external}%\uFF0C\u4E0D\u8D85\u52A0\u8A08\u5F8C\u5167\u90E81/3\u3002\u4E0A\u9650\u8DEF\u5F91${tdrCap}%\uFF1B40%\u3001\u5C71\u5761\u3001\u7A84\u8DEF\u53CA\u514D\u8A55\u5B9A\u9808\u53E6\u8B49\u8CC7\u683C\uFF0C\u4E0D\u80FD\u628A\u52FE\u9078\u8996\u70BA\u6838\u51C6\u3002`);
  notes.push(`\u5371\u8001\u7B2C3\u20136\u689D\u5408\u8A08${coreFirst}%\u5148\u9069\u7528\u3001\u7B2C7\u201310\u689D${coreLater}%\u88DC\u81F3\u6838\u5FC3\u4E0A\u9650${coreCap.toFixed(2)}%\uFF1B\u6642\u7A0B\u8207\u898F\u6A21\u53E6\u63A1${extra}%\uFF0C\u5169\u8005\u5408\u8A08\u226410%\u3002\u539F\u5408\u683C\u57FA\u5730${eligible}\u33A1\u3001\u53EF\u52A0\u9130\u5730${eligibleTotal - eligible}\u33A1\uFF0F\u5168\u57FA\u5730${c.site}\u33A1\uFF0C\u6BD4\u4F8B\u63A1\u8A08${c.site > 0 ? eligibleTotal / c.site * 100 : 0}%\u3002\u4E0D\u5F97\u758A\u52A0\u90FD\u66F4\u53CA\u5176\u4ED6\u6CD5\u4EE4\u5BB9\u7A4D\u734E\u52F5\u3002`);
  return { rows, notes, errors, renewalRaw, localRaw, localApplied, renewal, tdrBase: b, tdrInternal: internal, tdrExternalRaw: externalRaw, tdrExternal: external, tdrFactor: factor, tdrRaw, tdrCap, tdr: Math.min(tdrCap, tdrRaw), dangerCoreFirst: coreFirst, dangerCoreLater: coreLater, dangerCoreCap: coreCap, dangerExtra: extra, danger: a.date > "2027-05-31" ? 0 : dangerTotal };
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/regulatoryReview.ts
var REGULATORY_REVIEW_VERSION = "planning-law.2026-10-19.v3";
var defaultRegulatoryReview = () => ({ version: REGULATORY_REVIEW_VERSION, renewalLimitPercent: "50", tdrLimitPercent: "30", totalBonusLimitPercent: "", tdrBasePoints: "", tdrInternalPoints: "", tdrExternalPoints: "", renewalArea: false, cashTdrPercent: "0", bonusSource: "", bicycleExemption: "counted", bicycleSource: "", motorcycleExemption: "statutory_assumption", communityUse: "loading", spareUse: "counted", ordinaryCommonPercent: "0", ordinaryCommonSource: "" });
function isRegulatoryReview(x) {
  if (!x || typeof x !== "object") return false;
  const p = x;
  if (p.bonusAssessment !== void 0 && !isBonusAssessment(p.bonusAssessment)) return false;
  if (["shelterArea", "shelterEquipment", "shelterSource"].some((k) => p[k] !== void 0 && typeof p[k] !== "string")) return false;
  if (p.siteGeometry && (!p.siteGeometry || typeof p.siteGeometry !== "object" || !["length", "width", "source", "front", "back", "left", "right", "aboveWidth", "basementWidth"].every((k) => typeof p.siteGeometry[k] === "string"))) return false;
  if (p.auditHistory !== void 0 && (!Array.isArray(p.auditHistory) || p.auditHistory.length > 10 || !p.auditHistory.every((h) => h && typeof h.label === "string" && ["sale", "allowed", "basement", "equipmentCounted", "bikeCounted", "spareCounted"].every((k) => typeof h[k] === "number" && Number.isFinite(h[k]) && h[k] >= 0) && h.allowed > 0))) return false;
  return [REGULATORY_REVIEW_VERSION, "planning-law.2026-10-19.v2"].includes(p.version) && ["renewalLimitPercent", "tdrLimitPercent", "totalBonusLimitPercent", "tdrBasePoints", "tdrInternalPoints", "tdrExternalPoints", "cashTdrPercent", "bonusSource", "bicycleSource", "ordinaryCommonPercent", "ordinaryCommonSource"].every((k) => typeof p[k] === "string") && typeof p.renewalArea === "boolean" && ["counted", "documented"].includes(p.bicycleExemption) && ["statutory_assumption", "counted"].includes(p.motorcycleExemption) && ["loading", "other"].includes(p.communityUse) && ["counted", "parking"].includes(p.spareUse);
}
function resolveBonusLimits(p, rates, context) {
  const roadReview = reviewSiteRoad(context?.roadConditions);
  const notes = [...roadReview.notes], errors = [...roadReview.errors];
  const a = p.bonusAssessment, waivePoints = a?.tdrProfile === "special50" && (a.tdrApplication?.city ?? (context?.district ? inferTdrCity(context.district) : "ntpc")) === "ntpc", assessment = a && context && isBonusAssessment(a) ? assessBonuses(a.awardBasis === "permitted" ? { ...a, renewalMode: "quick", dangerMode: "quick" } : a, context, Number(p.cashTdrPercent) || 0, p.renewalArea) : void 0;
  if (a && assessment) {
    rates = { ...rates, renewal: a.route === "renewal" ? a.renewalMode === "detail" ? assessment.renewal : rates.renewal : 0, danger: a.route === "danger" ? a.dangerMode === "detail" ? assessment.danger : Math.min(40, rates.danger) : 0, scale: a.route === "danger" ? 0 : rates.scale, tdr: a.tdrMode === "detail" && !waivePoints ? assessment.tdr : rates.tdr };
    if (a.renewalQualification === "no") rates.renewal = 0;
    if (a.tdrQualification === "no") rates.tdr = 0;
    if (a.dangerQualification === "no") rates.danger = 0;
    if (a.awardBasis !== "permitted" && a.route === "danger" && a.date > "2027-05-31") rates.danger = 0;
    notes.push(`\u63A1\u8A08\u65B9\u5F0F\uFF1A${a.route === "danger" ? "\u5371\u8001" : a.route === "renewal" ? "\u90FD\u66F4" : "\u4E0D\u63A1\u90FD\u66F4\uFF0F\u5371\u8001"}\uFF1B\u90FD\u66F4${a.renewalMode === "quick" ? "\u5FEB\u901F\u76EE\u6A19" : "\u7D30\u9805\u52A0\u7E3D"}\u3001\u5BB9\u79FB${a.tdrMode === "quick" ? "\u5FEB\u901F\u76EE\u6A19" : "\u7D30\u9805\u8A55\u5B9A"}\u3001\u5371\u8001${a.dangerMode === "quick" ? "\u5FEB\u901F\u76EE\u6A19" : "\u7D30\u9805\u52A0\u7E3D"}\u3002\u672A\u9078\u7528\u8DEF\u5F91\u8CC7\u6599\u4FDD\u7559\uFF0C\u4E0D\u758A\u52A0\u3002`);
    notes.push("\u52FE\u9078\u689D\u4EF6\u70BA\u898F\u5283\u76EE\u6A19\uFF1B\u8CC7\u683C\u672A\u77E5\u4ECD\u53EF\u521D\u4F30\uFF0C\u5DF2\u77E5\u4E0D\u9069\u7528\u63A10\u3002\u9644\u4F86\u6E90\u4E0D\u7B49\u540C\u4E3B\u7BA1\u6A5F\u95DC\u6838\u5B9A\uFF1B\u63A5\u53D7\u57FA\u5730\u7981\u9650\u3001\u9053\u8DEF\u958B\u95E2\u8207\u9762\u5BEC\u3001\u9001\u51FA\u5730\uFF0F\u4EE3\u91D1\u53CA\u500B\u6848\u571F\u7BA1\u9808\u8986\u6838\u3002");
    if (a.renewalMode === "detail" || a.tdrMode === "detail" || a.dangerMode === "detail") {
      notes.push(...assessment.notes);
      errors.push(...assessment.errors);
    }
  }
  const read = (x, label, fallback, max = 1e3) => {
    if (!x.trim()) return fallback;
    const n = Number(x);
    if (!Number.isFinite(n) || n < 0 || n > max) {
      errors.push(label + "\u9808\u586B\u6709\u6548\u975E\u8CA0\u6578");
      return fallback;
    }
    return n;
  };
  let renewalLimit = read(p.renewalLimitPercent, "\u90FD\u66F4\u734E\u52F5\u4E0A\u9650", 50), tdrLimit = read(p.tdrLimitPercent, "\u5BB9\u79FB\u4E0A\u9650", 30);
  if (renewalLimit > 50 && !p.bonusSource.trim()) {
    renewalLimit = 50;
    notes.push("\u8D85\u904E\u4E00\u822C\u90FD\u66F450%\u4E0A\u9650\u7684\u7279\u5225\u8DEF\u5F91\u5C1A\u7121\u4F9D\u64DA\uFF0C\u5148\u4F9D\u4E00\u822C\u4E0A\u9650\u521D\u4F30\uFF1B\u539F\u76EE\u6A19\u4FDD\u7559\u3002");
  }
  if (tdrLimit > 30 && !p.bonusSource.trim()) {
    tdrLimit = 30;
    notes.push("\u8D85\u904E\u4E00\u822C\u5BB9\u79FB30%\u4E0A\u9650\u7684\u9069\u7528\u4F9D\u64DA\u672A\u586B\uFF0C\u5148\u630930%\u521D\u4F30\u3002");
  }
  if (a && assessment) tdrLimit = a.tdrMode === "detail" || a.tdrApplication ? assessment.tdrCap : Math.min(tdrLimit, assessment.tdrCap);
  let points = null;
  const pointValues = [p.tdrBasePoints, p.tdrInternalPoints, p.tdrExternalPoints];
  if (!a && (!context?.district || inferTdrCity(context.district) === "ntpc") && pointValues.some((x) => x.trim())) {
    const base = read(p.tdrBasePoints, "\u5BB9\u79FB\u57FA\u6E96\u91CF\u8A55\u9EDE", 0), internal = read(p.tdrInternalPoints, "\u5BB9\u79FB\u5167\u90E8\u689D\u4EF6\u8A55\u9EDE", 0), external = read(p.tdrExternalPoints, "\u5BB9\u79FB\u5916\u90E8\u6539\u5584\u8A55\u9EDE", 0);
    const cash = read(p.cashTdrPercent, "\u6298\u7E73\u4EE3\u91D1\u6BD4\u4F8B", 0, 100), cashBonus = cash >= 100 ? 0.3 : cash >= 80 ? 0.2 : cash >= 60 ? 0.1 : 0;
    const factor = 1 + (p.renewalArea ? 0.3 : 0) + cashBonus;
    points = (base + internal) * factor + Math.min(external, internal * factor / 3);
    notes.push(`\u5BB9\u79FB\u8A55\u9EDE\u521D\u6838\uFF1A\u57FA\u6E96${base}%\u3001\u5167\u90E8${internal}%\u3001\u52A0\u8A08\u4FC2\u6578${factor}\u3001\u5916\u90E8\u63A1${Math.min(external, internal * factor / 3).toFixed(4)}%\uFF1B\u5916\u90E8\u4E0A\u9650\u70BA\u52A0\u8A08\u5F8C\u5167\u90E8\u689D\u4EF61/3\u3002\u8A55\u9EDE\u53CA\u66F4\u65B0\u5730\u5340\uFF0F\u4EE3\u91D1\u8CC7\u683C\u9808\u4F9D\u6587\u4EF6\u8986\u6838\u3002`);
  } else if (a?.tdrMode === "detail" && assessment && !waivePoints) {
    points = assessment.tdrRaw;
  } else if (a && rates.tdr > 0) notes.push("\u5BB9\u79FB\u63A1\u5FEB\u901F\u76EE\u6A19\uFF1A\u7D30\u9805\u8A55\u9EDE\u4FDD\u7559\u4F46\u4E0D\u53C3\u8207\u672C\u6B21\u52A0\u7E3D\uFF1B\u63A5\u53D7\u57FA\u5730\u53CA\u4E0A\u9650\u8DEF\u5F91\u8CC7\u683C\u4ECD\u5C6C\u898F\u5283\u5047\u8A2D\u3002");
  else if (rates.tdr > 0) notes.push(`\u5BB9\u79FB\u8A55\u9EDE\u5C1A\u672A\u586B\u9F4A\uFF1A\u5148\u4EE5\u76EE\u6A19\u8207\u4E00\u822C\uFF0F\u6240\u586B\u4E0A\u9650${tdrLimit}%\u8F03\u4F4E\u8005\u521D\u4F30\uFF0C\u672A\u8A8D\u5B9A\u672C\u6848\u5DF2\u53D6\u5F97\u8A72\u984D\u5EA6\u3002`);
  let renewal = Math.min(rates.renewal, renewalLimit), tdr2 = Math.min(rates.tdr, tdrLimit, points ?? Infinity), scale = rates.scale, danger2 = rates.danger;
  if (renewal < rates.renewal) notes.push(`\u90FD\u66F4\u76EE\u6A19${rates.renewal}%\u8D85\u904E\u672C\u6B21\u8DEF\u5F91\u4E0A\u9650\uFF0C\u66AB\u63A1${renewal}%\uFF0C\u4E0D\u4EE5\u8D85\u984D\u76EE\u6A19\u64F4\u5F35\u5BB9\u7A4D\u3002`);
  if (tdr2 < rates.tdr) notes.push(`\u5BB9\u79FB\u76EE\u6A19${rates.tdr}%\u53D7\u4E0A\u9650\uFF0F\u8A55\u9EDE\u9650\u5236\uFF0C\u66AB\u63A1${tdr2.toFixed(4)}%\u3002`);
  const permitted = a?.awardBasis === "permitted" ? reviewPermittedAward(a.permittedAward, a.route, (context?.site ?? 0) * (context?.far ?? 0) / 100) : void 0;
  if (permitted) {
    errors.push(...permitted.errors);
    renewal = a.route === "renewal" ? permitted.percent : 0;
    danger2 = a.route === "danger" ? permitted.percent : 0;
    scale = 0;
    if ((a.route === "danger" ? a.dangerQualification : a.renewalQualification) === "no") errors.push("\u65E2\u6709\u6838\u51C6\u734E\u52F5\u8207\u5DF2\u77E5\u4E0D\u9069\u7528\u8CC7\u683C\u885D\u7A81\uFF0C\u9808\u6838\u5C0D\u6587\u4EF6");
    notes.push(`\u65E2\u6709\u6838\u51C6\u734E\u52F5\u5C0D\u7167\uFF1A\u6838\u51C6\u57FA\u6E96${a.permittedAward?.baseSqm ?? "\u672A\u586B"}\u33A1\u3001\u734E\u52F5${a.permittedAward?.awardSqm ?? "\u672A\u586B"}\u33A1\uFF1B\u6838\u51C6\u65E5\u671F${a.permittedAward?.approvedAt ?? "\u672A\u586B"}\uFF0C\u4F86\u6E90${a.permittedAward?.source ?? "\u672A\u586B"}\u3002\u4E0D\u4F9D\u65B0\u7533\u8ACB\u6642\u7A0B\u91CD\u7B97\u6216\u81EA\u52D5\u53D6\u5F97\u65B0\u734E\u52F5\uFF1B\u57FA\u5730\u57FA\u6E96\u8B8A\u66F4\u6642\u963B\u64CB\u3002`);
  }
  let totalLimit = p.totalBonusLimitPercent.trim() ? read(p.totalBonusLimitPercent, "\u500B\u6848\u734E\u52F5\u53CA\u5BB9\u79FB\u5408\u8A08\u4E0A\u9650", 0) : null;
  if (waivePoints) {
    totalLimit = Math.min(totalLimit ?? 50, 50);
    notes.push("\u6240\u9078\u65B0\u5317\u7279\u6B8A\u6838\u51C6\u91CD\u5EFA\u514D\u91CF\u9AD4\u8A55\u5B9A\u8DEF\u5F91\uFF1A\u4FDD\u7559\u7D30\u9805\u4F46\u672C\u6B21\u4E0D\u4EE5\u8A55\u9EDE\u9650\u5236\u76EE\u6A19\uFF1B\u4ECD\u53D7\u63A5\u53D7\u57FA\u5730\u8CC7\u683C\u3001\u500B\u5225\u79FB\u5165\u4E0A\u9650\u53CA\u734E\u52F5\u52A0\u5BB9\u79FB\u5408\u8A0850%\u9650\u5236\u3002");
  }
  if (permitted && totalLimit !== null && renewal + tdr2 + scale + danger2 > totalLimit) {
    errors.push("\u65E2\u6709\u6838\u51C6\u984D\u5EA6\u8207\u672C\u6B21\u5408\u8A08\u4E0A\u9650\u885D\u7A81\uFF0C\u9808\u6838\u5C0D\uFF0C\u4E0D\u81EA\u52D5\u7E2E\u6E1B\u6838\u51C6\u734E\u52F5");
  } else if (totalLimit !== null && renewal + tdr2 + scale + danger2 > totalLimit) {
    tdr2 = Math.min(tdr2, Math.max(0, totalLimit - renewal - scale - danger2));
    if (renewal + scale + danger2 > totalLimit) {
      const f7 = totalLimit / (renewal + scale + danger2);
      renewal *= f7;
      scale *= f7;
      danger2 *= f7;
    }
    notes.push(`\u4F9D\u660E\u793A\u500B\u6848\u5408\u8A08\u4E0A\u9650${totalLimit}%\u9650\u5236\u734E\u52F5\u53CA\u5BB9\u79FB\uFF1B\u4F86\u6E90${p.bonusSource.trim() || "\u672A\u586B\uFF0C\u5C6C\u4FDD\u5B88\u898F\u5283\u5047\u8A2D"}\u3002`);
  }
  if (!a && context?.district && inferTdrCity(context.district) !== "ntpc" && pointValues.some((x) => x.trim())) notes.push("\u820A\u7248\u65B0\u5317\u5BB9\u79FB\u8A55\u9EDE\u5728\u672C\u884C\u653F\u5340\u4E0D\u9069\u7528\uFF1B\u4FDD\u7559\u539F\u8CC7\u6599\uFF0C\u672C\u6B21\u53EA\u63A1\u76EE\u6A19\u53CA\u9069\u7528\u4E0A\u9650\uFF0C\u672A\u78BA\u8A8D\u8CC7\u683C\u3002");
  const app = a?.tdrApplication ?? ((a || context?.roadConditions) && context?.district ? newTdrApplication(inferTdrCity(context.district)) : void 0);
  const application = app && context ? reviewTdrApplication(app, context, tdr2, tdrLimit, scale) : void 0;
  if (application) {
    if (context?.roadConditions?.status === "confirmed" && rates.tdr > application.capPercent + 1e-8) errors.push(`\u5DF2\u78BA\u8A8D\u57FA\u5730\u9053\u8DEF\u689D\u4EF6\u4E0B\u5BB9\u79FB\u76EE\u6A19${rates.tdr}%\u8D85\u904E\u672C\u8DEF\u5F91${application.capPercent}%\u4E0A\u9650\uFF0C\u9808\u4FEE\u6B63\u5F8C\u624D\u80FD\u63A1\u7528\u3002`);
    tdr2 = application.appliedPercent;
    notes.push(...application.notes, ...application.gaps);
    if (rates.tdr > 0) errors.push(...application.errors);
  }
  notes.push("\u90FD\u66F4\u53CA\u5BB9\u79FB\u5747\u70BA\u898F\u5283\u76EE\u6A19\uFF0F\u8A55\u9EDE\u8F38\u5165\uFF1B\u53EF\u7B97\u4E0D\u7B49\u65BC\u6838\u5B9A\u3002\u90FD\u66F450%\u4F9D\u4E00\u822C\u8DEF\u5F91\u4F5C\u4E0A\u9650\uFF0C\u4E0D\u5C07\u7279\u6B8A\u500B\u6848\u5408\u8A0850%\u4E00\u5F8B\u5957\u7528\u6240\u6709\u6848\u4EF6\u3002");
  return { renewal, tdr: tdr2, scale, danger: danger2, renewalLimit, tdrLimit, points, totalLimit, notes, errors, assessment, application };
}
function reviewBasementVolume(p, v, aboveEquipmentExempt, equipmentCap, context) {
  const notes = [];
  const served = v.carArea + v.motoArea + v.bikeArea + v.communityArea;
  const shared = v.rampTotal + v.lossArea;
  const share = (area2) => served > 0 ? shared * area2 / served : 0;
  const carPool = v.carArea + share(v.carArea), motoPool = v.motoArea + share(v.motoArea), bikePool = v.bikeArea + share(v.bikeArea), communityPool = v.communityArea + share(v.communityArea);
  const parkingSpare = p.spareUse === "parking" ? v.spareArea : 0;
  const mechanicalPool = v.carArea > 0 ? carPool * Math.min(1, (v.mechanicalArea ?? 0) / v.carArea) : 0;
  const parkingCap = (v.undergroundFlatCars ?? v.cars) * 40, carSubject = carPool + parkingSpare, flatSubject = carSubject - mechanicalPool, carExempt = Math.min(flatSubject, parkingCap) + mechanicalPool;
  const shelterRequested = Math.max(0, Number(p.shelterArea) || 0), shelterArea = Math.min(shelterRequested, context?.footprint ?? 0, context?.plate ?? 0);
  const shelterEquipment = Math.min(Math.max(0, Number(p.shelterEquipment) || 0), shelterArea / 4, context?.equipmentPerFloor ?? 0, v.equipmentArea);
  const mergedEquipment = Math.min(v.equipmentArea - shelterEquipment, Math.max(0, parkingCap - (carExempt - mechanicalPool)));
  const equipmentRemaining = v.equipmentArea - shelterEquipment - mergedEquipment;
  const globalEquipmentExempt = Math.min(equipmentRemaining, Math.max(0, equipmentCap - aboveEquipmentExempt));
  const equipmentCounted = equipmentRemaining - globalEquipmentExempt;
  const bikeExempt = p.bicycleExemption === "documented" && p.bicycleSource.trim() ? bikePool : 0;
  const motoExempt = p.motorcycleExemption === "statutory_assumption" ? motoPool : 0;
  const communityExempt = p.communityUse === "loading" ? communityPool : 0;
  const shelterOnlyExempt = Math.min(v.spareArea, Math.max(0, context?.shelterOnly ?? 0), Math.max(0, shelterArea - shelterEquipment));
  const spareCounted = p.spareUse === "counted" ? v.spareArea - shelterOnlyExempt : 0;
  const parkingCounted = carSubject - carExempt;
  const bicycleCounted = bikePool - bikeExempt, motorcycleCounted = motoPool - motoExempt, communityCounted = communityPool - communityExempt;
  const counted = parkingCounted + equipmentCounted + bicycleCounted + motorcycleCounted + communityCounted + spareCounted;
  const exempt = shelterOnlyExempt + carExempt + shelterEquipment + mergedEquipment + globalEquipmentExempt + bikeExempt + motoExempt + communityExempt;
  if (shelterRequested > 0) notes.push(`B1\u9632\u7A7A\u907F\u96E3\u914D\u7F6E\u521D\u4F30\uFF1A\u9644\u5EFA\u9762\u7A4D\u63A1${shelterArea.toFixed(2)}\u33A1\uFF08\u4E0D\u8D85\u5EFA\u7BC9\u9762\u7A4D\u53CAB1\u6A13\u677F\uFF09\uFF0C\u56FA\u5B9A\u8A2D\u5099\u914D\u7F6E${shelterEquipment.toFixed(2)}\u33A1\uFF0C\u4E0D\u8D851/4\u53CAB1\u8A2D\u5099\u6C60\uFF1B\u4F9D\u7B2C141\u3001142\u3001162\u689D\u53CA94\uFF0F108\u5E74\u51FD\u4F75\u5165\u514D\u8A08\u3002\u4E0D\u8207\u505C\u8ECA\u514D\u8A08\u91CD\u8907\u52A0\u7E3D\uFF1B\u5176\u9918\u907F\u96E3\u517C\u505C\u8ECA\u9762\u7A4D\u5DF2\u5728\u539F\u505C\u8ECA\u6C60\u5167\u3002${p.shelterSource?.trim() || "\u5C1A\u7121\u5716\u8AAA\uFF0C\u5C6C\u898F\u5283\u4F4D\u7F6E\u53CA\u5408\u683C\u907F\u96E3\u8A2D\u5099\u5047\u8A2D\uFF0C\u9808\u6838\u9069\u7528\u5730\u5340\u3001\u69CB\u9020\u3001\u51FA\u5165\u53E3\u8207\u5BE6\u969B\u914D\u7F6E"}\u3002`);
  notes.push("\u5730\u4E0B\u8A08\u5BB9\u8207\u767B\u8A18\u5206\u6524\u5206\u958B\uFF1A\u5171\u7528\u5761\u9053\u53CA\u8F49\u5F4E\u9810\u7559\u66AB\u6309\u5404\u985E\u505C\u8ECA\u670D\u52D9\u9762\u7A4D\u5206\u914D\uFF0C\u6B64\u70BA\u914D\u7F6E\u5047\u8A2D\uFF0C\u975E\u6CD5\u5B9A\u56FA\u5B9A\u6BD4\u4F8B\u3002");
  notes.push(`\u6C7D\u8ECA\u505C\u8ECA\u514D\u8A08\u6C60\u4F9D\u7B2C60\u689D\u6BCF\u5BE6\u8A2D\u6C7D\u8ECA\u4F4D40\u33A1\u4E0A\u9650\u6838\u7B97\uFF1B\u672C\u6B21\u5730\u4E0B\u975E\u6A5F\u68B0${v.undergroundFlatCars ?? v.cars}\u4F4D\u4E0A\u9650${parkingCap.toFixed(2)}\u33A1\uFF0C\u6A5F\u8ECA\uFF0F\u81EA\u884C\u8ECA\uFF0F\u793E\u5340\u8ECA\u4F4D\u4E0D\u62FF\u4F86\u589E\u52A0\u6C7D\u8ECA40\u33A1\u984D\u5EA6\u3002\u6263\u9664\u660E\u793A\u914D\u7F6E\u65BC\u5408\u683C\u9632\u7A7A\u907F\u96E3\u8A2D\u5099\u5167\u7684\u90E8\u5206\u5F8C\uFF0C\u8A2D\u5099\u68AF\u9593\u5728\u8A72\u505C\u8ECA\u6C60\u5269\u9918\u984D\u5EA6\u5167\u4F9D108\u5E74\u51FD\u4F75\u5165\uFF1B\u5176\u9918\u56DE\u6B78\u6A5F\u96FB\u7E3D\u984D\uFF0C\u8D85\u984D\u8A08\u5BB9\u3002`);
  if (mechanicalPool > 0) notes.push(`\u6A5F\u68B0\u505C\u8ECA\u53CA\u6240\u5206\u914D\u5171\u540C\u52D5\u7DDA${mechanicalPool.toFixed(2)}\u33A1\u6309\u4F9D\u6CD5\u8A2D\u7F6E\u505C\u8ECA\u7A7A\u9593\u4F5C\u514D\u8A08\u5047\u8A2D\uFF1B\u4E0D\u4EE5\u6A5F\u68B0\u8ECA\u4F4D\u6578\u4E5840\u33A1\u64F4\u5927\u984D\u5EA6\uFF0C\u4E5F\u4E0D\u8B93\u6A5F\u68B0\u7A7A\u9593\u7522\u751F\u8A2D\u5099\u68AF\u959340\u33A1\u6C60\u9918\u984D\u3002\u5730\u9762\u8ECA\u4F4D\u672A\u589E\u52A0\u5730\u4E0B\u514D\u8A08\u6C60\u3002`);
  if (bicycleCounted > 0) notes.push("\u81EA\u884C\u8ECA\u514D\u8A08\u8CC7\u683C\u672A\u6709\u9069\u7528\u516C\u6709\uFF0F\u5168\u68DF\u793E\u5B85\u53CA\u500B\u6848\u571F\u7BA1\u4F9D\u64DA\uFF0C\u66AB\u6309\u81EA\u884C\u8ECA\u7A7A\u9593\u8207\u670D\u52D9\u901A\u9053\u8A08\u5BB9\uFF1B\u88DC\u5165\u8986\u6838\u4F9D\u64DA\u5F8C\u53EF\u8ABF\u6574\uFF0C\u4E0D\u963B\u65B7\u521D\u4F30\u3002");
  if (motoExempt > 0) notes.push("\u6A5F\u8ECA\u66AB\u6309\u4F9D\u90FD\u5E02\u8A08\u756B\uFF0F\u5730\u65B9\u898F\u5B9A\u4F9D\u6CD5\u8A2D\u7F6E\u4E4B\u505C\u8ECA\u7A7A\u9593\u514D\u8A08\uFF08\u7B2C162\u689D\u7B2C1\u9805\u7B2C3\u6B3E\u7684\u898F\u5283\u8CC7\u683C\u5047\u8A2D\uFF09\uFF0C\u672A\u4EE5\u6A5F\u8ECA\u4F4D\u6578\u4E5840\u33A1\u64F4\u5927\u514D\u8A08\u3002");
  if (communityExempt > 0) notes.push("\u793E\u5340\u8ECA\u4F4D\u66AB\u4F5C\u4F9D\u6CD5\u8A2D\u7F6E\u4E4B\u88DD\u5378\uFF0F\u5783\u573E\u8ECA\u81E8\u505C\u7A7A\u9593\u514D\u8A08\u5047\u8A2D\uFF1B\u82E5\u5BE6\u969B\u70BA\u5176\u4ED6\u7528\u9014\uFF0C\u6539\u9078\u8A08\u5BB9\uFF0C\u4E0D\u56E0\u767B\u8A18\u5171\u6709\u800C\u7576\u7136\u514D\u8A08\u3002");
  if (spareCounted > 0) notes.push("\u5730\u4E0B\u672A\u5B9A\u7528\u9014\u9918\u88D5\u66AB\u8A08\u5BB9\u4E14\u4E0D\u5217\u623F\u5C4B\u53EF\u552E\uFF1B\u5982\u6539\u4F5C\u505C\u8ECA\u5FC5\u8981\u7A7A\u9593\uFF0C\u4ECD\u9808\u4F75\u5165\u6C7D\u8ECA40\u33A1\u4E0A\u9650\uFF0C\u4E0D\u53EF\u76F4\u63A5\u8F49\u6210\u514D\u8A08\u516C\u8A2D\u3002");
  return { shelterOnlyExempt, shelterArea, shelterEquipment, pools: { ...v }, shared, served, parkingCap, carPool, motoPool, bikePool, communityPool, carExempt, mergedEquipment, globalEquipmentExempt, equipmentCounted, parkingCounted, bicycleCounted, motorcycleCounted, communityCounted, spareCounted, counted, exempt, notes, balanced: Math.abs(counted + exempt - v.basement) < 0.02 };
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/BonusAssessmentPanel.tsx
import { Fragment as Fragment2, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function BonusAssessmentPanel({
  input,
  edit
}) {
  const p = input.regulatoryReview ?? defaultRegulatoryReview(), a = p.bonusAssessment ?? newBonusAssessment(Number(input.danger) > 0), c = {
    site: Number(input.site),
    far: Number(input.far),
    district: input.parkingDesign?.district,
    tdrTarget: Number(input.tdr),
    roadConditions: input.roadConditions
  }, base = c.site * c.far / 100;
  const permitted = a.awardBasis === "permitted", approval = a.permittedAward ?? {
    route: a.route === "danger" ? "danger" : "renewal",
    baseSqm: String(base),
    awardSqm: "",
    approvedAt: "",
    source: ""
  };
  const tdrCity = a.tdrApplication?.city ?? inferTdrCity(input.parkingDesign?.district ?? "");
  const change = (patch, extra = {}) => edit({
    ...extra,
    regulatoryReview: {
      ...p,
      bonusAssessment: {
        ...a,
        ...patch
      }
    }
  });
  const entry = (id, x) => change({
    entries: {
      ...a.entries,
      [id]: {
        ...a.entries[id] ?? {
          choice: ""
        },
        ...x
      }
    }
  });
  const summary = assessBonuses(a, c, Number(p.cashTdrPercent) || 0, p.renewalArea), effective = resolveBonusLimits({
    ...p,
    bonusAssessment: a
  }, {
    renewal: Number(input.renewal),
    tdr: Number(input.tdr),
    danger: Number(input.danger),
    scale: Number(input.scale)
  }, c), f7 = (x) => x.toLocaleString("zh-TW", {
    maximumFractionDigits: 2
  });
  const mode = (k, label) => /* @__PURE__ */ jsxs2("label", { children: [
    /* @__PURE__ */ jsx2(FieldLabel2, { children: label }),
    /* @__PURE__ */ jsxs2(PublicSelect2, { "aria-label": label, disabled: permitted && k !== "tdrMode", value: a[k], onChange: (e) => change({
      [k]: e.target.value
    }), children: [
      /* @__PURE__ */ jsx2("option", { value: "quick", children: "\u5FEB\u901F\u4F30\u7B97\uFF1A\u76F4\u63A5\u767E\u5206\u6BD4" }),
      /* @__PURE__ */ jsx2("option", { value: "detail", children: "\u7D30\u9805\u8A55\u5B9A\uFF1A\u9078\u689D\u4EF6\u52A0\u7E3D" })
    ] })
  ] });
  const items = (groups) => /* @__PURE__ */ jsx2("div", { className: "bonus-item-list", children: bonusItems.filter((d) => groups.includes(d.group)).map((d) => {
    const e = a.entries[d.id], r = summary.rows.find((x) => x.id === d.id);
    return /* @__PURE__ */ jsxs2("details", { className: "bonus-item", children: [
      /* @__PURE__ */ jsxs2("summary", { children: [
        d.label,
        " \xB7 ",
        r.selected ? `${f7(r.value)}% \xB7 ${r.status.replaceAll("", "")}` : "\u672A\u9078\u53D6"
      ] }),
      /* @__PURE__ */ jsxs2("p", { children: [
        d.condition,
        " ",
        /* @__PURE__ */ jsx2("a", { href: d.law, target: "_blank", rel: "noreferrer", children: "\u6CD5\u898F\uFF0F\u9644\u8868" })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "planning-field-grid", children: [
        /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsxs2(FieldLabel2, { children: [
            d.label,
            "\u76EE\u6A19\u689D\u4EF6"
          ] }),
          /* @__PURE__ */ jsxs2(PublicSelect2, { "aria-label": d.label + "\u76EE\u6A19\u689D\u4EF6", value: e?.choice ?? "", onChange: (x) => entry(d.id, {
            choice: x.target.value
          }), children: [
            /* @__PURE__ */ jsx2("option", { value: "", children: "\u4E0D\u9078\u53D6" }),
            d.options.map(([id, label]) => /* @__PURE__ */ jsx2("option", { value: id, children: label }, id))
          ] })
        ] }),
        d.amount && /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: d.amount }),
          /* @__PURE__ */ jsx2(PublicNumber2, { "aria-label": d.label + "\u8A08\u7B97\u91CF", type: "number", min: "0", step: "any", readOnly: d.id === "t-base", value: d.id === "t-base" && input.roadConditions ? input.roadConditions.plannedWidth : e?.amount ?? "", onChange: (x) => entry(d.id, {
            amount: x.target.value
          }) })
        ] }),
        (d.formula === "public" || d.formula === "donation") && /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: d.formula === "public" ? "\u516C\u5171\u8A2D\u65BD\u516C\u544A\u73FE\u503C\u5143\uFF0F\u33A1" : "\u5168\u57FA\u5730\u571F\u5730\u516C\u544A\u73FE\u503C\u7E3D\u984D\u5143" }),
          /* @__PURE__ */ jsx2(PublicNumber2, { "aria-label": d.label + "\u7B2C\u4E8C\u8A08\u7B97\u91CF", type: "number", min: "0", value: e?.amount2 ?? "", onChange: (x) => entry(d.id, {
            amount2: x.target.value
          }) })
        ] }),
        d.formula === "public" && /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u63A5\u53D7\u57FA\u5730\u516C\u544A\u73FE\u503C\u5143\uFF0F\u33A1" }),
          /* @__PURE__ */ jsx2(PublicNumber2, { "aria-label": d.label + "\u7B2C\u4E09\u8A08\u7B97\u91CF", type: "number", min: "0", value: e?.amount3 ?? "", onChange: (x) => entry(d.id, {
            amount3: x.target.value
          }) })
        ] }),
        ["u-old", "u-unsafe", "l-old", "d-old", "d-unsafe"].includes(d.id) && /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u9069\u7528\u57FA\u6E96\u5BB9\u7A4D\u6BD4\u4F8B%\uFF08\u7A7A\u767D\u66AB\u63A1\u5168\u6848100%\uFF09" }),
          /* @__PURE__ */ jsx2(PublicNumber2, { "aria-label": d.label + "\u9069\u7528\u6BD4\u4F8B", type: "number", min: "0", max: "100", value: e?.share ?? "", onChange: (x) => entry(d.id, {
            share: x.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u67E5\u8B49\u72C0\u614B" }),
          /* @__PURE__ */ jsxs2(PublicSelect2, { value: e?.status ?? "assumed", onChange: (x) => entry(d.id, {
            status: x.target.value
          }), children: [
            /* @__PURE__ */ jsx2("option", { value: "assumed", children: "\u76EE\u6A19\u5047\u8A2D" }),
            /* @__PURE__ */ jsx2("option", { value: "verified", children: "\u5DF2\u9644\u8986\u6838\u4F86\u6E90" }),
            /* @__PURE__ */ jsx2("option", { value: "excluded", children: "\u5DF2\u77E5\u4E0D\u9069\u7528\uFF0C\u4E0D\u53D6\u5206" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u4F9D\u64DA\u6216\u898F\u5283\u8AAA\u660E" }),
          /* @__PURE__ */ jsx2("input", { "aria-label": d.label + "\u4F9D\u64DA", value: e?.source ?? "", onChange: (x) => entry(d.id, {
            source: x.target.value
          }) })
        ] })
      ] }),
      r.messages.map((m) => /* @__PURE__ */ jsx2("p", { role: "status", children: publicText2(m) }, m))
    ] }, d.id);
  }) });
  const qualification = (k, label) => /* @__PURE__ */ jsxs2("label", { children: [
    /* @__PURE__ */ jsx2(FieldLabel2, { children: label }),
    /* @__PURE__ */ jsxs2(PublicSelect2, { value: a[k], onChange: (e) => change({
      [k]: e.target.value
    }), children: [
      /* @__PURE__ */ jsx2("option", { value: "unknown", children: "\u5C1A\u7F3A\u8B49\u660E\uFF1A\u660E\u793A\u5047\u8A2D\u7E7C\u7E8C\u521D\u4F30" }),
      /* @__PURE__ */ jsx2("option", { value: "yes", children: "\u4F9D\u6240\u9644\u4F86\u6E90\u8986\u6838\u7B26\u5408" }),
      /* @__PURE__ */ jsx2("option", { value: "no", children: "\u5DF2\u77E5\u4E0D\u9069\u7528\uFF1A\u672C\u9805\u63A10" })
    ] })
  ] });
  return /* @__PURE__ */ jsxs2("section", { className: "area-review-panel", "aria-label": "\u734E\u52F5\u8207\u5BB9\u79FB\u8A55\u5B9A", children: [
    /* @__PURE__ */ jsx2("h3", { children: "\u734E\u52F5\u8207\u5BB9\u79FB\uFF1A\u5FEB\u901F\u4F30\u7B97\uFF0F\u7D30\u9805\u8A55\u5B9A" }),
    /* @__PURE__ */ jsx2("p", { children: "\u5FEB\u901F\u767E\u5206\u6BD4\u8207\u7D30\u9805\u9078\u64C7\u5404\u81EA\u4FDD\u7559\uFF1B\u6BCF\u4E00\u985E\u53EA\u63A1\u6240\u9078\u65B9\u5F0F\uFF0C\u4E0D\u5C07\u5169\u7A2E\u7D50\u679C\u76F8\u52A0\u3002\u9078\u689D\u4EF6\u5373\u4EE5\u8A72\u689D\u4EF6\u70BA\u898F\u5283\u76EE\u6A19\uFF0C\u5C1A\u7F3A\u6587\u4EF6\u4ECD\u53EF\u7B97\uFF1B\u5DF2\u77E5\u4E0D\u7B26\u5408\u7684\u689D\u4EF6\u4E0D\u53D6\u5206\u3002" }),
    /* @__PURE__ */ jsxs2("div", { className: "planning-field-grid", children: [
      /* @__PURE__ */ jsxs2("label", { children: [
        /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u91CD\u5EFA\u734E\u52F5\u8DEF\u5F91" }),
        /* @__PURE__ */ jsxs2(PublicSelect2, { "aria-label": "\u91CD\u5EFA\u734E\u52F5\u8DEF\u5F91", value: a.route, onChange: (e) => change({
          route: e.target.value
        }), children: [
          /* @__PURE__ */ jsx2("option", { value: "renewal", children: "\u90FD\u5E02\u66F4\u65B0" }),
          /* @__PURE__ */ jsx2("option", { value: "danger", children: "\u5371\u8001\u91CD\u5EFA" }),
          /* @__PURE__ */ jsx2("option", { value: "none", children: "\u4E0D\u63A1\u90FD\u66F4\u6216\u5371\u8001" })
        ] })
      ] }),
      mode("renewalMode", "\u90FD\u66F4\u53D6\u503C\u65B9\u5F0F"),
      mode("tdrMode", "\u5BB9\u79FB\u53D6\u503C\u65B9\u5F0F"),
      mode("dangerMode", "\u5371\u8001\u53D6\u503C\u65B9\u5F0F"),
      /* @__PURE__ */ jsxs2("label", { children: [
        /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u9810\u8A08\u5831\u6838\uFF0F\u7533\u8ACB\u65E5\u671F" }),
        /* @__PURE__ */ jsx2("input", { type: "date", value: a.date, onChange: (e) => change({
          date: e.target.value
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx2("div", { className: "planning-field-grid", children: /* @__PURE__ */ jsxs2("label", { children: [
      /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u91CD\u5EFA\u734E\u52F5\u8CC7\u6599\u4F86\u6E90" }),
      /* @__PURE__ */ jsxs2(PublicSelect2, { "aria-label": "\u91CD\u5EFA\u734E\u52F5\u8CC7\u6599\u4F86\u6E90", value: a.awardBasis ?? "target", onChange: (e) => change({
        awardBasis: e.target.value,
        ...e.target.value === "permitted" ? {
          permittedAward: approval
        } : {}
      }), children: [
        /* @__PURE__ */ jsx2("option", { value: "target", children: "\u73FE\u884C\u65B0\u7533\u8ACB\uFF1A\u76EE\u6A19\u6216\u7D30\u9805\u8A55\u5B9A" }),
        /* @__PURE__ */ jsx2("option", { value: "permitted", children: "\u65E2\u6709\u6838\u51C6\u734E\u52F5\uFF1A\u4F9D\u6587\u4EF6\u9762\u7A4D\u5C0D\u7167" })
      ] })
    ] }) }),
    permitted && /* @__PURE__ */ jsxs2(Fragment2, { children: [
      /* @__PURE__ */ jsx2("p", { children: "\u65E2\u6709\u6838\u51C6\u9762\u7A4D\u7368\u7ACB\u4FDD\u5B58\uFF0C\u4E0D\u4F9D\u65B0\u7533\u8ACB\u65E5\u671F\u3001\u6642\u7A0B\u6216\u4E00\u822C\u734E\u52F5\u4E0A\u9650\u91CD\u7B97\u3002\u57FA\u5730\u8207\u57FA\u6E96\u5BB9\u7A4D\u8B8A\u66F4\u6642\u9808\u91CD\u65B0\u6838\u5C0D\uFF1B\u4E0D\u662F\u65B0\u6848\u53EF\u53D6\u5F97\u76F8\u540C\u734E\u52F5\u7684\u8B49\u660E\u3002" }),
      /* @__PURE__ */ jsxs2("div", { className: "planning-field-grid", children: [
        /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u734E\u52F5\u6838\u51C6\u8DEF\u5F91" }),
          /* @__PURE__ */ jsxs2(PublicSelect2, { "aria-label": "\u734E\u52F5\u6838\u51C6\u8DEF\u5F91", value: approval.route, onChange: (e) => change({
            permittedAward: {
              ...approval,
              route: e.target.value
            }
          }), children: [
            /* @__PURE__ */ jsx2("option", { value: "renewal", children: "\u90FD\u5E02\u66F4\u65B0" }),
            /* @__PURE__ */ jsx2("option", { value: "danger", children: "\u5371\u8001\u91CD\u5EFA" })
          ] })
        ] }),
        [["baseSqm", "\u6838\u51C6\u57FA\u6E96\u5BB9\u7A4D\u33A1"], ["awardSqm", "\u6838\u51C6\u734E\u52F5\u5BB9\u7A4D\u33A1"], ["approvedAt", "\u734E\u52F5\u6838\u51C6\u65E5\u671F"]].map(([key, label]) => /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: label }),
          /* @__PURE__ */ jsx2("input", { "aria-label": label, type: key === "approvedAt" ? "date" : "number", min: "0", step: "any", value: approval[key], onChange: (e) => change({
            permittedAward: {
              ...approval,
              [key]: e.target.value
            }
          }) })
        ] }, key)),
        /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u734E\u52F5\u6838\u51C6\u6587\u865F\u53CA\u4F86\u6E90" }),
          /* @__PURE__ */ jsx2("textarea", { "aria-label": "\u734E\u52F5\u6838\u51C6\u6587\u865F\u53CA\u4F86\u6E90", value: approval.source, onChange: (e) => change({
            permittedAward: {
              ...approval,
              source: e.target.value
            }
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx2("div", { className: "planning-field-grid", children: [["renewal", "\u90FD\u66F4\u5FEB\u901F\u76EE\u6A19%", a.renewalMode, a.route === "renewal"], ["tdr", "\u5BB9\u79FB\u5FEB\u901F\u76EE\u6A19%", a.tdrMode, true], ["danger", "\u5371\u8001\u5FEB\u901F\u76EE\u6A19%", a.dangerMode, a.route === "danger"]].map(([key, label, m, active]) => /* @__PURE__ */ jsxs2("label", { children: [
      /* @__PURE__ */ jsx2(FieldLabel2, { children: label }),
      /* @__PURE__ */ jsx2(PublicNumber2, { "aria-label": label, type: "number", min: "0", step: "any", disabled: m !== "quick" || !active || permitted && key !== "tdr", value: input[key], onChange: (e) => change({}, {
        [key]: e.target.value
      }) }),
      /* @__PURE__ */ jsx2("small", { children: permitted && key !== "tdr" ? "\u4F9D\u6838\u51C6\u6587\u4EF6\u9762\u7A4D\u63A1\u8A08\uFF0C\u5FEB\u901F\u503C\u4FDD\u7559" : !active ? "\u6B64\u8DEF\u5F91\u672A\u63A1\u7528\uFF0C\u672C\u6B21\u4E0D\u52A0\u7E3D" : m === "detail" ? "\u76EE\u524D\u7531\u7D30\u9805\u52A0\u7E3D\uFF1B\u5FEB\u901F\u503C\u4FDD\u7559" : "\u898F\u5283\u76EE\u6A19" })
    ] }, key)) }),
    /* @__PURE__ */ jsx2("p", { children: /* @__PURE__ */ jsxs2("strong", { children: [
      "\u672C\u6B21\u63A1\u7528\uFF1A\u90FD\u66F4 ",
      f7(effective.renewal),
      "%\uFF08",
      f7(base * effective.renewal / 100),
      "\u33A1\uFF09\uFF0B\u5BB9\u79FB ",
      f7(effective.tdr),
      "%\uFF08",
      f7(base * effective.tdr / 100),
      "\u33A1\uFF09\uFF0B\u5371\u8001 ",
      f7(effective.danger),
      "%\uFF08",
      f7(base * effective.danger / 100),
      "\u33A1\uFF09\u3002"
    ] }) }),
    /* @__PURE__ */ jsxs2("details", { className: "le-advanced", children: [
      /* @__PURE__ */ jsx2("summary", { children: "\u5BB9\u79FB\u53D6\u5F97\u689D\u4EF6\u8207\u8CC7\u683C\u6AA2\u6838" }),
      /* @__PURE__ */ jsx2(TdrApplicationPanel, { roadConditions: input.roadConditions, assessment: a, district: c.district ?? "", review: effective.application, change })
    ] }),
    /* @__PURE__ */ jsxs2("details", { open: a.renewalMode === "detail", children: [
      /* @__PURE__ */ jsx2("summary", { children: "\u90FD\u66F4\u7D30\u9805\uFF1A\u4E2D\u592E\u734E\u52F5\uFF0B\u65B0\u5317\u5730\u65B9\u734E\u52F5" }),
      /* @__PURE__ */ jsxs2("p", { children: [
        "\u7D30\u9805\u5408\u8A08 ",
        f7(summary.renewalRaw),
        "%\uFF0C\u6263\u91CD\u8907\u5F8C\u53CA\u4E00\u822C\u4E0A\u9650\u63A1 ",
        f7(summary.renewal),
        "%\u3002\u53D6\u503C\u65B9\u5F0F\u70BA",
        a.renewalMode === "detail" ? "\u7D30\u9805\uFF0C\u5DF2\u9023\u52D5" : "\u5FEB\u901F\uFF0C\u4EE5\u4E0B\u50C5\u4F9B\u672C\u6B21\u64CD\u4F5C\uFF0C\u4E0D\u5F71\u97FF\u5FEB\u901F\u503C",
        "\uFF1B\u76EE\u524D\u8DEF\u5F91",
        a.route === "renewal" ? "\u63A1\u7528\u90FD\u66F4" : "\u4E0D\u63A1\u90FD\u66F4",
        "\u3002"
      ] }),
      qualification("renewalQualification", "\u90FD\u66F4\u9069\u7528\u8CC7\u683C"),
      /* @__PURE__ */ jsx2("p", { children: "\u9700\u78BA\u8A8D\u4E8B\u696D\u8A08\u756B\u7BC4\u570D\u3001\u5408\u6CD5\u539F\u5EFA\u7269\u8207\u5BB9\u7A4D\u3001\u66F4\u65B0\u65B9\u5F0F\u53CA\u5404\u9805\u76EE\u689D\u4EF6\u3002\u4E2D\u592E\u734E\u52F5\u3001\u5730\u65B9\u734E\u52F5\u8207\u571F\u7BA1\uFF0F\u5176\u4ED6\u734E\u52F5\u4E0D\u5F97\u91CD\u8907\uFF1B\u7279\u6B8A\u539F\u5BB9\u7A4D\u3001\u9AD8\u6C2F\u6216\u8010\u9707\u5371\u96AA\u53CA\u7B56\u7565\u6027\u4E0A\u9650\u4E0D\u7531\u672C\u4E00\u822C\u8868\u81EA\u52D5\u8A8D\u5B9A\u3002" }),
      items(tdrCity === "ntpc" ? ["central", "local"] : ["central"]),
      /* @__PURE__ */ jsxs2("label", { children: [
        /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u540C\u4E00\u4E8B\u9805\u91CD\u8907\u734E\u52F5\u6263\u9664\uFF08\u57FA\u6E96\u5BB9\u7A4D%\uFF09" }),
        /* @__PURE__ */ jsx2(PublicNumber2, { type: "number", min: "0", value: a.deduction, onChange: (e) => change({
          deduction: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxs2("p", { children: [
        "\u5730\u65B9\u5C0F\u8A08",
        f7(summary.localRaw),
        "%\uFF0C\u4E00\u822C\u5730\u65B9\u63A1",
        f7(summary.localApplied),
        "%\uFF0F20%\u4E0A\u9650\uFF1B\u7279\u5225\u7B56\u7565\u8DEF\u5F91\u53E6\u9644\u4F9D\u64DA\u6838\u7B97\u3002"
      ] })
    ] }),
    tdrCity === "ntpc" && /* @__PURE__ */ jsxs2("details", { open: a.tdrMode === "detail", children: [
      /* @__PURE__ */ jsx2("summary", { children: "\u5BB9\u79FB\u7D30\u9805\uFF1A\u57FA\u6E96\u91CF\u3001\u5167\u90E8\u689D\u4EF6\u3001\u5916\u90E8\u6539\u5584" }),
      qualification("tdrQualification", "\u63A5\u53D7\u57FA\u5730\u3001\u9053\u8DEF\u53CA\u79FB\u5165\u8CC7\u683C"),
      /* @__PURE__ */ jsx2("p", { children: "\u61C9\u6838\u5C0D\u7981\u9650\u5206\u5340\u3001\u6BD7\u9130\u6587\u8CC7\u3001\u820A\u5EFA\u7167\uFF0F\u571F\u7BA1\u7981\u6B62\u3001\u57FA\u5730\u2265500\u33A1\u3001\u540C\u4E00\u8DEF\u6BB5\u9762\u5BEC\u53CA\u8DB3\u5BEC\u958B\u95E2\u9053\u8DEF\u3001\u66F4\u65B0\u55AE\u5143\u6216\u7279\u6B8A\u91CD\u5EFA\u4F8B\u5916\u3001\u9001\u51FA\u5730\u540C\u610F\uFF0F\u6B0A\u5229\u6E05\u7406\u6216\u4EE3\u91D1\u3002" }),
      /* @__PURE__ */ jsx2("div", { className: "planning-field-grid", children: /* @__PURE__ */ jsxs2("label", { children: [
        /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u5BB9\u79FB\u4E0A\u9650\u8DEF\u5F91" }),
        /* @__PURE__ */ jsxs2(PublicSelect2, { value: a.tdrProfile, onChange: (e) => change({
          tdrProfile: e.target.value
        }), children: [
          /* @__PURE__ */ jsx2("option", { value: "general", children: "\u4E00\u822C30%" }),
          /* @__PURE__ */ jsx2("option", { value: "forty", children: "\u7B26\u540840%\u5730\u5340\uFF0F\u5DF2\u5831\u6838\u90FD\u66F4\u7B49\u689D\u4EF6" }),
          /* @__PURE__ */ jsx2("option", { value: "hillside", children: "\u516C\u544A\u5C71\u5761\u573020%" }),
          /* @__PURE__ */ jsx2("option", { value: "narrow", children: "\u7B26\u5408\u4F8B\u5916\u4E14\u9053\u8DEF6\u81F3\u672A\u90548m\uFF1A15%" }),
          /* @__PURE__ */ jsx2("option", { value: "special50", children: "\u7279\u6B8A\u6838\u51C6\u91CD\u5EFA\uFF1A\u734E\u52F5\uFF0B\u5BB9\u79FB\u5408\u8A0850%" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs2("label", { children: [
        /* @__PURE__ */ jsx2("input", { type: "checkbox", checked: p.renewalArea, onChange: (e) => edit({
          regulatoryReview: {
            ...p,
            renewalArea: e.target.checked,
            bonusAssessment: a
          }
        }) }),
        "\u4F9D\u6CD5\u5283\u5B9A\u66F4\u65B0\u5730\u5340\uFF1A\u57FA\u6E96\u91CF\u53CA\u5167\u90E8\u52A00.3\u500D\uFF08\u66F4\u65B0\u55AE\u5143\u4E0D\u7B49\u65BC\u66F4\u65B0\u5730\u5340\uFF09"
      ] }),
      items(["internal", "external"]),
      /* @__PURE__ */ jsxs2("p", { children: [
        a.tdrProfile === "special50" ? "\u6B64\u70BA\u514D\u91CF\u9AD4\u8A55\u5B9A\u8DEF\u5F91\uFF0C\u4EE5\u4E0B\u8A55\u9EDE\u50C5\u4F9B\u8FFD\u6EAF\uFF1B\u672C\u6B21\u6539\u4F9D\u5FEB\u901F\u76EE\u6A19\u53CA\u500B\u5225\u3001\u5408\u8A08\u4E0A\u9650\u63A1\u8A08\u3002" : "",
        "\u57FA\u6E96",
        f7(summary.tdrBase),
        "%\uFF0B\u5167\u90E8",
        f7(summary.tdrInternal),
        "%\uFF1B\u52A0\u8A08\u4FC2\u6578",
        summary.tdrFactor,
        "\uFF1B\u5916\u90E8",
        f7(summary.tdrExternalRaw),
        "%\u53D7\u5167\u90E81/3\u9650\u5236\u63A1",
        f7(summary.tdrExternal),
        "%\uFF1B\u8A55\u5B9A",
        f7(summary.tdrRaw),
        "%\uFF0C\u672C\u8DEF\u5F91\u4E0A\u9650",
        summary.tdrCap,
        "%\uFF0C\u7D30\u9805\u63A1",
        f7(summary.tdr),
        "%\u3002\u53D6\u503C\u65B9\u5F0F\u70BA",
        a.tdrMode === "detail" ? "\u7D30\u9805\uFF0C\u5DF2\u9023\u52D5" : "\u5FEB\u901F\uFF0C\u7D30\u9805\u4E0D\u5F71\u97FF\u63A1\u7528",
        "\u3002"
      ] })
    ] }),
    /* @__PURE__ */ jsxs2("details", { open: a.dangerMode === "detail", children: [
      /* @__PURE__ */ jsx2("summary", { children: "\u5371\u8001\u7D30\u9805\uFF1A\u8CC7\u683C\u3001\u6838\u5FC3\u734E\u52F5\u3001\u6642\u7A0B\u53CA\u898F\u6A21" }),
      qualification("dangerQualification", "\u5371\u8001\u6CD5\u5B9A\u9069\u7528\u8CC7\u683C"),
      /* @__PURE__ */ jsx2("p", { children: "\u90FD\u5E02\u8A08\u756B\u5167\u5408\u6CD5\u5EFA\u7BC9\uFF0C\u975E\u6307\u5B9A\u6B77\u53F2\u6587\u5316\u7B49\u50F9\u503C\uFF0C\u7B26\u5408\u5371\u8001\u689D\u4F8B\u7B2C3\u689D\u5371\u96AA\uFF0F\u8010\u9707\u689D\u4EF6\uFF0C\u4E26\u53D6\u5F97\u5168\u9AD4\u571F\u5730\u53CA\u5408\u6CD5\u5EFA\u7269\u6240\u6709\u6B0A\u4EBA\u540C\u610F\u3002\u7533\u8ACB\u671F\u9650\u73FE\u884C\u70BA2027-05-31\uFF1B\u4E00\u822C\u6838\u5FC3\u4E0A\u9650\u70BA\u57FA\u6E96130%\u6216\u5408\u6CD5\u539F\u5BB9\u7A4D115%\uFF0C\u6642\u7A0B\u53CA\u898F\u6A21\u5408\u8A08\u53E6\u965010%\u3002\u672C\u8868\u4F9D\u734E\u52F5\u7D30\u9805\u52A0\u7E3D\uFF1B\u542B\u9130\u5730\u6216\u90E8\u5206\u5408\u683C\u57FA\u5730\u6642\uFF0C\u4F9D\u53EF\u734E\u52F5\u57FA\u5730\u6BD4\u4F8B\u53CA\u4E00\u822C30%\u6838\u5FC3\u4E0A\u9650\u8A08\u7B97\u3002" }),
      /* @__PURE__ */ jsxs2("div", { className: "planning-field-grid", children: [
        /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u7B26\u5408\u689D\u4EF6\u7684\u5408\u6CD5\u539F\u5EFA\u7BC9\u5BB9\u7A4D\u33A1\uFF08\u5168\u5408\u683C\u539F\u57FA\u5730\u624D\u6838\u8F03\u9AD8\u4E0A\u9650\uFF09" }),
          /* @__PURE__ */ jsx2(PublicNumber2, { type: "number", min: "0", value: a.dangerOriginal, onChange: (e) => change({
            dangerOriginal: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u5371\u8001\u5408\u683C\u539F\u5EFA\u7BC9\u57FA\u5730\u33A1\uFF08\u7A7A\u767D\u66AB\u63A1\u5168\u57FA\u5730\uFF09" }),
          /* @__PURE__ */ jsx2(PublicNumber2, { type: "number", min: "0", value: a.dangerEligibleSite, onChange: (e) => change({
            dangerEligibleSite: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs2("label", { children: [
          /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u5408\u4F75\u9130\u63A5\u57FA\u5730\u33A1" }),
          /* @__PURE__ */ jsx2(PublicNumber2, { type: "number", min: "0", value: a.dangerAdjacentSite, onChange: (e) => change({
            dangerAdjacentSite: e.target.value
          }) })
        ] })
      ] }),
      items(["danger"]),
      /* @__PURE__ */ jsxs2("p", { children: [
        "\u7B2C3\u20136\u689D",
        f7(summary.dangerCoreFirst),
        "%\uFF0C\u7B2C7\u201310\u689D",
        f7(summary.dangerCoreLater),
        "%\uFF0C\u6838\u5FC3\u4E0A\u9650",
        f7(summary.dangerCoreCap),
        "%\uFF1B\u6642\u7A0B\u8207\u898F\u6A21\u63A1",
        f7(summary.dangerExtra),
        "%\uFF1B\u6309\u53EF\u734E\u52F5\u57FA\u5730\u6BD4\u4F8B\u5F8C\u7D30\u9805\u5408\u8A08",
        f7(summary.danger),
        "%\u3002",
        a.route !== "danger" ? "\u672C\u6848\u672A\u9078\u5371\u8001\u8DEF\u5F91\uFF0C\u4EE5\u4E0A\u50C5\u4FDD\u7559\u4E0D\u52A0\u7E3D\u3002" : a.dangerMode === "detail" ? "\u5DF2\u7531\u7D30\u9805\u5E36\u5165\u8A08\u7B97\u3002" : "\u76EE\u524D\u4ECD\u63A1\u5FEB\u901F\u76EE\u6A19\uFF0C\u7D30\u9805\u4FDD\u7559\u3002"
      ] }),
      /* @__PURE__ */ jsx2("p", { children: "\u5371\u8001\u8DEF\u5F91\u4E0D\u758A\u52A0\u90FD\u66F4\uFF0F\u571F\u7BA1\u734E\u52F5\uFF1B\u65B0\u5317\u7279\u6B8A\u91CD\u5EFA\u5BB9\u79FB\u5408\u8A0850%\u4ECD\u9808\u8986\u6838\u500B\u6848\u8DEF\u5F91\uFF1B\u5176\u4ED6\u5730\u5340\u4E0D\u5957\u7528\u65B0\u5317\u5BB9\u79FB\u9644\u8868\u3002" })
    ] }),
    /* @__PURE__ */ jsxs2("details", { children: [
      /* @__PURE__ */ jsx2("summary", { children: "\u8CC7\u683C\u4F86\u6E90\u3001\u5408\u8A08\u4E0A\u9650\u53CA\u898F\u5283\u8AAA\u660E" }),
      /* @__PURE__ */ jsxs2("label", { children: [
        /* @__PURE__ */ jsx2("input", { type: "checkbox", checked: a.distinctSpaces ?? false, onChange: (e) => change({
          distinctSpaces: e.target.checked
        }) }),
        "\u5DF2\u898F\u5283\u5340\u5206\u4E0D\u540C\u7BC4\u570D\uFF1A\u5730\u65B9\u9000\u7E2E\uFF0F\u5EE3\u5834\uFF0F\u901A\u9053\u8207\u5BB9\u79FB\u5404\u9805\u76EE\u4E0D\u91CD\u8907\u4F7F\u7528\u540C\u4E00\u9762\u7A4D\uFF08\u8ACB\u65BC\u4E0B\u65B9\u8AAA\u660E\uFF09"
      ] }),
      /* @__PURE__ */ jsxs2("label", { children: [
        /* @__PURE__ */ jsx2(FieldLabel2, { children: "\u6587\u4EF6\u3001\u516C\u544A\u6216\u898F\u5283\u5047\u8A2D" }),
        /* @__PURE__ */ jsx2("textarea", { value: a.source, onChange: (e) => change({
          source: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsx2("p", { children: "\u65B0\u5317\u5BB9\u79FB\u4E00\u822C\u8DEF\u5F91\u53CA\u4E00\u822C\u90FD\u66F4\u9805\u76EE\u70BA\u672C\u8868\u7BC4\u570D\uFF1B\u7279\u6B8A\u8DEF\u5F91\u3001\u904E\u6E21\u820A\u6CD5\u6216\u5176\u4ED6\u7E23\u5E02\u9808\u6539\u7528\u76F8\u61C9\u6CD5\u4EE4\u3002\u734E\u52F5\u53D6\u5F97\u5F8C\u4ECD\u53D7\u91CF\u9AD4\u3001\u505C\u8ECA\u8207\u5176\u4ED6\u5EFA\u7BC9\u9650\u5236\uFF1B\u6B64\u8868\u4E0D\u81EA\u52D5\u5275\u9020\u53EF\u552E\u9762\u7A4D\u3002" })
    ] })
  ] });
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/LegalParkingPanel.tsx
import { FieldLabel as FieldLabel4, PublicNumber as PublicNumber4 } from "/src/land-evaluation/PublicFields.jsx";
import { PublicSelect as PublicSelect4 } from "/src/land-evaluation/PublicSelect.jsx";
import { publicText as publicText3 } from "/src/land-evaluation/public-copy.mjs";

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/escapeStairs.ts
function reviewEscapeStairs(i) {
  const aboveTwo = i.aboveFloors >= 8 || i.abovePlate > 240;
  const basementTwo = i.basementPlates.some((a) => a >= 200);
  const aboveSpecial = i.aboveFloors >= 15 && i.abovePlate > 100;
  const basementSpecial = i.basementFloors >= 3 && i.basementPlates.slice(2).some((a) => a > 100);
  return {
    minimum: aboveTwo || basementTwo ? 2 : 1,
    aboveMinimum: aboveTwo ? 2 : 1,
    basementMinimum: basementTwo ? 2 : 1,
    aboveType: aboveSpecial ? "\u6236\u5916\u5B89\u5168\u68AF\u6216\u7279\u5225\u5B89\u5168\u68AF" : i.aboveFloors >= 3 ? "\u5B89\u5168\u68AF" : "\u76F4\u901A\u6A13\u68AF",
    basementType: basementSpecial ? "\u6236\u5916\u5B89\u5168\u68AF\u6216\u7279\u5225\u5B89\u5168\u68AF" : i.basementFloors >= 2 ? "\u5B89\u5168\u68AF" : "\u76F4\u901A\u6A13\u68AF",
    reasons: [...i.aboveFloors >= 8 ? ["\u7B2C95\u689D\uFF1A\u516B\u5C64\u4EE5\u4E0A\u6A13\u5C64\u9808\u4E8C\u5EA7\u4EE5\u4E0A\u76F4\u901A\u6A13\u68AF\u9054\u907F\u96E3\u5C64\u6216\u5730\u9762"] : [], ...i.abovePlate > 240 ? ["\u7B2C95\u689D\uFF1A\u672C\u4F4F\u5B85\u5C64\u6A13\u677F\u8D85\u904E240\u33A1"] : [], ...basementTwo ? ["\u7B2C95\u689D\uFF1A\u5730\u4E0B\u6A13\u5C64\u6A13\u5730\u677F\u9054200\u33A1\uFF0C\u9808\u4E8C\u5EA7\u4EE5\u4E0A\u76F4\u901A\u6A13\u68AF"] : [], "\u7B2C96\u689D\u4F9D\u901A\u9054\u6A13\u5C64\u6AA2\u8A0E\u5B89\u5168\u68AF\u6216\u6236\u5916\uFF0F\u7279\u5225\u5B89\u5168\u68AF\uFF1B\u7B2C97\u689D\u69CB\u9020\u3001\u958B\u53E3\u8207\u6392\u7159\u5BA4\u53CA\u7B2C93\u689D\u6B65\u884C\u8DDD\u96E2\u4ECD\u9808\u5E73\u9762\u5716\u3002"],
    scope: "\u4EE5\u9632\u706B\u69CB\u9020\u4F4F\u5B85\uFF0F\u4E00\u822C\u5E97\u8216\u524D\u671F\u91CF\u9AD4\u6AA2\u8A0E\uFF0C\u4E0D\u542BA\u3001F\u7B49\u7279\u6B8A\u7528\u9014\u53CA\u975E\u9632\u706B\u69CB\u9020\uFF1B\u9810\u7559\u5169\u5EA7\u4E26\u4E0D\u8868\u793A\u5DF2\u5B8C\u6210\u907F\u96E3\u8A2D\u8A08\u3002"
  };
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/roofEnvelope.ts
function isRoofEnvelope(x) {
  if (!x || typeof x !== "object") return false;
  const r = x;
  return r.version === "roof-envelope.2026-10-19.v1" && ["auto", "ordinary"].includes(r.classification) && typeof r.qualifiedUses === "boolean" && typeof r.elevatorRoofOnly === "boolean" && typeof r.source === "string";
}
function reviewRoofEnvelope(r, c) {
  const errors = [], highByFloors = c.aboveFloors >= 16, highByHeight = c.buildingHeight >= 50;
  const high = r.classification === "auto" && (highByFloors || highByHeight), rate = high ? 15 : 12.5, projectionLimit = c.footprint * rate / 100, projection = c.roofFloors > 0 ? projectionLimit : 0;
  const maxHeight = c.elevator ? 9 : 6, totalHeight = c.roofFloors * c.floorHeight, totalArea = projection * c.roofFloors;
  if (!isRoofEnvelope(r) || ![c.footprint, c.aboveFloors, c.buildingHeight, c.roofFloors, c.floorHeight, c.registrationPercent].every(Number.isFinite) || c.footprint <= 0 || c.aboveFloors < 1 || c.buildingHeight < 0 || !Number.isInteger(c.roofFloors) || c.roofFloors < 0 || c.roofFloors > 200 || c.floorHeight <= 0 || c.registrationPercent < 0 || c.registrationPercent > 100) errors.push("\u5C4B\u7A81\u4E0A\u9650\u689D\u4EF6\u8CC7\u6599\u7121\u6548");
  if (totalHeight > maxHeight + 1e-6) errors.push(`\u5C4B\u7A81\u7E3D\u9AD8\u5EA6${totalHeight}m\u8D85\u904E${maxHeight}m\u689D\u4EF6\uFF0C\u4E0D\u5F97\u7576\u514D\u8A08\u5C4B\u7A81\u63A1\u7528`);
  if (!r.qualifiedUses && c.roofFloors > 0) errors.push("\u5C4B\u7A81\u7528\u9014\u4E0D\u7B26\u5408\u6A13\u68AF\u3001\u6607\u964D\u6A5F\u6216\u6A5F\u68B0\u623F\u7B49\u8CC7\u683C\uFF1B\u4E0D\u5F97\u4EE5\u672C\u514D\u8A08\u4E0A\u9650\u8A66\u7B97\u63A1\u7528");
  if (c.elevator && !r.elevatorRoofOnly && c.roofFloors > 0) errors.push("9m\u5C4B\u7A81\u5047\u8A2D\u4E0D\u5141\u8A31\u65BCR2/R3\u53E6\u8A2D\u6607\u964D\u6A5F\u51FA\u5165\u53E3\uFF0C\u9808\u6539\u6B63\u51FA\u5165\u53E3\u6216\u53E6\u6AA2\u8A0E\u4E00\u822C\u6A13\u5C64");
  const floors = Array.from({ length: Math.min(200, Math.max(0, c.roofFloors)) }, (_, j) => ({ label: `R${j + 1}`, area: projection, height: c.floorHeight, use: j === 0 ? "\u5171\u540C\u6A13\u68AF\u3001\u6607\u964D\u6A5F\u53CA\u6A5F\u68B0\u623F" : "\u5171\u540C\u6A13\u68AF\u53CA\u6A5F\u68B0\u623F\uFF08\u4E0D\u8A2D\u6607\u964D\u6A5F\u51FA\u5165\u53E3\uFF09", registered: projection * c.registrationPercent / 100 }));
  return { errors, high, highByFloors, highByHeight, rate, projectionLimit, projection, totalArea, totalHeight, maxHeight, registered: totalArea * c.registrationPercent / 100, registrationPercent: c.registrationPercent, floors, buildingHeight: c.buildingHeight, aboveFloors: c.aboveFloors, source: r.source, assumptions: "\u672C\u6B21\u6309\u4E0A\u4E0B\u5C0D\u4F4D\u7684\u540C\u6295\u5F71\u6A13\u677F\u521D\u4F30\uFF0C\u6C34\u5E73\u6295\u5F71\u806F\u96C6\u4E0D\u4E58\u5C64\u6578\uFF1B\u7E3D\u6A13\u677F\u624D\u4F9D\u5C4B\u7A81\u5C64\u6578\u52A0\u7E3D\u300215%\uFF0F12.5%\u662F\u6295\u5F71\u4E0A\u9650\uFF0C\u4E0D\u662F\u5BE6\u969B\u9700\u6C42\u3002\u672A\u5C0725\u33A1\u5C0F\u57FA\u5730\u4F8B\u5916\u3001\u9732\u81FA\u3001\u5E73\u53F0\u3001\u958B\u653E\u69CB\u67B6\u6216\u6C34\u7BB1\u4E0A\u65B9\u7A7A\u9593\u53E6\u52A0\u53EF\u767B\u8A18\u6A13\u677F\uFF1B\u5408\u683C\u5C4B\u7A81\u5167\u8A2D\u5099\u4E0D\u91CD\u8907\u5217\u5165\u5730\u4E0A\u6A5F\u96FB15%\u6C60\u3002" };
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/quantityAreaAudit.ts
var BASELINE_VERSION = "planning-area-baseline.v1";
var saleKeys = ["ordinary", "registeredEquipment", "registeredLobby", "balcony", "registeredRoof", "basementEquipmentSale", "shelterCommon", "parkingHousingCommon"];
var contextKeys = ["aboveFloors", "sale", "allowed", "basement", "floors", "equipment", "lobby", "roof", "aboveSale", "basementSale", "units", "cars", "motos", "equipmentArea", "bikeArea", "communityArea", "rampTotal", "lossArea", "basementUnassigned"];
function isAreaBaseline(x) {
  if (!x || typeof x !== "object") return false;
  const a = x;
  return a.format === BASELINE_VERSION && (a.commonRatioReference === void 0 || Number.isFinite(a.commonRatioReference.low) && Number.isFinite(a.commonRatioReference.high) && a.commonRatioReference.low >= 0 && a.commonRatioReference.high <= 100 && a.commonRatioReference.high >= a.commonRatioReference.low && typeof a.commonRatioReference.source === "string") && ["caseId", "label", "source", "sourceSha256", "formulaCommit"].every((k) => typeof a[k] === "string") && /^[a-f0-9]{64}$/.test(a.sourceSha256) && /^[a-f0-9]{40}$/.test(a.formulaCommit) && !!a.values && [...saleKeys, ...contextKeys].every((k) => Number.isFinite(a.values[k]) && a.values[k] >= 0) && a.values.allowed > 0 && Number.isInteger(a.values.floors) && Math.abs(saleKeys.reduce((t, k) => t + a.values[k], 0) - a.values.sale) < 0.04;
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/quantityPlanning.ts
var QUANTITY_VERSION = "quantity-reserve.2026-10-19.v1";
function isQuantityReserve(x) {
  if (!x || typeof x !== "object") return false;
  const q = x;
  return q.version === QUANTITY_VERSION && (q.passengerLiftCount === void 0 || Number.isInteger(q.passengerLiftCount) && q.passengerLiftCount >= 1 && q.passengerLiftCount <= 8) && (q.sharedEmergencyLift === void 0 || typeof q.sharedEmergencyLift === "boolean") && (q.passengerLiftCount !== 1 || q.sharedEmergencyLift === true) && (q.basementEquipmentMode === void 0 || ["named", "percent"].includes(q.basementEquipmentMode)) && (q.basementCorePerFloor === void 0 || Number.isFinite(q.basementCorePerFloor) && q.basementCorePerFloor >= 0) && (q.roofEnvelope === void 0 || isRoofEnvelope(q.roofEnvelope)) && (q.reservationMode === void 0 || ["compact", "legal_envelope"].includes(q.reservationMode)) && (q.basementReservePercent === void 0 || Number.isFinite(q.basementReservePercent) && q.basementReservePercent >= 0 && q.basementReservePercent < 100) && (q.baseline === void 0 || isAreaBaseline(q.baseline)) && ["roofPerFloor", "ordinaryCommonPerFloor", "aboveCorePerFloor", "aboveEquipmentPerFloor", "management", "lobbyPerFloor"].every((k) => Number.isFinite(q[k]) && q[k] >= 0) && Array.isArray(q.basementRooms) && q.basementRooms.length >= 1 && q.basementRooms.length <= 100 && q.basementRooms.every((n) => Number.isFinite(n) && n >= 0) && typeof q.source === "string";
}
function quantityLiftSpaces(q) {
  const count = q.passengerLiftCount ?? 2, delta = (count - 2) * 7.5;
  return { count, basementCore: Math.max(0, (q.basementCorePerFloor ?? 54) + delta), ordinaryCommon: Math.max(0, q.ordinaryCommonPerFloor + delta), compactRoof: Math.max(0, q.roofPerFloor + delta) };
}
function calculateQuantityPlanning(i, run) {
  const q = i.quantityReserve, lift = quantityLiftSpaces(q);
  if (!isQuantityReserve(q)) return { ...run({ ...i, quantityReserve: void 0 }), values: null, errors: ["\u5FC5\u8981\u7A7A\u9593\u9810\u7559\u8CC7\u6599\u7121\u6548"] };
  const rates = resolveBonusLimits(i.regulatoryReview, { renewal: Number(i.renewal), scale: Number(i.scale), tdr: Number(i.tdr), danger: Number(i.danger) }, { site: Number(i.site), far: Number(i.far), district: i.parkingDesign?.district, tdrTarget: Number(i.tdr), roadConditions: i.roadConditions });
  const cap = Number(i.site) * Number(i.far) / 100 * (1 + (rates.renewal + rates.scale + rates.tdr + rates.danger) / 100), footprint = Number(i.site) * Number(i.coverage) / 100 * Number(i.coverageUse) / 100;
  const upper = q.reservationMode === "legal_envelope", equipmentLimit = cap * (i.stair === "single" ? 0.1 : 0.15), undergroundTarget = q.basementEquipmentMode === "named" ? q.basementRooms[0] ?? 0 : Number(i.site) * Number(i.excavation) / 100 * (q.basementReservePercent ?? 25) / 100;
  let floors = Math.max(1, Math.ceil(cap / footprint)), last;
  for (let j = 0; j < 50; j++) {
    const roofReview = q.roofEnvelope ? reviewRoofEnvelope(q.roofEnvelope, { footprint, aboveFloors: floors, buildingHeight: (i.spatial?.assumptions.groundHeight ?? 4.2) + (floors - 1) * (i.spatial?.assumptions.floorHeight ?? 3.2), roofFloors: Number(i.roofFloors), floorHeight: Number(i.roofHeight), elevator: i.elevator === "yes", registrationPercent: i.areaReview?.registration?.roofPercent ?? 100 }) : void 0;
    if (roofReview?.errors.length) return { ...run({ ...i, quantityReserve: void 0, spatial: void 0 }), values: null, errors: roofReview.errors, roofEnvelopeReview: roofReview };
    const equipment = upper ? equipmentLimit : (q.aboveCorePerFloor + q.aboveEquipmentPerFloor) * floors + q.management;
    const e = { ...i, spatial: void 0, roofType: roofReview ? roofReview.high ? "high" : "ordinary" : i.roofType, roofRate: String(roofReview?.rate ?? lift.compactRoof / footprint * 100), equipment: String(equipment / cap * 100), lobby: upper ? "10" : String(Math.min(100, q.lobbyPerFloor / footprint * 100)), reserve: "0", areaReview: { ...i.areaReview, floors: void 0, source: "\u6CD5\u898F\u9700\u6C42\u53CA\u5177\u540D\u7A7A\u9593\u9810\u7559\u7E3D\u91CF\u521D\u4F30\uFF1B\u975E\u914D\u7F6E\u5716" }, regulatoryReview: { ...i.regulatoryReview, siteGeometry: void 0, spareUse: "counted", shelterArea: String(footprint), shelterEquipment: String(Math.min(upper ? undergroundTarget : q.basementRooms[0] ?? 0, footprint / 4)), shelterSource: "B1\u6309\u5EFA\u7BC9\u9762\u7A4D\u9644\u5EFA\u9632\u7A7A\u907F\u96E3\u517C\u505C\u8ECA\uFF1B\u8A2D\u5099\u623F\u66AB\u914D\u7F6E\u5176\u4E2D\uFF0C\u5C1A\u5F85\u5BE6\u969B\u5716\u8AAA\u78BA\u8A8D\u8CC7\u683C\u3002" } };
    last = run(e);
    if (!last.values) return last;
    const next = last.values.equivalentFloors;
    if (next === floors) {
      const notes = [...last.notes.filter((n) => !n.startsWith("\u666E\u901A\u8A08\u5BB9\u6A13\u677F\u5167\u516C\u8A2D\u66AB\u5217")), `\u8A08\u7B97\u4F86\u6E90\uFF1A\u6CD5\u898F\u9700\u6C42\u53CA\u5FC5\u8981\u7A7A\u9593\u9810\u7559\u7E3D\u91CF\u521D\u4F30\uFF0C\u672A\u63A1\u7528\u81EA\u52D5\u914D\u7F6E\u5716\u9020\u6210\u7684\u9000\u7E2E\u3001\u77E9\u5F62\u5207\u5272\u6216\u6392\u4F4D\u640D\u5931\uFF1B\u4E0D\u662F\u5EFA\u7BC9\u5E2B\u5DF2\u5B8C\u6210\u7684\u914D\u7F6E\uFF0C\u4E5F\u4E0D\u662F\u57FA\u5730\u53EF\u5BE6\u73FE\u4E0A\u9650\u3002`, ...upper ? [`\u4E0A\u9650\u689D\u4EF6\u521D\u4F30\uFF1A\u5730\u4E0A\u6A5F\u96FB\u7B49\u66AB\u6309\u57FA\u5730\u5BB9\u7A4D${i.stair === "single" ? "10" : "15"}%\u76EE\u6A19\u9810\u7559\uFF0C\u5171\u540C\u68AF\u5EF3\u6309\u5404\u5C64\u6A13\u677F10%\uFF0C\u967D\u53F0\u4F9D\u8F38\u5165\u4E26\u8207\u68AF\u5EF3\u9010\u5C64\u5408\u8A0815%\u6AA2\u8A0E\u3002\u5730\u4E0B\u8A2D\u5099\u68AF\u9593${q.basementEquipmentMode === "named" ? `\u4F9D\u6BCF\u5C64\u6838\u5FC3${lift.basementCore}\u33A1\u53CA\u9010\u5C64\u8A2D\u5099\u623F${q.basementRooms.join("\uFF0F")}\u33A1\u5177\u540D\u9810\u7559\uFF08\u8D85\u904E\u8868\u5217\u5C64\u6578\u6CBF\u7528\u672B\u5C64\u623F\u9593\u9810\u7559\uFF09` : `\u4EE5\u6BCF\u5C64\u958B\u6316\u9762\u7A4D${q.basementReservePercent ?? 25}%\u4F5C\u9762\u7A4D\u9810\u7559\u76EE\u6A19`}\uFF1B\u9019\u4E0D\u662F\u6CD5\u5B9A\u6700\u5927\u6BD4\u4F8B\uFF0C\u4ECD\u53D7\u505C\u8ECA40\u33A1\u6C60\u3001\u907F\u96E3\u56FA\u5B9A\u8A2D\u50991/4\u53CA\u6A5F\u96FB\u5269\u9918\u984D\u5EA6\u6AA2\u8A0E\u3002`] : [q.source, `\u5730\u4E0A\u4F9D${floors}\u5C64\u66AB\u7559\u5408\u683C\u5B89\u5168\u68AF\u3001\u7DCA\u6025\u6607\u964D\u6A5F\uFF0F\u6392\u7159\u5BA4\u8207\u6A5F\u96FB\u7B49${equipment.toFixed(2)}\u33A1\uFF0C\u672A\u5C0715%\u514D\u8A08\u4E0A\u9650\u76F4\u63A5\u586B\u6210\u9700\u6C42\uFF1B\u68AF\u5EF3\u6BCF\u5C64\u66AB\u7559${q.lobbyPerFloor}\u33A1\u3002\u4E0D\u7B26\u5408\u7528\u9014\u8CC7\u683C\u6642\u61C9\u6539\u8A08\u5BB9\u3002`], `\u5DF2\u4FDD\u7559\u5730\u7C4D\u908A\u754C\u8207\u4F86\u6E90\u4F9B\u5F8C\u7E8C\u5957\u5716\uFF1B\u9053\u8DEF\u659C\u7DDA\u3001\u65E5\u7167\u3001\u6551\u707D\u53CA\u9AD8\u9435\u9650\u5EFA\u5C1A\u672A\u5B8C\u6210\u91CF\u9AD4\u9A57\u8B49\uFF0C\u672C\u6B21\u4E0D\u628A\u7C97\u7565\u5E7E\u4F55\u640D\u5931\u7576\u6CD5\u5B9A\u6E1B\u91CF\uFF0C\u4E5F\u4E0D\u5BA3\u7A31\u80FD\u8207\u5EFA\u7BC9\u5E2B\u65B9\u6848\u5B8C\u5168\u4E00\u81F4\u3002`];
      const ordinaryCommon = Math.min(last.values.ordinary, lift.ordinaryCommon * floors), common = last.values.common - last.values.ordinaryCommon + ordinaryCommon;
      if (roofReview) notes.push(`\u5C4B\u7A81\u4F9D\u6CD5\u898F\u4E0A\u9650\u689D\u4EF6\u521D\u4F30\uFF1A\u63A8\u4F30\u5730\u4E0A${floors}\u5C64\uFF0F${roofReview.buildingHeight.toFixed(2)}m\uFF0C\u63A1${roofReview.rate}%\u6295\u5F71\uFF1B\u4E0A\u4E0B\u5C0D\u4F4D\u806F\u96C6${roofReview.projection.toFixed(2)}\u33A1\u3001${i.roofFloors}\u5C64\u6A13\u677F\u5408\u8A08${roofReview.totalArea.toFixed(2)}\u33A1\u3001\u7E3D\u9AD8${roofReview.totalHeight}m\u3002\u53EF\u767B\u8A18\u5171\u6709\u66AB\u63A1${roofReview.registrationPercent}%\uFF1D${roofReview.registered.toFixed(2)}\u33A1\uFF0C\u5DF2\u5217\u5165\u4E00\u6B21\uFF0C\u4E0D\u8207\u6A5F\u96FB\u6C60\u91CD\u8907\u3002`, roofReview.source, roofReview.assumptions);
      notes.push(`\u8F09\u4EBA\u96FB\u68AF${lift.count}\u5EA7${q.passengerLiftCount === 1 ? "\uFF08\u540C\u4E00\u5EA7\u517C\u4E00\u822C\uFF0F\u7DCA\u6025\u53CA\u7121\u969C\u7919\u9700\u6C42\uFF0C\u529F\u80FD\u8CC7\u683C\u53CA\u5C3A\u5BF8\u5F85\u5716\u8AAA\u6838\u5C0D\uFF09" : ""}\uFF1B\u6C7D\u8ECA\u5347\u964D\u6A5F\u53E6\u8A08\u3002\u53C3\u8003\u6A5F\u9053\u6BCF\u5EA77.5\u33A1\uFF1B\u672C\u6B21\u5730\u4E0B\u6BCF\u5C64\u6838\u5FC3${lift.basementCore}\u33A1\u3001\u666E\u901A\u8A08\u5BB9\u5167\u5171\u6709${lift.ordinaryCommon}\u33A1\uFF0F\u5C64\u3002\u5730\u4E0A\u63A1\u514D\u8A08\u4E0A\u9650\u6A21\u5F0F\u6642\uFF0C\u5EA7\u6578\u4E0D\u81EA\u52D5\u6539\u8B8A15%\uFF0F10%\u514D\u8A08\u8CC7\u683C\u6216\u5C4B\u7A81\u5408\u6CD5\u6295\u5F71\u3002`);
      notes.push(`\u666E\u901A\u8A08\u5BB9\u6A13\u677F\u5167\u66AB\u7559\u666E\u901A\u6607\u964D\u6A5F\u53CA\u8D70\u9053${ordinaryCommon.toFixed(2)}\u33A1\u70BA\u623F\u5C4B\u5171\u6709\uFF1B\u53EA\u91CD\u65B0\u5206\u985E\uFF0C\u4E0D\u53E6\u589E\u53EF\u552E\u9762\u7A4D\u3002\u7246\u67F1\u5C08\u5171\u6709\u5206\u914D\u4ECD\u5F85\u5EFA\u7269\u6E2C\u91CF\u6210\u679C\u3002`);
      return { ...last, ...roofReview ? { roofEnvelopeReview: roofReview } : {}, values: { ...last.values, ordinaryCommon, common, commonRatio: common / last.values.sale * 100 }, notes: [...new Set(notes)] };
    }
    floors = next;
  }
  return { ...last, values: null, errors: [...last?.errors ?? [], "\u6A13\u5C64\u8207\u5FC5\u8981\u7A7A\u9593\u9810\u7559\u672A\u6536\u6582\uFF0C\u8ACB\u8ABF\u6574\u6A13\u677F\u5047\u8A2D"] };
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/BasementDemandPanel.tsx
import { FieldLabel as FieldLabel3, PublicNumber as PublicNumber3 } from "/src/land-evaluation/PublicFields.jsx";
import { PublicSelect as PublicSelect3 } from "/src/land-evaluation/PublicSelect.jsx";

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/smallSiteParking.ts
var SMALL_SITE_VERSION = "small-site.2026-10-19.v1";
var defaultGroundAccessibility = () => ({ available: true, routeWidth: 1.5, routeLength: 4, otherArea: 54 });
var defaultSmallSiteParking = () => ({ version: SMALL_SITE_VERSION, groundAccessibility: defaultGroundAccessibility(), mechanicalType: "stacked", warehouseAisleWidth: 3, warehouseTransferArea: 20, warehouseEquipmentArea: 12, access: "ramp", mechanical: false, allocation: "b1", groundCars: 0, targetCars: 0, groundArea: 0, liftCount: 1, shaftWidth: 3.5, shaftLength: 5.7, waitingWidth: 6, waitingDepth: 6, landingArea: 20, twoWheelLiftArea: 9, mechanicalSpaces: 2, mechanicalWidth: 2.5, mechanicalLength: 5.5, mechanicalClearHeight: 1.8, mechanicalHeight: 4, overhead: 0.3, pit: 0.6, targetMechanical: 0, localReview: "unknown", reviewSource: "", tdrPoints: "" });
var numeric = ["groundCars", "targetCars", "groundArea", "liftCount", "shaftWidth", "shaftLength", "waitingWidth", "waitingDepth", "landingArea", "twoWheelLiftArea", "mechanicalSpaces", "mechanicalWidth", "mechanicalLength", "mechanicalClearHeight", "mechanicalHeight", "overhead", "pit", "targetMechanical"];
function isSmallSiteParking(x) {
  if (!x || typeof x !== "object") return false;
  const s = x;
  const g = s.groundAccessibility;
  if (g !== void 0 && (!g || typeof g.available !== "boolean" || !["routeWidth", "routeLength", "otherArea"].every((k) => Number.isFinite(g[k]) && Number(g[k]) >= 0) || g.areaCap !== void 0 && (!Number.isFinite(g.areaCap) || g.areaCap < 0))) return false;
  return (s.mechanicalType === void 0 || ["stacked", "warehouse"].includes(s.mechanicalType)) && ["warehouseAisleWidth", "warehouseTransferArea", "warehouseEquipmentArea"].every((k) => s[k] === void 0 || Number.isFinite(s[k]) && s[k] >= 0) && (s.accessibleRoute === void 0 || ["ground", "passenger_lift"].includes(s.accessibleRoute)) && s.version === SMALL_SITE_VERSION && ["ramp", "lift"].includes(s.access) && typeof s.mechanical === "boolean" && ["b1", "distributed"].includes(s.allocation) && numeric.every((k) => Number.isFinite(s[k]) && s[k] >= 0 && s[k] <= 1e5) && ["unknown", "confirmed", "failed"].includes(s.localReview) && typeof s.reviewSource === "string" && typeof s.tdrPoints === "string" && (s.floorPlates === void 0 || Array.isArray(s.floorPlates) && s.floorPlates.length > 0 && s.floorPlates.length <= 30 && s.floorPlates.every((n) => Number.isFinite(n) && n > 0));
}
function allocateSmallSite(s, c) {
  const errors = [], notes = [], conditions = [];
  const empty = (capacityFailure = false) => ({ errors, notes, values: null, capacityFailure });
  if (!isSmallSiteParking(s)) {
    errors.push("\u5C0F\u57FA\u5730\u914D\u7F6E\u683C\u5F0F\u6216\u6578\u503C\u7121\u6548");
    return empty();
  }
  for (const k of ["groundCars", "targetCars", "liftCount", "mechanicalSpaces", "targetMechanical"]) if (!Number.isInteger(s[k])) errors.push(k + "\u9808\u70BA\u6574\u6578");
  if (s.localReview === "failed") errors.push("\u5DF2\u77E5\u500B\u6848\u898F\u5B9A\u6216\u5BE9\u8B70\u4E0D\u5141\u8A31\u6240\u9078\u66FF\u4EE3\u505C\u8ECA\u65B9\u5F0F");
  if (s.localReview === "confirmed" && !s.reviewSource.trim()) errors.push("\u5DF2\u78BA\u8A8D\u505C\u8ECA\u5BE9\u8B70\u9808\u586B\u6838\u51C6\u6587\u4EF6\u4F86\u6E90");
  if (s.access === "lift") {
    if (c.site >= 1500) errors.push("\u57FA\u5730\u90541500\u33A1\uFF0C\u4F9D\u7B2C60\u689D\u61C9\u8A2D\u5761\u9053\uFF0C\u4E0D\u80FD\u53EA\u4EE5\u6C7D\u8ECA\u5347\u964D\u6A5F\u53D6\u4EE3");
    if (s.liftCount < 1 || s.shaftWidth < 3.5 || s.shaftLength < 5.7) errors.push("\u6C7D\u8ECA\u5347\u964D\u6A5F\u9808\u81F3\u5C111\u90E8\uFF0C\u6A5F\u9053\u5BEC\u81F3\u5C113.5m\u3001\u9577\u81F3\u5C115.7m");
    if (s.waitingWidth < 6 || s.waitingDepth < 6) errors.push("\u7B2C136\u689D\u5347\u964D\u6A5F\u524D\u65B9\u7B49\u5019\u7A7A\u9593\u5BEC\u3001\u6DF1\u9808\u5404\u81F3\u5C116m\uFF0C\u6BCF\u90E8\u7368\u7ACB\u7559\u8A2D");
    if (s.accessibleRoute === "passenger_lift") notes.push("\u820A\u8A2D\u5B9A\u7684\u5BA2\u7528\u96FB\u68AF\u4E0D\u4F5C\u6C7D\u8ECA\u5347\u964D\u6A5F\u901A\u9054\u5730\u4E0B\u7121\u969C\u7919\u8ECA\u4F4D\u7684\u4F9D\u64DA\uFF1B\u672C\u6B21\u6539\u5217\u5730\u9762\u5FC5\u8981\u7121\u969C\u7919\u8ECA\u4F4D\u3002");
    if (s.landingArea <= 0 || c.motos + c.bikes > 0 && s.twoWheelLiftArea < 2.88) errors.push("\u9808\u9810\u7559\u5730\u4E0B\u642D\u4E58\uFF0F\u8F49\u5411\u7A7A\u9593\u53CA\u7368\u7ACB\u6C7D\u6A5F\u8ECA\u9023\u901A\u52D5\u7DDA\uFF1B\u5169\u8F2A\u5347\u964D\u8A2D\u5099\u9762\u7A4D\u4E0D\u5F97\u5C0F\u65BC1.2\xD72.4\u33A1");
    conditions.push("\u7121\u5761\u9053\u65B9\u6848\u4F9D\u6CD5\u5B9A\u9700\u6C42\u53E6\u7559\u5730\u9762\u7121\u969C\u7919\u5E73\u9762\u8ECA\u4F4D\u53CA\u7368\u7ACB\u9023\u7E8C\u901A\u8DEF\uFF1B\u4E0D\u4EE5\u5BA2\u7528\u96FB\u68AF\u3001\u6C7D\u8ECA\u6607\u964D\u5E73\u53F0\u6216\u5009\u5132\u6A5F\u68B0\u8ECA\u4F4D\u66FF\u4EE3\u3002\u5730\u9762\u7A7A\u9593\u4E0D\u8DB3\u6642\u6392\u9664\u672C\u65B9\u6848\uFF1B\u6838\u51C6\u66FF\u4EE3\u6539\u5584\u9808\u53E6\u6848\u6838\u5BE6\uFF0C\u4E0D\u81EA\u52D5\u653E\u884C\u3002");
    conditions.push("\u6C7D\u8ECA\u5347\u964D\u6A5F\u6A5F\u5EC2\u9808\u4F9D\u8ECA\u578B\u6838\u5C0D\u6DE8\u5BEC\u3001\u9577\u3001\u9AD8\uFF1B\u5730\u9762\u9802\u84CB\u3001\u5EFA\u853D\u3001\u524D\u65B9\u7368\u7ACB\u7B49\u5019\u3001\u8996\u8DDD\u8207\u8F49\u5411\u5C1A\u9808\u5716\u8AAA\u8986\u6838\u3002", "\u6C7D\u8ECA\u5347\u964D\u6A5F\u4E0D\u8996\u70BA\u6A5F\u8ECA\u6216\u81EA\u884C\u8ECA\u901A\u9053\uFF1B\u53E6\u7559\u5BA2\u8CA8\u5347\u964D\u8A2D\u5099\u53CA\u505C\u7B49\u7A7A\u9593\uFF0C\u9808\u6838\u8F09\u91CD\u3001\u5C3A\u5BF8\u3001\u9632\u706B\u8207\u71DF\u904B\u52D5\u7DDA\u3002");
  }
  const g = s.groundAccessibility ?? defaultGroundAccessibility();
  const groundCars = s.access === "lift" ? Math.max(s.groundCars, c.accessible) : s.groundCars;
  if (groundCars > c.requested) errors.push("\u5730\u9762\u6C7D\u8ECA\u4F4D\u4E0D\u5F97\u8D85\u904E\u898F\u5283\u7E3D\u9700\u6C42");
  if (s.access === "lift" && groundCars > c.accessible) errors.push("\u7121\u5761\u9053\u65B9\u6848\u76EE\u524D\u53EA\u7D0D\u5165\u5FC5\u8981\u5730\u9762\u7121\u969C\u7919\u8ECA\u4F4D\uFF0C\u4E0D\u589E\u8A2D\u4E00\u822C\u5730\u9762\u8ECA\u4F4D");
  const groundAccessible = Math.min(groundCars, c.accessible);
  const routeArea = groundAccessible > 0 ? g.routeWidth * g.routeLength : 0;
  const stallAndAisle = groundCars * c.carModule + (c.accessible ? c.accessibleExtra * groundAccessible / c.accessible : 0);
  const groundArea = groundCars > 0 ? Math.max(s.groundArea, stallAndAisle + routeArea) : 0;
  const waitingArea = s.access === "lift" ? s.waitingWidth * s.waitingDepth * s.liftCount : 0;
  const shaftArea = s.access === "lift" ? s.shaftWidth * s.shaftLength * s.liftCount : 0;
  const groundCap = Math.min(c.site, c.groundPlate ?? c.site, g.areaCap ?? Infinity);
  const totalGround = groundArea + waitingArea + shaftArea + (groundAccessible > 0 ? g.otherArea : 0);
  if (groundAccessible > 0) {
    if (!g.available) errors.push("\u5730\u9762\u7121\u6CD5\u7559\u8A2D\u5FC5\u8981\u7121\u969C\u7919\u8ECA\u4F4D\u53CA\u9023\u7E8C\u901A\u8DEF\uFF0C\u4E0D\u80FD\u63A1\u7528\u7121\u5761\u9053\u5347\u964D\u6A5F\u65B9\u6848\uFF1B\u4E0D\u5F97\u4EE5\u5BA2\u7528\u96FB\u68AF\u66FF\u4EE3");
    if (g.routeWidth < 1.3 || g.routeLength <= 0) errors.push("\u5730\u9762\u7121\u969C\u7919\u901A\u8DEF\u521D\u4F30\u9808\u6DE8\u5BEC\u81F3\u5C111.3m\u4E14\u586B\u5165\u6B63\u9577\u5EA6\uFF1B\u5176\u4ED6\u5C3A\u5BF8\u3001\u5761\u5EA6\u53CA\u9580\u6247\u53E6\u6838");
    if (g.otherArea <= 0) errors.push("\u5730\u9762\u9580\u5EF3\u3001\u6838\u5FC3\u53CA\u5176\u4ED6\u7528\u9014\u9808\u53E6\u7559\u6B63\u9762\u7A4D\uFF0C\u4E0D\u5F97\u5168\u90E8\u8996\u70BA\u505C\u8ECA\u53EF\u7528\u7BC4\u570D");
    if (totalGround > groundCap + 1e-3) errors.push("\u5730\u9762\u7121\u969C\u7919\u8ECA\u4F4D\u3001\u901A\u8DEF\u3001\u7B49\u5019\u3001\u6A5F\u9053\u53CA\u5176\u4ED6\u7528\u9014\u8D85\u904E\u672C\u6B21\u5730\u9762\u914D\u7F6E\u9762\u7A4D\u4E0A\u9650");
    conditions.push(`\u5730\u9762\u5FC5\u8981\u7121\u969C\u7919${groundAccessible}\u4F4D\uFF1A\u8ECA\u683C\u53CA\u8ECA\u9053${stallAndAisle.toFixed(2)}\u33A1\uFF0B\u7368\u7ACB\u901A\u8DEF${routeArea.toFixed(2)}\u33A1\uFF08${g.routeWidth}m\xD7${g.routeLength}m\uFF09\uFF1B\u7B49\u5019${waitingArea.toFixed(2)}\u33A1\u3001\u6A5F\u9053${shaftArea.toFixed(2)}\u33A1\u3001\u9580\u5EF3\u6838\u5FC3\u7B49${g.otherArea.toFixed(2)}\u33A1\u5206\u5217\uFF0C\u5408\u8A08${totalGround.toFixed(2)}\u33A1\uFF0F\u5730\u9762\u914D\u7F6E\u4E0A\u9650${groundCap.toFixed(2)}\u33A1\u3002\u50C5\u901A\u904E\u9762\u7A4D\u9810\u7B97\uFF0C\u8ECA\u683C3.5\xD76m\u3001\u4E0B\u8ECA\u5340\u3001\u9023\u7E8C\u901A\u8DEF\u53CA\u8F49\u5411\u4ECD\u9808\u6392\u4F4D\u5716\u78BA\u8A8D\u3002`);
  }
  if (groundArea + waitingArea + shaftArea > c.site + 1e-3) errors.push("\u5730\u9762\u505C\u8ECA\u3001\u5347\u964D\u6A5F\u9053\u53CA\u7B49\u5019\u7A7A\u9593\u5DF2\u8D85\u904E\u57FA\u5730\u9762\u7A4D");
  const groundReview = groundAccessible > 0 ? { cars: groundCars, accessible: groundAccessible, stallAndAisle, routeArea, routeWidth: g.routeWidth, routeLength: g.routeLength, waitingArea, shaftArea, otherArea: g.otherArea, total: totalGround, cap: groundCap, vehicleReserved: groundArea + waitingArea + shaftArea } : void 0;
  const warehouse = s.mechanical && s.mechanicalType === "warehouse";
  if (warehouse && (!(s.warehouseAisleWidth > 0) || !(s.warehouseTransferArea > 0) || !(s.warehouseEquipmentArea > 0))) errors.push("\u5009\u5132\u5F0F\u9808\u586B\u642C\u904B\u901A\u9053\u3001\u51FA\u5165\u5EAB\u53CA\u8A2D\u5099\u7A7A\u9593\u5047\u8A2D\uFF1B\u672A\u63D0\u4F9B\u4E0D\u5F97\u8996\u70BA0");
  if (warehouse) conditions.push(`\u5009\u5132\u5F0F\u9762\u7A4D\u521D\u4F30\uFF1A\u81EA\u52D5\u642C\u904B\u901A\u9053${s.warehouseAisleWidth}m\u3001\u6BCF\u5C64\u51FA\u5165\u5EAB\u5E73\u53F0${s.warehouseTransferArea}\u33A1\u53CA\u8A2D\u5099\u7DAD\u4FEE\u7A7A\u9593${s.warehouseEquipmentArea}\u33A1\uFF0C\u6BCF\u5132\u4F4D${s.mechanicalWidth}\xD7${s.mechanicalLength}m\u3001\u6BCF\u6C34\u5E73\u5132\u4F4D${s.mechanicalSpaces}\u5C64\u3002\u4EE5\u4E0A\u70BA\u516C\u958B\u8A66\u7B97\u5047\u8A2D\uFF0C\u4E26\u975E\u6CD5\u5B9A\u56FA\u5B9A\u5C3A\u5BF8\u6216\u672C\u6848\u8A2D\u5099\u5716\uFF1B\u4E0D\u5957\u7528\u99D5\u8ECA\u9032\u5165\u76846m\u505C\u8ECA\u8D70\u9053\u3002\u8A2D\u5099\u5E73\u53F0\u4E0D\u81EA\u52D5\u7576\u6210\u65B0\u589E\u5EFA\u7BC9\u6A13\u677F\uFF0C\u7368\u7ACB\u7D50\u69CB\u5C64\u53E6\u4F9D\u5716\u8AAA\u6838\u8A08\u3002`);
  if (s.mechanical) {
    if (s.mechanicalSpaces < 2 || s.mechanicalSpaces > 6 || s.mechanicalWidth < 2.5 || s.mechanicalLength < 5.5 || s.mechanicalClearHeight < 1.8) errors.push("\u672C\u6A21\u578B\u6A5F\u68B0\u6A21\u7D44\u98082\u81F36\u4F4D\uFF0C\u55AE\u6C34\u5E73\u4F4D\u7F6E\u5BEC\u81F3\u5C112.5m\u3001\u95775.5m\u3001\u6BCF\u8ECA\u6DE8\u9AD8\u81F3\u5C111.8m");
    if (s.mechanicalHeight < s.mechanicalSpaces * s.mechanicalClearHeight || c.height - s.overhead + s.pit < s.mechanicalHeight) errors.push("\u6A5F\u68B0\u505C\u8ECA\u5C64\u9AD8\u3001\u6881\u4E0B\u7A7A\u9593\u53CA\u6A5F\u5751\u6DF1\u5EA6\u4E0D\u8DB3\u8A2D\u5099\u7E3D\u9AD8\u5EA6\u5047\u8A2D");
    conditions.push("\u6A5F\u68B0\u8A2D\u5099\u63A1\u4E0D\u8F09\u4EBA\u904B\u8F49\uFF1B\u672C\u6B21\u7E3D\u9AD8\u5EA6\u3001\u6A5F\u5751\u3001\u7D50\u69CB\u3001\u64CD\u4F5C\u7A7A\u9593\u8207\u5EE0\u724C\u5747\u70BA\u898F\u5283\u5047\u8A2D\uFF0C\u9808\u4F9D\u8A2D\u5099\u5716\u53CA\u5B89\u5168\u6AA2\u67E5\u8986\u6838\u3002");
  }
  if (!c.taipei && c.review) {
    if (s.allocation === "distributed" && s.localReview !== "confirmed") errors.push("\u65B0\u5317\u8DE8\u5C64\u914D\u7F6E\u6A5F\u8ECA\u6216\u81EA\u884C\u8ECA\u9808\u5148\u63D0\u4F9B\u500B\u6848\u5BE9\u8B70\u540C\u610F\u53CA\u4F86\u6E90");
    if (s.allocation === "distributed") conditions.push("\u65B0\u5317\u90FD\u5BE9\u7B2C4\u9EDE\u898F\u5B9A\u6A5F\u8ECA\u96C6\u4E2DB1\uFF0C\u81EA\u884C\u8ECA\u9650\u5730\u9762\u5BA4\u5167\u6216B1\uFF1B\u672C\u6B21\u8DE8\u5C64\u914D\u7F6E\u9808\u53E6\u6709\u500B\u6848\u5BE9\u8B70\u4F9D\u64DA\uFF0C\u4E0D\u8996\u70BA\u5DF2\u7B26\u5408\u3002");
    if (c.reviewRequired && (s.mechanical || s.access === "lift")) {
      if (!(Number(c.danger) > 0 && c.site < 1500 && Number(c.bonusPercent) < 50)) errors.push("\u65B0\u5317\u5BB9\u79FB\u539F\u5247\u63A1\u5761\u9053\u5E73\u9762\uFF1B\u672C\u4F8B\u5916\u9808\u5371\u8001\u3001\u57FA\u5730\u5C0F\u65BC1500\u33A1\u3001\u7533\u8ACB\u5BB9\u7A4D\u672A\u9054\u57FA\u6E961.5\u500D");
      conditions.push("\u65B0\u5317\u90FD\u5BE9\u7B2C5\u9EDE\u5371\u8001\u5BB9\u79FB\u4F8B\u5916\u4ECD\u9808\u90FD\u8A2D\u6703\u53CA\u4EA4\u901A\u5F71\u97FF\u8A55\u4F30\u5BE9\u67E5\u540C\u610F\uFF1B\u5371\u8001\u4E0D\u7B49\u65BC\u90FD\u66F4\u5BE9\u8B70\u6240\u7A31\u5371\u96AA\u5EFA\u7BC9\u7269\u3002");
      const points = Number(s.tdrPoints), factor = s.access === "lift" ? 0.25 : 0.5;
      if (s.tdrPoints.trim() && (!Number.isFinite(points) || points < 0 || c.extra < 0)) errors.push("\u63A5\u53D7\u57FA\u5730\u7A4D\u5206\u7121\u6548");
      if (!s.tdrPoints.trim()) conditions.push(`\u63A5\u53D7\u57FA\u5730\u7A4D\u5206\u672A\u586B\uFF0C\u5BB9\u79FB\u984D\u5EA6\u5C1A\u672A\u78BA\u8A8D\uFF1B${s.access === "lift" ? "\u6A5F\u68B0\u5347\u964D\u4EE5\u7A4D\u520625%" : "\u5761\u9053\u4EE5\u7A4D\u520650%"}\u70BA\u672C\u4F8B\u5916\u4E0A\u9650\uFF0C\u4E0D\u80FD\u76F4\u63A5\u8996\u70BA\u57FA\u6E96\u5BB9\u7A4D\u767E\u5206\u6BD4\u3002`);
      else if (Number(c.tdrPercent) > points * factor + 1e-6) errors.push("\u5BB9\u79FB\u76EE\u6A19\u8D85\u904E\u6240\u586B\u63A5\u53D7\u57FA\u5730\u7A4D\u5206\u4F9D\u672C\u4F8B\u5916\u63DB\u7B97\u7684\u4E0A\u9650");
      else notes.push(`\u65B0\u5317\u4F8B\u5916\u5BB9\u79FB\u4E0A\u9650\u9808\u7531\u63A5\u53D7\u57FA\u5730\u7A4D\u5206${points}\xD7${factor}\u6838\u5C0D\uFF0C\u975E\u4E00\u822C\u5BB9\u79FB\u4E0A\u9650\u3002`);
    }
  }
  if (s.localReview === "unknown") conditions.push("\u5730\u65B9\u90FD\u5E02\u8A08\u756B\u3001\u90FD\u5BE9\u53CA\u8A2D\u5099\u9069\u7528\u6027\u672A\u78BA\u8A8D\uFF0C\u672C\u6B21\u9644\u689D\u4EF6\u521D\u4F30\uFF0C\u4E0D\u8868\u793A\u5DF2\u53D6\u5F97\u63A1\u7528\u8CC7\u683C\u3002");
  if (c.taipei && groundCars > c.accessible) conditions.push("\u81FA\u5317\u5730\u9762\u5C64\u4EE5\u4E0A\u5BA4\u5167\u505C\u8ECA\u9664\u7121\u969C\u7919\u7B49\u4F8B\u5916\uFF0C\u9808\u6838\u57FA\u5730450\u33A1\u4EE5\u4E0B\u53CA\u4E00\u908A\u672A\u905418m\u7B49\u689D\u4EF6\u3001\u5BA4\u5167\u5408\u8A08250\u33A1\u53CA\u5340\u5283\u900F\u7A7A\u8981\u6C42\uFF1B\u4E0D\u5F97\u7528\u5730\u9762\u8ECA\u4F4D\u6578\u76F4\u63A5\u8A8D\u5B9A\u53EF\u8A2D\u3002");
  if (c.taipei) conditions.push("\u81FA\u5317\u63A1\u571F\u7BA186-1\u689D\u505C\u8ECA\u6578\u91CF\uFF0C\u6A5F\u8ECA\u683C0.9\xD72.2m\u3001\u6A5F\u8ECA\u901A\u9053\u81F3\u5C111.2m\u53CA\u5BA2\u8CA8\u5347\u964D\u6A5F\u6DE8\u5BEC1.2m\xD7\u6DF12.4m\uFF1B\u90FD\u5E02\u8A08\u756B\u3001\u90FD\u5BE9\u53CA\u90FD\u66F4\u500B\u6848\u689D\u4EF6\u4ECD\u9808\u8986\u6838\uFF0C\u4E0D\u5957\u7528\u65B0\u5317\u5371\u8001\u5BB9\u79FB\u4F8B\u5916\u3002");
  conditions.push("\u5730\u9762\u505C\u8ECA\u3001\u7B49\u5019\u3001\u6A5F\u9053\u8207\u9580\u5EF3\uFF0F\u9000\u7E2E\uFF0F\u7DA0\u5316\u4E0D\u5F97\u91CD\u758A\uFF0C\u5C1A\u672A\u5B8C\u6210\u5730\u9762\u914D\u7F6E\uFF1B\u5730\u9762\u9810\u7559\u53EA\u4F5C\u65E2\u6709\u5730\u4E0A\u6A13\u677F\u7528\u9014\u5206\u914D\uFF0C\u4E0D\u984D\u5916\u589E\u52A0\u7E3D\u6A13\u677F\u3002");
  if (errors.length) return empty();
  const mechanicalLimit = Math.max(0, c.requested - groundCars - Math.max(0, c.accessible - groundCars));
  const automaticMechanical = s.mechanical && s.targetMechanical === 0;
  if (automaticMechanical && mechanicalLimit > 1e3) {
    errors.push("\u81EA\u52D5\u6A5F\u68B0\u914D\u7F6E\u9700\u6C42\u8D85\u51FA1000\u4F4D\u6A21\u578B\u4E0A\u9650\uFF0C\u9808\u53E6\u505A\u5C08\u6848\u914D\u7F6E");
    return empty();
  }
  const fixedMechanical = s.mechanical ? Math.min(s.targetMechanical, mechanicalLimit) : 0;
  const moduleArea = s.mechanicalWidth * (s.mechanicalLength + (warehouse ? s.warehouseAisleWidth / 2 : c.carModule / 2.5 - 5.5));
  const accessArea = s.access === "lift" ? s.shaftWidth * s.shaftLength * s.liftCount + s.landingArea + s.twoWheelLiftArea : c.rampArea;
  function simulate(floors2, mechanicalTarget) {
    let motos = c.motos, bikes = c.bikes, mechanical = mechanicalTarget, flat = c.requested - groundCars - mechanicalTarget, accessibleLeft = Math.max(0, c.accessible - groundCars);
    const rows = [];
    const quantityFloors = [];
    let capacity = groundCars, mechanicalArea = 0, warehouseArea = 0, flatArea = 0, equipmentArea = 0, lossArea = 0, spareArea = 0;
    for (let j = 0; j < floors2; j++) {
      const plate = s.floorPlates?.[j] ?? c.plate, eq = c.quantityEquipment?.[j] ?? c.quantityEquipment?.[c.quantityEquipment.length - 1] ?? plate * c.reserve / 100;
      if (plate > c.plate + 1e-3 || plate <= 0 || eq + accessArea >= plate) return null;
      let usable = (plate - eq - accessArea) * (1 - c.loss), fixed = j === 0 ? c.community * c.carModule + c.bicycleLiftArea + c.motoAccessibleExtra : 0;
      const warehouseFixed = warehouse && mechanical > 0 ? s.warehouseTransferArea + s.warehouseEquipmentArea : 0;
      fixed += warehouseFixed;
      warehouseArea += warehouseFixed;
      if (fixed > usable) return null;
      usable -= fixed;
      const takeM = Math.min(motos, Math.floor((usable + 1e-6) / c.motoModule));
      usable -= takeM * c.motoModule;
      motos -= takeM;
      const takeB = Math.min(bikes, Math.floor((usable + 1e-6) / c.motoModule));
      usable -= takeB * c.motoModule;
      bikes -= takeB;
      if (j === 0 && s.allocation === "b1" && (motos || bikes)) return null;
      const accessibleUnit = c.carModule + (c.accessible ? c.accessibleExtra / c.accessible : 0);
      const takeAccessible = Math.min(accessibleLeft, flat, Math.floor((usable + 1e-6) / accessibleUnit));
      usable -= takeAccessible * accessibleUnit;
      flat -= takeAccessible;
      accessibleLeft -= takeAccessible;
      const bays = Math.min(Math.ceil(mechanical / s.mechanicalSpaces), Math.floor((usable + 1e-6) / moduleArea));
      const takeMechanical = Math.min(mechanical, bays * s.mechanicalSpaces);
      mechanical -= takeMechanical;
      usable -= bays * moduleArea;
      const takeFlat = Math.min(flat, Math.floor((usable + 1e-6) / c.carModule));
      flat -= takeFlat;
      usable -= takeFlat * c.carModule;
      const carUse = bays * moduleArea + takeFlat * c.carModule + takeAccessible * accessibleUnit;
      fixed += takeM * c.motoModule + takeB * c.motoModule;
      const used = carUse + fixed, turn = used * c.loss / (1 - c.loss), necessary = eq + accessArea + used + turn;
      const shelterOnly = j === 0 ? Math.max(0, (c.minB1Area ?? 0) + accessArea + takeB * c.motoModule + c.community * c.carModule - necessary) : 0;
      const slab = necessary + shelterOnly;
      if (slab > plate + 1e-3) return null;
      const extra = Math.floor((plate - slab) * (1 - c.loss) / c.carModule);
      capacity += takeMechanical + takeFlat + takeAccessible + extra;
      mechanicalArea += bays * moduleArea;
      flatArea += takeFlat * c.carModule + takeAccessible * accessibleUnit;
      equipmentArea += eq + (j === 0 ? c.bicycleLiftArea : 0);
      lossArea += turn;
      spareArea += shelterOnly;
      rows.push({ label: `B${j + 1}`, flat: takeFlat + takeAccessible, mechanical: takeMechanical, motos: takeM, bikes: takeB, plate, used: slab, remaining: plate - slab });
      quantityFloors.push({ label: `B${j + 1}`, cars: takeMechanical + takeFlat + takeAccessible, equipment: eq + (j === 0 ? c.bicycleLiftArea : 0), ramp: accessArea, fixed: fixed - (j === 0 ? c.bicycleLiftArea : 0), loss: turn, slab, shelterOnly });
    }
    if (motos || bikes || mechanical || flat || accessibleLeft) return null;
    const cars = c.requested, basement = quantityFloors.reduce((a, r) => a + r.slab, 0), rampTotal = accessArea * floors2;
    mechanicalArea += warehouseArea;
    const carArea = flatArea + mechanicalArea, motoArea = c.motos * c.motoModule + c.motoAccessibleExtra, bikeArea = c.bikes * c.motoModule, communityArea = c.community * c.carModule;
    const parkingArea = carArea + motoArea + bikeArea + communityArea + rampTotal + lossArea;
    const smallSite = { status: s.localReview === "confirmed" ? "documented" : "conditional", access: s.access, rows, groundArea, waitingArea, groundReview, conditions };
    return { smallSite, quantityFloors, flatCars: cars - mechanicalTarget, mechanicalCars: mechanicalTarget, mechanicalArea, undergroundFlatCars: cars - groundCars - mechanicalTarget, groundCars, cars, capacity, floors: floors2, neededFloors: floors2, basement, carArea, motoArea, bikeArea, communityArea, parkingArea, basementCommon: basement - parkingArea, equipmentArea, rampTotal, lossArea, spareArea, b1Capacity: rows[0].flat + rows[0].mechanical, otherCapacity: rows.length > 1 ? Math.min(...rows.slice(1).map((r) => r.flat + r.mechanical)) : 0 };
  }
  function fit(floors2) {
    if (!automaticMechanical) return simulate(floors2, fixedMechanical);
    for (let count = 0; count <= mechanicalLimit; count++) {
      const found = simulate(floors2, count);
      if (found) return found;
    }
    return null;
  }
  let needed;
  for (let f7 = 1; f7 <= 30; f7++) {
    if (s.floorPlates && f7 > s.floorPlates.length) break;
    if (fit(f7)) {
      needed = f7;
      break;
    }
  }
  if (needed === void 0) {
    errors.push("30\u5C64\u641C\u5C0B\u7BC4\u570D\u5167\u4ECD\u7121\u6CD5\u914D\u7F6E\uFF1B\u8ACB\u6838\u5C0DB1\u3001\u8A2D\u5099\u3001\u4EA4\u901A\u65B9\u5F0F\u53CA\u9010\u5C64\u9762\u7A4D\uFF0C\u4E0D\u4EE3\u8868\u57FA\u5730\u7121\u6CD5\u958B\u767C");
    return empty(true);
  }
  const floors = c.mode === "auto" ? needed : c.floors;
  if (!Number.isInteger(floors) || floors < 1 || floors > 30) {
    errors.push("\u5206\u5C64\u914D\u7F6E\u5730\u4E0B\u5C64\u6578\u98081\u81F330\u5C64");
    return empty();
  }
  const values = fit(floors);
  if (!values) {
    errors.push(`\u76EE\u524D\u5730\u4E0B${floors}\u5C64\u4E0D\u8DB3\uFF1B\u540C\u4E00\u914D\u7F6E\u81F3\u5C11\u9700${needed}\u5C64`);
    return empty(true);
  }
  values.neededFloors = needed;
  if (automaticMechanical) notes.push(`\u6A5F\u68B0\u8ECA\u4F4D\u4F9D\u9700\u6C42\u641C\u5C0B\uFF1A\u5148\u8A66\u5E73\u9762\uFF0C\u518D\u4EE5\u5730\u4E0B${floors}\u5C64\u6240\u9700\u7684\u6700\u5C11\u6A5F\u68B0\u8ECA\u4F4D${values.mechanicalCars}\u4F4D\u914D\u7F6E\uFF1B\u6A5F\u68B0\u6578\u91CF\u4E0D\u662F\u9810\u8A2D8\u4F4D\u3002`);
  if (s.mechanical && s.targetMechanical > values.mechanicalCars) notes.push("\u6A5F\u68B0\u76EE\u6A19\u8D85\u904E\u7E3D\u9700\u6C42\u6642\u50C5\u63A1\u9700\u6C42\u6578\uFF0C\u672A\u5C07\u672A\u63A1\u7528\u8ECA\u4F4D\u5217\u70BA\u5BE6\u8A2D\u3002");
  if (c.loss === 0) notes.push("\u67F1\u7DB2\u8F49\u5411\u984D\u5916\u9810\u7559\u70BA0\uFF0C\u4ECD\u9808\u6392\u4F4D\u5716\u8986\u6838\u3002");
  notes.push("\u6F5B\u5728\u5BB9\u91CF\u4F9D\u53EF\u958B\u6316\u7BC4\u570D\u4F30\u7B97\uFF1B\u672A\u63A1\u7528\u7684\u589E\u8A2D\u8ECA\u4F4D\u9808\u64F4\u589E\u6A13\u677F\u4E26\u91CD\u7B97\u5BB9\u7A4D\uFF0C\u4E0D\u80FD\u628A\u6F5B\u5728\u5BB9\u91CF\u7576\u6210\u76EE\u524D\u5DF2\u8208\u5EFA\u5BB9\u91CF\u3002", ...conditions, `\u5730\u4E0B\u5206\u5C64\u9762\u7A4D\u4F9D\u5BE6\u969B\u63A1\u7528\u7684\u8A2D\u5099\u3001\u52D5\u7DDA\u3001\u6C7D\u6A5F\u8ECA\u53CA\u907F\u96E3\u88DC\u8DB3\u52A0\u7E3D\uFF1B\u958B\u6316\u4E0A\u9650\u4E0D\u76F4\u63A5\u7576\u4F5C\u6BCF\u5C64\u5BE6\u969B\u6A13\u677F\u3002${c.mode === "auto" ? `\u81EA\u52D5\u641C\u5C0B\u63A1\u5730\u4E0B${floors}\u5C64\u3002` : "\u5730\u4E0B\u5C64\u6578\u4F9D\u8F38\u5165\u56FA\u5B9A\u3002"}\u672A\u63A1\u7528\u5269\u9918\u9762\u7A4D\u4E0D\u5217\u8ECA\u4F4D\u3001\u4E0D\u589E\u52A0\u6A13\u677F\u3002`);
  return { errors, notes, values, capacityFailure: false };
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/basementDemand.ts
var BASEMENT_DEMAND_VERSION = "basement-demand.2026-10-19.v1";
var defaultBasementDemand = (district = "") => ({ version: BASEMENT_DEMAND_VERSION, enabled: true, mechanicalType: "stacked", rule: /新北/.test(district) ? "ntpc_general" : /臺北|台北/.test(district) ? "taipei_general" : "documented", source: "", maxFloors: "30", allowAlternatives: true });
var isBasementDemand = (x) => !!x && typeof x === "object" && x.version === BASEMENT_DEMAND_VERSION && typeof x.enabled === "boolean" && (x.mechanicalType === void 0 || ["stacked", "warehouse"].includes(x.mechanicalType)) && ["documented", "ntpc_general", "taipei_general", "nangang_general", "nangang_rebuild"].includes(x.rule) && (x.stricterCap === void 0 || typeof x.stricterCap === "string") && (x.stricterSource === void 0 || typeof x.stricterSource === "string") && (x.taipeiPlanUnspecified === void 0 || typeof x.taipeiPlanUnspecified === "boolean") && (x.taipeiZone === void 0 || ["res12", "res34", "commercial", "industrial", "protected", "public", "other"].includes(x.taipeiZone)) && ["source", "maxFloors"].every((k) => typeof x[k] === "string") && typeof x.allowAlternatives === "boolean" && (x.warehouse === void 0 || ["aisleWidth", "transferArea", "equipmentArea", "levels", "equipmentHeight"].every((k) => Number.isFinite(x.warehouse[k]) && x.warehouse[k] >= 0));
var TAIPEI_EXCAVATION_URL = "https://udd.gov.taipei/assets/j833suRePSa6ofJ4QPJdtR/attachs/112%E5%B9%B4%E5%BA%A6%E9%83%BD%E5%AF%A9%E5%AF%A9%E8%AD%B0%E5%8F%83%E8%80%83%E7%AF%84%E4%BE%8B%E6%9A%A8%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A0%85-1120801%E5%8C%97%E5%B8%82%E9%83%BD%E8%A8%AD%E5%AD%97%E7%AC%AC11230514161%E8%99%9F.pdf";
var TAIPEI_EXCAVATION_SOURCE = "\u81FA\u5317\u5E02112\u5E748\u67081\u65E5\u5317\u5E02\u90FD\u8A2D\u5B57\u7B2C11230514161\u865F\uFF0C\u90FD\u5BE9\u5BE9\u8B70\u53C3\u8003\u7BC4\u4F8B\u4E00\uFF08\u56DB\uFF097\uFF1B\u90FD\u5E02\u8A08\u756B\u672A\u53E6\u5B9A\u5730\u4E0B\u958B\u6316\u898F\u6A21\u8005\uFF1A" + TAIPEI_EXCAVATION_URL;
var NTPC_EXCAVATION_SOURCE = "\u90FD\u5E02\u8A08\u756B\u6CD5\u65B0\u5317\u5E02\u65BD\u884C\u7D30\u5247\u7B2C37\u689D\uFF08114\u5E7411\u67085\u65E5\u4FEE\u6B63\uFF09\uFF1Ahttps://web.law.ntpc.gov.tw/Scripts/FLAWDOC01.aspx?fcode=C0150108&flno=37";
var NANGANG_EXCAVATION_SOURCE = "112\u5E743\u67086\u65E5\u5E9C\u6388\u90FD\u898F\u5B57\u7B2C1123012167\u865F\u51FD\uFF0F\u5357\u6E2F\u901A\u6AA2\u5730\u4E0B\u958B\u6316\u7387\u898F\u5B9A\u7C21\u5316\u539F\u5247\uFF1Ahttps://laws.gov.taipei/law/File/0000336021";
function resolveExcavationLimit(i) {
  const d = i.basementDemand, errors = [], notes = [];
  let cap = Number(i.excavationCap), source = i.excavationReference.trim();
  if (d.rule === "ntpc_general") {
    const site = Number(i.site), coverage = Number(i.coverage);
    if (!/新北/.test(i.parkingDesign?.district ?? "")) errors.push("\u65B0\u5317\u4E00\u822C\u958B\u6316\u898F\u5247\u9069\u7528\u65B0\u5317\u5E02\uFF0C\u8ACB\u5207\u63DB\u57FA\u5730\u5730\u5340\u6216\u9078\u64C7\u500B\u6848\u898F\u5B9A\u3002");
    if (!i.site.trim() || !Number.isFinite(site) || site <= 0 || !i.coverage.trim() || !Number.isFinite(coverage) || coverage <= 0 || coverage > 100) errors.push("\u8ACB\u586B\u5BEB\u6709\u6548\u57FA\u5730\u9762\u7A4D\u8207\u6CD5\u5B9A\u5EFA\u853D\u7387\u3002");
    const generalCap = site > 0 ? Math.min(100, coverage + (Math.min(site, 500) * 0.2 + Math.max(site - 500, 0) * 0.1) / site * 100) : 0;
    cap = generalCap;
    source = NTPC_EXCAVATION_SOURCE;
    if (d.stricterCap?.trim()) {
      const stricter = Number(d.stricterCap);
      if (!Number.isFinite(stricter) || stricter <= 0 || stricter > generalCap) errors.push("\u8F03\u56B4\u683C\u958B\u6316\u7387\u9808\u5927\u65BC0\u4E14\u4E0D\u8D85\u904E\u4E00\u822C\u6CD5\u898F\u4E0A\u9650\uFF1B\u7279\u6B8A\u8A08\u756B\u6216\u6838\u51C6\u653E\u5BEC\u8ACB\u6539\u9078\u500B\u6848\u898F\u5B9A\u3002");
      if (!d.stricterSource?.trim()) errors.push("\u8ACB\u586B\u5BEB\u8F03\u56B4\u683C\u958B\u6316\u7387\u7684\u90FD\u5E02\u8A08\u756B\u4F86\u6E90\u3002");
      if (Number.isFinite(stricter) && stricter > 0) cap = Math.min(generalCap, stricter);
      source += "\uFF1B\u500B\u6848\u90FD\u5E02\u8A08\u756B\uFF1A" + (d.stricterSource?.trim() ?? "");
    }
    notes.push(`\u65B0\u5317\u4E00\u822C\u6CD5\u898F\u4E0A\u9650${generalCap.toFixed(4)}%\uFF1B\u524D500\u33A1\u52A020\u500B\u767E\u5206\u9EDE\u3001\u8D85\u904E\u90E8\u5206\u52A010\u500B\u767E\u5206\u9EDE\u5F8C\u6309\u9762\u7A4D\u52A0\u6B0A\uFF0C\u672C\u6B21\u63A1${cap.toFixed(4)}%\u3002`);
  } else if (d.rule === "taipei_general") {
    if (!/臺北|台北/.test(i.parkingDesign?.district ?? "")) errors.push("\u81FA\u5317\u5E02\u90FD\u5BE9\u958B\u6316\u898F\u5247\u9069\u7528\u81FA\u5317\u5E02\uFF0C\u8ACB\u5207\u63DB\u57FA\u5730\u5730\u5340\u3002");
    if (d.taipeiPlanUnspecified !== true) errors.push("\u8ACB\u78BA\u8A8D\u90FD\u5E02\u8A08\u756B\u662F\u5426\u53E6\u8A02\u5730\u4E0B\u958B\u6316\u898F\u5B9A\uFF1B\u5DF2\u6709\u898F\u5B9A\u6642\uFF0C\u8ACB\u9078\u64C7\u500B\u6848\u6216\u5730\u5340\u898F\u5247\u3002");
    if (!["res12", "res34", "commercial", "industrial", "protected", "public", "other"].includes(d.taipeiZone ?? "")) errors.push("\u8ACB\u9078\u64C7\u5730\u4E0B\u958B\u6316\u9069\u7528\u5206\u5340\u3002");
    const coverage = Number(i.coverage);
    cap = d.taipeiZone === "res12" ? 50 : d.taipeiZone === "res34" || d.taipeiZone === "industrial" ? 70 : d.taipeiZone === "commercial" ? 80 : d.taipeiZone === "protected" || d.taipeiZone === "public" ? Math.min(100, coverage + 10) : d.taipeiZone === "other" ? 60 : 0;
    if ((d.taipeiZone === "protected" || d.taipeiZone === "public") && (!i.coverage.trim() || !Number.isFinite(coverage) || coverage <= 0 || coverage > 100)) errors.push("\u8ACB\u586B\u5BEB\u6709\u6548\u6CD5\u5B9A\u5EFA\u853D\u7387\u3002");
    source = TAIPEI_EXCAVATION_SOURCE;
    notes.push(`\u81FA\u5317\u5E02\u90FD\u5E02\u8A08\u756B\u672A\u53E6\u8A02\u5730\u4E0B\u958B\u6316\u898F\u6A21\uFF0C\u4F9D\u672C\u6B21\u6240\u9078\u5206\u5340\u63A1\u90FD\u5BE9\u53C3\u8003\u4E0A\u9650${cap}%\u3002`);
  } else if (d.rule === "nangang_general" || d.rule === "nangang_rebuild") {
    if (!/臺北|台北/.test(i.parkingDesign?.district ?? "") || !i.parkingDesign?.district.includes("\u5357\u6E2F")) errors.push("\u5357\u6E2F\u901A\u6AA2\u898F\u5247\u53EA\u9069\u7528\u81FA\u5317\u5E02\u5357\u6E2F\u5340\uFF0C\u8ACB\u6838\u5C0D\u57FA\u5730\u884C\u653F\u5340");
    const a = i.regulatoryReview?.bonusAssessment;
    const activeAward = a?.awardBasis === "permitted" ? Number(a.permittedAward?.awardSqm) > 0 : Number(a?.route === "danger" ? i.danger : a?.route === "renewal" ? i.renewal : Math.max(Number(i.danger), Number(i.renewal))) > 0;
    if (d.rule === "nangang_general" && activeAward) errors.push("\u5DF2\u63A1\u90FD\u66F4\uFF0F\u5371\u8001\u734E\u52F5\uFF0C\u4E0D\u80FD\u6CBF\u7528\u5357\u6E2F\u4E00\u822C\u91CD\u5EFA\u958B\u6316\u898F\u5247\uFF1B\u8ACB\u6838\u5C0D\u91CD\u5EFA\u985E\u5225\u53CA\u5206\u5340\u6216\u500B\u6848\u6838\u51C6\u8CC7\u6599");
    if (d.rule === "nangang_rebuild") {
      if (!["renewal", "danger", "chloride"].includes(d.rebuildKind ?? "") || !["res2", "res34", "commercial", "industrial"].includes(d.zone ?? "") || !d.source.trim()) errors.push("\u5357\u6E2F\u90FD\u66F4\uFF0F\u5371\u8001\uFF0F\u9AD8\u6C2F\u6848\u4EF6\u9808\u660E\u793A\u91CD\u5EFA\u985E\u5225\u3001\u4F7F\u7528\u5206\u5340\u53CA\u8CC7\u683C\u4F86\u6E90\uFF1B\u4E0D\u5F9E\u5BB9\u79FB\u63A8\u5B9A");
      if (activeAward && a?.route !== d.rebuildKind) errors.push("\u5357\u6E2F\u958B\u6316\u91CD\u5EFA\u985E\u5225\u8207\u63A1\u7528\u7684\u734E\u52F5\u8DEF\u5F91\u4E0D\u4E00\u81F4");
      cap = d.zone === "res2" ? Number(i.site) <= 1e3 ? 60 : 50 : d.zone === "res34" ? Number(i.site) <= 1e3 ? 70 : 60 : d.zone === "commercial" ? 80 : d.zone === "industrial" ? 70 : 0;
    } else cap = Math.min(100, Number(i.coverage) + 10);
    source = NANGANG_EXCAVATION_SOURCE + (d.rule === "nangang_rebuild" ? `\uFF1B\u8CC7\u683C\u4F86\u6E90\uFF1A${d.source}` : "");
    notes.push(d.rule === "nangang_rebuild" ? `\u672C\u6B21\u6309\u5357\u6E2F${d.rebuildKind}\uFF0F${d.zone}\u53CA\u57FA\u5730\u898F\u6A21\u63A1${cap}%\u4E0A\u9650\uFF1B\u500B\u5225\u90FD\u5E02\u8A08\u756B\u512A\u5148\u3001\u653E\u5BEC\u53E6\u6838\u3002` : "\u672C\u6B21\u6309\u5357\u6E2F\u4E00\u822C\u91CD\u5EFA\u3001\u672A\u53E6\u6709\u500B\u5225\u8A08\u756B\u6216\u653E\u5BEC\u6838\u51C6\u4E4B\u689D\u4EF6\u6AA2\u8A0E\uFF1B\u4E0D\u4EE5\u6B77\u53F2\u5EFA\u7269\u5BB9\u79FB\u8996\u70BA\u90FD\u66F4\uFF0F\u5371\u8001\u8CC7\u683C\u3002\u500B\u5225\u90FD\u5E02\u8A08\u756B\u3001\u5C71\u5761\u5730\u53CA\u6838\u51C6\u653E\u5BEC\u4ECD\u9808\u6838\u5C0D\u3002");
  } else if (!i.excavationCap.trim() || !Number.isFinite(cap) || cap <= 0 || cap > 100 || !source) errors.push("\u4F9D\u9700\u6C42\u6AA2\u8A0E\u9808\u5148\u586B\u500B\u6848\u958B\u6316\u7387\u4E0A\u9650\u53CA\u6CD5\u898F\uFF0F\u57FA\u5730\u8CC7\u6599\u4F86\u6E90\uFF1B\u4E0D\u81EA\u52D5\u595760%\u621680%");
  const maxFloors = Number(d.maxFloors);
  if (!Number.isInteger(maxFloors) || maxFloors < 1 || maxFloors > 30) errors.push("\u5730\u4E0B\u5C64\u6578\u641C\u5C0B\u7BC4\u570D\u98081\u81F330\u5C64\uFF1B\u6B64\u70BA\u8A66\u7B97\u7BC4\u570D\uFF0C\u975E\u6CD5\u5B9A\u53EF\u958B\u6316\u6DF1\u5EA6");
  return { cap, source, maxFloors, errors, notes };
}
function calculateDemandBasement(i, run) {
  const limit = resolveExcavationLimit(i), plain = { ...i, basementDemand: void 0 };
  if (limit.errors.length) return { ...run({ ...plain, excavation: "60" }), values: null, errors: limit.errors, notes: limit.notes };
  if (i.parkingDesign?.fillRemaining) return { ...run(plain), values: null, errors: ["\u9700\u6C42\u641C\u5C0B\u4E0D\u81EA\u52D5\u63A1\u7528\u5C1A\u672A\u8208\u5EFA\u7684\u5269\u9918\u5BB9\u91CF\uFF1B\u8ACB\u6539\u586B\u6307\u5B9A\u589E\u8A2D\u8ECA\u4F4D\uFF0C\u6216\u53D6\u6D88\u5168\u90E8\u63A1\u7528\u9078\u9805"] };
  const q = { ...i.quantityReserve, basementEquipmentMode: "named" };
  const modes = [{ name: "\u5761\u9053\u5E73\u9762", access: "ramp", mechanical: false }];
  if (i.basementDemand.allowAlternatives) {
    modes.push({ name: i.basementDemand?.mechanicalType === "warehouse" ? "\u5761\u9053\u5009\u5132\u5F0F" : "\u5761\u9053\u6A5F\u68B0", access: "ramp", mechanical: true });
    if (Number(i.site) < 1500) modes.push({ name: "\u5347\u964D\u6A5F\u5E73\u9762", access: "lift", mechanical: false }, { name: i.basementDemand?.mechanicalType === "warehouse" ? "\u5347\u964D\u6A5F\u5009\u5132\u5F0F" : "\u5347\u964D\u6A5F\u6A5F\u68B0", access: "lift", mechanical: true });
  }
  const trials = [], candidates = [];
  for (const [rank, mode] of modes.entries()) {
    const small = { ...defaultSmallSiteParking(), ...i.parkingDesign?.smallSite, ...i.basementDemand?.warehouse ? { warehouseAisleWidth: i.basementDemand.warehouse.aisleWidth, warehouseTransferArea: i.basementDemand.warehouse.transferArea, warehouseEquipmentArea: i.basementDemand.warehouse.equipmentArea, mechanicalSpaces: i.basementDemand.warehouse.levels, mechanicalHeight: i.basementDemand.warehouse.equipmentHeight } : {}, mechanicalType: i.basementDemand?.mechanicalType ?? "stacked", access: mode.access, mechanical: mode.mechanical, accessibleRoute: i.parkingDesign?.smallSite?.accessibleRoute ?? "ground" };
    const height = mode.mechanical ? Math.max(Number(i.parkingDesign.floorHeight), small.mechanicalHeight + small.overhead - small.pit) : Number(i.parkingDesign.floorHeight);
    let lastErrors = [];
    for (let f7 = 1; f7 <= limit.maxFloors; f7++) {
      const candidate = { ...plain, quantityReserve: q, basementMode: "manual", basementFloors: String(f7), excavation: String(limit.cap), excavationCap: String(limit.cap), excavationReference: limit.source, parkingDesign: { ...i.parkingDesign, rampWidthMode: "statutory", fullVolumeSearch: true, smallSite: small, fillRemaining: false, floorHeight: String(Math.round(height * 100) / 100) } };
      const result = run(candidate);
      lastErrors = result.errors;
      if (result.values && !result.errors.length && result.values.unused <= result.values.allowed * (1 - Number(i.volumeUse) / 100) + 0.02) {
        candidates.push({ input: candidate, result, rank, name: mode.name });
        trials.push({ mode: mode.name, floors: f7, cars: result.values.cars, mechanical: result.parking?.values?.mechanicalCars ?? 0, errors: [] });
        break;
      }
      if (f7 === limit.maxFloors) trials.push({ mode: mode.name, floors: null, cars: null, mechanical: null, errors: [...new Set(lastErrors)] });
    }
  }
  candidates.sort((a, b) => a.result.values.floors - b.result.values.floors || (a.result.parking?.values?.mechanicalCars ?? 0) - (b.result.parking?.values?.mechanicalCars ?? 0) || a.rank - b.rank);
  const selected = candidates[0];
  if (!selected) return { ...run({ ...plain, excavation: String(limit.cap) }), values: null, errors: ["\u5728\u76EE\u524D\u57FA\u5730\u958B\u6316\u7BC4\u570D\u3001\u8A2D\u5099\u5C3A\u5BF8\u8207\u641C\u5C0B\u5C64\u6578\u5167\uFF0C\u6C92\u6709\u5B8C\u6210\u505C\u8ECA\u53CA\u5BB9\u7A4D\u6AA2\u6838\u7684\u65B9\u6848\uFF1B\u8ACB\u6AA2\u67E5\u500B\u6848\u9650\u5236\u53CA\u5177\u540D\u5FC5\u8981\u7A7A\u9593\u3002", ...new Set(trials.flatMap((t) => t.errors))], notes: [...limit.notes, ...trials.map((t) => `${t.mode}\uFF1A${t.errors.join("\uFF1B")}`)] };
  const rows = selected.result.parking?.values?.quantityFloors ?? [], actualMaxPlate = Math.max(...rows.map((r) => r.slab)), actualExcavationPercent = actualMaxPlate / Number(i.site) * 100;
  const review = { resolved: { excavation: selected.input.excavation, excavationCap: selected.input.excavationCap, excavationReference: selected.input.excavationReference, basementFloors: selected.input.basementFloors, basementMode: selected.input.basementMode, parkingDesign: selected.input.parkingDesign, quantityReserve: selected.input.quantityReserve }, capPercent: limit.cap, source: limit.source, actualMaxPlate, actualExcavationPercent, mode: selected.name, trials };
  return { ...selected.result, basementDemandReview: review, notes: [...limit.notes, `\u5730\u4E0B\u9700\u6C42\u6AA2\u8A0E\uFF1A\u958B\u6316\u4E0A\u9650${limit.cap}%\uFF08${(Number(i.site) * limit.cap / 100).toFixed(2)}\u33A1\uFF09\uFF1B\u4F9D\u5FC5\u8981\u7A7A\u9593\u9010\u5C64\u52A0\u7E3D\uFF0C\u6700\u5927\u5BE6\u7528\u6A13\u677F${actualMaxPlate.toFixed(2)}\u33A1\uFF08${actualExcavationPercent.toFixed(2)}%\uFF09\uFF0C\u63A1${selected.name}\u3001\u5730\u4E0B${selected.result.values.floors}\u5C64\u3002`, ...trials.map((t) => `${t.mode}\uFF1A${t.floors === null ? "\u672C\u641C\u5C0B\u7BC4\u570D\u672A\u901A\u904E" : `\u81F3\u5C11\u5730\u4E0B${t.floors}\u5C64\u3001\u6C7D\u8ECA${t.cars}\u4F4D\u3001\u6A5F\u68B0${t.mechanical}\u4F4D`}\u3002`), "\u9078\u64C7\u9806\u5E8F\uFF1A\u5148\u6BD4\u8F03\u5761\u9053\u5E73\u9762\uFF0C\u6309\u5B8C\u6574\u9700\u6C42\u9078\u5730\u4E0B\u5C64\u6578\u8F03\u5C11\u8005\uFF1B\u540C\u5C64\u6578\u512A\u5148\u5C11\u6A5F\u68B0\u3001\u518D\u512A\u5148\u5761\u9053\u3002\u672A\u4F7F\u7528\u5EFA\u7167\u539F\u8ECA\u4F4D\u6216\u5730\u4E0B\u5C64\u6578\u4F5C\u76EE\u6A19\uFF1B\u7121\u5761\u9053\u65B9\u6848\u50C5\u4F8B\u5916\u7559\u5FC5\u8981\u5730\u9762\u7121\u969C\u7919\u8ECA\u4F4D\uFF0C\u5305\u542B\u65BC\u7E3D\u9700\u6C42\uFF1B\u4E0D\u589E\u52A0\u4E00\u822C\u5730\u9762\u505C\u8ECA\u3002", "\u672A\u53D6\u5F97\u5730\u8CEA\u3001\u65BD\u5DE5\u53CA\u5BE6\u969B\u5E73\u9762\u8CC7\u6599\uFF1B\u672C\u7D50\u679C\u70BA\u9762\u7A4D\u914D\u7F6E\u5019\u9078\uFF0C\u641C\u5C0B\u4E0A\u9650\u4E0D\u662F\u5DE5\u7A0B\u53EF\u884C\u6DF1\u5EA6\uFF0C\u5347\u964D\u6A5F\u53CA\u6A5F\u68B0\u8A2D\u5099\u5C64\u9AD8\u8207\u7121\u969C\u7919\u5BA2\u68AF\u901A\u8DEF\u4ECD\u9808\u5716\u8AAA\u8986\u6838\u3002", ...selected.result.notes] };
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/BasementDemandPanel.tsx
import { Fragment as Fragment3, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var f = (n) => n.toLocaleString("zh-TW", {
  maximumFractionDigits: 2
});
function BasementDemandPanel({
  input,
  result,
  edit
}) {
  const d = input.basementDemand ?? {
    ...defaultBasementDemand(input.parkingDesign?.district),
    enabled: false
  }, q = input.quantityReserve, review = result.basementDemandReview;
  const patch = (p) => edit({
    basementDemand: {
      ...d,
      ...p
    }
  });
  const warehouse = d.warehouse ?? {
    aisleWidth: 3,
    transferArea: 20,
    equipmentArea: 12,
    levels: 2,
    equipmentHeight: 4
  };
  const limit = d.enabled ? resolveExcavationLimit({
    ...input,
    basementDemand: d
  }) : null;
  return /* @__PURE__ */ jsxs3("section", { className: "area-review-panel basement-demand-panel", "aria-label": "\u5730\u4E0B\u9700\u6C42\u6AA2\u8A0E", children: [
    /* @__PURE__ */ jsx3("h3", { children: "\u4F9D\u57FA\u5730\u8207\u505C\u8ECA\u9700\u6C42\u6AA2\u8A0E\u5730\u4E0B\u5BA4" }),
    /* @__PURE__ */ jsxs3("div", { className: "planning-field-grid", children: [
      /* @__PURE__ */ jsxs3("label", { children: [
        /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u5730\u4E0B\u914D\u7F6E\u6AA2\u8A0E\u65B9\u5F0F" }),
        /* @__PURE__ */ jsxs3(PublicSelect3, { "aria-label": "\u5730\u4E0B\u914D\u7F6E\u6AA2\u8A0E\u65B9\u5F0F", value: input.basementDemand?.enabled ? "demand" : "fixed", onChange: (e) => patch({
          enabled: e.target.value === "demand"
        }), children: [
          /* @__PURE__ */ jsx3("option", { value: "demand", children: "\u4F9D\u57FA\u5730\u9650\u5236\u3001\u9700\u6C42\u8207\u66FF\u4EE3\u65B9\u5F0F\u641C\u5C0B" }),
          /* @__PURE__ */ jsx3("option", { value: "fixed", children: "\u81EA\u884C\u6307\u5B9A\u958B\u6316\u7BC4\u570D\u8207\u5730\u4E0B\u5C64\u6578" })
        ] })
      ] }),
      d.enabled && /* @__PURE__ */ jsxs3(Fragment3, { children: [
        /* @__PURE__ */ jsxs3("label", { children: [
          /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u57FA\u5730\u884C\u653F\u5340" }),
          /* @__PURE__ */ jsx3("input", { "aria-label": "\u57FA\u5730\u884C\u653F\u5340", value: input.parkingDesign?.district ?? "", onChange: (e) => edit({
            parkingDesign: {
              ...input.parkingDesign,
              district: e.target.value
            }
          }) })
        ] }),
        /* @__PURE__ */ jsxs3("label", { children: [
          /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u5730\u4E0B\u958B\u6316\u898F\u5247" }),
          /* @__PURE__ */ jsxs3(PublicSelect3, { "aria-label": "\u5730\u4E0B\u958B\u6316\u898F\u5247", value: d.rule, onChange: (e) => patch({
            rule: e.target.value
          }), children: [
            (/新北/.test(input.parkingDesign?.district ?? "") || d.rule === "ntpc_general") && /* @__PURE__ */ jsx3("option", { value: "ntpc_general", children: "\u65B0\u5317\u5E02\u4E00\u822C\u898F\u5B9A\uFF1A\u4F9D\u57FA\u5730\u9762\u7A4D\u81EA\u52D5\u8A08\u7B97" }),
            /* @__PURE__ */ jsx3("option", { value: "documented", children: "\u4F9D\u500B\u6848\u90FD\u5E02\u8A08\u756B\u3001\u7279\u6B8A\u8A08\u756B\u6216\u6838\u51C6\u8CC7\u6599" }),
            (/臺北|台北/.test(input.parkingDesign?.district ?? "") || d.rule.startsWith("nangang")) && /* @__PURE__ */ jsxs3(Fragment3, { children: [
              /* @__PURE__ */ jsx3("option", { value: "taipei_general", children: "\u81FA\u5317\u5E02\u90FD\u5BE9\u901A\u5247\uFF1A\u4F9D\u4F7F\u7528\u5206\u5340\u8A08\u7B97" }),
              /* @__PURE__ */ jsx3("option", { value: "nangang_general", children: "\u81FA\u5317\u5E02\u5357\u6E2F\u5340\uFF1A\u4E00\u822C\u91CD\u5EFA" }),
              /* @__PURE__ */ jsx3("option", { value: "nangang_rebuild", children: "\u81FA\u5317\u5E02\u5357\u6E2F\u5340\uFF1A\u90FD\u66F4\uFF0F\u5371\u8001\uFF0F\u9AD8\u6C2F\u6848\u4EF6" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    d.enabled && d.rule === "taipei_general" && /* @__PURE__ */ jsxs3(Fragment3, { children: [
      /* @__PURE__ */ jsxs3("div", { className: "planning-field-grid", children: [
        /* @__PURE__ */ jsxs3("label", { children: [
          /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u90FD\u5E02\u8A08\u756B\u958B\u6316\u898F\u5B9A" }),
          /* @__PURE__ */ jsxs3(PublicSelect3, { "aria-label": "\u90FD\u5E02\u8A08\u756B\u958B\u6316\u898F\u5B9A", value: d.taipeiPlanUnspecified ? "none" : "unknown", onChange: (e) => patch(e.target.value === "specific" ? {
            rule: "documented"
          } : {
            taipeiPlanUnspecified: e.target.value === "none"
          }), children: [
            /* @__PURE__ */ jsx3("option", { value: "unknown", children: "\u8ACB\u9078\u64C7\u9069\u7528\u689D\u4EF6" }),
            /* @__PURE__ */ jsx3("option", { value: "none", children: "\u90FD\u5E02\u8A08\u756B\u672A\u53E6\u5B9A\uFF0C\u63A1\u90FD\u5BE9\u53C3\u8003\u898F\u5B9A" }),
            /* @__PURE__ */ jsx3("option", { value: "specific", children: "\u90FD\u5E02\u8A08\u756B\u5DF2\u6709\u898F\u5B9A\uFF0C\u6539\u7528\u500B\u6848\u8CC7\u6599" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs3("label", { children: [
          /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u5730\u4E0B\u958B\u6316\u9069\u7528\u5206\u5340" }),
          /* @__PURE__ */ jsxs3(PublicSelect3, { "aria-label": "\u5730\u4E0B\u958B\u6316\u9069\u7528\u5206\u5340", value: d.taipeiZone ?? "", onChange: (e) => patch({
            taipeiZone: e.target.value
          }), children: [
            /* @__PURE__ */ jsx3("option", { value: "", children: "\u8ACB\u9078\u64C7\u4F7F\u7528\u5206\u5340" }),
            /* @__PURE__ */ jsx3("option", { value: "res12", children: "\u7B2C\u4E00\u3001\u4E8C\u7A2E\u4F4F\u5B85\u5340" }),
            /* @__PURE__ */ jsx3("option", { value: "res34", children: "\u7B2C\u4E09\u3001\u56DB\u7A2E\u4F4F\u5B85\u5340\u53CA\u52A0\u7D1A\u4F4F\u5B85\u7528\u5730" }),
            /* @__PURE__ */ jsx3("option", { value: "commercial", children: "\u5546\u696D\u5340\u53CA\u7279\u5B9A\u5C08\u7528\u5340\u5546\u696D\u7528\u5730" }),
            /* @__PURE__ */ jsx3("option", { value: "industrial", children: "\u7B2C\u4E00\u3001\u4E8C\u3001\u4E09\u7A2E\u5DE5\u696D\u5340" }),
            /* @__PURE__ */ jsx3("option", { value: "protected", children: "\u4FDD\u8B77\u5340\u3001\u8FB2\u696D\u5340\u3001\u98A8\u666F\u5340" }),
            /* @__PURE__ */ jsx3("option", { value: "public", children: "\u516C\u5171\u8A2D\u65BD\u7528\u5730" }),
            /* @__PURE__ */ jsx3("option", { value: "other", children: "\u5176\u4ED6\u4F7F\u7528\u5206\u5340" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx3("p", { children: "\u90FD\u5E02\u8A08\u756B\u5DF2\u6709\u958B\u6316\u898F\u5B9A\u6642\uFF0C\u9078\u64C7\u8A72\u5730\u5340\u898F\u5247\u6216\u500B\u6848\u8CC7\u6599\uFF1B\u5546\u7279\u5340\u53CA\u6566\u5316\u5357\u5317\u8DEF\u7279\u5B9A\u5C08\u7528\u5340\u4F9D\u539F\u4F7F\u7528\u5206\u5340\u6AA2\u8A0E\u3002" })
    ] }),
    d.enabled && d.rule === "nangang_rebuild" && /* @__PURE__ */ jsxs3("div", { className: "planning-field-grid", children: [
      /* @__PURE__ */ jsxs3("label", { children: [
        /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u5357\u6E2F\u91CD\u5EFA\u985E\u5225" }),
        /* @__PURE__ */ jsxs3(PublicSelect3, { "aria-label": "\u5357\u6E2F\u91CD\u5EFA\u985E\u5225", value: d.rebuildKind ?? "", onChange: (e) => patch({
          rebuildKind: e.target.value
        }), children: [
          /* @__PURE__ */ jsx3("option", { value: "", children: "\u8ACB\u9078\u64C7" }),
          /* @__PURE__ */ jsx3("option", { value: "renewal", children: "\u90FD\u5E02\u66F4\u65B0" }),
          /* @__PURE__ */ jsx3("option", { value: "danger", children: "\u5371\u8001\u91CD\u5EFA" }),
          /* @__PURE__ */ jsx3("option", { value: "chloride", children: "\u9AD8\u6C2F\u96E2\u5B50\u5EFA\u7BC9\u7269" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs3("label", { children: [
        /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u5357\u6E2F\u4F7F\u7528\u5206\u5340" }),
        /* @__PURE__ */ jsxs3(PublicSelect3, { "aria-label": "\u5357\u6E2F\u4F7F\u7528\u5206\u5340", value: d.zone ?? "", onChange: (e) => patch({
          zone: e.target.value
        }), children: [
          /* @__PURE__ */ jsx3("option", { value: "", children: "\u8ACB\u9078\u64C7" }),
          /* @__PURE__ */ jsx3("option", { value: "res2", children: "\u4F4F\u4E8C\u53CA\u52A0\u7D1A\u5730\u5340" }),
          /* @__PURE__ */ jsx3("option", { value: "res34", children: "\u4F4F\u4E09\uFF0F\u4F4F\u56DB\u53CA\u52A0\u7D1A\u5730\u5340" }),
          /* @__PURE__ */ jsx3("option", { value: "commercial", children: "\u5546\u696D\u5340" }),
          /* @__PURE__ */ jsx3("option", { value: "industrial", children: "\u5DE5\u696D\u5340" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs3("label", { children: [
        /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u91CD\u5EFA\u8CC7\u683C\u53CA\u5206\u5340\u8CC7\u6599\u4F86\u6E90" }),
        /* @__PURE__ */ jsx3("textarea", { "aria-label": "\u91CD\u5EFA\u8CC7\u683C\u53CA\u5206\u5340\u8CC7\u6599\u4F86\u6E90", value: d.source, onChange: (e) => patch({
          source: e.target.value
        }) })
      ] })
    ] }),
    d.enabled && /* @__PURE__ */ jsxs3(Fragment3, { children: [
      d.rule === "taipei_general" ? /* @__PURE__ */ jsxs3(Fragment3, { children: [
        /* @__PURE__ */ jsxs3("div", { className: "planning-field-grid", children: [
          /* @__PURE__ */ jsxs3("label", { children: [
            /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u6CD5\u898F\u958B\u6316\u7387\u4E0A\u9650%" }),
            /* @__PURE__ */ jsx3(PublicNumber3, { "aria-label": "\u6CD5\u898F\u958B\u6316\u7387\u4E0A\u9650%", type: "number", readOnly: true, value: d.taipeiZone && d.taipeiPlanUnspecified && Number.isFinite(limit?.cap) ? limit.cap : "" })
          ] }),
          /* @__PURE__ */ jsxs3("label", { children: [
            /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u6CD5\u898F\u4F86\u6E90" }),
            /* @__PURE__ */ jsx3("textarea", { "aria-label": "\u6CD5\u898F\u4F86\u6E90", readOnly: true, value: TAIPEI_EXCAVATION_SOURCE.split("\uFF1Ahttps")[0] })
          ] })
        ] }),
        /* @__PURE__ */ jsx3("p", { children: /* @__PURE__ */ jsx3("a", { href: TAIPEI_EXCAVATION_URL, target: "_blank", rel: "noreferrer", children: "\u81FA\u5317\u5E02\u90FD\u5BE9\u958B\u6316\u53C3\u8003\u898F\u5B9A" }) })
      ] }) : d.rule === "ntpc_general" ? /* @__PURE__ */ jsxs3(Fragment3, { children: [
        /* @__PURE__ */ jsxs3("div", { className: "planning-field-grid", children: [
          /* @__PURE__ */ jsxs3("label", { children: [
            /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u6CD5\u898F\u958B\u6316\u7387\u4E0A\u9650%" }),
            /* @__PURE__ */ jsx3(PublicNumber3, { "aria-label": "\u6CD5\u898F\u958B\u6316\u7387\u4E0A\u9650%", type: "number", readOnly: true, value: Number.isFinite(limit?.cap) ? Number(limit.cap.toFixed(2)) : "" })
          ] }),
          /* @__PURE__ */ jsxs3("label", { children: [
            /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u6CD5\u898F\u4F86\u6E90" }),
            /* @__PURE__ */ jsx3("textarea", { "aria-label": "\u6CD5\u898F\u4F86\u6E90", readOnly: true, value: NTPC_EXCAVATION_SOURCE })
          ] })
        ] }),
        /* @__PURE__ */ jsx3("p", { children: "\u4F9D\u57FA\u5730\u9762\u7A4D\u8207\u5EFA\u853D\u7387\u81EA\u52D5\u52A0\u6B0A\uFF1A\u524D500\u33A1\u52A020\u500B\u767E\u5206\u9EDE\uFF0C\u5176\u9918\u52A010\u500B\u767E\u5206\u9EDE\u3002\u65B0\u5E02\u93AE\u3001\u6377\u904B\u958B\u767C\u53CA\u6838\u51C6\u4F8B\u5916\uFF0C\u8ACB\u9078\u64C7\u500B\u6848\u898F\u5B9A\u3002" }),
        /* @__PURE__ */ jsxs3("details", { children: [
          /* @__PURE__ */ jsx3("summary", { children: "\u500B\u6848\u90FD\u5E02\u8A08\u756B\u8F03\u56B4\u683C\u898F\u5B9A" }),
          /* @__PURE__ */ jsxs3("div", { className: "planning-field-grid", children: [
            /* @__PURE__ */ jsxs3("label", { children: [
              /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u8F03\u56B4\u683C\u958B\u6316\u7387\u4E0A\u9650%" }),
              /* @__PURE__ */ jsx3(PublicNumber3, { "aria-label": "\u8F03\u56B4\u683C\u958B\u6316\u7387\u4E0A\u9650%", type: "number", min: "0", max: "100", step: "any", value: d.stricterCap ?? "", onChange: (e) => patch({
                stricterCap: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxs3("label", { children: [
              /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u500B\u6848\u90FD\u5E02\u8A08\u756B\u4F86\u6E90" }),
              /* @__PURE__ */ jsx3("textarea", { "aria-label": "\u500B\u6848\u90FD\u5E02\u8A08\u756B\u4F86\u6E90", value: d.stricterSource ?? "", onChange: (e) => patch({
                stricterSource: e.target.value
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx3("p", { children: "\u7559\u767D\u4F9D\u4E00\u822C\u898F\u5B9A\uFF1B\u586B\u5165\u8F03\u4F4E\u4E0A\u9650\u6642\uFF0C\u63A1\u500B\u6848\u898F\u5B9A\u8A08\u7B97\u3002" })
        ] })
      ] }) : d.rule === "documented" ? /* @__PURE__ */ jsxs3("div", { className: "planning-field-grid", children: [
        /* @__PURE__ */ jsxs3("label", { children: [
          /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u500B\u6848\u958B\u6316\u7387\u4E0A\u9650%" }),
          /* @__PURE__ */ jsx3(PublicNumber3, { "aria-label": "\u500B\u6848\u958B\u6316\u7387\u4E0A\u9650%", type: "number", min: "0", max: "100", value: input.excavationCap, onChange: (e) => edit({
            excavationCap: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxs3("label", { children: [
          /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u958B\u6316\u9650\u5236\u8CC7\u6599\u4F86\u6E90" }),
          /* @__PURE__ */ jsx3("textarea", { "aria-label": "\u958B\u6316\u9650\u5236\u8CC7\u6599\u4F86\u6E90", value: input.excavationReference, onChange: (e) => edit({
            excavationReference: e.target.value
          }) })
        ] })
      ] }) : /* @__PURE__ */ jsxs3("p", { children: [
        "\u672C\u6B21\u958B\u6316\u7387\u4E0A\u9650",
        f(limit?.cap ?? 0),
        "%\u3002",
        d.rule === "nangang_general" ? "\u9069\u7528\u5357\u6E2F\u4E00\u822C\u91CD\u5EFA\u3002" : "\u4F9D\u6240\u9078\u91CD\u5EFA\u8CC7\u683C\u3001\u5206\u5340\u8207\u57FA\u5730\u898F\u6A21\u6AA2\u8A0E\u3002",
        "\u500B\u5225\u90FD\u5E02\u8A08\u756B\u512A\u5148\uFF0C\u5C71\u5761\u5730\u6216\u653E\u5BEC\u6838\u51C6\u53E6\u6838\u3002",
        /* @__PURE__ */ jsx3("a", { href: "https://laws.gov.taipei/law/File/0000336021", children: "\u5357\u6E2F\u958B\u6316\u898F\u5247" }),
        /* @__PURE__ */ jsx3("span", { className: "sr-only", children: NANGANG_EXCAVATION_SOURCE })
      ] }),
      /* @__PURE__ */ jsxs3("label", { className: "planning-checkbox", children: [
        /* @__PURE__ */ jsx3("input", { type: "checkbox", checked: d.allowAlternatives, onChange: (e) => patch({
          allowAlternatives: e.target.checked
        }) }),
        "\u6BD4\u8F03\u6C7D\u8ECA\u5347\u964D\u6A5F\u8207\u6A5F\u68B0\u505C\u8ECA\uFF1B\u7121\u969C\u7919\u8ECA\u4F4D\u4F8B\u5916\u7559\u5730\u9762"
      ] }),
      /* @__PURE__ */ jsxs3("label", { children: [
        /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u6A5F\u68B0\u505C\u8ECA\u8A2D\u5099\u985E\u578B" }),
        /* @__PURE__ */ jsxs3(PublicSelect3, { "aria-label": "\u6A5F\u68B0\u505C\u8ECA\u8A2D\u5099\u985E\u578B", value: d.mechanicalType ?? "stacked", onChange: (e) => patch({
          mechanicalType: e.target.value
        }), children: [
          /* @__PURE__ */ jsx3("option", { value: "stacked", children: "\u5806\u758A\u6A21\u7D44\u5F0F" }),
          /* @__PURE__ */ jsx3("option", { value: "warehouse", children: "\u5009\u5132\u5F0F\u81EA\u52D5\u505C\u8ECA\uFF08\u8A2D\u5099\u5C3A\u5BF8\u5047\u8A2D\uFF09" })
        ] })
      ] }),
      d.mechanicalType === "warehouse" && /* @__PURE__ */ jsxs3("details", { open: true, children: [
        /* @__PURE__ */ jsx3("summary", { children: "\u5009\u5132\u5F0F\u8A2D\u5099\u5C3A\u5BF8\u5047\u8A2D" }),
        /* @__PURE__ */ jsx3("p", { children: "\u642C\u904B\u901A\u9053\u8207\u51FA\u5165\u5EAB\u5C3A\u5BF8\u4F9D\u6240\u9078\u8A2D\u5099\u8A2D\u5B9A\u3002\u8ACB\u4F9D\u8A2D\u5099\u898F\u683C\u8ABF\u6574\u5C3A\u5BF8\uFF1B\u8A2D\u5099\u53E6\u8A2D\u7D50\u69CB\u6A13\u677F\u6642\uFF0C\u4E00\u4F75\u8A08\u5165\u7E3D\u6A13\u5730\u677F\u6AA2\u8A0E\u3002" }),
        /* @__PURE__ */ jsx3("div", { className: "planning-field-grid", children: [["aisleWidth", "\u5009\u5132\u642C\u904B\u901A\u9053\u5BEC\u5EA6m"], ["transferArea", "\u6BCF\u5C64\u5009\u5132\u51FA\u5165\u5EAB\u5E73\u53F0\u33A1"], ["equipmentArea", "\u6BCF\u5C64\u5009\u5132\u8A2D\u5099\u7DAD\u4FEE\u7A7A\u9593\u33A1"], ["levels", "\u5009\u5132\u5782\u76F4\u5132\u8ECA\u5C64\u6578"], ["equipmentHeight", "\u5009\u5132\u8A2D\u5099\u7E3D\u9AD8\u5EA6m"]].map(([key, label]) => /* @__PURE__ */ jsxs3("label", { children: [
          /* @__PURE__ */ jsx3(FieldLabel3, { children: label }),
          /* @__PURE__ */ jsx3(PublicNumber3, { "aria-label": label, type: "number", min: "0", step: "any", value: warehouse[key], onChange: (e) => patch({
            warehouse: {
              ...warehouse,
              [key]: Number(e.target.value)
            }
          }) })
        ] }, key)) })
      ] }),
      /* @__PURE__ */ jsxs3("details", { children: [
        /* @__PURE__ */ jsx3("summary", { children: "\u8A2D\u5099\u3001\u52D5\u7DDA\u8207\u641C\u5C0B\u7BC4\u570D" }),
        /* @__PURE__ */ jsx3("p", { children: "\u4F9D\u6838\u5FC3\u3001\u8A2D\u5099\u623F\u8207\u8A2D\u5099\u5C3A\u5BF8\u9810\u7559\u5404\u5C64\u9762\u7A4D\u3002\u5347\u964D\u6A5F\u65B9\u6848\u9808\u53E6\u7559\u5730\u9762\u7121\u969C\u7919\u8ECA\u4F4D\u53CA\u9023\u7E8C\u901A\u8DEF\uFF1B\u6A5F\u68B0\u5C64\u9AD8\u4F9D\u6240\u9078\u8A2D\u5099\u9AD8\u5EA6\u3001\u6881\u53CA\u6A5F\u5751\u689D\u4EF6\u6AA2\u67E5\u3002" }),
        /* @__PURE__ */ jsxs3("div", { className: "planning-field-grid", children: [
          /* @__PURE__ */ jsxs3("label", { children: [
            /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u5730\u4E0B\u5C64\u6578\u641C\u5C0B\u4E0A\u9650" }),
            /* @__PURE__ */ jsx3(PublicNumber3, { "aria-label": "\u5730\u4E0B\u5C64\u6578\u641C\u5C0B\u4E0A\u9650", type: "number", min: "1", max: "30", value: d.maxFloors, onChange: (e) => patch({
              maxFloors: e.target.value
            }) })
          ] }),
          q && /* @__PURE__ */ jsxs3(Fragment3, { children: [
            /* @__PURE__ */ jsxs3("label", { children: [
              /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u6BCF\u5C64\u5730\u4E0B\u6838\u5FC3\u57FA\u6E96\u9810\u7559\u33A1\uFF082\u5EA7\u96FB\u68AF\u53C3\u8003\uFF09" }),
              /* @__PURE__ */ jsx3(PublicNumber3, { "aria-label": "\u6BCF\u5C64\u5730\u4E0B\u6838\u5FC3\u57FA\u6E96\u9810\u7559\u33A1\uFF082\u5EA7\u96FB\u68AF\u53C3\u8003\uFF09", type: "number", min: "0", step: "any", value: q.basementCorePerFloor ?? 54, onChange: (e) => edit({
                quantityReserve: {
                  ...q,
                  basementCorePerFloor: Number(e.target.value)
                }
              }) })
            ] }),
            /* @__PURE__ */ jsxs3("label", { children: [
              /* @__PURE__ */ jsx3(FieldLabel3, { children: "\u5404\u5C64\u8A2D\u5099\u623F\u9810\u7559\u33A1" }),
              /* @__PURE__ */ jsx3("input", { "aria-label": "\u5404\u5C64\u8A2D\u5099\u623F\u9810\u7559\u33A1", value: q.basementRooms.join(","), onChange: (e) => edit({
                quantityReserve: {
                  ...q,
                  basementRooms: e.target.value.split(",").map(Number)
                }
              }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs3("p", { children: [
          "\u641C\u5C0B\u5C64\u6578\u53EF\u4F9D\u5730\u8CEA\u3001\u5730\u4E0B\u7BA1\u7DDA\u3001\u9130\u623F\u53CA\u65BD\u5DE5\u689D\u4EF6\u8ABF\u6574\u3002\u8A2D\u5099\u623F\u7531B1\u8D77\u5217\uFF0C\u8D85\u904E\u8868\u5217\u5C64\u6578\u6CBF\u7528\u672B\u9805\uFF1B\u53EF\u4F9D\u8A2D\u5099\u9700\u6C42\u4FEE\u6B63\u3002\u672C\u6B21\u8F09\u4EBA\u96FB\u68AF",
          q ? quantityLiftSpaces(q).count : 2,
          "\u5EA7\uFF0C\u5730\u4E0B\u6BCF\u5C64\u6838\u5FC3",
          q ? quantityLiftSpaces(q).basementCore : 54,
          "\u33A1\uFF1B\u6C7D\u8ECA\u5347\u964D\u6A5F\u53E6\u8A08\u3002\u5730\u9762\u50C5\u4F8B\u5916\u7559\u5FC5\u8981\u7121\u969C\u7919\u8ECA\u4F4D\uFF0C\u4E26\u8207\u7B49\u5019\u5340\u3001\u5165\u53E3\u53CA\u8F49\u5411\u5206\u5225\u9810\u7559\uFF1B\u5BE6\u969B\u4F4D\u7F6E\u9808\u6392\u4F4D\u5716\u8986\u6838\u3002"
        ] })
      ] }),
      review && /* @__PURE__ */ jsxs3(Fragment3, { children: [
        /* @__PURE__ */ jsxs3("p", { children: [
          "\u63A1",
          review.mode,
          "\uFF0C\u5730\u4E0B",
          result.values?.floors,
          "\u5C64\u3001\u6BCF\u5C64\u9AD8\u5EA6",
          review.resolved.parkingDesign?.floorHeight,
          "m\uFF08\u542B\u672C\u6B21\u8A2D\u5099\u9AD8\u5EA6\u689D\u4EF6\u6AA2\u67E5\uFF09\u3002\u4E0A\u9650",
          f(review.capPercent),
          "%\uFF1B\u6700\u5927\u5FC5\u8981\u6A13\u677F",
          f(review.actualMaxPlate),
          "\u33A1\uFF0C\u76F8\u7576\u65BC\u57FA\u5730",
          f(review.actualExcavationPercent),
          "%\u3002\u672A\u4F7F\u7528\u90E8\u5206\u4E0D\u5217\u6A13\u677F\u3002"
        ] }),
        /* @__PURE__ */ jsx3("div", { className: "burden-table", children: /* @__PURE__ */ jsxs3("table", { children: [
          /* @__PURE__ */ jsx3("thead", { children: /* @__PURE__ */ jsxs3("tr", { children: [
            /* @__PURE__ */ jsx3("th", { children: "\u6BD4\u8F03\u65B9\u5F0F" }),
            /* @__PURE__ */ jsx3("th", { children: "\u6240\u9700\u5730\u4E0B\u5C64\u6578" }),
            /* @__PURE__ */ jsx3("th", { children: "\u6C7D\u8ECA\uFF0F\u6A5F\u68B0" })
          ] }) }),
          /* @__PURE__ */ jsx3("tbody", { children: review.trials.map((t) => /* @__PURE__ */ jsxs3("tr", { children: [
            /* @__PURE__ */ jsx3("th", { children: t.mode }),
            /* @__PURE__ */ jsx3("td", { children: t.floors === null ? "\u672C\u7BC4\u570D\u672A\u901A\u904E" : `${t.floors}\u5C64` }),
            /* @__PURE__ */ jsx3("td", { children: t.cars === null ? "\u5F85\u8ABF\u6574" : `${t.cars}\uFF0F${t.mechanical}\u4F4D` })
          ] }, t.mode)) })
        ] }) }),
        /* @__PURE__ */ jsx3("p", { children: "\u5148\u6BD4\u8F03\u5761\u9053\u5E73\u9762\uFF0C\u63A1\u901A\u904E\u6AA2\u6838\u4E14\u5730\u4E0B\u5C64\u6578\u8F03\u5C11\u8005\uFF1B\u540C\u5C64\u6578\u512A\u5148\u5C11\u6A5F\u68B0\u3001\u518D\u512A\u5148\u5761\u9053\u3002" })
      ] }),
      !review && limit?.errors.map((e) => /* @__PURE__ */ jsx3("p", { className: "planning-inline-error", children: e.replace("\u4F9D\u9700\u6C42\u6AA2\u8A0E\u9808\u5148\u586B\u500B\u6848\u958B\u6316\u7387\u4E0A\u9650\u53CA\u6CD5\u898F\uFF0F\u57FA\u5730\u8CC7\u6599\u4F86\u6E90\uFF1B\u4E0D\u81EA\u52D5\u595760%\u621680%", "\u8ACB\u586B\u5BEB\u500B\u6848\u958B\u6316\u7387\u4E0A\u9650\u53CA\u9069\u7528\u6CD5\u898F\u3002") }, e))
    ] })
  ] });
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/LegalParkingPanel.tsx
import { useEffect, useState } from "react";

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/planningAssumptions.ts
function discloseMissingPlanningInputs(input) {
  const defaults = { site: ["1000", "\u57FA\u5730\u9762\u7A4D\u672A\u63D0\u4F9B\uFF0C\u66AB\u4EE51,000\u33A1\u5EFA\u7ACB\u5047\u8A2D\u60C5\u5883\uFF0C\u4E26\u975E\u672C\u6848\u767B\u8A18\u9762\u7A4D"], coverage: ["50", "\u5EFA\u853D\u7387\u672A\u63D0\u4F9B\uFF0C\u66AB\u63A150%\uFF0C\u672A\u78BA\u8A8D\u571F\u7BA1"], far: ["300", "\u57FA\u6E96\u5BB9\u7A4D\u7387\u672A\u63D0\u4F9B\uFF0C\u66AB\u63A1300%\uFF0C\u672A\u78BA\u8A8D\u571F\u7BA1"], coverageUse: ["80", "\u5EFA\u7BC9\u9762\u7A4D\u4F7F\u7528\u7387\u66AB\u63A180%"], volumeUse: ["100", "\u5BB9\u7A4D\u4F7F\u7528\u76EE\u6A19\u66AB\u63A1100%"], equipment: ["0", "\u8A2D\u5099\u5148\u6309\u5177\u540D\u623F\u9593\u9700\u6C42\u914D\u7F6E\uFF0C\u4E0D\u4EE5\u514D\u8A08\u4E0A\u9650\u586B\u6EFF"], lobby: ["0", "\u7F3A\u68AF\u5EF3\u914D\u7F6E\u8CC7\u6599\uFF0C\u9762\u7A4D\u66AB\u4E0D\u589E\u52A0"], balcony: ["0", "\u7F3A\u967D\u53F0\u914D\u7F6E\u8CC7\u6599\uFF0C\u9762\u7A4D\u66AB\u4E0D\u589E\u52A0"], roofRate: ["0", "\u7F3A\u5C4B\u7A81\u914D\u7F6E\u8CC7\u6599\uFF0C\u9762\u7A4D\u66AB\u4E0D\u589E\u52A0"], roofFloors: ["0", "\u7F3A\u5C4B\u7A81\u914D\u7F6E\u8CC7\u6599\uFF0C\u66AB\u4E0D\u53E6\u589E\u5C4B\u7A81\u5C64"], roofHeight: ["3", "\u5C4B\u7A81\u5C64\u9AD8\u66AB\u63A13m"], unitPing: ["30", "\u6BCF\u6236\u5730\u4E0A\u5206\u6524\u9762\u7A4D\u66AB\u63A130\u576A"], excavation: ["60", "\u958B\u6316\u7387\u66AB\u63A160%\uFF0C\u672A\u78BA\u8A8D\u500B\u6848\u4E0A\u9650"], reserve: ["0", "\u8A2D\u5099\u68AF\u9593\u6539\u4F9D\u5177\u540D\u7A7A\u9593\u9810\u7559\uFF0C\u6C92\u6709\u901A\u7528\u6CD5\u5B9A\u6700\u4F4E\u516C\u8A2D\u6BD4\u4F8B"], basementFloors: ["4", "\u7F3A\u5730\u4E0B\u5C64\u6578\uFF0C\u5047\u8A2D\u56FA\u5B9A4\u5C64\u521D\u4F30\uFF1B\u4E0D\u81EA\u52D5\u589E\u52A0"], carPing: ["8", "\u6C7D\u8ECA\u4F4D\u542B\u8ECA\u9053\u66AB\u63A18\u576A\uFF0F\u4F4D\uFF0C\u672A\u7D93\u5E7E\u4F55\u6392\u4F4D"], motoSqm: ["2.75", "\u6A5F\u8ECA\u542B\u901A\u9053\u66AB\u63A12.75\u33A1\uFF0F\u4F4D"], carPerUnit: ["0", "\u4E0D\u53E6\u52A0\u5E02\u5834\u6C7D\u8ECA\u9700\u6C42\uFF0C\u6CD5\u5B9A\u9700\u6C42\u512A\u5148"], motoPerUnit: ["1", "\u6A5F\u8ECA\u66AB\u6309\u6BCF\u62361\u4F4D"], localParkingUnit: ["1", "\u5730\u65B9\u6BCF\u6236\u6C7D\u8ECA\u898F\u5247\u672A\u63D0\u4F9B\uFF0C\u66AB\u63091\u4F4D\u60C5\u5883"], basementSalePercent: ["100", "\u5730\u4E0B\u5177\u540D\u623F\u5C4B\u8A2D\u5099\u68AF\u9593\u6309100%\u623F\u5C4B\u670D\u52D9\u5047\u8A2D\uFF0C\u505C\u8ECA\u53E6\u5217"] };
  const next = { ...input };
  const notes = [];
  for (const [k, [value, note]] of Object.entries(defaults)) {
    if (typeof input[k] === "string" && !input[k].trim()) {
      next[k] = value;
      notes.push("\u660E\u793A\u5047\u8A2D\uFF1A" + note + "\u3002");
    }
  }
  for (const k of ["renewal", "scale", "tdr", "danger", "storePercent", "extraCars"]) if (!input[k]?.trim()) {
    next[k] = "0";
    notes.push(`\u660E\u793A\u5047\u8A2D\uFF1A${{ renewal: "\u90FD\u66F4\u734E\u52F5", scale: "\u898F\u6A21\u734E\u52F5", tdr: "\u5BB9\u7A4D\u79FB\u8F49", danger: "\u5371\u8001\u734E\u52F5", storePercent: "\u5E97\u8216\u914D\u7F6E", extraCars: "\u984D\u5916\u6C7D\u8ECA\u4F4D" }[k]}\u672A\u63D0\u4F9B\uFF0C\u66AB\u4E0D\u589E\u52A0\u3002`);
  }
  if (typeof input.reserve === "string" && !input.reserve.trim()) {
    const floors = Math.max(1, Number(next.basementFloors) || 4), site = Number(next.site) || 1e3, excavation = Number(next.excavation) || 60;
    const namedRooms = 24 + 48 + 64 + 64, coresPerFloor = 2 * (3 * 4.5 + 2 * 3 + 2.5 * 3), sqm2 = namedRooms + coresPerFloor * floors;
    next.reserve = String(Math.min(90, sqm2 / (site * excavation / 100 * floors) * 100));
    notes.push(`\u660E\u793A\u5047\u8A2D\uFF1A\u7121\u5730\u754C\u6642\u66AB\u6309\u8A2D\u5099\u623F24\uFF0B48\uFF0B64\uFF0B64\u33A1\u53CA\u6BCF\u5C64\u5169\u7D44\u68AF\u9593\u3001\u6392\u7159\u5BA4\u3001\u6607\u964D\u6A5F\u5171${coresPerFloor}\u33A1\u4F30\u5217${sqm2}\u33A1\uFF0C\u63DB\u7B97\u9810\u7559\u6BD4\u4F8B${Number(next.reserve).toFixed(2)}%\uFF1B\u4E0D\u662F\u6CD5\u5B9A\u6700\u4F4E\u516C\u8A2D\u6BD4\u4F8B\uFF0C\u4E5F\u672A\u9A57\u8B49\u6392\u4F4D\u3002`);
  }
  return { input: next, notes };
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/spatialTypes.ts
var SPATIAL_VERSION = "spatial-planning.2026-10-19.v1";
function isSpatialInput(v) {
  if (!v || typeof v !== "object") return false;
  const s = v;
  const shape = (x) => Array.isArray(x) && x.length > 0 && x.every((p) => Array.isArray(p) && p.length > 0 && p.every((r) => Array.isArray(r) && r.length >= 4 && r.every((a) => Array.isArray(a) && a.length === 2 && a.every(Number.isFinite))));
  return s.version === SPATIAL_VERSION && ["survey", "assumed"].includes(s.mode) && shape(s.boundary) && Array.isArray(s.parcels) && s.parcels.every((p) => typeof p.id === "string" && shape(p.geometry) && Number.isFinite(p.registeredArea)) && Array.isArray(s.edges) && s.edges.every((e) => e.a?.length === 2 && e.b?.length === 2 && [...e.a, ...e.b, e.aboveSetback, e.belowSetback].every(Number.isFinite) && e.aboveSetback >= 0 && e.belowSetback >= 0) && s.origin?.length === 2 && s.origin.every(Number.isFinite) && Number.isFinite(s.angle) && s.edges.length <= 2e3 && s.parcels.length <= 200 && s.assumptions && (s.assumptions.heightLimit === null || Number.isFinite(s.assumptions.heightLimit) && s.assumptions.heightLimit > 0) && s.assumptions.columnGrid >= 3 && s.assumptions.columnGrid <= 20 && s.assumptions.columnSize <= 2 && s.assumptions.excavationLimit <= 100 && s.assumptions.unitPing >= 10 && s.assumptions.unitPing <= 100 && s.assumptions.basementHeight >= 2 && s.assumptions.basementHeight <= 5 && ["floorHeight", "groundHeight", "basementHeight", "excavationLimit", "columnGrid", "columnSize", "unitPing"].every((k) => Number.isFinite(s.assumptions[k]) && s.assumptions[k] > 0);
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/spatialGeometry.ts
var import_polygon_clipping = __toESM(require_polygon_clipping_umd(), 1);
var polygon = (ring) => ring.length >= 3 ? [[ring]] : [];
var rectangle = (x, y, w, h) => w > 0 && h > 0 ? polygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]) : [];
function area(s) {
  return s.reduce((n, p) => n + p.reduce((t, r, j) => t + (j === 0 ? 1 : -1) * Math.abs(r.reduce((v, a, k) => {
    const b = r[(k + 1) % r.length];
    return v + a[0] * b[1] - b[0] * a[1];
  }, 0)) / 2, 0), 0);
}
var grid = (s) => s.map((p) => p.map((r) => r.map(([x, y]) => [Math.round(x * 1e5) / 1e5, Math.round(y * 1e5) / 1e5])));
var intersect = (a, b) => a.length && b.length ? import_polygon_clipping.default.intersection(grid(a), grid(b)) : [];
var difference = (a, ...b) => a.length ? import_polygon_clipping.default.difference(grid(a), ...b.filter((x) => x.length).map(grid)) : [];
var union = (...s) => {
  const a = s.filter((x) => x.length);
  return a.length ? import_polygon_clipping.default.union(grid(a[0]), ...a.slice(1).map(grid)) : [];
};
function bounds(s) {
  const p = s.flat(2);
  return { minX: Math.min(...p.map((x) => x[0])), maxX: Math.max(...p.map((x) => x[0])), minY: Math.min(...p.map((x) => x[1])), maxY: Math.max(...p.map((x) => x[1])) };
}
var contained = (s, inShape, tolerance = 5e-3) => area(difference(s, inShape)) <= tolerance;
function edgeBand(a, b, d) {
  if (d <= 0) return [];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  if (!len) return [];
  const nx = -dy / len * d, ny = dx / len * d;
  const body = polygon([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]);
  const circle = (p) => polygon(Array.from({ length: 33 }, (_, i) => [p[0] + d * Math.cos(i * Math.PI / 16), p[1] + d * Math.sin(i * Math.PI / 16)]));
  return union(body, circle(a), circle(b));
}
function takeArea(s, target) {
  if (area(s) <= target) return s;
  if (target <= 0) return [];
  const b = bounds(s);
  let lo = b.minX, hi = b.maxX;
  for (let k = 0; k < 36; k++) {
    const x = (lo + hi) / 2;
    if (area(intersect(s, rectangle(b.minX - 1, b.minY - 1, x - b.minX + 1, b.maxY - b.minY + 2))) > target) hi = x;
    else lo = x;
  }
  return intersect(s, rectangle(b.minX - 1, b.minY - 1, lo - b.minX + 1, b.maxY - b.minY + 2));
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/commonAllocationRules.ts
var COMMON_ALLOCATION_VERSION = "common-allocation.2026-10-18.v1";
var defaultCommonPolicy = () => ({ version: COMMON_ALLOCATION_VERSION, mode: "planning", motorcycle: "housing", bicycle: "housing", community: "housing", ramp: "proportional", source: "" });
function isCommonPolicy(x) {
  if (!x || typeof x !== "object") return false;
  const p = x;
  return p.version === COMMON_ALLOCATION_VERSION && ["planning", "documents"].includes(p.mode) && ["motorcycle", "bicycle", "community"].every((k) => ["housing", "parking", "pending"].includes(p[k])) && ["proportional", "housing", "parking", "pending"].includes(p.ramp) && typeof p.source === "string";
}
var commonAllocationSources = [
  ["\u5EFA\u6280\u898F\u5247162\u689D\uFF1A\u514D\u8A08\u8CC7\u683C", "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=162"],
  ["\u5EFA\u6280\u898F\u524759\u81F361\u689D\uFF1A\u8A2D\u7F6E\u3001\u5C3A\u5BF8\u8207\u8ECA\u9053", "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=60"],
  ["\u6C11\u6CD5799\u689D\uFF1A\u5171\u6709\u53CA\u61C9\u6709\u90E8\u5206", "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0000001&flno=799"],
  ["\u571F\u5730\u767B\u8A18\u898F\u524779\u300181\u689D\uFF1A\u5206\u914D\u6587\u4EF6\u8207\u5171\u6709\u767B\u8A18", "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0060003&flno=81"],
  ["\u65B0\u5317\u5E02\u90FD\u8A2D\u5BE9\u8B70\u539F\u5247\uFF1A\u6A5F\u8ECA\u3001\u81EA\u884C\u8ECA\u53CA\u793E\u5340\u8ECA\u4F4D", "https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150004"]
];
function resolveCommonPolicy(p, pools) {
  const motorcycleSqm = p.motorcycle === "housing" ? pools.motorcycleSqm : 0, bicycleSqm = p.bicycle === "housing" ? pools.bicycleSqm : 0, communitySqm = p.community === "housing" ? pools.communitySqm : 0;
  const housingServed = motorcycleSqm + bicycleSqm + communitySqm, allServed = pools.carArea + pools.motorcycleSqm + pools.bicycleSqm + pools.communitySqm;
  const rampRatio = p.ramp === "housing" ? 1 : p.ramp === "proportional" && allServed > 0 ? housingServed / allServed : 0;
  const sharedRampSqm = pools.sharedRampSqm * rampRatio;
  const pending = [p.motorcycle, p.bicycle, p.community, p.ramp].includes("pending");
  const needsDocuments = p.mode === "documents" && !p.source.trim();
  const notes = [p.mode === "planning" ? "\u5171\u6709\u5206\u6524\u901A\u5247\u521D\u4F30\uFF1A\u6A5F\u8ECA\u3001\u81EA\u884C\u8ECA\u3001\u793E\u5340\u8ECA\u4F4D\u6309\u6240\u9078\u670D\u52D9\u5C0D\u8C61\u6B78\u5217\uFF1B\u76EE\u524D\u5C6C\u898F\u5283\u5047\u8A2D\uFF0C\u672A\u6838\u5B9A\u767B\u8A18\u3002" : "\u5171\u6709\u5206\u6524\u6309\u5DF2\u8F38\u5165\u7684\u6587\u4EF6\u8207\u670D\u52D9\u5C0D\u8C61\u6AA2\u8A0E\uFF1B\u8F38\u5165\u4F86\u6E90\u4E0D\u4EE3\u8868\u767B\u8A18\u6A5F\u95DC\u5DF2\u6838\u5B9A\u3002"];
  if (p.ramp === "proportional") notes.push("\u5171\u7528\u5761\u9053\u6309\u670D\u52D9\u505C\u8ECA\u7A7A\u9593\u9762\u7A4D\u6BD4\u4F8B\u4F30\u5206\uFF1B\u9019\u662F\u898F\u5283\u65B9\u6CD5\uFF0C\u4E26\u975E\u6CD5\u5B9A\u56FA\u5B9A\u5206\u6524\u6BD4\u4F8B\uFF0C\u53D6\u5F97\u5206\u914D\u8868\u5F8C\u9808\u8986\u6838\u3002");
  if (pending || needsDocuments) notes.push("\u5171\u6709\u5206\u6524\u6709\u5F85\u78BA\u8A8D\u4E8B\u9805\uFF0C\u521D\u4F30\u6301\u7E8C\u8A08\u7B97\uFF1B\u6B63\u5F0F\u767B\u8A18\u9762\u7A4D\u9808\u5F85\u5206\u914D\u6587\u4EF6\u8986\u6838\u3002");
  return { allocation: { motorcycleSqm, bicycleSqm, communitySqm, sharedRampSqm, source: p.source || "App\u901A\u5247\u898F\u5283\u5047\u8A2D\uFF0C\u975E\u6838\u5B9A\u5206\u914D" }, rampRatio, notes, status: p.mode === "planning" ? "planning" : pending || needsDocuments ? "needs_documents" : "document_input" };
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/article162.ts
var AREA_REVIEW_VERSION = "article162.2026-10-18.v1";
function isAreaReview(x) {
  if (!x || typeof x !== "object") return false;
  const v = x;
  return v.version === AREA_REVIEW_VERSION && (v.commonPolicy === void 0 || isCommonPolicy(v.commonPolicy)) && (v.source === void 0 || typeof v.source === "string") && (v.floors === void 0 || Array.isArray(v.floors) && v.floors.length > 0 && v.floors.length <= 200 && v.floors.every((f7) => typeof f7.label === "string" && f7.label.trim() && ["floorArea", "equipment", "lobby", "balcony"].every((k) => Number.isFinite(f7[k]) && f7[k] >= 0) && (f7.equipmentEligible === void 0 || Number.isFinite(f7.equipmentEligible) && f7.equipmentEligible >= 0 && f7.equipmentEligible <= f7.equipment) && typeof f7.lobbyQualified === "boolean" && typeof f7.balconyQualified === "boolean")) && (v.registration === void 0 || ["equipmentPercent", "lobbyPercent", "roofPercent"].every((k) => {
    const n = v.registration[k];
    return Number.isFinite(n) && n >= 0 && n <= 100;
  }) && typeof v.registration.source === "string" && (v.registration.parkingAllocation === void 0 || ["motorcycleSqm", "bicycleSqm", "communitySqm", "sharedRampSqm"].every((k) => {
    const n = v.registration.parkingAllocation[k];
    return Number.isFinite(n) && n >= 0;
  }) && typeof v.registration.parkingAllocation.source === "string"));
}
function reviewFloor(f7, equipmentExempt) {
  const lobbyCap = f7.lobbyQualified ? f7.floorArea * 0.1 : 0, balconyCap = f7.balconyQualified ? f7.floorArea * 0.1 : 0, combinedCap = f7.floorArea * 0.15;
  const l = Math.min(f7.lobby, lobbyCap), b = Math.min(f7.balcony, balconyCap), factor = l + b > 0 ? Math.min(1, combinedCap / (l + b)) : 0;
  const lobbyExempt = l * factor, balconyExempt = b * factor;
  const counted = f7.floorArea + f7.balcony - equipmentExempt - lobbyExempt - balconyExempt;
  return { ...f7, lobbyCap, balconyCap, combinedCap, lobbyExempt, balconyExempt, equipmentExempt, counted, countedExtras: f7.equipment - equipmentExempt + f7.lobby - lobbyExempt + f7.balcony - balconyExempt };
}
function reviewAboveGround(c) {
  const errors = [];
  let inputs = c.review.floors;
  if (!inputs) {
    const l = c.lobbyRate / 100, b = c.balconyRate / 100;
    const unit = reviewFloor({ label: "\u6BD4\u4F8B\u6AA2\u6838", floorArea: 1, equipment: 0, lobby: l, balcony: b, lobbyQualified: c.lobbyQualified, balconyQualified: true }, 0);
    const denominator = 1 - unit.lobbyExempt + b - unit.balconyExempt;
    const total = (c.used + Math.min(c.equipment, c.equipmentCap)) / denominator;
    const count = Math.ceil(total / c.footprint);
    if (count > 200 || !Number.isFinite(count) || total <= 0) return { errors: ["\u5730\u4E0A\u914D\u7F6E\u8D85\u51FA200\u5C64\u898F\u5283\u6A21\u578B\u6216\u9762\u7A4D\u7121\u6548"], floors: [], floorArea: 0, equipment: 0, lobby: 0, balcony: 0, equipmentExempt: 0, lobbyExempt: 0, balconyExempt: 0, counted: 0, countedExtras: 0, ordinary: 0 };
    inputs = Array.from({ length: count }, (_, j) => {
      const area2 = Math.min(c.footprint, Math.max(0, total - j * c.footprint));
      return { label: `${j + 1}F`, floorArea: area2, equipment: c.equipment * area2 / total, lobby: area2 * l, balcony: area2 * b, lobbyQualified: c.lobbyQualified, balconyQualified: true };
    });
  }
  const equipment = inputs.reduce((t, f7) => t + f7.equipment, 0), eligible = inputs.reduce((t, f7) => t + (f7.equipmentEligible ?? f7.equipment), 0), factor = eligible > 0 ? Math.min(1, c.equipmentCap / eligible) : 0;
  const floors = inputs.map((f7) => reviewFloor(f7, (f7.equipmentEligible ?? f7.equipment) * factor));
  for (const f7 of floors) {
    if (f7.floorArea <= 0 || f7.equipment + f7.lobby > f7.floorArea + 1e-6) errors.push(`${f7.label}\u6A5F\u96FB\u8207\u68AF\u5EF3\u4E0D\u5F97\u5927\u65BC\u8A72\u5C64\u6A13\u5730\u677F`);
    if (f7.floorArea > c.footprint + 0.01) errors.push(`${f7.label}\u6A13\u677F\u8D85\u51FA\u898F\u5283\u5EFA\u7BC9\u9762\u7A4D\uFF0C\u9808\u8ABF\u6574\u914D\u7F6E`);
    if (f7.counted < -1e-6) errors.push(`${f7.label}\u514D\u8A08\u9762\u7A4D\u8D85\u51FA\u5BE6\u969B\u9762\u7A4D`);
  }
  const sum2 = (k) => floors.reduce((t, f7) => t + f7[k], 0);
  const counted = sum2("counted");
  if (counted > c.used + 0.02) errors.push("\u9010\u5C64\u8A08\u5BB9\u9762\u7A4D\u8D85\u51FA\u898F\u5283\u4F7F\u7528\u5BB9\u7A4D");
  return { errors, floors, floorArea: sum2("floorArea"), equipment, lobby: sum2("lobby"), balcony: sum2("balcony"), equipmentExempt: sum2("equipmentExempt"), lobbyExempt: sum2("lobbyExempt"), balconyExempt: sum2("balconyExempt"), counted, countedExtras: sum2("countedExtras"), ordinary: sum2("floorArea") - equipment - sum2("lobby") };
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/spatialPlanning.ts
var sum = (a, key) => a.reduce((t, s) => t + s[key], 0);
var group = (f7, use) => f7.flatMap((f8) => f8.spaces).filter((s) => use.includes(s.use));
var sqm = (s) => sum(s, "area");
var isCar = (s) => ["car", "accessible_car"].includes(s.use);
var equipmentUses = ["stair", "lift", "equipment", "roof_equipment"];
var EPS = 0.015;
function envelope(s, below, height = 0) {
  return difference(s.boundary, ...s.edges.map((e) => edgeBand(e.a, e.b, below ? e.belowSetback : Math.max(e.aboveSetback, e.roadWidth === null ? 0 : height / 3.6 - e.roadWidth / 2))));
}
function floor(id, plate, elevation, height) {
  return { id, plate, elevation, height, spaces: [], shelter: [], counted: 0, exempt: 0, houseRegistered: 0, parkingRegistered: 0, notes: [] };
}
function add(f7, label, use, shape, service = "housing", assumption = "\u5C3A\u5BF8\u8207\u7528\u9014\u70BA\u521D\u6B65\u914D\u7F6E\u5047\u8A2D\uFF1B\u4F9D\u6B63\u5F0F\u5716\u8AAA\u8986\u6838") {
  const geometry = difference(intersect(shape, f7.plate), ...f7.spaces.map((s) => s.geometry));
  const a = area(geometry);
  if (a < 1e-3) return;
  f7.spaces.push({ id: f7.id + "-" + f7.spaces.length, label, use, geometry, area: a, service, exempt: 0, counted: a, houseRegistered: service === "housing" ? a : 0, parkingRegistered: service === "parking" ? a : 0, legalBasis: "\u5C1A\u672A\u6AA2\u8A0E", assumption });
}
function totals(f7) {
  f7.counted = sum(f7.spaces, "counted");
  f7.exempt = sum(f7.spaces, "exempt");
  f7.houseRegistered = sum(f7.spaces, "houseRegistered");
  f7.parkingRegistered = sum(f7.spaces, "parkingRegistered");
}
function free(f7) {
  return difference(f7.plate, ...f7.spaces.map((s) => s.geometry));
}
function halfTurn(x, y, r, width, right) {
  const start = right ? -Math.PI / 2 : Math.PI / 2, sign = 1;
  const ring = [];
  for (let j = 0; j <= 40; j++) {
    const t = start + sign * j * Math.PI / 40;
    ring.push([x + (r + width / 2) * Math.cos(t), y + (r + width / 2) * Math.sin(t)]);
  }
  for (let j = 40; j >= 0; j--) {
    const t = start + sign * j * Math.PI / 40;
    ring.push([x + (r - width / 2) * Math.cos(t), y + (r - width / 2) * Math.sin(t)]);
  }
  ring.push(ring[0]);
  return polygon(ring);
}
function quarterTurn(x, y, r, w) {
  const ring = [];
  for (let j = 0; j <= 20; j++) {
    const t = Math.PI - j * Math.PI / 40;
    ring.push([x + (r + w / 2) * Math.cos(t), y + (r + w / 2) * Math.sin(t)]);
  }
  for (let j = 20; j >= 0; j--) {
    const t = Math.PI - j * Math.PI / 40;
    ring.push([x + (r - w / 2) * Math.cos(t), y + (r - w / 2) * Math.sin(t)]);
  }
  ring.push(ring[0]);
  return polygon(ring);
}
function findBasement(s, env, limit) {
  const b = bounds(env);
  let best = null;
  const width = 6, run = s.assumptions.basementHeight * 10, radius = 8.5, ground = envelope(s, false);
  for (let y = Math.ceil(b.minY + width / 2); y <= Math.min(b.minY + 12, b.maxY - 26); y += 0.5) {
    const bayY = y + radius * 2 - 8.8, aisleY = y + radius * 2;
    for (let x = Math.ceil(b.minX); x <= b.minX + 18; x += 1) {
      for (let length = Math.floor(b.maxX - x); length >= run + 22; length -= 1) {
        if (best && length <= best.length) break;
        const rampStart = x + 12, rampEnd = rampStart + run, bay = rectangle(x, bayY, length, 17.6);
        const ramp = rectangle(rampStart, y - width / 2, run, width);
        const buffer = rectangle(rampStart - 6, y - width / 2, 6, width);
        const turn = quarterTurn(rampStart - 6, y - 8.5, 8.5, width);
        const requiredTurn = intersect(turn, rectangle(b.minX - 100, 4, b.maxX - b.minX + 200, b.maxY + 100));
        const landTurn = intersect(turn, s.boundary);
        if (!contained(union(ramp, buffer), ground) || !contained(requiredTurn, s.boundary)) continue;
        const entrance = union(buffer, landTurn);
        const drive = union(rectangle(x, aisleY - 3, length, 6), halfTurn(rampStart, (y + aisleY) / 2, radius, width, false), halfTurn(rampEnd, (y + aisleY) / 2, radius, width, true));
        const plate = union(bay, ramp, drive);
        if (area(plate) > limit + EPS || !contained(plate, env)) continue;
        if (!best || length > best.length) best = { plate, bay, ramp, drive, entrance, x, y: bayY, length, aisleY, rampY: y, rampStart, rampEnd, width, radius };
        break;
      }
    }
  }
  return best;
}
function findAbove(env, maxArea, preferred) {
  let best = [];
  const b = bounds(env);
  for (let y = Math.ceil(Math.max(b.minY, preferred.y)); y <= Math.min(b.maxY - 12, preferred.y + 5, preferred.coreY - 5.5); y += 0.5) {
    for (let width = 20; width >= 12; width -= 1) {
      if (y + width > b.maxY || y + width < preferred.coreY + 1) continue;
      for (let x = Math.max(b.minX, preferred.x); x <= Math.min(b.minX + 20, preferred.x + 12); x += 1) {
        const end = Math.min(b.maxX, preferred.x + preferred.length);
        let lo = 0, hi = Math.min(end - x, maxArea / width);
        if (hi * width <= area(best)) continue;
        for (let j = 0; j < 12; j++) {
          const m = (lo + hi) / 2;
          if (contained(rectangle(x, y, m, width), env)) lo = m;
          else hi = m;
        }
        const r = rectangle(x, y, lo, width);
        if (area(r) > area(best)) best = r;
      }
    }
  }
  return best;
}
function buildSpatialPlanning(i) {
  const s = i.spatial;
  const check = [], warnings = [];
  const base = Number(i.site) * Number(i.far) / 100, bonus = resolveBonusLimits(i.regulatoryReview, { renewal: Number(i.renewal), scale: Number(i.scale), tdr: Number(i.tdr), danger: Number(i.danger) }, { site: Number(i.site), far: Number(i.far), district: i.parkingDesign?.district, tdrTarget: Number(i.tdr), roadConditions: i.roadConditions });
  const allowed = base * (1 + (bonus.renewal + bonus.tdr + bonus.scale + bonus.danger) / 100), target = allowed * Number(i.volumeUse) / 100, equipmentCap = allowed * (i.stair === "single" ? 0.1 : 0.15);
  const aboveEnvelope = envelope(s, false), belowEnvelope = envelope(s, true), limit = Number(i.site) * Math.min(Number(i.excavation), s.assumptions.excavationLimit) / 100;
  const layout = findBasement(s, belowEnvelope, limit);
  const fail = (detail) => ({ version: SPATIAL_VERSION, survey: s, aboveEnvelope, belowEnvelope, floors: [], checks: [{ label: "\u5730\u4E0B\u914D\u7F6E", status: "conflict", detail }], units: 0, legalCars: 0, cars: 0, motos: 0, bikes: 0, community: 0, unusedVolume: target, unbuiltBasement: limit * 4, warnings: [detail], converged: false });
  if (!layout) return { spatial: fail("B1\u81F3B4\u7684\u96D9\u6392\u8ECA\u4F4D\u30011:10\u5761\u9053\u53CA\u5167\u5074\u534A\u5F915.5m\u8FF4\u8F49\uFF0C\u7121\u6CD5\u7F6E\u5165\u76EE\u524D\u5730\u754C\uFF0F\u958B\u6316\u9650\u5236\uFF1B\u7DAD\u63014\u5C64\uFF0C\u9808\u8ABF\u6574\u914D\u7F6E\u3002"), bonus, allowed, base, equipmentCap, floorReview: null };
  const { x, y, length, aisleY, rampY, rampStart, rampEnd, ramp, drive, plate } = layout;
  const footprint = findAbove(aboveEnvelope, Number(i.site) * Number(i.coverage) / 100 * Number(i.coverageUse) / 100, { x: x + 3, y, length: length - 6, coreY: aisleY - 2 });
  if (area(footprint) < 200) return { spatial: fail("\u5730\u4E0A\u53EF\u914D\u7F6E\u7BC4\u570D\u4E0D\u8DB3\u4E00\u68DF\u6574\u5408\u4F4F\u5B85\u91CF\u9AD4\uFF0C\u9808\u8ABF\u6574\u9650\u5236\u5047\u8A2D\u6216\u914D\u7F6E\u3002"), bonus, allowed, base, equipmentCap, floorReview: null };
  const ab = bounds(footprint), cy = aisleY - 2, coreX = [ab.minX + 10, Math.max(ab.maxX - 14, rampEnd + layout.radius + layout.width / 2 + 0.5)];
  const cores = coreX.flatMap((cx, j) => [{ label: `\u5B89\u5168\u68AF${j + 1}`, use: "stair", shape: rectangle(cx, cy - 5.5, 3, 4.5) }, { label: `\u6392\u7159\u5BA4${j + 1}`, use: "equipment", shape: rectangle(cx + 3, cy - 4, 2, 3) }, { label: `\u6607\u964D\u6A5F${j + 1}`, use: "lift", shape: rectangle(cx + 5, cy - 4, 2.5, 3) }]);
  const generated = [];
  let aboveStopped = false;
  const makeAbove = (count2) => {
    if (generated.length >= count2 || aboveStopped) return generated.slice(0, count2);
    const floors2 = [];
    for (let j = generated.length; j < count2; j++) {
      const elevation = j ? s.assumptions.groundHeight + (j - 1) * s.assumptions.floorHeight : 0, height = j ? s.assumptions.floorHeight : s.assumptions.groundHeight;
      if (s.assumptions.heightLimit !== null && elevation + height + Number(i.roofFloors) * Number(i.roofHeight) > s.assumptions.heightLimit) {
        aboveStopped = true;
        break;
      }
      const env = envelope(s, false, elevation + height);
      const p = intersect(footprint, env);
      if (!cores.every((c) => contained(c.shape, p)) || area(p) < 250) {
        aboveStopped = true;
        break;
      }
      const f7 = floor(`${j + 1}F`, p, elevation, height);
      for (const c of cores) add(f7, c.label, c.use, c.shape);
      for (const cx of coreX) add(f7, "\u5171\u540C\u68AF\u5EF3\uFF08\u6DE8\u6DF12m\uFF09", "lobby", rectangle(cx, cy - 1, 7.5, 2));
      add(f7, "\u4F4F\u5B85\u516C\u5171\u8D70\u5ECA\uFF082m\uFF09", "corridor", rectangle(ab.minX, cy - 1, ab.maxX - ab.minX, 2));
      if (j === 0) {
        add(f7, "\u9580\u5EF3\u53CA\u7BA1\u7406\u5BA4", "lobby", rectangle(ab.minX, cy - 5, 7, 4));
        add(f7, "\u7E3D\u914D\u96FB\uFF0F\u96FB\u4FE1", "equipment", rectangle(ab.maxX - 6, cy - 5, 6, 4));
      }
      const wall = difference(p, insetFast(p, 0.2));
      add(f7, "\u5916\u7246\u53CA\u67F1\u7DB2", "structure", wall);
      for (let xx = ab.minX + 4; xx < ab.maxX; xx += s.assumptions.columnGrid) for (const yy of [ab.minY + 1, ab.maxY - 1]) add(f7, "\u67F1\u7DB2\u9810\u7559", "structure", rectangle(xx, yy, s.assumptions.columnSize, s.assumptions.columnSize));
      const privateShape = free(f7), pb = bounds(privateShape), desired = s.assumptions.unitPing / 0.3025;
      let unit = 0;
      for (const side of [rectangle(pb.minX - 1, pb.minY - 1, pb.maxX - pb.minX + 2, cy - pb.minY), rectangle(pb.minX - 1, cy + 1, pb.maxX - pb.minX + 2, pb.maxY - cy + 1)]) {
        const sideShape = intersect(privateShape, side);
        for (const component of sideShape) {
          const part = [component], n = Math.max(1, Math.round(area(part) / desired));
          let remain = part;
          for (let k = 0; k < n; k++) {
            const unitShape = k === n - 1 ? remain : takeArea(remain, area(part) / n);
            for (const connected of unitShape) {
              const geometry = [connected];
              if (area(geometry) < 28) continue;
              add(f7, `\u4F4F\u5B85${++unit}`, "dwelling", geometry);
            }
            remain = difference(remain, unitShape);
          }
        }
      }
      add(f7, "\u8D70\u5ECA\u7AEF\u90E8\uFF0F\u7246\u9AD4\u929C\u63A5", "corridor", free(f7));
      for (const q of f7.spaces.filter((s2) => s2.use === "dwelling")) {
        const qb = bounds(q.geometry), strip = rectangle(qb.minX, qb.minY < cy ? qb.minY : qb.maxY - 1, qb.maxX - qb.minX, 1);
        const bal = intersect(q.geometry, strip);
        const after = difference(q.geometry, bal);
        if (after.filter((p2) => area([p2]) > 1e-3).length !== 1) continue;
        q.geometry = after;
        q.area = area(q.geometry);
        q.houseRegistered = q.area;
        q.counted = q.area;
        add(f7, "\u5167\u51F9\u967D\u53F0\uFF08\u6DF11m\uFF09", "balcony", bal);
      }
      generated.push(f7);
    }
    return generated.slice(0, count2);
  };
  let count = 1, best = [];
  for (; count <= 60; count++) {
    const trial = makeAbove(count);
    if (trial.length < count) break;
    const fr = reviewAboveGround({ used: target, equipment: 0, equipmentCap, footprint: area(footprint), lobbyRate: 0, balconyRate: 0, lobbyQualified: i.lobbyDepth !== "failed", review: { version: AREA_REVIEW_VERSION, floors: trial.map((f7) => ({ label: f7.id, floorArea: area(f7.plate) - sqm(group([f7], ["balcony"])), equipment: sqm(group([f7], equipmentUses)), lobby: sqm(group([f7], ["lobby"])), balcony: sqm(group([f7], ["balcony"])), lobbyQualified: i.lobbyDepth !== "failed", balconyQualified: true })) } });
    if (fr.counted > target + 0.01) break;
    best = trial;
  }
  const makeBelow = (units2, legal2) => {
    let remainingCars = legal2, remainingMotos = units2, remainingBikes = Math.ceil(units2 * 0.25), remainingCommunity = Math.ceil(legal2 * 0.02);
    const underground2 = [];
    for (let j = 1; j <= 4; j++) {
      const f7 = floor("B" + j, plate, -j * s.assumptions.basementHeight, s.assumptions.basementHeight);
      const accessibleCount = legal2 === 0 ? 0 : legal2 <= 50 ? 1 : Math.ceil((legal2 - 50) / 100) + 1;
      const accessibleSlots = [];
      add(f7, "\u5171\u7528\u5761\u9053 1:10", "ramp", ramp, "shared");
      add(f7, "\u96D9\u5411\u8ECA\u9053\u53CAR5.5\u8FF4\u8F49", "driveway", drive, "shared");
      for (const c of cores) add(f7, c.label, c.use, c.shape, "housing");
      const room = j === 1 ? { label: "\u901A\u98A8\u53CA\u9632\u707D\u63A7\u5236\u5BA46\xD74m", w: 6, h: 4 } : j === 2 ? { label: "\u53D7\u96FB\u53CA\u767C\u96FB\u6A5F\u623F8\xD76m", w: 8, h: 6 } : j === 3 ? { label: "\u6C11\u751F\u6C34\u6C60\u53CA\u6CF5\u623F12.8\xD75m", w: 12.8, h: 5 } : { label: "\u6D88\u9632\u6C34\u6C60\u53CA\u6CF5\u623F12.8\xD75m", w: 12.8, h: 5 };
      let placed = false;
      for (const yy of [j === 2 ? y - 0.2 : y + 0.3, y + 11.8]) {
        for (let xx = x + length - room.w - 0.3; xx >= x + 0.3; xx -= 0.5) {
          const r = rectangle(xx, yy, room.w, room.h), bump = rectangle(xx - 0.3, yy - 0.3, room.w + 0.6, room.h + 0.6);
          if (contained(bump, belowEnvelope) && area(intersect(r, union(...f7.spaces.map((q) => q.geometry)))) < 1e-3) {
            f7.plate = union(f7.plate, bump);
            add(f7, room.label, "equipment", r, "housing", "\u5177\u540D\u8A2D\u5099\u623F\u6295\u5F71\u5C3A\u5BF8\u70BA\u9700\u6C42\u5047\u8A2D\uFF0C\u975E\u6838\u5B9A\u6DE8\u7A7A\u9762\u7A4D\uFF1B\u8A2D\u5099\u5BB9\u91CF\u53CA\u623F\u5167\u7D50\u69CB\u53E6\u6838\uFF0C\u975E\u6CD5\u5B9A\u6700\u4F4E\u6BD4\u4F8B");
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (!placed) f7.notes.push("\u8A2D\u5099\u623F\u672A\u6392\u5165\uFF1A" + room.label);
      if (j === 2) {
        const columns = [];
        for (let xx = x + 0.3 + 7.5; xx < x + length; xx += s.assumptions.columnGrid) columns.push(rectangle(xx, y + 0.5, s.assumptions.columnSize, s.assumptions.columnSize));
        for (let xx = x + 0.3; xx + 3.5 < x + length - 0.3 && accessibleSlots.length < accessibleCount; xx += 0.1) {
          const r = rectangle(xx, y - 0.2, 3.5, 6), bump = rectangle(xx - 0.3, y - 0.5, 4.1, 6.6);
          if (contained(bump, belowEnvelope) && area(intersect(r, union(...f7.spaces.map((q) => q.geometry), ...columns, ...accessibleSlots))) < 1e-3) {
            accessibleSlots.push(r);
            f7.plate = union(f7.plate, bump);
            xx += 3.4;
          }
        }
      }
      add(f7, "\u5730\u4E0B\u5916\u7246", "structure", difference(f7.plate, insetFast(f7.plate, 0.3)), "shared");
      for (let xx = x + 0.3 + 7.5; xx < x + length; xx += s.assumptions.columnGrid) for (const yy of [y + 0.5, y + 17.1 - s.assumptions.columnSize]) add(f7, "\u7D50\u69CB\u67F1", "structure", rectangle(xx, yy, s.assumptions.columnSize, s.assumptions.columnSize), "shared");
      const stalls = (use, w, h, rows, wanted, done) => {
        for (const yy of rows) for (let slot = 0; slot < 1e3; slot++) {
          const xx = x + 0.3 + (use === "car" || use === "community" ? Math.floor(slot / 3) * s.assumptions.columnGrid + slot % 3 * w : slot * w);
          if (xx + w > x + length - 0.3) break;
          if (!wanted()) return;
          const r = rectangle(xx, yy, w, h);
          if (contained(r, free(f7)) && (use === "accessible_motorcycle" || touches(r, union(...f7.spaces.filter((q) => ["corridor", "driveway", "ramp"].includes(q.use)).map((q) => q.geometry))))) {
            add(f7, `${use === "community" ? "\u793E\u5340\u88DD\u5378" : use.includes("motorcycle") ? "\u6A5F\u8ECA" : use === "bicycle" ? "\u81EA\u884C\u8ECA" : use === "accessible_car" ? "\u7121\u969C\u7919\u6C7D\u8ECA" : "\u6C7D\u8ECA"} ${f7.spaces.filter((s2) => s2.use === use).length + 1}`, use, r, use === "community" || use === "motorcycle" || use === "accessible_motorcycle" || use === "bicycle" ? "housing" : "parking");
            done();
          }
        }
      };
      if (j === 1) {
        const a = Math.max(1, Math.ceil((legal2 - 50) / 100) + 1);
        let ac = a;
        stalls("accessible_motorcycle", 2.25, 2.2, [y + 0.3], () => ac > 0 && remainingMotos > 0, () => {
          ac--;
          remainingMotos--;
        });
        for (const a2 of f7.spaces.filter((q) => q.use === "accessible_motorcycle")) {
          const b = bounds(a2.geometry);
          add(f7, "\u7121\u969C\u7919\u6A5F\u8ECA\u901A\u9054\u8DEF\u7DDA", "corridor", rectangle(b.minX, b.maxY, b.maxX - b.minX, aisleY - 3 - b.maxY), "housing");
        }
        stalls("community", 2.5, 5.5, [y + 0.3, y + 11.8], () => remainingCommunity > 0, () => remainingCommunity--);
        for (const yy of [y + 2.3, y + 13.8]) add(f7, "\u6A5F\u8ECA\u81EA\u884C\u8ECA\u901A\u90531.5m", "corridor", rectangle(x + 0.3, yy, length - 0.6, 1.5), "housing");
        connectMotoRoutes(f7, aisleY);
        stalls("motorcycle", 1, 2, [y + 0.3, y + 3.8, y + 11.8, y + 15.3], () => remainingMotos > 0, () => remainingMotos--);
        stalls("bicycle", 1, 2, [y + 0.3, y + 3.8, y + 11.8, y + 15.3], () => remainingBikes > 0, () => remainingBikes--);
      } else {
        if (j === 2) for (let k = 0; k < accessibleSlots.length && remainingCars > 0; k++) {
          const r = accessibleSlots[k];
          if (contained(r, free(f7))) {
            add(f7, "\u7121\u969C\u7919\u6C7D\u8ECA " + (k + 1), "accessible_car", r, "parking");
            remainingCars--;
          }
        }
        stalls("car", 2.5, 5.5, [y + 0.3, y + 11.8], () => remainingCars > 0, () => remainingCars--);
      }
      const occupied = union(...f7.spaces.filter((s2) => s2.use !== "structure").map((s2) => s2.geometry));
      const remaining = free(f7);
      const necessary = intersect(remaining, union(...occupied.flatMap((p) => p.flatMap((r) => r.slice(0, -1).map((a, k) => edgeBand(a, r[k + 1], 0.3))))));
      add(f7, "\u5FC5\u8981\u7246\u67F1\u53CA\u7A7A\u9593\u929C\u63A5", "structure", necessary, "shared");
      f7.plate = union(...f7.spaces.map((s2) => s2.geometry));
      if (j === 1 && s.assumptions.shelterApplicable) {
        const qualified = union(...f7.spaces.filter((s2) => !["bicycle", "ramp"].includes(s2.use)).map((s2) => s2.geometry));
        f7.shelter = takeArea(qualified, area(footprint));
        f7.notes.push("B1\u9632\u7A7A\u907F\u96E3\u517C\u505C\u8ECA\u4EE5\u5E73\u5766\u7A7A\u9593\u521D\u914D\uFF0C\u5761\u9053\u66AB\u4E0D\u5217\u907F\u96E3\u6709\u6548\u9762\u7A4D\uFF1B\u4E0D\u589E\u5EFA\u9762\u7A4D\uFF1B\u51FA\u5165\u53E3\u3001\u69CB\u9020\u53CA\u9632\u8B77\u8A2D\u5099\u8CC7\u683C\u70BA\u660E\u793A\u5047\u8A2D\u3002");
      }
      underground2.push(f7);
    }
    return { underground: underground2, remainingCars, remainingMotos, remainingBikes, remainingCommunity };
  };
  let underground = [], legal = 0, units = 0, converged = false;
  for (let j = best.length; j >= 1; j--) {
    const trial = makeAbove(j);
    units = group(trial, ["dwelling"]).length;
    if (units > 200) continue;
    const basis = sqm(group(trial, ["dwelling", "lobby", "corridor", "structure"]));
    const pd = i.parkingDesign;
    legal = pd.mode === "case" && pd.confirmed && pd.rule === "perUnit" ? Math.ceil(units * Number(pd.unitRate)) : pd.mode === "case" && pd.confirmed && pd.rule === "perArea" ? Math.ceil(Math.max(0, basis - Number(pd.freeArea)) / Number(pd.areaPerCar)) : Math.ceil(Math.max(0, basis - 500) / 150);
    const z = makeBelow(units, legal);
    const ac = legal === 0 ? 0 : legal <= 50 ? 1 : Math.ceil((legal - 50) / 100) + 1;
    if (z.underground.some((f7) => f7.notes.some((n) => n.startsWith("\u8A2D\u5099\u623F\u672A\u6392\u5165"))) || z.remainingCars || z.remainingMotos || z.remainingBikes || z.remainingCommunity || group(z.underground, ["accessible_car"]).length < ac || !z.underground.every((f7) => cores.every((c) => Math.abs(sqm(f7.spaces.filter((q) => q.label === c.label)) - area(c.shape)) < 0.02))) continue;
    best = trial;
    underground = z.underground;
    converged = true;
    break;
  }
  if (!converged) return { spatial: fail("B4\u56FA\u5B9A\u4E0B\uFF0C\u6CD5\u5B9A\u6C7D\u8ECA\u3001\u6A5F\u8ECA\u3001\u81EA\u884C\u8ECA\u6216\u793E\u5340\u8ECA\u4F4D\u4E0D\u8DB3\uFF1B\u8ACB\u8ABF\u6574\u4F4F\u5B85\u55AE\u5143\u53CA\u52D5\u7DDA\u3002"), bonus, allowed, base, equipmentCap, floorReview: null };
  let floorReview = reviewAboveGround({ used: target, equipment: 0, equipmentCap, footprint: area(footprint), lobbyRate: 0, balconyRate: 0, lobbyQualified: i.lobbyDepth !== "failed", review: { version: AREA_REVIEW_VERSION, floors: best.map((f7) => ({ label: f7.id, floorArea: area(f7.plate) - sqm(group([f7], ["balcony"])), equipment: sqm(group([f7], equipmentUses)), lobby: sqm(group([f7], ["lobby"])), balcony: sqm(group([f7], ["balcony"])), lobbyQualified: i.lobbyDepth !== "failed", balconyQualified: true })) } });
  let eqLeft = equipmentCap - floorReview.equipmentExempt;
  for (const [j, f7] of best.entries()) {
    const r = floorReview.floors[j];
    for (const q of f7.spaces) {
      q.exempt = equipmentUses.includes(q.use) ? q.area * (r.equipment ? r.equipmentExempt / r.equipment : 0) : q.use === "lobby" ? q.area * (r.lobby ? r.lobbyExempt / r.lobby : 0) : q.use === "balcony" ? q.area * (r.balcony ? r.balconyExempt / r.balcony : 0) : 0;
      q.counted = q.area - q.exempt;
      q.legalBasis = equipmentUses.includes(q.use) ? "\u7B2C162\u689D\u7B2C1\u9805\u7B2C2\u6B3E\uFF0C\u5408\u683C\u8A2D\u5099\u8207\u5B89\u5168\u68AF\u5047\u8A2D" : q.use === "lobby" || q.use === "balcony" ? "\u7B2C162\u689D\u7B2C1\u9805\u7B2C1\u6B3E\uFF0C\u9010\u5C6410%\uFF0F10%\u5408\u8A0815%" : "\u666E\u901A\u6A13\u677F\u8A08\u5BB9";
    }
    totals(f7);
  }
  const allBelow = underground.flatMap((f7) => f7.spaces), carArea = sqm(allBelow.filter(isCar)), motoArea = sqm(allBelow.filter((s2) => ["motorcycle", "accessible_motorcycle"].includes(s2.use))), bikeArea = sqm(allBelow.filter((s2) => s2.use === "bicycle")), communityArea = sqm(allBelow.filter((s2) => s2.use === "community"));
  const housingService = motoArea + bikeArea + communityArea, parkingService = carArea, share = housingService / (housingService + parkingService || 1);
  const allocations = underground.flatMap((f7) => {
    let fixed = 0;
    return f7.spaces.map((q) => {
      const inShelter = area(intersect(q.geometry, f7.shelter)), eq = equipmentUses.includes(q.use);
      let shelterPart = inShelter;
      if (eq && q.use !== "stair") {
        shelterPart = Math.min(inShelter, Math.max(0, area(f7.shelter) / 4 - fixed));
        fixed += shelterPart;
      }
      const remain = q.area - shelterPart;
      const housingFraction = q.service === "housing" ? 1 : q.service === "parking" ? 0 : q.use === "structure" ? sqm(f7.spaces.filter((x2) => x2.service === "housing")) / (sqm(f7.spaces.filter((x2) => x2.service === "housing" || x2.service === "parking")) || 1) : f7.id === "B1" ? share : 0;
      const bikeFraction = f7.id === "B1" && housingService > 0 ? bikeArea / housingService : 0;
      const carSubject = !eq ? isCar(q) || q.service === "parking" ? remain : q.service === "shared" ? remain * (1 - housingFraction) : 0 : 0;
      const housingParkingSubject = !eq && !["bicycle"].includes(q.use) ? remain - carSubject : 0;
      const housingParkingExempt = housingParkingSubject * (q.use === "corridor" || q.service === "shared" ? 1 - bikeFraction : 1);
      return { f: f7, q, eq, shelterPart, remain, carSubject, housingParkingExempt, housingFraction };
    });
  });
  const carSubjectTotal = allocations.reduce((t, a) => t + a.carSubject, 0), carFactor = carSubjectTotal > 0 ? Math.min(1, legal * 40 / carSubjectTotal) : 0;
  const remainingEquipment = allocations.filter((a) => a.eq).reduce((t, a) => t + a.remain, 0), eqFactor = remainingEquipment > 0 ? Math.min(1, eqLeft / remainingEquipment) : 0;
  for (const a of allocations) {
    const { q } = a;
    q.exemptionParts = { shelter: a.shelterPart, equipment: a.eq ? a.remain * eqFactor : 0, car: a.eq ? 0 : a.carSubject * carFactor, local: a.eq ? 0 : a.housingParkingExempt, carSubject: a.carSubject };
    q.exempt = Math.min(q.area, a.shelterPart + (a.eq ? a.remain * eqFactor : a.carSubject * carFactor + a.housingParkingExempt));
    q.counted = q.area - q.exempt;
    q.legalBasis = a.eq ? "\u7B2C162\u689D\u7B2C1\u9805\u7B2C2\u6B3E\u6A5F\u96FB\u7E3D\u984D\uFF1BB1\u4F9D\u7B2C141\u3001142\u689D\u9632\u7A7A\u907F\u96E3\u5957\u758A" : q.use === "bicycle" ? "\u79C1\u4EBA\u81EA\u884C\u8ECA\u672A\u53E6\u6709\u514D\u8A08\u4F9D\u64DA\u90E8\u5206\u8A08\u5BB9" : "\u7B2C162\u689D\u505C\u8ECA\uFF0F\u88DD\u5378\u53CAB1\u9632\u7A7A\u907F\u96E3\uFF1B\u6C7D\u8ECA\u5FC5\u8981\u7A7A\u9593\u53D7\u6BCF\u8ECA40\u33A1\u7E3D\u91CF\u4E0A\u9650\u6309\u6C60\u5167\u9762\u7A4D\u6BD4\u4F8B\u5206\u914D";
    q.legalBasis += `\uFF1B\u9632\u7A7A${a.shelterPart.toFixed(2)}\u33A1\u3001\u6A5F\u96FB${q.exemptionParts.equipment.toFixed(2)}\u33A1\u3001\u6C7D\u8ECA\u6C60${q.exemptionParts.car.toFixed(2)}\u33A1\u3001\u5176\u4ED6\u4F9D\u6CD5\u505C\u8ECA${q.exemptionParts.local.toFixed(2)}\u33A1\u514D\u8A08\u3002`;
    q.houseRegistered = q.area * a.housingFraction;
    q.parkingRegistered = q.area - q.houseRegistered;
    q.assumption += "\uFF1BB1\u5171\u7528\u52D5\u7DDA\u6309\u6C7D\u6A5F\u8ECA\u8207\u81EA\u884C\u8ECA\u670D\u52D9\u9762\u7A4D\u4F30\u5206\uFF0CB2\u4EE5\u4E0B\u8ECA\u9053\u670D\u52D9\u6C7D\u8ECA\uFF1B\u7246\u67F1\u6309\u8A72\u5C64\u670D\u52D9\u7528\u9014\u4F30\u5206\uFF0C\u975E\u6CD5\u5B9A\u56FA\u5B9A\u6BD4\u4F8B\uFF0C\u5F85\u5206\u914D\u8868\u8986\u6838\u3002";
  }
  for (const f7 of underground) totals(f7);
  const roofs = [];
  const top = best[best.length - 1], topHeight = top.elevation + top.height;
  for (let j = 0; j < Math.min(3, Number(i.roofFloors)); j++) {
    const p = union(...cores.map((c) => c.shape));
    const f7 = floor("R" + (j + 1), p, topHeight + j * Number(i.roofHeight), Number(i.roofHeight));
    for (const c of cores) add(f7, c.label + "\u5C4B\u7A81", j ? "roof_equipment" : c.use, c.shape);
    for (const q of f7.spaces) {
      q.exempt = q.area;
      q.counted = 0;
      q.legalBasis = "\u7B2C1\u689D\u7B2C9\u6B3E\u53CA\u7B2C162\u689D\u7B2C1\u9805\u7B2C2\u6B3E\uFF1B\u5C4B\u7A81\u6295\u5F71\u8207\u9AD8\u5EA6\u5047\u8A2D\u7B26\u5408";
    }
    totals(f7);
    roofs.push(f7);
  }
  const floors = [...best, ...roofs, ...underground];
  const used = floors.reduce((t, f7) => t + f7.counted, 0);
  check.push({ label: "\u57FA\u5730\u9762\u7A4D", status: s.mode === "survey" ? "pass" : "assumed", detail: `\u767B\u8A18${i.site}\u33A1\uFF1B\u5716\u9762${area(s.boundary).toFixed(2)}\u33A1\uFF0C\u4E0D\u7E2E\u653E\u5716\u5F62\u3002` }, { label: "\u5730\u4E0A\u5730\u4E0B\u53EF\u914D\u7F6E\u7BC4\u570D", status: "assumed", detail: "\u4F9D\u9010\u5074\u9000\u7E2E\u3001\u5730\u4E0B\u65BD\u5DE5\u9810\u7559\u5206\u5225\u751F\u6210\uFF1B\u5716\u8CC7\u5730\u754C\u975E\u9451\u754C\u3002" + s.assumptions.conditionsSource }, { label: "B1\u81F3B4\u8207\u5761\u9053", status: "pass", detail: `\u5730\u4E0B4\u5C64\uFF1B\u5761\u9053\u5BEC${layout.width}m\u30011:10\u3001\u6C34\u5E73\u9577${(rampEnd - rampStart).toFixed(2)}m\uFF1B\u8FF4\u8F49\u5167\u5074${(layout.radius - layout.width / 2).toFixed(2)}m\uFF1B\u4E0A\u4E0B\u5C64\u5C0D\u4F4D\u3002\u5730\u9762\u5761\u9053\u82076m\u5E73\u5730\u7DE9\u885D\u672A\u4FB5\u5165\u66AB\u63A1\u5730\u4E0A\u9000\u7E2E\u3002` }, { label: "\u6CD5\u5B9A\u505C\u8ECA\u512A\u5148", status: "assumed", detail: `\u4F4F\u5B85${units}\u6236\uFF1B\u4F9D\u7528\u9014\u901A\u5247\u521D\u4F30\u6C7D\u8ECA${legal}\u4F4D\u3001\u6A5F\u8ECA${units}\u4F4D\u3001\u81EA\u884C\u8ECA${Math.ceil(units * 0.25)}\u4F4D\uFF0C\u6309\u5BE6\u969B\u8ECA\u683C\u914D\u7F6E\uFF1B\u6B63\u5F0F\u500B\u6848\u898F\u5B9A\u4ECD\u9808\u8986\u6838\u3002` });
  for (const f7 of underground) {
    const paths = union(...f7.spaces.filter((q) => ["corridor", "driveway", "ramp"].includes(q.use)).map((q) => q.geometry));
    const main = paths.filter((p) => area(intersect([p], ramp)) > 0.1);
    const stranded = f7.spaces.filter((q) => ["car", "accessible_car", "motorcycle", "accessible_motorcycle", "bicycle", "community"].includes(q.use) && !touches(q.geometry, main));
    check.push({ label: f7.id + "\u505C\u8ECA\u8207\u5165\u53E3\u9023\u901A", status: stranded.length ? "conflict" : "pass", detail: stranded.length ? stranded.map((q) => q.label).join("\u3001") + "\u672A\u63A5\u53EF\u9054\u901A\u9053" : "\u6BCF\u683C\u9130\u63A5\u8207\u5761\u9053\u9023\u901A\u7684\u8ECA\u9053\uFF0F\u901A\u9053\uFF1B\u8ECA\u8F1B\u6383\u63A0\u53CA\u9580\u6247\u914D\u7F6E\u4ECD\u9808\u5716\u8AAA\u8986\u6838\u3002" });
  }
  for (const f7 of floors) {
    const overlap = sum(f7.spaces, "area") - area(union(...f7.spaces.map((s2) => s2.geometry))), balance = Math.abs(sum(f7.spaces, "area") - area(f7.plate));
    check.push({ label: f7.id + "\u9762\u7A4D\u5B88\u6046\u8207\u91CD\u758A", status: overlap > 0.02 || balance > 0.02 ? "conflict" : "pass", detail: `\u6A13\u677F${area(f7.plate).toFixed(2)}\u33A1\uFF1B\u5340\u584A${sum(f7.spaces, "area").toFixed(2)}\u33A1\uFF1B\u91CD\u758A${overlap.toFixed(4)}\u33A1\uFF1B\u514D\u8A08\uFF0B\u8A08\u5BB9${(f7.exempt + f7.counted).toFixed(2)}\u33A1\u3002` });
    if (!contained(f7.plate, f7.id.startsWith("B") ? belowEnvelope : s.boundary)) check.push({ label: f7.id + "\u8D8A\u754C", status: "conflict", detail: "\u5B58\u5728\u914D\u7F6E\u8D85\u51FA\u53EF\u914D\u7F6E\u5730\u754C\u3002" });
  }
  check.push({ label: "\u5730\u9762\u5165\u53E3\u8207\u4EA4\u901A\u929C\u63A5", status: "assumed", detail: `121\u5DF7\u512A\u5148\uFF1B\u5761\u9053\u8D77\u9EDE(${rampStart.toFixed(1)},${rampY.toFixed(1)})\u9810\u75596m\u5E73\u5730\u7DE9\u885D\u3002\u9053\u8DEF\u5EFA\u7BC9\u7DDA\u3001\u884C\u7A7F\u7DDA\u3001\u51FA\u5165\u53E3\u6DE8\u8DDD\u8207\u8ECA\u8F1B\u6383\u63A0\u9808\u8986\u6838\uFF0C\u4E0D\u5217\u5E7E\u4F55\u5DF2\u901A\u904E\u3002` }, { label: "\u9053\u8DEF\u659C\u7DDA", status: "assumed", detail: "\u4F9D\u7B2C164\u689D\u63A1\u6BCF\u5074\u9AD8\u5EA6/3.6\u2212\u9053\u8DEF\u5BEC/2\u7684\u5747\u52FB\u9670\u5F71\u9810\u7B97\u4FDD\u5B88\u9000\u7E2E\uFF1B\u9053\u8DEF\u6CD5\u5B9A\u5BEC\u5EA6\u53CA\u9053\u8DEF\u5C0D\u5074\u6C38\u4E45\u7A7A\u5730\u672A\u78BA\u8A8D\uFF0C\u4E0D\u63A1\u52A0\u500D\u3002" }, { label: "\u65E5\u7167\u8207\u9AD8\u9435\u9650\u5EFA", status: "assumed", detail: "\u7B2C39-1\u689D\u51AC\u81F3\u9130\u5730\u6709\u6548\u65E5\u7167\u53CA\u9AD8\u9435\u69CB\u9020\uFF0F\u6DF1\u5EA6\u9650\u5236\u672A\u6709\u5B8C\u6574\u9130\u623F\u8207\u96A7\u9053\u8CC7\u6599\uFF1B\u521D\u4F30\u7E7C\u7E8C\uFF0C\u672A\u5BA3\u544A\u5408\u898F\u3002" }, { label: "\u5BB9\u7A4D\u7E3D\u91CF", status: used > target + 0.02 ? "conflict" : "pass", detail: `\u5730\u4E0A\u53CA\u5730\u4E0B\u5408\u8A08${used.toFixed(2)}\u33A1\uFF0F\u76EE\u6A19\u4E0A\u9650${target.toFixed(2)}\u33A1\u3002` });
  warnings.push("\u9632\u7A7A\u907F\u96E3\u517C\u505C\u8ECA\u66AB\u53EA\u53D6\u5E73\u5766\u5019\u9078\u7A7A\u9593\uFF0C\u5761\u9053\u4E0D\u5217\u907F\u96E3\u6709\u6548\u9762\u7A4D\uFF1B\u9032\u51FA\u53E3\u53CA\u9632\u8B77\u69CB\u9020\u4ECD\u9808\u4F9D\u6B63\u5F0F\u5716\u8AAA\u6838\u5C0D\u3002", "\u672C\u6B21\u63A16m\u6C7D\u6A5F\u8ECA\u5171\u7528\u5761\u9053\uFF0C\u6A5F\u8ECA\u521D\u4F30\u914D\u7F6E\u9650200\u4F4D\u5167\uFF1B\u66F4\u9AD8\u9700\u6C42\u9808\u53E6\u914D\u52A0\u5BEC\u6216\u5C08\u7528\u9053\uFF0C\u9019\u4E0D\u662F\u6CD5\u5B9A\u6236\u6578\u4E0A\u9650\u3002", ...s.edges.filter((e) => e.status === "assumed").map((e) => e.label + "\uFF1A" + e.source), s.assumptions.roomProgramSource, "\u5730\u4E0B\u6A5F\u96FB\u514D\u8A08\u5148\u63A1\u5408\u683C\u6A5F\u96FB\u7E3D\u91CF\u5269\u9918\u984D\u5EA6\uFF0CB1\u9632\u7A7A\u907F\u96E3\u4F9D\u5BE6\u969B\u5957\u758A\uFF1B\u5C1A\u672A\u4EE5\u672A\u7D93\u78BA\u8A8D\u7684\u505C\u8ECA\u6C60\u51FD\u91CB\u589E\u52A0\u8A2D\u5099\u514D\u8A08\u3002", "\u8A2D\u5099\u3001\u67F1\u7DB2\u3001\u4F4F\u5B85\u55AE\u5143\u8207\u670D\u52D9\u5206\u6524\u70BA\u521D\u4F30\uFF1B\u5EFA\u7BC9\u7DDA\u3001\u5730\u8CEA\u64CB\u571F\u3001\u9AD8\u9435\u3001\u6D88\u9632\u3001\u51AC\u81F3\u9130\u5730\u65E5\u7167\u53CA\u51FA\u5165\u53E3\u9808\u6B63\u5F0F\u8986\u6838\u3002");
  return { spatial: { version: SPATIAL_VERSION, survey: s, aboveEnvelope, belowEnvelope, groundAccess: layout.entrance, auditHistory: i.regulatoryReview?.auditHistory ?? [], allowedVolume: allowed, floors, checks: check, units, legalCars: legal, cars: allBelow.filter(isCar).length, motos: allBelow.filter((q) => ["motorcycle", "accessible_motorcycle"].includes(q.use)).length, bikes: allBelow.filter((q) => q.use === "bicycle").length, community: allBelow.filter((q) => q.use === "community").length, unusedVolume: Math.max(0, target - used), unbuiltBasement: limit * 4 - underground.reduce((t, f7) => t + area(f7.plate), 0), warnings: [...new Set(warnings)], converged }, bonus, allowed, base, equipmentCap, floorReview };
}
function insetFast(shape, d) {
  return difference(shape, ...shape.flatMap((p) => p.flatMap((r) => r.slice(0, -1).map((a, j) => edgeBand(a, r[j + 1], d)))));
}
function touches(shape, route) {
  const band = union(...shape.flatMap((p) => p.flatMap((r) => r.slice(0, -1).map((a, k) => edgeBand(a, r[k + 1], 0.03)))));
  return area(intersect(band, route)) > 0.015;
}
function connectMotoRoutes(f7, aisleY) {
  const road = union(...f7.spaces.filter((q) => q.use === "ramp" || q.use === "driveway").map((q) => q.geometry));
  for (let pass = 0; pass < 2; pass++) {
    const paths = union(road, ...f7.spaces.filter((q) => q.use === "corridor").map((q) => q.geometry));
    for (const p of paths) {
      if (area(intersect([p], road)) > 0.01) continue;
      const b = bounds([p]);
      for (let x = Math.ceil(b.minX * 2) / 2; x + 1.8 <= b.maxX; x += 0.5) {
        const r = rectangle(x, Math.min(b.minY, aisleY), 1.8, Math.abs(aisleY - b.minY) + 1.8);
        const blocks = union(...f7.spaces.filter((q) => !["corridor", "ramp", "driveway"].includes(q.use)).map((q) => q.geometry));
        if (contained(r, f7.plate) && area(intersect(r, blocks)) < 5e-3) {
          add(f7, "\u6A5F\u8ECA\u81EA\u884C\u8ECA\u6A6B\u5411\u901A\u90541.8m", "corridor", r, "housing");
          break;
        }
      }
    }
  }
  const all = union(road, ...f7.spaces.filter((q) => q.use === "corridor").map((q) => q.geometry)), main = all.filter((p) => area(intersect([p], road)) > 0.01);
  for (const q of f7.spaces.filter((q2) => q2.use === "corridor")) {
    q.geometry = intersect(q.geometry, main);
    q.area = area(q.geometry);
    q.houseRegistered = q.area;
    q.counted = q.area;
  }
  f7.spaces = f7.spaces.filter((q) => q.area > 1e-3);
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/spatialResult.ts
function computeSpatialResult(i, aggregate) {
  const template = aggregate({ ...i, spatial: void 0, areaReview: void 0, reserve: "0", equipment: "0", lobby: "0", balcony: "0", extraCars: "0" });
  const detail = buildSpatialPlanning(i), s = detail.spatial;
  if (!template.values || !detail.floorReview) return { ...template, spatial: s, values: null, errors: s.checks.filter((c) => c.status === "conflict").map((c) => c.detail), notes: [...s.warnings] };
  const floors = s.floors, above = floors.filter((f7) => f7.id.endsWith("F")), below = floors.filter((f7) => f7.id.startsWith("B")), roofs = floors.filter((f7) => f7.id.startsWith("R")), spaces = floors.flatMap((f7) => f7.spaces), sum2 = (a, key) => a.reduce((t, x) => t + x[key], 0), of = (uses, a = spaces) => a.filter((x) => uses.includes(x.use));
  const ap = above.flatMap((f7) => f7.spaces), bp = below.flatMap((f7) => f7.spaces), rp = roofs.flatMap((f7) => f7.spaces), fr = detail.floorReview;
  const eq = of(["stair", "lift", "equipment"]), basement = below.reduce((t, f7) => t + area(f7.plate), 0), roof = roofs.reduce((t, f7) => t + area(f7.plate), 0), aboveArea = sum2(ap, "area") + roof, balcony = sum2(of(["balcony"], ap), "area"), sale = sum2(spaces, "houseRegistered"), common = sale - sum2(of(["dwelling", "balcony"], ap), "houseRegistered"), used = floors.reduce((t, f7) => t + f7.counted, 0), bcount = below.reduce((t, f7) => t + f7.counted, 0), parkingSalesArea = sum2(bp, "parkingRegistered"), bhouse = sum2(bp, "houseRegistered"), beq = of(["stair", "lift", "equipment"], bp), beqHouse = sum2(beq, "houseRegistered");
  const mergedEquipment = beq.reduce((t, q) => t + (q.exemptionParts?.shelter ?? 0), 0), globalEquipment = beq.reduce((t, q) => t + (q.exemptionParts?.equipment ?? 0), 0);
  const values = { ...template.values, base: detail.base, bonus: detail.allowed - detail.base, allowed: detail.allowed, renewalApplied: detail.bonus.renewal, tdrApplied: detail.bonus.tdr, scaleApplied: detail.bonus.scale, dangerApplied: detail.bonus.danger, used, aboveCounted: above.reduce((t, f7) => t + f7.counted, 0), basementCounted: bcount, basementExempt: basement - bcount, parkingCap: s.cars * 40, parkingCounted: sum2(of(["car", "accessible_car", "ramp", "driveway"], bp), "counted"), basementEquipmentMerged: mergedEquipment, basementEquipmentGlobalExempt: globalEquipment, basementEquipmentCounted: sum2(beq, "counted"), bicycleCounted: sum2(of(["bicycle"], bp), "counted"), motorcycleCounted: sum2(of(["motorcycle", "accessible_motorcycle"], bp), "counted"), communityCounted: sum2(of(["community"], bp), "counted"), spareCounted: 0, ordinaryCommon: sum2(of(["corridor", "structure"], ap), "houseRegistered"), sale, salePing: sale * 0.3025, common, commonRatio: sale ? common / sale * 100 : 0, basementCommon: bhouse, basementUnassigned: 0, basementSale: bhouse, basementEquipmentSale: beqHouse, shelterCommon: 0, parkingHousingCommon: bhouse - beqHouse, parkingSalesArea, aboveSale: sum2(ap, "houseRegistered") + sum2(rp, "houseRegistered"), registeredEquipment: sum2(of(["stair", "lift", "equipment"], ap), "houseRegistered"), registeredLobby: sum2(of(["lobby"], ap), "houseRegistered"), registeredRoof: sum2(rp, "houseRegistered"), carArea: sum2(of(["car", "accessible_car", "ramp", "driveway"], bp), "area"), motoArea: sum2(of(["motorcycle", "accessible_motorcycle"], bp), "area"), totalSelected: aboveArea + basement - (i.totalBasis === "floor" ? balcony : 0), countedExtras: fr.countedExtras + bcount, ordinary: sum2(of(["dwelling", "corridor", "structure"], ap), "area"), equipment: sum2(of(["stair", "lift", "equipment"], ap), "area"), equipmentCap: detail.equipmentCap, equipmentExempt: fr.equipmentExempt, lobby: fr.lobby, balcony, lobbyExempt: fr.lobbyExempt, balconyExempt: fr.balconyExempt, footprint: area(above[0]?.plate ?? []), roof, above: aboveArea, aboveWithoutBalcony: aboveArea - balcony, units: s.units, cars: s.cars, motos: s.motos, parkingArea: parkingSalesArea, parkingBasis: sum2(of(["dwelling", "lobby", "corridor", "structure"], ap), "area"), basementPlate: Math.max(...below.map((f7) => area(f7.plate))), neededFloors: 4, floors: 4, basement, capacity: s.cars, total: aboveArea + basement, totalWithoutBalcony: aboveArea + basement - balcony, equivalentFloors: above.length, unused: Math.max(0, detail.allowed - used), salesCoefficient: sale / detail.allowed };
  const pv = template.parking?.values, parking = pv && template.parking ? { ...template.parking, legal: s.legalCars, errors: [], notes: s.warnings, values: { ...pv, legal: s.legalCars, marketDemand: 0, requestedExtra: 0, requested: s.legalCars, adoptedExtra: 0, cars: s.cars, availableExtra: 0, remainingExtra: 0, capacity: s.cars, neededFloors: 4, floors: 4, basement, motos: s.motos, bikes: s.bikes, community: s.community, carArea: values.carArea, motoArea: values.motoArea, bikeArea: sum2(of(["bicycle"], bp), "area"), communityArea: sum2(of(["community"], bp), "area"), equipmentArea: sum2(beq, "area"), equipmentPerFloor: sum2(beq, "area") / 4, rampTotal: sum2(of(["ramp"], bp), "area"), lossArea: sum2(of(["structure"], bp), "area"), spareArea: 0, parkingArea: parkingSalesArea, basementCommon: bhouse, legalFormula: `\u9010\u5C64\u7528\u9014\u901A\u5247\u521D\u4F30\uFF1B${s.units}\u6236\uFF0C\u6C7D\u8ECA\u9700\u6C42${s.legalCars}\u4F4D\uFF1B\u4F9D\u5716\u9762\u5BE6\u6392` } } : template.parking;
  const regulatory = "regulatory" in template && template.regulatory ? { ...template.regulatory, bonus: detail.bonus, volume: { ...template.regulatory.volume, shelterArea: area(below[0]?.shelter ?? []), shelterEquipment: mergedEquipment, pools: { basement, cars: s.cars, carArea: values.carArea, motoArea: values.motoArea, bikeArea: sum2(of(["bicycle"], bp), "area"), communityArea: sum2(of(["community"], bp), "area"), rampTotal: sum2(of(["ramp"], bp), "area"), lossArea: sum2(of(["structure"], bp), "area"), equipmentArea: sum2(beq, "area"), spareArea: 0 }, parkingCap: s.cars * 40, carPool: bp.reduce((t, q) => t + (q.exemptionParts?.carSubject ?? 0), 0), carExempt: bp.reduce((t, q) => t + (q.exemptionParts?.car ?? 0), 0), mergedEquipment, globalEquipmentExempt: globalEquipment, equipmentCounted: values.basementEquipmentCounted, parkingCounted: values.parkingCounted, bicycleCounted: values.bicycleCounted, motorcycleCounted: values.motorcycleCounted, communityCounted: values.communityCounted, spareCounted: 0, counted: bcount, exempt: basement - bcount, notes: s.warnings, balanced: Math.abs(basement - bcount - below.reduce((t, f7) => t + f7.exempt, 0)) < 0.02 } } : void 0;
  return { ...template, regulatory, values, legal: s.legalCars, parking, floorReview: fr, spatial: s, errors: [...detail.bonus.errors, ...s.checks.filter((c) => c.status === "conflict").map((c) => c.detail)], notes: [...detail.bonus.notes, ...s.warnings, ...s.checks.filter((c) => c.status === "assumed").map((c) => c.label + "\uFF1A" + c.detail), `App\u4F9D\u9010\u5C64\u5E7E\u4F55\u91CD\u7B97\uFF0C\u5730\u4E0B\u56FA\u5B9A4\u5C64\uFF0C\u672A\u8208\u5EFA\u7684\u5730\u4E0B\u7BC4\u570D${s.unbuiltBasement.toFixed(2)}\u33A1\u4E0D\u5217\u6A13\u677F\u3001\u8A08\u5BB9\u6216\u767B\u8A18\u3002`, `\u92B7\u552E\u4FC2\u6578\uFF1D\u623F\u5C4B\u53EF\u767B\u8A18\u9762\u7A4D${sale.toFixed(2)}\xF7\u5141\u5EFA\u5BB9\u7A4D${detail.allowed.toFixed(2)}\uFF1B\u4E0D\u4EE5\u6B77\u53F2\u4FC2\u6578\u4F5C\u914D\u7F6E\u76EE\u6A19\u3002`] };
}
var spatialCache = /* @__PURE__ */ new Map();
function calculateSpatialResult(i, aggregate) {
  const key = JSON.stringify(i);
  const found = spatialCache.get(key);
  if (found) return found;
  const result = computeSpatialResult(i, aggregate);
  if (spatialCache.size >= 3) spatialCache.delete(spatialCache.keys().next().value);
  spatialCache.set(key, result);
  return result;
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/legalParking.ts
var PARKING_RULE_VERSION = "ntpc-parking.2026-10-17.v2";
var isTaipeiParking = (district) => /臺北|台北/.test(district);
var parkingSources = [
  ["\u5347\u964D\u6A5F\u7B49\u5019\u8207\u8996\u8DDD136\u689D", "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=136"],
  ["\u6A5F\u68B0\u505C\u8ECA\u8A2D\u5099\u898F\u7BC4", "https://www.nlma.gov.tw/ch/legislation/regsearch/934"],
  ["\u7121\u969C\u7919\u8ECA\u4F4D\u8207\u6C7D\u8ECA\u5347\u964D\u6A5F\u51FD\u91CB", "https://www.nlma.gov.tw/ch/titlelist/interpcomp/14073"],
  ["\u81FA\u5317\u5E02\u505C\u8ECA\u7A7A\u9593\u8A2D\u8A08\u6307\u5C0E\u539F\u5247", "https://laws.gov.taipei/Law/LawSearch/LawArticleContent/FL096524"],
  ["\u81FA\u5317\u5E02\u571F\u7BA1\u81EA\u6CBB\u689D\u4F8B86-1\u689D", "https://laws.gov.taipei/law/LawSearch/LawChapterArticle/FL003962?chapterno=14"],
  ["\u65B0\u5317\u5E02\u65BD\u884C\u7D30\u524742\u689D", "https://web.law.ntpc.gov.tw/Scripts/FLAWDOC01.aspx?fcode=C0150108&flno=42"],
  ["\u6C7D\u8ECA\u4F4D\u5C3A\u5BF860\u689D", "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=60"],
  ["\u8ECA\u9053\u5C3A\u5BF861\u689D", "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=61"],
  ["\u4F4F\u5B85\u505C\u8ECA59\u689D", "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=59"],
  ["\u65B0\u5317\u5E02\u6A5F\u8ECA\u8A2D\u7F6E\u8981\u9EDE", "https://web.law.ntpc.gov.tw/Scripts/FLAWDOC01.aspx?fcode=C0170068&flno=2"],
  ["\u7121\u969C\u7919\u505C\u8ECA167-6\u689D", "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=167-6"],
  ["\u65B0\u5317\u5E02\u90FD\u8A2D\u5BE9\u8B70\u539F\u52471140825", "https://www.planning.ntpc.gov.tw/userfiles/1090400/files/\u65B0\u5317\u5E02\u90FD\u5E02\u8A2D\u8A08\u5BE9\u8B70\u539F\u5247114\u5E748\u670825\u65E5\u4FEE\u6B63\u767C\u5E03\u4EE4\u53CA\u898F\u5B9A.pdf"]
];
var newParkingDesign = (district = "", parcel = "", review = "unknown") => ({ version: PARKING_RULE_VERSION, mode: "general", demandMode: "legal", demandPerUnit: "1", bicycleAccess: "shared_ramp", bicycleLiftArea: "9", district, parcel, plan: "", zone: "", reference: "", confirmed: false, rule: "unresolved", unitRate: "1", areaPerCar: "", freeArea: "0", review, floorHeight: "3.2", loss: "10", rowMode: "double", fillRemaining: false });
function isParkingDesign(x) {
  if (!x || typeof x !== "object") return false;
  const p = x;
  return (p.fullVolumeSearch === void 0 || typeof p.fullVolumeSearch === "boolean") && (p.rampWidthMode === void 0 || ["legacy_double", "statutory"].includes(p.rampWidthMode)) && (p.smallSite === void 0 || isSmallSiteParking(p.smallSite)) && (p.demandMode === void 0 || ["legal", "per_unit"].includes(p.demandMode)) && (p.demandPerUnit === void 0 || typeof p.demandPerUnit === "string") && (p.bicycleAccess === void 0 || ["shared_ramp", "lift"].includes(p.bicycleAccess)) && (p.bicycleLiftArea === void 0 || typeof p.bicycleLiftArea === "string") && p.version === PARKING_RULE_VERSION && (p.mode === void 0 || ["general", "case"].includes(p.mode)) && ["district", "parcel", "plan", "zone", "reference", "unitRate", "areaPerCar", "freeArea", "floorHeight", "loss"].every((k) => typeof p[k] === "string") && typeof p.confirmed === "boolean" && typeof p.fillRemaining === "boolean" && ["unresolved", "article59", "perUnit", "perArea"].includes(p.rule) && ["unknown", "yes", "no"].includes(p.review) && ["double", "single"].includes(p.rowMode);
}
function calculateLegalParking(p, c) {
  let general = p?.mode === "general";
  const taipei = isTaipeiParking(p?.district ?? "");
  if (general) p = { ...p, rule: "article59", review: "yes" };
  const errors = [], notes = ["90\u5EA6\u5E73\u9762\u8ECA\u4F4D\u7E3D\u91CF\u4F30\u7B97\uFF1B\u5C1A\u672A\u5B8C\u6210\u57FA\u5730\u5F62\u72C0\u3001\u67F1\u7DB2\u3001\u8F49\u5F4E\u534A\u5F91\u53CA\u9010\u5C64\u6392\u4F4D\u5716\u6AA2\u6838\u3002"];
  const empty = (legal2 = null, capacityFailure = false) => ({ version: PARKING_RULE_VERSION, roughEstimate: general, errors, notes, legal: legal2, values: null, capacityFailure });
  if (!isParkingDesign(p)) {
    errors.push("\u505C\u8ECA\u898F\u5283\u683C\u5F0F\u4E0D\u5B8C\u6574");
    return empty();
  }
  if (!taipei && !p.district.includes("\u65B0\u5317") && !["\u677F\u6A4B", "\u65B0\u838A", "\u4E2D\u548C", "\u6C38\u548C", "\u4E09\u91CD", "\u65B0\u5E97", "\u571F\u57CE", "\u8606\u6D32", "\u6A39\u6797", "\u6C50\u6B62", "\u9DAF\u6B4C", "\u4E09\u5CFD", "\u6DE1\u6C34", "\u745E\u82B3", "\u4E94\u80A1", "\u6CF0\u5C71", "\u6797\u53E3", "\u516B\u91CC", "\u6DF1\u5751", "\u77F3\u7887", "\u576A\u6797", "\u4E09\u829D", "\u77F3\u9580", "\u91D1\u5C71", "\u842C\u91CC", "\u5E73\u6EAA", "\u96D9\u6EAA", "\u8CA2\u5BEE", "\u70CF\u4F86"].some((x) => p.district.includes(x))) errors.push("\u672C\u505C\u8ECA\u914D\u7F6E\u6A21\u7D44\u9650\u5DF2\u67E5\u6838\u7684\u81FA\u5317\u5E02\u6216\u65B0\u5317\u5E02\u898F\u5247");
  if (!general && (!p.parcel.trim() || !p.plan.trim() || !p.zone.trim() || !p.reference.trim() || !p.confirmed || p.rule === "unresolved")) {
    notes.push("\u500B\u6848\u505C\u8ECA\u4F9D\u64DA\u672A\u9F4A\uFF0C\u66AB\u4F9D\u6240\u5728\u5730\u7528\u9014\u901A\u5247\u521D\u4F30\uFF1B\u4FDD\u7559\u539F\u8F38\u5165\uFF0C\u672A\u8996\u70BA\u5DF2\u6838\u5C0D\u6216\u6838\u5B9A\u3002");
    p = { ...p, mode: "general", rule: "article59", review: "yes" };
    general = true;
  }
  if (!taipei && c.reviewRequired && p.review !== "yes") errors.push("\u5DF2\u8A2D\u5B9A\u5BB9\u7A4D\u79FB\u8F49\u76EE\u6A19\uFF0C\u4E0D\u5F97\u7565\u904E\u65B0\u5317\u5E02\u90FD\u5BE9\u505C\u8ECA\u539F\u5247");
  if (!taipei && p.review === "unknown") {
    p = { ...p, review: "yes" };
    notes.push("\u90FD\u5BE9\u9069\u7528\u6027\u672A\u9F4A\uFF0C\u5148\u6309\u9069\u7528\u65B0\u5317\u90FD\u5BE9\u9810\u7559\u9700\u6C42\uFF0C\u5C6C\u660E\u793A\u5047\u8A2D\u3002");
  }
  if (c.storePercent > 0 && !(taipei && general)) errors.push("\u4F4F\u5546\u6DF7\u7528\u9808\u5206\u5217\u5404\u7528\u9014\u6CD5\u5B9A\u505C\u8ECA\u6AA2\u8A0E\uFF1B\u672C\u7248\u7D14\u4F4F\u5B85\u6D41\u7A0B\u4E0D\u4EE3\u586B\u6CD5\u5B9A\u6578");
  const get = (value, label, min = 0, max = 1e8) => {
    const n = Number(value);
    if (!value.trim() || !Number.isFinite(n) || n < min || n > max) {
      errors.push(label + "\u7121\u6548");
      return 0;
    }
    return n;
  };
  const height = get(p.floorHeight, "\u5730\u4E0B\u5C64\u9AD8", 0.1, 10), loss = get(p.loss, "\u67F1\u7DB2\u8207\u8F49\u5F4E\u9810\u7559\u6BD4\u4F8B", 0, 90) / 100;
  let legal = 0;
  const store = c.basis * c.storePercent / 100, residential = c.basis - store;
  const retailCars = Math.min(store, 2e3) / 100 + Math.max(0, Math.min(store - 2e3, 2e3)) / 150 + Math.max(0, Math.min(store - 4e3, 6e3)) / 200 + Math.max(0, store - 1e4) / 250;
  const taipeiGeneral = taipei && general;
  const taipeiFormula = `ceil(\u4F4F\u5B85${residential.toFixed(2)}\xF7120\uFF0B\u7B2C\u4E09\u985E\u5E97\u8216\u5206\u7D1A${retailCars.toFixed(4)})`;
  if (p.rule === "article59") legal = Math.ceil(Math.max(0, c.basis - 500) / 150);
  if (p.rule === "perUnit") legal = Math.ceil(c.units * get(p.unitRate, "\u689D\u6587\u6BCF\u6236\u8ECA\u4F4D\u6578", 0, 20));
  if (p.rule === "perArea") legal = Math.ceil(Math.max(0, c.basis - get(p.freeArea, "\u689D\u6587\u514D\u8A2D\u9762\u7A4D")) / get(p.areaPerCar, "\u689D\u6587\u6BCF\u8ECA\u4F4D\u6A13\u677F\u9762\u7A4D", 1));
  if (taipeiGeneral) legal = Math.ceil(residential / 120 + retailCars);
  if (!Number.isSafeInteger(c.extra) || c.extra < 0) errors.push("\u6307\u5B9A\u589E\u8A2D\u8ECA\u4F4D\u9808\u70BA\u975E\u8CA0\u6574\u6578");
  if (!taipei && !general && p.review === "yes" && c.extra > 0 && legal + c.extra < c.units) errors.push("\u4F9D\u90FD\u5BE9\u539F\u5247\uFF0C\u898F\u5283\u6C7D\u8ECA\u4F4D\u672A\u9054\u6236\u6578\u6642\u61C9\u5168\u5217\u6CD5\u5B9A\u8ECA\u4F4D\uFF0C\u4E0D\u80FD\u5C07\u6307\u5B9A\u6578\u91CF\u5217\u70BA\u589E\u8A2D\uFF1B\u9808\u53E6\u6838\u500B\u6848\u505C\u8ECA\u6AA2\u8A0E");
  if (errors.length) return empty();
  const motos = Math.max(c.motoDemand, taipeiGeneral ? Math.ceil(residential / 100 + store / 200) : p.review === "yes" ? c.units : 0), bikes = !taipei && p.review === "yes" ? Math.ceil(c.units * 0.25) : 0;
  if (motos > 400) {
    errors.push("\u6A5F\u8ECA\u8D85\u904E\u672C\u5171\u7528\u5761\u9053\u6A21\u578B400\u4F4D\u9069\u7528\u4E0A\u9650\uFF1B\u9808\u53E6\u505A\u5C08\u7528\u5761\u9053\u914D\u7F6E\u6AA2\u8A0E");
    return empty(legal);
  }
  const carWidth = 2.5, carLength = 5.5, aisle = 6, motoWidth = 1, motoLength = 2, motoAisle = 1.5;
  const carModule = carWidth * (carLength + aisle / (p.rowMode === "double" ? 2 : 1));
  const motoModule = taipei ? 0.9 * (2.2 + 1.2 / (p.rowMode === "double" ? 2 : 1)) : motoWidth * (motoLength + motoAisle / (p.rowMode === "double" ? 2 : 1));
  const accessible = legal === 0 ? 0 : legal <= 50 ? 1 : Math.ceil((legal - 50) / 100) + 1;
  const accessibleModule = 3.5 * (6 + aisle / (p.rowMode === "double" ? 2 : 1)), accessibleExtra = accessible * (accessibleModule - carModule);
  const community = !taipei && p.review === "yes" && c.units > 10 ? Math.ceil(legal * 0.02) : 0;
  const bicycleAccess = p.bicycleAccess ?? "shared_ramp", rampDenominator = bikes > 0 && bicycleAccess === "shared_ramp" ? 10 : 8;
  const bicycleLiftArea = bikes > 0 && bicycleAccess === "lift" ? get(p.bicycleLiftArea ?? "9", "\u81EA\u884C\u8ECA\u6607\u964D\u6A5F\u53CA\u505C\u7B49\u9810\u7559", 0) : 0;
  const rampWidth = (p.rampWidthMode === "statutory" && taipei && Math.max(legal, p.demandMode === "per_unit" ? Math.ceil(c.units * Number(p.demandPerUnit ?? 1)) : 0) + c.extra < 50 ? 3.5 : 5.5) + (taipei ? 0 : motos > 200 ? 1 : motos > 100 ? 0.5 : 0), rampRun = height * rampDenominator, rampArea = rampWidth * rampRun;
  if (bikes > 0 && p.smallSite?.access !== "lift") notes.push(bicycleAccess === "shared_ramp" ? "\u81EA\u884C\u8ECA\u5171\u7528\u5761\u9053\uFF1A\u4F9D\u65B0\u5317\u90FD\u5BE9\u6309\u4E0D\u9661\u65BC1:10\u521D\u4F30\uFF0C\u6C7D\u6A5F\u8ECA\u540C\u6642\u63A1\u8F03\u7DE9\u5761\u5EA6\u3002" : "\u81EA\u884C\u8ECA\u53E6\u4EE5\u6607\u964D\u6A5F\u9023\u901A\uFF1B\u9762\u7A4D\u70BA\u660E\u793A\u898F\u5283\u9810\u7559\uFF0C\u9808\u6838\u8A2D\u5099\u5C3A\u5BF8\u3001\u4F4D\u7F6E\u53CA\u505C\u7B49\u52D5\u7DDA\u3002");
  const equipmentPerFloor = c.quantityEquipment?.[0] ?? c.plate * c.reserve / 100, afterRamp = c.plate - equipmentPerFloor - rampArea;
  const lossPerFloor = Math.max(0, afterRamp) * loss, netPerFloor = afterRamp - lossPerFloor;
  const accessibleMotos = taipei ? 0 : accessible, motoAccessibleWidth = 2.25, motoAccessibleLength = 2.2, motoAccessibleAisle = 1.8;
  const motoAccessibleExtra = accessibleMotos * Math.max(0, motoAccessibleWidth * (motoAccessibleLength + motoAccessibleAisle / (p.rowMode === "double" ? 2 : 1)) - motoModule);
  const motoArea = motos * motoModule + motoAccessibleExtra, bikeArea = bikes * motoModule, communityArea = community * carModule;
  if (accessibleMotos) notes.push("\u4F9D\u65B0\u5317\u6A5F\u8ECA\u8981\u9EDE5\u9810\u7559\u8207\u6CD5\u5B9A\u7121\u969C\u7919\u6C7D\u8ECA\u76F8\u540C\u6578\u91CF\u4E4B\u6A5F\u8ECA\u4F4D\uFF1B\u6BCF\u683C2.25\xD72.20m\u53CA\u81F3\u5C111.80m\u901A\u8DEF\uFF0C\u901A\u9054\u8DEF\u7DDA\u4ECD\u9808\u6392\u4F4D\u5716\u8986\u6838\u3002");
  const b1Fixed = motoArea + bikeArea + communityArea + accessibleExtra + bicycleLiftArea;
  if (p.smallSite) {
    if (p.fillRemaining) {
      errors.push("\u9010\u5C64\u914D\u7F6E\u8ACB\u4EE5\u898F\u5283\u6C7D\u8ECA\u4F4D\u76EE\u6A19\u6307\u5B9A\u589E\u8A2D\uFF0C\u4E0D\u81EA\u52D5\u63A1\u7528\u5C1A\u672A\u8208\u5EFA\u7684\u5269\u9918\u5BB9\u91CF");
      return empty(legal);
    }
    const marketDemand2 = p.demandMode === "per_unit" ? Math.ceil(c.units * get(p.demandPerUnit ?? "1", "\u5E02\u5834\u6BCF\u6236\u6C7D\u8ECA\u9700\u6C42", 0, 20)) : 0;
    const requested2 = Math.max(Math.max(legal, marketDemand2) + c.extra, p.smallSite.groundCars, p.smallSite.targetCars);
    const advancedAccessible = accessible;
    const advancedExtra = advancedAccessible * (accessibleModule - carModule), advancedMotoExtra = taipei ? 0 : advancedAccessible * Math.max(0, motoAccessibleWidth * (motoAccessibleLength + motoAccessibleAisle / (p.rowMode === "double" ? 2 : 1)) - motoModule);
    const allocation = allocateSmallSite(p.smallSite, { ...c, taipei, review: p.review === "yes", height, loss, legal, requested: requested2, motos, bikes, community, accessible: advancedAccessible, carModule, motoModule, accessibleExtra: advancedExtra, motoAccessibleExtra: advancedMotoExtra, rampArea, bicycleLiftArea: p.smallSite.access === "lift" ? 0 : bicycleLiftArea });
    notes.splice(0, 1, "\u9010\u5C64\u9762\u7A4D\u9810\u7B97\u521D\u4F30\uFF1B\u5347\u964D\u6A5F\u3001\u6A5F\u68B0\u505C\u8ECA\u53CA\u52D5\u7DDA\u4ECD\u9700\u5716\u8AAA\u8207\u8A2D\u5099\u8CC7\u6599\u8986\u6838\u3002");
    notes.push(...allocation.notes);
    if (allocation.values?.smallSite.groundReview) notes.push("\u5730\u9762\u5BA4\u5167\u505C\u8ECA\u3001\u5C08\u7528\u7B49\u5019\u53CA\u6A5F\u9053\u4E0D\u5217\u4F4F\u5B85\u505C\u8ECA\u9762\u7A4D\u6BCD\u6578\uFF1B\u5730\u9762\u975E\u623F\u5C4B\u7528\u9014\u6263\u9664\u5F8C\u91CD\u7B97\u6236\u6578\u53CA\u505C\u8ECA\u9700\u6C42\u3002\u7121\u969C\u7919\u8ECA\u4F4D\u6578\u4F9D\u672C\u6B21\u6CD5\u5B9A\u6578\uFF0C\u4E0D\u56E0\u5E02\u5834\u589E\u8A2D\u81EA\u52D5\u64F4\u5927\u3002");
    if (!allocation.values) {
      errors.push(...allocation.errors);
      return empty(legal, allocation.capacityFailure);
    }
    const a = allocation.values;
    errors.push(...allocation.errors);
    const values = { legal, marketDemand: marketDemand2, requestedExtra: c.extra, requested: requested2, adoptedExtra: a.cars - legal, availableExtra: Math.max(0, a.capacity - legal), remainingExtra: Math.max(0, a.capacity - a.cars), motos, bikes, community, accessible: advancedAccessible, accessibleMotos: taipei ? 0 : advancedAccessible, motoAccessibleExtra: advancedMotoExtra, motoAccessibleWidth, motoAccessibleLength, motoAccessibleAisle, carWidth, carLength, aisle, carModule, motoWidth: taipei ? 0.9 : motoWidth, motoLength: taipei ? 2.2 : motoLength, motoAisle: taipei ? 1.2 : motoAisle, motoModule, bicycleAccess: p.smallSite.access === "lift" ? "lift" : bicycleAccess, bicycleLiftArea: p.smallSite.access === "lift" ? 0 : bicycleLiftArea, rampDenominator: p.smallSite.access === "lift" ? 0 : rampDenominator, rampWidth: p.smallSite.access === "lift" ? 0 : rampWidth, rampRun: p.smallSite.access === "lift" ? 0 : rampRun, rampArea: a.rampTotal / a.floors, equipmentPerFloor, lossPerFloor, netPerFloor, entranceBuffer: p.smallSite.access === "lift" ? 6 : requested2 + community <= 50 ? 4 : 6, legalFormula: taipeiGeneral ? taipeiFormula : p.rule === "article59" ? `ceil((${c.basis.toFixed(2)}\u2212500)\xF7150)` : p.rule === "perUnit" ? `ceil(${c.units}\u6236\xD7${p.unitRate})` : `ceil((${c.basis.toFixed(2)}\u2212${p.freeArea})\xF7${p.areaPerCar})`, ...a };
    return { version: PARKING_RULE_VERSION, roughEstimate: general, errors, notes, legal, values, capacityFailure: false };
  }
  if (netPerFloor <= 0 || b1Fixed > netPerFloor) {
    errors.push("\u5730\u4E0B\u4E00\u5C64\u6263\u9664\u8A2D\u5099\u3001\u5761\u9053\u3001\u6A5F\u8ECA\u3001\u81EA\u884C\u8ECA\u53CA\u793E\u5340\u8ECA\u4F4D\u5F8C\u4E0D\u8DB3\uFF1B\u9808\u8ABF\u6574\u958B\u6316\u6216\u63A1\u5206\u5C64\u5C08\u6848\u914D\u7F6E");
    return empty(legal);
  }
  const b1Capacity = Math.max(0, Math.floor((netPerFloor - b1Fixed) / carModule)), otherCapacity = c.quantityEquipment ? Math.min(...c.quantityEquipment.slice(1).map((eq) => Math.max(0, Math.floor((c.plate - eq - rampArea) * (1 - loss) / carModule)))) : Math.floor(netPerFloor / carModule);
  const marketDemand = p.demandMode === "per_unit" ? Math.ceil(c.units * get(p.demandPerUnit ?? "1", "\u5E02\u5834\u6BCF\u6236\u6C7D\u8ECA\u9700\u6C42", 0, 20)) : 0;
  if (errors.length) return empty(legal);
  const requested = Math.max(legal, marketDemand) + c.extra;
  let neededFloors = 1;
  while (b1Capacity + (neededFloors - 1) * otherCapacity < requested && neededFloors <= 100) neededFloors++;
  if (neededFloors > 100) {
    errors.push("\u76EE\u524D\u914D\u7F6E\u7121\u6CD5\u5BB9\u7D0D\u6CD5\u5B9A\u53CA\u6307\u5B9A\u589E\u8A2D\u8ECA\u4F4D");
    return empty(legal);
  }
  const floors = c.mode === "auto" ? neededFloors : c.floors;
  if (!Number.isSafeInteger(floors) || floors < 1 || floors > 100) {
    errors.push("\u5730\u4E0B\u5C64\u6578\u9808\u70BA1\u81F3100\u7684\u6574\u6578");
    return empty(legal);
  }
  const capacity = b1Capacity + (floors - 1) * otherCapacity;
  if (capacity < requested) errors.push("\u5730\u4E0B\u5BA4\u5BB9\u91CF\u4E0D\u8DB3\u6CD5\u5B9A\u53CA\u6307\u5B9A\u589E\u8A2D\u8ECA\u4F4D");
  const availableExtra = Math.max(0, capacity - legal), cars = p.fillRemaining ? Math.max(requested, capacity) : requested;
  if (!taipei && !general && p.review === "yes" && p.fillRemaining && cars < c.units && cars > legal) {
    errors.push("\u5269\u9918\u5BB9\u91CF\u63A1\u7528\u5F8C\u4ECD\u672A\u9054\u6236\u6578\uFF0C\u4F9D\u90FD\u5BE9\u539F\u5247\u9808\u5168\u5217\u6CD5\u5B9A\uFF1B\u8ACB\u53E6\u6838\u500B\u6848\u505C\u8ECA\u6AA2\u8A0E");
    return empty(legal);
  }
  const remainingExtra = Math.max(0, capacity - cars), adoptedExtra = cars - legal;
  let basement = c.plate * floors;
  const carArea = cars * carModule + accessibleExtra;
  let equipmentArea = equipmentPerFloor * floors + bicycleLiftArea, rampTotal = rampArea * floors, lossArea = lossPerFloor * floors;
  let spareArea = Math.max(0, netPerFloor * floors - b1Fixed - cars * carModule);
  let quantityFloors;
  if (c.quantityEquipment) {
    if (c.mode !== "manual" || floors !== c.quantityEquipment.length) {
      errors.push("\u5177\u540D\u9810\u7559\u9808\u8207\u56FA\u5B9A\u5730\u4E0B\u5C64\u6578\u4E00\u81F4");
      return empty(legal);
    }
    const fixedByFloor = c.quantityEquipment.map((_, j) => j === 0 ? motoArea + bikeArea + communityArea + bicycleLiftArea : j === 1 ? accessibleExtra : 0);
    const caps = c.quantityEquipment.map((eq, j) => Math.max(0, Math.floor(((c.plate - eq - rampArea) * (1 - loss) - fixedByFloor[j]) / carModule)));
    const counts = caps.map(() => 0);
    let left = cars;
    while (left > 0) {
      let progress = false;
      for (const j of [...caps.keys()].slice(1)) {
        if (counts[j] < caps[j] && left > 0) {
          counts[j]++;
          left--;
          progress = true;
        }
      }
      if (!progress) break;
    }
    counts[0] = Math.min(left, caps[0]);
    left -= counts[0];
    quantityFloors = c.quantityEquipment.map((eq, j) => {
      const fixed = fixedByFloor[j], count = counts[j];
      const use = count * carModule + fixed, turn = use * loss / (1 - loss);
      const necessary = eq + rampArea + use + turn;
      const shelterOnly = j === 0 ? Math.max(0, (c.minB1Area ?? 0) + rampArea + bikeArea + communityArea + bicycleLiftArea - necessary) : 0;
      return { label: `B${j + 1}`, cars: count, equipment: eq + (j === 0 ? bicycleLiftArea : 0), ramp: rampArea, fixed: fixed - (j === 0 ? bicycleLiftArea : 0), loss: turn, slab: necessary + shelterOnly, shelterOnly };
    });
    if (left > 0 || quantityFloors.some((f7) => f7.slab > c.plate + 1e-3)) {
      errors.push("\u56FA\u5B9A\u5730\u4E0B\u5C64\u6578\u7684\u5FC5\u8981\u7A7A\u9593\u9810\u7559\u8D85\u51FA\u53EF\u7528\u9762\u7A4D\uFF1B\u9808\u8ABF\u6574\u91CF\u9AD4\u6216\u505C\u8ECA\u9700\u6C42");
      return empty(legal);
    }
    basement = quantityFloors.reduce((a, f7) => a + f7.slab, 0);
    equipmentArea = quantityFloors.reduce((a, f7) => a + f7.equipment, 0);
    lossArea = quantityFloors.reduce((a, f7) => a + f7.loss, 0);
    spareArea = quantityFloors.reduce((a, f7) => a + f7.shelterOnly, 0);
    notes.push("\u5730\u4E0B\u6A13\u677F\u4F9D\u6BCF\u5C64\u5FC5\u8981\u7528\u9014\u52A0\u7E3D\u9810\u7559\uFF0C\u672A\u7528\u958B\u6316\u4E0A\u9650\u4E58\u56DB\u5C64\u7576\u5BE6\u969B\u6A13\u677F\uFF1B\u672A\u8208\u5EFA\u7A7A\u9593\u4E0D\u8A08\u5BB9\u3001\u4E0D\u767B\u8A18\u3001\u4E0D\u5217\u6210\u672C\u9762\u7A4D\u3002B1\u53E6\u5728\u5761\u9053\u3001\u81EA\u884C\u8ECA\u53CA\u793E\u5340\u88DD\u5378\u7B49\u66AB\u4E0D\u5217\u907F\u96E3\u9762\u7A4D\u4E4B\u5916\uFF0C\u7559\u8DB3\u9644\u5EFA\u9632\u7A7A\u907F\u96E3\u517C\u505C\u8ECA\u9762\u7A4D\uFF0C\u8A72\u7528\u9014\u8207\u505C\u8ECA\u5957\u758A\u4E0D\u91CD\u8907\u52A0\u7E3D\u3002\u9019\u662F\u9762\u7A4D\u9810\u7B97\uFF0C\u5C1A\u7121\u9010\u683C\u6392\u4F4D\u8B49\u660E\u3002");
  }
  const parkingArea = carArea + motoArea + bikeArea + communityArea + rampTotal + lossArea;
  const basementCommon = Math.max(0, basement - parkingArea);
  if (!taipei && p.review === "yes") notes.push("\u6A5F\u8ECA\u53CA\u81EA\u884C\u8ECA\u96C6\u4E2DB1\uFF0C\u793E\u5340\u8ECA\u4F4D\u53E6\u5217\u4E14\u4E0D\u5F97\u92B7\u552E\uFF1B\u5730\u9762\u5761\u9053\u5165\u53E3\u53E6\u9700\u5E73\u5730\u7DE9\u885D\u7A7A\u9593\uFF0C\u672A\u8A08\u5165\u5730\u4E0B\u5BB9\u91CF\u3002");
  notes.push("\u8ECA\u4F4D\u4EE5\u6240\u9078\u6CD5\u5B9A\uFF0F\u6BCF\u6236\u5E02\u5834\u9700\u6C42\u53CA\u6307\u5B9A\u589E\u8A2D\u8A08\u7B97\uFF0C\u4E0D\u63A1\u820A\u7248\u96B1\u85CF\u7684\u6BCF\u6236\u9700\u6C42\u6B04\u4F4D\u3002");
  notes.push("\u8A2D\u5099\u68AF\u9593\u6BD4\u4F8B\u3001\u5730\u4E0B\u5C64\u9AD8\u3001\u67F1\u7DB2\u8F49\u5F4E\u9810\u7559\u53CA\u55AE\u6392\uFF0F\u96D9\u6392\u914D\u7F6E\u5747\u70BA\u898F\u5283\u5047\u8A2D\uFF1B\u6CD5\u5B9A\u5C3A\u5BF8\u4E0D\u7B49\u65BC\u57FA\u5730\u5DF2\u6392\u5F97\u4E0B\u3002", "\u65B0\u589E\u53EF\u7528\u5BB9\u91CF\u4E0D\u81EA\u52D5\u5217\u70BA\u53EF\u552E\u8ECA\u4F4D\uFF0C\u9808\u9078\u64C7\u63A1\u7528\u5269\u9918\u5BB9\u91CF\u5F8C\u624D\u66F4\u65B0\u4E0B\u6E38\u3002");
  if (taipeiGeneral) notes.push("\u901A\u5247\u521D\u4F30\uFF1A\u4F9D\u81FA\u5317\u5E02\u571F\u7BA1\u81EA\u6CBB\u689D\u4F8B86-1\u689D\uFF0C\u591A\u6236\u4F4F\u5B85\u6C7D\u8ECA120\u33A1\uFF0F\u4F4D\u3001\u6A5F\u8ECA100\u33A1\uFF0F\u4F4D\uFF1B\u5E97\u8216\u66AB\u63A1\u7B2C\u4E09\u985E\u96F6\u552E\u7528\u9014\u5206\u7D1A\u7D2F\u52A0\uFF0C\u6DF7\u5408\u7528\u9014\u52A0\u7E3D\u5F8C\u53D6\u6574\u3002\u8A08\u7B97\u6A13\u677F\u6392\u9664\u6A5F\u96FB\u53CA\u5C4B\u7A81\uFF0C\u967D\u53F0\u4FDD\u5B88\u8A08\u5165\uFF1B\u5C1A\u672A\u6838\u5C0D\u500B\u6848\u90FD\u5E02\u8A08\u756B\u3001\u5BE6\u969B\u71DF\u696D\u7528\u9014\u53CA\u9010\u68DF\u9762\u7A4D\u3002", "\u81FA\u5317\u5E02\u672A\u5957\u7528\u65B0\u5317\u5E02\u81EA\u884C\u8ECA\u3001\u793E\u5340\u8ECA\u4F4D\u898F\u5247\uFF1B\u6C7D\u6A5F\u8ECA\u5171\u7528\u5761\u9053\u984D\u5916\u52A0\u5BEC\u70BA\u672C\u6848\u898F\u5283\u9810\u7559\uFF0C\u4E26\u975E\u6CD5\u5B9A\u8A8D\u5B9A\u3002");
  if (general && !taipei) notes.push("\u901A\u5247\u521D\u4F30\uFF1A\u66AB\u63A1\u5EFA\u6280\u898F\u524759\u689D\u90FD\u5E02\u8A08\u756B\u5167\u7D14\u4F4F\u5B85\u7B97\u6CD5\uFF1B\u5C1A\u672A\u6838\u5C0D\u500B\u6848\u90FD\u5E02\u8A08\u756B\uFF0C\u4E0D\u4EE3\u8868\u5DF2\u78BA\u8A8D\u6CD5\u5B9A\u8ECA\u4F4D\u3002\u65B0\u5317\u90FD\u5BE9\u7684\u6A5F\u8ECA\u3001\u81EA\u884C\u8ECA\u53CA\u793E\u5340\u8ECA\u4F4D\u9700\u6C42\u4F5C\u524D\u671F\u9810\u7559\u5047\u8A2D\uFF0C\u6CD5\u5B9A\u8207\u81EA\u8A2D\u8A8D\u5B9A\u4ECD\u5F85\u500B\u6848\u8986\u6838\u3002");
  const legalFormula = taipeiGeneral ? taipeiFormula : p.rule === "article59" ? `ceil((${c.basis.toFixed(2)}\u2212500)\xF7150)` : p.rule === "perUnit" ? `ceil(${c.units}\u6236\xD7${p.unitRate})` : `ceil((${c.basis.toFixed(2)}\u2212${p.freeArea})\xF7${p.areaPerCar})`;
  return { version: PARKING_RULE_VERSION, roughEstimate: general, errors, notes, legal, capacityFailure: false, values: { smallSite: void 0, flatCars: cars, mechanicalCars: 0, mechanicalArea: 0, undergroundFlatCars: cars, groundCars: 0, quantityFloors, legal, marketDemand, requestedExtra: c.extra, requested, adoptedExtra, cars, availableExtra, remainingExtra, capacity, neededFloors, floors, basement, motos, bikes, community, accessible, accessibleMotos, motoAccessibleExtra, motoAccessibleWidth, motoAccessibleLength, motoAccessibleAisle, carWidth, carLength, aisle, carModule, motoWidth, motoLength, motoAisle, motoModule, bicycleAccess, bicycleLiftArea, rampDenominator, rampWidth, rampRun, rampArea, rampTotal, equipmentPerFloor, equipmentArea, lossPerFloor, lossArea, netPerFloor, motoArea, bikeArea, communityArea, carArea, parkingArea, basementCommon, spareArea, b1Capacity, otherCapacity, entranceBuffer: cars + community <= 50 ? 4 : 6, legalFormula } };
}

// ../../../../../../src/sanze-cases-desktop/src/lib/planning/autonomousPlanning.ts
var planningFields = [
  ["site", "\u57FA\u5730\u9762\u7A4D", "\u33A1", "base"],
  ["coverage", "\u6CD5\u5B9A\u5EFA\u853D\u7387", "%", "base"],
  ["far", "\u57FA\u6E96\u5BB9\u7A4D\u7387", "%", "base"],
  ["renewal", "\u90FD\u66F4\u734E\u52F5\u76EE\u6A19\uFF08\u4EE5\u57FA\u6E96\u5BB9\u7A4D\u70BA\u6BCD\u6578\uFF09", "%", "base"],
  ["scale", "\u571F\u7BA1\uFF0F\u898F\u6A21\u734E\u52F5\u76EE\u6A19", "%", "base"],
  ["tdr", "\u5BB9\u7A4D\u79FB\u8F49\u76EE\u6A19", "%", "base"],
  ["danger", "\u5371\u8001\u734E\u52F5\u76EE\u6A19", "%", "base"],
  ["coverageUse", "\u6CD5\u5B9A\u5EFA\u7BC9\u9762\u7A4D\u4F7F\u7528\u6BD4\u4F8B", "%", "above"],
  ["volumeUse", "\u5141\u5EFA\u5BB9\u7A4D\u4F7F\u7528\u6BD4\u4F8B", "%", "above"],
  ["equipment", "\u6A5F\u96FB\u7B49\u914D\u7F6E\u6BD4\u4F8B", "%\u5141\u5EFA\u5BB9\u7A4D", "above"],
  ["lobby", "\u68AF\u5EF3\u914D\u7F6E\u6BD4\u4F8B", "%\u5141\u5EFA\u5BB9\u7A4D", "above"],
  ["balcony", "\u967D\u53F0\u914D\u7F6E\u6BD4\u4F8B", "%\u5141\u5EFA\u5BB9\u7A4D", "above"],
  ["roofRate", "\u5C4B\u7A81\u55AE\u5C64\u6295\u5F71\u6BD4\u4F8B", "%\u898F\u5283\u5EFA\u7BC9\u9762\u7A4D", "above"],
  ["roofFloors", "\u5C4B\u7A81\u5C64\u6578", "\u5C64", "above"],
  ["roofHeight", "\u898F\u5283\u5C4B\u7A81\u6BCF\u5C64\u9AD8\u5EA6", "m", "above"],
  ["unitPing", "\u6BCF\u6236\u5730\u4E0A\u5206\u6524\u9762\u7A4D\uFF08\u542B\u5730\u4E0A\u516C\u8A2D\u53CA\u967D\u53F0\uFF0C\u4E0D\u542B\u5C4B\u7A81\u5730\u4E0B\u5BA4\uFF09", "\u576A\uFF0F\u6236", "parking"],
  ["storePercent", "\u5E97\u8216\u7B49\u7B2C\u4E00\u985E\u7528\u9014\u914D\u7F6E\u6BD4\u4F8B", "%\u5730\u4E0A\u6A13\u677F", "parking"],
  ["carPerUnit", "\u5E02\u5834\u898F\u5283\u6C7D\u8ECA\u4F4D\u9700\u6C42", "\u4F4D\uFF0F\u6236", "parking"],
  ["motoPerUnit", "\u6A5F\u8ECA\u4F4D\u898F\u5283\u9700\u6C42", "\u4F4D\uFF0F\u6236", "parking"],
  ["carPing", "\u6BCF\u6C7D\u8ECA\u4F4D\u542B\u8ECA\u9053\u9762\u7A4D", "\u576A\uFF0F\u4F4D", "parking"],
  ["motoSqm", "\u6BCF\u6A5F\u8ECA\u4F4D\u542B\u901A\u9053\u9762\u7A4D", "\u33A1\uFF0F\u4F4D", "parking"],
  ["extraCars", "\u984D\u5916\u5E02\u5834\u6C7D\u8ECA\u4F4D", "\u4F4D", "parking"],
  ["excavation", "\u898F\u5283\u958B\u6316\u7387", "%", "basement"],
  ["excavationCap", "\u500B\u6848\u958B\u6316\u7387\u4E0A\u9650\uFF08\u672A\u78BA\u8A8D\u53EF\u7559\u767D\uFF09", "%", "basement"],
  ["reserve", "\u5730\u4E0B\u8A2D\u5099\u3001\u68AF\u9593\u7B49\u9810\u7559", "%\u5730\u4E0B\u7E3D\u9762\u7A4D", "basement"],
  ["basementFloors", "\u624B\u52D5\u5730\u4E0B\u5C64\u6578\uFF08\u81EA\u52D5\u6A21\u5F0F\u4E0D\u63A1\u7528\uFF09", "\u5C64", "basement"],
  ["basementSalePercent", "\u5730\u4E0B\u975E\u505C\u8ECA\u7A7A\u9593\u53EF\u767B\u8A18\u5206\u6524\u6BD4\u4F8B", "%", "basement"],
  ["localParkingUnit", "\u5730\u65B9\u898F\u5B9A\u6BCF\u6236\u6C7D\u8ECA\u4F4D\u6578\uFF08\u9078\u5730\u65B9\u898F\u5247\u624D\u4F7F\u7528\uFF09", "\u4F4D\uFF0F\u6236", "parking"]
];
var enums = { totalBasis: ["floor", "construction"], stair: ["single", "other"], lobbyDepth: ["assumed", "confirmed", "failed"], roofType: ["ordinary", "high"], elevator: ["yes", "no"], basementMode: ["auto", "manual"], parkingRule: ["demand", "article59", "localUnit"] };
function calculatePlanningPass(i, aboveBudget) {
  const errors = [], notes = [];
  for (const [key, options] of Object.entries(enums)) if (!options.includes(i[key])) errors.push(key + "\u9078\u9805\u7121\u6548");
  const n = {};
  for (const [k, label] of planningFields) {
    if (i.parkingDesign && ["carPerUnit", "carPing", "motoSqm", "localParkingUnit"].includes(k) || k === "excavationCap" && i[k].trim() === "" || k === "basementFloors" && i.basementMode === "auto" || k === "localParkingUnit" && i.parkingRule !== "localUnit") {
      n[k] = 0;
      continue;
    }
    n[k] = Number(i[k]);
    if (!i[k].trim() || !Number.isFinite(n[k]) || n[k] < 0 || n[k] > 1e12) errors.push(label + "\u9808\u586B\u6709\u6548\u975E\u8CA0\u6578");
  }
  for (const k of ["site", "far", "coverage", "coverageUse", "volumeUse", "unitPing", ...i.parkingDesign ? [] : ["carPing"], "excavation"]) if (!(n[k] > 0)) errors.push(k + "\u9808\u5927\u65BC0");
  for (const k of ["coverage", "coverageUse", "volumeUse", "storePercent", "excavation", "excavationCap", "basementSalePercent"]) if (n[k] > 100) errors.push(k + "\u4E0D\u5F97\u8D85\u904E100%");
  if (n.reserve >= 100) errors.push("\u5730\u4E0B\u9810\u7559\u6BD4\u4F8B\u9808\u5C0F\u65BC100%");
  for (const k of ["roofFloors", "extraCars", ...i.basementMode === "manual" ? ["basementFloors"] : []]) if (!Number.isInteger(n[k])) errors.push(k + "\u9808\u6574\u6578");
  if (n.renewal > 0 && n.danger > 0) errors.push("\u90FD\u66F4\u8207\u5371\u8001\u4E0D\u80FD\u5728\u540C\u4E00\u81EA\u4E3B\u60C5\u5883\u4E26\u5217\u734E\u52F5");
  if (n.danger > 0 && n.scale > 0) errors.push("\u5371\u8001\u8207\u571F\u7BA1\uFF0F\u898F\u6A21\u734E\u52F5\u4E0D\u5F97\u76F4\u63A5\u91CD\u8907\u52A0\u7E3D\uFF0C\u9808\u53E6\u6838\u9069\u7528\u5236\u5EA6");
  if (i.excavationCap.trim() && !i.excavationReference.trim()) notes.push("\u958B\u6316\u7387\u4E0A\u9650\u4F86\u6E90\u672A\u586B\uFF0C\u66AB\u4F5C\u660E\u793A\u898F\u5283\u9650\u5236\uFF0C\u4E26\u975E\u5DF2\u78BA\u8A8D\u6CD5\u5B9A\u4E0A\u9650\u3002");
  if (i.excavationCap.trim() && n.excavation > n.excavationCap) errors.push("\u898F\u5283\u958B\u6316\u7387\u8D85\u51FA\u500B\u6848\u4E0A\u9650");
  if (n.roofRate > (i.roofType === "high" ? 15 : 12.5)) errors.push("\u5C4B\u7A81\u6295\u5F71\u8D85\u51FA\u6240\u9078\u985E\u578B\u4E0A\u9650\uFF1B\u672C\u6D41\u7A0B\u4E0D\u81EA\u52D5\u595725\u33A1\u5C0F\u57FA\u5730\u4F8B\u5916");
  if (n.roofFloors > 0 && (!(n.roofHeight > 0) || n.roofHeight * n.roofFloors > (i.elevator === "yes" ? 9 : 6))) errors.push("\u5C4B\u7A81\u7E3D\u9AD8\u5EA6\u4E0D\u7B26\u5408\u6240\u90786\uFF0F9m\u689D\u4EF6\uFF0C\u9808\u8ABF\u6574\u5047\u8A2D\u6216\u53E6\u505A\u5C08\u6848\u6AA2\u8A0E");
  if (!i.parkingDesign && i.parkingRule !== "demand" && !i.parkingReference.trim()) errors.push("\u63A1\u6CD5\u5B9A\u505C\u8ECA\u898F\u5247\u9808\u586B\u9069\u7528\u4F86\u6E90\uFF0C\u4E0D\u80FD\u628A\u9700\u6C42\u6578\u5192\u7A31\u6CD5\u5B9A\u6578");
  if (!i.parkingDesign && i.parkingRule === "article59" && n.storePercent > 0) errors.push("\u7B2C59\u689D\u81EA\u52D5\u6A21\u5F0F\u76EE\u524D\u9650\u7D14\u4F4F\u5B85\uFF1B\u6DF7\u5408\u7528\u9014\u8ACB\u63A1\u500B\u6848\u5730\u65B9\u898F\u5247\u6216\u9700\u6C42\u6982\u4F30");
  if (errors.length) return { errors: [...new Set(errors)], notes, values: null };
  const round = (v) => Math.round(v * 100) / 100;
  const base = n.site * n.far / 100, bonus = base * (n.renewal + n.scale + n.tdr + n.danger) / 100, allowed = base + bonus, used = aboveBudget ?? allowed * n.volumeUse / 100;
  if (i.areaReview && !isAreaReview(i.areaReview)) return { errors: ["\u7B2C162\u689D\u9010\u5C64\u6AA2\u8A0E\u8CC7\u6599\u7121\u6548"], notes, values: null };
  let equipment = allowed * n.equipment / 100, equipmentCap = allowed * (i.stair === "single" ? 0.1 : 0.15), equipmentExempt = Math.min(equipment, equipmentCap);
  let lobby = allowed * n.lobby / 100, balcony = allowed * n.balcony / 100;
  const lobbyCap = i.lobbyDepth === "failed" ? 0 : allowed * 0.1, balconyCap = allowed * 0.1, combinedCap = allowed * 0.15;
  const lobbyRaw = Math.min(lobby, lobbyCap), balconyRaw = Math.min(balcony, balconyCap), joint = lobbyRaw + balconyRaw;
  const exemptFactor = joint > 0 ? Math.min(joint, combinedCap) / joint : 0;
  let lobbyExempt = lobbyRaw * exemptFactor, balconyExempt = balconyRaw * exemptFactor;
  let countedExtras = equipment - equipmentExempt + lobby - lobbyExempt + balcony - balconyExempt, ordinary = used - countedExtras;
  if (ordinary < 0 && !i.areaReview) return { errors: ["\u6A5F\u96FB\u3001\u68AF\u5EF3\u53CA\u967D\u53F0\u7684\u8D85\u9650\u8A08\u5BB9\u9762\u7A4D\u5927\u65BC\u672C\u60C5\u5883\u4F7F\u7528\u5BB9\u7A4D\uFF0C\u8ACB\u8ABF\u6574\u914D\u7F6E"], notes, values: null };
  const footprint = n.site * n.coverage / 100 * n.coverageUse / 100, roof = footprint * n.roofRate / 100 * n.roofFloors;
  const floorReview = i.areaReview ? reviewAboveGround({ used, equipment, equipmentCap, footprint, lobbyRate: n.lobby, balconyRate: n.balcony, lobbyQualified: i.lobbyDepth !== "failed", review: i.areaReview }) : null;
  if (floorReview) {
    errors.push(...floorReview.errors);
    equipment = floorReview.equipment;
    equipmentExempt = floorReview.equipmentExempt;
    lobby = floorReview.lobby;
    balcony = floorReview.balcony;
    lobbyExempt = floorReview.lobbyExempt;
    balconyExempt = floorReview.balconyExempt;
    ordinary = floorReview.ordinary;
    countedExtras = floorReview.countedExtras;
  }
  const actualUsed = floorReview?.counted ?? used;
  const above = ordinary + equipment + lobby + balcony + roof, aboveWithoutBalcony = above - balcony;
  const aboveGround = { base: round(base), bonus: round(bonus), allowed: round(allowed), footprint: round(footprint), equipment: round(equipment), lobby: round(lobby), balcony: round(balcony), roof: round(roof), above: round(above), salePing: round(above * 0.3025) };
  const grossUnitArea = above - roof, rawParkingBasis = ordinary + lobby + (i.parkingDesign && isTaipeiParking(i.parkingDesign.district) ? balcony : 0);
  let units = Math.max(1, Math.ceil(grossUnitArea * 0.3025 / n.unitPing)), parkingBasis = rawParkingBasis;
  let parking = null;
  for (let pass = 0; pass < 8; pass++) {
    const parkingUnits = i.parkingDesign && isTaipeiParking(i.parkingDesign.district) ? units - Math.ceil(units * n.storePercent / 100) : units;
    parking = i.parkingDesign ? calculateLegalParking(i.parkingDesign, { groundPlate: footprint, site: n.site, units: parkingUnits, basis: parkingBasis, plate: n.site * n.excavation / 100, reserve: n.reserve, extra: n.extraCars, motoDemand: Math.ceil(parkingUnits * n.motoPerUnit), storePercent: n.storePercent, mode: i.basementMode, floors: n.basementFloors, reviewRequired: n.tdr > 0, tdrPercent: n.tdr, danger: n.danger, bonusPercent: n.renewal + n.scale + n.tdr + n.danger, ...i.quantityReserve ? { quantityEquipment: i.quantityReserve.basementEquipmentMode === "named" ? Array.from({ length: Math.max(1, n.basementFloors) }, (_, j) => quantityLiftSpaces(i.quantityReserve).basementCore + (i.quantityReserve.basementRooms[j] ?? i.quantityReserve.basementRooms.at(-1) ?? 0)) : i.quantityReserve.reservationMode === "legal_envelope" ? Array.from({ length: Math.max(1, n.basementFloors) }, () => n.site * n.excavation / 100 * (i.quantityReserve.basementReservePercent ?? 25) / 100) : i.quantityReserve.basementRooms.map((a) => a + 54), minB1Area: footprint } : {} }) : null;
    const ground = parking?.values?.smallSite?.groundReview;
    if (!ground) break;
    const nextUnits = Math.max(1, Math.ceil(Math.max(0, grossUnitArea - ground.vehicleReserved) * 0.3025 / n.unitPing));
    const nextBasis = Math.max(0, rawParkingBasis - ground.stallAndAisle - ground.waitingArea - ground.shaftArea);
    if (nextUnits === units && Math.abs(nextBasis - parkingBasis) < 1e-6) break;
    if (pass === 7) {
      errors.push("\u5730\u9762\u7121\u969C\u7919\u7A7A\u9593\u8207\u505C\u8ECA\u9700\u6C42\u53CD\u8986\u8B8A\u52D5\uFF0C\u8ACB\u53E6\u505A\u7528\u9014\u53CA\u505C\u8ECA\u914D\u7F6E\u6AA2\u8A0E");
      break;
    }
    units = nextUnits;
    parkingBasis = nextBasis;
  }
  const demand = Math.ceil(units * n.carPerUnit) + n.extraCars, motos = Math.ceil(units * n.motoPerUnit), article59 = Math.ceil(Math.max(0, parkingBasis - 500) / 150);
  if (parking && !parking.values) return { errors: [...errors, ...parking.errors], notes: [...notes, ...parking.notes], legal: parking.legal, values: null, parking, aboveGround };
  const pv = parking?.values;
  const legal = pv ? pv.legal : i.parkingRule === "article59" ? article59 : i.parkingRule === "localUnit" ? Math.ceil(units * n.localParkingUnit) : null;
  const cars = pv ? pv.cars : Math.max(demand, legal ?? 0), carArea = pv ? pv.carArea : cars * n.carPing / 0.3025, motoArea = pv ? pv.motoArea : motos * n.motoSqm, parkingArea = pv ? pv.parkingArea : carArea + motoArea;
  const basementPlate = n.site * n.excavation / 100, neededFloors = pv ? pv.neededFloors : Math.ceil(parkingArea / (basementPlate * (1 - n.reserve / 100))), floors = pv ? pv.floors : i.basementMode === "auto" ? neededFloors : n.basementFloors, basement = pv?.basement ?? basementPlate * floors, capacity = pv ? pv.capacity : Math.floor(Math.max(0, basement * (1 - n.reserve / 100) - motoArea) / (n.carPing / 0.3025));
  if (parking) {
    errors.push(...parking.errors);
    notes.push(...parking.notes);
  }
  if (capacity < cars) errors.push("\u5730\u4E0B\u5BA4\u4E0D\u8DB3\u898F\u5283\u6C7D\u8ECA\u4F4D\u9700\u6C42\uFF1B\u589E\u52A0\u5730\u4E0B\u5C64\u6578\u6216\u8ABF\u6574\u914D\u7F6E");
  if (i.lobbyDepth === "assumed") notes.push("\u68AF\u5EF3\u6309\u6DE8\u6DF1\u22652m\u7684\u898F\u5283\u5047\u8A2D\u8A08\u7B97\uFF0C\u5C1A\u975E\u5716\u8AAA\u78BA\u8A8D");
  notes.push(i.areaReview ? "\u68AF\u5EF3\u53CA\u967D\u53F0\u9010\u5C64\u63A1\u8A72\u5C64\u6A13\u5730\u677F\u9762\u7A4D\uFF08\u542B\u6A5F\u96FB\u3001\u68AF\u5EF3\uFF0C\u967D\u53F0\u53E6\u5217\uFF09\u6AA2\u8A0E10%\u300110%\u53CA\u5408\u8A0815%\uFF1B\u8D85\u9650\u8A08\u5BB9\uFF0C\u4E0D\u8DE8\u5C64\u632A\u7528\u3002" : "\u6A5F\u96FB\u3001\u68AF\u5EF3\u3001\u967D\u53F0\u63A1\u5141\u5EFA\u5BB9\u7A4D\u4F5C\u7E3D\u91CF\u6982\u4F30\u6BCD\u6578\uFF1B\u9010\u5C64\u5BE6\u969B\u6A13\u677F\u6BCD\u6578\u53CA\u514D\u8A08\u8CC7\u683C\u9808\u5716\u8AAA\u6838\u5C0D\uFF0C\u6BD4\u4F8B\u4E0D\u80FD\u7576\u6838\u5B9A\u9762\u7A4D\u3002", "\u5EFA\u7BC9\u9762\u7A4D\u8207\u7B49\u9762\u7A4D\u6A13\u5C64\u70BA\u7E3D\u91CF\u6A21\u578B\uFF1B\u9053\u8DEF\u659C\u7DDA\u3001\u65E5\u7167\u3001\u9000\u7E2E\u53CA\u9AD8\u9435\u9650\u5EFA\u9808\u53E6\u6838\u5BE6\u969B\u91CF\u9AD4\uFF0C\u4E0D\u80FD\u8996\u70BA\u5DF2\u9A57\u8B49\u53EF\u5BE6\u73FE\u3002", "\u5C4B\u7A81\u6295\u5F71\u8207\u9AD8\u5EA6\u4F9D\u6240\u9078\u689D\u4EF6\u6AA2\u6838\uFF0C\u5C64\u6578\u53CA\u5C64\u9AD8\u662F\u898F\u5283\u5047\u8A2D\uFF1B25\u33A1\u5C0F\u57FA\u5730\u4F8B\u5916\u672A\u81EA\u52D5\u5957\u7528\u3002", "\u8ECA\u9053\u53CA\u6A5F\u8ECA\u9762\u7A4D\u4F9D\u898F\u5283\u6548\u7387\u5047\u8A2D\u8A08\u7B97\uFF0C\u4ECD\u9808\u6AA2\u67E5\u5761\u9053\u3001\u8FF4\u8F49\u3001\u7D50\u69CB\u67F1\u7DB2\u53CA\u5E73\u9762\u53EF\u6392\u6027\u3002");
  if (!i.excavationCap.trim()) notes.push("\u500B\u6848\u6CD5\u5B9A\u958B\u6316\u7387\u672A\u78BA\u8A8D\uFF0C\u73FE\u503C\u5C6C\u898F\u5283\u5047\u8A2D\uFF0C\u4E0D\u8868\u793A\u5DF2\u7B26\u5408\u571F\u7BA1\u9650\u5236\u3002");
  if (!i.parkingDesign && i.parkingRule === "demand") notes.push("\u76EE\u524D\u53EA\u7B97\u5E02\u5834\u505C\u8ECA\u9700\u6C42\uFF1B\u6CD5\u5B9A\u6578\u672A\u8A8D\u5B9A\uFF0C\u65B0\u5317\u5E02\u9808\u5148\u67E5\u9069\u7528\u90FD\u5E02\u8A08\u756B\uFF0C\u7B2C59\u689D\u50C5\u65BC\u672A\u53E6\u8A02\u898F\u5B9A\u6642\u9069\u7528\u3002");
  if (!i.parkingDesign && i.parkingRule === "article59") notes.push("\u7D14\u4F4F\u5B85\u7B2C59\u689D\u505C\u8ECA\u9762\u7A4D\u57FA\u790E\u70BA\u524D\u671F\u4F30\u7B97\uFF1B\u5404\u6392\u9664\u7A7A\u9593\u9808\u9010\u5C64\u6AA2\u8A0E\u3002");
  const basementResidual = pv ? pv.basementCommon : Math.max(0, basement - parkingArea);
  const basementEquipmentPool = i.areaReview ? Math.min(basementResidual, pv?.equipmentArea ?? basement * n.reserve / 100) : basementResidual;
  const parkingPools = { motorcycleSqm: motoArea, bicycleSqm: pv?.bikeArea ?? 0, communitySqm: pv?.communityArea ?? 0, sharedRampSqm: (pv?.rampTotal ?? 0) + (i.quantityReserve ? pv?.lossArea ?? 0 : 0) };
  const commonRule = i.areaReview?.commonPolicy ? resolveCommonPolicy(i.areaReview.commonPolicy, { ...parkingPools, carArea }) : null;
  const allocation = commonRule?.allocation ?? i.areaReview?.registration?.parkingAllocation;
  if (commonRule) notes.push(...commonRule.notes);
  let parkingHousingCommon = 0;
  if (allocation) {
    for (const k of Object.keys(parkingPools)) {
      if (allocation[k] > parkingPools[k] + 1e-3) errors.push("\u623F\u5C4B\u5206\u6524\u9762\u7A4D\u8D85\u904E" + k + "\u73FE\u6709\u9762\u7A4D\uFF0C\u4E0D\u5F97\u91CD\u8907\u6216\u589E\u52A0\u5730\u4E0B\u5BA4");
      parkingHousingCommon += Math.min(allocation[k], parkingPools[k]);
    }
    if (parkingHousingCommon > 0 && !allocation.source.trim()) notes.push("\u505C\u8ECA\u76F8\u95DC\u623F\u5C4B\u6301\u5206\u4F9D\u64DA\u672A\u9F4A\uFF0C\u66AB\u63A1\u5DF2\u8F38\u5165\u9762\u7A4D\u70BA\u660E\u793A\u5206\u914D\u5047\u8A2D\uFF0C\u975E\u6838\u5B9A\u767B\u8A18\u3002");
  }
  const shelterCommon = i.quantityReserve ? pv?.quantityFloors?.reduce((a, f7) => a + f7.shelterOnly, 0) ?? 0 : 0;
  const basementUnassigned = Math.max(0, basementResidual - basementEquipmentPool - shelterCommon), basementEquipmentSale = basementEquipmentPool * n.basementSalePercent / 100;
  const basementCommon = basementEquipmentPool + shelterCommon + parkingHousingCommon, basementSale = basementEquipmentSale + shelterCommon + parkingHousingCommon, parkingSalesArea = parkingArea - parkingHousingCommon;
  const reg = i.areaReview?.registration, registeredEquipment = equipment * (reg?.equipmentPercent ?? 100) / 100, registeredLobby = lobby * (reg?.lobbyPercent ?? 100) / 100, registeredRoof = roof * (reg?.roofPercent ?? 100) / 100;
  const groundParkingDeduction = Math.min(ordinary, pv?.smallSite?.groundReview?.vehicleReserved ?? pv?.smallSite?.groundArea ?? 0);
  const aboveSale = ordinary + balcony + registeredEquipment + registeredLobby + registeredRoof - groundParkingDeduction;
  const sale = aboveSale + basementSale, common = registeredEquipment + registeredLobby + registeredRoof + basementSale, commonRatio = sale ? common / sale * 100 : 0;
  if (i.areaReview) notes.push("\u5C4B\u7A81\u6A5F\u96FB\u66AB\u6309\u5408\u683C\u5C4B\u9802\u7A81\u51FA\u7269\u7528\u9014\u8655\u7406\uFF1B\u5730\u4E0B\u6A5F\u96FB\u53E6\u6309\u7B2C141\u3001142\u689D\u53CA94\uFF0F108\u5E74\u51FD\u6AA2\u8A0E\u660E\u793A\u9632\u7A7A\u907F\u96E3\u914D\u7F6E\u3001\u7B2C60\u689D\u505C\u8ECA\u6C60\u9918\u984D\u8207\u6A5F\u96FB\u7E3D\u4E0A\u9650\uFF0C\u4E0D\u56E0\u5728\u5730\u4E0B\u5C31\u5168\u90E8\u514D\u8A08\u3002", "\u9010\u5C64\u8868\u672A\u63D0\u4F9B\u5716\u8AAA\u6642\u7531App\u4F9D\u898F\u5283\u6295\u5F71\u751F\u6210\uFF0C\u5404\u5C64\u5747\u5C6C\u898F\u5283\u5047\u8A2D\uFF1B\u975E\u5EFA\u7167\u6838\u5B9A\u6A13\u5C64\u3002\u6A5F\u96FB\u7B49\u4ECD\u4F9D\u57FA\u5730\u5BB9\u7A4D10%\uFF0F15%\u7E3D\u91CF\u4E0A\u9650\u5206\u914D\u3002", "\u767B\u8A18\u8207\u514D\u8A08\u5BB9\u7A4D\u5206\u958B\u6AA2\u8A0E\uFF1A\u6A5F\u96FB\u3001\u68AF\u5EF3\u3001\u5C4B\u7A81\u50C5\u6309\u898F\u5283\u53EF\u767B\u8A18\u6BD4\u4F8B\u5217\u5165\uFF1B\u5C08\u6709\uFF0F\u7D04\u5B9A\u5C08\u7528\u6A5F\u96FB\u4E0D\u5F97\u9069\u7528\u514D\u8A08\uFF0C\u9808\u53E6\u6838\u5716\u8AAA\u3002\u5730\u4E0B\u8A2D\u5099\u68AF\u9593\u9810\u7559\u6309\u5206\u6524\u6BD4\u4F8B\u4F30\u5217\u623F\u5C4B\u516C\u8A2D\uFF0C\u672A\u5B9A\u7528\u9014\u9918\u88D5\u4E0D\u5217\u623F\u5C4B\u53EF\u552E\uFF1B\u6A5F\u8ECA\u3001\u81EA\u884C\u8ECA\u3001\u793E\u5340\u8ECA\u4F4D\u53CA\u5171\u7528\u5761\u9053\u9808\u53E6\u6838\u5206\u6524\u5C0D\u8C61\uFF0C\u901A\u5247\u521D\u4F30\u6216\u4F9D\u5206\u914D\u6587\u4EF6\u8986\u6838\u7684\u623F\u5C4B\u6301\u5206\u53EA\u5F9E\u65E2\u6709\u7A7A\u9593\u91CD\u5206\u985E\uFF0C\u4E0D\u91CD\u8907\u5217\u5165\u8ECA\u4F4D\u9762\u7A4D\u3002\u767B\u8A18\u8CC7\u683C\u3001\u670D\u52D9\u5C0D\u8C61\u53CA\u5206\u6524\u4ECD\u5F85\u5EFA\u7269\u6E2C\u91CF\u6210\u679C\u8207\u5206\u914D\u8868\u78BA\u8A8D\u3002");
  if (groundParkingDeduction > 0) notes.push(`\u5730\u9762\u505C\u8ECA\u3001\u7368\u7ACB\u901A\u8DEF\u53CA\u5C08\u7528\u7B49\u5019\u6A5F\u9053${groundParkingDeduction.toFixed(2)}\u33A1\u5148\u5F9E\u65E2\u6709\u5730\u4E0A\u623F\u5C4B\u53EF\u552E\u6263\u9664\uFF1B\u4E0D\u53E6\u589E\u6A13\u677F\u3001\u4E0D\u9810\u8A2D\u53EF\u552E\u6216\u514D\u8A08\u3002\u7B49\u5019\u7A7A\u9593\u4F4D\u7F6E\u53CA\u5EFA\u853D\u4ECD\u5F85\u5716\u8AAA\u3002`);
  const totalSelected = (i.totalBasis === "floor" ? aboveWithoutBalcony : above) + basement;
  notes.push(i.areaReview ? "\u623F\u5C4B\u53EF\u552E\u521D\u4F30\uFF1D\u666E\u901A\u6A13\u677F\uFF0B\u967D\u53F0\uFF0B\u5730\u4E0A\u53EF\u767B\u8A18\u516C\u8A2D\uFF0B\u5C4B\u7A81\u53EF\u767B\u8A18\u90E8\u5206\uFF0B\u5730\u4E0B\u8A2D\u5099\u68AF\u9593\u53EF\u5206\u6524\u90E8\u5206\uFF0B\u4F9D\u901A\u5247\u521D\u4F30\u6216\u6587\u4EF6\u8986\u6838\u7684\u505C\u8ECA\u76F8\u95DC\u623F\u5C4B\u5171\u6709\u6301\u5206\uFF1B\u4E0D\u4EE5\u5730\u4E0B\u9918\u88D5\u88DC\u8DB3\u92B7\u552E\u4FC2\u6578\u3002" : pv ? "\u623F\u5C4B\u53EF\u552E\uFF1D\u5730\u4E0A\u542B\u967D\u53F0\u53CA\u5C4B\u7A81\uFF0B\u5730\u4E0B\u5269\u9918\u975E\u505C\u8ECA\u7A7A\u9593\xD7\u5206\u6524\u6BD4\u4F8B\u3002\u5730\u4E0B\u5DF2\u53E6\u6263\u6C7D\u8ECA\u3001\u6A5F\u8ECA\u3001\u81EA\u884C\u8ECA\u3001\u793E\u5340\u8ECA\u4F4D\u3001\u8D70\u9053\u3001\u5761\u9053\u53CA\u67F1\u7DB2\u8F49\u5F4E\u9810\u7559\uFF1B\u4E0D\u5C07\u4E0D\u53EF\u552E\u8ECA\u4F4D\u5217\u5165\u53EF\u552E\u8ECA\u4F4D\u3002" : "\u623F\u5C4B\u53EF\u552E\u6982\u4F30=\u5730\u4E0A\u9762\u7A4D\uFF08\u542B\u967D\u53F0\u53CA\u5C4B\u7A81\uFF09\uFF0B\u5730\u4E0B\u975E\u6C7D\u6A5F\u8ECA\u505C\u8ECA\u7A7A\u9593\xD7\u53EF\u767B\u8A18\u5206\u6524\u6BD4\u4F8B\uFF1B\u672A\u628A\u8ECA\u4F4D\u9762\u7A4D\u518D\u7B97\u5165\u623F\u5C4B\u3002\u767B\u8A18\u8CC7\u683C\u3001\u5C08\u5171\u6709\u5206\u914D\u53CA\u6CD5\u5B9A\u6A13\u677F\u8207\u967D\u53F0\u53E3\u5F91\u4ECD\u9808\u4F9D\u5716\u8AAA\u6838\u5C0D\u3002");
  const values = { aboveCounted: actualUsed, basementCounted: 0, basementExempt: basement, parkingCap: 0, parkingCounted: 0, basementEquipmentMerged: 0, basementEquipmentGlobalExempt: 0, basementEquipmentCounted: 0, bicycleCounted: 0, motorcycleCounted: 0, communityCounted: 0, spareCounted: 0, ordinaryCommon: 0, salesCoefficient: sale / allowed, renewalApplied: n.renewal, tdrApplied: n.tdr, scaleApplied: n.scale, dangerApplied: n.danger, sale, salePing: sale * 0.3025, common, commonRatio, basementCommon, basementUnassigned, basementSale, basementEquipmentSale, shelterCommon, parkingHousingCommon, parkingSalesArea, aboveSale, registeredEquipment, registeredLobby, registeredRoof, carArea, motoArea, totalSelected, base, bonus, allowed, used: actualUsed, countedExtras, ordinary, equipment, equipmentCap, equipmentExempt, lobby, balcony, lobbyExempt, balconyExempt, footprint, roof, above, aboveWithoutBalcony, units, cars, motos: pv ? pv.motos : motos, parkingArea, parkingBasis, basementPlate, neededFloors, floors, basement, capacity, total: above + basement, totalWithoutBalcony: aboveWithoutBalcony + basement, equivalentFloors: floorReview?.floors.length ?? Math.ceil((above - roof) / footprint), unused: allowed - actualUsed };
  return { errors, notes, legal, parking, aboveGround, floorReview, values: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, round(v)])) };
}
function normalizePlanningInput(input, district, parcel) {
  const disclosed = discloseMissingPlanningInputs(input);
  input = { ...disclosed.input, ...disclosed.notes.length ? { assumptionNotes: [.../* @__PURE__ */ new Set([...input.assumptionNotes ?? [], ...disclosed.notes])] } : {} };
  return { ...input, areaReview: input.areaReview ?? { version: AREA_REVIEW_VERSION, commonPolicy: defaultCommonPolicy() }, regulatoryReview: input.regulatoryReview ? { ...input.regulatoryReview, version: defaultRegulatoryReview().version } : defaultRegulatoryReview(), parkingDesign: input.parkingDesign ?? newParkingDesign(district?.trim() || "\u65B0\u5317\u5E02", parcel ?? input.parkingReference) };
}
function calculatePlanning(input) {
  const disclosed = discloseMissingPlanningInputs(input), i = normalizePlanningInput(disclosed.input);
  if (i.basementDemand?.enabled) {
    if (!isBasementDemand(i.basementDemand)) return { ...calculateAggregatePlanning({ ...i, basementDemand: void 0 }), values: null, errors: ["\u5730\u4E0B\u9700\u6C42\u6AA2\u8A0E\u8CC7\u6599\u7121\u6548"] };
    return calculateDemandBasement(i, calculatePlanning);
  }
  if (i.spatial && !isSpatialInput(i.spatial)) return { ...calculateAggregatePlanning({ ...i, spatial: void 0 }), values: null, errors: ["\u5730\u754C\u6216\u914D\u7F6E\u5047\u8A2D\u683C\u5F0F\u7121\u6548\uFF1B\u672A\u5FFD\u7565\u5730\u754C\u6539\u7528\u7E3D\u91CF\u516C\u5F0F"], notes: [...i.assumptionNotes ?? []] };
  const z = i.quantityReserve ? calculateQuantityPlanning(i, calculateAggregatePlanning) : i.spatial && isSpatialInput(i.spatial) ? calculateSpatialResult(i, calculateAggregatePlanning) : calculateAggregatePlanning(i);
  return { ...z, notes: [.../* @__PURE__ */ new Set([...i.assumptionNotes ?? [], ...disclosed.notes, ...z.notes, ...!i.spatial && !i.quantityReserve ? ["\u5C1A\u672A\u63D0\u4F9B\u5730\u7C4D\u908A\u754C\u8207\u9650\u5236\u689D\u4EF6\uFF1A\u672C\u6B21\u70BA\u660E\u793A\u5C3A\u5BF8\u53CA\u7A7A\u9593\u9810\u7559\u7684\u9762\u7A4D\u521D\u4F30\uFF0C\u5BB9\u91CF\u672A\u7D93\u5BE6\u969B\u6392\u4F4D\u9A57\u8B49\uFF1B\u516C\u8A2D\u6BD4\u4F8B\u4E0D\u662F\u6CD5\u5B9A\u6700\u4F4E\u6BD4\u4F8B\u3002"] : [], ...!input.areaReview ? ["\u820A\u8F38\u5165\u4F9D\u73FE\u884C\u9010\u5C64\u8207\u5730\u4E0B\u6AA2\u8A0E\u91CD\u7B97\uFF0C\u672A\u4F7F\u7528\u820A\u7248\u7E3D\u91CF\u516C\u5F0F\u3002"] : []])] };
}
function calculateAggregatePlanning(input) {
  const i = normalizePlanningInput(input), p = i.regulatoryReview;
  if (!isRegulatoryReview(p)) return { ...calculatePlanningPass(i), errors: ["\u6CD5\u898F\u6AA2\u8A0E\u8CC7\u6599\u683C\u5F0F\u7121\u6548"], values: null };
  const bonus = resolveBonusLimits(p, { renewal: Number(i.renewal), scale: Number(i.scale), tdr: Number(i.tdr), danger: Number(i.danger) }, { site: Number(i.site), far: Number(i.far), district: i.parkingDesign?.district, tdrTarget: Number(i.tdr), roadConditions: i.roadConditions });
  const applied = { ...i, renewal: String(bonus.renewal), scale: String(bonus.scale), tdr: String(bonus.tdr), danger: String(bonus.danger) };
  const first = calculatePlanningPass(applied), allowance = first.values?.allowed ?? first.aboveGround?.allowed ?? 0, target = allowance * Number(i.volumeUse) / 100;
  const evaluate = (budget) => {
    const result = calculatePlanningPass(applied, budget), v2 = result.values, pv = result.parking?.values;
    const volume2 = v2 && pv ? reviewBasementVolume(p, { ...pv }, v2.equipmentExempt, v2.equipmentCap, { footprint: v2.footprint, equipmentPerFloor: pv.equipmentPerFloor, plate: v2.basementPlate, shelterOnly: pv.quantityFloors?.reduce((a, f7) => a + f7.shelterOnly, 0) }) : null;
    return { result, volume: volume2, total: (v2?.used ?? Infinity) + (volume2?.counted ?? 0) };
  };
  if (!first.values && (!first.parking || !first.aboveGround) || bonus.errors.length) return { ...first, errors: [...first.errors, ...bonus.errors], notes: [...first.notes, ...bonus.notes] };
  if (!first.values && !(i.parkingDesign?.fullVolumeSearch && first.parking?.capacityFailure)) return { ...first, errors: [.../* @__PURE__ */ new Set([...first.errors, ...bonus.errors])], notes: [...first.notes, ...bonus.notes] };
  let chosen = evaluate(target);
  if (!i.areaReview?.floors && (!chosen.result.values || chosen.total > target + 1e-4 || chosen.result.errors.length)) {
    let low = Math.min(target, Math.max(0.01, allowance * Math.max(0, Number(i.equipment) / 100 - (i.stair === "single" ? 0.1 : 0.15)) + 0.01)), high = target, best = evaluate(low);
    if (!(best.total <= target && !best.result.errors.length)) {
      for (let step = 1; step <= 128; step++) {
        const budget = target * (1 - step / 128), trial = evaluate(budget);
        if (trial.total <= target && !trial.result.errors.length) {
          low = budget;
          high = target * (1 - (step - 1) / 128);
          best = trial;
          break;
        }
      }
    }
    if (best.total <= target && !best.result.errors.length) {
      for (let j = 0; j < 56; j++) {
        const mid = (low + high) / 2, trial = evaluate(mid);
        if (trial.total <= target + 1e-6 && !trial.result.errors.length) {
          low = mid;
          best = trial;
        } else high = mid;
      }
      chosen = best;
    }
  }
  const z = chosen.result, v = z.values, volume = chosen.volume;
  if (!v || !volume) return { ...z, notes: [...z.notes, ...bonus.notes] };
  const errors = [...z.errors, ...bonus.errors];
  const stairs = reviewEscapeStairs({ aboveFloors: v.equivalentFloors, abovePlate: v.footprint, basementFloors: v.floors, basementPlates: z.parking?.values?.quantityFloors?.map((r) => r.slab) ?? Array.from({ length: v.floors }, () => v.basementPlate) });
  if (i.stair === "single" && stairs.minimum > 1) return { ...z, values: null, errors: ["\u672C\u6B21\u91CF\u9AD4\u4F9D\u6CD5\u9808\u4E8C\u5EA7\u4EE5\u4E0A\u76F4\u901A\u6A13\u68AF\uFF0C\u4E0D\u80FD\u9078\u4F9D\u6CD5\u50C5\u9808\u4E00\u5EA7\u76F4\u901A\u6A13\u68AF\u768410%\u514D\u8A08\u689D\u4EF6", ...stairs.reasons], notes: [...z.notes, stairs.scope] };
  if (!volume.balanced) errors.push("\u5730\u4E0B\u8A08\u5BB9\u8207\u514D\u8A08\u9762\u7A4D\u672A\u5B88\u6046\uFF0C\u8ACB\u6838\u5C0D\u914D\u7F6E");
  if (chosen.total > target + 0.02) errors.push("\u5730\u4E0A\u53CA\u5730\u4E0B\u8A08\u5BB9\u5408\u8A08\u8D85\u904E\u898F\u5283\u4F7F\u7528\u5BB9\u7A4D\uFF1B\u9808\u8ABF\u6574\u81EA\u8A02\u6A13\u677F\u6216\u5730\u4E0B\u7528\u9014\uFF0C\u56FA\u5B9A\u5730\u4E0B\u5C64\u6578\u672A\u8B8A\u66F4");
  const commonPercent = Number(p.ordinaryCommonPercent);
  if (!p.ordinaryCommonPercent.trim() || !Number.isFinite(commonPercent) || commonPercent < 0 || commonPercent > 100) errors.push("\u666E\u901A\u8A08\u5BB9\u6A13\u677F\u516C\u8A2D\u6BD4\u4F8B\u9808\u70BA0\u81F3100%");
  const ordinaryCommon = v.ordinary * (Number.isFinite(commonPercent) ? commonPercent : 0) / 100;
  const common = v.common + ordinaryCommon;
  const values = { ...v, used: Math.round(chosen.total * 100) / 100, aboveCounted: v.used, basementCounted: volume.counted, basementExempt: volume.exempt, countedExtras: v.countedExtras + volume.counted, unused: Math.max(0, v.allowed - chosen.total), parkingCap: volume.parkingCap, parkingCounted: volume.parkingCounted, basementEquipmentMerged: volume.mergedEquipment, basementEquipmentGlobalExempt: volume.globalEquipmentExempt, basementEquipmentCounted: volume.equipmentCounted, bicycleCounted: volume.bicycleCounted, motorcycleCounted: volume.motorcycleCounted, communityCounted: volume.communityCounted, spareCounted: volume.spareCounted, ordinaryCommon, common, commonRatio: v.sale ? common / v.sale * 100 : 0, salesCoefficient: v.sale / v.allowed };
  const notes = [...z.notes, ...bonus.notes, ...volume.notes, ...!first.values ? ["\u539F\u914D\u7F6E\u7684B1\u5FC5\u8981\u7A7A\u9593\u6216\u505C\u8ECA\u5BB9\u91CF\u4E0D\u8DB3\uFF1B\u56FA\u5B9A\u5730\u4E0B\u5C64\u6578\uFF0C\u5DF2\u964D\u4F4E\u5730\u4E0A\u4F7F\u7528\u5BB9\u7A4D\u53CA\u6236\u6578\u5F8C\u7E7C\u7E8C\u521D\u4F30\uFF0C\u4E26\u672A\u589E\u52A0\u5730\u4E0B\u5C64\u6578\u3002"] : [], ...values.unused > 0.1 ? [`\u56FA\u5B9A\u5730\u4E0B${v.floors}\u5C64\u53CA\u672C\u6B21\u914D\u7F6E\u5F8C\uFF0C\u5C1A\u6709${values.unused.toFixed(2)}\u33A1\u5BB9\u7A4D\u672A\u4F7F\u7528\uFF1B\u672A\u70BA\u5403\u6EFF\u5BB9\u7A4D\u81EA\u52D5\u52A0\u6DF1\u5730\u4E0B\u5BA4\u3002`] : [], `\u5730\u4E0A\u8A08\u5BB9${v.used.toFixed(2)}\u33A1\uFF0B\u5730\u4E0B\u8A08\u5BB9${volume.counted.toFixed(2)}\u33A1\uFF1D${chosen.total.toFixed(2)}\u33A1\uFF1B\u5730\u4E0B\u8A08\u5BB9\u5360\u7528\u539F\u5BB9\u7A4D\uFF0C\u672A\u589E\u52A0\u5141\u5EFA\u5BB9\u7A4D\u6216\u5730\u4E0B\u5C64\u6578\u3002`, `\u666E\u901A\u8A08\u5BB9\u6A13\u677F\u5167\u516C\u8A2D\u66AB\u5217${p.ordinaryCommonPercent}%\uFF08${ordinaryCommon.toFixed(2)}\u33A1\uFF09\uFF1B${p.ordinaryCommonSource.trim() || "\u5C1A\u7121\u914D\u7F6E\u6587\u4EF6\uFF0C\u70BA\u53EF\u8ABF\u521D\u4F30\u5047\u8A2D"}\u3002\u53EA\u91CD\u65B0\u5206\u985E\u516C\u8A2D\uFF0C\u4E0D\u91CD\u8907\u589E\u52A0\u53EF\u552E\u9762\u7A4D\u3002`];
  if (i.areaReview?.floors && !i.areaReview.source?.trim()) notes.push("\u81EA\u8A02\u9010\u5C64\u8868\u4F86\u6E90\u672A\u586B\uFF0C\u66AB\u63A1\u8F38\u5165\u914D\u7F6E\u70BA\u898F\u5283\u5047\u8A2D\uFF0C\u5C1A\u975E\u5716\u8AAA\u6838\u5B9A\u3002");
  if (!input.parkingDesign) notes.push("\u820A\u8F38\u5165\u672A\u5E36\u505C\u8ECA\u884C\u653F\u5340\u6642\uFF0C\u66AB\u6309\u65B0\u5317\u4F4F\u5B85\u901A\u5247\u521D\u4F30\uFF1B\u958B\u555F\u6848\u4EF6\u6642\u512A\u5148\u5E36\u5165\u672C\u6848\u884C\u653F\u5340\uFF0C\u4E26\u53EF\u5728\u505C\u8ECA\u8A2D\u5B9A\u8986\u6838\u3002");
  if (!input.areaReview) notes.push("\u820A\u65B9\u6848\u5DF2\u4EE5\u73FE\u884C\u9010\u5C64\u53CA\u5730\u4E0B\u6CD5\u898F\u6838\u5FC3\u91CD\u65B0\u8A66\u7B97\uFF1B\u672A\u4F7F\u7528\u820A\u7248\u7E3D\u91CF\u516C\u5F0F\uFF0C\u4FDD\u5B58\u53CA\u63A1\u7528\u5F8C\u624D\u66F4\u65B0\u6848\u4EF6\u7D50\u679C\u3002");
  return { ...z, errors: [...new Set(errors)], notes: [...new Set(notes)], values, regulatory: { version: p.version, bonus, volume, status: "planning" } };
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/LegalParkingPanel.tsx
import { Fragment as Fragment4, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var f2 = (n) => n.toLocaleString("zh-TW", {
  maximumFractionDigits: 2
});
function LegalParkingPanel({
  input,
  result,
  edit,
  section
}) {
  const p = input.parkingDesign, general = p.mode === "general", taipei = isTaipeiParking(p.district);
  const z = "parking" in result ? result.parking : null;
  const v = z?.values;
  const [alternatives, setAlternatives] = useState(null);
  useEffect(() => setAlternatives(null), [input]);
  const small = p.smallSite;
  const escape = result.values ? reviewEscapeStairs({
    aboveFloors: result.values.equivalentFloors,
    abovePlate: result.values.footprint,
    basementFloors: result.values.floors,
    basementPlates: v?.quantityFloors?.map((r) => r.slab) ?? []
  }) : null;
  const ground = small?.groundAccessibility ?? defaultGroundAccessibility();
  const groundPatch = (patch2) => edit({
    parkingDesign: {
      ...p,
      smallSite: {
        ...defaultSmallSiteParking(),
        ...small,
        groundAccessibility: {
          ...ground,
          ...patch2
        }
      }
    }
  });
  const smallPatch = (x) => {
    setAlternatives(null);
    edit({
      parkingDesign: {
        ...p,
        smallSite: {
          ...small,
          ...x
        },
        fillRemaining: false
      }
    });
  };
  const smallNumber = (label, key, unit) => /* @__PURE__ */ jsxs4("label", { children: [
    /* @__PURE__ */ jsx4(FieldLabel4, { children: label }),
    /* @__PURE__ */ jsxs4("span", { className: "planning-number-unit", children: [
      /* @__PURE__ */ jsx4("input", { "aria-label": label, type: "number", min: "0", step: "any", value: Number.isNaN(small?.[key]) ? "" : String(small?.[key] ?? ""), onChange: (e) => smallPatch({
        [key]: e.target.value === "" ? NaN : Number(e.target.value)
      }) }),
      /* @__PURE__ */ jsx4("span", { children: unit })
    ] })
  ] });
  const compareAlternatives = () => {
    setAlternatives([["\u5761\u9053\uFF0B\u5E73\u9762", "ramp", false], ["\u5347\u964D\u6A5F\uFF0B\u5E73\u9762", "lift", false], ["\u5761\u9053\uFF0B\u6A5F\u68B0", "ramp", true], ["\u5347\u964D\u6A5F\uFF0B\u6A5F\u68B0", "lift", true]].map(([label, access2, mechanical]) => {
      const next = {
        ...input,
        basementMode: "auto",
        parkingDesign: {
          ...p,
          fillRemaining: false,
          smallSite: {
            ...defaultSmallSiteParking(),
            ...small ?? {},
            access: access2,
            mechanical: Boolean(mechanical),
            groundCars: access2 === "lift" ? 1 : 0,
            groundArea: access2 === "lift" ? 31.5 : 0
          }
        }
      };
      return {
        label: String(label),
        input: next,
        result: calculatePlanning(next)
      };
    }));
  };
  const patch = (x) => edit({
    parkingDesign: {
      ...p,
      ...x,
      confirmed: Object.keys(x).every((k) => ["floorHeight", "loss", "rowMode"].includes(k)) ? p.confirmed : false
    }
  });
  const text = (label, key) => /* @__PURE__ */ jsxs4("label", { children: [
    /* @__PURE__ */ jsx4(FieldLabel4, { children: label }),
    /* @__PURE__ */ jsx4("input", { value: p[key], onChange: (e) => patch({
      [key]: e.target.value
    }) })
  ] });
  const number = (label, key, unit) => /* @__PURE__ */ jsxs4("label", { children: [
    /* @__PURE__ */ jsx4(FieldLabel4, { children: label }),
    /* @__PURE__ */ jsxs4("span", { className: "planning-number-unit", children: [
      /* @__PURE__ */ jsx4("input", { type: "number", min: "0", step: "any", value: p[key], onChange: (e) => patch({
        [key]: e.target.value
      }) }),
      /* @__PURE__ */ jsx4("span", { children: unit })
    ] })
  ] });
  return /* @__PURE__ */ jsxs4("div", { className: "legal-parking-panel", children: [
    section === "parking" && /* @__PURE__ */ jsxs4(Fragment4, { children: [
      /* @__PURE__ */ jsxs4("label", { children: [
        /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u5E02\u5834\u6C7D\u8ECA\u9700\u6C42" }),
        /* @__PURE__ */ jsxs4(PublicSelect4, { value: p.demandMode ?? "legal", onChange: (e) => patch({
          demandMode: e.target.value
        }), children: [
          /* @__PURE__ */ jsx4("option", { value: "legal", children: "\u4F9D\u901A\u5247\uFF0F\u6CD5\u5B9A\u6700\u4F4E\uFF0B\u6307\u5B9A\u589E\u8A2D" }),
          /* @__PURE__ */ jsx4("option", { value: "per_unit", children: "\u53E6\u6309\u6BCF\u6236\u9700\u6C42\uFF08\u8207\u6CD5\u5B9A\u53D6\u8F03\u9AD8\uFF09" })
        ] })
      ] }),
      p.demandMode === "per_unit" && /* @__PURE__ */ jsxs4("label", { children: [
        /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u5E02\u5834\u6BCF\u6236\u6C7D\u8ECA\u9700\u6C42" }),
        /* @__PURE__ */ jsx4(PublicNumber4, { type: "number", min: "0", step: "any", value: p.demandPerUnit ?? "1", onChange: (e) => patch({
          demandPerUnit: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxs4("label", { children: [
        /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u505C\u8ECA\u8A08\u7B97\u65B9\u5F0F" }),
        /* @__PURE__ */ jsxs4(PublicSelect4, { value: p.mode ?? "case", onChange: (e) => edit({
          parkingDesign: {
            ...p,
            mode: e.target.value
          }
        }), children: [
          /* @__PURE__ */ jsx4("option", { value: "general", children: "\u901A\u5247\u521D\u4F30\uFF08\u514D\u586B\u5730\u865F\u8207\u689D\u6587\uFF09" }),
          /* @__PURE__ */ jsx4("option", { value: "case", children: "\u500B\u6848\u898F\u5247\u8986\u6838" })
        ] })
      ] }),
      general ? /* @__PURE__ */ jsx4("p", { className: "planning-mode-result", children: taipei ? "\u4F9D\u81FA\u5317\u5E02\u571F\u7BA186-1\u689D\u521D\u4F30\u4F4F\u5B85\u8207\u7B2C\u4E09\u985E\u96F6\u552E\u5E97\u8216\uFF1B\u5BE6\u969B\u7528\u9014\u53CA\u500B\u6848\u90FD\u5E02\u8A08\u756B\u4ECD\u9808\u8986\u6838\u3002" : "\u76EE\u524D\u63A1\u4F4F\u5B85\u505C\u8ECA\u901A\u5247\u53CA\u65B0\u5317\u5E02\u8ECA\u683C\u3001\u8D70\u9053\u6A19\u6E96\u521D\u4F30\uFF1B\u500B\u6848\u5206\u5340\u8CC7\u6599\u53EF\u65BC\u5F8C\u7E8C\u88DC\u5165\u8986\u6838\u3002" }) : /* @__PURE__ */ jsxs4(Fragment4, { children: [
        /* @__PURE__ */ jsx4("h3", { children: "\u500B\u6848\u505C\u8ECA\u4F9D\u64DA" }),
        /* @__PURE__ */ jsxs4("div", { className: "burden-fields", children: [
          text("\u884C\u653F\u5340", "district"),
          text("\u57FA\u5730\u5730\u6BB5\u5730\u865F\u6216\u5730\u5740", "parcel"),
          text("\u9069\u7528\u90FD\u5E02\u8A08\u756B", "plan"),
          text("\u571F\u5730\u4F7F\u7528\u5206\u5340", "zone"),
          text("\u505C\u8ECA\u689D\u6587\u3001\u9801\u78BC\u53CA\u8CC7\u6599\u4F86\u6E90", "reference"),
          /* @__PURE__ */ jsxs4("label", { children: [
            /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u9069\u7528\u8A08\u7B97\u898F\u5247" }),
            /* @__PURE__ */ jsxs4(PublicSelect4, { value: p.rule, onChange: (e) => patch({
              rule: e.target.value
            }), children: [
              /* @__PURE__ */ jsx4("option", { value: "unresolved", children: "\u5F85\u78BA\u8A8D\u57FA\u5730\u9069\u7528\u689D\u6587" }),
              /* @__PURE__ */ jsx4("option", { value: "article59", children: "\u90FD\u5E02\u8A08\u756B\u672A\u53E6\u8A02\uFF1A\u4F4F\u5B85\u7B2C59\u689D" }),
              /* @__PURE__ */ jsx4("option", { value: "perUnit", children: "\u90FD\u5E02\u8A08\u756B\uFF1A\u4F9D\u6BCF\u6236\u8ECA\u4F4D\u6578" }),
              /* @__PURE__ */ jsx4("option", { value: "perArea", children: "\u90FD\u5E02\u8A08\u756B\uFF1A\u4F9D\u6A13\u677F\u9762\u7A4D" })
            ] })
          ] }),
          p.rule === "perUnit" && number("\u689D\u6587\u898F\u5B9A\u6BCF\u6236\u6C7D\u8ECA\u4F4D", "unitRate", "\u4F4D\uFF0F\u6236"),
          p.rule === "perArea" && /* @__PURE__ */ jsxs4(Fragment4, { children: [
            number("\u689D\u6587\u6BCF\u8ECA\u4F4D\u6A13\u677F\u9762\u7A4D", "areaPerCar", "\u33A1\uFF0F\u4F4D"),
            number("\u689D\u6587\u514D\u8A2D\u9762\u7A4D", "freeArea", "\u33A1")
          ] }),
          /* @__PURE__ */ jsxs4("label", { children: [
            /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u65B0\u5317\u5E02\u90FD\u5BE9\u539F\u5247" }),
            /* @__PURE__ */ jsxs4(PublicSelect4, { value: p.review, onChange: (e) => patch({
              review: e.target.value
            }), children: [
              /* @__PURE__ */ jsx4("option", { value: "unknown", children: "\u9069\u7528\u6027\u5F85\u78BA\u8A8D" }),
              /* @__PURE__ */ jsx4("option", { value: "yes", children: "\u9069\u7528\uFF08\u542B\u6A5F\u8ECA\u3001\u81EA\u884C\u8ECA\u8207\u793E\u5340\u8ECA\u4F4D\uFF09" }),
              /* @__PURE__ */ jsx4("option", { value: "no", children: "\u4E0D\u9069\u7528\uFF08\u4F9D\u500B\u6848\u8CC7\u6599\u6838\u5C0D\uFF09" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs4("label", { className: "planning-checkbox", children: [
          /* @__PURE__ */ jsx4("input", { type: "checkbox", checked: p.confirmed, onChange: (e) => edit({
            parkingDesign: {
              ...p,
              confirmed: e.target.checked
            }
          }) }),
          "\u5DF2\u4F9D\u57FA\u5730\u5206\u5340\u8CC7\u6599\u6838\u5C0D\u4E0A\u8FF0\u689D\u6587\u53CA\u90FD\u5BE9\u9069\u7528\u6027"
        ] })
      ] })
    ] }),
    section === "basement" && /* @__PURE__ */ jsx4(BasementDemandPanel, { input, result, edit }),
    section === "basement" && escape && /* @__PURE__ */ jsxs4("section", { className: "area-review-panel", "aria-label": "\u6CD5\u898F\u76F4\u901A\u6A13\u68AF\u6AA2\u8A0E", children: [
      /* @__PURE__ */ jsx4("h3", { children: "\u76F4\u901A\u6A13\u68AF\u8207\u5B89\u5168\u68AF\u6CD5\u898F\u6AA2\u8A0E" }),
      /* @__PURE__ */ jsxs4("p", { children: [
        "\u672C\u6B21\u91CF\u9AD4\u81F3\u5C11",
        escape.minimum,
        "\u5EA7\u76F4\u901A\u6A13\u68AF\u3002\u5730\u4E0A\u901A\u9054\u6A13\u5C64\u6309",
        escape.aboveType,
        "\u3001\u5730\u4E0B\u6309",
        escape.basementType,
        "\u6AA2\u8A0E\u3002\u672C\u6B21\u6838\u5FC3\u9810\u75592\u5EA7\u6A13\u68AF\u3002"
      ] }),
      /* @__PURE__ */ jsxs4("p", { children: [
        escape.reasons.join("\uFF1B"),
        "\u3002",
        escape.scope
      ] }),
      /* @__PURE__ */ jsxs4("p", { children: [
        /* @__PURE__ */ jsx4("a", { href: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=95", children: "\u7B2C95\u689D\u6A13\u68AF\u6578\u91CF" }),
        " \uFF0F ",
        /* @__PURE__ */ jsx4("a", { href: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=96", children: "\u7B2C96\u689D\u5B89\u5168\u68AF" }),
        " \uFF0F ",
        /* @__PURE__ */ jsx4("a", { href: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=97", children: "\u7B2C97\u689D\u69CB\u9020" })
      ] })
    ] }),
    section === "basement" && input.quantityReserve && /* @__PURE__ */ jsxs4("section", { className: "area-review-panel", "aria-label": "\u8F09\u4EBA\u96FB\u68AF\u914D\u7F6E", children: [
      /* @__PURE__ */ jsx4("h3", { children: "\u8F09\u4EBA\u96FB\u68AF\u8207\u5171\u7528\u6838\u5FC3" }),
      /* @__PURE__ */ jsx4("div", { className: "planning-field-grid", children: /* @__PURE__ */ jsxs4("label", { children: [
        /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u8F09\u4EBA\u96FB\u68AF\u5EA7\u6578" }),
        /* @__PURE__ */ jsxs4(PublicSelect4, { "aria-label": "\u8F09\u4EBA\u96FB\u68AF\u5EA7\u6578", value: input.quantityReserve.passengerLiftCount ?? 2, onChange: (e) => edit({
          quantityReserve: {
            ...input.quantityReserve,
            passengerLiftCount: Number(e.target.value),
            sharedEmergencyLift: Number(e.target.value) === 1
          }
        }), children: [
          /* @__PURE__ */ jsx4("option", { value: "1", children: "1\u5EA7\uFF0C\u517C\u7528\u6240\u9700\u529F\u80FD" }),
          /* @__PURE__ */ jsx4("option", { value: "2", children: "2\u5EA7\uFF1A\u4E00\u822C\u53CA\u7DCA\u6025\u96FB\u68AF\u5206\u5217" }),
          /* @__PURE__ */ jsx4("option", { value: "3", children: "3\u5EA7" }),
          /* @__PURE__ */ jsx4("option", { value: "4", children: "4\u5EA7" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs4("p", { children: [
        "\u6C7D\u8ECA\u5347\u964D\u6A5F\u53E6\u8A08\u3002\u672C\u6B21\u8F09\u4EBA\u96FB\u68AF",
        quantityLiftSpaces(input.quantityReserve).count,
        "\u5EA7\uFF0C\u5730\u4E0B\u6BCF\u5C64\u6838\u5FC3",
        f2(quantityLiftSpaces(input.quantityReserve).basementCore),
        "\u33A1\uFF1B\u6A5F\u9053\u6BCF\u5EA77.5\u33A1\u70BA\u898F\u5283\u5C3A\u5BF8\u5047\u8A2D\u3002\u6BCF\u5EA7\u6A5F\u9053\u4F9D\u8F38\u5165\u6578\u91CF\u8A08\u5165\u6838\u5FC3\u9762\u7A4D\u3002"
      ] })
    ] }),
    section === "basement" && /* @__PURE__ */ jsxs4("section", { className: "area-review-panel", "aria-label": "\u7121\u5761\u9053\u7121\u969C\u7919\u6AA2\u8A0E", children: [
      /* @__PURE__ */ jsx4("h3", { children: "\u7121\u5761\u9053\u6642\u7684\u5730\u9762\u7121\u969C\u7919\u8ECA\u4F4D" }),
      /* @__PURE__ */ jsx4("p", { children: "\u4E00\u822C\u8ECA\u4F4D\u4ECD\u8A2D\u5730\u4E0B\uFF1B\u63A1\u6C7D\u8ECA\u5347\u964D\u6A5F\u6642\uFF0C\u4F9D\u672C\u6B21\u7121\u969C\u7919\u9700\u6C42\u53E6\u7559\u5730\u9762\u5E73\u9762\u8ECA\u4F4D\uFF0C\u5305\u542B\u65BC\u6C7D\u8ECA\u7E3D\u6578\u3002" }),
      /* @__PURE__ */ jsxs4("div", { className: "planning-field-grid", children: [
        /* @__PURE__ */ jsxs4("label", { children: [
          /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u5730\u9762\u7121\u969C\u7919\u914D\u7F6E\u689D\u4EF6" }),
          /* @__PURE__ */ jsxs4(PublicSelect4, { "aria-label": "\u5730\u9762\u7121\u969C\u7919\u914D\u7F6E\u689D\u4EF6", value: ground.available ? "reserve" : "unavailable", onChange: (e) => groundPatch({
            available: e.target.value === "reserve"
          }), children: [
            /* @__PURE__ */ jsx4("option", { value: "reserve", children: "\u4F9D\u660E\u793A\u5C3A\u5BF8\u9810\u7559\uFF0C\u5E73\u9762\u5716\u5F85\u6838" }),
            /* @__PURE__ */ jsx4("option", { value: "unavailable", children: "\u5DF2\u77E5\u7121\u6CD5\u7559\u8A2D\uFF0C\u6392\u9664\u5347\u964D\u6A5F\u65B9\u6848" })
          ] })
        ] }),
        [["routeWidth", "\u7368\u7ACB\u7121\u969C\u7919\u901A\u8DEF\u6DE8\u5BEC", "m"], ["routeLength", "\u7368\u7ACB\u7121\u969C\u7919\u901A\u8DEF\u9577\u5EA6", "m"], ["otherArea", "\u5730\u9762\u9580\u5EF3\u6838\u5FC3\u53CA\u5176\u4ED6\u7528\u9014", "\u33A1"]].map(([key, label, unit]) => /* @__PURE__ */ jsxs4("label", { children: [
          /* @__PURE__ */ jsx4(FieldLabel4, { children: label }),
          /* @__PURE__ */ jsxs4("span", { className: "planning-number-unit", children: [
            /* @__PURE__ */ jsx4("input", { "aria-label": label, type: "number", min: "0", step: "any", value: ground[key], onChange: (e) => groundPatch({
              [key]: e.target.value === "" ? NaN : Number(e.target.value)
            }) }),
            /* @__PURE__ */ jsx4("span", { children: unit })
          ] })
        ] }, key)),
        /* @__PURE__ */ jsxs4("label", { children: [
          /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u500B\u6848\u5730\u9762\u914D\u7F6E\u9762\u7A4D\u4E0A\u9650" }),
          /* @__PURE__ */ jsxs4("span", { className: "planning-number-unit", children: [
            /* @__PURE__ */ jsx4("input", { "aria-label": "\u500B\u6848\u5730\u9762\u914D\u7F6E\u9762\u7A4D\u4E0A\u9650", type: "number", min: "0", step: "any", value: ground.areaCap ?? "", onChange: (e) => groundPatch({
              areaCap: e.target.value === "" ? void 0 : Number(e.target.value)
            }) }),
            /* @__PURE__ */ jsx4("span", { children: "\u33A1" })
          ] }),
          /* @__PURE__ */ jsx4("small", { children: "\u7559\u767D\u63A1\u672C\u6B21\u898F\u5283\u5EFA\u7BC9\u9762\u7A4D\uFF0C\u53EF\u4F9D\u57FA\u5730\u53EF\u914D\u7F6E\u7BC4\u570D\u8ABF\u4F4E\u3002" })
        ] })
      ] }),
      /* @__PURE__ */ jsx4("p", { children: "\u8ECA\u683C\u63093.5\xD76m\uFF0C\u53E6\u8A08\u8ECA\u9053\u8207\u7368\u7ACB\u901A\u8DEF\uFF1B\u7B49\u5019\u5340\u3001\u6A5F\u9053\u3001\u9580\u5EF3\u53CA\u5176\u4ED6\u7528\u9014\u4E0D\u91CD\u758A\u3002\u901A\u8DEF\u9810\u8A2D1.5m\xD74m\u3001\u5176\u4ED6\u7528\u901454\u33A1\u70BA\u898F\u5283\u5047\u8A2D\u3002" })
    ] }),
    section === "basement" && !input.basementDemand?.enabled && /* @__PURE__ */ jsxs4("section", { className: "small-site-parking", "aria-label": "\u5C0F\u57FA\u5730\u66FF\u4EE3\u914D\u7F6E", children: [
      /* @__PURE__ */ jsx4("h3", { children: "\u505C\u8ECA\u65B9\u5F0F\u8207\u5206\u5C64\u914D\u7F6E" }),
      /* @__PURE__ */ jsx4("p", { className: "planning-mode-result", children: "\u5148\u6AA2\u67E5\u5761\u9053\u5E73\u9762\u914D\u7F6E\uFF1B\u4E0D\u8DB3\u6642\u6BD4\u8F03\u66FF\u4EE3\u65B9\u5F0F\u3002\u66FF\u4EE3\u65B9\u6848\u9808\u6838\u500B\u6848\u6CD5\u898F\uFF0C\u8A08\u7B97\u4E0D\u7B49\u65BC\u5BE9\u8B70\u901A\u904E\u3002" }),
      /* @__PURE__ */ jsx4("button", { type: "button", className: "secondary-btn", onClick: compareAlternatives, children: "\u6BD4\u8F03\u66FF\u4EE3\u914D\u7F6E" }),
      alternatives && /* @__PURE__ */ jsxs4("div", { className: "burden-table", children: [
        /* @__PURE__ */ jsxs4("table", { children: [
          /* @__PURE__ */ jsx4("thead", { children: /* @__PURE__ */ jsxs4("tr", { children: [
            /* @__PURE__ */ jsx4("th", { children: "\u65B9\u5F0F" }),
            /* @__PURE__ */ jsx4("th", { children: "\u8A08\u7B97\u8207\u689D\u4EF6" }),
            /* @__PURE__ */ jsx4("th", { children: "\u63A1\u7528" })
          ] }) }),
          /* @__PURE__ */ jsx4("tbody", { children: alternatives.map((a) => /* @__PURE__ */ jsxs4("tr", { children: [
            /* @__PURE__ */ jsx4("th", { children: a.label }),
            /* @__PURE__ */ jsx4("td", { children: a.result.values && !a.result.errors.length ? `\u5730\u4E0B${a.result.values.floors}\u5C64\uFF0C${a.result.values.cars}\u4F4D\uFF0C\u7E3D\u6A13\u677F${f2(a.result.values.totalWithoutBalcony)}\u33A1\uFF1B\u6CD5\u898F\u8207\u8A2D\u5099\u689D\u4EF6\u5F85\u8986\u6838` : a.result.errors.join("\uFF1B") }),
            /* @__PURE__ */ jsx4("td", { children: /* @__PURE__ */ jsx4("button", { type: "button", className: "secondary-btn", disabled: !a.result.values || a.result.errors.length > 0, onClick: () => {
              edit(a.input);
              setAlternatives(null);
            }, children: "\u63A1\u6B64\u65B9\u5F0F\u8A66\u7B97" }) })
          ] }, a.label)) })
        ] }),
        /* @__PURE__ */ jsx4("small", { children: "\u6BD4\u8F03\u6642\u81EA\u52D5\u641C\u5C0B\u5730\u4E0B\u5C64\u6578\uFF1B\u5347\u964D\u6A5F\u4F9D\u9700\u6C42\u53E6\u7559\u5FC5\u8981\u5730\u9762\u7121\u969C\u7919\u8ECA\u4F4D\u3001\u7368\u7ACB\u901A\u8DEF\u53CA\u5730\u9762\u7A7A\u9593\uFF0C\u6A5F\u68B0\u6578\u91CF\u7531\u9700\u6C42\u53CA\u5404\u5C64\u9762\u7A4D\u641C\u5C0B\uFF0C\u6BCF\u6A21\u7D44\u66AB\u63A12\u4F4D\u3002\u6578\u503C\u53EF\u65BC\u63A1\u7528\u5F8C\u4FEE\u6539\u3002" })
      ] }),
      /* @__PURE__ */ jsxs4("label", { children: [
        /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u914D\u7F6E\u6A21\u578B" }),
        /* @__PURE__ */ jsxs4(PublicSelect4, { "aria-label": "\u914D\u7F6E\u6A21\u578B", value: small ? "layered" : "legacy", onChange: (e) => {
          setAlternatives(null);
          edit({
            parkingDesign: {
              ...p,
              fillRemaining: false,
              smallSite: e.target.value === "layered" ? defaultSmallSiteParking() : void 0
            }
          });
        }, children: [
          /* @__PURE__ */ jsx4("option", { value: "legacy", children: "\u4E00\u822C\u5761\u9053\u5E73\u9762\u914D\u7F6E" }),
          /* @__PURE__ */ jsx4("option", { value: "layered", children: "\u9010\u5C64\u9762\u7A4D\u914D\u7F6E\u8207\u66FF\u4EE3\u505C\u8ECA" })
        ] })
      ] }),
      small && /* @__PURE__ */ jsxs4(Fragment4, { children: [
        /* @__PURE__ */ jsxs4("label", { children: [
          /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u6A5F\u68B0\u505C\u8ECA\u8A2D\u5099\u985E\u578B" }),
          /* @__PURE__ */ jsxs4(PublicSelect4, { "aria-label": "\u6A5F\u68B0\u505C\u8ECA\u8A2D\u5099\u985E\u578B", value: small.mechanicalType ?? "stacked", onChange: (e) => smallPatch({
            mechanicalType: e.target.value
          }), children: [
            /* @__PURE__ */ jsx4("option", { value: "stacked", children: "\u5806\u758A\u6A21\u7D44\u5F0F" }),
            /* @__PURE__ */ jsx4("option", { value: "warehouse", children: "\u5009\u5132\u5F0F\u81EA\u52D5\u505C\u8ECA" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "burden-fields", children: [
          /* @__PURE__ */ jsxs4("label", { children: [
            /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u5730\u4E0B\u5C64\u6578\u8A08\u7B97\u65B9\u5F0F" }),
            /* @__PURE__ */ jsxs4(PublicSelect4, { "aria-label": "\u5730\u4E0B\u5C64\u6578\u8A08\u7B97\u65B9\u5F0F", value: input.basementMode, onChange: (e) => edit({
              basementMode: e.target.value
            }), children: [
              /* @__PURE__ */ jsx4("option", { value: "auto", children: "\u4F9D\u672C\u6B21\u9700\u6C42\u641C\u5C0B\u6240\u9700\u5C64\u6578" }),
              /* @__PURE__ */ jsx4("option", { value: "manual", children: "\u56FA\u5B9A\u5730\u4E0B\u5C64\u6578" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs4("label", { children: [
            /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u6C7D\u8ECA\u901A\u884C\u65B9\u5F0F" }),
            /* @__PURE__ */ jsxs4(PublicSelect4, { "aria-label": "\u6C7D\u8ECA\u901A\u884C\u65B9\u5F0F", value: small.access, onChange: (e) => smallPatch({
              access: e.target.value
            }), children: [
              /* @__PURE__ */ jsx4("option", { value: "ramp", children: "\u5761\u9053" }),
              /* @__PURE__ */ jsx4("option", { value: "lift", children: "\u6C7D\u8ECA\u5347\u964D\u6A5F" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs4("label", { children: [
            /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u8ECA\u4F4D\u914D\u7F6E" }),
            /* @__PURE__ */ jsxs4(PublicSelect4, { "aria-label": "\u8ECA\u4F4D\u914D\u7F6E", value: small.mechanical ? "mechanical" : "flat", onChange: (e) => smallPatch({
              mechanical: e.target.value === "mechanical"
            }), children: [
              /* @__PURE__ */ jsx4("option", { value: "flat", children: "\u5E73\u9762\u8ECA\u4F4D" }),
              /* @__PURE__ */ jsx4("option", { value: "mechanical", children: "\u5E73\u9762\u8207\u6A5F\u68B0\u8ECA\u4F4D\u6DF7\u5408" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs4("label", { children: [
            /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u6A5F\u8ECA\u8207\u81EA\u884C\u8ECA\u6A13\u5C64" }),
            /* @__PURE__ */ jsxs4(PublicSelect4, { "aria-label": "\u6A5F\u8ECA\u8207\u81EA\u884C\u8ECA\u6A13\u5C64", value: small.allocation, onChange: (e) => smallPatch({
              allocation: e.target.value
            }), children: [
              /* @__PURE__ */ jsx4("option", { value: "b1", children: "\u96C6\u4E2DB1" }),
              /* @__PURE__ */ jsx4("option", { value: "distributed", children: "\u9010\u5C64\u914D\u7F6E\uFF08\u65B0\u5317\u9808\u53E6\u6838\u4F8B\u5916\uFF09" })
            ] })
          ] }),
          smallNumber("\u984D\u5916\u898F\u5283\u7E3D\u91CF\u4E0B\u9650\uFF080\u4F9D\u9700\u6C42\uFF0C\u4E0D\u5FC5\u586B\uFF09", "targetCars", "\u4F4D"),
          smallNumber("\u5730\u9762\u8ECA\u4F4D\u4E0B\u9650\uFF08\u5FC5\u8981\u7121\u969C\u7919\u53E6\u81EA\u52D5\u7559\u8A2D\uFF09", "groundCars", "\u4F4D"),
          smallNumber("\u5730\u9762\u505C\u8ECA\u8207\u8D70\u9053\u9810\u7559", "groundArea", "\u33A1")
        ] }),
        /* @__PURE__ */ jsxs4("details", { children: [
          /* @__PURE__ */ jsx4("summary", { children: "\u8A2D\u5099\u5C3A\u5BF8\u8207\u64CD\u4F5C\u7A7A\u9593" }),
          small.access === "lift" && /* @__PURE__ */ jsxs4(Fragment4, { children: [
            /* @__PURE__ */ jsx4("h4", { children: "\u6C7D\u8ECA\u5347\u964D\u6A5F\u8207\u7B49\u5019\u7A7A\u9593" }),
            /* @__PURE__ */ jsxs4("div", { className: "burden-fields", children: [
              smallNumber("\u6C7D\u8ECA\u5347\u964D\u6A5F\u6578", "liftCount", "\u90E8"),
              smallNumber("\u5347\u964D\u6A5F\u9053\u5BEC\u5EA6", "shaftWidth", "m"),
              smallNumber("\u5347\u964D\u6A5F\u9053\u9577\u5EA6", "shaftLength", "m"),
              smallNumber("\u6BCF\u90E8\u5730\u9762\u7B49\u5019\u5BEC\u5EA6", "waitingWidth", "m"),
              smallNumber("\u6BCF\u90E8\u5730\u9762\u7B49\u5019\u6DF1\u5EA6", "waitingDepth", "m"),
              smallNumber("\u5730\u4E0B\u6BCF\u5C64\u642D\u4E58\u8207\u8F49\u5411\u9810\u7559", "landingArea", "\u33A1"),
              smallNumber("\u5169\u8F2A\u5BA2\u8CA8\u5347\u964D\u8207\u505C\u7B49\u9810\u7559", "twoWheelLiftArea", "\u33A1")
            ] }),
            /* @__PURE__ */ jsx4("p", { className: "planning-mode-result", children: "\u6A5F\u9053\u81F3\u5C113.5\xD75.7m\uFF1B\u5730\u9762\u524D\u65B9\u6BCF\u90E8\u53E6\u75596\xD76m\u7B49\u5019\u3002\u7121\u969C\u7919\u8ECA\u4F4D\u53E6\u7559\u5730\u9762\uFF0C\u4E0D\u80FD\u8207\u7B49\u5019\u5340\u91CD\u758A\uFF1B\u6A5F\u8ECA\u53CA\u81EA\u884C\u8ECA\u53E6\u6838\u9023\u901A\u8A2D\u5099\u3002" })
          ] }),
          small.mechanical && /* @__PURE__ */ jsxs4(Fragment4, { children: [
            /* @__PURE__ */ jsx4("h4", { children: "\u6A5F\u68B0\u505C\u8ECA\u8A2D\u5099\u5047\u8A2D" }),
            small.mechanicalType === "warehouse" && /* @__PURE__ */ jsxs4("div", { className: "burden-fields", children: [
              smallNumber("\u5009\u5132\u642C\u904B\u901A\u9053\u5BEC\u5EA6", "warehouseAisleWidth", "m"),
              smallNumber("\u6BCF\u5C64\u51FA\u5165\u5EAB\u5E73\u53F0", "warehouseTransferArea", "\u33A1"),
              smallNumber("\u6BCF\u5C64\u8A2D\u5099\u7DAD\u4FEE\u7A7A\u9593", "warehouseEquipmentArea", "\u33A1")
            ] }),
            /* @__PURE__ */ jsxs4("div", { className: "burden-fields", children: [
              smallNumber("\u6307\u5B9A\u6A5F\u68B0\u6578\uFF080\u7531\u914D\u7F6E\u641C\u5C0B\uFF09", "targetMechanical", "\u4F4D"),
              smallNumber("\u6BCF\u7D44\u5782\u76F4\u53EF\u505C\u6578", "mechanicalSpaces", "\u4F4D"),
              smallNumber("\u6A5F\u68B0\u55AE\u6C34\u5E73\u4F4D\u7F6E\u5BEC\u5EA6", "mechanicalWidth", "m"),
              smallNumber("\u6A5F\u68B0\u4F4D\u7F6E\u9577\u5EA6", "mechanicalLength", "m"),
              smallNumber("\u6BCF\u8ECA\u6DE8\u9AD8", "mechanicalClearHeight", "m"),
              smallNumber("\u8A2D\u5099\u6240\u9700\u7E3D\u9AD8\u5EA6", "mechanicalHeight", "m"),
              smallNumber("\u6881\u53CA\u8A2D\u5099\u4E0A\u65B9\u9810\u7559", "overhead", "m"),
              smallNumber("\u6A5F\u5751\u589E\u52A0\u53EF\u7528\u9AD8\u5EA6", "pit", "m")
            ] }),
            /* @__PURE__ */ jsx4("p", { className: "planning-mode-result", children: "\u6BCF\u7D44\u53E6\u8A08\u6240\u9078\u55AE\u6392\uFF0F\u96D9\u6392\u5206\u914D\u76846m\u8D70\u9053\uFF1B\u4EE5\u6574\u7D44\u5411\u4E0A\u53D6\u6574\u5360\u7528\u9762\u7A4D\uFF0C\u8ECA\u4F4D\u4F9D\u5BE6\u969B\u63A1\u7528\u6578\u8A08\u3002\u8A2D\u5099\u9AD8\u5EA6\u542B\u7D50\u69CB\u8207\u6A5F\u69CB\uFF0C\u6A5F\u5751\u4E0D\u662F\u5730\u4E0B\u5C64\u6578\uFF1B\u9808\u6838\u8A2D\u5099\u5716\u3002" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs4("details", { children: [
          /* @__PURE__ */ jsx4("summary", { children: "\u500B\u6848\u898F\u5247\u8207\u9010\u5C64\u6A13\u677F" }),
          /* @__PURE__ */ jsxs4("label", { children: [
            /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u5730\u65B9\u8207\u500B\u6848\u5BE9\u8B70\u72C0\u614B" }),
            /* @__PURE__ */ jsxs4(PublicSelect4, { "aria-label": "\u5730\u65B9\u8207\u500B\u6848\u5BE9\u8B70\u72C0\u614B", value: small.localReview, onChange: (e) => smallPatch({
              localReview: e.target.value
            }), children: [
              /* @__PURE__ */ jsx4("option", { value: "unknown", children: "\u5C1A\u672A\u78BA\u8A8D\uFF0C\u50C5\u4F5C\u9644\u689D\u4EF6\u8A66\u7B97" }),
              /* @__PURE__ */ jsx4("option", { value: "confirmed", children: "\u5DF2\u6709\u5BE9\u8B70\u53CA\u914D\u7F6E\u4F9D\u64DA" }),
              /* @__PURE__ */ jsx4("option", { value: "failed", children: "\u5DF2\u78BA\u8A8D\u4E0D\u5141\u8A31" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs4("label", { children: [
            /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u5BE9\u8B70\u8207\u8A2D\u5099\u4F9D\u64DA" }),
            /* @__PURE__ */ jsx4("textarea", { "aria-label": "\u5BE9\u8B70\u8207\u8A2D\u5099\u4F9D\u64DA", value: small.reviewSource, onChange: (e) => smallPatch({
              reviewSource: e.target.value
            }) })
          ] }),
          !taipei && /* @__PURE__ */ jsxs4("label", { children: [
            /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u63A5\u53D7\u57FA\u5730\u7A4D\u5206\uFF08\u5BB9\u79FB\u4F8B\u5916\u6AA2\u6838\uFF09" }),
            /* @__PURE__ */ jsx4("input", { "aria-label": "\u63A5\u53D7\u57FA\u5730\u7A4D\u5206", value: small.tdrPoints, onChange: (e) => smallPatch({
              tdrPoints: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxs4("label", { children: [
            /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u5404\u5C64\u6A13\u677F\u9762\u7A4D\u33A1\uFF08\u7531B1\u8D77\uFF0C\u4EE5\u9017\u865F\u5206\u9694\uFF1B\u7559\u767D\u4F9D\u958B\u6316\u4E0A\u9650\u4F30\u7B97\uFF09" }),
            /* @__PURE__ */ jsx4("input", { "aria-label": "\u5404\u5C64\u6A13\u677F\u9762\u7A4D", value: small.floorPlates?.join(",") ?? "", onChange: (e) => smallPatch({
              floorPlates: e.target.value.trim() ? e.target.value.split(",").map(Number) : void 0
            }) })
          ] })
        ] })
      ] })
    ] }),
    section === "basement" && /* @__PURE__ */ jsxs4(Fragment4, { children: [
      /* @__PURE__ */ jsx4("h3", { children: "\u8ECA\u683C\u3001\u8ECA\u9053\u8207\u9810\u7559\u7A7A\u9593" }),
      /* @__PURE__ */ jsxs4("div", { className: "burden-fields", children: [
        number(input.basementDemand?.enabled ? "\u4E00\u822C\u65B9\u6848\u5730\u4E0B\u5C64\u9AD8\uFF08\u8A2D\u5099\u53E6\u6AA2\u67E5\uFF09" : "\u5730\u4E0B\u5BA4\u6BCF\u5C64\u9AD8\u5EA6", "floorHeight", "m"),
        number("\u67F1\u7DB2\u53CA\u8F49\u5F4E\u984D\u5916\u9810\u7559", "loss", "%"),
        /* @__PURE__ */ jsxs4("label", { children: [
          /* @__PURE__ */ jsx4(FieldLabel4, { children: "90\u5EA6\u5E73\u9762\u505C\u8ECA\u6392\u5217" }),
          /* @__PURE__ */ jsxs4(PublicSelect4, { value: p.rowMode, onChange: (e) => patch({
            rowMode: e.target.value
          }), children: [
            /* @__PURE__ */ jsx4("option", { value: "double", children: "\u96D9\u6392\u5171\u75286m\u8D70\u9053\uFF08\u898F\u5283\u5047\u8A2D\uFF09" }),
            /* @__PURE__ */ jsx4("option", { value: "single", children: "\u55AE\u6392\u914D\u7F6E6m\u8D70\u9053\uFF08\u898F\u5283\u5047\u8A2D\uFF09" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs4("label", { children: [
        /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u81EA\u884C\u8ECA\u901A\u884C\u65B9\u5F0F" }),
        /* @__PURE__ */ jsxs4(PublicSelect4, { value: p.bicycleAccess ?? "shared_ramp", onChange: (e) => patch({
          bicycleAccess: e.target.value
        }), children: [
          /* @__PURE__ */ jsx4("option", { value: "shared_ramp", children: "\u5171\u7528\u5761\u9053\u63091:10\uFF08\u4E0D\u9661\u65BC\u81EA\u884C\u8ECA\u9650\u5236\uFF09" }),
          /* @__PURE__ */ jsx4("option", { value: "lift", children: "\u53E6\u8A2D\u81EA\u884C\u8ECA\u6607\u964D\u6A5F\u9023\u901A" })
        ] })
      ] }),
      p.bicycleAccess === "lift" && /* @__PURE__ */ jsxs4("label", { children: [
        /* @__PURE__ */ jsx4(FieldLabel4, { children: "\u81EA\u884C\u8ECA\u6607\u964D\u6A5F\u53CA\u505C\u7B49\u9810\u7559\u33A1" }),
        /* @__PURE__ */ jsx4(PublicNumber4, { type: "number", min: "0", value: p.bicycleLiftArea ?? "9", onChange: (e) => patch({
          bicycleLiftArea: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxs4("p", { className: "planning-mode-result", children: [
        v?.smallSite?.access === "lift" ? "\u672C\u6B21\u63A1\u6C7D\u8ECA\u5347\u964D\u6A5F\uFF1B\u4E0B\u5217\u5761\u9053\u689D\u4EF6\u50C5\u7528\u65BC\u5761\u9053\u65B9\u6848\u6BD4\u8F03\u3002" : "",
        "\u6C7D\u8ECA\u683C2.5\xD75.5m\uFF1B\u7121\u969C\u7919\u683C3.5\xD76m\uFF1B\u505C\u8ECA\u8D70\u90536m\u3002\u6C7D\u6A5F\u8ECA\u5171\u7528\u5761\u9053\u63091:8\uFF1B\u5171\u7528\u81EA\u884C\u8ECA\u52D5\u7DDA\u6642\u65391:10\uFF0C\u81FA\u5317\u672A\u905450\u4F4D\u53EF\u63A1\u55AE\u8ECA\u90533.5m\uFF0C50\u4F4D\u4EE5\u4E0A\u96D9\u8ECA\u90535.5m\uFF1B\u65B0\u5317\u5171\u7528\u5761\u9053\u53E6\u4F9D\u6A5F\u8ECA\u6578\u6AA2\u8A0E\u52A0\u5BEC\u3002"
      ] }),
      /* @__PURE__ */ jsxs4("label", { className: "planning-checkbox", children: [
        /* @__PURE__ */ jsx4("input", { type: "checkbox", disabled: Boolean(small) || Boolean(input.basementDemand?.enabled && !p.fillRemaining), checked: p.fillRemaining, onChange: (e) => edit({
          parkingDesign: {
            ...p,
            fillRemaining: e.target.checked
          }
        }) }),
        "\u5C07\u4F30\u7B97\u5269\u9918\u5BB9\u91CF\u5168\u90E8\u63A1\u70BA\u589E\u8A2D\u8ECA\u4F4D"
      ] }),
      input.basementDemand?.enabled && /* @__PURE__ */ jsx4("p", { children: "\u9700\u6C42\u641C\u5C0B\u4EE5\u6307\u5B9A\u589E\u8A2D\u8ECA\u4F4D\u91CD\u7B97\u6A13\u677F\u53CA\u5BB9\u7A4D\uFF1B\u4E0D\u5C07\u672A\u8208\u5EFA\u5BB9\u91CF\u76F4\u63A5\u63A1\u7528\u3002\u5DF2\u6709\u52FE\u9078\u8ACB\u5148\u53D6\u6D88\uFF0C\u518D\u81F3\u6236\u6578\u8207\u505C\u8ECA\u8ABF\u6574\u589E\u8A2D\u9700\u6C42\u3002" })
    ] }),
    v && /* @__PURE__ */ jsxs4(Fragment4, { children: [
      /* @__PURE__ */ jsxs4("section", { className: "le-parking-overview", "aria-label": "\u505C\u8ECA\u914D\u7F6E\u521D\u4F30", children: [
        /* @__PURE__ */ jsxs4("div", { className: "le-parking-total", children: [
          /* @__PURE__ */ jsx4("span", { children: "\u898F\u5283\u6C7D\u8ECA\u4F4D" }),
          /* @__PURE__ */ jsxs4("strong", { children: [
            v.cars,
            /* @__PURE__ */ jsx4("small", { children: "\u4F4D" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "le-parking-capacity", children: [
          /* @__PURE__ */ jsxs4("p", { children: [
            general ? "\u901A\u5247\u6CD5\u5B9A\u9700\u6C42" : "\u6CD5\u5B9A\u9700\u6C42",
            " ",
            /* @__PURE__ */ jsx4("b", { children: z?.legal }),
            " \u4F4D\uFF0C",
            v.smallSite ? "\u958B\u6316\u7BC4\u570D\u6F5B\u5728\u5BB9\u91CF" : "\u5730\u4E0B\u5BA4\u4F30\u7B97\u5BB9\u91CF",
            " ",
            /* @__PURE__ */ jsx4("b", { children: v.capacity }),
            " \u4F4D\u3002"
          ] }),
          /* @__PURE__ */ jsx4("div", { className: "le-parking-capacity-track", role: "img", "aria-label": `\u898F\u5283${v.cars}\u4F4D\uFF0C\u5BB9\u91CF${v.capacity}\u4F4D`, children: /* @__PURE__ */ jsx4("span", { style: {
            width: Math.min(100, v.capacity > 0 ? v.cars / v.capacity * 100 : 0) + "%"
          } }) }),
          /* @__PURE__ */ jsx4("p", { children: v.smallSite ? `\u5C1A\u53EF\u898F\u5283${v.remainingExtra}\u4F4D\uFF0C\u589E\u8A2D\u9808\u91CD\u65B0\u8A08\u7B97\u6A13\u677F\u8207\u5BB9\u7A4D\u3002` : v.cars > v.capacity ? "\u76EE\u524D\u898F\u5283\u8D85\u51FA\u4F30\u7B97\u5BB9\u91CF\uFF0C\u8ACB\u8ABF\u6574\u914D\u7F6E\u3002" : `\u672C\u6B21\u914D\u7F6E\u5F8C\uFF0C\u4F30\u7B97\u5C1A\u9918${v.remainingExtra}\u4F4D\u3002` })
        ] })
      ] }),
      /* @__PURE__ */ jsxs4("details", { className: "le-parking-extras", children: [
        /* @__PURE__ */ jsx4("summary", { children: "\u589E\u8A2D\u8ECA\u4F4D\u660E\u7D30" }),
        /* @__PURE__ */ jsxs4("dl", { children: [
          /* @__PURE__ */ jsxs4("div", { children: [
            /* @__PURE__ */ jsx4("dt", { children: "\u6307\u5B9A\u589E\u8A2D" }),
            /* @__PURE__ */ jsxs4("dd", { children: [
              input.extraCars || "0",
              " \u4F4D"
            ] })
          ] }),
          /* @__PURE__ */ jsxs4("div", { children: [
            /* @__PURE__ */ jsx4("dt", { children: "\u672C\u6B21\u63A1\u7528\u589E\u8A2D" }),
            /* @__PURE__ */ jsxs4("dd", { children: [
              v.adoptedExtra,
              " \u4F4D"
            ] })
          ] })
        ] })
      ] })
    ] }),
    v && /* @__PURE__ */ jsxs4(Fragment4, { children: [
      /* @__PURE__ */ jsxs4("p", { className: "planning-mode-result", children: [
        "\u5730\u4E0B",
        v.floors,
        "\u5C64 \xB7 ",
        v.smallSite ? `\u5E73\u9762${v.flatCars}\u4F4D\uFF08\u5730\u9762${v.groundCars}\u4F4D\uFF09\u3001\u6A5F\u68B0${v.mechanicalCars}\u4F4D` : `B1\u4F30\u7B97${v.b1Capacity}\u4F4D\uFF0C\u5176\u4ED6\u6BCF\u5C64${v.otherCapacity}\u4F4D`,
        " \xB7 \u7121\u969C\u7919\u6C7D\u8ECA",
        v.accessible,
        "\u4F4D\u5305\u542B\u65BC\u7E3D\u8ECA\u4F4D\uFF0C\u7121\u969C\u7919\u6A5F\u8ECA",
        v.accessibleMotos,
        "\u4F4D\uFF082.25\xD72.20m\u3001\u901A\u8DEF\u81F3\u5C111.80m\uFF09\uFF1B\u793E\u5340",
        v.community,
        "\u4F4D\u53E6\u5217\u4E14\u4E0D\u53EF\u552E"
      ] }),
      section === "parking" && /* @__PURE__ */ jsxs4("p", { className: "planning-mode-result", children: [
        general ? "\u901A\u5247\u4F30\u7B97\u5217\u5F0F" : "\u6CD5\u5B9A\u6578\u5217\u5F0F",
        "\uFF1A",
        v.legalFormula,
        "\uFF1D",
        v.legal,
        "\u4F4D\uFF1B\u6A5F\u8ECA",
        v.motos,
        "\u4F4D\u3001\u81EA\u884C\u8ECA",
        v.bikes,
        "\u4F4D\u3002"
      ] }),
      section === "basement" && /* @__PURE__ */ jsx4("div", { className: "burden-table", children: /* @__PURE__ */ jsxs4("table", { children: [
        /* @__PURE__ */ jsx4("thead", { children: /* @__PURE__ */ jsxs4("tr", { children: [
          /* @__PURE__ */ jsx4("th", { children: "\u5730\u4E0B\u7A7A\u9593\u5206\u914D" }),
          /* @__PURE__ */ jsx4("th", { children: "\u9762\u7A4D" })
        ] }) }),
        /* @__PURE__ */ jsx4("tbody", { children: [["\u5730\u4E0B\u7E3D\u9762\u7A4D", v.basement], ["\u8A2D\u5099\u53CA\u68AF\u9593\u9810\u7559", v.equipmentArea], [v.smallSite?.access === "lift" ? "\u5347\u964D\u6A5F\u9053\u3001\u642D\u4E58\u53CA\u5169\u8F2A\u9023\u901A\uFF08\u5404\u5C64\u5408\u8A08\uFF09" : "\u5761\u9053\uFF08\u6BCF\u5C64\u53E6\u6263\uFF09", v.rampTotal], ["\u67F1\u7DB2\u53CA\u8F49\u5F4E\u984D\u5916\u9810\u7559", v.lossArea], ["\u6A5F\u8ECA\u53CA\u901A\u9053", v.motoArea], ["\u81EA\u884C\u8ECA\u53CA\u901A\u9053", v.bikeArea], ["\u793E\u5340\u8ECA\u4F4D\u53CA\u8D70\u9053\uFF08\u4E0D\u53EF\u552E\uFF09", v.communityArea], ["\u898F\u5283\u6C7D\u8ECA\u4F4D\u53CA\u8D70\u9053\uFF08\u542B\u7121\u969C\u7919\uFF09", v.carArea], [input.quantityReserve ? "B1\u907F\u96E3\u88DC\u8DB3\u9762\u7A4D\uFF08\u5047\u8A2D\uFF09" : "\u914D\u7F6E\u5F8C\u5269\u9918\u7A7A\u9593", v.spareArea]].map(([label, value]) => /* @__PURE__ */ jsxs4("tr", { children: [
          /* @__PURE__ */ jsx4("th", { children: label }),
          /* @__PURE__ */ jsxs4("td", { children: [
            f2(Number(value)),
            "\u33A1"
          ] })
        ] }, label)) })
      ] }) }),
      /* @__PURE__ */ jsxs4("small", { children: [
        general ? "\u901A\u5247\u521D\u4F30\uFF0C\u5C1A\u672A\u6838\u5C0D\u500B\u6848\u90FD\u5E02\u8A08\u756B\u3002" : "",
        "\u5BB9\u91CF\u70BA\u9762\u7A4D\u53CA\u9010\u5C64\u53D6\u6574\u4F30\u7B97\uFF0C\u4ECD\u9808\u6392\u4F4D\u5716\u78BA\u8A8D\uFF1B\u5730\u9762\u5165\u53E3\u7DE9\u885D\u53E6\u7559",
        v.entranceBuffer,
        "m\uFF0C\u4E0D\u7D0D\u5165\u5730\u4E0B\u53EF\u505C\u9762\u7A4D\u3002"
      ] })
    ] }),
    v?.smallSite && /* @__PURE__ */ jsxs4(Fragment4, { children: [
      /* @__PURE__ */ jsx4("p", { className: "planning-mode-result", children: v.smallSite.status === "conditional" ? "\u4F9D\u672C\u6B21\u8A2D\u5099\u8207\u914D\u7F6E\u689D\u4EF6\u8A66\u7B97\u3002" : "\u4F9D\u5DF2\u586B\u500B\u6848\u8CC7\u6599\u8A66\u7B97\u3002" }),
      /* @__PURE__ */ jsx4("div", { className: "burden-table", children: /* @__PURE__ */ jsxs4("table", { children: [
        /* @__PURE__ */ jsx4("thead", { children: /* @__PURE__ */ jsxs4("tr", { children: [
          /* @__PURE__ */ jsx4("th", { children: "\u6A13\u5C64" }),
          /* @__PURE__ */ jsx4("th", { children: "\u5E73\u9762" }),
          /* @__PURE__ */ jsx4("th", { children: "\u6A5F\u68B0" }),
          /* @__PURE__ */ jsx4("th", { children: "\u6A5F\u8ECA" }),
          /* @__PURE__ */ jsx4("th", { children: "\u81EA\u884C\u8ECA" }),
          /* @__PURE__ */ jsx4("th", { children: "\u6A13\u677F\u33A1" })
        ] }) }),
        /* @__PURE__ */ jsxs4("tbody", { children: [
          v.groundCars > 0 && /* @__PURE__ */ jsxs4("tr", { children: [
            /* @__PURE__ */ jsx4("th", { children: "\u5730\u9762\uFF08\u5FC5\u8981\u7121\u969C\u7919\uFF09" }),
            /* @__PURE__ */ jsx4("td", { children: v.groundCars }),
            /* @__PURE__ */ jsx4("td", { children: "0" }),
            /* @__PURE__ */ jsx4("td", { children: "0" }),
            /* @__PURE__ */ jsx4("td", { children: "0" }),
            /* @__PURE__ */ jsx4("td", { children: "\u65E2\u6709\u5730\u4E0A\u6A13\u677F\u5167" })
          ] }),
          v.smallSite.rows.map((r) => /* @__PURE__ */ jsxs4("tr", { children: [
            /* @__PURE__ */ jsx4("th", { children: r.label }),
            /* @__PURE__ */ jsx4("td", { children: r.flat }),
            /* @__PURE__ */ jsx4("td", { children: r.mechanical }),
            /* @__PURE__ */ jsx4("td", { children: r.motos }),
            /* @__PURE__ */ jsx4("td", { children: r.bikes }),
            /* @__PURE__ */ jsx4("td", { children: f2(r.used) })
          ] }, r.label))
        ] })
      ] }) }),
      v.smallSite.groundReview && /* @__PURE__ */ jsxs4("div", { className: "burden-table", children: [
        /* @__PURE__ */ jsxs4("table", { children: [
          /* @__PURE__ */ jsx4("thead", { children: /* @__PURE__ */ jsxs4("tr", { children: [
            /* @__PURE__ */ jsx4("th", { children: "\u5730\u9762\u7121\u969C\u7919\u8207\u5FC5\u8981\u7A7A\u9593\u6AA2\u8A0E" }),
            /* @__PURE__ */ jsx4("th", { children: "\u9762\u7A4D\uFF08\u33A1\uFF09" })
          ] }) }),
          /* @__PURE__ */ jsx4("tbody", { children: [["\u8ECA\u683C\u53CA\u8ECA\u9053", v.smallSite.groundReview.stallAndAisle], ["\u7368\u7ACB\u7121\u969C\u7919\u901A\u8DEF", v.smallSite.groundReview.routeArea], ["\u5347\u964D\u6A5F\u524D\u7B49\u5019\u5340", v.smallSite.groundReview.waitingArea], ["\u6C7D\u8ECA\u5347\u964D\u6A5F\u9053", v.smallSite.groundReview.shaftArea], ["\u9580\u5EF3\u6838\u5FC3\u53CA\u5176\u4ED6\u7528\u9014", v.smallSite.groundReview.otherArea], ["\u5FC5\u8981\u7A7A\u9593\u5408\u8A08", v.smallSite.groundReview.total], ["\u672C\u6B21\u5730\u9762\u914D\u7F6E\u9762\u7A4D\u4E0A\u9650", v.smallSite.groundReview.cap]].map(([label, area2]) => /* @__PURE__ */ jsxs4("tr", { children: [
            /* @__PURE__ */ jsx4("th", { children: label }),
            /* @__PURE__ */ jsx4("td", { children: f2(area2) })
          ] }, label)) })
        ] }),
        /* @__PURE__ */ jsx4("p", { children: "\u5730\u9762\u505C\u8ECA\u3001\u901A\u8DEF\u3001\u7B49\u5019\u8207\u6A5F\u9053\u5F9E\u65E2\u6709\u5730\u4E0A\u7A7A\u9593\u5206\u914D\uFF0C\u4E0D\u53E6\u589E\u7E3D\u6A13\u677F\u6216\u5730\u4E0B\u514D\u8A08\u984D\u5EA6\u3002" })
      ] }),
      /* @__PURE__ */ jsx4("ul", { children: v.smallSite.conditions.map((n) => /* @__PURE__ */ jsx4("li", { children: publicText3(n) }, n)) })
    ] }),
    v && z?.errors.length > 0 && /* @__PURE__ */ jsx4("p", { className: "planning-inline-error", role: "alert", children: z.errors.join("\uFF1B") }),
    !v && /* @__PURE__ */ jsx4("p", { className: "planning-incomplete", children: z?.errors.join("\uFF1B") || "\u586B\u5165\u57FA\u5730\u689D\u4EF6\u5F8C\uFF0C\u9019\u88E1\u6703\u986F\u793A\u8ECA\u4F4D\u9700\u6C42\u8207\u5730\u4E0B\u5BA4\u5BB9\u91CF\u3002" }),
    /* @__PURE__ */ jsxs4("details", { children: [
      /* @__PURE__ */ jsx4("summary", { children: "\u505C\u8ECA\u898F\u5247\u4F86\u6E90" }),
      parkingSources.map(([label, url]) => /* @__PURE__ */ jsx4("p", { children: /* @__PURE__ */ jsx4("a", { href: url, target: "_blank", rel: "noreferrer", children: label }) }, url))
    ] })
  ] });
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/AreaReviewPanel.tsx
import { FieldLabel as FieldLabel6, PublicNumber as PublicNumber6 } from "/src/land-evaluation/PublicFields.jsx";

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/CommonAllocationPolicyPanel.tsx
import { FieldLabel as FieldLabel5 } from "/src/land-evaluation/PublicFields.jsx";
import { PublicSelect as PublicSelect5 } from "/src/land-evaluation/PublicSelect.jsx";
import { Fragment as Fragment5, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var f3 = (v) => v.toLocaleString("zh-TW", {
  maximumFractionDigits: 2
});
function CommonAllocationPolicyPanel({
  input,
  result,
  edit
}) {
  const review = input.areaReview, p = review?.commonPolicy, v = result.values, parking = result.parking?.values;
  if (!review || !p) return null;
  const z = v ? resolveCommonPolicy(p, {
    motorcycleSqm: v.motoArea,
    bicycleSqm: parking?.bikeArea ?? 0,
    communitySqm: parking?.communityArea ?? 0,
    sharedRampSqm: parking?.rampTotal ?? 0,
    carArea: v.carArea
  }) : null;
  const change = (patch) => edit({
    areaReview: {
      ...review,
      commonPolicy: {
        ...p,
        ...patch
      }
    }
  });
  return /* @__PURE__ */ jsxs5("section", { "aria-label": "\u5171\u6709\u5206\u6524\u901A\u5247", children: [
    /* @__PURE__ */ jsx5("h4", { children: "\u5171\u6709\u5206\u6524\u901A\u5247\uFF1A\u5148\u5B8C\u6210\u521D\u4F30\uFF0C\u518D\u8986\u6838\u6587\u4EF6" }),
    /* @__PURE__ */ jsx5("p", { children: "\u8A2D\u7F6E\u9700\u6C42\u3001\u5C3A\u5BF8\u53CA\u514D\u8A08\u5BB9\u7A4D\u4F9D\u5EFA\u6280\u898F\u5247\u8207\u6240\u5728\u5730\u898F\u5B9A\uFF1B\u5171\u6709\u767B\u8A18\u8207\u5206\u914D\u4F9D\u6C11\u6CD5799\u689D\u3001\u571F\u5730\u767B\u8A18\u898F\u524779\u53CA81\u689D\u3002\u4EE5\u4E0B\u670D\u52D9\u7BC4\u570D\u5728\u521D\u4F30\u6A21\u5F0F\u5C6C\u898F\u5283\u5047\u8A2D\uFF0CApp\u81EA\u52D5\u8A08\u7B97\u9762\u7A4D\uFF0C\u4E0D\u56E0\u7F3A\u5C11\u5206\u914D\u8868\u505C\u6B62\u521D\u4F30\u3002" }),
    /* @__PURE__ */ jsxs5("label", { children: [
      /* @__PURE__ */ jsx5(FieldLabel5, { children: "\u6AA2\u8A0E\u7528\u9014" }),
      /* @__PURE__ */ jsxs5(PublicSelect5, { value: p.mode, onChange: (e) => change({
        mode: e.target.value
      }), children: [
        /* @__PURE__ */ jsx5("option", { value: "planning", children: "\u958B\u767C\u521D\u4F30\uFF1A\u5957\u901A\u5247\u53CA\u898F\u5283\u5047\u8A2D\uFF0C\u6301\u7E8C\u8A08\u7B97" }),
        /* @__PURE__ */ jsx5("option", { value: "documents", children: "\u4F9D\u5716\u8AAA\u53CA\u5171\u6709\u5206\u914D\u6587\u4EF6\u8986\u6838" })
      ] })
    ] }),
    /* @__PURE__ */ jsx5("div", { className: "planning-field-grid", children: ["motorcycle", "bicycle", "community", "ramp"].map((k, j) => /* @__PURE__ */ jsxs5("label", { children: [
      /* @__PURE__ */ jsx5(FieldLabel5, { children: ["\u6A5F\u8ECA\u7A7A\u9593\u670D\u52D9\u5C0D\u8C61", "\u81EA\u884C\u8ECA\u7A7A\u9593\u670D\u52D9\u5C0D\u8C61", "\u793E\u5340\u8ECA\u4F4D\u670D\u52D9\u5C0D\u8C61", "\u5171\u7528\u5761\u9053\u5206\u6524\u65B9\u5F0F"][j] }),
      /* @__PURE__ */ jsxs5(PublicSelect5, { value: p[k], onChange: (e) => change({
        [k]: e.target.value
      }), children: [
        k === "ramp" && /* @__PURE__ */ jsx5("option", { value: "proportional", children: "\u6309\u670D\u52D9\u505C\u8ECA\u7A7A\u9593\u9762\u7A4D\u6BD4\u4F8B\u521D\u4F30\uFF08\u975E\u6CD5\u5B9A\u6BD4\u4F8B\uFF09" }),
        /* @__PURE__ */ jsx5("option", { value: "housing", children: "\u5168\u9AD4\u623F\u5C4B\u4F4F\u6236\u5171\u7528\uFF1A\u5217\u623F\u5C4B\u516C\u8A2D\u521D\u4F30" }),
        /* @__PURE__ */ jsx5("option", { value: "parking", children: "\u50C5\u6C7D\u8ECA\u4F4D\u4F7F\u7528\u4EBA\u5171\u7528\uFF1A\u6B78\u8ECA\u4F4D\u5206\u6524" }),
        /* @__PURE__ */ jsx5("option", { value: "pending", children: "\u7528\u9014\u672A\u5B9A\uFF1A\u66AB\u4E0D\u5217\u623F\u5C4B\uFF0C\u521D\u4F30\u7E7C\u7E8C" })
      ] })
    ] }, k)) }),
    /* @__PURE__ */ jsxs5("label", { children: [
      /* @__PURE__ */ jsx5(FieldLabel5, { children: "\u898F\u5283\u7406\u7531\u6216\u8986\u6838\u6587\u4EF6\uFF08\u521D\u4F30\u53EF\u7559\u767D\uFF09" }),
      /* @__PURE__ */ jsx5("textarea", { value: p.source, onChange: (e) => change({
        source: e.target.value
      }) })
    ] }),
    z && /* @__PURE__ */ jsxs5(Fragment5, { children: [
      /* @__PURE__ */ jsxs5("p", { children: [
        "\u901A\u5247\u4F30\u5217\uFF1A\u6A5F\u8ECA",
        f3(z.allocation.motorcycleSqm),
        "\u33A1\u3001\u81EA\u884C\u8ECA",
        f3(z.allocation.bicycleSqm),
        "\u33A1\u3001\u793E\u5340\u8ECA\u4F4D",
        f3(z.allocation.communitySqm),
        "\u33A1\u3001\u5171\u7528\u5761\u9053",
        f3(z.allocation.sharedRampSqm),
        "\u33A1\u3002\u5761\u9053\u623F\u5C4B\u5206\u6524\u521D\u4F30",
        f3(z.rampRatio * 100),
        "%\u3002"
      ] }),
      z.notes.map((n) => /* @__PURE__ */ jsx5("p", { children: n }, n))
    ] }),
    /* @__PURE__ */ jsxs5("details", { children: [
      /* @__PURE__ */ jsx5("summary", { children: "\u901A\u5247\u8207\u6CD5\u6E90" }),
      /* @__PURE__ */ jsxs5("table", { children: [
        /* @__PURE__ */ jsx5("thead", { children: /* @__PURE__ */ jsxs5("tr", { children: [
          /* @__PURE__ */ jsx5("th", { children: "\u5224\u65B7" }),
          /* @__PURE__ */ jsx5("th", { children: "App\u8655\u7406" })
        ] }) }),
        /* @__PURE__ */ jsxs5("tbody", { children: [
          /* @__PURE__ */ jsxs5("tr", { children: [
            /* @__PURE__ */ jsx5("th", { children: "\u8A2D\u7F6E\u53CA\u514D\u8A08" }),
            /* @__PURE__ */ jsx5("td", { children: "\u4F9D\u6CD5\u5B9A\u7528\u9014\u3001\u5C3A\u5BF8\u3001\u505C\u8ECA\u898F\u5247\u53CA162\u689D\u6AA2\u8A0E\uFF0C\u4E0D\u4EE5\u662F\u5426\u53E6\u552E\u4F5C\u5224\u65B7" })
          ] }),
          /* @__PURE__ */ jsxs5("tr", { children: [
            /* @__PURE__ */ jsx5("th", { children: "\u5168\u9AD4\u4F4F\u6236\u5171\u7528" }),
            /* @__PURE__ */ jsx5("td", { children: "\u6309\u6240\u9078\u898F\u5283\u7528\u9014\u4F30\u5217\u623F\u5C4B\u5171\u6709\uFF1B\u53D6\u5F97\u5206\u914D\u6587\u4EF6\u5F8C\u8986\u6838" })
          ] }),
          /* @__PURE__ */ jsxs5("tr", { children: [
            /* @__PURE__ */ jsx5("th", { children: "\u50C5\u6C7D\u8ECA\u4F4D\u670D\u52D9" }),
            /* @__PURE__ */ jsx5("td", { children: "\u6B78\u8ECA\u4F4D\u5206\u6524\uFF0C\u8207\u623F\u5C4B\u5206\u958B" })
          ] }),
          /* @__PURE__ */ jsxs5("tr", { children: [
            /* @__PURE__ */ jsx5("th", { children: "\u6DF7\u5408\u670D\u52D9\u5761\u9053" }),
            /* @__PURE__ */ jsx5("td", { children: "\u958B\u767C\u521D\u4F30\u6309\u670D\u52D9\u505C\u8ECA\u9762\u7A4D\u6BD4\u4F8B\uFF1B\u7121\u6CD5\u5B9A\u7D71\u4E00\u6BD4\u4F8B\uFF0C\u5BE6\u969B\u4F9D\u5206\u914D\u6587\u4EF6" })
          ] }),
          /* @__PURE__ */ jsxs5("tr", { children: [
            /* @__PURE__ */ jsx5("th", { children: "\u8CC7\u6599\u5C1A\u672A\u9F4A\u5168" }),
            /* @__PURE__ */ jsx5("td", { children: "\u521D\u4F30\u7D50\u679C\u4FDD\u7559\u5047\u8A2D\u63D0\u793A\uFF1B\u4E0D\u5192\u7A31\u767B\u8A18\u5DF2\u78BA\u8A8D" })
          ] })
        ] })
      ] }),
      commonAllocationSources.map(([name, url]) => /* @__PURE__ */ jsx5("p", { children: /* @__PURE__ */ jsx5("a", { href: url, target: "_blank", rel: "noreferrer", children: name }) }, url))
    ] })
  ] });
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/AreaReviewPanel.tsx
import { Fragment as Fragment6, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var f4 = (x) => x.toLocaleString("zh-TW", {
  maximumFractionDigits: 2
});
function AreaReviewPanel({
  input,
  result,
  edit
}) {
  const review = input.areaReview;
  if (!review) return null;
  const floors = "floorReview" in result ? result.floorReview?.floors : void 0, v = result.values;
  function changeFloor(j, p) {
    if (!review || !review.floors) return;
    edit({
      areaReview: {
        ...review,
        floors: review.floors.map((x, k) => k === j ? {
          ...x,
          ...p
        } : x)
      }
    });
  }
  return /* @__PURE__ */ jsxs6("section", { className: "area-review-panel", "aria-label": "\u7B2C162\u689D\u9010\u5C64\u8207\u767B\u8A18\u6AA2\u8A0E", children: [
    /* @__PURE__ */ jsx6("h3", { children: "\u7B2C162\u689D\u9010\u5C64\u514D\u8A08\u8207\u53EF\u767B\u8A18\u516C\u8A2D" }),
    /* @__PURE__ */ jsx6("p", { children: "\u68AF\u5EF3\u3001\u967D\u53F0\u5404\u4EE5\u8A72\u5C64\u6A13\u5730\u677F\u6AA2\u8A0E10%\uFF0C\u5408\u8A0815%\uFF1B\u6A13\u677F\u542B\u6A5F\u96FB\u53CA\u68AF\u5EF3\uFF0C\u967D\u53F0\u53E6\u5217\u3002\u5404\u5C64\u8D85\u9650\u8A08\u5BB9\uFF0C\u514D\u8A08\u984D\u5EA6\u4E0D\u8DE8\u5C64\u632A\u7528\u3002\u6A5F\u96FB\u7B49\u53E6\u53D7\u57FA\u5730\u5BB9\u7A4D10%\uFF0F15%\u7E3D\u91CF\u9650\u5236\u3002" }),
    /* @__PURE__ */ jsx6("p", { children: review.floors ? "\u81EA\u8A02\u9010\u5C64\u9762\u7A4D\uFF0C\u8CC7\u683C\u53CA\u4F86\u6E90\u4ECD\u9808\u8207\u5716\u8AAA\u6838\u5C0D\u3002" : "\u4F9D\u898F\u5283\u5EFA\u7BC9\u9762\u7A4D\u63A8\u4F30\u5404\u5C64\u6A13\u677F\uFF0C\u4E26\u4F9D\u672C\u6B21\u967D\u53F0\u8207\u68AF\u5EF3\u8A2D\u5B9A\u6AA2\u8A0E\u3002" }),
    !input.quantityReserve && /* @__PURE__ */ jsxs6("label", { children: [
      /* @__PURE__ */ jsx6(FieldLabel6, { children: "\u9010\u5C64\u914D\u7F6E\u4F86\u6E90" }),
      /* @__PURE__ */ jsx6("textarea", { "aria-label": "\u9010\u5C64\u914D\u7F6E\u4F86\u6E90", value: review.source ?? "", onChange: (e) => edit({
        areaReview: {
          ...review,
          source: e.target.value
        }
      }) })
    ] }),
    floors && /* @__PURE__ */ jsxs6(Fragment6, { children: [
      /* @__PURE__ */ jsx6("p", { children: /* @__PURE__ */ jsxs6("strong", { children: [
        "\u63A8\u4F30\u5730\u4E0A ",
        floors.length,
        " \u5C64 \xB7 \u5C4B\u7A81 ",
        input.roofFloors,
        " \u5C64 \xB7 \u5730\u4E0B ",
        v?.floors ?? input.basementFloors,
        " \u5C64"
      ] }) }),
      /* @__PURE__ */ jsxs6("details", { children: [
        /* @__PURE__ */ jsxs6("summary", { children: [
          "\u5C55\u958B\u5730\u4E0A\u9010\u5C64\u514D\u8A08\u6AA2\u8A0E\uFF08",
          floors.length,
          "\u5C64\uFF09"
        ] }),
        /* @__PURE__ */ jsx6("div", { className: "burden-table", children: /* @__PURE__ */ jsxs6("table", { children: [
          /* @__PURE__ */ jsx6("thead", { children: /* @__PURE__ */ jsx6("tr", { children: ["\u6A13\u5C64", "\u6A13\u677F\u6BCD\u6578\u33A1", "\u6A5F\u96FB\u33A1", "\u68AF\u5EF3\u33A1", "\u967D\u53F0\u33A1", "\u68AF\u5EF3\u514D\u8A08\u33A1", "\u967D\u53F0\u514D\u8A08\u33A1", "\u6A5F\u96FB\u514D\u8A08\u33A1", "\u53CD\u8A08\u5BB9\u7A4D\u33A1", "\u8A08\u5BB9\u33A1"].map((x) => /* @__PURE__ */ jsx6("th", { children: x }, x)) }) }),
          /* @__PURE__ */ jsx6("tbody", { children: floors.map((r, j) => /* @__PURE__ */ jsxs6("tr", { children: [
            /* @__PURE__ */ jsx6("th", { children: r.label }),
            ["floorArea", "equipment", "lobby", "balcony"].map((k) => /* @__PURE__ */ jsx6("td", { children: review.floors ? /* @__PURE__ */ jsx6(PublicNumber6, { type: "number", min: "0", step: "any", "aria-label": `${r.label} ${k}`, value: review.floors[j]?.[k] ?? r[k], onChange: (e) => changeFloor(j, {
              [k]: Number(e.target.value)
            }) }) : f4(r[k]) }, k)),
            [r.lobbyExempt, r.balconyExempt, r.equipmentExempt, r.countedExtras, r.counted].map((n, k) => /* @__PURE__ */ jsx6("td", { children: f4(n) }, k))
          ] }, j)) })
        ] }) }),
        review.floors && review.floors.map((r, j) => /* @__PURE__ */ jsxs6("div", { children: [
          /* @__PURE__ */ jsxs6("span", { children: [
            r.label,
            " \u514D\u8A08\u8CC7\u683C\uFF1A"
          ] }),
          /* @__PURE__ */ jsxs6("label", { children: [
            /* @__PURE__ */ jsx6(FieldLabel6, { children: "\u6A5F\u96FB\u5408\u683C\u514D\u8A08\u5019\u9078\u33A1\uFF08\u6392\u9664\u5C08\u6709\u53CA\u7D04\u5B9A\u5C08\u7528\uFF09" }),
            /* @__PURE__ */ jsx6(PublicNumber6, { type: "number", min: "0", max: r.equipment, value: r.equipmentEligible ?? r.equipment, onChange: (e) => changeFloor(j, {
              equipmentEligible: Number(e.target.value)
            }) })
          ] }),
          /* @__PURE__ */ jsxs6("label", { children: [
            /* @__PURE__ */ jsx6("input", { type: "checkbox", checked: r.lobbyQualified, onChange: (e) => changeFloor(j, {
              lobbyQualified: e.target.checked
            }) }),
            "\u5171\u540C\u68AF\u5EF3\u6DE8\u6DF1\u90542m"
          ] }),
          /* @__PURE__ */ jsxs6("label", { children: [
            /* @__PURE__ */ jsx6("input", { type: "checkbox", checked: r.balconyQualified, onChange: (e) => changeFloor(j, {
              balconyQualified: e.target.checked
            }) }),
            "\u967D\u53F0\u7B26\u5408\u7A81\u51FA\u7B49\u514D\u8A08\u689D\u4EF6"
          ] })
        ] }, j)),
        !input.quantityReserve && /* @__PURE__ */ jsx6("button", { className: "secondary-btn", onClick: () => edit({
          areaReview: {
            ...review,
            floors: review.floors ? void 0 : floors.map(({
              label,
              floorArea,
              equipment,
              lobby,
              balcony,
              lobbyQualified,
              balconyQualified
            }) => ({
              label,
              floorArea,
              equipment,
              lobby,
              balcony,
              lobbyQualified,
              balconyQualified
            }))
          }
        }), children: review.floors ? "\u6539\u56DEApp\u63A8\u4F30\u6A13\u677F" : "\u4EE5\u6B64\u914D\u7F6E\u5EFA\u7ACB\u53EF\u7DE8\u8F2F\u9010\u5C64\u8868" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs6("details", { children: [
      /* @__PURE__ */ jsx6("summary", { children: "\u53EF\u767B\u8A18\u516C\u8A2D\u53CA\u5730\u4E0B\u5404\u5C64\u5206\u914D" }),
      /* @__PURE__ */ jsx6("p", { children: "\u514D\u8A08\u5BB9\u7A4D\u4E0D\u7B49\u65BC\u53EF\u767B\u8A18\u9762\u7A4D\u3002\u6A5F\u96FB\u3001\u68AF\u5EF3\u53CA\u5C4B\u7A81\u5148\u6309\u5171\u6709\u4E14\u670D\u52D9\u623F\u5C4B\u7684\u898F\u5283\u5047\u8A2D\u4F30\u5217\uFF1B\u5BE6\u969B\u767B\u8A18\u9808\u4F9D\u7AE3\u5DE5\u5716\u3001\u6E2C\u91CF\u6210\u679C\u53CA\u5206\u914D\u8868\u78BA\u8A8D\u3002\u505C\u8ECA\u76F8\u95DC\u7A7A\u9593\u6309\u623F\u5C4B\u53CA\u8ECA\u4F4D\u7684\u5206\u6524\u4F9D\u64DA\u5206\u5217\u3002" }),
      /* @__PURE__ */ jsx6("p", { children: "\u5730\u4E0B\u6A5F\u96FB\u5DF2\u4F9D\u7B2C60\u689D\u6C7D\u8ECA\u505C\u8ECA\u6C60\u5269\u9918\u984D\u5EA6\u53CA108\u5E74\u51FD\u6AA2\u8A0E\uFF1B\u672A\u80FD\u4F75\u5165\u8005\u56DE\u6B78\u6A5F\u96FB\u7E3D\u984D\uFF0C\u8D85\u984D\u8A08\u5BB9\u3002\u5C4B\u7A81\u4ECD\u9808\u7B26\u5408\u5BE6\u969B\u7528\u9014\u53CA\u6295\u5F71\u8CC7\u683C\u3002" }),
      /* @__PURE__ */ jsx6("div", { className: "planning-field-grid", children: ["equipmentPercent", "lobbyPercent", "roofPercent"].map((k, j) => /* @__PURE__ */ jsxs6("label", { children: [
        /* @__PURE__ */ jsx6(FieldLabel6, { children: ["\u5730\u4E0A\u6A5F\u96FB\u53EF\u767B\u8A18\u623F\u5C4B\u516C\u8A2D\u6BD4\u4F8B", "\u5730\u4E0A\u68AF\u5EF3\u53EF\u767B\u8A18\u623F\u5C4B\u516C\u8A2D\u6BD4\u4F8B", "\u5C4B\u7A81\u53EF\u767B\u8A18\u623F\u5C4B\u516C\u8A2D\u6BD4\u4F8B"][j] }),
        /* @__PURE__ */ jsx6(PublicNumber6, { type: "number", min: "0", max: "100", value: review.registration?.[k] ?? 100, onChange: (e) => edit({
          areaReview: {
            ...review,
            registration: {
              equipmentPercent: 100,
              lobbyPercent: 100,
              roofPercent: 100,
              source: "",
              ...review.registration,
              [k]: Number(e.target.value)
            }
          }
        }) }),
        "%"
      ] }, k)) }),
      review.commonPolicy ? /* @__PURE__ */ jsx6(CommonAllocationPolicyPanel, { input, result, edit }) : /* @__PURE__ */ jsxs6("details", { children: [
        /* @__PURE__ */ jsx6("summary", { children: "\u4F9D\u5206\u914D\u8868\u8F38\u5165\u505C\u8ECA\u76F8\u95DC\u623F\u5C4B\u6301\u5206\u9762\u7A4D" }),
        " ",
        /* @__PURE__ */ jsx6("p", { children: "\u8ACB\u4F9D\u767B\u8A18\u8207\u5206\u914D\u6587\u4EF6\uFF0C\u586B\u5165\u6A5F\u8ECA\u3001\u81EA\u884C\u8ECA\u53CA\u793E\u5340\u505C\u8ECA\u7A7A\u9593\u8F49\u5217\u623F\u5C4B\u516C\u8A2D\u7684\u9762\u7A4D\u3002" }),
        /* @__PURE__ */ jsx6("div", { className: "planning-field-grid", children: ["motorcycleSqm", "bicycleSqm", "communitySqm", "sharedRampSqm"].map((k, j) => /* @__PURE__ */ jsxs6("label", { children: [
          /* @__PURE__ */ jsx6(FieldLabel6, { children: ["\u6A5F\u8ECA\u7A7A\u9593\u5206\u6524\u623F\u5C4B\u33A1", "\u81EA\u884C\u8ECA\u7A7A\u9593\u5206\u6524\u623F\u5C4B\u33A1", "\u793E\u5340\u8ECA\u4F4D\u5206\u6524\u623F\u5C4B\u33A1", "\u5171\u7528\u5761\u9053\u5206\u6524\u623F\u5C4B\u33A1"][j] }),
          /* @__PURE__ */ jsx6(PublicNumber6, { type: "number", min: "0", value: review.registration?.parkingAllocation?.[k] ?? 0, onChange: (e) => edit({
            areaReview: {
              ...review,
              registration: {
                equipmentPercent: 100,
                lobbyPercent: 100,
                roofPercent: 100,
                source: "",
                ...review.registration,
                parkingAllocation: {
                  motorcycleSqm: 0,
                  bicycleSqm: 0,
                  communitySqm: 0,
                  sharedRampSqm: 0,
                  source: "",
                  ...review.registration?.parkingAllocation,
                  [k]: Number(e.target.value)
                }
              }
            }
          }) })
        ] }, k)) }),
        /* @__PURE__ */ jsxs6("label", { children: [
          /* @__PURE__ */ jsx6(FieldLabel6, { children: "\u4E0A\u8FF0\u505C\u8ECA\u76F8\u95DC\u516C\u8A2D\u7684\u767B\u8A18\u8207\u5206\u914D\u4F9D\u64DA" }),
          /* @__PURE__ */ jsx6("textarea", { value: review.registration?.parkingAllocation?.source ?? "", onChange: (e) => edit({
            areaReview: {
              ...review,
              registration: {
                equipmentPercent: 100,
                lobbyPercent: 100,
                roofPercent: 100,
                source: "",
                ...review.registration,
                parkingAllocation: {
                  motorcycleSqm: 0,
                  bicycleSqm: 0,
                  communitySqm: 0,
                  sharedRampSqm: 0,
                  ...review.registration?.parkingAllocation,
                  source: e.target.value
                }
              }
            }
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs6("label", { children: [
        /* @__PURE__ */ jsx6(FieldLabel6, { children: "\u767B\u8A18\u53CA\u5206\u6524\u4F9D\u64DA" }),
        /* @__PURE__ */ jsx6("textarea", { value: review.registration?.source ?? "", onChange: (e) => edit({
          areaReview: {
            ...review,
            registration: {
              equipmentPercent: 100,
              lobbyPercent: 100,
              roofPercent: 100,
              ...review.registration,
              source: e.target.value
            }
          }
        }) })
      ] }),
      v && /* @__PURE__ */ jsx6("div", { className: "burden-table", children: /* @__PURE__ */ jsxs6("table", { children: [
        /* @__PURE__ */ jsx6("thead", { children: /* @__PURE__ */ jsxs6("tr", { children: [
          /* @__PURE__ */ jsx6("th", { children: "\u6A13\u5C64\uFF0F\u9805\u76EE" }),
          /* @__PURE__ */ jsx6("th", { children: "\u53EF\u5217\u623F\u5C4B\u516C\u8A2D\u521D\u4F30\u33A1" }),
          /* @__PURE__ */ jsx6("th", { children: "\u672A\u5217\u623F\u5C4B\u53EF\u552E\u33A1\uFF0F\u8AAA\u660E" })
        ] }) }),
        /* @__PURE__ */ jsxs6("tbody", { children: [
          /* @__PURE__ */ jsxs6("tr", { children: [
            /* @__PURE__ */ jsx6("th", { children: "\u5730\u4E0A\u6A5F\u96FB\u3001\u68AF\u5EF3\u3001\u5C4B\u7A81" }),
            /* @__PURE__ */ jsx6("td", { children: f4(v.registeredEquipment + v.registeredLobby + v.registeredRoof) }),
            /* @__PURE__ */ jsx6("td", { children: "\u898F\u5283\u5047\u8A2D\uFF0C\u5F85\u767B\u8A18\u53CA\u670D\u52D9\u5C0D\u8C61\u78BA\u8A8D" })
          ] }),
          Array.from({
            length: v.floors
          }, (_, j) => /* @__PURE__ */ jsxs6("tr", { children: [
            /* @__PURE__ */ jsxs6("th", { children: [
              "B",
              j + 1,
              " \u8A2D\u5099\u68AF\u9593"
            ] }),
            /* @__PURE__ */ jsx6("td", { children: f4(input.quantityReserve ? (result.parking?.values?.quantityFloors?.[j]?.equipment ?? 0) * Number(input.basementSalePercent) / 100 : v.basementEquipmentSale / v.floors) }),
            /* @__PURE__ */ jsx6("td", { children: "\u4F9D\u5404\u5C64\u8A2D\u5099\u68AF\u9593\u9700\u6C42\u9810\u7559\uFF1B\u5F85\u5716\u8AAA\u78BA\u8A8D" })
          ] }, j)),
          /* @__PURE__ */ jsxs6("tr", { children: [
            /* @__PURE__ */ jsx6("th", { children: "\u4F9D\u6CD5\u9644\u5EFA\u9632\u7A7A\u907F\u96E3\u88DC\u8DB3\u5171\u6709\u90E8\u5206" }),
            /* @__PURE__ */ jsx6("td", { children: f4(v.shelterCommon) }),
            /* @__PURE__ */ jsx6("td", { children: "\u6309\u5168\u9AD4\u4F4F\u6236\u670D\u52D9\u5047\u8A2D\uFF0C\u8207\u505C\u8ECA\u3001\u8A2D\u5099\u6C60\u4E0D\u91CD\u8907" })
          ] }),
          /* @__PURE__ */ jsxs6("tr", { children: [
            /* @__PURE__ */ jsx6("th", { children: "\u505C\u8ECA\u76F8\u95DC\u7A7A\u9593\u8F49\u5217\u623F\u5C4B\u516C\u8A2D" }),
            /* @__PURE__ */ jsx6("td", { children: f4(v.parkingHousingCommon) }),
            /* @__PURE__ */ jsx6("td", { children: "\u4F9D\u670D\u52D9\u7BC4\u570D\u901A\u5247\u521D\u4F30\u6216\u5206\u914D\u6587\u4EF6\u8986\u6838\uFF0C\u4E0D\u589E\u52A0\u5730\u4E0B\u5BA4" })
          ] }),
          /* @__PURE__ */ jsxs6("tr", { children: [
            /* @__PURE__ */ jsx6("th", { children: "\u5730\u4E0B\u53E6\u6B78\u8ECA\u4F4D\u53CA\u5C1A\u672A\u5206\u6524\u7A7A\u9593" }),
            /* @__PURE__ */ jsx6("td", { children: "0" }),
            /* @__PURE__ */ jsxs6("td", { children: [
              f4(v.parkingSalesArea),
              "\uFF08\u8ECA\u4F4D\u53CA\u8ECA\u9053\u53E6\u8A08\uFF09"
            ] })
          ] }),
          /* @__PURE__ */ jsxs6("tr", { children: [
            /* @__PURE__ */ jsx6("th", { children: "\u5730\u4E0B\u672A\u5B9A\u7528\u9014\u9918\u88D5" }),
            /* @__PURE__ */ jsx6("td", { children: "0" }),
            /* @__PURE__ */ jsxs6("td", { children: [
              f4(v.basementUnassigned),
              "\uFF08\u4E0D\u5F97\u81EA\u52D5\u8F49\u4F5C\u623F\u5C4B\u516C\u8A2D\uFF09"
            ] })
          ] }),
          /* @__PURE__ */ jsxs6("tr", { children: [
            /* @__PURE__ */ jsx6("th", { children: "\u672A\u63A1\u5206\u6524\u7684\u8A2D\u5099\u68AF\u9593" }),
            /* @__PURE__ */ jsx6("td", { children: "0" }),
            /* @__PURE__ */ jsx6("td", { children: f4(v.basementCommon - v.basementSale) })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/RegulatoryReviewPanel.tsx
import { FieldLabel as FieldLabel7, PublicNumber as PublicNumber7 } from "/src/land-evaluation/PublicFields.jsx";
import { PublicSelect as PublicSelect6 } from "/src/land-evaluation/PublicSelect.jsx";

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/BasementAudit.tsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var f5 = (n) => n.toLocaleString("zh-TW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
var law = "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=";
function BasementAudit({ input, result, edit }) {
  const p = input.regulatoryReview ?? defaultRegulatoryReview(), v = result.values, r = "regulatory" in result ? result.regulatory?.volume : void 0;
  if (!v || !r) return null;
  const taipei = /臺北|台北/.test(input.parkingDesign?.district ?? "");
  const q = r.pools, share = (n) => r.served ? r.shared * n / r.served : 0;
  const rows = [
    { name: "\u6C7D\u8ECA\u8207\u5206\u914D\u901A\u9053", area: r.carPool + (p.spareUse === "parking" ? q.spareArea : 0), count: r.parkingCounted, formula: `\u6C7D\u8ECA\u683C\u542B\u8D70\u9053${f5(q.carArea)}\uFF0B\u5206\u914D\u5761\u9053\uFF0F\u8F49\u5F4E${f5(share(q.carArea))}${p.spareUse === "parking" ? `\uFF0B\u8F49\u5217\u9918\u88D5${f5(q.spareArea)}` : ""}\uFF1B\u5730\u4E0B\u975E\u6A5F\u68B0${q.undergroundFlatCars ?? q.cars}\u4F4D\xD740\uFF1D${f5(r.parkingCap)}\u4E0A\u9650${q.mechanicalArea ? `\uFF1B\u6A5F\u68B0\u505C\u8ECA\u53CA\u5206\u914D\u901A\u9053${f5(q.mechanicalArea + share(q.mechanicalArea))}\u33A1\u53E6\u6309\u5BE6\u969B\u7528\u9014\u6AA2\u8A0E\uFF0C\u4E0D\u589E\u52A040\u33A1\u6C60` : ""}`, basis: "\u7B2C60\u689D\u7B2C1\u9805\u7B2C7\u6B3E\u3001\u7B2C162\u689D\u7B2C1\u9805\u7B2C3\u6B3E\uFF1B\u670D\u52D9\u901A\u9053\u5206\u914D\u6BD4\u4F8B\u70BA\u521D\u4F30\u5047\u8A2D", url: law + "60" },
    { name: "\u6A5F\u8ECA\u8207\u5206\u914D\u901A\u9053", area: r.motoPool, count: r.motorcycleCounted, formula: `\u6A5F\u8ECA\u683C\u53CA\u8D70\u9053${f5(q.motoArea)}\uFF0B\u5206\u914D${f5(share(q.motoArea))}`, basis: "\u7B2C162\u689D\u7B2C1\u9805\u7B2C3\u6B3E\uFF1B\u66AB\u6309\u4F9D\u6CD5\u8A2D\u7F6E\u505C\u8ECA\u7A7A\u9593\u3002\u6C92\u6709\u4F7F\u7528\u6A5F\u8ECA\u6578\xD740\u33A1", url: law + "162" },
    { name: "\u81EA\u884C\u8ECA\u8207\u5206\u914D\u901A\u9053", area: r.bikePool, count: r.bicycleCounted, formula: `\u81EA\u884C\u8ECA\u683C\u53CA\u8D70\u9053${f5(q.bikeArea)}\uFF0B\u5206\u914D${f5(share(q.bikeArea))}`, basis: (taipei ? "\u7B2C162\u689D\uFF1B\u81FA\u5317\u500B\u6848\u9069\u7528\u8CC7\u683C\u53E6\u6838\uFF1B" : "\u65B0\u5317\u90FD\u5BE9\u56DB(\u4E09)\uFF1B") + "\u79C1\u4EBA\u4F4F\u5B85\u672A\u53D6\u5F97\u514D\u8A08\u9069\u7528\u8CC7\u683C\u6642\u4FDD\u5B88\u8A08\u5BB9\u3002\u5206\u914D\u670D\u52D9\u901A\u9053\u70BA\u5047\u8A2D\uFF0C\u4E26\u975E\u5DF2\u78BA\u8A8D\u6CD5\u5B9A\u8A08\u5BB9\u9762\u7A4D", url: "https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150004" },
    { name: "\u793E\u5340\u88DD\u5378\u8207\u5206\u914D\u901A\u9053", area: r.communityPool, count: r.communityCounted, formula: `\u793E\u5340\u683C\u53CA\u8D70\u9053${f5(q.communityArea)}\uFF0B\u5206\u914D${f5(share(q.communityArea))}`, basis: "\u7B2C162\u689D\u7B2C1\u9805\u7B2C2\u6B3E\uFF1B" + (taipei ? "\u81FA\u5317\u500B\u6848\u88DD\u5378\u7528\u9014\u53E6\u6838\uFF1B" : "\u65B0\u5317\u90FD\u5BE9\u56DB(\u56DB)\uFF1B") + "\u672C\u6B21\u6309\u4F9D\u6CD5\u8A2D\u7F6E\u88DD\u5378\u7528\u9014\u521D\u4F30\uFF0C\u4E26\u975E\u5171\u6709\u5C31\u7576\u7136\u514D\u8A08", url: law + "162" },
    { name: "\u8A2D\u5099\u68AF\u9593\u9810\u7559", area: q.equipmentArea, count: r.equipmentCounted, formula: `\u9810\u7559${f5(q.equipmentArea)}\uFF0D\u9632\u7A7A\u907F\u96E3\u4F75\u5165${f5(r.shelterEquipment)}\uFF0D\u505C\u8ECA\u4F75\u5165${f5(r.mergedEquipment)}\uFF0D\u6A5F\u96FB\u984D\u5EA6\u9918\u984D${f5(r.globalEquipmentExempt)}\uFF1D\u8A08\u5BB9${f5(r.equipmentCounted)}`, basis: "\u7B2C162\u689D\u7B2C1\u9805\u7B2C2\u6B3E\uFF1B94.5.18\u53F0\u5167\u71DF0940083309\u3001108.12.19\u71DF\u7F72\u5EFA\u7BA11081256601\u51FD\u3002\u8A2D\u5099\u623F\u53CA\u68AF\u9593\u5C3A\u5BF8\u70BA\u898F\u5283\u5047\u8A2D\uFF0C\u4E0D\u662F\u6CD5\u5B9A\u56FA\u5B9A\u6BD4\u4F8B\uFF1B\u5BE6\u969B\u7528\u9014\u53CA\u8A2D\u7F6E\u4F4D\u7F6E\u9808\u9010\u4E00\u6838\u5C0D", url: "https://www.nlma.gov.tw/ch/titlelist/interpcomp/13665" },
    ...input.quantityReserve ? [{ name: "\u4F9D\u6CD5\u9644\u5EFA\u9632\u7A7A\u907F\u96E3\u88DC\u8DB3", area: r.shelterOnlyExempt, count: 0, formula: "B1\u9644\u5EFA\u9762\u7A4D\u6263\u5FC5\u8981\u505C\u8ECA\u3001\u8A2D\u5099\u3001\u5761\u9053\u5F8C\u7684\u88DC\u8DB3\u9810\u7559\uFF1B\u8207\u505C\u8ECA\u5171\u7528\u90E8\u5206\u5DF2\u5728\u539F\u6C60\uFF0C\u6C92\u6709\u91CD\u8907\u5217\u9762\u7A4D", basis: "\u7B2C141\u3001142\u3001162\u689D\uFF1B\u6309\u5408\u683C\u9632\u7A7A\u907F\u96E3\u69CB\u9020\u53CA\u505C\u8ECA\u517C\u7528\u898F\u5283\u5047\u8A2D\uFF0C\u672A\u6709\u5EFA\u7167\u6838\u5B9A", url: law + "142" }] : [],
    { name: "\u672A\u5B9A\u7528\u9014\u9918\u88D5", area: p.spareUse === "counted" ? Math.max(0, q.spareArea - r.shelterOnlyExempt) : 0, count: r.spareCounted, formula: input.quantityReserve ? `\u5FC5\u8981\u7528\u9014\u5DF2\u5177\u540D\uFF1B\u9632\u7A7A\u907F\u96E3\u88DC\u8DB3${f5(r.shelterOnlyExempt)}\u53E6\u5217\uFF0C\u4E0D\u7559\u672A\u5B9A\u7528\u9014\u6A13\u677F\u3002\u672A\u5B9A\u7528\u9014\uFF1D${f5(r.spareCounted)}\u33A1` : `\u5730\u4E0B${f5(q.basement)}\uFF0D\u6C7D\u6A5F\u8ECA\u3001\u81EA\u884C\u8ECA\u3001\u793E\u5340\u3001\u5761\u9053\u3001\u8F49\u5F4E\u53CA\u8A2D\u5099\u5404\u6C60\uFF1D${f5(q.spareArea)}`, basis: "\u7B2C162\u689D\u5217\u8209\u514D\u8A08\u7528\u9014\uFF1B\u672C\u9805\u7528\u9014\u5C1A\u672A\u914D\u7F6E\uFF0C\u66AB\u8A08\u5BB9\u8207\u66AB\u4E0D\u5217\u53EF\u552E\u7686\u5C6C\u4FDD\u5B88\u5047\u8A2D\uFF0C\u6CD5\u898F\u6C92\u6709\u300C\u9918\u88D5\u4E00\u5F8B\u8A08\u5BB9\u300D\u689D\u6587", url: law + "162" }
  ];
  const change = (patch) => edit({ regulatoryReview: { ...p, ...patch } });
  return /* @__PURE__ */ jsxs7("section", { className: "area-review-panel", "aria-label": "\u5730\u4E0B\u9762\u7A4D\u9010\u9805\u6CD5\u6E90\u8207\u4FC2\u6578\u8FFD\u6EAF", children: [
    /* @__PURE__ */ jsx7("h3", { children: "\u5730\u4E0B\u9762\u7A4D\u9010\u9805\u6CD5\u6E90\u8207\u4FC2\u6578\u8FFD\u6EAF" }),
    /* @__PURE__ */ jsxs7("p", { children: [
      /* @__PURE__ */ jsxs7("strong", { children: [
        "\u672C\u6B21\u5730\u4E0B ",
        v.floors,
        " \u5C64\u3001",
        f5(v.basement),
        "\u33A1\u3002\u8A08\u5BB9\u8207\u53EF\u767B\u8A18\u516C\u8A2D\u5206\u958B\u6AA2\u8A0E\u3002"
      ] }),
      "\u4E0B\u5217\u9762\u7A4D\u4F86\u81EAApp\u914D\u7F6E\u6C60\uFF1B\u6C92\u6709\u5716\u8AAA\u7684\u8A2D\u5099\u6BD4\u4F8B\u3001\u901A\u9053\u5206\u914D\u53CA\u9918\u88D5\u7528\u9014\u5747\u70BA\u521D\u4F30\u5047\u8A2D\u3002\u4E0D\u80FD\u5C07\u4FDD\u5B88\u521D\u4F30\u7576\u4F5C\u4E3B\u7BA1\u6A5F\u95DC\u5DF2\u8A8D\u5B9A\u3002"
    ] }),
    p.auditHistory?.length ? /* @__PURE__ */ jsxs7("details", { children: [
      /* @__PURE__ */ jsx7("summary", { children: "\u6B77\u6B21\u5DF2\u4FDD\u5B58\u7D50\u679C\u8FFD\u6EAF\uFF08\u552F\u8B80\uFF0C\u975E\u5176\u4ED6\u65B9\u6848\uFF09" }),
      /* @__PURE__ */ jsxs7("table", { children: [
        /* @__PURE__ */ jsx7("thead", { children: /* @__PURE__ */ jsxs7("tr", { children: [
          /* @__PURE__ */ jsx7("th", { children: "\u4FDD\u5B58\u7D50\u679C" }),
          /* @__PURE__ */ jsx7("th", { children: "\u623F\u5C4B\u53EF\u552E\u33A1\uFF0F\u576A" }),
          /* @__PURE__ */ jsx7("th", { children: "\u4FC2\u6578" }),
          /* @__PURE__ */ jsx7("th", { children: "\u5730\u4E0B\u8A08\u5BB9\u62C6\u89E3\u33A1" })
        ] }) }),
        /* @__PURE__ */ jsxs7("tbody", { children: [
          p.auditHistory.map((h) => /* @__PURE__ */ jsxs7("tr", { children: [
            /* @__PURE__ */ jsx7("th", { children: h.label }),
            /* @__PURE__ */ jsxs7("td", { children: [
              f5(h.sale),
              "\uFF0F",
              f5(h.sale * 0.3025)
            ] }),
            /* @__PURE__ */ jsx7("td", { children: (h.sale / h.allowed).toFixed(3) }),
            /* @__PURE__ */ jsxs7("td", { children: [
              "\u8A2D\u5099",
              f5(h.equipmentCounted),
              "\uFF0B\u81EA\u884C\u8ECA",
              f5(h.bikeCounted),
              "\uFF0B\u9918\u88D5",
              f5(h.spareCounted),
              "\uFF1B\u5730\u4E0B",
              f5(h.basement),
              "\u33A1"
            ] })
          ] }, h.label)),
          /* @__PURE__ */ jsxs7("tr", { children: [
            /* @__PURE__ */ jsx7("th", { children: "\u76EE\u524DApp\u91CD\u7B97" }),
            /* @__PURE__ */ jsxs7("td", { children: [
              f5(v.sale),
              "\uFF0F",
              f5(v.salePing)
            ] }),
            /* @__PURE__ */ jsx7("td", { children: (v.sale / v.allowed).toFixed(3) }),
            /* @__PURE__ */ jsxs7("td", { children: [
              f5(v.basementCounted),
              "\uFF1B\u5730\u4E0B",
              f5(v.basement),
              "\u33A1"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx7("p", { children: "\u820A1.536\u672A\u6263\u5730\u4E0B\u8A08\u5BB9\uFF1B1.367\u662F\u5728\u56FA\u5B9A\u5141\u5EFA\u5BB9\u7A4D\u5167\uFF0C\u5C07\u8A2D\u5099814.05\u3001\u81EA\u884C\u8ECA\u8207\u901A\u9053172.10\u3001\u9918\u88D51,058.51\u33A1\u66AB\u8A08\u5BB9\u5F8C\uFF0C\u9023\u52D5\u7E2E\u6E1B\u5730\u4E0A\u6A13\u677F\u3001\u6236\u6578\u3001\u505C\u8ECA\u53CA\u516C\u8A2D\u7684\u7D50\u679C\u3002\u53EF\u552E\u5DEE\u984D\u4E0D\u662F\u53EA\u6E1B\u53BB2,044.66\u33A1\uFF1B\u4E0B\u65B9\u67E5\u6838\u8868\u5217\u51FA\u5404\u767B\u8A18\u9805\u76EE\uFF0C\u672A\u522A\u9664\u6574\u7B46\u5730\u4E0B\u8A2D\u5099\u68AF\u9593\u3002" })
    ] }) : null,
    /* @__PURE__ */ jsx7("div", { className: "burden-table basement-audit-table", children: /* @__PURE__ */ jsxs7("table", { children: [
      /* @__PURE__ */ jsxs7("colgroup", { children: [
        /* @__PURE__ */ jsx7("col", { style: { width: "11%" } }),
        /* @__PURE__ */ jsx7("col", { style: { width: "8%" } }),
        /* @__PURE__ */ jsx7("col", { style: { width: "8%" } }),
        /* @__PURE__ */ jsx7("col", { style: { width: "8%" } }),
        /* @__PURE__ */ jsx7("col", { style: { width: "29%" } }),
        /* @__PURE__ */ jsx7("col", { style: { width: "36%" } })
      ] }),
      /* @__PURE__ */ jsx7("thead", { children: /* @__PURE__ */ jsxs7("tr", { children: [
        /* @__PURE__ */ jsx7("th", { children: "\u5730\u4E0B\u7528\u9014" }),
        /* @__PURE__ */ jsx7("th", { children: "\u5BE6\u9AD4\u33A1" }),
        /* @__PURE__ */ jsx7("th", { children: "\u514D\u8A08\u33A1" }),
        /* @__PURE__ */ jsx7("th", { children: "\u8A08\u5BB9\u33A1" }),
        /* @__PURE__ */ jsx7("th", { children: "\u9762\u7A4D\u4F86\u6E90\uFF0F\u8A08\u7B97" }),
        /* @__PURE__ */ jsx7("th", { children: "\u6CD5\u6E90\u3001\u8CC7\u683C\u8207\u5047\u8A2D" })
      ] }) }),
      /* @__PURE__ */ jsxs7("tbody", { children: [
        rows.map((x) => /* @__PURE__ */ jsxs7("tr", { children: [
          /* @__PURE__ */ jsx7("th", { children: x.name }),
          /* @__PURE__ */ jsx7("td", { children: f5(x.area) }),
          /* @__PURE__ */ jsx7("td", { children: f5(x.area - x.count) }),
          /* @__PURE__ */ jsx7("td", { children: f5(x.count) }),
          /* @__PURE__ */ jsx7("td", { children: x.formula }),
          /* @__PURE__ */ jsx7("td", { children: /* @__PURE__ */ jsx7("a", { href: x.url, target: "_blank", rel: "noreferrer", children: x.basis }) })
        ] }, x.name)),
        /* @__PURE__ */ jsxs7("tr", { children: [
          /* @__PURE__ */ jsx7("th", { children: "\u5408\u8A08\uFF08\u5206\u914D\u5F8C\u4E0D\u91CD\u8907\uFF09" }),
          /* @__PURE__ */ jsx7("td", { children: f5(v.basement) }),
          /* @__PURE__ */ jsx7("td", { children: f5(v.basementExempt) }),
          /* @__PURE__ */ jsx7("td", { children: f5(v.basementCounted) }),
          /* @__PURE__ */ jsxs7("td", { colSpan: 2, children: [
            "\u5761\u9053",
            f5(q.rampTotal),
            "\uFF0B\u67F1\u7DB2\u8F49\u5F4E",
            f5(q.lossArea),
            "\u6309\u6C7D\u8ECA\uFF0F\u6A5F\u8ECA\uFF0F\u81EA\u884C\u8ECA\uFF0F\u793E\u5340\u670D\u52D9\u9762\u7A4D\u6BD4\u4F8B\u5206\u914D\uFF1B\u4E0D\u662F\u6CD5\u5B9A\u56FA\u5B9A\u5206\u6524\u3002"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs7("details", { open: true, children: [
      /* @__PURE__ */ jsx7("summary", { children: "\u8A2D\u5099\u68AF\u9593\u6709\u6C92\u6709\u88AB\u932F\u8AA4\u6392\u9664\uFF1A\u514D\u8A08\u8207\u767B\u8A18\u96D9\u8ECC\u6838\u5C0D" }),
      /* @__PURE__ */ jsxs7("p", { children: [
        "\u5730\u4E0A\u5DF2\u7528\u6A5F\u96FB\u514D\u8A08\u984D\u5EA6 ",
        f5(v.equipmentExempt),
        "\uFF0F",
        f5(v.equipmentCap),
        "\u33A1\uFF1B\u5730\u4E0B\u8A2D\u5099\u9810\u7559 ",
        f5(q.equipmentArea),
        "\u33A1\uFF0C\u5DF2\u5217\u623F\u5C4B\u53EF\u552E\u516C\u8A2D ",
        f5(v.basementEquipmentSale),
        "\u33A1\u3002\u5373\u4F7F\u90E8\u5206\u8A08\u5BB9\uFF0C\u4E5F\u672A\u5F9E\u53EF\u767B\u8A18\u9762\u7A4D\u522A\u9664\u3002\u505C\u8ECA\u76F8\u95DC\u5171\u6709\u8F49\u5217 ",
        f5(v.parkingHousingCommon),
        "\u33A1\uFF0C\u53E6\u5F9E\u65E2\u6709\u505C\u8ECA\u6C60\u6263\u56DE\uFF0C\u6C92\u6709\u91CD\u8907\u8A08\u7B97\u3002"
      ] }),
      /* @__PURE__ */ jsxs7("table", { children: [
        /* @__PURE__ */ jsx7("thead", { children: /* @__PURE__ */ jsxs7("tr", { children: [
          /* @__PURE__ */ jsx7("th", { children: "\u623F\u5C4B\u767B\u8A18\u63A1\u8A08\u521D\u4F30" }),
          /* @__PURE__ */ jsx7("th", { children: "\u33A1" })
        ] }) }),
        /* @__PURE__ */ jsx7("tbody", { children: [["\u666E\u901A\u6A13\u677F\uFF08\u5167\u542B\u8A08\u5BB9\u516C\u8A2D\uFF0C\u4E0D\u518D\u52A0\u4E00\u6B21\uFF09", v.ordinary], ["\u967D\u53F0", v.balcony], ["\u5730\u4E0A\u8A2D\u5099", v.registeredEquipment], ["\u68AF\u5EF3", v.registeredLobby], ["\u5C4B\u7A81", v.registeredRoof], ["\u5730\u4E0B\u8A2D\u5099\u68AF\u9593", v.basementEquipmentSale], ["\u9632\u7A7A\u907F\u96E3\u88DC\u8DB3\u5171\u6709\u90E8\u5206", v.shelterCommon], ["\u505C\u8ECA\u76F8\u95DC\u623F\u5C4B\u5171\u6709\u6301\u5206", v.parkingHousingCommon], ...result.parking?.values?.smallSite?.groundArea ? [["\u5730\u9762\u505C\u8ECA\u8207\u8D70\u9053\u6263\u9664\uFF08\u4E0D\u5217\u623F\u5C4B\u53EF\u552E\uFF09", -Math.min(v.ordinary, result.parking.values.smallSite.groundArea)]] : [], ["\u623F\u5C4B\u53EF\u552E\u5408\u8A08", v.sale], ["\u672A\u5B9A\u7528\u9014\u9918\u88D5\uFF08\u5C1A\u672A\u914D\u7F6E\uFF0C\u4E0D\u5217\u53EF\u552E\uFF09", v.basementUnassigned]].map(([k, n]) => /* @__PURE__ */ jsxs7("tr", { children: [
          /* @__PURE__ */ jsx7("th", { children: k }),
          /* @__PURE__ */ jsx7("td", { children: f5(Number(n)) })
        ] }, k)) })
      ] }),
      /* @__PURE__ */ jsxs7("p", { children: [
        /* @__PURE__ */ jsx7("a", { href: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0060003&flno=81", target: "_blank", rel: "noreferrer", children: "\u571F\u5730\u767B\u8A18\u898F\u524781\u689D" }),
        "\u4F9D\u8A2D\u7F6E\u76EE\u7684\u3001\u4F7F\u7528\u6027\u8CEA\u53CA\u7D04\u5B9A\u6AA2\u8A0E\u5171\u6709\u5206\u6524\uFF1B\u514D\u8A08\u5BB9\u7A4D\u8207\u53EF\u767B\u8A18\u9762\u7A4D\u4E26\u4E0D\u76F8\u7B49\u3002\u73FE\u884C\u63A1\u8A08\u6BD4\u4F8B\u4ECD\u70BA\u898F\u5283\u5047\u8A2D\uFF0C\u5C1A\u975E\u767B\u8A18\u6838\u5B9A\u3002"
      ] })
    ] }),
    !input.quantityReserve && /* @__PURE__ */ jsxs7("details", { children: [
      /* @__PURE__ */ jsx7("summary", { children: "\u88DC\u6AA2B1\u9632\u7A7A\u907F\u96E3\u8A2D\u5099\uFF08\u660E\u793A\u914D\u7F6E\u5F8C\u624D\u63A1\u7528\u514D\u8A08\uFF09" }),
      /* @__PURE__ */ jsxs7("p", { children: [
        "\u7B2C140\u3001141\u689D\u9069\u7528\u5730\u5340\u53CA\u9644\u5EFA\u57FA\u6E96\u9808\u78BA\u8A8D\uFF1B\u672C\u4F4F\u5B85\u9AD8\u5EA6\u4E0B\u5148\u4EE5\u5EFA\u7BC9\u9762\u7A4D ",
        f5(v.footprint),
        "\u33A1\u4F5C\u9644\u5EFA\u898F\u5283\u4E0A\u9650\u3002\u7B2C142\u689D\u56FA\u5B9A\u8A2D\u5099\u4E0D\u8D85\u9644\u5EFA\u9762\u7A4D1/4\uFF0C\u4E14\u9808\u8207\u505C\u8ECA\u517C\u7528\u3001\u7B26\u5408\u907F\u96E3\u69CB\u9020\u53CA\u51FA\u5165\u53E3\u3002\u4E0D\u80FD\u628A\u5168\u5730\u4E0B4\u5C64\u8A2D\u5099\u5168\u90E8\u5957\u7528\u6B64\u4F8B\u5916\u3002"
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "planning-field-grid", children: [
        /* @__PURE__ */ jsxs7("label", { children: [
          "B1\u9632\u7A7A\u907F\u96E3\u8A2D\u5099\u898F\u5283\u9762\u7A4D\u33A1",
          /* @__PURE__ */ jsx7("input", { type: "number", min: "0", value: p.shelterArea ?? "0", onChange: (e) => change({ shelterArea: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxs7("label", { children: [
          "\u5176\u4E2D\u56FA\u5B9A\u8A2D\u5099\u9762\u7A4D\u33A1",
          /* @__PURE__ */ jsx7("input", { type: "number", min: "0", value: p.shelterEquipment ?? "0", onChange: (e) => change({ shelterEquipment: e.target.value }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs7("label", { children: [
        "\u4F4D\u7F6E\u8207\u8CC7\u683C\u5047\u8A2D",
        /* @__PURE__ */ jsx7("textarea", { value: p.shelterSource ?? "", onChange: (e) => change({ shelterSource: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxs7("p", { children: [
        "App\u63A1\u8A08\u907F\u96E3\u9762\u7A4D ",
        f5(r.shelterArea),
        "\u33A1\u3001\u5176\u4E2D\u65B0\u589E\u8A2D\u5099\u514D\u8A08 ",
        f5(r.shelterEquipment),
        "\u33A1\uFF1B\u53D7\u5EFA\u7BC9\u9762\u7A4D\u3001B1\u8A2D\u5099\u6C60\u53CA1/4\u5171\u540C\u9650\u5236\u3002\u5176\u9918\u907F\u96E3\u517C\u505C\u8ECA\u90E8\u5206\u5DF2\u5305\u542B\u539F\u505C\u8ECA\u6C60\uFF0C\u4E0D\u91CD\u8907\u589E\u52A0\u514D\u8A08\u3002",
        /* @__PURE__ */ jsx7("a", { href: law + "141", children: "\u7B2C141\u689D" }),
        " \uFF0F ",
        /* @__PURE__ */ jsx7("a", { href: law + "142", children: "\u7B2C142\u689D" }),
        " \uFF0F ",
        /* @__PURE__ */ jsx7("a", { href: "https://www.nlma.gov.tw/ch/titlelist/interpcomp/12845", children: "102\u5E74\u51FD\uFF1A\u8D85\u904E\u9644\u5EFA\u57FA\u6E96\u4E0D\u9069\u7528" })
      ] })
    ] })
  ] });
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/RegulatoryReviewPanel.tsx
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
var f6 = (n) => n.toLocaleString("zh-TW", {
  maximumFractionDigits: 2
});
function RegulatoryReviewPanel({
  input,
  result,
  edit
}) {
  const p = input.regulatoryReview ?? defaultRegulatoryReview(), v = result.values;
  const change = (x) => edit({
    regulatoryReview: {
      ...p,
      ...x
    }
  });
  const number = (key, label) => /* @__PURE__ */ jsxs8("label", { children: [
    /* @__PURE__ */ jsx8(FieldLabel7, { children: label }),
    /* @__PURE__ */ jsx8(PublicNumber7, { type: "number", min: "0", step: "any", value: p[key], onChange: (e) => change({
      [key]: e.target.value
    }) })
  ] });
  return /* @__PURE__ */ jsxs8("section", { className: "area-review-panel", "aria-label": "\u6CD5\u898F\u8207\u660E\u793A\u521D\u4F30\u5047\u8A2D", children: [
    /* @__PURE__ */ jsx8("h3", { children: "\u6CD5\u898F\u6AA2\u8A0E\u8207\u660E\u793A\u521D\u4F30\u5047\u8A2D" }),
    /* @__PURE__ */ jsxs8("p", { children: [
      /* @__PURE__ */ jsx8("strong", { children: "\u4F9D\u672C\u6B21\u689D\u4EF6\u9032\u884C\u898F\u5283\u521D\u4F30\u3002" }),
      "\u7F3A\u6587\u4EF6\u4EE5\u4EE5\u4E0B\u5047\u8A2D\u7E7C\u7E8C\u8A08\u7B97\uFF1B\u5DF2\u77E5\u8D85\u9650\u9808\u5360\u7528\u539F\u5BB9\u7A4D\uFF1B\u5730\u4E0B\u5C64\u6578\u4F9D\u672C\u6B21\u9078\u5B9A\u7684\u56FA\u5B9A\u6216\u641C\u5C0B\u65B9\u5F0F\u8655\u7406\u3002"
    ] }),
    v && /* @__PURE__ */ jsxs8("p", { children: [
      "\u90FD\u66F4\u63A1\u8A08 ",
      f6(v.renewalApplied),
      "%\u3001\u5BB9\u79FB\u63A1\u8A08 ",
      f6(v.tdrApplied),
      "%\uFF1B\u5730\u4E0A\u8A08\u5BB9 ",
      f6(v.aboveCounted),
      "\u33A1\uFF0B\u5730\u4E0B\u8A08\u5BB9 ",
      f6(v.basementCounted),
      "\u33A1\uFF1D",
      f6(v.used),
      "\u33A1\uFF0F\u76EE\u6A19\u4E0A\u9650 ",
      f6(v.allowed),
      "\u33A1\u3002"
    ] }),
    /* @__PURE__ */ jsxs8("details", { children: [
      /* @__PURE__ */ jsx8("summary", { children: "\u734E\u52F5\u3001\u5BB9\u79FB\u4E0A\u9650\u8207\u8A55\u9EDE\u5047\u8A2D" }),
      /* @__PURE__ */ jsx8("p", { children: "\u4E00\u822C\u90FD\u66F4\u734E\u52F5\u5148\u630950%\u4E0A\u9650\uFF1B\u7279\u5225\u8DEF\u5F91\u9808\u53E6\u586B\u4F9D\u64DA\u3002\u5BB9\u79FB\u5148\u6309\u4E00\u822C30%\u4E0A\u9650\uFF0C\u8A55\u9EDE\u672A\u586B\u6642\u63A1\u76EE\u6A19\u8207\u4E0A\u9650\u8F03\u4F4E\u8005\uFF0C\u8CC7\u683C\u4ECD\u5F85\u8986\u6838\u3002\u500B\u6848\u5408\u8A08\u4E0A\u9650\u6709\u9069\u7528\u4F9D\u64DA\u624D\u586B\uFF0C\u4E0D\u5C07\u7279\u6B8A\u5408\u8A0850%\u9650\u5236\u5957\u7528\u6240\u6709\u90FD\u66F4\u6848\u3002" }),
      /* @__PURE__ */ jsxs8("div", { className: "planning-field-grid", children: [
        number("renewalLimitPercent", "\u672C\u6B21\u90FD\u66F4\u8DEF\u5F91\u734E\u52F5\u4E0A\u9650%"),
        number("tdrLimitPercent", "\u672C\u6B21\u5BB9\u79FB\u4E0A\u9650%"),
        number("totalBonusLimitPercent", "\u500B\u6848\u734E\u52F5\u53CA\u5BB9\u79FB\u5408\u8A08\u4E0A\u9650%\uFF08\u7121\u8CC7\u6599\u7559\u767D\uFF09"),
        number("tdrBasePoints", "\u5BB9\u79FB\u57FA\u6E96\u91CF\u8A55\u9EDE%\uFF08\u672A\u6838\u5C0D\u53EF\u7559\u767D\uFF09"),
        number("tdrInternalPoints", "\u57FA\u5730\u5167\u90E8\u689D\u4EF6\u8A55\u9EDE%"),
        number("tdrExternalPoints", "\u5916\u90E8\u6539\u5584\u8A55\u9EDE%"),
        number("cashTdrPercent", "\u6298\u7E73\u4EE3\u91D1\u5360\u53EF\u79FB\u5165\u7E3D\u91CF\u6BD4\u4F8B%")
      ] }),
      /* @__PURE__ */ jsxs8("label", { children: [
        /* @__PURE__ */ jsx8("input", { type: "checkbox", checked: p.renewalArea, onChange: (e) => change({
          renewalArea: e.target.checked
        }) }),
        "\u4F9D\u6CD5\u5283\u5B9A\u66F4\u65B0\u5730\u5340\u52A0\u8A080.3\u500D\uFF08\u9808\u6838\u7BC4\u570D\uFF0C\u975E\u50C5\u56E0\u7533\u8ACB\u90FD\u66F4\uFF09"
      ] }),
      /* @__PURE__ */ jsxs8("label", { children: [
        /* @__PURE__ */ jsx8(FieldLabel7, { children: "\u4E0A\u9650\u3001\u8A55\u9EDE\u53CA\u7279\u6B8A\u9069\u7528\u4F9D\u64DA" }),
        /* @__PURE__ */ jsx8("textarea", { value: p.bonusSource, onChange: (e) => change({
          bonusSource: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxs8("p", { children: [
        /* @__PURE__ */ jsx8("a", { href: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070008&flno=65", children: "\u90FD\u66F4\u689D\u4F8B65\u689D" }),
        " \uFF0F ",
        /* @__PURE__ */ jsx8("a", { href: "https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150118", children: "\u65B0\u5317\u5BB9\u79FB\u91CF\u9AD4\u8A55\u5B9A\u539F\u5247" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs8("details", { open: true, children: [
      /* @__PURE__ */ jsx8("summary", { children: "\u5730\u4E0B\u514D\u8A08\u3001\u53CD\u8A08\u53CA\u7528\u9014\u5047\u8A2D" }),
      /* @__PURE__ */ jsxs8("div", { className: "planning-field-grid", children: [
        /* @__PURE__ */ jsxs8("label", { children: [
          /* @__PURE__ */ jsx8(FieldLabel7, { children: "\u81EA\u884C\u8ECA\u514D\u8A08\u8CC7\u683C" }),
          /* @__PURE__ */ jsxs8(PublicSelect6, { value: p.bicycleExemption, onChange: (e) => change({
            bicycleExemption: e.target.value
          }), children: [
            /* @__PURE__ */ jsx8("option", { value: "counted", children: "\u672A\u53D6\u5F97\u9069\u7528\u8CC7\u683C\uFF1A\u5148\u8A08\u5BB9" }),
            /* @__PURE__ */ jsx8("option", { value: "documented", children: "\u5DF2\u6838\u5C0D\u516C\u6709\uFF0F\u5168\u68DF\u793E\u5B85\u53CA\u500B\u6848\u571F\u7BA1\u514D\u8A08\u4F9D\u64DA" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs8("label", { children: [
          /* @__PURE__ */ jsx8(FieldLabel7, { children: "\u6A5F\u8ECA\u514D\u8A08\u8CC7\u683C" }),
          /* @__PURE__ */ jsxs8(PublicSelect6, { value: p.motorcycleExemption, onChange: (e) => change({
            motorcycleExemption: e.target.value
          }), children: [
            /* @__PURE__ */ jsx8("option", { value: "statutory_assumption", children: "\u66AB\u6309\u4F9D\u6CD5\u8A2D\u7F6E\u505C\u8ECA\u7A7A\u9593\u514D\u8A08\uFF08\u660E\u793A\u5047\u8A2D\uFF09" }),
            /* @__PURE__ */ jsx8("option", { value: "counted", children: "\u4E0D\u7B26\u514D\u8A08\uFF1A\u8A08\u5BB9" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs8("label", { children: [
          /* @__PURE__ */ jsx8(FieldLabel7, { children: "\u793E\u5340\u8ECA\u4F4D\u7528\u9014" }),
          /* @__PURE__ */ jsxs8(PublicSelect6, { value: p.communityUse, onChange: (e) => change({
            communityUse: e.target.value
          }), children: [
            /* @__PURE__ */ jsx8("option", { value: "loading", children: "\u66AB\u6309\u4F9D\u6CD5\u8A2D\u7F6E\u88DD\u5378\uFF0F\u5783\u573E\u8ECA\u81E8\u505C\u514D\u8A08" }),
            /* @__PURE__ */ jsx8("option", { value: "other", children: "\u5176\u4ED6\u672A\u78BA\u8A8D\u7528\u9014\uFF1A\u5148\u8A08\u5BB9" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs8("label", { children: [
          /* @__PURE__ */ jsx8(FieldLabel7, { children: "\u5730\u4E0B\u672A\u5B9A\u7528\u9014\u9918\u88D5" }),
          /* @__PURE__ */ jsxs8(PublicSelect6, { value: p.spareUse, onChange: (e) => change({
            spareUse: e.target.value
          }), children: [
            /* @__PURE__ */ jsx8("option", { value: "counted", children: "\u5148\u8A08\u5BB9\uFF0C\u4E0D\u5217\u623F\u5C4B\u53EF\u552E" }),
            /* @__PURE__ */ jsx8("option", { value: "parking", children: "\u66AB\u4F5C\u505C\u8ECA\u5FC5\u8981\u7A7A\u9593\uFF0C\u7D0D\u6C7D\u8ECA40\u33A1\u4E0A\u9650" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs8("label", { children: [
        /* @__PURE__ */ jsx8(FieldLabel7, { children: "\u81EA\u884C\u8ECA\u514D\u8A08\u9069\u7528\u6CD5\u4EE4\uFF0F\u6838\u5B9A\u8CC7\u6599" }),
        /* @__PURE__ */ jsx8("textarea", { value: p.bicycleSource, onChange: (e) => change({
          bicycleSource: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsx8("p", { children: "\u5730\u4E0B\u975E\u6A5F\u68B0\u6C7D\u8ECA\u505C\u8ECA\u6C60\u53CA\u5FC5\u8981\u7A7A\u9593\u6309\u5730\u4E0B\u5E73\u9762\u6C7D\u8ECA\u4F4D\xD740\u33A1\u4E0A\u9650\uFF1B\u6A5F\u68B0\u505C\u8ECA\u4F9D\u5BE6\u969B\u7A7A\u9593\u53E6\u6838\u514D\u8A08\uFF0C\u4E0D\u7528\u6A5F\u68B0\u6216\u5730\u9762\u8ECA\u4F4D\u64F4\u5927\u5730\u4E0B40\u33A1\u6C60\uFF1B\u5730\u4E0B\u8A2D\u5099\u68AF\u9593\u5148\u6263\u660E\u793A\u914D\u7F6E\u7684\u5408\u683C\u9632\u7A7A\u907F\u96E3\u8A2D\u5099\u90E8\u5206\uFF0C\u518D\u4F75\u505C\u8ECA\u6C60\u5269\u9918\u984D\u5EA6\uFF0C\u9918\u984D\u56DE\u6B78\u6A5F\u96FB\u7E3D\u4E0A\u9650\u3002\u5171\u540C\u901A\u9053\u6309\u670D\u52D9\u9762\u7A4D\u5206\u914D\u5C6C\u521D\u4F30\u65B9\u6CD5\uFF0C\u8207\u767B\u8A18\u6301\u5206\u5206\u958B\u3002" }),
      v && /* @__PURE__ */ jsxs8("table", { children: [
        /* @__PURE__ */ jsx8("thead", { children: /* @__PURE__ */ jsxs8("tr", { children: [
          /* @__PURE__ */ jsx8("th", { children: "\u5730\u4E0B\u6CD5\u898F\u6AA2\u8A0E" }),
          /* @__PURE__ */ jsx8("th", { children: "\u33A1" })
        ] }) }),
        /* @__PURE__ */ jsx8("tbody", { children: [["\u6C7D\u8ECA\u505C\u8ECA\u514D\u8A08\u4E0A\u9650", v.parkingCap], ["\u8A2D\u5099\u68AF\u9593\u4F75\u5165\u505C\u8ECA\u514D\u8A08", v.basementEquipmentMerged], ["\u8A2D\u5099\u68AF\u9593\u56DE\u6B78\u6A5F\u96FB\u984D\u5EA6\u514D\u8A08", v.basementEquipmentGlobalExempt], ["\u8A2D\u5099\u68AF\u9593\u8D85\u984D\u8A08\u5BB9", v.basementEquipmentCounted], ["\u6C7D\u8ECA\u505C\u8ECA\u6C60\u8D85\u984D\u8A08\u5BB9", v.parkingCounted], ["\u81EA\u884C\u8ECA\u53CA\u670D\u52D9\u7A7A\u9593\u8A08\u5BB9", v.bicycleCounted], ["\u6A5F\u8ECA\u8A08\u5BB9", v.motorcycleCounted], ["\u793E\u5340\u7528\u9014\u8A08\u5BB9", v.communityCounted], ["\u672A\u5B9A\u7528\u9014\u9918\u88D5\u8A08\u5BB9", v.spareCounted], ["\u5730\u4E0B\u8A08\u5BB9\u5408\u8A08", v.basementCounted], ["\u5730\u4E0B\u514D\u8A08\u5408\u8A08", v.basementExempt], ["\u5730\u4E0B\u5BE6\u9AD4\u9762\u7A4D", v.basement]].map(([label, n]) => /* @__PURE__ */ jsxs8("tr", { children: [
          /* @__PURE__ */ jsx8("th", { children: label }),
          /* @__PURE__ */ jsx8("td", { children: f6(Number(n)) })
        ] }, label)) })
      ] }),
      /* @__PURE__ */ jsxs8("details", { children: [
        /* @__PURE__ */ jsx8("summary", { children: "\u9010\u9805\u514D\u8A08\u984D\u5EA6\u3001\u5206\u6524\u8207\u8A08\u5BB9\u539F\u56E0" }),
        /* @__PURE__ */ jsx8(BasementAudit, { input: result.basementDemandReview ? {
          ...input,
          ...result.basementDemandReview.resolved
        } : input, result, edit })
      ] }),
      /* @__PURE__ */ jsxs8("p", { children: [
        /* @__PURE__ */ jsx8("a", { href: "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0070115&flno=60", children: "\u5EFA\u628060\u689D" }),
        " \uFF0F ",
        /* @__PURE__ */ jsx8("a", { href: "https://www.nlma.gov.tw/ch/titlelist/interpcomp/13665", children: "108\u5E74\u51FD" }),
        " \uFF0F ",
        /* @__PURE__ */ jsx8("a", { href: "https://web.law.ntpc.gov.tw/Scripts/FLAWDAT0202.aspx?fcode=C0150004", children: "\u65B0\u5317\u90FD\u5BE9\u539F\u5247" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs8("details", { children: [
      /* @__PURE__ */ jsx8("summary", { children: "\u666E\u901A\u8A08\u5BB9\u6A13\u677F\u5167\u7684\u516C\u8A2D\u5206\u985E\u5047\u8A2D" }),
      /* @__PURE__ */ jsx8("p", { children: "\u9580\u5EF3\u3001\u8D70\u5ECA\u3001\u4EA4\u8ABC\u7B49\u5982\u5DF2\u5305\u542B\u666E\u901A\u6A13\u677F\uFF0C\u53EA\u91CD\u65B0\u5206\u985E\uFF0C\u4E0D\u518D\u589E\u52A0\u53EF\u552E\u9762\u7A4D\u3002\u8ACB\u586B\u5165\u9580\u5EF3\u3001\u8D70\u5ECA\u53CA\u4EA4\u8ABC\u7B49\u7A7A\u9593\u7684\u898F\u5283\u6BD4\u4F8B\uFF1B\u9810\u8A2D0%\u70BA\u5C1A\u672A\u62C6\u5206\u3002" }),
      number("ordinaryCommonPercent", "\u666E\u901A\u6A13\u677F\u5167\u8A08\u5BB9\u516C\u8A2D\u6BD4\u4F8B%"),
      /* @__PURE__ */ jsxs8("label", { children: [
        /* @__PURE__ */ jsx8(FieldLabel7, { children: "\u8A08\u5BB9\u516C\u8A2D\u914D\u7F6E\u6216\u898F\u5283\u5047\u8A2D" }),
        /* @__PURE__ */ jsx8("textarea", { value: p.ordinaryCommonSource, onChange: (e) => change({
          ordinaryCommonSource: e.target.value
        }) })
      ] }),
      v && /* @__PURE__ */ jsxs8("p", { children: [
        "\u672C\u6B21\u91CD\u65B0\u5206\u985E ",
        f6(v.ordinaryCommon),
        "\u33A1\uFF0C\u623F\u5C4B\u53EF\u552E\u7E3D\u91CF\u4E0D\u56E0\u6B64\u589E\u52A0\u3002"
      ] })
    ] })
  ] });
}

// ../../../../../../src/sanze-cases-desktop/src/components/efficiency/SiteRoadConditionsPanel.tsx
import { FieldLabel as FieldLabel8, PublicNumber as PublicNumber8 } from "/src/land-evaluation/PublicFields.jsx";
import { PublicSelect as PublicSelect7 } from "/src/land-evaluation/PublicSelect.jsx";
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
function SiteRoadConditionsPanel({
  value,
  onChange,
  readOnly = false
}) {
  const r = value ?? newSiteRoadConditions(), check = reviewSiteRoad(value), edit = (p) => onChange?.({
    ...r,
    ...p,
    status: p.status ?? (r.status === "confirmed" ? "assumed" : r.status)
  });
  return /* @__PURE__ */ jsxs9("section", { className: "workflow-panel site-road-panel", "aria-label": "\u57FA\u5730\u9053\u8DEF\u689D\u4EF6", children: [
    /* @__PURE__ */ jsx9("h3", { children: "\u57FA\u5730\u9053\u8DEF\u689D\u4EF6\uFF08\u5FC5\u9808\u8F38\u5165\u4E26\u78BA\u8A8D\uFF09" }),
    /* @__PURE__ */ jsx9("p", { children: "\u8A08\u756B\u8DEF\u5BEC\u3001\u5BE6\u969B\u958B\u95E2\u5BEC\u5EA6\u8207\u57FA\u5730\u9762\u5BEC\u5206\u5225\u586B\u5BEB\u3002\u5DF2\u78BA\u8A8D\u4E0D\u7B26\u7533\u8ACB\u9580\u6ABB\u6642\uFF0C\u6703\u63D0\u793A\u8ABF\u6574\u689D\u4EF6\uFF1B\u672A\u78BA\u8A8D\u53EF\u6309\u660E\u793A\u5047\u8A2D\u521D\u4F30\u3002\u591A\u9762\u81E8\u8DEF\u8ACB\u6307\u5B9A\u672C\u6B21\u6AA2\u8A0E\u9053\u8DEF\uFF0C\u4E0D\u628A\u4E0D\u540C\u9053\u8DEF\u7684\u8DEF\u5BEC\u8207\u9762\u5BEC\u6DF7\u7528\u3002" }),
    /* @__PURE__ */ jsxs9("fieldset", { disabled: readOnly, children: [
      /* @__PURE__ */ jsxs9("div", { className: "site-road-fields", children: [
        /* @__PURE__ */ jsxs9("label", { children: [
          /* @__PURE__ */ jsx9(FieldLabel8, { children: "\u672C\u6B21\u6AA2\u8A0E\u9053\u8DEF\u540D\u7A31" }),
          /* @__PURE__ */ jsx9("input", { value: r.roadName, onChange: (e) => edit({
            roadName: e.target.value
          }) })
        ] }),
        [["plannedWidth", "\u8A08\u756B\u9053\u8DEF\u5BEC\u5EA6m"], ["openedWidth", "\u5BE6\u969B\u958B\u95E2\u9053\u8DEF\u5BEC\u5EA6m"], ["frontage", "\u540C\u4E00\u8DEF\u6BB5\u57FA\u5730\u9762\u5BECm"]].map(([k, label]) => /* @__PURE__ */ jsxs9("label", { children: [
          /* @__PURE__ */ jsx9(FieldLabel8, { children: label }),
          /* @__PURE__ */ jsx9(PublicNumber8, { "aria-label": label, "aria-required": k === "plannedWidth", type: "number", min: "0.01", step: "any", value: r[k], onChange: (e) => edit({
            [k]: e.target.value
          }) })
        ] }, k))
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "site-road-fields le-road-verification", children: [
        /* @__PURE__ */ jsxs9("label", { children: [
          /* @__PURE__ */ jsx9(FieldLabel8, { children: "\u8DB3\u5BEC\u958B\u95E2\u9053\u8DEF\u4E4B\u9023\u901A" }),
          /* @__PURE__ */ jsxs9(PublicSelect7, { value: r.connected, onChange: (e) => edit({
            connected: e.target.value
          }), children: [
            /* @__PURE__ */ jsx9("option", { value: "unknown", children: "\u5C1A\u5F85\u78BA\u8A8D" }),
            /* @__PURE__ */ jsx9("option", { value: "yes", children: "\u5DF2\u78BA\u8A8D\u9023\u901A" }),
            /* @__PURE__ */ jsx9("option", { value: "no", children: "\u5DF2\u78BA\u8A8D\u4E0D\u7B26" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs9("label", { children: [
          /* @__PURE__ */ jsx9(FieldLabel8, { children: "\u8DEF\u5BEC\u78BA\u8A8D\u72C0\u614B" }),
          /* @__PURE__ */ jsxs9(PublicSelect7, { "aria-label": "\u8DEF\u5BEC\u78BA\u8A8D\u72C0\u614B", value: r.status, onChange: (e) => edit({
            status: e.target.value
          }), children: [
            /* @__PURE__ */ jsx9("option", { value: "unknown", children: "\u5F85\u8F38\u5165\u78BA\u8A8D" }),
            /* @__PURE__ */ jsx9("option", { value: "assumed", children: "\u660E\u793A\u66AB\u63A1\u503C\uFF0C\u7E7C\u7E8C\u521D\u4F30" }),
            /* @__PURE__ */ jsx9("option", { value: "confirmed", children: "\u5DF2\u67E5\u8B49\u78BA\u8A8D\uFF0C\u4F9D\u9580\u6ABB\u963B\u64CB" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs9("label", { children: [
          /* @__PURE__ */ jsx9(FieldLabel8, { children: "\u8DEF\u5BEC\u67E5\u8B49\u65E5\u671F" }),
          /* @__PURE__ */ jsx9("input", { type: "date", value: r.checkedAt, onInput: (e) => edit({
            checkedAt: e.currentTarget.value
          }), onChange: (e) => edit({
            checkedAt: e.target.value
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs9("label", { children: [
        /* @__PURE__ */ jsx9(FieldLabel8, { children: "\u8DEF\u5BEC\u67E5\u8B49\u4F86\u6E90\uFF0F\u5716\u8CC7\u91CF\u6E2C\uFF0F\u6587\u4EF6" }),
        /* @__PURE__ */ jsx9("textarea", { value: r.source, onChange: (e) => edit({
          source: e.target.value
        }) })
      ] })
    ] }),
    readOnly && /* @__PURE__ */ jsx9("p", { children: "\u9023\u52D5\u672C\u6848\u300C\u57FA\u5730\u8207\u689D\u4EF6\u300D\uFF0C\u8ACB\u56DE\u8A72\u9801\u4FEE\u6539\uFF1B\u8B8A\u66F4\u5F8C\u9808\u91CD\u65B0\u78BA\u8A8D\u3002" }),
    check.errors.map((x) => /* @__PURE__ */ jsx9("p", { role: "alert", children: x }, x)),
    check.notes.map((x) => /* @__PURE__ */ jsx9("p", { children: x }, x))
  ] });
}
export {
  AreaReviewPanel,
  BonusAssessmentPanel,
  LegalParkingPanel,
  RegulatoryReviewPanel,
  SiteRoadConditionsPanel
};
