var soQuestionApiEndpoint = "https://api.stackexchange.com/2.2/questions/{id}?order=desc&sort=activity&site=stackoverflow&filter=!4(sMpjPlU2B9NnTI_";
var candidateQuestionApiEndpoint = "https://api.stackexchange.com/2.2/questions/{id}?order=desc&sort=activity&site=ru.stackoverflow&filter=!4(sMpjPlU2B9NnTI_";
var addAssociationAndpoint = "/api/add_association"
var questionIdTag = "#question-id";
var searchButtonTag = "#search-button";
var searchInputTag = "#search-input";
var searchResultTag = "#search-results";
var soQuestionId = -1;
var question = null;

$(document).ready(function() {
    soQuestionId = parseInt($(questionIdTag).text());
    init(function(isSucceeded) {
        if (!isSucceeded)
            return;
        updatePage();
    });
})

function init(onInitCompleted) {
    url = soQuestionApiEndpoint.replace(/\{id\}/g, soQuestionId);
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

function createCandidateIdsString(items) {
    var ids = "";
    var addedIds = new Array();

    for (index = 0; index < items.length; index++) {
        var skipp = false;
        var item = items[index];
        var id = questionId(item.link);

        if (id < 0)
            continue;

        for (subIndex = 0; subIndex < addedIds.length; subIndex++) {
            if (addedIds[subIndex] == id) {
                skipp = true;
                break;
            }
        }

        if (skipp)
            continue;

        ids += id + ";";
        addedIds.push(id);
    }

    return ids.replace(/;+$/, "");
}

function createCandidatesForAssociationList(items) {
    var ids = createCandidateIdsString(items);
    url = candidateQuestionApiEndpoint.replace(/\{id\}/g, ids);
    loadHelper(url, function(data) {
            function withContext(soen_id, soint_id) {

                $(".soint-" + soint_id + " .candidate-associate").click(function(event) {
                    event.preventDefault();
                    alert("SOen: " + soen_id + ", SOint: " + soint_id)
                    addAssUrl = addAssociationAndpoint + "?soen_id=" + soen_id + "&soint_id=" + soint_id
                    loadHelper(addAssUrl, function(data) {
                        if (data.comment_id != undefined) {
                            alert("Association has been added with id: " + data.comment_id)
                            window.location = "/";
                            return;
                        }

                    })
                });
            }
            for (index = 0; index < data.items.length; index++) {
                var item = data.items[index];

                var tmp = candidateForAssociationTemplate();
                var template = $(tmp);

                $(template).find(".association-candidate .question-id").text(item.question_id);
                $(template).find(".association-candidate .candidate-title a").text(stripHtml(item.title));
                $(template).find(".association-candidate .candidate-body").html(item.body);
                $(template).find(".association-candidate").addClass("soint-" + item.question_id)
                var tags = createTagsDiv(item.tags);
                $(template).find(".candidate-taglist").append(tags);

                $(searchResultTag).append(template.html());
                withContext(soQuestionId, item.question_id)
            }
            updatePrettify();

            $(".association-candidate .candidate-title a").click(function(event) {
                event.preventDefault();
            });
        },
        function() {

        });
}

function candidateForAssociationTemplate() {
    return '<div><div class="association-candidate"><div class="candidate-title"><a href="#"><span class="question-id" style="display:none"></a></div><div class="candidate-body post-text"></div><div class="candidate-bar"><div class="candidate-taglist"></div><div class="candidate-stats"></div></div><div class="candidate-menu"><a class="candidate-associate">ассоциировать</a></div></div></div>'
}