// new KVue({data:{...}})

class KVue {
  constructor(options) {
    this.$options = options;

    // 数据响应化
    this.$data = options.data;

    // 观察者
    this.observe(this.$data);

    // 模拟一下watcher创建
    // new Watcher();
    // // 通过访问test属性触发get函数，添加依赖
    // this.$data.test;
    // new Watcher();
    // this.$data.foo.bar;


    // 创建编译器
    new Compile(options.el, this);

    // 执行created钩子
    if (options.created) {
        options.created.call(this);
    }
  }

  observe (value) {
    // 判断类型
    if (!value || typeof value !== "object") {
      return;
    }
    // console.log(Object.keys(value));
    // 遍历该对象
    Object.keys(value).forEach(key => {
      // 定义响应化函数
      // console.log(key);
      // 第一个value是obj才对
      // console.log(value, key, value[key]);
      // 定义响应式
      this.defineReactive(value, key, value[key]);
    //   代理data中的属性到vue实例上
      this.proxyData(key);
    });
  }

  // 数据响应化
  defineReactive(obj, key, val) {
    this.observe(val); // 递归解决数据嵌套

    // 每个属性创建一个依赖收集， 没使用一次添加一个
    const dep = new Dep();
    // 劫持数据双向数据绑定
    Object.defineProperty(obj, key, {
      get () {
        // render过程触发getter
        // 将Dep.target（即当前的Watcher对象存入Dep的deps中）
        console.log(Dep.target);
        Dep.target && dep.addDep(Dep.target);
        // getter 直接返回 val 是初始化的值（现在的值）
        return val;
      },
      set(newVal) {
        if (newVal === val) {
          return;
        }
        // 将该建对应的值设置为新传进来的值，同时也要去页面相关的地方修改他们的值呢？？？通知他们修改
        val = newVal;
        // console.log(`${key}属性更新了：${val}`);
        dep.notify();
      }
    });
  }

  proxyData(key) {
      Object.defineProperty(this, key, {
          get(){
            return this.$data[key]
          },
          set(newVal){
            this.$data[key] = newVal;
          }
      })
  }

}

// Dep：用来管理Watcher观察者---我觉得是管理依赖
class Dep {
  constructor() {
    // 这里存放若干依赖（watcher）一个watcher一个属性
    this.deps = [];
  }
  // 添加监听器对象
  addDep(dep) {
    this.deps.push(dep);
  }
// 通知依赖更新 通知所有监听器去更新视图
  notify () {
    // 每个通知
    this.deps.forEach(dep => dep.update());
  }
}

// Watcher  调用更新
class Watcher {
  constructor(vm, key, cb) {
      this.vm = vm;
      this.key = key;
      this.cb = cb;

    // 将当前watcher实例指定到Dep静态属性target
    // 在new一个监听器对象时将该对象赋值给Dep.target，在get中会用到
    // 将 Dep.target 指向自己 // 然后触发属性的 getter 添加监听
    Dep.target = this;
    this.vm[this.key]; // 触发getter，添加依赖
    Dep.target = null;
  }
  // 更新视图的方法
  update() {
    // console.log("属性更新了");
    this.cb.call(this.vm, this.vm[this.key]);
  }
}
