'use strict'

var ct					= require('ct')
  , cql					= require('ncc')
  , util				= require('util')

var cc = new cql.Client({
	getAConnectionTimeout:	1000,
	hosts:					['192.168.88.253'],
	keyspace:				'sc',
	poolSize:				40
})


ct.makeTransactionTables(cc, { prioritys: 2 }, function(event, data) {
	console.log(util.inspect([event,data],{depth:null}))
	process.exit()
})