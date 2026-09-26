// Lint do frontend (o CRA fazia isso embutido; saiu com a troca pelo Vite).
// Mesmas regras que o CRA acusava: hooks, variáveis sem uso e ==.
// `npm run lint` falha com qualquer aviso (--max-warnings 0), também no CI.
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

// Componente importado e usado só no JSX não é "variável sem uso". Era a única
// regra que vinha do eslint-plugin-react (parado, sem suporte ao ESLint 10);
// jsx-uses-react não faz falta com o JSX automático do React 17+.
const jsx = {
  rules: {
    "uses-vars": {
      meta: { type: "problem", schema: [] },
      create(context) {
        const marca = (node, nome) => context.sourceCode.markVariableAsUsed(nome, node);
        return {
          JSXOpeningElement(node) {
            let nome = node.name;
            while (nome.type === "JSXMemberExpression") nome = nome.object;  // <Foo.Bar />
            if (nome.type === "JSXIdentifier" && /^[A-Z]/.test(nome.name)) marca(node, nome.name);
          },
        };
      },
    },
  },
};

export default [
  { ignores: ["build/**", "node_modules/**"] },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
    plugins: { jsx, "react-hooks": reactHooks },
    rules: {
      "jsx/uses-vars": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
      eqeqeq: ["warn", "smart"],
    },
  },
  {
    files: ["src/**/*.test.{js,jsx}", "src/setupTests.js"],
    languageOptions: { globals: { ...globals.browser, ...globals.node, vi: "readonly", test: "readonly", expect: "readonly", describe: "readonly", beforeEach: "readonly", afterEach: "readonly" } },
  },
];
