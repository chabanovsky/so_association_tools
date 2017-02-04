var googleSearchApiEndpoint = "https://www.googleapis.com/customsearch/v1";
var key = "AIzaSyCeCkyln5wzG3JJXuRLdSeJ7P_4aoz6m68"

function queryGoogle(query, onCompleted) {
    var url = googleSearchApiEndpoint + "?q=" + encodeURI(query) + "&cx=005587445788863025345:j_pel-w7mb8&key=" + key;
    loadHelper(url, function(data) {
        onCompleted(data);
    }, function() {
        onCompleted(null);
    });
}