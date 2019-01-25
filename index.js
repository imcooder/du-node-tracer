/**
 * @file: new tc logger for new dcs struct
 * @author: imcooder@gmail.com 
 */
/* jshint esversion:6 */
/* jshint node:true */
'use strict';

const log4js = require('log4js');
const duUtils = require('du-node-utils');
const TimeContainer = require('./lib/time_container');
const _ = require('lodash');
/*
 * @brief 用于追踪执行流程
 */
const DEFAULT_VALUE = '-';
class tracer {
    constructor(name = 'dlp', logid = '', defaultList = {}) {
        this._logid = logid || duUtils.makeUUID(true);
        this._list = [];
        this._map = {};
        this._timeContainer = new TimeContainer();
        this.logger = log4js.getLogger(name);
        if (defaultList) {
            let arr = defaultList;
            if (_.isObject(defaultList) && !_.isArray(defaultList)) {
                for (let key in defaultList) {
                    let value = defaultList[key];
                    value.key = key;
                    value.weight = value.weight || 0;
                    arr.push(value);
                }
                arr.sort((a, b) => {
                    return b.weight - b.weight;
                });
            }
            if (_.isArray(defaultList)) {
                defaultList.forEach(item => {
                    let obj = {
                        key: item.key || '',
                        default: item.default || '-'
                    };
                    if (!obj.key) {
                        return;
                    }
                    if (!this._map[obj.key]) {
                        this._list.push(obj);
                    }
                    this._map[obj.key] = obj;
                });
            }
        }
    }
    static serilize(args) {
        let res = args.map((item) => {
            return duUtils.toString(item);
        });
        return res;
    }
    get logid() {
        return this._logid;
    }

    set logid(logid) {
        this._logid = logid;
    }
    _set(key, value) {
        let obj = this._map[key];
        if (!obj) {
            obj = {
                key: key,
                value: value || '-',
                default: '-'
            };
            this._list.push(obj);
            this._map[key] = obj;
        }
        obj.value = value;
    }

    _get(key) {
        return this._map[key];
    }

    debug(format, ...args) {
        if (!this.logger || !this.logger.level.isLessThanOrEqualTo('debug')) {
            return;
        }
        format = 'logid:%s ' + format;
        args = tracer.serilize(args);
        args.unshift(this._logid);
        this.logger.debug(format, ...args);
    }

    info(format, ...args) {
        if (!this.logger || !this.logger.level.isLessThanOrEqualTo('info')) {
            return;
        }
        format = 'logid:%s ' + format;
        args = tracer.serilize(args);
        args.unshift(this._logid);
        this.logger.info(format, ...args);
    }

    warn(format, ...args) {
        if (!this.logger || !this.logger.level.isLessThanOrEqualTo('warn')) {
            return;
        }
        format = 'logid:%s ' + format;
        args = tracer.serilize(args);
        args.unshift(this._logid);
        this.logger.warn(format, ...args);
    }

    error(format, ...args) {
        if (!this.logger || !this.logger.level.isLessThanOrEqualTo('error')) {
            return;
        }
        format = 'logid:%s ' + format;
        args = tracer.serilize(args);
        args.unshift(this._logid);
        this.logger.error(format, ...args);
    }

    start(label, isSeq = false) {
        return this._timeContainer.tcStart(label, isSeq);
    }
    tcStart(label, isSeq = false) {
        return this._timeContainer.tcStart(label, isSeq);
    }
    startSequenceTimer(label) {
        return this.tcStart(label, true);
    }
    end(label) {
        return this._timeContainer.tcEnd(label);
    }
    tcEnd(label) {
        return this._timeContainer.tcEnd(label);
    }
    stopSequenceTimer(label) {
        return this.tcEnd(label);
    }
    trace(tag, ...args) {
        if (!this.logger || !this.logger.level.isLessThanOrEqualTo('debug')) {
            return;
        }
        this.logger.debug("logid:%s [%s] %j", this._logid, tag, {
            args
        });
    }

    setName(name) {
        this._name = name;
    }
    _makeValue(key, value) {
        let v = value;
        if (v !== '') {
            return v;
        }
        let obj = this._get(key);
        if (obj && obj.default !== undefined) {
            return obj.default;
        }
        return DEFAULT_VALUE;
    }
    gather(key, value) {
        this._set(key, this._makeValue(key, value));
    }

    _join() {
        this._set('logid', this._logid);
        let timeRecords = this._timeContainer.getRecords();
        this._set('all_t', timeRecords.allTime.toFixed(3));
        this._set('self_t', timeRecords.selfTime.toFixed(3));
        for (let itemCost of timeRecords.itemCosts) {
            this._set(itemCost.label + '_t', itemCost.cost.toFixed(3));
        }
        let out = '';
        for (let i = 0; i < this._list.length; i++) {
            let item = this._list[i];
            let s = '';
            let value = item.value;
            if (_.isString(value)) {
                s = value;
            } else if (value instanceof Buffer) {
                s = value.toString();
            } else if (_.isObject(value)) {
                try {
                    s = JSON.stringify(value);
                } catch (error) {
                    s = '';
                }
            } else {
                try {
                    s = value.toString();
                } catch (error) {
                    s = '';
                }
            }
            if (!_.isString(s)) {
                s = s.toString();
            }
            s = s.replace(/\s+/g, '_');
            s = s.replace(/[\n ]/g, '');
            out += ' ' + item.key + ':' + s;
            if (i !== this._list.length - 1) {
                out += ' ';
            }
        }
        return out;
    }
    dumps() {
        let out = this._join();
        this.logger.info(out);
    }
}

const Service = {
    Tracer: tracer,
    logger: null,
    initLog: (config, defaultName) => {
        console.log('initLog:%j', config);
        log4js.configure(config);
        let name = defaultName || 'app';
        Service.logger = log4js.getLogger(name);
    },
    debug: (...args) => {

        if (!Service.logger || !Service.logger.level.isLessThanOrEqualTo('debug')) {
            return;
        }
        Service.logger.debug(...args);
    },
    info: (...args) => {
        if (!Service.logger || !Service.logger.level.isLessThanOrEqualTo('info')) {
            return;
        }
        Service.logger.info(...args);
    },
    warn: (...args) => {
        if (!Service.logger || !Service.logger.level.isLessThanOrEqualTo('warn')) {
            return;
        }
        Service.logger.warn(...args);
    },

    error: (...args) => {
        if (!Service.logger || !Service.logger.level.isLessThanOrEqualTo('error')) {
            return;
        }
        Service.logger.error(...args);
    }
};


module.exports = Service;