var questionListRoot = "#question_list";
var suggestQuestionInputTag = "#suggested-question";
var suggestQuestionButtonTag = "#suggest-button";
var suggestEndpoint = "/api/suggest_question"

$(document).ready(function() {
    setupSuggestion();
    var ids = "";
    if (initJson.length == 0) {
        $(questionListRoot).append("<h3 class='no-results'>" + localeManager.emptyListStr + "</h3>")
        return;
    }
    for (var index = 0; index < initJson.length; index++) {
        var item = initJson[index]
        ids += item.questionId;
        if (index < (initJson.length - 1)) {
            ids += ";"
        }
    }
    url = getQuestionApiEndPoint(STACKOVERFLOW_IN_ENGLISH, false, false, "votes", "desc").replace(/\{id\}/g, ids);
    loadHelper(url, function(data) {
        for (var index = 0; index < data.items.length; index++) {
            var item = data.items[index];
            data.items[index].viewCount = getViewCount(data.items[index].question_id);
        }
        data.items.sort(function (objA, objB){
            return  objB.viewCount - objA.viewCount;
        });
        for (var index = 0; index < data.items.length; index++) {
            var item = data.items[index];
            var question = createQuestion(item);
            $(questionListRoot).append(question);
        }
    }, function() {});
})

function setupSuggestion() {
    $(suggestQuestionInputTag).keypress(function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            $(suggestQuestionButtonTag).click();
            return false;
        } else {
            return true;
        }
    });
    $(suggestQuestionButtonTag).click(function(event){
        event.preventDefault();
        var question = $(suggestQuestionInputTag).val();
        var id = questionId(question);
        var l = getLocation(question);
        if (l.hostname != STACKOVERFLOW_IN_ENGLISH_HOSTNAME || id < 0) {
            alert("Wrong url");
            return;
        }
        var url = suggestEndpoint + "?question_url=" + encodeURIComponent(question)
        loadHelper(url, function(data){
            if (data.status) {
                alert("Question was suggested");
                location.reload();
            } else {
                alert("We cannot add the suggestion");
            }
        }, function(){
            alert("Something went wrong");
        });
    })
}

function createQuestion(item) {
    var tmp = questionTemplate();
    var template = $(tmp);
    $(template).find(".stats_container").attr("onclick", "window.location.href='" + getAAPPlink(item.question_id) + "'");
    var theScore = item.score;
    var mul = ""
    if (item.score > 1000)  {
        theScore = Math.round(item.score / 1000);
        mul = "K"
    }
    $(template).find(".votes .count").text(theScore + mul);
    $(template).find(".votes .label").text(plural( mul != "" ? 5 : theScore, localeManager.scoreStrings));
    if (item.is_answered)
        $(template).find(".status").addClass(" answered");    
    $(template).find(".status .count").text(item.answer_count);
    $(template).find(".status .label").text(plural(parseInt(item.answer_count), localeManager.answerStrings));

    $(template).find(".views .count").text(item.viewCount);
    $(template).find(".views .label").text(plural(item.viewCount, localeManager.viewStrings));

    $(template).find(".desc h3 a").text(stripHtml(item.title));
    $(template).find(".desc h3 a").attr("href", getAAPPlink(item.question_id));

    var tags = createTagsDiv(item.tags);

    $(template).find(".tag_holder").append(tags);

    var active = new Date(parseInt(1000 * item.creation_date));
    $(template).find(".owner span").text(localeManager.asked + getDate(active) + " ");
    $(template).find(".owner a").attr("href", item.owner.link);
    $(template).find(".owner a").text(item.owner.display_name);

    return template;
}

function getViewCount(questionId) {
    for (var index = 0; index < initJson.length; index++) {
        item = initJson[index];
        if (item.questionId == questionId) {
            return item.viewCount;
        }
    }
    return -1;
}

function questionTemplate() {
    return `
        <div class="question">
            <div class="stats_container" onclick="">
                <div class="votes">
                    <div class="count"></div>
                    <div class="label"></div>
                </div>
                <div class="status">
                    <div class="count"></div>
                    <div class="label"></div>
                </div>
                <div class="views">
                    <div class="count"></div>
                    <div class="label"></div>
                </div>
            </div>
            <div class="desc">
                <h3>
                    <a href=""></a>
                </h3>
                <div class="tag_holder">
                </div>
                <div class="owner">
                    <span></span>
                    <a href=""></a>
                </div>
            </div>
        </div>`
    }