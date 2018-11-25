/* jshint esversion:6 */
/* jshint node:true */
'use strict';

const log4js = require('log4js');
const duUtils = require('du-node-utils');
const LogContainer = require('./lib/log_container');
const TimeContainer = require('./lib/time_container');

/*
 * @brief 用于追踪执行流程
 */
class tracer {
    constructor(name = 'dlp', logid = '') {
        this._logid = logid || duUtils.makeUUID(true);
        this._logContainer = new LogContainer(this._logid);
        this._timeContainer = new TimeContainer();
        this.logger = log4js.getLogger(name);
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
        if (!this.logger.level.isLessThanOrEqualTo('debug')) {
            return;
        }
        format = 'logid:%s ' + format;
        args = tracer.serilize(args);
        args.unshift(this._logid);
        this.logger.debug(format, ...args);
    }

    info(format, ...args) {
        if (!this.logger.level.isLessThanOrEqualTo('info')) {
            return;
        }
        format = 'logid:%s ' + format;
        args = tracer.serilize(args);
        args.unshift(this._logid);
        this.logger.info(format, ...args);
    }

    warn(format, ...args) {
        if (!this.logger.level.isLessThanOrEqualTo('warn')) {
            return;
        }
        format = 'logid:%s ' + format;
        args = tracer.serilize(args);
        args.unshift(this._logid);
        this.logger.warn(format, ...args);
    }

    error(format, ...args) {
        if (!this.logger.level.isLessThanOrEqualTo('error')) {
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
        this._logContainer.setTag(this._name);
        this.logger.info(this._logContainer.getLog(false));
    }
}

module.exports = {
    Tracer: tracer
};
