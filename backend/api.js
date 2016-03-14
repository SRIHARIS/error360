module.exports = function(app,pool){
	app.post('/report_error',function(req,res) {

		var error_obj = [];

		error_obj.push(req.body.stack);
		error_obj.push(req.body.mode);
		error_obj.push(req.body.name);
		error_obj.push(req.body.status);
		error_obj.push(req.body.message);
		error_obj.push(req.body.domain);
		error_obj.push(req.body.url);
		error_obj.push(req.body.localStorage != undefined ? JSON.stringify(req.body.localStorage) : {});

		var statment = "INSERT INTO errors (stack, mode, name, status, message, domain, url, localstorage,count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE count = count + 1" ;

		pool.getConnection(function(err, connection){
			connection.query(statment, error_obj, function(err, result) {
			    
			});
			connection.release();
		});
		res.send('stored');
	});
}