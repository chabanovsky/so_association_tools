var INTERNATIONAL_STACKOVERFLOW = currentLanguage + ".stackoverflow";
var STACKOVERFLOW_IN_ENGLISH = "stackoverflow";

var QUESTION_BODY_FILTER = "!4(sMpjPlU2B9NnTI_";
var QUESTION_BODY_AND_ANSWERS_FILTER = "!4(sMpjPj7CC*aVjgo";

var ANSWER_BODY_FILTER = "!)s4ZC4Cto10(q(Yp)zK*";

var DEFAULT_API_SORT = "activity";
var DEFAULT_API_ORDER = "desc";
var DEFAULT_QUESTION_API_ENDPOINT = "https://api.stackexchange.com/2.2/questions/{id}/?";
var DEFAULT_ANSWER_API_ENDPOINT = "https://api.stackexchange.com/2.2/answers/{id}/?";

function getQuestionApiEndPoint(site, needBody, needAnswers, sort, order) {
    var url = DEFAULT_QUESTION_API_ENDPOINT;

    url += "site=" + site;
    url += "&sort=" + defaultFor(sort, DEFAULT_API_SORT);
    url += "&order=" + defaultFor(order, DEFAULT_API_ORDER);

    if (needBody && !needAnswers) {
        url += "&filter=" + QUESTION_BODY_FILTER;
    } else if (needBody && needAnswers) {
        url += "&filter=" + QUESTION_BODY_AND_ANSWERS_FILTER;
    }

    return url;
}

function getAnswerApiEndpoint(site, needBody, sort, order) {
    var url = DEFAULT_QUESTION_API_ENDPOINT;

    url += "site=" + site;
    url += "&sort=" + defaultFor(sort, DEFAULT_API_SORT);
    url += "&order=" + defaultFor(order, DEFAULT_API_ORDER);

    if (needBody) {
        url += "&filter=" + ANSWER_BODY_FILTER;
    }

    return url;
}

function defaultFor(arg, val) { 
    return typeof arg !== 'undefined' ? arg : val; 
}

function plural(n, forms) {
    return forms[n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
}

function stripHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

function questionId(uri) {
    var id = /\/\d+\//.exec(uri)
    if (!id)
        return -1

    return id[0].replace(/\//g, "");
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


function getAAPPlink(questionId) {
    return "/questions/" + questionId;
}


function updatePostMenu(template, item, postedStr) {
    $(template).find(".post-menu .ref-to-post").text(localeManager.LinkStr);
    $(template).find(".post-menu .ref-to-post").attr("href", item.link);       
    $(template).find(".post-menu ul .score-help").text(localeManager.scoreHelpStr);        
    $(template).find(".post-menu ul .score").text(item.score);
    $(template).find(".post-menu ul .posted-help").text(postedStr);        

    var posted = new Date(parseInt(1000 * item.creation_date));
    $(template).find(".post-menu ul .posted").text(getDate(posted));        

    $(template).find(".post-menu .user-gravatar32 a").attr("href", item.owner.link);        
    $(template).find(".post-menu .user-gravatar32 img").attr("src", item.owner.profile_image);        

    $(template).find(".post-menu .user-details a").attr("href", item.owner.link);    
    $(template).find(".post-menu .user-details a").text(stripHtml(item.owner.display_name));    
}