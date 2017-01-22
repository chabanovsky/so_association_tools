var questionApiEndpoint = "https://api.stackexchange.com/2.2/questions/{id}?order=desc&sort=activity&site=stackoverflow&filter=!4(sMpjPlU2B9NnTI_";
var questionIdTag = "#question-id";
var searchButtonTag = "#search-button";
var searchInputTag = "#search-input";
var searchResultTag = "#search-results";
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
    $(searchButtonTag).click(function(event) {
        event.preventDefault();
        $(searchResultTag).empty();
        var theQuery = $(searchInputTag).val();
        queryGoogle(theQuery, function(result) {
            if (result == null || result == undefined) {
                // TODO: Errors handling
                return;
            }
            createCandidatesForAssociationList(result.items);
        });
    });
}

function updatePage() {
    $("#question-header h1").text(stripHtml(question.title));
    $("#question-body").html(question.body);
    var tags = createTagsDiv(question.tags);
    $("#question-taglist").append(tags);

    updatePrettify();
    updateSearchInput();
}

function updatePrettify() {
    [].forEach.call(document.getElementsByTagName("pre"), function(el) {
        el.classList.add("prettyprint");
    });
    prettyPrint();
}

function updateSearchInput() {
    $(searchInputTag).val(stripHtml(question.title));
}

function createCandidatesForAssociationList(items) {
    for (index = 0; index < items.length; index++) {
        var item = items[index];
        var tmp = candidateForAssociationTemplate();
        var template = $(tmp);
        $(template).find(".association-candidate a").attr("href", item.link);
        $(template).find(".association-candidate a").text(item.title);
        $(searchResultTag).append(template.html());
    }
}

function candidateForAssociationTemplate() {
    return '<div><div class="association-candidate"><a></a></div></div>'
}