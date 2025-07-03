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

      if ((typeof value === 'object' && value !== null) || typeof value === 'function') {
        // 如果是对象或数组，递归代理
        return prox(value, sub);
      } else {
        return value;
      }
    },
    apply(target, thisArg, args) {
      const sub = `${name}.${String(target.name)}`;
      console.log('apply', sub);
      return Reflect.apply(target, thisArg, args);
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
