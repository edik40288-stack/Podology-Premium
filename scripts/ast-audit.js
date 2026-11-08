const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const labDir = path.resolve(__dirname, '..');
const testsDir = path.join(labDir, 'qa/tests');

function scanFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (err) {
    return [{ file: filePath, line: 1, rule: 'PARSE_ERROR', message: err.message }];
  }

  const violations = [];

  traverse(ast, {
    CallExpression(nodePath) {
      const node = nodePath.node;

      // 1. Check expect(true).toBeTruthy() or expect(true).toBe(true)
      if (node.callee && node.callee.type === 'MemberExpression') {
        const obj = node.callee.object;
        const prop = node.callee.property;
        if (obj && obj.type === 'CallExpression' && obj.callee && obj.callee.name === 'expect') {
          const expectArg = obj.arguments[0];
          if (expectArg && expectArg.type === 'BooleanLiteral' && expectArg.value === true) {
            violations.push({
              file: path.relative(labDir, filePath),
              line: node.loc ? node.loc.start.line : 0,
              rule: 'UNCONDITIONAL_EXPECT',
              message: `Found unconditional assertion: expect(true).${prop.name}()`
            });
          }
        }
      }

      // 2. Check catch blocks that suppress errors completely without rethrow or status recording
      if (nodePath.isCatchClause()) {
        const body = nodePath.node.body.body;
        if (body.length === 0) {
          violations.push({
            file: path.relative(labDir, filePath),
            line: nodePath.node.loc ? nodePath.node.loc.start.line : 0,
            rule: 'EMPTY_CATCH',
            message: 'Empty catch block suppresses errors silently'
          });
        }
      }
    },

    CatchClause(nodePath) {
      const body = nodePath.node.body.body;
      if (body.length === 0) {
        violations.push({
          file: path.relative(labDir, filePath),
          line: nodePath.node.loc ? nodePath.node.loc.start.line : 0,
          rule: 'EMPTY_CATCH',
          message: 'Empty catch block suppresses errors silently'
        });
      }
    },

    LogicalExpression(nodePath) {
      // 3. Check '|| true' pattern in boolean evaluation
      if (nodePath.node.operator === '||' && nodePath.node.right && nodePath.node.right.type === 'BooleanLiteral' && nodePath.node.right.value === true) {
        violations.push({
          file: path.relative(labDir, filePath),
          line: nodePath.node.loc ? nodePath.node.loc.start.line : 0,
          rule: 'TRIVIAL_OR_TRUE',
          message: 'Expression always evaluates to true via `|| true`'
        });
      }
    }
  });

  return violations;
}

function runAudit() {
  const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.spec.js'));
  console.log(`Auditing ${files.length} test specification files in qa/tests...\n`);

  let allViolations = [];
  files.forEach(f => {
    const fullPath = path.join(testsDir, f);
    const v = scanFile(fullPath);
    if (v.length > 0) {
      console.log(`[VIOLATIONS DETECTED] ${f}: ${v.length} issues`);
      v.slice(0, 3).forEach(item => {
        console.log(`  Line ${item.line} [${item.rule}]: ${item.message}`);
      });
      if (v.length > 3) console.log(`  ... and ${v.length - 3} more`);
    } else {
      console.log(`[CLEAN] ${f}`);
    }
    allViolations = allViolations.concat(v);
  });

  console.log(`\n========================================`);
  console.log(`Total AST Violations Across Test Suite: ${allViolations.length}`);
  console.log(`========================================\n`);

  const reportPath = path.join(labDir, 'reports/ast-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(allViolations, null, 2), 'utf8');
  console.log(`Saved detailed JSON audit report to: ${reportPath}`);

  return allViolations;
}

runAudit();
