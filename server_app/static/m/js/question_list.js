var idsWithViews = null;
var totalLoaded = 0;
var loadPageSize = 15;

var questionListRoot = "#question_list"

var idsApiEndpoint = "/api/suggested_question_ids_with_views";
var questionApiEndpoint = "https://api.stackexchange.com/2.2/questions/{id}?order=desc&sort=votes&site=stackoverflow"

var answer_strings = ["ответ", "ответа", "ответов"];
var score_strings = ["голос", "голоса", "голосов"];
var view_strings = ["показ", "показа", "показов"];

$(document).ready(function() {
    init(function() {
        createQuestionsFeed(totalLoaded, totalLoaded + loadPageSize, function(isSucceeded) {
            if (isSucceeded) {
                totalLoaded += loadPageSize;
            }
        });
    });
})

function init(onInitCompleted) {
    loadHelper(idsApiEndpoint, function(data) {
        idsWithViews = data.items;
        onInitCompleted();
    }, function() {

    })
}

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

function getAAPPlink(questionId) {
    return "/questions/" + questionId;
}

function getDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();

    return (dd[1] ? dd : "0" + dd[0]) + "." + (mm[1] ? mm : "0" + mm[0]) + "." + yyyy;
}

function createQuestionsFeed(startIndex, endIndex, onEnded) {
    var ids = "";
    for (index = startIndex; index < endIndex && index < idsWithViews.length; index++) {
        var item = idsWithViews[index];
        ids += item.questionId;
        if (index < (endIndex - 1) && index < (idsWithViews.length - 1)) {
            ids += ";"
        }
    }
    url = questionApiEndpoint.replace(/\{id\}/g, ids);
    loadHelper(url, function(data) {
        for (index = 0; index < data.items.length; index++) {
            var item = data.items[index];
            var question = createQuestionFromResponse(item)
            $(question_list).append(question);
        }
        onEnded(true);
    }, function() {
        onEnded(false);
    })
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

function createQuestionFromResponse(item) {
    var main_div = document.createElement("div");
    $(main_div).addClass("question");

    left_side = createQuestionStatus(item);
    $(main_div).append(left_side);

    right_side = createQuestionDescription(item);
    $(main_div).append(right_side);

    return main_div;
}

function createQuestionStatus(item) {
    var stats_container = document.createElement("div");
    $(stats_container).addClass("stats_container");
    $(stats_container).attr("onclick", "window.location.href='" + getAAPPlink(item.question_id) + "'");

    var votes = document.createElement("div");
    $(votes).addClass("votes");

    var votes_count = document.createElement("div");
    $(votes_count).addClass("count");
    $(votes_count).append(item.score);
    var votes_count_word = document.createElement("div");
    $(votes_count_word).append(plural(parseInt(item.score), score_strings));

    $(votes).append(votes_count);
    $(votes).append(votes_count_word);

    var status = document.createElement("div");
    $(status).addClass("status");
    if (item.is_answered)
        $(status).addClass(" answered");

    var answer_count = document.createElement("div");
    $(answer_count).append(item.answer_count);
    $(answer_count).addClass("count");
    var answer_count_word = document.createElement("div");
    $(answer_count_word).append(plural(parseInt(item.answer_count), answer_strings));

    $(status).append(answer_count);
    $(status).append(answer_count_word);

    var views = document.createElement("div");
    $(views).addClass("views");

    var shortViewsCount = Math.round(item.view_count / 1000);
    var views_count = document.createElement("div");
    $(views_count).append(shortViewsCount + "K");
    $(views_count).addClass("count");
    var views_count_word = document.createElement("div");
    $(views_count_word).append(plural(5, view_strings));

    $(views).append(views_count);
    $(views).append(views_count_word);

    $(stats_container).append(votes);
    $(stats_container).append(status);
    $(stats_container).append(views);

    return stats_container;
}

function createQuestionDescription(item) {
    var desc = document.createElement("div");
    $(desc).addClass("desc");

    var h3_title = document.createElement("h3");
    var a_title = document.createElement("a");
    $(a_title).attr("href", getAAPPlink(item.question_id));
    $(a_title).text(stripHtml(item.title));

    $(h3_title).append(a_title);

    var tags = createTagsDiv(item.tags);

    var owner = document.createElement("div");
    $(owner).addClass("owner");

    var last_active = document.createElement("span");
    var active = new Date(parseInt(1000 * item.creation_date));
    $(last_active).text("задан " + getDate(active) + " ");
    var author = document.createElement("a");
    $(author).attr("href", item.owner.link);
    $(author).text(item.owner.display_name);

    $(owner).append(last_active);
    $(owner).append(author);

    $(desc).append(h3_title);
    $(desc).append(tags);
    $(desc).append(owner);

    return desc;
}