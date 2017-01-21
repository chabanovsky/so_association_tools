var answer_strings = ["ответ", "ответа", "ответов"];
var score_strings = ["голос", "голоса", "голосов"];
var view_strings = ["показ", "показа", "показов"];

function plural(n, forms) {
    return forms[n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
}

function stripHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

function loadHelper(url, onSuccess, onError) {
    $.ajax({
        url: url,
        method: 'GET',
        success: onSuccess,
        error: onError
    });
}

function getDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();

    return (dd[1] ? dd : "0" + dd[0]) + "." + (mm[1] ? mm : "0" + mm[0]) + "." + yyyy;
}

function createTagsDiv(question_tags) {
    var tags = document.createElement("div");
    $(tags).addClass("tags");

    for (var i = 0; i < question_tags.length; i++) {
        var tag = document.createElement("span");
        $(tag).addClass("post-tag");
        $(tag).text(question_tags[i]);

        $(tags).append(tag);
    }
    return tags;
}