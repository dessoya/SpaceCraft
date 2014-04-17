'use strict'

var Class			= require('class')
  , coroutine		= require('coroutine')

var ResourceTreator = Class.inherit({

	onCreate: function(objectName, maximumObjects, readerTimeout) {

		this.objectName			= objectName
		this.maximumObjects		= maximumObjects
		this.readerTimeout		= readerTimeout
		this.fromId				= null
		this.inProgress			= 0
		this.config				= schema.objects[objectName]
		this.table				= this.config.table
		this.idColumnName		= this.config.idColumnName

		this.binded_onInterval	= this.onInterval.bind(this)
		this.binded_onRead		= this.onRead.bind(this)
		this.binded_onTreated	= this.onTreated.bind(this)
		this.binded_onUnlock	= this.onUnlock.bind(this)
		this.reading = false
		this.interval = setInterval(this.binded_onInterval, this.readerTimeout)
	},

	onInterval: function() {
		if(this.reading) return
		if(this.inProgress >= this.maximumObjects) return

		this.reading = true
		coroutine(this.gen_read, this, this.binded_onRead)
	},

	onRead: function(event, data) {
		if(GE_ERROR === event) {
			console.showError(data)
		}
		else {
		}
		this.reading = false
	},

	gen_read: function*(reader, sv) {

		var result, limit = (reader.maximumObjects - reader.inProgress), idColumnName = reader.idColumnName

		if(reader.fromId) {
			// console.log('select '+idColumnName+', treat_ms, transaction_lock from '+reader.table+' where token('+idColumnName+') > token('+reader.fromId+') limit '+limit)
			result = yield ncc.execute('select '+idColumnName+', treat_ms, transaction_lock from '+reader.table+' where token('+idColumnName+') > token('+reader.fromId+') limit '+limit, [], sv.resume)
		}
		else {
			// console.log('select '+idColumnName+', treat_ms, transaction_lock from '+reader.table+' limit '+limit)
			result = yield ncc.execute('select '+idColumnName+', treat_ms, transaction_lock from '+reader.table+' limit '+limit, [], sv.resume)
		}

		if(result.rows.length) reader.fromId = result.rows[result.rows.length-1][idColumnName]
		else reader.fromId = null

		var objects = result.rows
		while(reader.inProgress < reader.maximumObjects && objects.length) {
			var index = Math.floor(Math.random() * objects.length)
			var row = objects[index]
			objects.splice(index, 1)
			
			if(row.transaction_lock === 1) continue
			var now = Date.now()
			var treat_ms = parseInt(row.treat_ms.toString()), delta = now - treat_ms
			if(delta < 4000) continue

			var lock_state = yield schema.lock(reader.objectName, row[idColumnName], 0, sv.resume3end)
			if(lock_state) {
				reader.executeWork(row[idColumnName], delta)
			}
		}
	},

	gen_treat: function*(params, sv) {
		yield process.nextTick(sv.resume)
		throw Error('gen_treat not implemented')
	},

	executeWork: function(objectId, delta) {
		this.inProgress ++
		var params = { reader: this, time: process.hrtime(), objectId: objectId, delta: delta }
		coroutine(this.gen_treat, params, this.onTreated.bind(params))
	},

	onTreated: function(event, data) {
		if(GE_ERROR === event) {
			console.showError(data)
		}
		else {
		}
		var diff = process.hrtime(this.time);
		console.log('treate time ' + ( (diff[0] * 1e9 + diff[1]) / 1e9 ).toFixed(5) );
		// unlock
		var reader = this.reader
		ncc.execute('update '+reader.table+' set '+(this.new_treat_ms ? 'treat_ms = '+this.new_treat_ms+',' : '')+' transaction_lock = null where '+reader.idColumnName+' = '+this.objectId, [], reader.binded_onUnlock)
	},

	onUnlock: function(err) {
		this.inProgress --
		if(err) {
			console.showError(err)
		}
		else {
		}
	}
})

module.exports = ResourceTreator