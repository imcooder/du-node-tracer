/**
 * @file log_container.js
 * @author imcooder@gmail.com 
 */
/* eslint-disable fecs-camelcase */
/* jshint esversion: 6 */
/* jshint node:true */
'use strict';

const _ = require('lodash');
const sortMap = require('sort-map');

class LogContainer {
    constructor(logid) {
        this.settings = new Map();
        this.logid = logid;
        this.tag = '';
    }

    /*
     * 设置日志标记方便提取
     */
    setTag(tag) {
        this.tag = tag;
        if (this.tag) {
            this.tag += ' ';
        }
    }

    set(key, value) {
        this.settings.set(key, value);
    }

    get(key) {
        return this.settings.get(key);
    }

    /*
     * 生成日志。默认只打印一行
     */
    getLog(oneline = true, sortFun = null) {
        this.settings.set('logid', this.logid);
        let result = this.settings;
        if (sortFun) {
            try {
                result = sortMap(result, sortFun);
            } catch (error) {
                console.error('sortMap error:%s', error.stack);
            }
        }
        let res = [];
        result.forEach((value, key) => {
            let s = '';
            if (_.isString(value)) {
                s = value;
            } else if (value instanceof Buffer) {
                s = value.toString();
            } else if (_.isObject(value)) {
                try {
                    s = JSON.stringify(value);
                } catch(error) {
                    s = '';
                }
            } else {
                try {
                    s = value.toString();
                } catch(error) {
                    s = '';
                }
            }
            if (!_.isString(s)) {
                s = s.toString();
            }
            s = s.replace(/\s+/g, '_');
            if (oneline) {
                s = s.replace(/[\n ]/g, '');
            }
            res.push(key + ':' + s);
        });

        return this.tag + res.join(' ');
    }
}

module.exports = LogContainer;
