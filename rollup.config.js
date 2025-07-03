import path from 'path';
import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import { isPromise, isProxy } from 'util/types';
import { exit } from 'process';

const tsconfigFile = './tsconfig.build.json';

const prox = (a, name) =>
  new Proxy(a, {
    get(target, prop) {
      const sub = `${name}.${String(prop)}`;
      const value = target[prop];
      console.log('now', sub);
      if (prop === 'prototype') {
        return value;
      }
      if (value instanceof RegExp) {
        return value;
      }

      if (typeof value === 'object' && value !== null) {
        // 如果是对象或数组，递归代理
        return prox(value, sub);
      } else {
        return value;
      }
    },
  });

const b = babel(
  prox(
    {
      babelHelpers: 'bundled',
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      presets: [['@babel/preset-env', { targets: { node: '14' } }]],
      plugins: [
        [
          '@babel/plugin-proposal-decorators',
          {
            version: '2021-12', // 使用新版装饰器，如需旧版使用 legacy: true
          },
        ],
      ],
    },
    'babelist'
  )
);

const t = typescript(
  prox(
    {
      tsconfig: tsconfigFile,
    },
    'tsist'
  )
);
console.log('babel', typeof b, 'isProxy', isProxy(b), 'isPromise', isPromise(b));

for (const key in Object.getOwnPropertyDescriptors(b)) {
  if (Object.prototype.hasOwnProperty.call(b, key)) {
    const element = b[key];
    if (typeof element === 'function') {
      // 如果是函数，打印函数名和参数
      console.log(`${key} :`, element.toString());
    } else {
      console.log('babel', element);
    }
  }
}

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  // 主打包配置 - 混淆版
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs', // 指定为CommonJS格式
        sourcemap: true,
        name: 'NBaseInteger', // 全局名称
      },
    ],
    plugins: prox(
      [
        alias(
          prox(
            {
              entries: [{ find: /^@/, replacement: path.resolve(import.meta.dirname, 'src') }],
            },
            'alias'
          )
        ),
        resolve(prox({}, 'resolve')),
        commonjs(prox({}, 'commonjs')),
        babel(
          prox(
            {
              babelHelpers: 'bundled',
              extensions: ['.ts', '.tsx', '.js', '.jsx'],
              presets: [['@babel/preset-env', { targets: { node: '14' } }]],
              plugins: [
                [
                  '@babel/plugin-proposal-decorators',
                  {
                    version: '2021-12', // 使用新版装饰器，如需旧版使用 legacy: true
                  },
                ],
              ],
            },
            'babel'
          )
        ),
        typescript(
          prox(
            {
              tsconfig: tsconfigFile,
            },
            'ts'
          )
        ),
        void terser({
          format: {
            comments: false, // 移除所有注释
          },
          compress: {
            drop_console: true,
            // 安全的常量折叠和死代码消除
            dead_code: true, // ✅ 安全：移除死代码
            evaluate: true, // ✅ 安全：计算常量表达式
            // fold_constants 在新版本的 terser 中已被 evaluate 包含
          },
          mangle: {
            properties: {
              regex: /^_/, // 只混淆以下划线开头的属性
            },
          },
        }),
      ].filter(Boolean),
      'plugins'
    ), // 过滤掉未使用的插件
    external: [], // 如果要包含所有依赖，这里保持空数组
  },
  // 类型声明打包
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      alias({
        entries: [{ find: /^@/, replacement: path.resolve(import.meta.dirname, 'src') }],
      }),
      dts({
        tsconfig: tsconfigFile,
      }),
    ],
  },
];
