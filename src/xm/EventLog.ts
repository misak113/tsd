/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="DateUtil.ts" />
///<reference path="Logger.ts" />
///<reference path="inspect.ts" />
///<reference path="StatCounter.ts" />
///<reference path="ObjectUtil.ts" />

module xm {
	'use strict';

	function padL(input, len, char) {
		var char = String(char).charAt(0);
		var input = String(input);
		while (input.length < len) {
			input = char + input;
		}
		return input;
	}

	export function valueMap(data:any):any {
		var out = Object.keys(data).reduce((memo:any, key:string) => {
			if (xm.isValueType(data[key])) {
				memo[key] = data[key];
			}
			return memo;
		}, Object.create(null));
		return out;
	}

	//some standard levels
	//TODO replace with proper enum
	export var Level = {
		start: 'start',
		complete: 'complete',
		failure: 'failure',
		skip: 'skip',

		event: 'event',

		error: 'error',
		warning: 'warning',
		success: 'success',
		status: 'status',

		promise: 'promise',
		resolve: 'resolve',
		reject: 'reject',
		notify: 'notify',

		debug: 'debug',
		log: 'log'
	};
	Level = xm.valueMap(Level);
	//subzero
	Object.freeze(Level);

	export var startTime = Date.now();
	Object.defineProperty(xm, 'startTime', {writable: false});

	export class EventLog {
		private _items:EventLogItem[] = [];

		private _label:string;
		private _prefix:string;
		private _startAt:number;
		logger:xm.Logger;

		logEnabled:boolean = false;
		private _trackEnabled:boolean = false;
		private _trackLimit:number = 100;
		private _trackPrune:number = 30;

		constructor(prefix:string = '', label:string = '', logger?:xm.Logger) {
			this._label = label;
			this._prefix = (prefix ? prefix + ':' : '');
			this.logger = logger || (label ? xm.getLogger(this._label) : (xm.log || xm.getLogger()));
			this._startAt = Date.now();

			xm.ObjectUtil.hidePrefixed(this);
		}

		//many lazy wrappers

		//-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

		start(type:string, message?:string, data?:any):EventLogItem {
			return this.track(Level.start, type, message, data);
		}

		promise(promise:Q.Promise<any>, type:string, message?:string, data?:any):EventLogItem {
			promise.then(() => {
				//this.track(Level.resolve, type, message, data, promise);
			}, (err) => {
				this.track(Level.reject, type, message, err, promise);
			}, (note) => {
				this.track(Level.notify, type, message, note, promise);
			});
			//return this.track(Level.promise, type, message, data, promise);
			return null;
		}

		complete(type:string, message?:string, data?:any):EventLogItem {
			return this.track(Level.complete, type, message, data);
		}

		failure(type:string, message?:string, data?:any):EventLogItem {
			return this.track(Level.complete, type, message, data);
		}

		event(type:string, message?:string, data?:any):EventLogItem {
			return this.track(Level.event, type, message, data);
		}

		skip(type:string, message?:string, data?:any):EventLogItem {
			return this.track(Level.skip, type, message, data);
		}

		//-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

		error(type:string, message?:string, data?:any):EventLogItem {
			return this.track(Level.error, type, message, data);
		}

		warning(type:string, message?:string, data?:any):EventLogItem {
			return this.track(Level.warning, type, message, data);
		}

		success(type:string, message?:string, data?:any):EventLogItem {
			return this.track(Level.success, type, message, data);
		}

		status(type:string, message?:string, data?:any):EventLogItem {
			return this.track(Level.status, type, message, data);
		}

		//-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

		log(type:string, message?:string, data?:any):EventLogItem {
			return this.track(Level.log, type, message, data);
		}

		debug(type:string, message?:string, data?:any):EventLogItem {
			return this.track(Level.debug, type, message, data);
		}

		//-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

		track(action:string, type:string, message?:string, data?:any, group?:any):EventLogItem {
			var item = new EventLogItem();
			item.type = this._prefix + type;
			item.action = action;
			item.message = message;
			item.data = data;
			item.time = (Date.now() - startTime);
			item.group = group;
			//fresh
			Object.freeze(item);

			if (this._trackEnabled) {
				this._items.push(item);
				this.trim();
			}
			if (this.logEnabled) {
				this.logger.status(this.getItemString(item, true));
			}
			return item;
		}

		//-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

		trim(all:boolean = false):void {
			if (all) {
				this._items.splice(0, this._items.length);
			}
			else if (this._trackLimit > 0 && this._items.length > this._trackLimit + this._trackPrune) {
				this._items.splice(this._trackLimit, this._items.length - this._trackPrune);
			}
		}

		reset():void {
			this._startAt = Date.now();
			this._items.splice(0, this._items.length);
		}

		//-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

		setTrack(enabled:boolean, limit:number = NaN, prune:number = NaN):void {
			this._trackEnabled = enabled;
			this._trackLimit = (isNaN(limit) ? this._trackLimit : limit);
			this._trackPrune = (isNaN(prune) ? this._trackPrune : prune);
		}

		getItemString(item:EventLogItem, multiline:boolean = false):string {
			var msg = padL(item.index, 6, '0') + ' ' + item.action + ' -> ' + item.type;
			//msg += ' ' + (this._label ? +': ' + this._label : '');
			if (xm.isValid(item.message) && item.message.length > 0) {
				msg += (multiline ? '\n      ' : ': ') + trimWrap(item.message, 200, true);
			}
			if (xm.isValid(item.data)) {
				msg += (multiline ? '\n      ' : ': ') + xm.toValueStrim(item.data, 4, 200);
			}
			return msg;
		}

		getHistory():string {
			var memo = [];
			if (this._label) {
				memo.push(this._label + '(' + this._items.length + ')');
			}
			return this._items.reduce((memo:string[], item:EventLogItem) => {
				memo.push(this.getItemString(item));
				return memo;
			}, memo).join('\n');
		}

		getStats():xm.StatCounter {
			var ret = new xm.StatCounter();
			this._items.forEach((item:EventLogItem) => {
				ret.count(item.action);
			});
			return ret;
		}

		getItems():EventLogItem[] {
			return (this._trackLimit > 0 ? this._items.slice(0, this._trackLimit) : this._items.slice(0));
		}

		getReport(label?:string):string {
			return this.getStats().getReport(label);
		}
	}

	var itemCounter = 0;

	export class EventLogItem {
		type:string;
		action:string;

		message:string;
		data:any;
		index:number;
		time:number;

		group:any;

		constructor() {
			this.index = (++itemCounter);
		}

		toString():string {
			return this.action + ':' + this.type + ' #' + this.index;
		}
	}
}