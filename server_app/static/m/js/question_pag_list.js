var questionListRoot = "#question_list"
var askedString = "задан ";

$(document).ready(function() {
    var ids = "";
    for (index = 0; index < initJson.length; index++) {
        var item = initJson[index]
        ids += item.questionId;
        if (index < (initJson.length - 1)) {
            ids += ";"
        }
    }
    url = getQuestionApiEndPoint(STACKOVERFLOW_IN_ENGLISH, false, false, "votes", "desc").replace(/\{id\}/g, ids);
    loadHelper(url, function(data) {
        for (index = 0; index < data.items.length; index++) {
            var item = data.items[index];
            var question = createQuestion(item);
            $(question_list).append(question);
        }
    }, function() {})
})

function createQuestion(item) {
    var tmp = questionTemplate();
    var template = $(tmp);
    $(template).find(".stats_container").attr("onclick", "window.location.href='" + getAAPPlink(item.question_id) + "'");
    $(template).find(".votes .count").text(item.score);
    $(template).find(".votes .label").text(plural(parseInt(item.score), score_strings));
    if (item.is_answered)
        $(template).find(".status").addClass(" answered");    
    $(template).find(".status .count").text(item.answer_count);
    $(template).find(".status .label").text(plural(parseInt(item.answer_count), answer_strings));

    var shortViewsCount = Math.round(item.view_count / 1000);
    $(template).find(".views .count").text(shortViewsCount + "K");
    $(template).find(".views .label").text(plural(5, view_strings));

    $(template).find(".desc h3 a").text(stripHtml(item.title));
    $(template).find(".desc h3 a").attr("href", getAAPPlink(item.question_id));

    var tags = createTagsDiv(item.tags);

    $(template).find(".tag_holder").append(tags);

    var active = new Date(parseInt(1000 * item.creation_date));
    $(template).find(".owner span").text(askedString + getDate(active) + " ");
    $(template).find(".owner a").attr("href", item.owner.link);
    $(template).find(".owner a").text(item.owner.display_name);

    return template;
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