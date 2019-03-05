# du-node-tracer
dueros node tracer

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![David deps][david-image]][david-url]

[npm-image]: https://img.shields.io/npm/v/du-node-tracer.svg
[npm-url]: https://npmjs.com/package/du-node-tracer
[download-image]: https://img.shields.io/npm/dm/du-node-tracer.svg
[download-url]: https://npmjs.com/package/du-node-tracer
[david-image]: https://img.shields.io/david/imcooder/du-node-tracer.svg
[david-url]: https://david-dm.org/imcooder/du-node-tracer


## usage
* init: 按照顺序一条中排序
内部使用log4js配置
tracer.initLog(require('./conf/log4js_config')[env], 'app');

let t = new tracer('dcs-utils', req.logid, [
    {
        key: logid,
        default: '-'
    },
    {
        key:path
    },
    {
        key:request,
    }
]);

* 单条打印：

t.debug('request:%j', req.body);

* 收集日志 最终一条输出：

t.gather('path', req.path.toLowerCase());
t.gather('client_ip', req.ip);
t.gather('header', req.headers);
t.gather('pv_lost', 0);
t.dumps();


* global use
tracer.debug('logid:%s request:%j', this.logid, req.body);