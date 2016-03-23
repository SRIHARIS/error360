module.exports = function(app,pool){


	app.get('/',function(req,res){
		res.render('home');
	});

	app.post('/register',function(req,res){

			var name = req.body.name;
			var owner = req.body.owner;
			var team = req.body.team;
			var about = req.body.about;
			var api_key = generateKey(10);

			var data_obj = {
				name : name,
				team : team,
				owner : owner,
				desc : about,
				key : api_key
			}

		//var statement = "INSERT INTO projects ('name', 'team', 'owner', 'desc', 'key') VALUES (?,?,?,?,?)" ;

		pool.getConnection(function(err, connection){
			connection.query("INSERT INTO projects SET ?", data_obj, function(err, result) {
				console.log(err);
				if(err != undefined){
					res.render('home',{ errors : err});
				} else{
					res.render('index',{ project_id : api_key });
				}
					    
			});
			connection.release();
		});
		
	});

	app.get('/dashboard/:project_id',function(req,res){
		res.render('index',{ project_id : req.params.project_id });
	});

	app.get('/bugs/:project_id',function(req,res){

		var result = {};
		var table_data = [];
		var key = req.params.project_id;

		pool.getConnection(function(err, connection){
		  connection.query("SELECT * from errors where projectid = '"+key + "'",function(err, rows, fields) {
			  if (!err){
			  		rows.forEach(function(row) {
			  			var error = {
			  				desc : row.message,
			  				type : row.name,
			  				fixed : row.fixed == 0 ? "no" : "yes",
			  				url : row.url,
			  				id : row.id,
			  				count : row.count
			  			}
			  			table_data.push(error);
			  		});
			  }
			  else{
			    console.log('Error while performing Query.' + err);
			 }
			result.data = table_data;
			res.send(result);
			});
		  
		  connection.release();
		});
	});

	app.get('/details/:project_id/:id',function(req,res){
		var id = req.params.id;
		var project_id = req.params.project_id;
		var data = {};
		var arr = [];
		arr.push(id);

		pool.getConnection(function(err, connection){
		  connection.query('SELECT * from errors where id=?',arr ,function(err, rows, fields) {
			  if (!err){
			  		rows.forEach(function(row) {
			  			var db_stack = row.stack;
			  			var str = "";
			  			if( db_stack != undefined){
			  				
			  				db_stack = JSON.parse(db_stack);
			  				db_stack.forEach(function(part){
			  					str += "<div>" + part.url + " at line " + part.line + " ,column " + part.column + "</div>"	;
			  				})
			  			}
			  			var error = {
			  				desc : row.message,
			  				type : row.name,
			  				fixed : row.fixed == 0 ? "no" : "yes",
			  				url : row.url,
			  				id : row.id,
			  				domain : row.domain,
			  				stack : str,
			  				local : row.localstorage,
			  				count : row.count
			  			}
			  			data = error;
			  			//console.log(data);
			  		});
			  }
			  else{
			    console.log('Error while performing Query.');
			 }
				res.render('detail',{ data : data,project_id : project_id});
			});
		  
		  connection.release();
		});
	});

	app.get('/extras/:id',function(req,res){

		var id = req.params.id;
		var data = {};
		var arr = [];
		arr.push(id);

		pool.getConnection(function(err, connection){
		  connection.query('SELECT * from errors where id=?',arr ,function(err, rows, fields) {
			  if (!err){
			  		rows.forEach(function(row) {
			  			data = row.localstorage;
			  		});
			  }
			  else{
			    console.log('Error while performing Query.');
			  }
				res.json({localStorage : JSON.parse(data) });
			});
		  
		  connection.release();
		});

	});

	/* Util */
	function generateKey(len){
	    
	    var text = "";
	    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
	    for( var i=0; i < len; i++ )
	        text += charset.charAt(Math.floor(Math.random() * charset.length));
	    return text;
	}
}