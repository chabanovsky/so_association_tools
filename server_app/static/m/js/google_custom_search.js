var googleSearchApiEndpoint = "https://www.googleapis.com/customsearch/v1";
var key = googleCustomSearchKey; 
var cx = googleCustomSearchCX;

function queryGoogle(query, onCompleted) {
    var url = googleSearchApiEndpoint + "?q=" + encodeURI(query) + "&cx=" + cx + "&key=" + key;
    loadHelper(url, function(data) {
        onCompleted(data);
    }, function() {
        onCompleted(null);
    });
}