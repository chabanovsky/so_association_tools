var questionApiEndpoint = "https://api.stackexchange.com/2.2/questions/{id}?order=desc&sort=activity&site=stackoverflow&filter=!4(sMpjPlU2B9NnTI_"
var questionIdTag = "#question-id"
var questionId = -1;
var question = null;

$(document).ready(function() {
    questionId = parseInt($(questionIdTag).text());
    init(function(isSucceeded) {
        if (!isSucceeded)
            return;
        updatePage();
    });
})

function init(onInitCompleted) {
    url = questionApiEndpoint.replace(/\{id\}/g, questionId);
    loadHelper(url, function(data) {
        question = data.items[0];
        onInitCompleted(true);
    }, function() {
        onInitCompleted(false);
    })
}

function updatePage() {
    $("#question-header h1").text(stripHtml(question.title));
    $("#question-body").html(question.body);
    var tags = createTagsDiv(question.tags);
    $("#question-taglist").append(tags);

    updatePrettify();
}

function updatePrettify() {
    [].forEach.call(document.getElementsByTagName("pre"), function(el) {
        el.classList.add("prettyprint");
    });
    prettyPrint();
}