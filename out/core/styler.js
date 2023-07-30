import * as objectPath from 'object-path';
function findDomNodes(ast) {
    return ast.body[0].expression.children;
}
const NODE_TYPE = {
    JSXElement: 'JSXElement',
    Literal: 'Literal',
    JSXExpressionContainer: 'JSXExpressionContainer',
    MemberExpression: 'MemberExpression',
    CallExpression: 'CallExpression'
};
function traverse(obj, condition, getter = (value) => value) {
    const result = [];
    _traverse(obj, condition, getter);
    function _traverse(obj, condition, getter = (value) => value) {
        const type = Object.prototype.toString.call(obj);
        if (type === '[object Object]' || type === '[object Array]') {
            const keys = Object.keys(obj);
            for (let k of keys) {
                var val = obj[k];
                if (condition(val)) {
                    const getterVal = getter(val);
                    getterVal && result.push(getterVal);
                    continue;
                }
                _traverse(val, condition, getter);
            }
        }
    }
    return result;
}
class Styler {
    constructor() { }
    _isTargetNode(node) {
        return node.type === NODE_TYPE.JSXElement;
    }
    _transformAttr(node) {
        const JSXIdentifierNode = node.name;
        if (JSXIdentifierNode?.type === 'JSXIdentifier' && JSXIdentifierNode.name === 'className') {
            const classValueNode = node.value;
            if (classValueNode.type === NODE_TYPE.Literal) {
                return '.' + classValueNode.value;
            }
            if (classValueNode.type === NODE_TYPE.JSXExpressionContainer) {
                const expressionNode = classValueNode.expression;
                if (expressionNode.type === NODE_TYPE.MemberExpression && objectPath.get(expressionNode, 'object.name') === 'styles') {
                    return '.' + objectPath.get(expressionNode, 'property.name');
                }
                if (expressionNode.type === NODE_TYPE.CallExpression && ['cx', 'classNames', 'classnames', 'cls', 'cn', 'cns', 'CN', 'CNS'].includes(objectPath.get(expressionNode, 'callee.name'))) {
                    const classNames = traverse(expressionNode, (node) => {
                        return node.type === NODE_TYPE.MemberExpression && objectPath.get(node, 'object.name') === 'styles';
                    }, (val) => objectPath.get(val, 'property.name'));
                    return classNames.map(s => `.${s}`).join(' ');
                }
            }
        }
    }
    generateStyle(ast) {
        const cssTree = [];
        const domAst = findDomNodes(ast);
        const context = this;
        // 1. 生成class的结构
        for (let i = 0; i < domAst.length; ++i) {
            const treeObj = walk(domAst[i]);
            treeObj && cssTree.push(treeObj);
        }
        function walk(node) {
            if (!context._isTargetNode(node)) {
                return;
            }
            let nodeObj = {
                className: '',
                children: []
            };
            const { openingElement, children } = node;
            const { attributes } = openingElement;
            if (attributes) {
                let result = '';
                for (let jsxAttr of attributes) {
                    result += context._transformAttr(jsxAttr) || '';
                    result += ' ';
                }
                nodeObj.className = result;
            }
            for (let c of children) {
                const childObj = walk(c);
                childObj && nodeObj.children.push(childObj);
            }
            return nodeObj;
        }
        // 2. 生成class字符串
        let cssStr = '';
        for (let i = 0; i < cssTree.length; ++i) {
            const node = cssTree[i];
            cssStr += node2css(node) || '';
        }
        function node2css(node) {
            const { className, children } = node;
            if (!className.trim()) {
                return children.map((n) => node2css(n)).filter((u) => Boolean(u)).join(`
      `);
            }
            ;
            return `${className} {
        ${children.map((n) => node2css(n)).filter((u) => Boolean(u)).join(`
        `)}
      }`;
        }
        return cssStr;
    }
}
export default Styler;
//# sourceMappingURL=styler.js.map