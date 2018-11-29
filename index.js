/**
 * @file: new tc logger for new dcs struct
 * @author: imcooder@gmail.com 
 */
/* jshint esversion:6 */
/* jshint node:true */
'use strict';

const log4js = require('log4js');
const duUtils = require('du-node-utils');
const LogContainer = require('./lib/log_container');
const TimeContainer = require('./lib/time_container');
const _ = require('lodash');
/*
 * @brief 用于追踪执行流程
 */
class tracer {
    constructor(name = 'dlp', logid = '', defaultList = []) {
        this._logid = logid || duUtils.makeUUID(true);
        this._logContainer = new LogContainer(this._logid);
        this._timeContainer = new TimeContainer();
        this.logger = log4js.getLogger(name);
        this._defaultKeys = defaultList;
        this._needSort = false;
        if (this._defaultKeys && this._defaultKeys.length) {
            _.each(this._defaultKeys, ((value, key) => {
                if (value && value.default) {
                    this.gather(key, value.default);
                    if (!this._needSort && value.weight) {
                        this._needSort = true;
                    }
                }
            }));
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

    end(label) {
        return this._timeContainer.tcEnd(label);
    }
    tcEnd(label) {
        return this._timeContainer.tcEnd(label);
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

    gather(key, value) {
        this._logContainer.set(key, value);
    }

    dumps() {
        let timeRecords = this._timeContainer.getRecords();
        this._logContainer.set('all_t', timeRecords.allTime.toFixed(3));
        this._logContainer.set('self_t', timeRecords.selfTime.toFixed(3));
        for (let itemCost of timeRecords.itemCosts) {
            this._logContainer.set(itemCost.label + '_t', itemCost.cost.toFixed(3));
        }
        // this._logContainer.setTag(this._name);
        let sortFun = null;
        if (this._defaultKeys.length && this._needSort) {
            sortFun = (([k1, v1, ], [k2, v2]) => {
                let w1 = 0, w2 = 0;
                if (this._defaultKeys[k1] && this._defaultKeys[k1].weight) {
                    w1 = this._defaultKeys[k1].weight;
                }
                if (this._defaultKeys[k2] && this._defaultKeys[k2].weight) {
                    w1 = this._defaultKeys[k2].weight;
                }
                return w2 - w1;
            });
        }
        this.logger.info(this._logContainer.getLog(false, sortFun));
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
