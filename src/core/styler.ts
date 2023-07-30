import { Node } from 'acorn';
import * as acornWalk from 'acorn-walk';
import * as objectPath from 'object-path';


function findDomNodes(ast: any) {
  return ast.body[0].expression.children;
}

const NODE_TYPE = {
  JSXElement: 'JSXElement',
  Literal: 'Literal',
  JSXExpressionContainer: 'JSXExpressionContainer',
  MemberExpression: 'MemberExpression',
  CallExpression: 'CallExpression'
};

function traverse(obj: any, condition: any, getter = (value: any) => value) {
  const result: string[] = [];
  
  _traverse(obj, condition, getter);
  function _traverse(obj: any, condition: any, getter = (value: any) => value) {
    const type = Object.prototype.toString.call(obj);
    if(type === '[object Object]' || type === '[object Array]') {
      const keys = Object.keys(obj);
      for(let k of keys) {
        var val = obj[k];
        if(condition(val)) {
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
  constructor(){}

  _isTargetNode(node: Node) {
    return node.type === NODE_TYPE.JSXElement;
  }

  _transformAttr(node: any) {
    const JSXIdentifierNode = node.name;
    if(JSXIdentifierNode?.type === 'JSXIdentifier' && JSXIdentifierNode.name === 'className') {
      const classValueNode = node.value;
      if(classValueNode.type === NODE_TYPE.Literal) {
        return '.'+classValueNode.value;
      }
      if(classValueNode.type === NODE_TYPE.JSXExpressionContainer) {
        const expressionNode = classValueNode.expression;
        if(expressionNode.type === NODE_TYPE.MemberExpression && objectPath.get(expressionNode, 'object.name') === 'styles') {
          return '.' + objectPath.get(expressionNode, 'property.name');
        }

        if(expressionNode.type === NODE_TYPE.CallExpression && ['cx', 'classNames', 'classnames', 'cls', 'cn', 'cns', 'CN', 'CNS'].includes(objectPath.get(expressionNode, 'callee.name'))) {
          const classNames = traverse(expressionNode, (node: any) => {
            return node.type === NODE_TYPE.MemberExpression && objectPath.get(node, 'object.name') === 'styles';
          }, (val) => objectPath.get(val, 'property.name')); 

          return classNames.map(s => `.${s}`).join(' ');
        }
      }
    }
  }
  
  generateStyle(ast: Node) {
    const cssTree = [];
    const domAst = findDomNodes(ast);
    const context = this;

    // 1. 生成class的结构
    for(let i = 0; i < domAst.length; ++i) {
      const treeObj = walk(domAst[i]);
      treeObj && cssTree.push(treeObj);
    }


    function walk(node: any) {
      if(!context._isTargetNode(node)) {return;}
      let nodeObj: any = {
        className: '',
        children: []
      };

      const {openingElement, children} = node;
      const {attributes} = openingElement;
      if(attributes) {
        let result = '';
        for(let jsxAttr of attributes) {
          result += context._transformAttr(jsxAttr) || '';
          result += ' ';
        }
        nodeObj.className = result;
      }

      for(let c of children) {
        const childObj = walk(c);
        childObj && nodeObj.children.push(childObj);
      }
      return nodeObj;
    }

    // 2. 生成class字符串
    let cssStr = '';
    for(let i = 0; i < cssTree.length; ++i) {
      const node = cssTree[i];
      cssStr += node2css(node) || '';
    }

    function node2css(node:any) {
      const {className, children} = node;
      if(!className.trim()) {return children.map((n: any) => node2css(n)).filter((u: string) => Boolean(u)).join(`
      `);};
      return `${className} {
        ${children.map((n: any) => node2css(n)).filter((u: string) => Boolean(u)).join(`
        `)}
      }`;
    }

    return cssStr;
  }
}

export default Styler;
