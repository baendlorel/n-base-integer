import ts from 'typescript';

/**
 * 工厂函数，利用 program 全局收集常量，并返回 CustomTransformers
 * @param constNames 需要折叠的常量名数组
 */
// todo 入参不如改为constname需要满足的正则表达式
export function createConstFoldTransformers(constNames: string[]) {
  return (program: ts.Program) => {
    // 1. 全局收集常量
    const constValues: Record<string, string | number | boolean | null> = {};
    for (const sf of program.getSourceFiles()) {
      if (sf.isDeclarationFile) continue;
      ts.forEachChild(sf, function collect(node: ts.Node) {
        if (ts.isVariableStatement(node) && node.declarationList.flags & ts.NodeFlags.Const) {
          for (const decl of node.declarationList.declarations) {
            if (
              ts.isIdentifier(decl.name) &&
              constNames.includes(decl.name.text) &&
              decl.initializer
            ) {
              if (ts.isStringLiteral(decl.initializer)) {
                constValues[decl.name.text] = decl.initializer.text;
              } else if (ts.isNumericLiteral(decl.initializer)) {
                constValues[decl.name.text] = Number(decl.initializer.text);
              } else if (decl.initializer.kind === ts.SyntaxKind.TrueKeyword) {
                constValues[decl.name.text] = true;
              } else if (decl.initializer.kind === ts.SyntaxKind.FalseKeyword) {
                constValues[decl.name.text] = false;
              } else if (decl.initializer.kind === ts.SyntaxKind.NullKeyword) {
                constValues[decl.name.text] = null;
              }
            }
          }
        }
        ts.forEachChild(node, collect);
      });
    }

    console.log('Collected constant values:', constValues);

    // 2. 返回 transformer
    return {
      before: [constFoldTransformer(constNames, constValues)],
    };
  };
}

function constFoldTransformer(
  consts: string[],
  constValues: Record<string, any>
): ts.TransformerFactory<ts.SourceFile> {
  return (context) => {
    // Helper: is this identifier a declaration name?
    function isDeclarationName(node: ts.Identifier): boolean {
      const parent = node.parent;
      if (!parent) return false;
      return (
        (ts.isVariableDeclaration(parent) && parent.name === node) ||
        (ts.isFunctionDeclaration(parent) && parent.name === node) ||
        (ts.isClassDeclaration(parent) && parent.name === node) ||
        (ts.isTypeAliasDeclaration(parent) && parent.name === node) ||
        (ts.isInterfaceDeclaration(parent) && parent.name === node)
      );
    }
    // Helper: is this identifier a property key?
    function isPropertyKey(node: ts.Identifier): boolean {
      const parent = node.parent;
      if (!parent) return false;
      return (
        (ts.isPropertyAssignment(parent) ||
          ts.isPropertySignature(parent) ||
          ts.isMethodDeclaration(parent) ||
          ts.isMethodSignature(parent)) &&
        parent.name === node
      );
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
      if (
        ts.isIdentifier(node) &&
        consts.includes(node.text) &&
        !isDeclarationName(node) &&
        !isPropertyKey(node)
      ) {
        const value = constValues[node.text];
        switch (typeof value) {
          case 'string':
            return ts.factory.createStringLiteral(value);
          case 'boolean':
            return value ? ts.factory.createTrue() : ts.factory.createFalse();
          case 'number':
            return ts.factory.createNumericLiteral(value);
          default:
            if (value === null) {
              return ts.factory.createNull();
            }
            break;
        }
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (sf) => ts.visitNode(sf, visit) as ts.SourceFile;
  };
}
