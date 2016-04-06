
var exceptionalException;

var Lambda = (function() {  

   var _config = {
      captureAjaxErrors : true,
      useTraceKit : true,
      bindWindowOnError : false,
      https : false,
      endpoint : 'http://localhost:3001/report_error',
      trackLocalStorage : true,
      api_key : ''
   };

   var _impl = { 
        
        _capture : true,

        captureOrIgnore : function(){
             //if browser
              if (typeof (location) !== 'undefined' && location.hostname === 'localhost') {
                this._capture = true;
              }
        },
        attachRequestData : function(jsonErrorReport){
          var now = new Date();
            //Attach extra data
           jsonErrorReport.domain = location.hostname;
           jsonErrorReport.url = location.pathname;
           jsonErrorReport.api_key = _config.api_key;

           if(this.trackLocalStorage){
              jsonErrorReport.localStorage = localStorage; 
           }
           
           jsonErrorReport.date = now.toDateString();

           return jsonErrorReport;
        },
        bindEvents : function() { 
            var _this = this;

            if(_config.useTraceKit && TraceKit != undefined) {

                TraceKit.report.subscribe(function TraceKitCollector(jsonErrorReport) {
                if (false) {
                  console.error('TraceKit caught:', jsonErrorReport);
                  throw 'killing script'; //more straightforward for developers to read than `new Error`
                
                } else {

                   jsonErrorReport = _this.attachRequestData(jsonErrorReport);
                   jsonReport = JSON.stringify(jsonErrorReport);
                   var request = window.superagent;
                   request
                    .post(_config.endpoint)
                    .send(JSON.parse(jsonReport))
                    .end(function(err, res){
                      // Calling the end function will send the request
                      //console.log('Failed to track the error message');
                    });
                }
              });
            }
        },

        init : function(api_key){
            if(api_key == undefined || api_key == ''){
              console.log('API KEY Missing');
            } else{
               _config.api_key = api_key;
               this.bindEvents();
            }
        }
   }

   return _impl;
})();