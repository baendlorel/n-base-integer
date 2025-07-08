import * as ts from 'typescript';

// 1. 收集常量定义
const constValues: Record<string, ts.Expression> = {};
/**
 * Create a TypeScript transformer that replaces specified constant identifiers with their literal values,
 * except in variable declarations, import/export statements, and property keys.
 * @param constants An object mapping constant names to their literal values.
 */
export default function constFold(consts: string[]): ts.TransformerFactory<ts.SourceFile> {
  return (context) => {
    // Helper: is this identifier a declaration name?
    const isDeclarationName = function (node: ts.Identifier): boolean {
      const parent = node.parent;
      if (!parent) return false;
      return (
        (ts.isVariableDeclaration(parent) && parent.name === node) ||
        (ts.isFunctionDeclaration(parent) && parent.name === node) ||
        (ts.isClassDeclaration(parent) && parent.name === node) ||
        (ts.isTypeAliasDeclaration(parent) && parent.name === node) ||
        (ts.isInterfaceDeclaration(parent) && parent.name === node)
      );
    };

    // Helper: is this identifier a property key?
    const isPropertyKey = function (node: ts.Identifier): boolean {
      const parent = node.parent;
      if (!parent) return false;
      return (
        (ts.isPropertyAssignment(parent) ||
          ts.isPropertySignature(parent) ||
          ts.isMethodDeclaration(parent) ||
          ts.isMethodSignature(parent)) &&
        parent.name === node
      );
    };

    function collectConsts(node: ts.Node) {
      if (ts.isVariableStatement(node) && node.declarationList.flags & ts.NodeFlags.Const) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name) && consts.includes(decl.name.text) && decl.initializer) {
            constValues[decl.name.text] = decl.initializer;
          }
        }
      }
      ts.forEachChild(node, collectConsts);
    }

    const visit: ts.Visitor = (node) => {
      // Do not replace in import/export declarations
      if (
        ts.isImportDeclaration(node) ||
        ts.isExportDeclaration(node) ||
        ts.isImportSpecifier(node) ||
        ts.isExportSpecifier(node)
      ) {
        return node;
      }

      ts.isIdentifier(node) &&
        consts.includes(node.text) &&
        console.log('try', String(node.text), consts.includes(node.text));
      // Only replace identifiers that match the constant names and are not declaration/prop keys
      if (
        ts.isIdentifier(node) &&
        consts.includes(node.text) &&
        !isDeclarationName(node) &&
        !isPropertyKey(node)
      ) {
        console.log('replace', node.text);
        const value = Reflect.get(constValues[node.text], 'text'); // constants[node.text];
        if (typeof value === 'string') {
          return ts.factory.createStringLiteral(value);
        } else if (typeof value === 'number') {
          return ts.factory.createNumericLiteral(value);
        } else if (typeof value === 'boolean') {
          return value ? ts.factory.createTrue() : ts.factory.createFalse();
        } else if (value === null) {
          return ts.factory.createNull();
        }
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (sf) => {
      collectConsts(sf); // 先收集常量定义
      return ts.visitNode(sf, visit) as ts.SourceFile;
    };
  };
}

// Example usage:
// import { createConstFoldTransformer } from './const-fold';
// const transformer = createConstFoldTransformer({ FOO: 123, BAR: 'hello' });
// Pass `transformer` to the `before` or `after` array in your ts.CompilerOptions.plugins or programmatic API.
