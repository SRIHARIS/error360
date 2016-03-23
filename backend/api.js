module.exports = function(app,pool){
	app.post('/report_error',function(req,res) {

		var error_obj = [];

		error_obj.push(req.body.stack);
		error_obj.push(req.body.mode);
		error_obj.push(req.body.name);
		error_obj.push(0);
		error_obj.push(req.body.message);
		error_obj.push(req.body.domain);
		error_obj.push(req.body.url);
		error_obj.push(req.body.localStorage != undefined ? JSON.stringify(req.body.localStorage) : '{}');
		error_obj.push(1);
		error_obj.push(req.body.api_key);

		
		var statment = "INSERT INTO errors (stack, mode, name, status, message, domain, url, localstorage,count,projectid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? ,?) ON DUPLICATE KEY UPDATE count = count + 1" ;

		pool.getConnection(function(err, connection){
			connection.query(statment, error_obj, function(err, result) {
			    console.log(err,result);
			});
			connection.release();
		});
		res.send('stored');
	});
}