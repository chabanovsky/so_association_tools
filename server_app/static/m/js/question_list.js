var idsWithViews = null;
var totalLoaded = 0;
var loadPageSize = 15;
var uploadingNow = false;

var questionListRoot = "#question_list"

var idsApiEndpoint = "/api/suggested_question_ids_with_views";

$(document).ready(function() {
    init(function() {
        uploadQuestionFeed();
        setupScroll();
    });
})

function init(onInitCompleted) {
    loadHelper(idsApiEndpoint, function(data) {
        idsWithViews = data.items;
        onInitCompleted();
    }, function() {

    })
}

function setupScroll() {
    $(window).scroll(function() {
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            uploadQuestionFeed();
        }
    });
}

function uploadQuestionFeed() {
    if (uploadingNow)
        return;

    uploadingNow = true;
    createQuestionsFeed(totalLoaded, totalLoaded + loadPageSize, function(isSucceeded) {
        if (isSucceeded) {
            totalLoaded += loadPageSize;
        }
        uploadingNow = false;
    });
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
    url = getQuestionApiEndPoint(STACKOVERFLOW_IN_ENGLISH, false, false, "votes", "desc").replace(/\{id\}/g, ids);
    loadHelper(url, function(data) {
        for (var index = 0; index < data.items.length; index++) {
            var item = data.items[index];
            var question = createQuestionFromResponse(item)
            $(question_list).append(question);
        }
        onEnded(true);
    }, function() {
        onEnded(false);
    })
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
    $(votes_count_word).append(plural(parseInt(item.score), localeManager.scoreStrings));

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
    $(answer_count_word).append(plural(parseInt(item.answer_count), localeManager.answerStrings));

    $(status).append(answer_count);
    $(status).append(answer_count_word);

    var views = document.createElement("div");
    $(views).addClass("views");

    var shortViewsCount = Math.round(item.view_count / 1000);
    var views_count = document.createElement("div");
    $(views_count).append(shortViewsCount + "K");
    $(views_count).addClass("count");
    var views_count_word = document.createElement("div");
    $(views_count_word).append(plural(5, localeManager.viewStrings));

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